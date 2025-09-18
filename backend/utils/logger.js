// utils/logger.js - Winston Logger Configuration
import winston from 'winston';
import config from '../config/config.js';

const logger = winston.createLogger({
  level: config.isDevelopment() ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'krishi-sahayak-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (config.isDevelopment()) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
