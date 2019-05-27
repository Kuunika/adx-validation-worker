import { Sequelize, Model } from "sequelize";
const sequelize = require("sequelize");

const tableName = 'client';

const fields = {
  name: sequelize.STRING,
};

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false
};

export const createClientModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);