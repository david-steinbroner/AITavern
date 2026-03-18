import posthog from 'posthog-js';

export function initPostHog() {
  // Only initialize if API key is provided
  if (!import.meta.env.VITE_POSTHOG_KEY) {
    console.log("PostHog API key not configured, skipping initialization");
    return;
  }

  try {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',

      // Disable capturing in development
      opt_out_capturing_by_default: import.meta.env.MODE === 'development',

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
  } catch (error) {
    console.error("Failed to initialize PostHog:", error);
  }
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
  // Generic event tracker with enhanced logging
  trackEvent: (eventName: string, properties?: Record<string, any>) => {
    console.log('[Analytics] Tracking event:', eventName, properties);
    trackEvent(eventName, properties);
  },

  // Screen/View tracking
  screenViewed: (screenName: string, properties?: Record<string, any>) => {
    console.log('[Analytics] Screen viewed:', screenName, properties);
    trackEvent('screen_viewed', { screen_name: screenName, ...properties });
    posthog.capture('$pageview', { $current_url: screenName });
  },

  // Character events
  characterCreated: (characterData: { name: string; class: string; level: number }) => {
    console.log('[Analytics] Character created:', characterData);
    trackEvent('character_created', characterData);
  },

  characterUpdated: (updates: Record<string, any>) => {
    console.log('[Analytics] Character updated:', updates);
    trackEvent('character_updated', updates);
  },

  characterNameEdited: (oldName: string, newName: string) => {
    console.log('[Analytics] Character name edited:', { oldName, newName });
    trackEvent('character_name_edited', { old_name: oldName, new_name: newName });
  },
  
  // Quest events
  questStarted: (questId: string, questTitle: string) => {
    console.log('[Analytics] Quest started:', { questId, questTitle });
    trackEvent('quest_started', { quest_id: questId, quest_title: questTitle });
  },

  questCompleted: (questId: string, questTitle: string, duration?: number) => {
    console.log('[Analytics] Quest completed:', { questId, questTitle, duration });
    trackEvent('quest_completed', {
      quest_id: questId,
      quest_title: questTitle,
      duration_seconds: duration
    });
  },

  questDeleted: (questId: string, questTitle: string, questStatus: string) => {
    console.log('[Analytics] Quest deleted:', { questId, questTitle, questStatus });
    trackEvent('quest_deleted', {
      quest_id: questId,
      quest_title: questTitle,
      quest_status: questStatus
    });
  },

  questExpanded: (questId: string, questTitle: string) => {
    console.log('[Analytics] Quest expanded:', { questId, questTitle });
    trackEvent('quest_expanded', { quest_id: questId, quest_title: questTitle });
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
  
  // Item events
  itemAcquired: (itemName: string, itemType: string, rarity: string) => {
    trackEvent('item_acquired', { item_name: itemName, item_type: itemType, rarity });
  },
  
  itemEquipped: (itemName: string, itemType: string) => {
    trackEvent('item_equipped', { item_name: itemName, item_type: itemType });
  },
  
  // Navigation events
  tabChanged: (from: string, to: string) => {
    console.log('[Analytics] Tab changed:', { from, to });
    trackEvent('tab_changed', { from_tab: from, to_tab: to });
  },

  // Button click events
  buttonClicked: (buttonName: string, location: string, properties?: Record<string, any>) => {
    console.log('[Analytics] Button clicked:', { buttonName, location, properties });
    trackEvent('button_clicked', {
      button_name: buttonName,
      location,
      ...properties
    });
  },

  // Session events
  sessionStarted: () => {
    console.log('[Analytics] Session started');
    trackEvent('session_started');
  },

  sessionEnded: (duration: number) => {
    console.log('[Analytics] Session ended:', { duration });
    trackEvent('session_ended', { duration_seconds: duration });
  },

  // Adventure events
  adventureStarted: (templateId: string, templateName: string) => {
    console.log('[Analytics] Adventure started:', { templateId, templateName });
    trackEvent('adventure_started', { template_id: templateId, template_name: templateName });
  },

  adventureEnded: (reason: string, duration?: number) => {
    console.log('[Analytics] Adventure ended:', { reason, duration });
    trackEvent('adventure_ended', { reason, duration_seconds: duration });
  },

  // Menu/Navigation events
  menuOpened: () => {
    console.log('[Analytics] Menu opened');
    trackEvent('menu_opened');
  },

  returnToMenu: (currentScreen: string) => {
    console.log('[Analytics] Return to menu from:', currentScreen);
    trackEvent('return_to_menu', { from_screen: currentScreen });
  },

  // Error events (for non-crashing issues)
  errorOccurred: (errorType: string, errorMessage: string, context?: Record<string, any>) => {
    console.error('[Analytics] Error occurred:', { errorType, errorMessage, context });
    trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      ...context
    });
  },

  // AI Response events
  aiResponseReceived: (responseTime: number, success: boolean, error?: string) => {
    console.log('[Analytics] AI response:', { responseTime, success, error });
    trackEvent('ai_response_received', {
      response_time_ms: responseTime,
      success,
      error_message: error
    });
  },

  aiResponseFailed: (error: string, duration: number) => {
    console.error('[Analytics] AI response failed:', { error, duration });
    trackEvent('ai_response_failed', {
      error_message: error,
      duration_ms: duration
    });
  },
};

export default posthog;
