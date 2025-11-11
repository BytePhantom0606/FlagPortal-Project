/**
 * ============================================
 * FlagForge - Structured Logging with Winston
 * ============================================
 *
 * Logging strategy:
 * - JSON format for machine parsing
 * - Separate error logs for alerting
 * - Rotate logs to prevent disk fill
 * - Never log sensitive data (passwords, flags, tokens)
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '../../logs');
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Custom format to redact sensitive fields
const redactSensitiveData = winston.format((info) => {
  const sensitiveFields = [
    'password',
    'token',
    'jwt',
    'secret',
    'flag',
    'authorization',
    'cookie',
  ];

  const redact = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    for (const key in obj) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        redact(obj[key]);
      }
    }
    return obj;
  };

  return redact(info);
});

// Create logger instance
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    redactSensitiveData(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'flagforge-backend',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Write errors to error.log
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Helper functions for structured logging
export const logAuth = (action, userId, metadata = {}) => {
  logger.info('Authentication event', {
    category: 'auth',
    action,
    userId,
    ...metadata,
  });
};

export const logSecurity = (event, severity, metadata = {}) => {
  logger.warn('Security event', {
    category: 'security',
    event,
    severity,
    ...metadata,
  });
};

export const logFlagSubmission = (userId, challengeId, success, metadata = {}) => {
  logger.info('Flag submission', {
    category: 'flag',
    userId,
    challengeId,
    success,
    ...metadata,
  });
};

export const logAdmin = (action, adminId, resource, metadata = {}) => {
  logger.info('Admin action', {
    category: 'admin',
    action,
    adminId,
    resource,
    ...metadata,
  });
};

export default logger;
