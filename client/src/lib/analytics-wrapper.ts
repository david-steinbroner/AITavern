import { analytics } from './posthog';

/**
 * Wrapper to track API responses with timing
 */
export async function trackApiCall<T>(
  apiCall: () => Promise<T>,
  eventName: string,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await apiCall();
    const responseTime = Date.now() - startTime;
    
    analytics.trackEvent(eventName, {
      ...metadata,
      response_time_ms: responseTime,
      success: true,
    });
    
    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    analytics.trackEvent(eventName, {
      ...metadata,
      response_time_ms: responseTime,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    throw error;
  }
}
