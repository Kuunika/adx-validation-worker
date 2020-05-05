export interface QMessage {
    channelId: string;
    clientId: string;
    migrationId: number;
    message?: string;
    flag?: boolean;
    source?: string;
    description?: string;
}