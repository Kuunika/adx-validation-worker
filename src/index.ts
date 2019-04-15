import * as  amqp from 'amqplib/callback_api';
import { Channel, Connection, Message } from 'amqplib/callback_api';
import { config } from 'dotenv'; config(); //initialize right there the configuration
import { readFileSync } from 'fs';
import { QueueMessage } from './types';
import { PayloadSchema } from './schemas';
import { connectToDatabase } from './datasource';
import { Logger } from './utils';
import * as Joi from 'joi';
const utils = require('utils')._;
import {
  recordStartMigration,
  getClientId,
  recordStructureValidationStatus,
}
  from './modules';

amqp.connect(process.env.AVW_QUEUE_HOST || 'amqp://localhost', function (error: Error, connection: Connection) {
  connection.createChannel(function (error: Error, channel: Channel) {
    var queueName = process.env.AVW_QUEUE_NAME || "DHIS2_VALIDATION_QUEUE";
    channel.assertQueue(queueName, { durable: true });
    console.log("[*] Waiting for messages on %s. To exit press CTRL+C", queueName);
    channel.consume(queueName, async function (message: Message | null) {
      if (message) {
        const queueMessage: QueueMessage = JSON.parse(message.content.toString());
        const logger = new Logger(queueMessage.channelId);
        const sequelize = await connectToDatabase(
          process.env.AVW_DATABASE_HOST || 'localhost',
          process.env.AVW_DATABASE || '',
          process.env.AVW_DATABASE_USERNAME || 'username',
          process.env.AVW_DATABASE_PASSWORD || ''
        );
        const clientId = await getClientId(sequelize, queueMessage.clientId);

        const migration = await recordStartMigration(sequelize, clientId);

        const payloadFile = `${process.env.AVW_PAYLOADS_ROOT_DIR}/${queueMessage.channelId}.adx`;
        const payloadFileContent = utils.tryRead(payloadFile);
        if (!payloadFileContent) {
          logger.info('failed to read the contents of the payload file specified');
          return;
        }
        const payload = JSON.parse(payloadFileContent);
        const { error } = Joi.validate(payload, PayloadSchema);

        if (!error) {
          await recordStructureValidationStatus(sequelize, migration.get('id'), true);
          logger.info('Payload passed structure validation');
          //TODO: start off on the other validation - authorization
        } else {
          await recordStructureValidationStatus(sequelize, migration.get('id'), false);
          logger.info('Payload failed structure validation, sending email');
          //TODO: Might wanna send an email at this point
        }
      }
    }, { noAck: false });
  });
});