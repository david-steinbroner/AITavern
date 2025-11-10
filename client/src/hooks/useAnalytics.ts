import { useEffect } from 'react';
import { analytics } from '@/lib/posthog';

/**
 * Hook to easily track analytics events in components
 */
export function useAnalytics() {
  return analytics;
}

/**
 * Hook to track page views when component mounts
 */
export function usePageView(pageName: string) {
  useEffect(() => {
    analytics.trackEvent('page_view', { page: pageName });
  }, [pageName]);
}

/**
 * Hook to track session duration
 */
export function useSessionTracking() {
  useEffect(() => {
    const sessionStart = Date.now();
    analytics.sessionStarted();

    return () => {
      const duration = Math.floor((Date.now() - sessionStart) / 1000);
      analytics.sessionEnded(duration);
    };
  }, []);
}

export default useAnalytics;
