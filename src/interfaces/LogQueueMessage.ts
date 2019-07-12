export interface LogQueueMessage {
  channelId: string;
  client: string;
  migrationId: number;
  message: string;
}