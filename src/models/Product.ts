import { Sequelize } from "sequelize";
const sequelize = require("sequelize");

const tableName = 'products';

const fields = {
  productCode: sequelize.STRING,
  dataElementCode: sequelize.STRING,
  openLMISCode: sequelize.STRING
};

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false
};

export const createProductModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options); 