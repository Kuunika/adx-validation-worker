import { Sequelize } from "sequelize";
const sequelize = require("sequelize");

const tableName = 'Products';

const fields = {
  productCode: sequelize.STRING,
  dataElementCode: sequelize.STRING,
  openLMISCode: sequelize.STRING,
  createdAt: sequelize.DATE,
  updatedAt: sequelize.DATE,
};

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false
};

export const createProductModel = async (
  sequelize: Sequelize
  // tslint:disable-next-line: no-any
): Promise<any> => await sequelize.define(tableName, fields, options);
