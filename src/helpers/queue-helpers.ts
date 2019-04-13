const Tortoise = require('tortoise');

//{ migrationId, flag, source, channelId, clientId, description }
export function sendToEmailQueue(
  migrationId: number,
  flag: boolean,
  source: string,
  channelId: string,
  clientId: number,
  description: string
) {
  const tortoise = new Tortoise(process.env.AVW_EMAIL_QUEUE_HOST || 'amqp://localhost');
  tortoise
    .queue(process.env.AVW_EMAIL_QUEUE_NAME, { durable: false })
    .publish({ migrationId, flag, source, channelId, clientId, description });
}