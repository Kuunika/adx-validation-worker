export interface LogQueueMessage {
  channelId: string;
  client: string;
  migrationId: number;
  description: string;
  service: string;
}