import posthog from 'posthog-js';

export function initPostHog() {
  // Only initialize if API key is provided
  if (!import.meta.env.VITE_POSTHOG_KEY) {
    console.log("PostHog API key not configured, skipping initialization");
    return;
  }

  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    
    // Disable in development
    disabled: import.meta.env.MODE === 'development',
    
    // Capture pageviews automatically
    capture_pageview: true,
    
    // Capture performance metrics
    capture_pageleave: true,
    
    // Session recording
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: {
        password: true,
      },
    },
  });
}

// Track custom events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  posthog.capture(eventName, properties);
}

// Identify users
export function identifyUser(userId: string, properties?: Record<string, any>) {
  posthog.identify(userId, properties);
}

// Track page views manually (if needed)
export function trackPageView(pageName: string) {
  posthog.capture('$pageview', { page: pageName });
}

// Game-specific event helpers
export const analytics = {
  // Character events
  characterCreated: (characterData: { name: string; class: string; level: number }) => {
    trackEvent('character_created', characterData);
  },
  
  characterUpdated: (updates: Record<string, any>) => {
    trackEvent('character_updated', updates);
  },
  
  // Quest events
  questStarted: (questId: string, questTitle: string) => {
    trackEvent('quest_started', { quest_id: questId, quest_title: questTitle });
  },
  
  questCompleted: (questId: string, questTitle: string, duration?: number) => {
    trackEvent('quest_completed', { 
      quest_id: questId, 
      quest_title: questTitle,
      duration_seconds: duration 
    });
  },
  
  // Combat events
  combatStarted: (enemyCount: number) => {
    trackEvent('combat_started', { enemy_count: enemyCount });
  },
  
  combatEnded: (victory: boolean, duration?: number) => {
    trackEvent('combat_ended', { 
      victory,
      duration_seconds: duration 
    });
  },
  
  // Interaction events
  messageSent: (messageType: 'chat' | 'action' | 'combat') => {
    trackEvent('message_sent', { type: messageType });
  },
  
  aiResponseReceived: (responseTime: number) => {
    trackEvent('ai_response_received', { response_time_ms: responseTime });
  },
  
  // Item events
  itemAcquired: (itemName: string, itemType: string, rarity: string) => {
    trackEvent('item_acquired', { item_name: itemName, item_type: itemType, rarity });
  },
  
  itemEquipped: (itemName: string, itemType: string) => {
    trackEvent('item_equipped', { item_name: itemName, item_type: itemType });
  },
  
  // Navigation events
  tabChanged: (from: string, to: string) => {
    trackEvent('tab_changed', { from_tab: from, to_tab: to });
  },
  
  // Session events
  sessionStarted: () => {
    trackEvent('session_started');
  },
  
  sessionEnded: (duration: number) => {
    trackEvent('session_ended', { duration_seconds: duration });
  },
  
  // Adventure events
  adventureStarted: (templateId: string, templateName: string) => {
    trackEvent('adventure_started', { template_id: templateId, template_name: templateName });
  },
  
  // Error events (for non-crashing issues)
  errorOccurred: (errorType: string, errorMessage: string) => {
    trackEvent('error_occurred', { error_type: errorType, error_message: errorMessage });
  },
};

export default posthog;
