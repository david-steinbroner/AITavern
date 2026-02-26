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
  error?: 'parse_failure' | 'api_error' | 'network_error'; // Error flag for tracking
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
  private getSystemPrompt(gameState?: GameState): string {
    // Use custom world if generated from character, otherwise use default fantasy
    const worldSetting = gameState?.worldSetting || "a classic dark fantasy realm";
    const worldTheme = gameState?.worldTheme || "Dark fantasy with mystery and adventure";
    const worldDescription = gameState?.worldDescription || "A medieval fantasy world with magic, monsters, and intrigue where heroes forge their own legends";

    return `You are an experienced Narrator running an immersive story-driven TTRPG.

CORE ROLE:
- Act as both the Narrator and all characters the player encounters
- Create engaging, immersive storylines with rich world-building
- Respond to player actions with appropriate consequences
- Maintain game balance and progression
- Generate dynamic quests and adventures

GAME WORLD:
${worldDescription}

WORLD THEME: ${worldTheme}
SETTING: ${worldSetting}

IMPORTANT: Stay true to this world's unique vibe and tone in ALL responses. Every NPC, location, quest, and item should feel authentic to this setting.

NARRATIVE GUIDELINES:
- Rich, descriptive environments that paint vivid mental pictures
- Diverse characters with distinct personalities, motivations, and secrets
- Atmospheric details: weather, sounds, smells, lighting - all matching the world's theme

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

QUEST TRACKING PROTOCOL - MANDATORY:
YOU MUST check EVERY SINGLE player action against ALL active quests. This is NON-NEGOTIABLE.

Before EVERY response:
1. Review ALL active quests (even if they seem unrelated)
2. Be GENEROUS with progress - if action is remotely related, give credit
3. Don't require exact matches - interpret player intent
4. If a quest is stuck at 0 progress for 3+ player actions, advance it anyway

QUEST PROGRESSION RULES (ENFORCED):
For EVERY player action that relates to ANY quest:
1. MUST include updateQuest in actions object
2. Increment progress by 1 (or more if major milestone)
3. If progress >= maxProgress, set status to "completed"
4. Award experience when updating progress
5. Generate follow-up quests when main story quests complete
6. Update quest descriptions if new information is revealed

ANTI-STUCK RULE:
If you notice a quest has been at the same progress for multiple turns, FORCE progress.
Better to advance too generously than leave players feeling stuck.

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

  private async getGameContext(sessionId: string): Promise<{
    character: Character | undefined;
    quests: Quest[];
    items: Item[];
    recentMessages: Message[];
    gameState: GameState | undefined;
  }> {
    const [character, quests, items, recentMessages, gameState] = await Promise.all([
      storage.getCharacter(sessionId),
      storage.getQuests(sessionId),
      storage.getItems(sessionId),
      storage.getRecentMessages(sessionId, 10),
      storage.getGameState(sessionId),
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

    // World context
    if (gameState?.worldSetting) {
      prompt += `WORLD: ${gameState.worldSetting}\\n`;
      prompt += `THEME: ${gameState.worldTheme}\\n\\n`;
    }

    // Character info with narrative context
    if (character) {
      prompt += `CHARACTER: ${character.name}, Level ${character.level} ${character.class}\\n`;
      if (character.appearance) {
        prompt += `Description: ${character.appearance}\\n`;
      }
      if (character.backstory) {
        prompt += `Backstory: ${character.backstory}\\n`;
      }
      prompt += `HP: ${character.currentHealth}/${character.maxHealth}, Mana: ${character.currentMana}/${character.maxMana}\\n`;
      prompt += `Stats: STR ${character.strength}, DEX ${character.dexterity}, CON ${character.constitution}, INT ${character.intelligence}, WIS ${character.wisdom}, CHA ${character.charisma}\\n\\n`;
    }

    // Active quests with advancement hints
    const activeQuests = quests.filter(q => q.status === 'active');
    if (activeQuests.length > 0) {
      prompt += "ACTIVE QUESTS (CHECK EVERY ACTION AGAINST THESE):\\n";
      activeQuests.forEach(quest => {
        prompt += `- ${quest.title}: ${quest.description} (${quest.progress}/${quest.maxProgress})\\n`;

        // Add advancement hints
        if (quest.progress === 0) {
          prompt += `  ⚠️ WARNING: Quest stuck at 0 progress - be EXTRA generous with advancement\\n`;
        }

        // Provide contextual hints based on quest type and progress
        if (quest.isMainStory) {
          prompt += `  📌 MAIN QUEST: Prioritize progress - any story action likely advances this\\n`;
        }

        // Suggest what kinds of actions might advance this quest
        if (quest.description.toLowerCase().includes('find') || quest.description.toLowerCase().includes('search')) {
          prompt += `  💡 HINT: Investigating, searching, talking to NPCs should advance this\\n`;
        } else if (quest.description.toLowerCase().includes('talk') || quest.description.toLowerCase().includes('speak')) {
          prompt += `  💡 HINT: Any conversation or dialogue should advance this\\n`;
        } else if (quest.description.toLowerCase().includes('defeat') || quest.description.toLowerCase().includes('kill')) {
          prompt += `  💡 HINT: Combat actions should advance this\\n`;
        } else {
          prompt += `  💡 HINT: Be creative - many player actions can reasonably advance this\\n`;
        }
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

  async generateResponse(sessionId: string, playerMessage: string): Promise<AIResponse> {
    const startTime = Date.now();
    console.log('[AI Service] Starting AI response generation', {
      sessionId,
      playerMessage: playerMessage.substring(0, 100),
      timestamp: new Date().toISOString()
    });

    try {
      // Validate API key exists
      if (!process.env.OPENROUTER_API_KEY) {
        const error = new Error("OPENROUTER_API_KEY environment variable is not set");
        console.error('[AI Service] API key missing', { error: error.message });
        captureError(error, { context: "AI service initialization - missing API key" });
        throw error;
      }

      // Get current game context
      console.log('[AI Service] Fetching game context');
      const context = await this.getGameContext(sessionId);
      console.log('[AI Service] Game context retrieved', {
        hasCharacter: !!context.character,
        questCount: context.quests.length,
        itemCount: context.items.length,
        messageCount: context.recentMessages.length
      });

      // Log recent message chain for debugging conversation flow
      console.log('[AI Service] === MESSAGE HISTORY ===');
      context.recentMessages.forEach((msg, idx) => {
        console.log(`[${idx + 1}/${context.recentMessages.length}] ${msg.sender} (ID: ${msg.id}): ${msg.content.substring(0, 100)}...`);
      });
      console.log('[AI Service] === END MESSAGE HISTORY ===');

      const contextPrompt = this.createContextPrompt(context);

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: this.getSystemPrompt(context.gameState)
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

4. **JSON Formatting**: You MUST return valid JSON. In the "content" field:
   - Use \\n for line breaks (not raw newlines)
   - Use \\t for tabs (not raw tab characters)
   - Escape all special characters properly
   - Do NOT include raw control characters

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

QUEST DESCRIPTION GUIDELINES (IMPORTANT):
When creating new quests:
- START VAGUE: "Investigate the disappearances" NOT "Talk to elder, search forest, find clues"
- Let player DISCOVER how to progress through experimentation
- Update description as quest advances to reflect new information
- Don't pre-reveal all steps - maintain mystery and discovery
- Focus on WHAT needs doing, not HOW to do it

Example Quest Actions:
- Player talks to NPC about quest → update progress +1
- Player finds quest item → update progress +1, giveItem
- Player completes all objectives → progress = maxProgress, status = "completed", award XP
- NPC gives new quest → createQuest with vague, discovery-focused description`
        }
      ];

      console.log('[AI Service] Calling OpenRouter API', {
        model: "anthropic/claude-3.5-haiku",
        systemPromptLength: this.getSystemPrompt(context.gameState).length,
        userPromptLength: messages[1].content?.toString().length || 0
      });

      // Log full prompts for debugging (truncated for readability)
      console.log('[AI Service] === RAW PROMPT (System) ===');
      console.log(this.getSystemPrompt(context.gameState).substring(0, 500) + '...');
      console.log('[AI Service] === RAW PROMPT (User) ===');
      console.log(messages[1].content?.toString().substring(0, 1000) + '...');
      console.log('[AI Service] === END RAW PROMPTS ===');

      const response = await openai.chat.completions.create({
        model: "anthropic/claude-3.5-haiku",
        messages,
        response_format: { type: "json_object" },
      });

      const apiDuration = Date.now() - startTime;
      console.log('[AI Service] API response received', {
        durationMs: apiDuration,
        hasChoices: !!response.choices,
        choicesLength: response.choices?.length || 0,
        finishReason: response.choices?.[0]?.finish_reason,
        usage: response.usage
      });

      // Validate response structure
      if (!response.choices || response.choices.length === 0) {
        const error = new Error('OpenRouter API returned no choices');
        console.error('[AI Service] Invalid API response structure', {
          response: JSON.stringify(response).substring(0, 500)
        });
        captureError(error, {
          context: "AI API response validation",
          responseStructure: {
            hasChoices: !!response.choices,
            choicesLength: response.choices?.length || 0
          }
        });
        throw error;
      }

      if (!response.choices[0].message) {
        const error = new Error('OpenRouter API choice has no message');
        console.error('[AI Service] Invalid API choice structure', {
          choice: JSON.stringify(response.choices[0]).substring(0, 500)
        });
        captureError(error, {
          context: "AI API choice validation",
          finishReason: response.choices[0]?.finish_reason
        });
        throw error;
      }

      let aiResponse;
      try {
        const rawContent = response.choices[0].message.content || '{}';
        console.log('[AI Service] Parsing JSON response', {
          contentLength: rawContent.length,
          contentPreview: rawContent.substring(0, 200)
        });

        // Log full raw response for debugging
        console.log('[AI Service] === RAW AI RESPONSE ===');
        console.log(rawContent);
        console.log('[AI Service] === END RAW RESPONSE ===');

        // Try to parse the JSON, which may contain control characters
        aiResponse = JSON.parse(rawContent);
        console.log('[AI Service] JSON parsed successfully', {
          hasSender: !!aiResponse.sender,
          hasContent: !!aiResponse.content,
          contentLength: aiResponse.content?.length || 0,
          hasActions: !!aiResponse.actions
        });
      } catch (parseError: any) {
        // If JSON parsing fails due to control characters, try to fix it
        console.error('[AI Service] JSON parse error, attempting to sanitize', {
          error: parseError.message,
          position: parseError.message.match(/position (\d+)/)?.[1]
        });
        const rawContent = response.choices[0].message.content || '{}';

        // Sanitize JSON by properly escaping string content
        // Strategy: Find string values and escape special characters within them
        let sanitized = rawContent;

        // First, remove any truly invalid control characters (not \n, \r, \t)
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

        // Fix unescaped newlines, carriage returns, and tabs within JSON strings
        // This regex finds strings and escapes special chars within them
        sanitized = sanitized.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
          return match
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
        });

        try {
          aiResponse = JSON.parse(sanitized);
          console.log('[AI Service] JSON parsed successfully after sanitization');
        } catch (secondError: any) {
          // If still failing, log the problematic content and return a fallback response
          console.error('[AI Service] Failed to parse AI response even after sanitization', {
            originalError: parseError.message,
            sanitizationError: secondError.message,
            rawContentPreview: rawContent.substring(0, 500),
            sanitizedContentPreview: sanitized.substring(0, 500)
          });

          const parseFailureError = new Error(`JSON parse failed: ${parseError.message}`);
          captureError(parseFailureError, {
            context: "AI response parsing - sanitization failed",
            rawContent: rawContent.substring(0, 500),
            sanitizedContent: sanitized.substring(0, 500),
            originalError: parseError.message,
            secondError: secondError.message
          });

          console.error('[AI Service] ⚠️ RETURNING FALLBACK RESPONSE DUE TO PARSE FAILURE');

          return {
            content: "The narrator pauses, gathering their thoughts... (There was an issue processing the response. Please try again.)",
            sender: 'dm',
            senderName: null,
            actions: undefined,
            error: 'parse_failure' // Flag for frontend to detect this is an error
          };
        }
      }

      // Validate and sanitize the response
      const finalResponse = {
        content: aiResponse.content || "The DM pauses, considering your words...",
        sender: aiResponse.sender === 'npc' ? 'npc' : 'dm',
        senderName: aiResponse.sender === 'npc' ? aiResponse.senderName : null,
        actions: aiResponse.actions || undefined
      };

      const totalDuration = Date.now() - startTime;
      console.log('[AI Service] Response generation complete', {
        totalDurationMs: totalDuration,
        responseLength: finalResponse.content.length,
        sender: finalResponse.sender,
        hasActions: !!finalResponse.actions
      });

      return finalResponse;

    } catch (error: any) {
      const totalDuration = Date.now() - startTime;
      console.error('[AI Service] Error generating AI response', {
        error: error.message,
        errorType: error.constructor.name,
        status: error.status,
        code: error.code,
        durationMs: totalDuration,
        stack: error.stack?.split('\n').slice(0, 5).join('\n')
      });

      captureError(error as Error, {
        context: "AI response generation - outer catch",
        errorDetails: {
          message: error.message,
          type: error.constructor.name,
          status: error.status,
          code: error.code,
          durationMs: totalDuration
        }
      });
      
      // Enhanced error handling based on error type
      let fallbackContent = "";
      let errorType: 'api_error' | 'network_error' = 'api_error';

      if (error?.status === 429) {
        // Rate limit exceeded
        fallbackContent = "The magical energies are overwhelmed at the moment. Let me provide guidance based on your current situation...";
        errorType = 'api_error';
      } else if (error?.status === 401) {
        // API key issue
        fallbackContent = "The connection to the mystical realm is blocked. I'll guide you using my earthly knowledge...";
        errorType = 'api_error';
      } else if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
        // Network issues
        fallbackContent = "The ethereal connection wavers... Let me consult the ancient texts...";
        errorType = 'network_error';
      } else {
        // Generic error
        fallbackContent = "The DM senses disturbance in the magical weave but continues the adventure...";
        errorType = 'api_error';
      }

      console.error('[AI Service] ⚠️ RETURNING FALLBACK RESPONSE DUE TO ERROR:', errorType);

      // Provide contextual fallback based on player message
      const contextualResponse = this.generateFallbackResponse(playerMessage, fallbackContent, errorType);

      return contextualResponse;
    }
  }

  private generateFallbackResponse(playerMessage: string, errorMessage: string, errorType: 'api_error' | 'network_error' | 'parse_failure'): AIResponse {
    const lowerMessage = playerMessage.toLowerCase();

    // Analyze the player's message to provide contextual responses
    if (lowerMessage.includes('attack') || lowerMessage.includes('fight') || lowerMessage.includes('combat')) {
      return {
        content: `${errorMessage} Your aggressive stance is noted. You prepare for combat, weapon at the ready.`,
        sender: 'dm',
        senderName: null,
        error: errorType,
        actions: {
          updateGameState: { inCombat: true }
        }
      };
    } else if (lowerMessage.includes('explore') || lowerMessage.includes('look') || lowerMessage.includes('search')) {
      return {
        content: `${errorMessage} You carefully examine your surroundings, taking note of every detail.`,
        sender: 'dm',
        senderName: null,
        error: errorType
      };
    } else if (lowerMessage.includes('talk') || lowerMessage.includes('speak') || lowerMessage.includes('conversation')) {
      return {
        content: `${errorMessage} The NPCs around you seem ready to engage in conversation.`,
        sender: 'dm',
        senderName: null,
        error: errorType
      };
    } else if (lowerMessage.includes('quest') || lowerMessage.includes('mission') || lowerMessage.includes('task')) {
      return {
        content: `${errorMessage} Your journal reminds you of your current objectives and the path ahead.`,
        sender: 'dm',
        senderName: null,
        error: errorType
      };
    } else if (lowerMessage.includes('rest') || lowerMessage.includes('sleep') || lowerMessage.includes('heal')) {
      return {
        content: `${errorMessage} You take a moment to rest and recover your strength.`,
        sender: 'dm',
        senderName: null,
        error: errorType
      };
    } else {
      // Generic helpful response
      return {
        content: `${errorMessage} The adventure continues. What would you like to do next? You can explore, talk to NPCs, check your quests, or engage in combat.`,
        sender: 'dm',
        senderName: null,
        error: errorType
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

  async detectSideQuestOpportunity(
    playerMessage: string,
    context: {
      character: Character | undefined;
      quests: Quest[];
      recentMessages: Message[];
      gameState: GameState | undefined;
    }
  ): Promise<boolean> {
    try {
      // Quick heuristic checks before making AI call to save costs
      const lowerMessage = playerMessage.toLowerCase();

      // Check for NPC interaction keywords
      const npcInteractionKeywords = ['talk', 'speak', 'ask', 'tell', 'greet', 'conversation', 'chat'];
      const hasNPCInteraction = npcInteractionKeywords.some(keyword => lowerMessage.includes(keyword));

      // Check for discovery/investigation keywords
      const discoveryKeywords = ['search', 'investigate', 'examine', 'look', 'find', 'discover', 'explore'];
      const hasDiscovery = discoveryKeywords.some(keyword => lowerMessage.includes(keyword));

      // Check for interesting story hooks
      const storyHookKeywords = ['help', 'problem', 'trouble', 'mission', 'task', 'favor', 'need'];
      const hasStoryHook = storyHookKeywords.some(keyword => lowerMessage.includes(keyword));

      // Check recent messages for NPC dialogue
      const recentNPCMessages = context.recentMessages.slice(-5).filter(m => m.sender === 'npc' || m.sender === 'dm');
      const hasRecentNPCDialogue = recentNPCMessages.length > 0;

      // Don't create side quests if too many active quests already (max 5 active total)
      const activeQuestCount = context.quests.filter(q => q.status === 'active').length;
      if (activeQuestCount >= 5) {
        console.log('[AI Service] Side quest opportunity rejected: too many active quests', { activeQuestCount });
        return false;
      }

      // Heuristic decision: if strong signals present, return true
      if ((hasNPCInteraction || hasDiscovery) && (hasStoryHook || hasRecentNPCDialogue)) {
        console.log('[AI Service] Side quest opportunity detected via heuristics', {
          hasNPCInteraction,
          hasDiscovery,
          hasStoryHook,
          hasRecentNPCDialogue
        });
        return true;
      }

      // No clear opportunity
      return false;

    } catch (error) {
      console.error('[AI Service] Error detecting side quest opportunity:', error);
      captureError(error as Error, { context: "Side quest opportunity detection" });
      return false;
    }
  }

  async generateSideQuest(
    playerMessage: string,
    context: {
      character: Character | undefined;
      gameState: GameState | undefined;
      recentMessages: Message[];
    }
  ): Promise<Omit<Quest, 'id'> | null> {
    try {
      // Get conversation context
      const conversationContext = context.recentMessages.slice(-5).map(m => {
        const speaker = m.sender === 'dm' ? 'DM' : m.sender === 'npc' ? (m.senderName || 'NPC') : 'Player';
        return `${speaker}: ${m.content}`;
      }).join('\\n');

      const response = await openai.chat.completions.create({
        model: "anthropic/claude-3.5-haiku",
        messages: [
          {
            role: "system",
            content: "You are a D&D Dungeon Master creating engaging side quests from player interactions and discoveries."
          },
          {
            role: "user",
            content: `Recent conversation:
${conversationContext}

Player's latest action: "${playerMessage}"

Player Level: ${context.character?.level || 1}
Current Scene: ${context.gameState?.currentScene || "Unknown"}

Based on this interaction, create a SHORT side quest (2-3 objectives) that:
- Stems naturally from the conversation or discovery
- Can be completed independently of main story
- Is appropriate for the player's level
- Has a clear but vague objective

Format as JSON:
{
  "title": "Short, punchy quest title",
  "description": "Vague objective (what to do, not how)",
  "status": "active",
  "priority": "normal",
  "progress": 0,
  "maxProgress": 2,
  "reward": "Appropriate reward",
  "isMainStory": false
}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      if (result.title) {
        console.log('[AI Service] Side quest generated', {
          title: result.title,
          description: result.description.substring(0, 100)
        });

        return {
          title: result.title,
          description: result.description,
          status: 'active',
          priority: result.priority || 'normal',
          progress: 0,
          maxProgress: result.maxProgress || 2,
          reward: result.reward,
          isMainStory: false,
          parentQuestId: null,
          chainId: null
        };
      }

      return null;

    } catch (error) {
      console.error('[AI Service] Error generating side quest:', error);
      captureError(error as Error, { context: "Side quest generation" });
      return null;
    }
  }

  async generateQuestIdeas(sessionId: string, playerLevel: number, currentScene: string): Promise<Quest[]> {
    try {
      const context = await this.getGameContext(sessionId);
      
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

  async generateWorldFromCharacter(character: {
    name: string;
    appearance?: string | null;
    backstory?: string | null;
    class?: string;
  }): Promise<{
    worldSetting: string;
    worldTheme: string;
    worldDescription: string;
    initialScene: string;
    initialQuest: { title: string; description: string };
    startingItems: Array<{ name: string; type: string; description: string }>;
  }> {
    try {
      const characterDesc = character.appearance || "a mysterious adventurer";
      const characterStory = character.backstory || "seeking their destiny";

      const prompt = `Based on this character, create a unique and coherent game world that matches their vibe and story:

CHARACTER:
- Name: ${character.name}
- Description: ${characterDesc}
- Backstory: ${characterStory}
- Class: ${character.class || "Adventurer"}

TASK: Generate a complete world setting that feels authentic to this character. If they're a "ball of lint trying to find their lint family," create a whimsical lint universe with fabric creatures and dryer vent dungeons. If they're a dark knight, create a grim gothic world. Match the tone perfectly.

Respond in this EXACT JSON format (no other text):
{
  "worldSetting": "short name for this world (e.g., 'The Lint Universe', 'Kingdom of Shadows')",
  "worldTheme": "1-2 sentence tone/genre description",
  "worldDescription": "3-4 sentences describing the world, its inhabitants, magic system, and atmosphere - make it vivid and specific to the character's vibe",
  "initialScene": "where the character starts their journey (specific location name and brief description)",
  "initialQuest": {
    "title": "engaging quest title",
    "description": "2-3 sentences describing the first quest, tied to their backstory"
  },
  "startingItems": [
    {"name": "item name", "type": "weapon|armor|consumable|misc", "description": "what it does"},
    {"name": "item name", "type": "weapon|armor|consumable|misc", "description": "what it does"},
    {"name": "item name", "type": "weapon|armor|consumable|misc", "description": "what it does"}
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "anthropic/claude-3.5-haiku",
        messages: [
          {
            role: "system",
            content: "You are a creative world-building expert. Generate immersive, coherent game worlds that perfectly match character concepts. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9, // Higher creativity for world generation
      });

      const content = response.choices[0].message.content || "";

      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      const worldData = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!worldData.worldSetting || !worldData.worldTheme || !worldData.worldDescription ||
          !worldData.initialScene || !worldData.initialQuest || !worldData.startingItems) {
        throw new Error("Missing required fields in world generation response");
      }

      console.log('[AI Service] Generated world from character:', {
        character: character.name,
        worldSetting: worldData.worldSetting,
      });

      return worldData;

    } catch (error: any) {
      captureError(error as Error, { context: "World generation from character" });
      console.error('[AI Service] Error generating world from character:', error);

      // Return a fallback generic fantasy world
      return {
        worldSetting: "The Realm of Adventures",
        worldTheme: "Classic fantasy with mystery and adventure",
        worldDescription: "A vast realm where magic and steel clash, ancient ruins hold forgotten secrets, and heroes rise to face the darkness. The land is dotted with medieval towns, dark forests, and mysterious dungeons waiting to be explored.",
        initialScene: "A bustling medieval village at the crossroads of adventure",
        initialQuest: {
          title: "Begin Your Journey",
          description: "Explore this new world and discover your destiny. The village elder has mentioned strange occurrences in the nearby forest that need investigation."
        },
        startingItems: [
          { name: "Sturdy Weapon", type: "weapon", description: "A reliable weapon for your adventures" },
          { name: "Leather Armor", type: "armor", description: "Basic protection from harm" },
          { name: "Health Potion", type: "consumable", description: "Restores vitality when needed" }
        ]
      };
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