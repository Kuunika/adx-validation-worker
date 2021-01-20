import { createLogger, format, transports as Transports } from 'winston';
import { hostname } from 'os';

const hostMeta = format((info, _opts) => Object.assign({}, info, { context: { host: hostname() } }));
const _defaultFormat = format.combine(format.json(), format.timestamp(), hostMeta());

const _winstonLogger = createLogger({
    level: 'info',
    defaultMeta: { service: 'ADX Validator' },
    format: _defaultFormat,
    transports: [
        new Transports.File({ filename: 'logs/error.log', level: 'error', format: _defaultFormat }),
        new Transports.File({ filename: 'logs/combined.log', format: _defaultFormat })
    ]
});

export const LOGGER = _winstonLogger;