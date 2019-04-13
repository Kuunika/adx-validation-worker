const Tortoise = require('tortoise');

export function sendToEmailQueue() {
  const tortoise = new Tortoise(process.env.AVW_MIGRATION_QUEUE_HOST || 'amqp://localhost');
  tortoise
    .queue(process.env.AVW_MIGRATION_QUEUE_NAME, { durable: false })
    .publish({ Hello: 'World' });
}