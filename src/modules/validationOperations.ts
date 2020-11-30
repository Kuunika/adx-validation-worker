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
import { getDHIS2OUCode } from "./facilities/helpers";
import { getProductDHIS2Code } from "./products/helpers";
import { StdLogger } from "./logging/std.logger";

const productMasterClient = new ProductMasterClient();
const mhfrClient = new MasterHealthFacilityClient();
const logger = new StdLogger('Validation Operations');

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
    logger.debug(`Looking up facility ${facility['facility-code']}.`);

    const facilityData = await mhfrClient.findFacilityByCode(facility['facility-code']);

    if (facilityData && getDHIS2OUCode(facilityData)) {
      logger.debug(`Found facility ${facility['facility-code']}.`);
      const organizationUnitCode = getDHIS2OUCode(facilityData);
      const facilityId = facilityData.facility_code;
      for (const facilityValue of facility.values) {
        logger.debug(`Looking up product ${facilityValue['product-code']}`);
        const productData = await productMasterClient.findProductByCode(facilityValue['product-code'], message.clientId);
        if (productData && getProductDHIS2Code(productData)) {
          logger.debug(`Found product ${facilityValue['product-code']}`);
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
          logger.error(`Could not find product ${facilityValue['product-code']}'s data element code.`);
          await pushToValidationFailures(`Failed to find dataElement for ${facilityValue["product-code"]}`);
          validationError = true;
        }
      }
    } else {
      logger.error(`Could not find facility ${facility['facility-code']}'s organisation unit code.`);
      await pushToValidationFailures(`Failed to find organizationUnitCode for ${facility["facility-code"]}`);
      validationError = true;
    }
  }
  if (validationFailures.length > 0) {
    await persistValidationFailures(sequelize, validationFailures);
  }
  return { migrationDataElements: mappedPayloads, validationError };
}
