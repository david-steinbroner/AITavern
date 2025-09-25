import { abilityCheck, damageRoll } from "./mechanics.ts";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertCharacterSchema,
  insertQuestSchema,
  insertItemSchema,
  insertMessageSchema,
  insertEnemySchema,
  insertGameStateSchema,
  insertCampaignSchema,
  updateCampaignSchema,
  updateEnemySchema,
  type Character,
  type Quest,
  type Item,
  type Enemy,
  type Campaign,
} from "@shared/schema";
import { z } from "zod";
import { aiService } from "./aiService";

// Validation schemas for updates
const updateCharacterSchema = insertCharacterSchema.partial().refine(
  (data) => {
    if (data.currentHealth !== undefined && data.maxHealth !== undefined) {
      return data.currentHealth <= data.maxHealth && data.currentHealth >= 0;
    }
    if (data.currentHealth !== undefined) {
      return data.currentHealth >= 0;
    }
    if (data.currentMana !== undefined && data.maxMana !== undefined) {
      return data.currentMana <= data.maxMana && data.currentMana >= 0;
    }
    if (data.currentMana !== undefined) {
      return data.currentMana >= 0;
    }
    return true;
  },
  { message: "Health and mana values must be valid" },
);

const updateQuestSchema = insertQuestSchema.partial().refine(
  (data) => {
    if (data.progress !== undefined && data.maxProgress !== undefined) {
      return data.progress <= data.maxProgress && data.progress >= 0;
    }
    if (data.progress !== undefined) {
      return data.progress >= 0;
    }
    return true;
  },
  { message: "Quest progress must be valid" },
);

