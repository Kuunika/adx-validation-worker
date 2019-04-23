import {
  createMigrationModel,
  createClientModel,
  createFacilityModel,
  createProductModel,
  createMigrationDataElementModel
} from '../../../src/models';
import { Sequelize } from 'sequelize';
export async function createMigration(sequelize: Sequelize) {
  try {
    const migrationModel = await createMigrationModel(sequelize);
    const data = {
      totalMigratedElements: 1,
      totalDataElements: 1,
      totalFailedElements: 0,
      clientId: 10
    };
    const migration = await migrationModel.create(data);
    return migration.get('id');
  } catch (e) {
    console.log(e.message)
    return null;
  }
}
export async function createClient(sequelize: Sequelize) {
  try {
    const clientModel = await createClientModel(sequelize);
    const data = {
      name: 'test',
      email: 'test@gmail.com'
    };
    const client = await clientModel.create(data);
    return client.get('id');
  } catch (e) {
    console.log(e.message)
    return null;
  }
}
export async function createFacility(sequelize: Sequelize) {
  try {
    const facilityModel = await createFacilityModel(sequelize);
    const data = {
      facilityCode: 'facility-code',
      DHIS2OrganizationalUnitCode: 'xhdgdndhDbgsb',
      openLMISFacilityCode: 'open-lmis-fac-code'
    };
    const facility = await facilityModel.create(data);
    return facility.get('id');
  } catch (e) {
    console.log(e.message)
    return null;
  }
}

export async function createProduct(sequelize: Sequelize) {
  try {
    const productModel = await createProductModel(sequelize);
    const data = {
      productCode: 'product-code',
      dataElementCode: 'dTaEVhdn',
      openLMISCode: 'open-lmis-product-code'
    };
    const product = await productModel.create(data);
    return product.get('id');
  } catch (e) {
    console.log(e.message)
    return null;
  }
}
export async function clearElements(sequelize: Sequelize) {
  const migrationModel = await createMigrationModel(sequelize)
  const clientModel = await createClientModel(sequelize);
  const productModel = await createProductModel(sequelize);
  const facilityModel = await createFacilityModel(sequelize);
  const migrationDataElementModel = await createMigrationDataElementModel(sequelize);
  const clearModels = async (models: any[]) => {
    for (const model of models) model.destroy({ truncate: true })
  }
  clearModels([migrationModel, clientModel, productModel, facilityModel, migrationDataElementModel]);
}

export async function getMigration(sequelize: Sequelize) {
  const migrationModel = await createMigrationModel(sequelize)
  return migrationModel.findOne({ where: {} });
}