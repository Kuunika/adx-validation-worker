import { Sequelize, Model } from "sequelize";
const sequelize = require("sequelize");

const tableName = 'migration';

const fields = {
  uploadedAt: sequelize.STRING,
  structureValidatedAt: sequelize.STRING,
  structureFailedValidationAt: sequelize.STRING,
  elementsAuthorizationAt: sequelize.STRING,
  elementsFailedAuthorizationAt: sequelize.STRING,
  valuesValidatedAt: sequelize.STRING,
  valuesFailedValidationAt: sequelize.STRING,
  reportDispatchedAt: sequelize.STRING,
  totalMigratedElements: sequelize.BIGINT(11),
  totalDataElements: sequelize.BIGINT(11),
  totalFailedElements: sequelize.BIGINT(11),
  migrationCompletedAt: sequelize.STRING,
  clientId: sequelize.BIGINT(11)
};

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false
};

export const createMigrationModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);