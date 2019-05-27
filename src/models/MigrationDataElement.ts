import {
  Sequelize
} from 'sequelize';
const sequelize = require("sequelize");

const tableName = 'migrationdataelements';

const fields = {
  organizationUnitCode: sequelize.STRING,
  dataElementCode: sequelize.STRING,
  migrationId: sequelize.BIGINT(11),
  productId: sequelize.BIGINT(11),
  facilityId: sequelize.BIGINT(11),
  value: sequelize.BIGINT(11),
  isProcessed: sequelize.BOOLEAN,
  migratedAt: sequelize.STRING,
  reportingPeriod: sequelize.STRING,
};

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

export const createMigrationDataElementModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);