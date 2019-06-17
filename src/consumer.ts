import { Sequelize } from 'sequelize';
import { Logger } from './utils';
import { QueueMessage } from './interfaces';

import {
  getClientId,
  recordStartMigration,
  recordStructureValidationStatus,
  recordValidationStatus,
  createMappedPayload,
  persistMigrationDataElements,
  sendToEmailQueue,
  sendToMigrationQueue,
  sendToLogQueue,
  updateMigration
} from './modules';

import { PayloadSchema } from './schemas';
import * as Joi from 'joi';
const utils = require('utils')._;

export default async function (
  sequelize: Sequelize,
  logger: Logger,
  queueMessage: QueueMessage
) {
  const service = 'validation';
  const queueMessageWithClient = {
    ...queueMessage,
    client: queueMessage.clientId
  }
  const clientId = await getClientId(sequelize, queueMessage.clientId);

  if (!clientId) {
    console.log('Failed to find client in the validation worker, exiting')
    return
  }

  const migration = await recordStartMigration(sequelize, clientId);
  const migrationId = migration.get('id');
  if (!migration) {
    console.log('Failed to find migration, exiting')
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
    await sendToLogQueue({
      ...queueMessageWithClient,
      service,
      description: 'Payload failed structure validation'
    });
    await sendToEmailQueue(
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
  await sendToLogQueue({
    ...queueMessageWithClient,
    service,
    description: 'Payload passed structure validation, validating content...'
  })
  const migrationDataElements = await createMappedPayload(sequelize, payload, migration.id, queueMessage.clientId);
  await updateMigration(sequelize, migrationId, 'totalDataElements', migrationDataElements.length);
  await updateMigration(sequelize, migrationId, 'uploadedAt', Date.now());
  const dataElementsToMigrate = await persistMigrationDataElements(sequelize, migrationDataElements);
  if (!dataElementsToMigrate) {
    return
  }
  await sendToLogQueue({
    ...queueMessageWithClient,
    service,
    description: `${dataElementsToMigrate.length} ready for migrating`
  })
  recordValidationStatus(sequelize, migration.get('id'), true);
  sendToMigrationQueue(migration.id, queueMessage.channelId, queueMessage.clientId, payload.description);
}
