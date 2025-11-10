import OpenAI from "openai";
import { storage } from "./storage";
import type { Character, Quest, Item, Message, Enemy, GameState } from "@shared/schema";
import { captureError } from "./sentry";

  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || "sk-placeholder",
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://aitavern.onrender.com", // Your site URL
      "X-Title": "AI Tavern", // Your app name
    }
  });

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
- Create engaging, immersive storylines with rich world-building
- Respond to player actions with appropriate consequences
- Maintain game balance and progression
- Generate dynamic quests and adventures

GAME WORLD:
- Dark fantasy setting with mystery and adventure
- Medieval fantasy with magic, monsters, and intrigue
- Rich, descriptive environments that paint vivid mental pictures
- Diverse NPCs with distinct personalities, motivations, and secrets
- Atmospheric details: weather, sounds, smells, lighting

NARRATIVE STRUCTURE - VERY IMPORTANT:
Every response MUST follow this structure:

1. **World Description (2-3 sentences)**: Paint the scene with sensory details
   - What does the player see, hear, smell?
   - What's the atmosphere and mood?
   - What environmental details stand out?

2. **Story Event/NPC Interaction**: What happens as a result of player's action
   - NPC dialogue (if applicable)
   - Consequences of actions
   - New information revealed

3. **Player Options (ALWAYS INCLUDE)**: Present 2-4 clear choices
   Format as:

   **What do you do?**
   • Option 1: [Clear, specific action]
   • Option 2: [Clear, specific action]
   • Option 3: [Clear, specific action]
   • Option 4: [Optional - creative/risky action]

QUEST INTEGRATION - CRITICAL:
- ALWAYS check if player actions relate to active quests
- Update quest progress when objectives are completed
- Create new quests from significant story events or NPC requests
- Mark quests as completed when all objectives are met
- Generate follow-up quests for completed main story quests
- Track relationships between quests (quest chains)

QUEST PROGRESSION RULES:
When player actions relate to a quest:
1. Identify which active quest(s) are affected
2. Update quest progress appropriately
3. If progress reaches maxProgress, set status to "completed"
4. If quest is failed, set status to "failed"
5. Create follow-up quests when main story quests complete
6. Update quest descriptions if new information is revealed

COMBAT MANAGEMENT:
- Handle turn-based combat with strategic AI enemy behavior
- Calculate damage based on character stats and enemy abilities
- Create dynamic encounters that scale with player level
- End combat when appropriate and award experience/rewards

CHARACTER PROGRESSION:
- Award experience for completing quest objectives
- Award experience for creative problem-solving
- Suggest level-ups when XP thresholds are reached
- Give items as quest rewards or from defeated enemies

