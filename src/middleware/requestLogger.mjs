import logger from '../utils/logger.mjs';

/**
 * Middleware to log all HTTP requests
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  // Log request
  logger.info(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;

    // Log response
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${req.method} ${req.path} - ${res.statusCode}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });

    // Call original send
    return originalSend.call(this, data);
  };

  next();
}

export default requestLogger;
