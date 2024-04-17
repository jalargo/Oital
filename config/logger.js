const winston = require('winston');
require('winston-daily-rotate-file');

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(info => {
      // Anonymizing potentially sensitive information
      let message = info.message;
      if (message) {
        // Anonymize IP addresses
        message = message.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/, '[IP]');
        // Anonymize email addresses
        message = message.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, '[EMAIL]');
        // Anonymize usernames
        message = message.replace(/username":".*?"/, 'username":"[USERNAME]"');
        // Anonymize passwords (already handled but included for completeness)
        message = message.replace(/password":".*?"/, 'password":"[PASSWORD]"');
      }
      return `${info.timestamp} ${info.level}: ${message}`;
    })
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    fileRotateTransport,
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;