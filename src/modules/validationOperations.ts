import {
  PostPayload,
  MigrationDataElement,
  ValidationFailure
} from '../interfaces';
import { getProductData, getFacilityData, persistValidationFailures } from '.';
import { Sequelize } from 'sequelize';
import { appendFileSync } from 'fs';

export async function createMappedPayload(sequelize: Sequelize, payload: PostPayload, migrationId: number, clientName: string): Promise<MigrationDataElement[]> {
  const { facilities } = payload;
  const fileName = `validation-failed-${Date.now()}.adx`;
  const validationFailures: ValidationFailure[] = [];

  const pushToValidationFailures = async function (reason: string) {
    await appendFileSync(`data/${fileName}`, reason);
    validationFailures.push({
      fileName,
      migrationId,
      reason
    });
  };

  const mappedPayloads: MigrationDataElement[] = [];
  for (const facility of facilities) {
    const facilityData = await getFacilityData(sequelize, facility["facility-code"]);
    if (facilityData) {
      const { organizationUnitCode, facilityId } = facilityData;
      for (const facilityValue of facility.values) {
        const productData = await getProductData(sequelize, facilityValue["product-code"], clientName);
        if (productData) {
          const { dataElementCode, productId } = productData;
          const mappedPayload = {
            dataElementCode,
            organizationUnitCode,
            value: facilityValue.value,
            migrationId,
            productId,
            facilityId,
            isProcessed: false,
            reportingPeriod: payload["reporting-period"],
          };
          mappedPayloads.push(mappedPayload);
        } else {
          pushToValidationFailures(`Failed to find dataElement for ${facilityValue["product-code"]}`);
        }
      }
    } else {
      pushToValidationFailures(`Failed to find organizationUnitCode for ${facility["facility-code"]}`);
    }
  }
  if (validationFailures.length > 0) {
    await persistValidationFailures(sequelize, validationFailures);
  }
  return mappedPayloads;
}
