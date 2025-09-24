import { useState, useEffect } from 'react';

export interface TooltipConfig {
  id: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'auto';
  delay?: number;
  action?: string; // Action text for interactive tooltips
  onAction?: () => void; // Callback for interactive actions
}

export interface DemoStep {
  id: string;
  tooltipId: string;
  targetElement: string; // CSS selector or data-testid
  title: string;
  content: string;
  action?: string;
  nextStep?: string;
  condition?: () => boolean; // Condition to automatically proceed
}

const TOOLTIP_STORAGE_KEY = 'ttrpg-seen-tooltips';
const DEMO_STORAGE_KEY = 'ttrpg-demo-completed';

export function useTooltips() {
  const [seenTooltips, setSeenTooltips] = useState<Set<string>>(new Set());
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [currentDemoStep, setCurrentDemoStep] = useState<string | null>(null);
  const [demoCompleted, setDemoCompleted] = useState(false);

  // Demo steps for new player guidance
  const demoSteps: DemoStep[] = [
    {
      id: "welcome",
      tooltipId: "demo-welcome",
      targetElement: "[data-testid='character-sheet']",
      title: "Welcome to Your Adventure!",
      content: "This is your character sheet. It shows your health, abilities, and progress. Let's explore the other sections!",
      action: "Continue",
      nextStep: "quests"
    },
    {
      id: "quests",
      tooltipId: "demo-quests", 
      targetElement: "[data-testid='tab-quests']",
      title: "Discover Quests",
      content: "Tap the Quests tab to see your adventures and missions. This is where your story unfolds!",
      action: "View Quests",
      nextStep: "inventory"
    },
    {
      id: "inventory",
      tooltipId: "demo-inventory",
      targetElement: "[data-testid='tab-inventory']", 
      title: "Manage Your Items",
      content: "Your inventory holds weapons, potions, and treasures. Tap here to see what you've collected!",
      action: "Check Inventory",
      nextStep: "chat"
    },
    {
      id: "chat",
      tooltipId: "demo-chat",
      targetElement: "[data-testid='tab-chat']",
      title: "Talk to Your DM",
      content: "This is where the magic happens! Chat with your AI storyteller to continue your adventure.",
      action: "Start Chatting",
      nextStep: "first-message"
    },
    {
      id: "first-message",
      tooltipId: "demo-first-message",
      targetElement: "[data-testid='chat-interface']",
      title: "Try Your First Action",
      content: "Type something like 'I look around' or use the quick action buttons to interact with the world!",
      action: "Send Message",
      nextStep: "complete"
    }
  ];

  // Load seen tooltips and demo state from localStorage on mount
  useEffect(() => {
    try {
      const storedTooltips = localStorage.getItem(TOOLTIP_STORAGE_KEY);
      if (storedTooltips) {
        const parsed = JSON.parse(storedTooltips);
        if (Array.isArray(parsed)) {
          setSeenTooltips(new Set(parsed));
        }
      }
      
      const storedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
      if (storedDemo) {
        const parsed = JSON.parse(storedDemo);
        if (typeof parsed === 'boolean') {
          setDemoCompleted(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load tooltip state:', error);
      // Reset to safe defaults if localStorage is corrupted
      setSeenTooltips(new Set());
      setDemoCompleted(false);
    }
  }, []);

  // Save seen tooltips to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem(TOOLTIP_STORAGE_KEY, JSON.stringify(Array.from(seenTooltips)));
    } catch (error) {
      console.warn('Failed to save tooltip state:', error);
    }
  }, [seenTooltips]);

  // Save demo completion state
  useEffect(() => {
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoCompleted));
    } catch (error) {
      console.warn('Failed to save demo state:', error);
    }
  }, [demoCompleted]);

  const markTooltipAsSeen = (tooltipId: string) => {
    setSeenTooltips(prev => new Set([...Array.from(prev), tooltipId]));
    if (activeTooltip === tooltipId) {
      setActiveTooltip(null);
    }
  };

  const shouldShowTooltip = (tooltipId: string) => {
    return !seenTooltips.has(tooltipId);
  };

  const showTooltip = (tooltipId: string) => {
    if (shouldShowTooltip(tooltipId)) {
      setActiveTooltip(tooltipId);
    }
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  const resetAllTooltips = () => {
    setSeenTooltips(new Set());
    localStorage.removeItem(TOOLTIP_STORAGE_KEY);
  };

  const startDemo = () => {
    setIsDemoActive(true);
    setCurrentDemoStep("welcome");
    setDemoCompleted(false);
  };

  const nextDemoStep = () => {
    const currentStep = demoSteps.find(step => step.id === currentDemoStep);
    if (currentStep?.nextStep === "complete") {
      setIsDemoActive(false);
      setCurrentDemoStep(null);
      setDemoCompleted(true);
    } else if (currentStep?.nextStep) {
      setCurrentDemoStep(currentStep.nextStep);
    }
  };

  const skipDemo = () => {
    setIsDemoActive(false);
    setCurrentDemoStep(null);
    setDemoCompleted(true);
  };

  const restartDemo = () => {
    setDemoCompleted(false);
    setSeenTooltips(new Set());
    localStorage.removeItem(TOOLTIP_STORAGE_KEY);
    localStorage.removeItem(DEMO_STORAGE_KEY);
    startDemo();
  };

  const getCurrentDemoStep = () => {
    return demoSteps.find(step => step.id === currentDemoStep);
  };

  const shouldShowDemo = () => {
    return !demoCompleted && seenTooltips.size === 0;
  };

  return {
    seenTooltips,
    activeTooltip,
    markTooltipAsSeen,
    shouldShowTooltip,
    showTooltip,
    hideTooltip,
    resetAllTooltips,
    // Demo functionality
    isDemoActive,
    currentDemoStep,
    demoCompleted,
    demoSteps,
    startDemo,
    nextDemoStep,
    skipDemo,
    restartDemo,
    getCurrentDemoStep,
    shouldShowDemo
  };
}