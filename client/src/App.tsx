import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// Components
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
import SimpleCharacterCreation from "./components/SimpleCharacterCreation";
import WorldGeneration from "./components/WorldGeneration";
import AdventureTemplates from "./components/AdventureTemplates";
import ColdStartLoader from "./components/ColdStartLoader";
import { useTooltips } from "./hooks/useTooltips";
import { useAnalytics, useSessionTracking } from "./hooks/useAnalytics";
import { useNotifications } from "./hooks/useNotifications";
import { useToast } from "./hooks/use-toast";
import { setUserContext, setGameContext } from "./lib/sentry";

// Types
import type { Character, Quest, Item, Message, Enemy, GameState } from "@shared/schema";

type TabType = "character" | "quests" | "inventory" | "chat";
type ViewType = "welcome" | "startMenu" | "userGuide" | "characterCreation" | "adventureTemplates" | "game";

function GameApp() {
  const [currentView, setCurrentView] = useState<ViewType>("welcome");
  const [activeTab, setActiveTab] = useState<TabType>("character");
  const [isListening, setIsListening] = useState(false);
  const [isGeneratingWorld, setIsGeneratingWorld] = useState(false);
  const [worldGenerationComplete, setWorldGenerationComplete] = useState(false);
  const [characterName, setCharacterName] = useState("");

  // Track view changes (welcome, menu, game, etc)
  useEffect(() => {
    const viewNames = {
      welcome: 'Welcome Screen',
      startMenu: 'Start Menu',
      userGuide: 'User Guide',
      characterCreation: 'Character Creation',
      adventureTemplates: 'Adventure Templates',
      game: 'Game Screen'
    };
    console.log('[App] View changed to:', currentView);
    analytics.screenViewed(viewNames[currentView], { view: currentView });
  }, [currentView]);

  // Track screen views when tab changes (within game)
  useEffect(() => {
    if (currentView === 'game') {
      const screenNames = {
        character: 'Character Sheet',
        quests: 'Quest Log',
        inventory: 'Inventory',
        chat: 'Chat Interface'
      };
      analytics.screenViewed(screenNames[activeTab], { tab: activeTab });
    }
  }, [activeTab, currentView]);

  // Watch for world generation completion
  useEffect(() => {
    if (worldGenerationComplete && isGeneratingWorld) {
      console.log('[App] World generation complete, transitioning to game');
      setIsGeneratingWorld(false);
      setWorldGenerationComplete(false);
      // Invalidate queries to fetch the newly generated world
      queryClient.invalidateQueries({ queryKey: ['/api/character'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setCurrentView("game");
    }
  }, [worldGenerationComplete, isGeneratingWorld]);

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

  // Toast notifications
  const { toast } = useToast();

  // Analytics and session tracking
  const analytics = useAnalytics();
  useSessionTracking();

  // Fetch real data from backend - MOVED UP before Sentry useEffects to prevent TDZ errors
  const { data: character, isLoading: characterLoading, error: characterError } = useQuery<Character>({
    queryKey: ['/api/character'],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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

  // Update Sentry context when character data changes
  // MOVED AFTER data declarations to prevent TDZ errors in Safari
  useEffect(() => {
    if (character) {
      console.log('[App] Updating Sentry user context', {
        characterId: character.id,
        characterName: character.name,
        level: character.level
      });
      setUserContext(character.id, {
        name: character.name,
        level: character.level,
        class: character.class
      });
    }
  }, [character]);

  // Update Sentry context when game state changes
  // MOVED AFTER data declarations and added guard clause
  useEffect(() => {
    // Guard clause to prevent accessing undefined arrays
    if (!quests || !items) return;

    console.log('[App] Updating Sentry game context', {
      currentView,
      currentTab: currentView === 'game' ? activeTab : undefined,
      questCount: quests.length,
      itemCount: items.length,
      inCombat: isInCombat
    });
    setGameContext({
      currentView,
      currentTab: currentView === 'game' ? activeTab : undefined,
      activeQuestCount: quests.filter(q => q.status === 'active').length,
      itemCount: items.length,
      inCombat: isInCombat
    });
  }, [currentView, activeTab, quests, items, isInCombat]); // Fixed: use full arrays instead of .length

  // Track tab changes
  useEffect(() => {
    if (currentView === "game") {
      analytics.trackEvent("tab_view", { tab: activeTab });
    }
  }, [activeTab, currentView, analytics]);

  useEffect(() => {
    const isNewUser = !demoCompleted && seenTooltips.size === 0;

    // If user has completed demo or has seen tooltips, skip welcome
    if (!isNewUser && currentView === "welcome") {
      setCurrentView("startMenu");
    }
  }, [demoCompleted, seenTooltips.size, currentView]);
  // AI Chat mutation
  const aiChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const startTime = Date.now();
      console.log('[App] Sending message to AI:', message.substring(0, 100));

      try {
        const response = await apiRequest('POST', '/api/ai/chat', { message });
        const data = await response.json();
        const duration = Date.now() - startTime;

        console.log('[App] AI response received:', {
          duration,
          success: true,
          hasContent: !!data.content
        });

        // Automatic error detection: Slow response
        if (duration > 10000) {
          console.warn('[App] Slow AI response detected:', duration, 'ms');
          analytics.trackEvent('ai_response_slow', {
            duration_ms: duration,
            threshold_ms: 10000,
            message_preview: message.substring(0, 100)
          });
        }

        // Automatic error detection: Empty or missing content
        if (!data.content || data.content.trim().length === 0) {
          console.error('[App] AI response has no content');
          analytics.errorOccurred('ai_response_empty', 'AI returned empty content', {
            message_preview: message.substring(0, 100),
            response_keys: Object.keys(data)
          });
        }

        // Automatic error detection: Fallback response (error flag present)
        if (data.error) {
          console.error('[App] AI returned fallback response due to error:', data.error);
          analytics.errorOccurred(`ai_fallback_${data.error}`, `AI fallback: ${data.error}`, {
            message_preview: message.substring(0, 100),
            error_type: data.error,
            response_content: data.content.substring(0, 200)
          });

          // Also show toast to user
          toast({
            title: "AI Response Issue",
            description: "The narrator had trouble processing your request. Try rephrasing or use the Regenerate button.",
            variant: "destructive",
            duration: 5000,
          });
        }

        analytics.aiResponseReceived(duration, true);
        return data;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error('[App] AI response failed:', {
          error: error.message,
          duration
        });

        analytics.aiResponseFailed(error.message, duration);
        analytics.errorOccurred('ai_response_error', error.message, {
          message_preview: message.substring(0, 100),
          duration_ms: duration
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      // Check if quest was updated and show toast notification
      if (data.actions?.updateQuest) {
        const updatedQuestId = data.actions.updateQuest.id;
        const updatedQuestData = data.actions.updateQuest.updates;

        // Find the quest in current quests to get its title
        const quest = quests.find(q => q.id === updatedQuestId);

        if (quest) {
          // Check if quest was completed (status changed to completed OR progress reached maxProgress)
          const wasCompleted =
            updatedQuestData.status === 'completed' ||
            (updatedQuestData.progress !== undefined && updatedQuestData.progress >= quest.maxProgress);

          console.log('[App] Quest update detected', {
            questId: updatedQuestId,
            questTitle: quest.title,
            wasCompleted,
            newProgress: updatedQuestData.progress
          });

          toast({
            title: wasCompleted ? "Quest Complete! 🎉" : "Quest Updated",
            description: quest.title,
            duration: 3000,
          });
        }
      }

      // Refetch all data after AI response
      console.log('[App] AI response successful, refreshing data');
      analytics.messageSent("chat");
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/character'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enemies'] });
    },
    onError: (error: any) => {
      console.error('[App] AI mutation error:', error);
    }
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

  // Delete quest mutation
  const deleteQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await apiRequest('DELETE', `/api/quests/${questId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
    },
  });

  // Event Handlers
  const handleSendMessage = (content: string) => {
    aiChatMutation.mutate(content);
  };

  const handleDeleteQuest = (questId: string) => {
    deleteQuestMutation.mutate(questId);
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

  const handleEndAdventure = async () => {
    try {
      // Reset the game state on the backend
      await apiRequest('POST', '/api/adventure/reset', {});

      // Invalidate and refetch all queries to refresh the data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/game-state'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/quests'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/messages'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/character'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/items'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/enemies'] })
      ]);

      // Return to start menu after data is refreshed
      setCurrentView("startMenu");
      analytics.trackEvent("adventure_ended");
    } catch (error) {
      console.error('Failed to end adventure:', error);
    }
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
          <CharacterSheet character={character} className="h-full" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No character found</p>
          </div>
        );
      case 'quests':
        if (questsLoading) {
          return (
            <div className="flex items-center justify-center h-full" data-testid="loading-quests">
              <p className="text-muted-foreground">Loading quests...</p>
            </div>
          );
        }
        return (
          <QuestLog
            quests={quests}
            onQuestClick={handleQuestAction}
            onQuestDelete={handleDeleteQuest}
            className="h-full"
          />
        );
      case 'inventory':
        if (itemsLoading) {
          return (
            <div className="flex items-center justify-center h-full" data-testid="loading-inventory">
              <p className="text-muted-foreground">Loading inventory...</p>
            </div>
          );
        }
        return (
          <Inventory
            items={items}
            onItemTap={handleItemAction}
            onItemLongPress={(item) => console.log('Item details:', item)}
            className="h-full"
          />
        );
      case 'chat':
        if (messagesLoading) {
          return (
            <div className="flex items-center justify-center h-full" data-testid="loading-chat">
              <p className="text-muted-foreground">Loading conversation...</p>
            </div>
          );
        }
        return (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isListening={isListening}
            onToggleListening={handleToggleListening}
            isLoading={aiChatMutation.isPending}
            character={character}
            quests={quests}
            items={items}
            gameState={gameState}
            onEndAdventure={handleEndAdventure}
            className="h-full"
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
        onStartGame={() => setCurrentView("game")}
        onShowGuide={() => setCurrentView("userGuide")}
        onCreateCharacter={() => setCurrentView("characterCreation")}
        onShowAdventureTemplates={() => setCurrentView("adventureTemplates")}
        onEndAdventure={handleEndAdventure}
      />
    );
  }

  if (currentView === "userGuide") {
    return (
      <UserGuide onBack={() => setCurrentView("startMenu")} />
    );
  }

  if (currentView === "characterCreation") {
    // Show world generation loading screen if generating
    if (isGeneratingWorld) {
      return (
        <WorldGeneration
          characterName={characterName}
          onComplete={() => {
            // This is called by the loading screen component
            // But we'll actually complete when the API finishes
          }}
        />
      );
    }

    // Show simplified character creation form
    return (
      <SimpleCharacterCreation
        onComplete={async (characterData) => {
          console.log('[App] Character data submitted:', characterData);
          setCharacterName(characterData.name);
          setIsGeneratingWorld(true);
          setWorldGenerationComplete(false);

          try {
            // Create character with appearance and backstory
            // Backend will auto-generate world and initialize game
            console.log('[App] Creating character and generating world...');
            await apiRequest('POST', '/api/character', {
              name: characterData.name,
              class: 'Adventurer',
              level: 1,
              experience: 0,
              appearance: characterData.description,
              backstory: characterData.backstory,
              strength: 10,
              dexterity: 10,
              constitution: 10,
              intelligence: 10,
              wisdom: 10,
              charisma: 10,
              currentHealth: 10,
              maxHealth: 10,
              currentMana: 0,
              maxMana: 0,
            });

            console.log('[App] Character created and world generated successfully!');
            // Mark world generation as complete
            setWorldGenerationComplete(true);
          } catch (error) {
            console.error('[App] Error creating character:', error);
            setIsGeneratingWorld(false);
            toast({
              title: "Error Creating Character",
              description: "Failed to generate your world. Please try again.",
              variant: "destructive",
            });
          }
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
              initialQuest: template.initialQuest,
              introMessage: template.introMessage
            });
            
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
            queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
            queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
            queryClient.invalidateQueries({ queryKey: ['/api/character'] });

            setActiveTab("chat");
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
    <>
      {/* Cold Start Loader */}
      <ColdStartLoader
        isLoading={characterLoading}
        error={characterError as Error | null}
      />

      <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Page Title - Fixed height */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border shrink-0">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('[App] Return to menu button clicked');
              analytics.buttonClicked('Return to Menu', 'Top Navigation', {
                from_tab: activeTab
              });
              analytics.returnToMenu(activeTab);
              setCurrentView("startMenu");
            }}
            className="text-muted-foreground min-h-[44px]"
            data-testid="button-return-menu"
          >
            <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">Menu</span>
          </Button>
          <h1 className="font-bold text-base sm:text-lg md:text-xl text-primary" data-testid="app-title">
            ✨ STORY MODE
          </h1>
          <div className="min-w-[44px] flex justify-end">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content - Flexible height, accounts for header + nav */}
      <main className="flex-1 overflow-auto px-3 sm:px-4 py-3 sm:py-4 pb-16">
        <div className="h-full">
          {getPageContent()}
        </div>
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
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameApp />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;