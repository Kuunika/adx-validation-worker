import { Sequelize } from "sequelize";
import { appendFileSync } from "fs";
import {
  PostPayload,
  MigrationDataElement,
  ValidationFailure,
  ValidationResult,
  QueueMessage,
  FacilityPayloadData,
  FacilityPayloadDataValue,
} from "../interfaces";
import { persistValidationFailures } from ".";
import { sendToLogQueue } from "./queueOperations";
import { ProductMasterClient } from "./products/product-master.client";
import { MasterHealthFacilityClient } from "./facilities/master-health-facility.client";
import { LOGGER } from "./logging/winston.logger";
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
  const mappedPayloads: MigrationDataElement[] = [];
  let validationError = false;

  const pushToValidationFailures = async (reason: string) => {
    appendFileSync(`logs/${fileName}`, reason);
    validationFailures.push({
      fileName,
      migrationId,
      reason,
    });
  };

  const validatePayload = async (
    facility: FacilityPayloadData
  ): Promise<void> => {
    sendToLogQueue({
      channelId: message.channelId,
      client: message.clientId,
      migrationId: message.migrationId,
      message: JSON.stringify({
        message: `Validating for facility ${facility["facility-code"]}`,
        service: "validation",
      }),
    });
    LOGGER.info(`Looking up facility ${facility["facility-code"]}.`);

    const facilityData = await mhfrClient.findFacilityByCode(
      facility["facility-code"],
      message.clientId
    );

    if (facilityData && getDHIS2OUCode(facilityData)) {
      LOGGER.info(`Found facility ${facility["facility-code"]}.`);
      const organizationUnitCode = getDHIS2OUCode(facilityData);
      const facilityId = facilityData.facility_code;
      const promises = facility.values.map(p => validateProduct(p, organizationUnitCode, facilityId));
      await Promise.all(promises);
    } else {
      LOGGER.error(
        `Could not find facility ${facility["facility-code"]}'s organisation unit code.`
      );
      await pushToValidationFailures(
        `Failed to find organizationUnitCode for ${facility["facility-code"]}`
      );
      validationError = true;
    }
  };

  const validateProduct = async (
    product: FacilityPayloadDataValue,
    ouCode: string,
    facility: string
  ): Promise<void> => {
    LOGGER.info(`Looking up product ${product["product-code"]}`);
    const productData = await productMasterClient.findProductByCode(
      product["product-code"],
      message.clientId
    );
    if (productData && getProductDHIS2Code(productData)) {
      LOGGER.info(`Found product ${product["product-code"]}`);
      const dataElementCode = getProductDHIS2Code(productData);
      const mappedPayload = {
        dataElementCode,
        organizationUnitCode: ouCode,
        value: product.value,
        migrationId,
        facilityId: facility,
        isProcessed: false,
        reportingPeriod: payload["reporting-period"],
      };
      mappedPayloads.push(mappedPayload);
    } else {
      LOGGER.error(
        `Could not find product ${product["product-code"]}'s data element code.`
      );
      await pushToValidationFailures(
        `Failed to find dataElement for ${product["product-code"]}`
      );
      validationError = true;
    }
  };

  const todo = facilities.map(f => validatePayload(f));
  await Promise.all(todo);

  if (validationFailures.length > 0) {
    await persistValidationFailures(sequelize, validationFailures);
  }

  return { migrationDataElements: mappedPayloads, validationError };
}
