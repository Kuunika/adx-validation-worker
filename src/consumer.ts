import { Sequelize } from "sequelize";
import { Logger } from "./utils";
import { QueueMessage } from "./interfaces";

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
} from "./modules";

import { PayloadSchema } from "./schemas";
import * as Joi from "joi";
const utils = require("utils")._;

import { LOGGER } from './modules/logging/winston.logger';

export default async function(
  sequelize: Sequelize,
  _logger: Logger,
  queueMessage: QueueMessage
): Promise<void> {
  const service = "validation";
  const queueMessageWithClient = {
    ...queueMessage,
    client: queueMessage.clientId
  };
  const clientId = await getClientId(sequelize, queueMessage.clientId);

  if (!clientId) {
    LOGGER.error(`Failed to find client with id ${queueMessage.clientId} in the validation worker.`);
    return;
  }

  const migration = await recordStartMigration(
    sequelize,
    clientId,
    queueMessage.channelId
  );
  const migrationId = migration.get("id");
  if (!migration) {
    LOGGER.error(`Failed to create migration for channel ${queueMessage.channelId}.`);
    return;
  }
  const payloadFile = `${process.env.AVW_PAYLOADS_ROOT_DIR}/${queueMessage.channelId}.adx`;
  const payloadFileContent = utils.tryRead(payloadFile);
  if (!payloadFileContent) {
    LOGGER.error(`Failed to read the contents of the payload file ${payloadFile}.`);
    return;
  }
  const payload = JSON.parse(payloadFileContent);

  const { error } = Joi.validate(payload, PayloadSchema);
  if (error) {
    await recordStructureValidationStatus(
      sequelize,
      migration.get("id"),
      false
    );
    sendToLogQueue({
      ...queueMessageWithClient,
      message: JSON.stringify({
        message: "Payload failed structure validation",
        service
      })
    });
    sendToEmailQueue(
      migration.id,
      true,
      "structure_validation",
      queueMessage.channelId,
      queueMessage.clientId,
      payload.description
    );
    return;
  }
  await recordStructureValidationStatus(sequelize, migration.get("id"), true);
  sendToLogQueue({
    ...queueMessageWithClient,
    message: JSON.stringify({
      message: "Payload passed structure validation, validating content",
      service
    })
  });
  const { migrationDataElements, validationError } = await createMappedPayload(
    sequelize,
    payload,
    migration.id,
    queueMessage
  );
  sendToLogQueue({
    ...queueMessageWithClient,
    message: JSON.stringify({ message: "Finished content validation", service })
  });
  await updateMigration(sequelize, migrationId, "uploadedAt", Date.now());

  const dataElementsToMigrate = await persistMigrationDataElements(
    sequelize,
    migrationDataElements
  );
  if (!dataElementsToMigrate) {
    return;
  }
  const totalDataElements = dataElementsToMigrate.length;
  await updateMigration(
    sequelize,
    migrationId,
    "totalDataElements",
    totalDataElements
  );
  if (validationError) {
    sendToEmailQueue(
      migration.id,
      true,
      "element_validation",
      queueMessage.channelId,
      queueMessage.clientId,
      payload.description
    );
  }

  if (dataElementsToMigrate.length < 1) {
    return;
  }

  sendToLogQueue({
    ...queueMessageWithClient,
    message: JSON.stringify({
      message: `${dataElementsToMigrate.length} ready for migrating`,
      service
    })
  });

  recordValidationStatus(sequelize, migration.get("id"), true);

  sendToMigrationQueue(
    migration.id,
    queueMessage.channelId,
    queueMessage.clientId,
    payload.description
  );

  LOGGER.info(`Migration for ${queueMessage.clientId} under channel ${queueMessage.channelId} validated successfully.`);
}
