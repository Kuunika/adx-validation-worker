import { Sequelize } from "sequelize";
const sequelize = require("sequelize");

const tableName = 'Facilities';

const fields = {
  facilityCode: sequelize.STRING,
  DHIS2OrganizationalUnitCode: sequelize.STRING,
  openLMISFacilityCode: sequelize.STRING,
  dhamisFacilityCode: sequelize.STRING,
  createdAt: sequelize.DATE,
  updatedAt: sequelize.DATE,
};

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false
};

export const createFacilityModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);
