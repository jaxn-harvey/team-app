import * as Sentry from '@sentry/node';

/**
 * Initialize Sentry error tracking
 * Requires SENTRY_DSN in .env
 */
export function initializeSentry(app) {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn(
      '[SENTRY] SENTRY_DSN not found in environment. Error tracking disabled.'
    );
    return null;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV !== 'production',
  });

  // Attach Sentry request handler
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());

  console.log('[SENTRY] Error tracking initialized');
  return Sentry;
}

export default Sentry;
