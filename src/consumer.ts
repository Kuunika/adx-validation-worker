import { Sequelize } from 'sequelize';
import { Logger } from './utils';
import { QueueMessage, PostPayload } from './interfaces';
import {
  getClientId,
  recordStartMigration,
  recordStructureValidationStatus,
  recordValidationStatus,
  createMappedPayload,
  persistMigrationDataElements,
  sendToEmailQueue,
  sendToMigrationQueue
} from './modules';
import { PayloadSchema } from './schemas';
import * as Joi from 'joi';
import { readFileSync } from 'fs';
const utils = require('utils')._;

export default async function (sequelize: Sequelize, logger: Logger, queueMessage: QueueMessage) {
  const clientId = await getClientId(sequelize, queueMessage.clientId);

  if (!clientId) {
    logger.info('Failed to find client in the validation worker, exiting')
    return
  }

  const migration = await recordStartMigration(sequelize, clientId);
  if (!migration) {
    logger.info('Failed to find migration, exiting')
    return
  }

  const payloadFile = `${process.env.AVW_PAYLOADS_ROOT_DIR}/${queueMessage.channelId}.adx`;
  const payloadFileContent = utils.tryRead(payloadFile);
  if (!payloadFileContent) {
    logger.info('failed to read the contents of the payload file specified');
    return;
  }
  const payload = JSON.parse(payloadFileContent);

  const { error } = Joi.validate(payload, PayloadSchema);

  if (error) {
    await recordStructureValidationStatus(sequelize, migration.get('id'), false);
    logger.info('Payload failed structure validation, sending email');
    sendToEmailQueue(
      migration.id,
      true,
      'validation',
      queueMessage.channelId,
      clientId,
      payload.description
    );
    return;
  }
  await recordStructureValidationStatus(sequelize, migration.get('id'), true);
  logger.info('Payload passed structure validation validation');
  const migrationDataElements = await createMappedPayload(sequelize, payload, migration.id);
  const dataElementsToMigrate = await persistMigrationDataElements(sequelize, migrationDataElements);
  if (!dataElementsToMigrate) {
    return
  }
  logger.info(`${dataElementsToMigrate.length} ready for migrating`);
  recordValidationStatus(sequelize, migration.get('id'), true);
  sendToMigrationQueue(migration.id, queueMessage.channelId, clientId, payload.description);
}