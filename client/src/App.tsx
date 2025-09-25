import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider as CustomTooltipProvider } from "@/components/TooltipProvider";
import SettingsDropdown from "@/components/SettingsDropdown";
import AccountMenu from "@/components/AccountMenu";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

// Components
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ErrorMonitor } from "./components/ErrorMonitor";
import EditableCampaignName from "./components/EditableCampaignName";
import NavigationTabs from "./components/NavigationTabs";
import CharacterSheet from "./components/CharacterSheet";
import QuestLog from "./components/QuestLog";
import Inventory from "./components/Inventory";
import ChatInterface from "./components/ChatInterface";
import CombatInterface from "./components/CombatInterface";
import StartMenu from "./components/StartMenu";
import UserGuide from "./components/UserGuide";
import WelcomeScreen from "./components/WelcomeScreen";
import DemoTooltip from "./components/DemoTooltip";
import ThemeToggle from "./components/ThemeToggle";
import CharacterCreation from "./components/CharacterCreation";
import AdventureTemplates from "./components/AdventureTemplates";
import LandingPage from "./components/LandingPage";
import DemoIndicator from "./components/DemoIndicator";
import { useTooltips } from "./hooks/useTooltips";
import { useNotifications } from "./hooks/useNotifications";

// Types
import type { Character, Quest, Item, Message, Enemy, GameState, Campaign } from "@shared/schema";

type TabType = "character" | "quests" | "inventory" | "chat";
type ViewType = "welcome" | "startMenu" | "userGuide" | "characterCreation" | "adventureTemplates" | "game";

