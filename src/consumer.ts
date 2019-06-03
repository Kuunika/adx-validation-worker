import { Sequelize } from 'sequelize';
import { Logger } from './utils';
import { QueueMessage } from './interfaces';
import { sendToLogQueue } from './modules';

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
  if (!migration) {
    console.log('Failed to find migration, exiting')
    return
  }
  console.log(process.env.AVW_LOG_QUEUE_HOST);
  const payloadFile = `${process.env.AVW_PAYLOADS_ROOT_DIR}/${queueMessage.channelId}.adx`;
  console.log(payloadFile)
  const payloadFileContent = utils.tryRead(payloadFile);
  if (!payloadFileContent) {
    logger.info('failed to read the contents of the payload file specified');
    return;
  }
  const payload = JSON.parse(payloadFileContent);

  const { error } = Joi.validate(payload, PayloadSchema);
  if (error) {
    await recordStructureValidationStatus(sequelize, migration.get('id'), false);
    sendToLogQueue({
      ...queueMessageWithClient,
      service,
      description: 'Payload failed structure validation'
    });
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
  sendToLogQueue({
    ...queueMessageWithClient,
    service,
    description: 'Payload passed structure validation, validating content...'
  })
  const migrationDataElements = await createMappedPayload(sequelize, payload, migration.id, queueMessage.clientId);
  const dataElementsToMigrate = await persistMigrationDataElements(sequelize, migrationDataElements);
  if (!dataElementsToMigrate) {
    return
  }
  sendToLogQueue({
    ...queueMessageWithClient,
    service,
    description: `${dataElementsToMigrate.length} ready for migrating`
  })
  console.log(`${dataElementsToMigrate.length} ready for migrating`);
  recordValidationStatus(sequelize, migration.get('id'), true);
  sendToMigrationQueue(migration.id, queueMessage.channelId, queueMessage.clientId, payload.description);
}
