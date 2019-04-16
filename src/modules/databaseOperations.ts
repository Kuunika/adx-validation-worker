import { Sequelize } from "sequelize";
import { createMigrationModel, createClientModel } from '../models';
import * as moment from 'moment';

//model helpers
export async function recordStartMigration(sequelize: Sequelize, clientId: number) {
  const migrationModel = await createMigrationModel(sequelize);
  return migrationModel.create({
    clientId
  }).catch((error: Error) => console.log(error.message));
}

export async function getClientId(sequelize: Sequelize, clientName: string): Promise<number> {
  const clientModel = await createClientModel(sequelize);
  return await clientModel.findOne({
    where: { name: clientName }
  }).then((client: any) => client.get('id')).catch((error: Error) => console.log(error.message))
}

export async function recordStructureValidationStatus(sequelize: Sequelize, migrationId: number, passed: boolean) {
  const field: string = passed ? 'structureValidatedAt' : 'structureFailedValidationAt';
  const MigrationModel = await createMigrationModel(sequelize)
  await MigrationModel.update(
    { [field]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') },
    { returning: true, where: { id: migrationId } }
  );
}