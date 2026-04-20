import logger from '../utils/logger.mjs';
import * as Sentry from '@sentry/node';

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  logger.error(message, {
    status,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
  });

  // Capture in Sentry if available
  if (Sentry) {
    Sentry.captureException(err, {
      contexts: {
        request: {
          method: req.method,
          url: req.url,
          ip: req.ip,
        },
      },
    });
  }

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
  });
}

export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}
