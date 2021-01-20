import { Sequelize } from "sequelize";
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
import { LOGGER } from "./logging/winston.logger";
import { getDHIS2OUCode } from "./facilities/helpers";
import { getProductDHIS2Code } from "./products/helpers";
import { createCache } from "./products/product-cache";
import { createFacilitiesCache } from "./facilities/facilities.cache";

export async function createMappedPayload(
  sequelize: Sequelize,
  payload: PostPayload,
  migrationId: number,
  message: QueueMessage
): Promise<ValidationResult> {
  const FACILITIES_CACHE = await createFacilitiesCache(message.clientId);
  const PRODUCT_CACHE = await createCache();
  const MAX_PACKET_SIZE = 1000;

  const { facilities } = payload;
  const fileName = `validation-failed-${Date.now()}.adx`;
  const validationFailures: ValidationFailure[] = [];
  const mappedPayloads: MigrationDataElement[] = [];
  let validationError = false;

  const pushToValidationFailures = async (reason: string) => {
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

    const facilityData = FACILITIES_CACHE[facility["facility-code"]];

    if (facilityData && getDHIS2OUCode(facilityData)) {
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
    const productData = PRODUCT_CACHE[product["product-code"]];

    if (productData && getProductDHIS2Code(productData)) {
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

  for (const facility of facilities) {
    await validatePayload(facility);
  }

  if (validationFailures.length > 0) {
    while (validationFailures.length) {
      await persistValidationFailures(sequelize, validationFailures.splice(0, MAX_PACKET_SIZE));
    }
  }

  return { migrationDataElements: mappedPayloads, validationError };
}
