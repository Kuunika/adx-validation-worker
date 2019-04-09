import * as  amqp from 'amqplib/callback_api';
import { Channel, Connection, Message } from 'amqplib/callback_api';
import { config } from 'dotenv'; config(); //initialize right there the configuration
import { readFileSync } from 'fs';
import { QueueMessage } from './types';
import { PayloadSchema } from './schemas';
import * as Joi from 'joi';

amqp.connect('amqp://localhost', function (error: Error, connection: Connection) {
  connection.createChannel(function (error: Error, channel: Channel) {
    var queueName = process.env.AVW_QUEUE_NAME || "DHIS2_VALIDATION_QUEUE";
    channel.assertQueue(queueName, { durable: true });
    console.log("[*] Waiting for messages on %s. To exit press CTRL+C", queueName);
    channel.consume(queueName, async function (message: Message | null) {
      if (message) {
        const queueMessage: QueueMessage = JSON.parse(message.content.toString());
        const payloadFile = `${process.env.AVW_PAYLOADS_ROOT_DIR}/${queueMessage.channelId}.adx`;
        const payload = JSON.parse(readFileSync(payloadFile).toString());
        const { error } = Joi.validate(payload, PayloadSchema);
        if (error) {
          console.log(error);
          //TODO: Might wanna send an email at this point
        }
      }
    }, { noAck: false });
  });
});