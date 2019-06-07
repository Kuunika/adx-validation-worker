import {
  Sequelize
} from 'sequelize';
const sequelize = require("sequelize");

const tableName = 'Validationfailures';

const fields = {
  migrationId: sequelize.BIGINT(11),
  reason: sequelize.STRING,
  fileName: sequelize.STRING,
  createdAt: sequelize.STRING
};

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

export const createValidationFailureModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);