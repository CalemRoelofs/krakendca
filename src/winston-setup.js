const { createLogger, format, transports } = require('winston');

const jsonFormat = format.combine(
  format.timestamp(),
  format.printf((info) => `${JSON.stringify({ timestamp: info.timestamp, level: info.level, message: info.message })}`),
);

const textFormat = format.combine(
  format.timestamp(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

const logger = createLogger({
  level: 'info',
  format: jsonFormat,
  defaultMeta: { service: 'kraken-dca-service' },
  transports: [
    new transports.File({ filename: './logs/error.log', level: 'error' }),
    new transports.File({ filename: './logs/combined.log' }),
    new transports.Console({ format: textFormat }),
  ],
});

module.exports = logger;
