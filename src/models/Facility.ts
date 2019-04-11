import { Sequelize } from "sequelize";
const sequelize = require("sequelize");

const tableName = 'facilities'

const fields = {
  facilityCode: sequelize.STRING,
  DHIS2OrganizationalUnitCode: sequelize.STRING,
  openLMISFacilityCode: sequelize.STRING
}

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false
}

export const createProductModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options); 