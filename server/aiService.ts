import OpenAI from "openai";
import { storage } from "./storage";
import type { Character, Quest, Item, Message, Enemy, GameState } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AIResponse {
  content: string;
  sender: 'dm' | 'npc';
  senderName: string | null;
  actions?: {
    updateQuest?: { id: string; updates: Partial<Quest> };
    createQuest?: Omit<Quest, 'id'>;
    updateCharacter?: { updates: Partial<Character> };
    updateGameState?: Partial<GameState>;
    giveItem?: Omit<Item, 'id'>;
    updateEnemy?: { id: string; updates: Partial<Enemy> };
    createEnemies?: Array<Omit<Enemy, 'id'>>;
    startCombat?: { enemies: Array<Omit<Enemy, 'id'>>; scene: string };
    endCombat?: { victory: boolean; rewards?: string };
  };
}

export class TTRPGAIService {
  private getSystemPrompt(): string {
    return `You are an experienced Dungeon Master running an immersive D&D-style fantasy TTRPG. 

CORE ROLE:
- Act as both the DM and all NPCs the player encounters
- Create engaging, immersive storylines with rich descriptions
- Respond to player actions with appropriate consequences
- Maintain game balance and progression
- Generate dynamic quests and adventures

GAME WORLD:
- Dark fantasy setting with mystery and adventure
- Medieval fantasy with magic, monsters, and intrigue
- Player starts in a village but can explore dungeons, forests, cities
- Rich NPCs with distinct personalities and motivations

INTERACTION STYLE:
- Use vivid, atmospheric descriptions
- Make NPCs feel alive with unique speech patterns
- Present choices and consequences naturally
- Ask for dice rolls when appropriate for D&D mechanics
- Balance success and failure to maintain tension

COMBAT MANAGEMENT:
- Handle turn-based combat with strategic AI enemy behavior
- Calculate damage based on character stats and enemy abilities
- Manage combat flow: initiative, turns, victory/defeat conditions
- Create dynamic encounters that scale with player level
- End combat when appropriate and award experience/rewards

QUEST MANAGEMENT:
- Generate dynamic quests based on player actions, choices, and story progression
- Create interconnected quest chains with branching narratives
- Update quest progress as the player completes objectives
- Automatically spawn follow-up quests when main objectives are completed
- Create side quests that tie into the main storyline
- Ensure quests have clear objectives and meaningful rewards
- Track quest relationships and dependencies

CHARACTER PROGRESSION:
- Award experience for completing quests and overcoming challenges
- Suggest level-ups when appropriate
- Help manage inventory and equipment upgrades
- Track character development and relationships

Remember to respond as the character or DM that makes most sense for the context. Keep responses engaging but concise for mobile play.`;
  }

  private async getGameContext(): Promise<{
    character: Character | undefined;
    quests: Quest[];
    items: Item[];
    recentMessages: Message[];
    gameState: GameState | undefined;
  }> {
    const [character, quests, items, recentMessages, gameState] = await Promise.all([
      storage.getCharacter(),
      storage.getQuests(),
      storage.getItems(),
      storage.getRecentMessages(10),
      storage.getGameState(),
    ]);

    return { character, quests, items, recentMessages, gameState };
  }