const updateItemSchema = insertItemSchema.partial().refine(
  (data) => {
    if (data.quantity !== undefined) {
      return data.quantity >= 0;
    }
    return true;
  },
  { message: "Item quantity must be non-negative" },
);

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware setup
  await setupAuth(app);

  // Demo mode endpoints - must be defined before auth protection
  app.get("/api/demo/status", (_req, res) => {
    const enabled = process.env.DEMO_MODE_ENABLED === 'true';
    res.json({ enabled });
  });

  app.post("/api/demo/start", (req: any, res) => {
    const enabled = process.env.DEMO_MODE_ENABLED === 'true';
    if (!enabled) {
      return res.status(403).json({ error: "Demo mode is not enabled" });
    }

    // Set demo session flags
    req.session.demo = true;
    req.session.demoUserId = `demo-${randomUUID()}`;
    
    // Set minimal user claims for demo
    req.user = {
      claims: {
        sub: req.session.demoUserId,
        email: "demo@example.com",
        first_name: "Demo",
        last_name: "User"
      }
    };

    console.log("✅ Demo session started for:", req.session.demoUserId);
    res.json({ success: true, demoUserId: req.session.demoUserId });
  });

  // Default API protection - all /api routes require authentication except for auth endpoints
  app.use('/api', (req, res, next) => {
    const openEndpoints = new Set([
      '/api/login',
      '/api/callback', 
      '/api/logout',
      '/api/debug/check',
      '/api/demo/status',
      '/api/demo/start'
    ]);
    
    if (openEndpoints.has(req.path)) {
      return next();
    }
    
    return isAuthenticated(req, res, next);
  });

  // Initialize storage with default data
  await storage.init();

  app.get("/api/debug/check", (_req, res) => {
    console.log("✅ /api/debug/check registered & hit");
    const check = abilityCheck({
      actorId: "pc1",
      skill: "athletics",
      difficulty: 12,
    });
    const dmg = damageRoll("2d6+1");
    res.json({ system: process.env.GAME_SYSTEM || "dnd5e", check, dmg });
  });

  // Quick start route - creates default character and adventure
  app.post('/api/quick-start', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user already has a character
      const existingCharacter = await storage.getUser(req.user.claims.sub);
      if (existingCharacter) {
        // Skip character creation, just initialize default adventure
        const defaultTemplate = {
          id: "forest-adventure",
          name: "Forest Adventure",
          setting: "Mystical Forest",
          initialScene: "You find yourself at the edge of an ancient forest. The trees whisper secrets in a language older than memory, and strange lights dance between the branches. Your adventure begins now.",
          initialQuest: {
            title: "Explore the Mystical Forest",
            description: "Venture into the ancient woodland and discover its secrets. The forest holds many mysteries waiting to be uncovered.",
            priority: "high",
            maxProgress: 100
          }
        };

        // Initialize the adventure
        await storage.updateGameState({
          currentScene: defaultTemplate.initialScene,
          inCombat: false,
          currentTurn: null,
          turnCount: 0,
        });

        // Get or ensure active campaign for existing character
        let activeCampaign = await storage.getActiveCampaign();
        if (!activeCampaign) {
          activeCampaign = await storage.createCampaign({
            name: "Your Adventure",
            description: "An epic journey through mystical lands",
            userId: req.user.claims.sub
          });
          await storage.setActiveCampaign(activeCampaign.id);
        }

        // Create the initial quest
        await storage.createQuest({
          campaignId: activeCampaign.id,
          title: defaultTemplate.initialQuest.title,
          description: defaultTemplate.initialQuest.description,
          status: "active",
          priority: defaultTemplate.initialQuest.priority,
          progress: 0,
          maxProgress: defaultTemplate.initialQuest.maxProgress,
          reward: "Experience and story progression",
          isMainStory: true,
          parentQuestId: null,
          chainId: null,
        });

        // Clear existing messages and create enhanced welcome message
        await storage.clearMessages();
        
        // Get character for enhanced message context
        const character = await storage.getCharacter();
        
        // Generate enhanced welcome message using AI (with robust fallback)
        let enhancedWelcomeResponse;
        try {
          enhancedWelcomeResponse = await aiService.generateEnhancedWelcomeMessage(defaultTemplate, character);
        } catch (error) {
          console.error('Failed to generate enhanced welcome message for quick-start, using fallback:', error);
          
          // Robust fallback message that always works
          const characterIntro = character ? ` ${character.name}, a level ${character.level} ${character.class},` : '';
          enhancedWelcomeResponse = {
            content: `🏰 **Welcome to ${defaultTemplate.name}!** 🏰

You${characterIntro} find yourself in ${defaultTemplate.initialScene}. The air is thick with possibility and adventure beckons from every shadow.

**Current Objective:** ${defaultTemplate.initialQuest.description}

**What would you like to do?**
• 🗡️ **Investigate** your immediate surroundings
• 💬 **Speak** to any nearby NPCs  
• 🎒 **Check** your equipment and supplies
• 🏃 **Move** toward your objective

Choose your path, adventurer. Your destiny awaits!`,
            sender: 'dm',
            senderName: null,
            actions: {
              updateGameState: { 
                currentScene: defaultTemplate.initialScene, 
                inCombat: false
              }
            }
          };
        }
        
        const welcomeMessage = await storage.createMessage({
          campaignId: activeCampaign.id,
          content: enhancedWelcomeResponse.content,
          sender: enhancedWelcomeResponse.sender,
          senderName: enhancedWelcomeResponse.senderName,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });

        return res.json({ success: true, existingCharacter: true });
      }

      // Create default character
      const defaultCharacter = {
        name: "Hero",
        class: "Fighter",
        level: 1,
        experience: 0,
        strength: 14,
        dexterity: 13,
        constitution: 15,
        intelligence: 12,
        wisdom: 13,
        charisma: 11,
        maxHealth: 17, // 10 + CON modifier (2) + Fighter bonus (5)
        currentHealth: 17,
        maxMana: 1, // Minimal mana for non-casters
        currentMana: 1
      };

      // Get or create active campaign
      let activeCampaign = await storage.getActiveCampaign();
      if (!activeCampaign) {
        // Create a default campaign
        activeCampaign = await storage.createCampaign({
          name: "Your Adventure",
          description: "An epic journey through mystical lands",
          userId: req.user.claims.sub
        });
        await storage.setActiveCampaign(activeCampaign.id);
      }

      // Create character with campaignId
      const character = await storage.createCharacter({
        ...defaultCharacter,
        campaignId: activeCampaign.id
      });

      // Initialize default adventure template
      const defaultTemplate = {
        id: "forest-adventure",
        name: "Forest Adventure", 
        setting: "Mystical Forest",
        initialScene: "You find yourself at the edge of an ancient forest. The trees whisper secrets in a language older than memory, and strange lights dance between the branches. Your adventure begins now.",
        initialQuest: {
          title: "Explore the Mystical Forest",
          description: "Venture into the ancient woodland and discover its secrets. The forest holds many mysteries waiting to be uncovered.",
          priority: "high",
          maxProgress: 100
        }
      };

      // Update game state
      await storage.updateGameState({
        currentScene: defaultTemplate.initialScene,
        inCombat: false,
        currentTurn: null,
        turnCount: 0,
      });

      // Create the initial quest
      const quest = await storage.createQuest({
        campaignId: activeCampaign.id,
        title: defaultTemplate.initialQuest.title,
        description: defaultTemplate.initialQuest.description,
        status: "active",
        priority: defaultTemplate.initialQuest.priority,
        progress: 0,
        maxProgress: defaultTemplate.initialQuest.maxProgress,
        reward: "Experience and story progression",
        isMainStory: true,
        parentQuestId: null,
        chainId: null,
      });

      // Clear existing messages and create welcome message
      await storage.clearMessages();
      const welcomeMessage = await storage.createMessage({
        campaignId: activeCampaign.id,
        content: "Welcome to your adventure, " + character.name + "! " + defaultTemplate.initialScene,
        sender: "dm",
        senderName: "Adventure Guide", 
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      res.json({
        success: true,
        character,
        quest,
        message: welcomeMessage,
        gameState: await storage.getGameState(),
      });
    } catch (error) {
      console.error("Error in quick start:", error);
      res.status(500).json({ error: "Failed to quick start adventure" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // For demo users, return demo user data directly
      if (userId && userId.startsWith('demo-')) {
        return res.json({
          id: userId,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: null,
          claims: req.user.claims
        });
      }
      
      // For regular users, fetch from storage
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Character routes
  app.get("/api/character", isAuthenticated, async (_req, res) => {
    try {
      const character = await storage.getCharacter();
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      console.error("Error fetching character:", error);
      res.status(500).json({ error: "Failed to fetch character" });
    }
  });

  app.post("/api/character", isAuthenticated, async (req, res) => {
    try {
      // Create a schema that doesn't require campaignId (we'll add it server-side)
      const createCharacterSchema = insertCharacterSchema.omit({ campaignId: true });
      
      const result = createCharacterSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid character data",
          details: result.error.errors,
        });
      }

      // Get the user's active campaign
      const activeCampaign = await storage.getActiveCampaign();
      if (!activeCampaign) {
        return res.status(400).json({ 
          error: "No active campaign found. Please select or create a campaign first." 
        });
      }

      // Add campaignId to character data
      const characterData = {
        ...result.data,
        campaignId: activeCampaign.id
      };

      const character = await storage.createCharacter(characterData);
      res.json(character);
    } catch (error) {
      console.error("Error creating character:", error);
      res.status(500).json({ error: "Failed to create character" });
    }
  });

  app.patch("/api/character/:id", isAuthenticated, async (req, res) => {
    try {
      const result = updateCharacterSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid character data",
          details: result.error.errors,
        });
      }

      const character = await storage.updateCharacter(
        req.params.id,
        result.data,
      );
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      console.error("Error updating character:", error);
      res.status(500).json({ error: "Failed to update character" });
    }
  });

  // Adventure template initialization
  const adventureTemplateSchema = z.object({
    id: z.string(),
    name: z.string(),
    setting: z.string(),
    initialScene: z.string(),
    initialQuest: z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(["high", "normal", "low"]),
      maxProgress: z.number(),
    }),
  });

  app.post("/api/adventure/initialize", isAuthenticated, async (req, res) => {
    try {
      const result = adventureTemplateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid adventure template data",
          details: result.error.errors,
        });
      }

      const template = result.data;

      // Update game state with the new adventure
      await storage.updateGameState({
        currentScene: template.initialScene,
        inCombat: false,
        currentTurn: null,
        turnCount: 0,
      });

      // Get or ensure active campaign
      let activeCampaign = await storage.getActiveCampaign();
      if (!activeCampaign) {
        activeCampaign = await storage.createCampaign({
          name: template.name,
          description: `Adventure in ${template.setting}`,
          userId: (req as any).user.claims.sub
        });
        await storage.setActiveCampaign(activeCampaign.id);
      }

      // Create the initial quest
      const quest = await storage.createQuest({
        campaignId: activeCampaign.id,
        title: template.initialQuest.title,
        description: template.initialQuest.description,
        status: "active",
        priority: template.initialQuest.priority,
        progress: 0,
        maxProgress: template.initialQuest.maxProgress,
        reward: "Experience and story progression",
        isMainStory: true,
        parentQuestId: null,
        chainId: null,
      });

      // Clear existing messages and generate enhanced welcome message
      await storage.clearMessages();

      // Get character for enhanced message context
      const character = await storage.getCharacter();
      
      // Generate enhanced welcome message using AI (with robust fallback)
      let enhancedWelcomeResponse;
      try {
        enhancedWelcomeResponse = await aiService.generateEnhancedWelcomeMessage(template, character);
      } catch (error) {
        console.error('Failed to generate enhanced welcome message, using basic fallback:', error);
        
        // Robust fallback message that always works
        const characterIntro = character ? ` ${character.name}, a level ${character.level} ${character.class},` : '';
        enhancedWelcomeResponse = {
          content: `🏰 **Welcome to ${template.name}!** 🏰

You${characterIntro} find yourself in ${template.initialScene}. The air is thick with possibility and adventure beckons from every shadow.

**Current Objective:** ${template.initialQuest.description}

**What would you like to do?**
• 🗡️ **Investigate** your immediate surroundings
• 💬 **Speak** to any nearby NPCs  
• 🎒 **Check** your equipment and supplies
• 🏃 **Move** toward your objective

Choose your path, adventurer. Your destiny awaits!`,
          sender: 'dm',
          senderName: null,
          actions: {
            updateGameState: { 
              currentScene: template.initialScene, 
              inCombat: false
            }
          }
        };
      }
      
      const welcomeMessage = await storage.createMessage({
        campaignId: activeCampaign.id,
        content: enhancedWelcomeResponse.content,
        sender: enhancedWelcomeResponse.sender,
        senderName: enhancedWelcomeResponse.senderName,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      // Apply any game state updates from the enhanced welcome
      if (enhancedWelcomeResponse.actions?.updateGameState) {
        await storage.updateGameState(enhancedWelcomeResponse.actions.updateGameState);
      }

      res.json({
        success: true,
        quest,
        message: welcomeMessage,
        gameState: await storage.getGameState(),
      });
    } catch (error) {
      console.error("Error initializing adventure template:", error);
      res
        .status(500)
        .json({ error: "Failed to initialize adventure template" });
    }
  });

  // Character portrait generation
  const portraitGenerationSchema = z.object({
    appearance: z.string().min(1).max(500),
    name: z.string().min(1).max(100),
  });

  app.post("/api/character/generate-portrait", isAuthenticated, async (req, res) => {
    try {
      const result = portraitGenerationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid portrait generation data",
          details: result.error.errors,
        });
      }

      const { appearance, name } = result.data;

      try {
        const portraitUrl = await aiService.generateCharacterPortrait(
          name,
          appearance,
        );
        res.json({ url: portraitUrl });
      } catch (aiError: any) {
        console.error("AI portrait generation failed:", aiError);

        // Return graceful degradation - let the frontend handle the missing portrait
        res.json({
          url: null,
          error:
            "Portrait generation temporarily unavailable. You can continue without a portrait and add one later.",
          fallback: true,
        });
      }
    } catch (error) {
      console.error("Error in portrait generation endpoint:", error);
      res
        .status(500)
        .json({ error: "Portrait generation service unavailable" });
    }
  });

  // Enemy routes
  app.get("/api/enemies", isAuthenticated, async (req, res) => {
    try {
      const combatId = req.query.combatId as string | undefined;
      const enemies = await storage.getEnemies(combatId);
      res.json(enemies);
    } catch (error) {
      console.error("Error fetching enemies:", error);
      res.status(500).json({ error: "Failed to fetch enemies" });
    }
  });

  app.post("/api/enemies", isAuthenticated, async (req, res) => {
    try {
      const result = insertEnemySchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ error: "Invalid enemy data", details: result.error.errors });
      }

      const enemy = await storage.createEnemy(result.data);
      res.json(enemy);
    } catch (error) {
      console.error("Error creating enemy:", error);
      res.status(500).json({ error: "Failed to create enemy" });
    }
  });

  app.patch("/api/enemies/:id", isAuthenticated, async (req, res) => {
    try {
      const result = updateEnemySchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ error: "Invalid enemy data", details: result.error.errors });
      }

      const enemy = await storage.updateEnemy(req.params.id, result.data);
      if (!enemy) {
        return res.status(404).json({ error: "Enemy not found" });
      }
      res.json(enemy);
    } catch (error) {
      console.error("Error updating enemy:", error);
      res.status(500).json({ error: "Failed to update enemy" });
    }
  });

  // Combat action endpoint
  app.post("/api/combat/action", isAuthenticated, async (req, res) => {
    try {
      const { action, targetId, spellId, itemId } = req.body;

      if (!action || typeof action !== "string") {
        return res.status(400).json({ error: "Action is required" });
      }

      // Process combat action through AI
      let actionMessage = "";
      switch (action) {
        case "attack":
          actionMessage = targetId
            ? `I attack the enemy with ID ${targetId}!`
            : "I launch an attack!";
          
          // Use mechanics seam for attack resolution
          const attackerId = (req as any).user?.id ?? "pc1";
          const targetAC = Number(req.body?.targetAC ?? 12);
          const dmgExpr = String(req.body?.damageExpr ?? "1d8+2");
          const check = abilityCheck({ actorId: attackerId, skill: "attack", difficulty: targetAC });
          const damage = check.success ? damageRoll(dmgExpr) : 0;
          
          // Store combat results for response
          res.locals.combat = { 
            system: process.env.GAME_SYSTEM || "dnd5e", 
            check, 
            damage, 
            targetId: targetId ?? null, 
            dmgExpr, 
            targetAC 
          };
          break;
        case "defend":
          actionMessage =
            "I take a defensive stance, ready to block incoming attacks.";
          break;
        case "cast":
          actionMessage = spellId
            ? `I cast spell ${spellId}!`
            : "I prepare to cast a spell.";
          break;
        case "use-item":
          actionMessage = itemId
            ? `I use item ${itemId}!`
            : "I use an item from my inventory.";
          break;
        case "flee":
          actionMessage = "I attempt to flee from combat!";
          break;
        case "enemy-turn":
          // Handle enemy turn automatically without AI (faster, more reliable)
          const currentGameState = await storage.getGameState();
          if (currentGameState?.inCombat && currentGameState.combatId) {
            // Just advance the turn back to player
            await storage.updateGameState({
              currentTurn: "player",
              turnCount: (currentGameState.turnCount ?? 0) + 1,
            });

            // Store the enemy turn message for consistency
            const activeCampaign = await storage.getActiveCampaign();
            const message = await storage.createMessage({
              campaignId: activeCampaign?.id || 'default',
              content: "Enemy completes their turn. It's your turn now!",
              sender: "dm",
              senderName: null,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            });

            return res.json({ message });
          }
          return res.status(400).json({ error: "Not in combat" });
        default:
          actionMessage = `I perform the ${action} action.`;
      }

      // Generate AI response for combat action
      const aiResponse = await aiService.generateResponse(actionMessage);

      // Store messages
      const activeCampaign = await storage.getActiveCampaign();
      await storage.createMessage({
        campaignId: activeCampaign?.id || 'default',
        content: actionMessage,
        sender: "player",
        senderName: null,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      const aiMessage = await storage.createMessage({
        campaignId: activeCampaign?.id || 'default',
        content: aiResponse.content,
        sender: aiResponse.sender,
        senderName: aiResponse.senderName,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      // Apply AI actions (enemy updates, character changes, etc.)
      if (aiResponse.actions) {
        const actions = aiResponse.actions;

        // Start combat if specified
        if ((actions as any).startCombat) {
          const combatData = (actions as any).startCombat;
          const combatId = randomUUID();

          // Create enemies for this combat encounter
          if (combatData.enemies && Array.isArray(combatData.enemies)) {
            for (const enemyData of combatData.enemies) {
              const enemyValidation = insertEnemySchema.safeParse({
                ...enemyData,
                combatId,
              });
              if (enemyValidation.success) {
                await storage.createEnemy(enemyValidation.data);
              }
            }
          }

          // Update game state to start combat
          await storage.updateGameState({
            inCombat: true,
            combatId,
            currentTurn: "player",
            turnCount: 1,
          });
        }

        // Update enemy if specified
        if ((actions as any).updateEnemy) {
          const enemyUpdate = (actions as any).updateEnemy;
          const enemyValidation = updateEnemySchema.safeParse(
            enemyUpdate.updates,
          );
          if (enemyValidation.success) {
            await storage.updateEnemy(enemyUpdate.id, enemyValidation.data);
          }
        }

        // End combat if specified
        if ((actions as any).endCombat) {
          const endCombatData = (actions as any).endCombat;

          // Award victory rewards before ending combat
          if (endCombatData.victory) {
            const character = await storage.getCharacter();
            if (character) {
              let expGain = 75; // Default experience

              // Check if rewards is an object with experience property
              if (
                endCombatData.rewards &&
                typeof endCombatData.rewards === "object" &&
                endCombatData.rewards.experience
              ) {
                expGain = endCombatData.rewards.experience;
              }

              const rewardValidation = updateCharacterSchema.safeParse({
                experience: character.experience + expGain,
              });
              if (rewardValidation.success) {
                await storage.updateCharacter(
                  character.id,
                  rewardValidation.data,
                );
              }
            }
          }

          await storage.updateGameState({
            inCombat: false,
            combatId: null,
            currentTurn: null,
            turnCount: 0,
          });
        }

        if (actions.updateCharacter) {
          const character = await storage.getCharacter();
          if (character) {
            const charValidation = updateCharacterSchema.safeParse(
              actions.updateCharacter.updates,
            );
            if (charValidation.success) {
              await storage.updateCharacter(character.id, charValidation.data);
            }
          }
        }

        if (actions.updateGameState) {
          const gameStateValidation = insertGameStateSchema
            .partial()
            .safeParse(actions.updateGameState);
          if (gameStateValidation.success) {
            await storage.updateGameState(gameStateValidation.data);
          }
        }
      }

      // Check for combat end conditions and turn management
      const currentGameState = await storage.getGameState();
      if (currentGameState?.inCombat && currentGameState.combatId) {
        const combatEnemies = await storage.getEnemies(
          currentGameState.combatId,
        );
        const aliveEnemies = combatEnemies.filter(
          (e) => e.isActive && e.currentHealth > 0,
        );

        // End combat if no enemies left alive
        if (aliveEnemies.length === 0) {
          // Award victory rewards - base 50 exp + 10 per enemy defeated
          const character = await storage.getCharacter();
          if (character) {
            const baseExp = 50;
            const enemyExp = combatEnemies.length * 10;
            const totalExp = baseExp + enemyExp;
            await storage.updateCharacter(character.id, {
              experience: character.experience + totalExp,
            });
          }

          await storage.updateGameState({
            inCombat: false,
            combatId: null,
            currentTurn: null,
            turnCount: 0,
          });
        } else {
          // Toggle turn after player action
          const newTurn =
            currentGameState.currentTurn === "player" ? "enemy" : "player";
          const newTurnCount =
            newTurn === "player"
              ? currentGameState.turnCount + 1
              : currentGameState.turnCount;

          await storage.updateGameState({
            currentTurn: newTurn,
            turnCount: newTurnCount,
          });
        }
      }

      res.json({
        message: aiMessage,
        actions: aiResponse.actions,
        ...(res.locals.combat && { combat: res.locals.combat }),
      });
    } catch (error) {
      console.error("Error processing combat action:", error);
      res.status(500).json({ error: "Failed to process combat action" });
    }
  });

  // Quest routes
  app.get("/api/quests", isAuthenticated, async (_req, res) => {
    try {
      const quests = await storage.getQuests();
      res.json(quests);
    } catch (error) {
      console.error("Error fetching quests:", error);
      res.status(500).json({ error: "Failed to fetch quests" });
    }
  });

  app.get("/api/quests/:id", isAuthenticated, async (req, res) => {
    try {
      const quest = await storage.getQuest(req.params.id);
      if (!quest) {
        return res.status(404).json({ error: "Quest not found" });
      }
      res.json(quest);
    } catch (error) {
      console.error("Error fetching quest:", error);
      res.status(500).json({ error: "Failed to fetch quest" });
    }
  });

  app.post("/api/quests", isAuthenticated, async (req, res) => {
    try {
      const result = insertQuestSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ error: "Invalid quest data", details: result.error.errors });
      }

      const quest = await storage.createQuest(result.data);
      res.json(quest);
    } catch (error) {
      console.error("Error creating quest:", error);
      res.status(500).json({ error: "Failed to create quest" });
    }
  });

  app.patch("/api/quests/:id", isAuthenticated, async (req, res) => {
    try {
      const result = updateQuestSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ error: "Invalid quest data", details: result.error.errors });
      }

      const quest = await storage.updateQuest(req.params.id, result.data);
      if (!quest) {
        return res.status(404).json({ error: "Quest not found" });
      }
      res.json(quest);
    } catch (error) {
      console.error("Error updating quest:", error);
      res.status(500).json({ error: "Failed to update quest" });
    }
  });

  app.delete("/api/quests/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteQuest(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Quest not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting quest:", error);
      res.status(500).json({ error: "Failed to delete quest" });
    }
  });

  // Inventory routes
  app.get("/api/items", isAuthenticated, async (_req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  app.get("/api/items/:id", isAuthenticated, async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  app.post("/api/items", isAuthenticated, async (req, res) => {
    try {
      const result = insertItemSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ error: "Invalid item data", details: result.error.errors });
      }

      const item = await storage.createItem(result.data);
      res.json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ error: "Failed to create item" });
    }
  });

  app.patch("/api/items/:id", isAuthenticated, async (req, res) => {
    try {
      const result = updateItemSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ error: "Invalid item data", details: result.error.errors });
      }

      const item = await storage.updateItem(req.params.id, result.data);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  app.delete("/api/items/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Message routes for AI conversation
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      // Get the active campaign for this user
      const activeCampaign = await storage.getActiveCampaign();
      if (!activeCampaign) {
        return res.json([]); // Return empty array if no active campaign
      }

      let limit: number | undefined;
      if (req.query.limit) {
        const parsed = parseInt(req.query.limit as string);
        if (isNaN(parsed) || parsed < 1) {
          return res.status(400).json({ error: "Invalid limit parameter" });
        }
        limit = Math.min(parsed, 100); // Cap at 100 messages
      }

      const messages = limit
        ? await storage.getRecentMessagesByCampaign(activeCampaign.id, limit)
        : await storage.getMessagesByCampaign(activeCampaign.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      // Set server-side timestamp
      const messageData = {
        ...req.body,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const result = insertMessageSchema.safeParse(messageData);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid message data",
          details: result.error.errors,
        });
      }

      const message = await storage.createMessage(result.data);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.delete("/api/messages", isAuthenticated, async (_req, res) => {
    try {
      await storage.clearMessages();
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing messages:", error);
      res.status(500).json({ error: "Failed to clear messages" });
    }
  });

  // Game state routes
  app.get("/api/game-state", isAuthenticated, async (_req, res) => {
    try {
      const gameState = await storage.getGameState();
      res.json(gameState);
    } catch (error) {
      console.error("Error fetching game state:", error);
      res.status(500).json({ error: "Failed to fetch game state" });
    }
  });

  app.post("/api/game-state", isAuthenticated, async (req, res) => {
    try {
      const result = insertGameStateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid game state data",
          details: result.error.errors,
        });
      }

      const gameState = await storage.createGameState(result.data);
      res.json(gameState);
    } catch (error) {
      console.error("Error creating game state:", error);
      res.status(500).json({ error: "Failed to create game state" });
    }
  });

  app.patch("/api/game-state", isAuthenticated, async (req, res) => {
    try {
      const gameState = await storage.updateGameState(req.body);
      res.json(gameState);
    } catch (error) {
      console.error("Error updating game state:", error);
      res.status(500).json({ error: "Failed to update game state" });
    }
  });

  // AI Conversation endpoints
  app.post("/api/ai/chat", isAuthenticated, async (req, res) => {
    try {
      const { message, isDirectDM } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Generate AI response with fallback handling
      let aiResponse;
      try {
        aiResponse = await aiService.generateResponse(message, isDirectDM || false);
      } catch (aiError: any) {
        console.error("AI response generation failed:", aiError);

        // Provide a fallback response when AI is unavailable
        aiResponse = {
          content:
            "Your adventure guide seems distracted by mystical forces and doesn't respond clearly. The adventure continues, but the AI storytelling is temporarily unavailable.",
          sender: "dm" as const,
          senderName: null,
        };
      }

      // Store the player message
      const activeCampaign = await storage.getActiveCampaign();
      await storage.createMessage({
        campaignId: activeCampaign?.id || 'default',
        content: message,
        sender: "player",
        senderName: null,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      // Store the AI response
      const aiMessage = await storage.createMessage({
        campaignId: activeCampaign?.id || 'default',
        content: aiResponse.content,
        sender: aiResponse.sender,
        senderName: aiResponse.senderName,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      // Apply any game actions from the AI response with validation
      if (aiResponse.actions) {
        const actions = aiResponse.actions;

        // Update quest if specified
        if (actions.updateQuest) {
          const questValidation = updateQuestSchema.safeParse(
            actions.updateQuest.updates,
          );
          if (questValidation.success) {
            const updatedQuest = await storage.updateQuest(
              actions.updateQuest.id,
              questValidation.data,
            );

            // Generate follow-up quest if main story quest was just completed
            if (
              updatedQuest &&
              (updatedQuest as any).wasJustCompleted &&
              updatedQuest.isMainStory
            ) {
              try {
                const character = await storage.getCharacter();
                const gameState = await storage.getGameState();
                const followUpQuest = await aiService.generateFollowUpQuest(
                  updatedQuest,
                  { character, gameState },
                );

                if (followUpQuest) {
                  // Ensure the completed quest has a chainId for consistency
                  if (!updatedQuest.chainId) {
                    await storage.updateQuest(updatedQuest.id, {
                      chainId: updatedQuest.id,
                    });
                  }

                  // Validate and create follow-up quest
                  const activeCampaign = await storage.getActiveCampaign();
                  const questValidation = insertQuestSchema.safeParse({
                    ...followUpQuest,
                    campaignId: activeCampaign?.id || 'default',
                    parentQuestId: updatedQuest.id,
                    chainId: updatedQuest.chainId || updatedQuest.id,
                    isMainStory: true,
                  });

                  if (questValidation.success) {
                    await storage.createQuest(questValidation.data);
                  } else {
                    console.warn(
                      "Invalid follow-up quest data:",
                      questValidation.error.errors,
                    );
                  }
                }
              } catch (error) {
                console.warn("Error generating follow-up quest:", error);
              }
            }
          } else {
            console.warn(
              "Invalid AI quest update:",
              questValidation.error.errors,
            );
          }
        }

        // Create new quest if specified
        if (actions.createQuest) {
          const activeCampaign = await storage.getActiveCampaign();
          const questValidation = insertQuestSchema.safeParse({
            ...actions.createQuest,
            campaignId: activeCampaign?.id || 'default',
          });
          if (questValidation.success) {
            await storage.createQuest(questValidation.data);
          } else {
            console.warn(
              "Invalid AI quest creation:",
              questValidation.error.errors,
            );
          }
        }

        // Update character if specified
        if (actions.updateCharacter) {
          const character = await storage.getCharacter();
          if (character) {
            const charValidation = updateCharacterSchema.safeParse(
              actions.updateCharacter.updates,
            );
            if (charValidation.success) {
              await storage.updateCharacter(character.id, charValidation.data);
            } else {
              console.warn(
                "Invalid AI character update:",
                charValidation.error.errors,
              );
            }
          }
        }

        // Update game state if specified
        if (actions.updateGameState) {
          const gameStateValidation = insertGameStateSchema
            .partial()
            .safeParse(actions.updateGameState);
          if (gameStateValidation.success) {
            await storage.updateGameState(gameStateValidation.data);
          } else {
            console.warn(
              "Invalid AI game state update:",
              gameStateValidation.error.errors,
            );
          }
        }

        // Give item if specified
        if (actions.giveItem) {
          const activeCampaign = await storage.getActiveCampaign();
          const itemValidation = insertItemSchema.safeParse({
            ...actions.giveItem,
            campaignId: activeCampaign?.id || 'default',
          });
          if (itemValidation.success) {
            await storage.createItem(itemValidation.data);
          } else {
            console.warn(
              "Invalid AI item creation:",
              itemValidation.error.errors,
            );
          }
        }
      }

      res.json({
        message: aiMessage,
        actions: aiResponse.actions,
      });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ error: "Failed to process AI conversation" });
    }
  });

  // Quick action endpoint for predefined actions
  app.post("/api/ai/quick-action", isAuthenticated, async (req, res) => {
    try {
      const { action } = req.body;
      if (!action || typeof action !== "string") {
        return res.status(400).json({ error: "Action is required" });
      }

      let actionMessage = "";
      switch (action) {
        case "attack":
          actionMessage = "I ready my weapon and prepare to attack!";
          break;
        case "investigate":
          actionMessage =
            "I carefully examine my surroundings for clues and details.";
          break;
        case "talk":
          actionMessage = "I attempt to communicate and engage in dialogue.";
          break;
        case "defend":
          actionMessage =
            "I take a defensive stance and prepare to protect myself.";
          break;
        case "cast":
          actionMessage = "I prepare to cast a spell or use magic.";
          break;
        case "use-item":
          actionMessage = "I look through my items to find something useful.";
          break;
        default:
          actionMessage = `I perform the ${action} action.`;
      }

      // Process the quick action as a regular chat message
      const aiResponse = await aiService.generateResponse(actionMessage);

      // Store messages and apply actions (same as regular chat)
      const activeCampaign = await storage.getActiveCampaign();
      await storage.createMessage({
        campaignId: activeCampaign?.id || 'default',
        content: actionMessage,
        sender: "player",
        senderName: null,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      const aiMessage = await storage.createMessage({
        campaignId: activeCampaign?.id || 'default',
        content: aiResponse.content,
        sender: aiResponse.sender,
        senderName: aiResponse.senderName,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      // Apply actions if any with validation
      if (aiResponse.actions) {
        const actions = aiResponse.actions;

        if (actions.updateQuest) {
          const questValidation = updateQuestSchema.safeParse(
            actions.updateQuest.updates,
          );
          if (questValidation.success) {
            const updatedQuest = await storage.updateQuest(
              actions.updateQuest.id,
              questValidation.data,
            );

            // Generate follow-up quest if main story quest was just completed
            if (
              updatedQuest &&
              (updatedQuest as any).wasJustCompleted &&
              updatedQuest.isMainStory
            ) {
              try {
                const character = await storage.getCharacter();
                const gameState = await storage.getGameState();
                const followUpQuest = await aiService.generateFollowUpQuest(
                  updatedQuest,
                  { character, gameState },
                );

                if (followUpQuest) {
                  // Ensure the completed quest has a chainId for consistency
                  if (!updatedQuest.chainId) {
                    await storage.updateQuest(updatedQuest.id, {
                      chainId: updatedQuest.id,
                    });
                  }

                  // Validate and create follow-up quest
                  const activeCampaign = await storage.getActiveCampaign();
                  const questValidation = insertQuestSchema.safeParse({
                    ...followUpQuest,
                    campaignId: activeCampaign?.id || 'default',
                    parentQuestId: updatedQuest.id,
                    chainId: updatedQuest.chainId || updatedQuest.id,
                    isMainStory: true,
                  });

                  if (questValidation.success) {
                    await storage.createQuest(questValidation.data);
                  } else {
                    console.warn(
                      "Invalid follow-up quest data:",
                      questValidation.error.errors,
                    );
                  }
                }
              } catch (error) {
                console.warn("Error generating follow-up quest:", error);
              }
            }
          } else {
            console.warn(
              "Invalid AI quest update:",
              questValidation.error.errors,
            );
          }
        }
        if (actions.createQuest) {
          const activeCampaign = await storage.getActiveCampaign();
          const questValidation = insertQuestSchema.safeParse({
            ...actions.createQuest,
            campaignId: activeCampaign?.id || 'default',
          });
          if (questValidation.success) {
            await storage.createQuest(questValidation.data);
          } else {
            console.warn(
              "Invalid AI quest creation:",
              questValidation.error.errors,
            );
          }
        }
        if (actions.updateCharacter) {
          const character = await storage.getCharacter();
          if (character) {
            const charValidation = updateCharacterSchema.safeParse(
              actions.updateCharacter.updates,
            );
            if (charValidation.success) {
              await storage.updateCharacter(character.id, charValidation.data);
            } else {
              console.warn(
                "Invalid AI character update:",
                charValidation.error.errors,
              );
            }
          }
        }
        if (actions.updateGameState) {
          const gameStateValidation = insertGameStateSchema
            .partial()
            .safeParse(actions.updateGameState);
          if (gameStateValidation.success) {
            await storage.updateGameState(gameStateValidation.data);
          } else {
            console.warn(
              "Invalid AI game state update:",
              gameStateValidation.error.errors,
            );
          }
        }
        if (actions.giveItem) {
          const activeCampaign = await storage.getActiveCampaign();
          const itemValidation = insertItemSchema.safeParse({
            ...actions.giveItem,
            campaignId: activeCampaign?.id || 'default',
          });
          if (itemValidation.success) {
            await storage.createItem(itemValidation.data);
          } else {
            console.warn(
              "Invalid AI item creation:",
              itemValidation.error.errors,
            );
          }
        }
      }

      res.json({
        message: aiMessage,
        actions: aiResponse.actions,
      });
    } catch (error) {
      console.error("Error in quick action:", error);
      res.status(500).json({ error: "Failed to process quick action" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const campaigns = await storage.getCampaignsByUser(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/active", isAuthenticated, async (_req, res) => {
    try {
      const campaign = await storage.getActiveCampaign();
      if (!campaign) {
        return res.status(404).json({ error: "No active campaign" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching active campaign:", error);
      res.status(500).json({ error: "Failed to fetch active campaign" });
    }
  });

  app.post("/api/campaigns", isAuthenticated, async (req, res) => {
    try {
      const result = insertCampaignSchema
        .omit({ id: true, createdAt: true, lastPlayed: true, isActive: true })
        .safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid campaign data",
          details: result.error.errors,
        });
      }

      const campaign = await storage.createCampaign(result.data);
      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.patch("/api/campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const result = updateCampaignSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid campaign data",
          details: result.error.errors,
        });
      }

      const campaign = await storage.updateCampaign(req.params.id, result.data);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  app.patch("/api/campaigns/:id/activate", isAuthenticated, async (req, res) => {
    try {
      const campaign = await storage.setActiveCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error activating campaign:", error);
      res.status(500).json({ error: "Failed to activate campaign" });
    }
  });

  app.delete("/api/campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteCampaign(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  app.post("/api/campaigns/:id/reset-rounds", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      const gameState = await storage.getGameState();
      if (gameState) {
        await storage.updateGameState({
          turnCount: 0,
          currentTurn: null,
          combatId: null,
          inCombat: false,
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error resetting rounds:", error);
      res.status(500).json({ error: "Failed to reset rounds" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