function GameApp() {
  const [currentView, setCurrentView] = useState<ViewType>("welcome");
  const [activeTab, setActiveTab] = useState<TabType>("character");
  const [isListening, setIsListening] = useState(false);
  
  // Demo and tooltip functionality
  const {
    isDemoActive,
    currentDemoStep,
    demoCompleted,
    seenTooltips,
    startDemo,
    nextDemoStep,
    skipDemo,
    getCurrentDemoStep,
    shouldShowDemo
  } = useTooltips();

  // Notification system for badges
  const { hasNotification, markTabAsVisited, addNotification } = useNotifications();

  // Check if we should show welcome screen for returning users
  useEffect(() => {
    const isNewUser = !demoCompleted && seenTooltips.size === 0;
    
    // If user has completed demo or has seen tooltips, skip welcome
    if (!isNewUser && currentView === "welcome") {
      setCurrentView("startMenu");
    }
  }, [demoCompleted, seenTooltips.size, currentView]);
  
  // Fetch real data from backend
  const { data: character, isLoading: characterLoading } = useQuery<Character>({
    queryKey: ['/api/character'],
  });

  const { data: quests = [], isLoading: questsLoading } = useQuery<Quest[]>({
    queryKey: ['/api/quests'],
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
  });

  const { data: gameState } = useQuery<GameState>({
    queryKey: ['/api/game-state'],
  });

  // Fetch current campaign
  const { data: campaign } = useQuery<Campaign>({
    queryKey: ['/api/campaigns/active'],
  });
  
  // Combat state based on game state
  const isInCombat = gameState?.inCombat || false;
  const currentTurn = gameState?.currentTurn === 'player' ? 'player' : 'enemy';
  
  // Fetch enemies for combat
  const { data: enemies = [] } = useQuery({
    queryKey: ['/api/enemies', gameState?.combatId],
    queryFn: async () => {
      const params = gameState?.combatId ? `?combatId=${gameState.combatId}` : '';
      const response = await apiRequest('GET', `/api/enemies${params}`);
      return response.json();
    },
    enabled: isInCombat && !!gameState?.combatId,
  });
  
  // AI Chat mutation
  const aiChatMutation = useMutation({
    mutationFn: async (data: { message: string; isDirectDM: boolean }) => {
      const response = await apiRequest('POST', '/api/ai/chat', data);
      return response.json();
    },
    onSuccess: () => {
      // Refetch all data after AI response
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/character'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enemies'] });
    },
  });
  
  // Quick action mutation
  const quickActionMutation = useMutation({
    mutationFn: async (action: string) => {
      const response = await apiRequest('POST', '/api/ai/quick-action', { action });
      return response.json();
    },
    onSuccess: () => {
      // Refetch all data after quick action
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/character'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enemies'] });
    },
  });
  
  // Combat action mutation
  const combatActionMutation = useMutation({
    mutationFn: async ({ action, targetId, spellId, itemId }: {
      action: string;
      targetId?: string;
      spellId?: string;
      itemId?: string;
    }) => {
      const response = await apiRequest('POST', '/api/combat/action', {
        action, targetId, spellId, itemId
      });
      return response.json();
    },
    onSuccess: () => {
      // Refetch all data after combat action
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/character'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enemies'] });
    },
  });
  
  // Event Handlers
  const handleSendMessage = (content: string, isDirectDM: boolean = false) => {
    aiChatMutation.mutate({ message: content, isDirectDM });
  };
  
  const handleQuickAction = (action: string) => {
    quickActionMutation.mutate(action);
  };
  
  const handleToggleListening = () => {
    setIsListening(!isListening);
    // Simulate speech recognition for demo
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        handleSendMessage("I search for hidden passages behind the tapestries.");
      }, 3000);
    }
  };
  
  // Stable enemy action callback to prevent useEffect reset in CombatInterface
  const handleEnemyAction = useCallback(() => {
    combatActionMutation.mutate({ action: 'enemy-turn' });
  }, [combatActionMutation]);
  
  const handleCombatAction = {
    attack: (targetId: string) => {
      combatActionMutation.mutate({ action: 'attack', targetId });
    },
    defend: () => {
      combatActionMutation.mutate({ action: 'defend' });
    },
    spell: (spellId: string) => {
      combatActionMutation.mutate({ action: 'cast', spellId });
    },
    item: (itemId: string) => {
      combatActionMutation.mutate({ action: 'use-item', itemId });
    },
    flee: () => {
      combatActionMutation.mutate({ action: 'flee' });
    }
  };
  
  const handleItemAction = (item: Item) => {
    if (item.type === 'consumable') {
      handleSendMessage(`I use ${item.name}.`);
    } else {
      // Toggle equipped status
      apiRequest('PATCH', `/api/items/${item.id}`, { equipped: !item.equipped })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/items'] });
        });
    }
  };
  
  const handleQuestAction = (quest: Quest) => {
    console.log('Quest selected:', quest.title);
  };
  
  // Active quest count for navigation badge
  const activeQuestCount = quests.filter(q => q.status === 'active').length;
  
  // Initialize notifications for new users to show badges
  useEffect(() => {
    if (activeQuestCount > 0 && !hasNotification('quests')) {
      addNotification({ 
        tabId: 'quests', 
        type: 'info', 
        count: activeQuestCount, 
        message: 'New quests available' 
      });
    }
    if (items.length > 0 && !hasNotification('inventory')) {
      addNotification({ 
        tabId: 'inventory', 
        type: 'info', 
        count: items.length, 
        message: 'Items in inventory' 
      });
    }
  }, [activeQuestCount, items.length, hasNotification, addNotification]);

  // Mark tabs as visited when they become active (fixes notification clearing)
  useEffect(() => {
    markTabAsVisited(activeTab);
  }, [activeTab, markTabAsVisited]);
  
  // Get page content based on active tab
  const getPageContent = () => {
    switch (activeTab) {
      case 'character':
        if (characterLoading) {
          return (
            <div className="flex items-center justify-center h-64" data-testid="loading-character">
              <p className="text-muted-foreground">Loading character...</p>
            </div>
          );
        }
        return character ? (
          <CharacterSheet character={character} className="pb-20" />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No character found</p>
          </div>
        );
      case 'quests':
        if (questsLoading) {
          return (
            <div className="flex items-center justify-center h-64" data-testid="loading-quests">
              <p className="text-muted-foreground">Loading quests...</p>
            </div>
          );
        }
        return (
          <QuestLog 
            quests={quests} 
            onQuestClick={handleQuestAction}
            className="pb-20" 
          />
        );
      case 'inventory':
        if (itemsLoading) {
          return (
            <div className="flex items-center justify-center h-64" data-testid="loading-inventory">
              <p className="text-muted-foreground">Loading inventory...</p>
            </div>
          );
        }
        return (
          <Inventory 
            items={items}
            onItemTap={handleItemAction}
            onItemLongPress={(item) => console.log('Item details:', item)}
            className="pb-20"
          />
        );
      case 'chat':
        if (messagesLoading) {
          return (
            <div className="flex items-center justify-center h-64" data-testid="loading-chat">
              <p className="text-muted-foreground">Loading conversation...</p>
            </div>
          );
        }
        return (
          <ChatInterface 
            messages={messages}
            character={character}
            onSendMessage={handleSendMessage}
            onQuickAction={handleQuickAction}
            isListening={isListening}
            onToggleListening={handleToggleListening}
            isLoading={aiChatMutation.isPending || quickActionMutation.isPending}
            className="pb-20"
          />
        );
      default:
        return null;
    }
  };
  
  // Theme is now managed by ThemeToggle component
  
  // Handle different views
  if (currentView === "welcome") {
    return (
      <WelcomeScreen
        onStartDemo={() => {
          startDemo();
          setCurrentView("game");
          setActiveTab("character");
        }}
        onSkipDemo={() => {
          skipDemo();
          setCurrentView("startMenu");
        }}
        onEnterGame={() => setCurrentView("startMenu")}
      />
    );
  }

  if (currentView === "startMenu") {
    return (
      <StartMenu 
        onStartGame={async (campaignId: string) => {
          try {
            // Activate the selected campaign
            await apiRequest('PATCH', `/api/campaigns/${campaignId}/activate`);
            // Invalidate campaigns query to refresh active campaign
            queryClient.invalidateQueries({ queryKey: ['/api/campaigns/active'] });
            setCurrentView("game");
          } catch (error) {
            console.error('Failed to activate campaign:', error);
          }
        }}
        onShowGuide={() => setCurrentView("userGuide")}
        onCreateCharacter={() => setCurrentView("characterCreation")}
        onShowAdventureTemplates={() => setCurrentView("adventureTemplates")}
      />
    );
  }

  if (currentView === "userGuide") {
    return (
      <UserGuide onBack={() => setCurrentView("startMenu")} />
    );
  }

  if (currentView === "characterCreation") {
    return (
      <CharacterCreation 
        onComplete={(characterData) => {
          console.log('Character created:', characterData);
          setCurrentView("game");
        }}
        onBack={() => setCurrentView("startMenu")}
      />
    );
  }

  if (currentView === "adventureTemplates") {
    return (
      <AdventureTemplates 
        onSelectTemplate={async (template) => {
          console.log('Adventure template selected:', template);
          
          try {
            // Initialize the adventure on the backend
            await apiRequest('POST', '/api/adventure/initialize', {
              id: template.id,
              name: template.name,
              setting: template.setting,
              initialScene: template.initialScene,
              initialQuest: template.initialQuest
            });
            
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
            queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
            queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
            
            setCurrentView("game");
          } catch (error) {
            console.error('Failed to initialize adventure:', error);
            // Still proceed to game view
            setCurrentView("game");
          }
        }}
        onBack={() => setCurrentView("startMenu")}
      />
    );
  }

  // Main game view
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Demo Mode Indicator */}
      <DemoIndicator />
      
      {/* Error Monitor */}
      <ErrorMonitor currentView={currentView} activeTab={activeTab} />
      
      {/* Page Title */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between h-16 px-3 sm:px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView("startMenu")}
            className="text-muted-foreground"
            data-testid="button-return-menu"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Main Menu
          </Button>
          <div className="group">
            <EditableCampaignName
              campaignName={campaign?.name || "Skunk Tales Adventure"}
              campaignId={campaign?.id}
            />
          </div>
          <div className="flex items-center gap-2">
            <AccountMenu />
            <SettingsDropdown />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="px-3 sm:px-4 py-4 sm:py-6">
        {getPageContent()}
      </main>
      
      {/* Bottom Navigation */}
      <NavigationTabs 
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          markTabAsVisited(tab);
        }}
        questCount={hasNotification('quests') ? activeQuestCount : 0}
        itemCount={hasNotification('inventory') ? items.length : 0}
        unreadMessages={0}
      />
      
      {/* Combat Overlay */}
      <CombatInterface 
        isInCombat={isInCombat}
        currentTurn={currentTurn}
        enemies={enemies}
        onAttack={handleCombatAction.attack}
        onDefend={handleCombatAction.defend}
        onCastSpell={handleCombatAction.spell}
        onUseItem={handleCombatAction.item}
        onFlee={handleCombatAction.flee}
        onEnemyAction={handleEnemyAction}
      />

      {/* Demo Tooltip Overlay */}
      {isDemoActive && getCurrentDemoStep() && (
        <DemoTooltip
          step={getCurrentDemoStep()!}
          isVisible={true}
          onNext={() => {
            const currentStep = getCurrentDemoStep();
            if (currentStep) {
              // Handle tab switching during demo
              if (currentStep.id === "quests") {
                setActiveTab("quests");
              } else if (currentStep.id === "inventory") {
                setActiveTab("inventory");
              } else if (currentStep.id === "chat") {
                setActiveTab("chat");
              }
            }
            nextDemoStep();
          }}
          onSkip={skipDemo}
          totalSteps={5}
          currentStepNumber={
            ['welcome', 'quests', 'inventory', 'chat', 'first-message'].indexOf(currentDemoStep || '') + 1
          }
        />
      )}
    </div>
  );
}

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Skunk Tales...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return <GameApp />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <CustomTooltipProvider>
              <AppRouter />
              <Toaster />
            </CustomTooltipProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;