  private createContextPrompt(
    context: {
      character: Character | undefined;
      quests: Quest[];
      items: Item[];
      recentMessages: Message[];
      gameState: GameState | undefined;
    }
  ): string {
    const { character, quests, items, recentMessages, gameState } = context;

    let prompt = "CURRENT GAME STATE:\\n\\n";

    // Character info
    if (character) {
      prompt += `CHARACTER: ${character.name}, Level ${character.level} ${character.class}\\n`;
      prompt += `HP: ${character.currentHealth}/${character.maxHealth}, Mana: ${character.currentMana}/${character.maxMana}\\n`;
      prompt += `Stats: STR ${character.strength}, DEX ${character.dexterity}, CON ${character.constitution}, INT ${character.intelligence}, WIS ${character.wisdom}, CHA ${character.charisma}\\n\\n`;
    }

    // Active quests
    const activeQuests = quests.filter(q => q.status === 'active');
    if (activeQuests.length > 0) {
      prompt += "ACTIVE QUESTS:\\n";
      activeQuests.forEach(quest => {
        prompt += `- ${quest.title}: ${quest.description} (${quest.progress}/${quest.maxProgress})\\n`;
      });
      prompt += "\\n";
    }

    // Equipped items
    const equippedItems = items.filter(item => item.equipped);
    if (equippedItems.length > 0) {
      prompt += "EQUIPPED: " + equippedItems.map(item => item.name).join(', ') + "\\n\\n";
    }

    // Game state
    if (gameState) {
      prompt += `SCENE: ${gameState.currentScene}\\n`;
      if (gameState.inCombat) {
        prompt += `IN COMBAT - Turn: ${gameState.currentTurn}\\n`;
      }
      prompt += "\\n";
    }

    // Recent conversation for context
    if (recentMessages.length > 0) {
      prompt += "RECENT CONVERSATION:\\n";
      recentMessages.slice(-5).forEach(msg => {
        const speaker = msg.sender === 'dm' ? 'DM' : msg.sender === 'npc' ? (msg.senderName || 'NPC') : 'Player';
        prompt += `${speaker}: ${msg.content}\\n`;
      });
      prompt += "\\n";
    }

    // Quest relationship analysis
    if (activeQuests.length > 1) {
      prompt += "QUEST DYNAMICS: Consider how current quests might interconnect or influence each other.\\n\\n";
    }

    return prompt;
  }

  async generateResponse(playerMessage: string): Promise<AIResponse> {
    try {
      // Get current game context
      const context = await this.getGameContext();
      const contextPrompt = this.createContextPrompt(context);

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: this.getSystemPrompt()
        },
        {
          role: "user", 
          content: `${contextPrompt}

PLAYER ACTION: ${playerMessage}

Please respond as the DM or appropriate NPC. Provide an engaging response that:
1. Acknowledges the player's action
2. Describes what happens as a result
3. Advances the story appropriately
4. Maintains immersion and atmosphere

Format your response as JSON with this structure:
{
  "content": "Your response as DM/NPC",
  "sender": "dm" or "npc",
  "senderName": null for DM, or NPC name if speaking as NPC,
  "actions": {
    // Optional game state updates based on the interaction
    "updateQuest": { "id": "quest-id", "updates": { "progress": 2, "status": "completed" } },
    "createQuest": { "title": "Quest Title", "description": "Clear objectives", "status": "active", "priority": "high|normal|low", "progress": 0, "maxProgress": 3, "reward": "Experience/items/gold" },
    "updateCharacter": { "updates": { "currentHealth": 45, "experience": 150, "level": 2 } },
    "updateGameState": { "currentScene": "Location Name", "inCombat": false, "timeOfDay": "morning", "weather": "clear" },
    "giveItem": { "name": "Item Name", "type": "weapon|armor|consumable|misc", "description": "Item description", "quantity": 1, "rarity": "common|uncommon|rare|epic|legendary", "equipped": false }
  }
}

Only include actions that are warranted by the story progression. Most responses won't need any actions.

QUEST PROGRESSION RULES:
- When a quest reaches maxProgress, automatically set status to "completed" 
- Generate follow-up quests for completed main story objectives
- Create branching paths based on player choices and actions
- Ensure quest rewards match difficulty and player level`
        }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages,
        response_format: { type: "json_object" },
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{}');
      
      // Validate and sanitize the response
      return {
        content: aiResponse.content || "The DM pauses, considering your words...",
        sender: aiResponse.sender === 'npc' ? 'npc' : 'dm',
        senderName: aiResponse.sender === 'npc' ? aiResponse.senderName : null,
        actions: aiResponse.actions || undefined
      };

    } catch (error: any) {
      console.error('Error generating AI response:', error);
      
      // Enhanced error handling based on error type
      let fallbackContent = "";
      let shouldRetry = false;
      
      if (error?.status === 429) {
        // Rate limit exceeded
        fallbackContent = "The magical energies are overwhelmed at the moment. Let me provide guidance based on your current situation...";
      } else if (error?.status === 401) {
        // API key issue
        fallbackContent = "The connection to the mystical realm is blocked. I'll guide you using my earthly knowledge...";
      } else if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
        // Network issues
        fallbackContent = "The ethereal connection wavers... Let me consult the ancient texts...";
        shouldRetry = true;
      } else {
        // Generic error
        fallbackContent = "The DM senses disturbance in the magical weave but continues the adventure...";
      }
      
