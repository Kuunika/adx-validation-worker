import * as winston from 'winston';
import * as Pusher from 'pusher';

const { createLogger, format, transports } = winston;

export class Logger {
  private _pusherLogger: Pusher;
  private _logger: any;
  constructor(private channelId: string) {
    this._logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      defaultMeta: { service: 'adx-validation-worker' },
      transports: [
        new transports.File({ filename: `./logs/${this.channelId}-error.log`, level: 'error' }),
        new transports.File({ filename: `./logs/${this.channelId}-combined.log` })
      ]
    });
    if (process.env.NODE_ENV !== 'production') {
      this._logger.add(new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple()
        )
      }));
    }
    this._pusherLogger = new Pusher({
      appId: process.env.AVW_PUSHER_APP_ID || '',
      key: process.env.AVW_PUSHER_KEY || '',
      secret: process.env.AVW_PUSHER_SECRET || '',
      cluster: process.env.AVW_PUSHER_CLUSTER || '',
      encrypted: Boolean(process.env.AVW_PUSHER_ENCRYPTED) || true
    });
  }
  info(message: string) {
    this._logger.info(message);
    this._pusherLogger.trigger(this.channelId, 'my-event', message);
  }

  error(message: string) {
    this._logger.error(message);
  }
}
