import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

// Components
import NavigationTabs from "./components/NavigationTabs";
import CharacterSheet from "./components/CharacterSheet";
import QuestLog from "./components/QuestLog";
import Inventory from "./components/Inventory";
import ChatInterface from "./components/ChatInterface";
import CombatInterface from "./components/CombatInterface";

// Types
import type { Character, Quest, Item, Message } from "@shared/schema";

type TabType = "character" | "quests" | "inventory" | "chat";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("character");
  const [isListening, setIsListening] = useState(false);
  const [isInCombat, setIsInCombat] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<"player" | "enemy">("player");
  
  // todo: remove mock functionality - Mock Data
  const [character] = useState<Character>({
    id: '1',
    name: 'Elara Nightwhisper',
    class: 'Rogue',
    level: 7,
    experience: 4250,
    strength: 14,
    dexterity: 18,
    constitution: 15,
    intelligence: 16,
    wisdom: 13,
    charisma: 17,
    currentHealth: 52,
    maxHealth: 68,
    currentMana: 25,
    maxMana: 40
  });
  
  const [quests] = useState<Quest[]>([
    {
      id: '1',
      title: 'The Crimson Crown',
      description: 'Infiltrate the vampire lord\'s castle and retrieve the stolen crown before the blood moon rises.',
      status: 'active',
      priority: 'urgent',
      progress: 3,
      maxProgress: 7,
      reward: '1500 gold, Cloak of Shadows'
    },
    {
      id: '2',
      title: 'Merchant\'s Dilemma',
      description: 'Help the traveling merchant recover his stolen goods from bandits.',
      status: 'active',
      priority: 'normal',
      progress: 1,
      maxProgress: 3,
      reward: '300 gold, Discount at shops'
    },
    {
      id: '3',
      title: 'Ancient Secrets',
      description: 'Decipher the runes in the old library to unlock magical knowledge.',
      status: 'completed',
      priority: 'low',
      progress: 5,
      maxProgress: 5,
      reward: 'Spell Scroll: Fireball'
    },
    {
      id: '4',
      title: 'Failed Heist',
      description: 'The jewel was heavily guarded. Perhaps another approach is needed.',
      status: 'failed',
      priority: 'high',
      progress: 2,
      maxProgress: 4,
      reward: null
    }
  ]);
  
  const [items] = useState<Item[]>([
    {
      id: '1',
      name: 'Shadowstrike Dagger',
      type: 'weapon',
      description: 'A deadly blade that seems to absorb light. Critical hits have a chance to poison.',
      quantity: 1,
      rarity: 'epic',
      equipped: true
    },
    {
      id: '2',
      name: 'Leather Armor of Stealth',
      type: 'armor',
      description: 'Well-crafted leather that muffles sound and provides excellent protection.',
      quantity: 1,
      rarity: 'rare',
      equipped: true
    },
    {
      id: '3',
      name: 'Superior Health Potion',
      type: 'consumable',
      description: 'A potent red liquid that restores 50 HP instantly.',
      quantity: 4,
      rarity: 'uncommon',
      equipped: false
    },
    {
      id: '4',
      name: 'Mana Potion',
      type: 'consumable',
      description: 'Blue liquid that restores 25 mana points.',
      quantity: 2,
      rarity: 'common',
      equipped: false
    },
    {
      id: '5',
      name: 'Thieves\' Tools',
      type: 'misc',
      description: 'Professional lockpicking and trap disarming kit.',
      quantity: 1,
      rarity: 'rare',
      equipped: false
    },
    {
      id: '6',
      name: 'Ancient Map Fragment',
      type: 'misc',
      description: 'Part of an old treasure map with mysterious markings.',
      quantity: 1,
      rarity: 'legendary',
      equipped: false
    }
  ]);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'The moonlight filters through the ancient castle windows as you step into the grand hall. Dust motes dance in the pale light, and you can hear the distant sound of dripping water echoing through the corridors.',
      sender: 'dm',
      senderName: null,
      timestamp: '8:45 PM'
    },
    {
      id: '2',
      content: 'I move quietly along the wall, staying in the shadows and listening for any signs of guards.',
      sender: 'player',
      senderName: null,
      timestamp: '8:46 PM'
    },
    {
      id: '3',
      content: 'You hear heavy footsteps approaching from the east corridor. A armored guard carrying a torch is making his rounds.',
      sender: 'dm',
      senderName: null,
      timestamp: '8:47 PM'
    },
    {
      id: '4',
      content: 'Halt! Who goes there? Show yourself, intruder!',
      sender: 'npc',
      senderName: 'Castle Guard',
      timestamp: '8:48 PM'
    }
  ]);
  
  const mockEnemies = [
    {
      id: '1',
      name: 'Vampire Thrall',
      currentHealth: 18,
      maxHealth: 30,
      level: 5
    },
    {
      id: '2',
      name: 'Blood Bat Swarm',
      currentHealth: 8,
      maxHealth: 15,
      level: 3
    }
  ];
  
  // Event Handlers
  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'player',
      senderName: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    
    // todo: remove mock functionality - Simulate AI DM response
    setTimeout(() => {
      const dmResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `The DM considers your action: "${content}". Roll for initiative...`,
        sender: 'dm',
        senderName: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, dmResponse]);
    }, 1500);
  };
  
  const handleQuickAction = (action: string) => {
    let actionText = '';
    switch (action) {
      case 'attack':
        actionText = 'I ready my weapon and prepare to attack!';
        setIsInCombat(true);
        break;
      case 'investigate':
        actionText = 'I carefully examine my surroundings for clues.';
        break;
      case 'talk':
        actionText = 'I attempt to communicate peacefully.';
        break;
      default:
        actionText = `I perform the ${action} action.`;
    }
    handleSendMessage(actionText);
  };
  
  const handleToggleListening = () => {
    setIsListening(!isListening);
    // todo: remove mock functionality - Simulate speech recognition
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        handleSendMessage("I search for hidden passages behind the tapestries.");
      }, 3000);
    }
  };
  
  const handleCombatAction = {
    attack: (targetId: string) => {
      console.log('Attacking enemy:', targetId);
      // todo: remove mock functionality - Combat logic here
    },
    defend: () => {
      console.log('Player defends');
      setCurrentTurn('enemy');
      setTimeout(() => setCurrentTurn('player'), 2000);
    },
    spell: (spellId: string) => {
      console.log('Casting spell:', spellId);
    },
    item: (itemId: string) => {
      console.log('Using item:', itemId);
    },
    flee: () => {
      setIsInCombat(false);
      handleSendMessage('I attempt to flee from combat!');
    }
  };
  
  const handleItemAction = (item: Item) => {
    if (item.type === 'consumable') {
      handleSendMessage(`I use ${item.name}.`);
    } else {
      console.log('Item equipped/unequipped:', item.name);
    }
  };
  
  const handleQuestAction = (quest: Quest) => {
    console.log('Quest selected:', quest.title);
  };
  
  // Active quest count for navigation badge
  const activeQuestCount = quests.filter(q => q.status === 'active').length;
  
  // Get page content based on active tab
  const getPageContent = () => {
    switch (activeTab) {
      case 'character':
        return <CharacterSheet character={character} className="pb-20" />;
      case 'quests':
        return (
          <QuestLog 
            quests={quests} 
            onQuestClick={handleQuestAction}
            className="pb-20" 
          />
        );
      case 'inventory':
        return (
          <Inventory 
            items={items}
            onItemTap={handleItemAction}
            onItemLongPress={(item) => console.log('Item details:', item)}
            className="pb-20"
          />
        );
      case 'chat':
        return (
          <ChatInterface 
            messages={messages}
            onSendMessage={handleSendMessage}
            onQuickAction={handleQuickAction}
            isListening={isListening}
            onToggleListening={handleToggleListening}
            className="pb-20"
          />
        );
      default:
        return null;
    }
  };
  
  // Set dark mode by default for fantasy feel
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          {/* Page Title */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
            <div className="flex items-center justify-center h-16 px-4">
              <h1 className="font-serif text-xl text-primary" data-testid="app-title">
                ⚔️ AI Dungeon Master
              </h1>
            </div>
          </div>
          
          {/* Main Content */}
          <main className="px-4 py-6">
            {getPageContent()}
          </main>
          
          {/* Bottom Navigation */}
          <NavigationTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            questCount={activeQuestCount}
            itemCount={items.length}
            unreadMessages={0}
          />
          
          {/* Combat Overlay */}
          <CombatInterface 
            isInCombat={isInCombat}
            currentTurn={currentTurn}
            enemies={mockEnemies}
            onAttack={handleCombatAction.attack}
            onDefend={handleCombatAction.defend}
            onCastSpell={handleCombatAction.spell}
            onUseItem={handleCombatAction.item}
            onFlee={handleCombatAction.flee}
          />
        </div>
        
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