      // Provide contextual fallback based on player message
      const contextualResponse = this.generateFallbackResponse(playerMessage, fallbackContent);
      
      return contextualResponse;
    }
  }

  private generateFallbackResponse(playerMessage: string, errorMessage: string): AIResponse {
    const lowerMessage = playerMessage.toLowerCase();
    
    // Analyze the player's message to provide contextual responses
    if (lowerMessage.includes('attack') || lowerMessage.includes('fight') || lowerMessage.includes('combat')) {
      return {
        content: `${errorMessage} Your aggressive stance is noted. You prepare for combat, weapon at the ready.`,
        sender: 'dm',
        senderName: null,
        actions: {
          updateGameState: { inCombat: true }
        }
      };
    } else if (lowerMessage.includes('explore') || lowerMessage.includes('look') || lowerMessage.includes('search')) {
      return {
        content: `${errorMessage} You carefully examine your surroundings, taking note of every detail.`,
        sender: 'dm',
        senderName: null
      };
    } else if (lowerMessage.includes('talk') || lowerMessage.includes('speak') || lowerMessage.includes('conversation')) {
      return {
        content: `${errorMessage} The NPCs around you seem ready to engage in conversation.`,
        sender: 'dm',
        senderName: null
      };
    } else if (lowerMessage.includes('quest') || lowerMessage.includes('mission') || lowerMessage.includes('task')) {
      return {
        content: `${errorMessage} Your journal reminds you of your current objectives and the path ahead.`,
        sender: 'dm',
        senderName: null
      };
    } else if (lowerMessage.includes('rest') || lowerMessage.includes('sleep') || lowerMessage.includes('heal')) {
      return {
        content: `${errorMessage} You take a moment to rest and recover your strength.`,
        sender: 'dm',
        senderName: null
      };
    } else {
      // Generic helpful response
      return {
        content: `${errorMessage} The adventure continues. What would you like to do next? You can explore, talk to NPCs, check your quests, or engage in combat.`,
        sender: 'dm',
        senderName: null
      };
    }
  }

  async generateFollowUpQuest(completedQuest: Quest, context: {
    character: Character | undefined;
    gameState: GameState | undefined;
  }): Promise<Quest | null> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a D&D Dungeon Master creating follow-up quests that continue story arcs."
          },
          {
            role: "user",
            content: `The player just completed: "${completedQuest.title}"
            Description: ${completedQuest.description}
            
            Player Level: ${context.character?.level || 1}
            Current Scene: ${context.gameState?.currentScene || "Unknown"}
            
            Create a natural follow-up quest that continues this storyline. Format as JSON:
            {
              "title": "Quest Title",
              "description": "Engaging description that builds on the completed quest",
              "status": "active",
              "priority": "normal",
              "progress": 0,
              "maxProgress": 3,
              "reward": "Appropriate reward"
            }`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.title ? result : null;
      
    } catch (error) {
      console.error('Error generating follow-up quest:', error);
      return null;
    }
  }

  async generateQuestIdeas(playerLevel: number, currentScene: string): Promise<Quest[]> {
    try {
      const context = await this.getGameContext();
      
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a D&D Dungeon Master creating engaging quests for a player."
          },
          {
            role: "user",
            content: `Create 2-3 quest ideas for a level ${playerLevel} character in ${currentScene}. 
            
Format as JSON array:
[
  {
    "title": "Quest Title",
    "description": "Engaging quest description with clear objectives",
    "status": "active",
    "priority": "normal",
    "progress": 0,
    "maxProgress": 3,
    "reward": "Appropriate reward for level"
  }
]

Make quests appropriate for the character level and current location.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '[]');
      return Array.isArray(result.quests) ? result.quests : [];
      
    } catch (error) {
      console.error('Error generating quest ideas:', error);
      return [];
    }
  }

  async generateNPCDialogue(npcName: string, context: string, playerMessage: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are ${npcName}, an NPC in a D&D fantasy world. Stay in character and respond naturally to the player.`
          },
          {
            role: "user",
            content: `Context: ${context}

Player says: "${playerMessage}"

Respond as ${npcName} would, staying true to their character and the situation.`
          }
        ]
      });

      return response.choices[0].message.content || "...";
      
    } catch (error) {
      console.error('Error generating NPC dialogue:', error);
      return "The NPC seems distracted and doesn't respond.";
    }
  }
}

export const aiService = new TTRPGAIService();