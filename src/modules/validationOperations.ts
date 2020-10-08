import {
  PostPayload,
  MigrationDataElement,
  ValidationFailure,
  ValidationResult,
  QueueMessage
} from "../interfaces";
import { persistValidationFailures } from ".";
import { Sequelize } from "sequelize";
import { appendFileSync, closeSync, fstat, openSync } from "fs";
import { sendToLogQueue } from "./queueOperations";
import { ProductMasterClient } from "./products/product-master.client";
import { MasterHealthFacilityClient } from "./facilities/master-health-facility.client";
import { getDHIS2OUCode } from "./facilities/helpers";
import { getProductDHIS2Code } from "./products/helpers";

const productMasterClient = new ProductMasterClient();
const mhfrClient = new MasterHealthFacilityClient();

export async function createMappedPayload(
  sequelize: Sequelize,
  payload: PostPayload,
  migrationId: number,
  message: QueueMessage
): Promise<ValidationResult> {
  const { facilities } = payload;
  const fileName = `validation-failed-${Date.now()}.adx`;
  const validationFailures: ValidationFailure[] = [];
  let validationError = false;

  const pushToValidationFailures = async (reason: string) => {
    appendFileSync(`logs/${fileName}`, reason);
    validationFailures.push({
      fileName,
      migrationId,
      reason
    });
  };

  const mappedPayloads: MigrationDataElement[] = [];
  for (const facility of facilities) {
    sendToLogQueue({
      channelId: message.channelId,
      client: message.clientId,
      migrationId: message.migrationId,
      message: JSON.stringify({
        message: `Validating for facility ${facility["facility-code"]}`,
        service: "validation"
      })
    });
    const facilityData = await mhfrClient.findFacilityByCode(facility['facility-code']);

    if (facilityData && getDHIS2OUCode(facilityData)) {
      const organizationUnitCode = getDHIS2OUCode(facilityData);
      const facilityId = facilityData.facility_code;
      for (const facilityValue of facility.values) {
        const productData = await productMasterClient.findProductByCode(facilityValue['product-code'], message.clientId);
        if (productData && getProductDHIS2Code(productData))  {
          const dataElementCode = getProductDHIS2Code(productData);
          const mappedPayload = {
            dataElementCode,
            organizationUnitCode,
            value: facilityValue.value,
            migrationId,
            facilityId,
            isProcessed: false,
            reportingPeriod: payload["reporting-period"]
          };
          mappedPayloads.push(mappedPayload);
        } else {
          validationError = true;
          await pushToValidationFailures(
            `Failed to find dataElement for ${facilityValue["product-code"]}`
          );
        }
      }
    } else {
      validationError = true;
      await pushToValidationFailures(
        `Failed to find organizationUnitCode for ${facility["facility-code"]}`
      );
    }
  }
  if (validationFailures.length > 0) {
    await persistValidationFailures(sequelize, validationFailures);
  }
  return { migrationDataElements: mappedPayloads, validationError };
}
