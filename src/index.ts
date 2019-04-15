import * as  amqp from 'amqplib/callback_api';
import { Channel, Connection, Message } from 'amqplib/callback_api';
import { config } from 'dotenv'; config(); //initialize right there the configuration
import { QueueMessage } from './interfaces';
import { connectToDatabase } from './datasource';
import { Logger } from './utils';
import queueConsumer from './consumer';

amqp.connect(process.env.AVW_QUEUE_HOST || 'amqp://localhost', function (error: Error, connection: Connection) {
  connection.createChannel(function (error: Error, channel: Channel) {
    let queueName = process.env.AVW_QUEUE_NAME || "DHIS2_VALIDATION_QUEUE";
    channel.assertQueue(queueName, { durable: true });
    console.log("[*] Waiting for messages on %s. To exit press CTRL+C", queueName);
    channel.consume(queueName, async function (message: Message | null) {
      if (message) {
        const queueMessage: QueueMessage = JSON.parse(message.content.toString());
        const logger = new Logger(queueMessage.channelId);
        const sequelize = await connectToDatabase(
          process.env.AVW_DATABASE_HOST || '',
          process.env.AVW_DATABASE || '',
          process.env.AVW_DATABASE_USERNAME || '',
          process.env.AVW_DATABASE_PASSWORD || ''
        );

        //Actual implementation
        queueConsumer(sequelize, logger, queueMessage);
      }
    }, { noAck: false });
  });
});