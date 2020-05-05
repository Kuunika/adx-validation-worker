const tortoise = require('tortoise');
import { QMessage } from "../interfaces/QMessage";
import { Wrapper } from "../utils/Environment";

export class QueueService {
    private static host: string|null = Wrapper.get('AVW_EMAIL_QUEUE_HOST');
    private static mailQ: string|null = Wrapper.get('AVW_EMAIL_QUEUE_NAME');
    private static migrateQ: string|null = Wrapper.get('AVW_MIGRATION_QUEUE_HOST');
    private static logQ: string|null = Wrapper.get('ADX_LOG_WORKER');

    static mail(message: QMessage, options: {} = { durable: true }): void {
        const adapter = new tortoise(this.host, options);
        adapter.queue(this.mailQ).publish(message);
    }

    static migrate(message: QMessage, options: {} = { durable: true }): void {
        const adapter = new tortoise(this.host, options);
        adapter.queue(this.migrateQ).publish(message);
    }

    static send(message: QMessage, options: {} = { durable: true }): void {
        const adapter = new tortoise(this.host, options);
        adapter.queue(this.logQ).publish(message);
    }
}