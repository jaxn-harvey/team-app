export function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

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
