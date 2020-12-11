import { Sequelize } from "sequelize";
import { appendFileSync } from "fs";
import {
  PostPayload,
  MigrationDataElement,
  ValidationFailure,
  ValidationResult,
  QueueMessage
} from "../interfaces";
import { persistValidationFailures } from ".";
import { sendToLogQueue } from "./queueOperations";
import { ProductMasterClient } from "./products/product-master.client";
import { MasterHealthFacilityClient } from "./facilities/master-health-facility.client";
import { LOGGER } from './logging/winston.logger';
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
    LOGGER.info(`Looking up facility ${facility['facility-code']}.`);

    const facilityData = await mhfrClient.findFacilityByCode(facility['facility-code'], message.clientId);

    if (facilityData && getDHIS2OUCode(facilityData)) {
      LOGGER.info(`Found facility ${facility['facility-code']}.`);
      const organizationUnitCode = getDHIS2OUCode(facilityData);
      const facilityId = facilityData.facility_code;
      for (const facilityValue of facility.values) {
        LOGGER.info(`Looking up product ${facilityValue['product-code']}`);
        const productData = await productMasterClient.findProductByCode(facilityValue['product-code'], message.clientId);
        if (productData && getProductDHIS2Code(productData)) {
          LOGGER.info(`Found product ${facilityValue['product-code']}`);
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
          LOGGER.error(`Could not find product ${facilityValue['product-code']}'s data element code.`);
          await pushToValidationFailures(`Failed to find dataElement for ${facilityValue["product-code"]}`);
          validationError = true;
        }
      }
    } else {
      LOGGER.error(`Could not find facility ${facility['facility-code']}'s organisation unit code.`);
      await pushToValidationFailures(`Failed to find organizationUnitCode for ${facility["facility-code"]}`);
      validationError = true;
    }
  }
  if (validationFailures.length > 0) {
    await persistValidationFailures(sequelize, validationFailures);
  }
  return { migrationDataElements: mappedPayloads, validationError };
}
