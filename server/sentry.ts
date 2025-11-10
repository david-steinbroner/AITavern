import * as Sentry from "@sentry/node";

export function initSentry() {
  // Only initialize if DSN is provided
  if (!process.env.SENTRY_DSN) {
    console.log("Sentry DSN not configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    
    // Don't send errors in development
    beforeSend(event) {
      if (process.env.NODE_ENV === 'development') {
        return null;
      }
      return event;
    },
  });
}

// Helper to capture errors with context
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Helper to set user context
export function setUserContext(userId: string, username?: string) {
  Sentry.setUser({
    id: userId,
    username: username,
  });
}

export { Sentry };
