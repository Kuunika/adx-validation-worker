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
} from './helpers';
import { PayloadSchema } from './schemas';
import * as Joi from 'joi';
import { readFileSync } from 'fs';

export default async function (sequelize: Sequelize, logger: Logger, queueMessage: QueueMessage) {

  const clientId = await getClientId(sequelize, queueMessage.clientId);

  if (clientId) {
    const migration = await recordStartMigration(sequelize, clientId);

    const payloadFile = `${process.env.AVW_PAYLOADS_ROOT_DIR}/${queueMessage.channelId}.adx`;
    const payload: PostPayload = JSON.parse(readFileSync(payloadFile).toString());
    const { error } = Joi.validate(payload, PayloadSchema);

    if (!error) {
      await recordStructureValidationStatus(sequelize, migration.get('id'), true);
      logger.info('Payload passed structure validation validation');
      const migrationDataElements = await createMappedPayload(sequelize, payload, migration.id);
      const s = await persistMigrationDataElements(sequelize, migrationDataElements);
      if (s) {
        logger.info(`${s.length} ready for migrating`);
        recordValidationStatus(sequelize, migration.get('id'), true);
        sendToMigrationQueue(migration.id, queueMessage.channelId, clientId, payload.description);
      }
    } else {
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
    }
  } else {
    logger.info('Failed to find client in the validation worker, exiting');
  }
}