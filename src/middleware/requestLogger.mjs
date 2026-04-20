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

  // Capture response - wrap both send and json
  const originalSend = res.send;
  const originalJson = res.json;

  const logResponse = () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${req.method} ${req.path} - ${res.statusCode}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  };

  res.send = function (data) {
    logResponse();
    return originalSend.call(this, data);
  };

  res.json = function (data) {
    logResponse();
    return originalJson.call(this, data);
  };

  next();
}

export default requestLogger;
