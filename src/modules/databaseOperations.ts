import { Sequelize } from "sequelize";
import {
  createMigrationModel,
  createClientModel,
  createFacilityModel,
  createProductModel,
  createMigrationDataElementModel,
  createValidationFailureModel
} from '../models';
import { FacilityData, ProductData, MigrationDataElement, ValidationFailure } from '../interfaces';
import * as moment from 'moment';

//model helpers
export async function recordStartMigration(sequelize: Sequelize, clientId: number) {
  const migrationModel = await createMigrationModel(sequelize);

  return await migrationModel.create({ clientId }).catch((error: Error) => {
    console.log(error.message);
  });
}

export async function getClientId(sequelize: Sequelize, clientName: string): Promise<number | undefined> {
  const clientModel = await createClientModel(sequelize);
  return clientModel.findOne({
    where: { name: clientName }
  }).then((client: any) => client.get('id')).catch((error: Error) => console.log(error.message));
}

export async function recordStructureValidationStatus(sequelize: Sequelize, migrationId: number, passed: boolean) {
  const field: string = passed ? 'structureValidatedAt' : 'structureFailedValidationAt';
  const MigrationModel = await createMigrationModel(sequelize);
  await MigrationModel.update(
    { [field]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') },
    { returning: true, where: { id: migrationId } }
  );
}

export async function recordValidationStatus(sequelize: Sequelize, migrationId: number, passed: boolean) {
  const field: string = passed ? 'valuesValidatedAt' : 'valuesFailedValidationAt';
  const MigrationModel = await createMigrationModel(sequelize);
  await MigrationModel.update(
    { [field]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') },
    { returning: true, where: { id: migrationId } }
  );
}

export async function getFacilityData(
  sequelize: Sequelize,
  facilityCode: string,
  clientName: string
): Promise<FacilityData | undefined> {
  let where = {};
  switch (clientName) {
    case 'openlmis':
      where = { openLMISFacilityCode: facilityCode }
      break;
    default:
      where = { facilityCode }
  }
  const facilityModel = await createFacilityModel(sequelize);
  return facilityModel.findOne({
    where
  }).then((facility: any) => ({
    organizationUnitCode: facility.get('DHIS2OrganizationalUnitCode'),
    facilityId: facility.get('id')
  })).catch((error: Error) => console.log(`Org ${error.message}`));
}

export async function getProductData(sequelize: Sequelize, productCode: string, clientName: string): Promise<ProductData | undefined> {
  //OpenLMIS or the rest of the World
  let where = {};
  switch (clientName) {
    case 'openlmis':
      where = { openLMISCode: productCode }
      break;
    default:
      where = { productCode }
  }
  const productModel = await createProductModel(sequelize);
  return productModel.findOne({
    where
  })
    .then((product: any) => ({ dataElementCode: product.get('dataElementCode'), productId: product.get('id') }))
    .catch((error: Error) => console.log(error.message));
}

export async function persistMigrationDataElements(
  sequelize: Sequelize, migrationDataElements: MigrationDataElement[]
): Promise<MigrationDataElement[] | undefined> {
  const migrationDataElementsModel = await createMigrationDataElementModel(sequelize);
  return migrationDataElementsModel.bulkCreate(migrationDataElements).catch((error: Error) => console.log(error.message));
}

export async function updateMigration(sequelize: Sequelize, migrationId: number, field: string, value: any) {
  //moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
  const MigrationModel = await createMigrationModel(sequelize);
  await MigrationModel.update(
    { [field]: value },
    { returning: true, where: { id: migrationId } }
  );
}

export async function persistValidationFailures(sequelize: Sequelize, validationFailures: ValidationFailure[]): Promise<Array<ValidationFailure | undefined>> {
  const validationFailureModel = await createValidationFailureModel(sequelize);
  return validationFailureModel.bulkCreate(validationFailures).catch((error: Error) => console.log(error.message));
}