Remember: Keep responses engaging but focused. Always give players clear options. Always track quest progress.`;
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
      // Validate API key exists
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY environment variable is not set");
      }
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

RESPONSE REQUIREMENTS:

1. **Narrative Structure**: Follow the 3-part structure (World Description → Event/Interaction → Player Options)

2. **Player Options**: ALWAYS end with bullet-pointed choices like:
   **What do you do?**
   • Option 1: Clear action
   • Option 2: Clear action
   • Option 3: Clear action

3. **Quest Tracking**: Check if this action relates to active quests and update accordingly

Format your response as JSON with this structure:
{
  "content": "Your response following the narrative structure with player options in bullet points",
  "sender": "dm" or "npc",
  "senderName": null for DM, or NPC name if speaking as NPC,
  "actions": {
    // IMPORTANT: Include these when player actions complete quest objectives
    "updateQuest": { "id": "quest-id-from-active-quests", "updates": { "progress": 2, "status": "completed" } },
    "createQuest": { "title": "Quest Title", "description": "Clear objectives with specific steps", "status": "active", "priority": "high|normal|low", "progress": 0, "maxProgress": 3, "reward": "50 XP and Gold Pouch" },
    "updateCharacter": { "updates": { "experience": 50 } }, // Award XP for quest progress
    "updateGameState": { "currentScene": "Descriptive Location Name" },
    "giveItem": { "name": "Item Name", "type": "weapon|armor|consumable|misc", "description": "Item description", "quantity": 1, "rarity": "common|uncommon|rare|epic|legendary", "equipped": false }
  }
}

QUEST TRACKING - CRITICAL:
- Check EVERY player action against active quests
- If action completes a quest objective, increment "progress"
- If progress === maxProgress, set status to "completed"
- Award experience when quests complete
- Create new quests when story events warrant them
- Update quest descriptions if new information is learned

Example Quest Actions:
- Player talks to NPC about quest → update progress +1
- Player finds quest item → update progress +1, giveItem
- Player completes all objectives → progress = maxProgress, status = "completed", award XP
- NPC gives new quest → createQuest with clear objectives`
        }
      ];

      const response = await openai.chat.completions.create({
        model: "anthropic/claude-3.5-haiku",
        messages,
        response_format: { type: "json_object" },
      });

      let aiResponse;
      try {
        const rawContent = response.choices[0].message.content || '{}';
        // Try to parse the JSON, which may contain control characters
        aiResponse = JSON.parse(rawContent);
      } catch (parseError: any) {
        // If JSON parsing fails due to control characters, try to fix it
        console.error('JSON parse error, attempting to sanitize:', parseError.message);
        const rawContent = response.choices[0].message.content || '{}';

        // Remove or escape control characters that break JSON parsing
        // but preserve intended newlines in the content
        const sanitized = rawContent
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control chars except \n, \r, \t
          .replace(/\n/g, '\\n')  // Escape newlines
          .replace(/\r/g, '\\r')  // Escape carriage returns
          .replace(/\t/g, '\\t'); // Escape tabs

        try {
          aiResponse = JSON.parse(sanitized);
        } catch (secondError) {
          // If still failing, return a fallback response
          console.error('Failed to parse AI response even after sanitization:', secondError);
          captureError(new Error(`JSON parse failed: ${parseError.message}`), {
            context: "AI response parsing",
            rawContent: rawContent.substring(0, 500) // Only log first 500 chars
          });

          return {
            content: "The DM pauses, considering your words... (There was an issue with the mystical connection. Please try again.)",
            sender: 'dm',
            senderName: null,
            actions: undefined
          };
        }
      }

      // Validate and sanitize the response
      return {
        content: aiResponse.content || "The DM pauses, considering your words...",
        sender: aiResponse.sender === 'npc' ? 'npc' : 'dm',
        senderName: aiResponse.sender === 'npc' ? aiResponse.senderName : null,
        actions: aiResponse.actions || undefined
      };

    } catch (error: any) {
      captureError(error as Error, { context: "AI response generation" }); console.error('Error generating AI response:', error);
      
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
        model: "anthropic/claude-3.5-haiku",
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
      captureError(error as Error, { context: "Follow-up quest generation" }); console.error('Error generating follow-up quest:', error);
      return null;
    }
  }

  async generateQuestIdeas(playerLevel: number, currentScene: string): Promise<Quest[]> {
    try {
      const context = await this.getGameContext();
      
      const response = await openai.chat.completions.create({
        model: "anthropic/claude-3.5-haiku",
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
      captureError(error as Error, { context: "Quest ideas generation" }); console.error('Error generating quest ideas:', error);
      return [];
    }
  }

  async generateNPCDialogue(npcName: string, context: string, playerMessage: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "anthropic/claude-3.5-haiku",
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
      captureError(error as Error, { context: "NPC dialogue generation" }); console.error('Error generating NPC dialogue:', error);
      return "The NPC seems distracted and doesn't respond.";
    }
  }

  async generateCharacterPortrait(name: string, appearance: string): Promise<string> {
    try {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('Image generation not available');
      }

      // Sanitize input to prevent prompt injection
      const sanitizedName = name.replace(/[^\w\s-]/g, '').trim();
      const sanitizedAppearance = appearance.replace(/[^\w\s.,'-]/g, '').trim();

      if (!sanitizedName || !sanitizedAppearance) {
        throw new Error('Invalid name or appearance description');
      }

      // Create a detailed prompt for character portrait generation
      const prompt = `A high-quality fantasy character portrait of ${sanitizedName}. ${sanitizedAppearance}. Digital art style, detailed fantasy character portrait, professional artwork, dramatic lighting, fantasy RPG character art style.`;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      if (!response.data || response.data.length === 0 || !response.data[0].url) {
        throw new Error('No image generated or invalid response');
      }

      return response.data[0].url;
    } catch (error: any) {
      captureError(error as Error, { context: "Character portrait generation" }); console.error('Error generating character portrait:', error);
      
      // Handle specific error types
      if (error?.status === 429) {
        throw new Error('Image generation rate limit exceeded. Please try again in a few moments.');
      } else if (error?.status === 401) {
        throw new Error('AI service configuration error. Please contact support.');
      } else if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to image generation service. Please check your internet connection.');
      } else if (error.message?.includes('content policy')) {
        throw new Error('Character description violates content policy. Please try a different description.');
      } else {
        throw new Error('Failed to generate character portrait. Please try again.');
      }
    }
  }
}

export const aiService = new TTRPGAIService();