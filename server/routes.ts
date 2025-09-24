import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCharacterSchema,
  insertQuestSchema,
  insertItemSchema,
  insertMessageSchema,
  insertGameStateSchema,
  type Character,
  type Quest,
  type Item
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
  { message: "Health and mana values must be valid" }
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
  { message: "Quest progress must be valid" }
);

const updateItemSchema = insertItemSchema.partial().refine(
  (data) => {
    if (data.quantity !== undefined) {
      return data.quantity >= 0;
    }
    return true;
  },
  { message: "Item quantity must be non-negative" }
);

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize storage with default data
  await storage.init();
  // Character routes
  app.get("/api/character", async (_req, res) => {
    try {
      const character = await storage.getCharacter();
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      console.error('Error fetching character:', error);
      res.status(500).json({ error: "Failed to fetch character" });
    }
  });

  app.post("/api/character", async (req, res) => {
    try {
      const result = insertCharacterSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid character data", details: result.error.errors });
      }
      
      const character = await storage.createCharacter(result.data);
      res.json(character);
    } catch (error) {
      console.error('Error creating character:', error);
      res.status(500).json({ error: "Failed to create character" });
    }
  });

  app.patch("/api/character/:id", async (req, res) => {
    try {
      const result = updateCharacterSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid character data", details: result.error.errors });
      }
      
      const character = await storage.updateCharacter(req.params.id, result.data);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      console.error('Error updating character:', error);
      res.status(500).json({ error: "Failed to update character" });
    }
  });

  // Quest routes
  app.get("/api/quests", async (_req, res) => {
    try {
      const quests = await storage.getQuests();
      res.json(quests);
    } catch (error) {
      console.error('Error fetching quests:', error);
      res.status(500).json({ error: "Failed to fetch quests" });
    }
  });

  app.get("/api/quests/:id", async (req, res) => {
    try {
      const quest = await storage.getQuest(req.params.id);
      if (!quest) {
        return res.status(404).json({ error: "Quest not found" });
      }
      res.json(quest);
    } catch (error) {
      console.error('Error fetching quest:', error);
      res.status(500).json({ error: "Failed to fetch quest" });
    }
  });

  app.post("/api/quests", async (req, res) => {
    try {
      const result = insertQuestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid quest data", details: result.error.errors });
      }
      
      const quest = await storage.createQuest(result.data);
      res.json(quest);
    } catch (error) {
      console.error('Error creating quest:', error);
      res.status(500).json({ error: "Failed to create quest" });
    }
  });

  app.patch("/api/quests/:id", async (req, res) => {
    try {
      const result = updateQuestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid quest data", details: result.error.errors });
      }
      
      const quest = await storage.updateQuest(req.params.id, result.data);
      if (!quest) {
        return res.status(404).json({ error: "Quest not found" });
      }
      res.json(quest);
    } catch (error) {
      console.error('Error updating quest:', error);
      res.status(500).json({ error: "Failed to update quest" });
    }
  });

  app.delete("/api/quests/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteQuest(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Quest not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting quest:', error);
      res.status(500).json({ error: "Failed to delete quest" });
    }
  });

  // Inventory routes
  app.get("/api/items", async (_req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  app.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error('Error fetching item:', error);
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      const result = insertItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid item data", details: result.error.errors });
      }
      
      const item = await storage.createItem(result.data);
      res.json(item);
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({ error: "Failed to create item" });
    }
  });

  app.patch("/api/items/:id", async (req, res) => {
    try {
      const result = updateItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid item data", details: result.error.errors });
      }
      
      const item = await storage.updateItem(req.params.id, result.data);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Message routes for AI conversation
  app.get("/api/messages", async (req, res) => {
    try {
      let limit: number | undefined;
      if (req.query.limit) {
        const parsed = parseInt(req.query.limit as string);
        if (isNaN(parsed) || parsed < 1) {
          return res.status(400).json({ error: "Invalid limit parameter" });
        }
        limit = Math.min(parsed, 100); // Cap at 100 messages
      }
      
      const messages = limit ? 
        await storage.getRecentMessages(limit) : 
        await storage.getMessages();
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      // Set server-side timestamp
      const messageData = {
        ...req.body,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      const result = insertMessageSchema.safeParse(messageData);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid message data", details: result.error.errors });
      }
      
      const message = await storage.createMessage(result.data);
      res.json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.delete("/api/messages", async (_req, res) => {
    try {
      await storage.clearMessages();
      res.json({ success: true });
    } catch (error) {
      console.error('Error clearing messages:', error);
      res.status(500).json({ error: "Failed to clear messages" });
    }
  });

  // Game state routes
  app.get("/api/game-state", async (_req, res) => {
    try {
      const gameState = await storage.getGameState();
      res.json(gameState);
    } catch (error) {
      console.error('Error fetching game state:', error);
      res.status(500).json({ error: "Failed to fetch game state" });
    }
  });

  app.post("/api/game-state", async (req, res) => {
    try {
      const result = insertGameStateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid game state data", details: result.error.errors });
      }
      
      const gameState = await storage.createGameState(result.data);
      res.json(gameState);
    } catch (error) {
      console.error('Error creating game state:', error);
      res.status(500).json({ error: "Failed to create game state" });
    }
  });

  app.patch("/api/game-state", async (req, res) => {
    try {
      const gameState = await storage.updateGameState(req.body);
      res.json(gameState);
    } catch (error) {
      console.error('Error updating game state:', error);
      res.status(500).json({ error: "Failed to update game state" });
    }
  });

  // AI Conversation endpoints
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      // Generate AI response
      const aiResponse = await aiService.generateResponse(message);

      // Store the player message
      await storage.createMessage({
        content: message,
        sender: 'player',
        senderName: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Store the AI response
      const aiMessage = await storage.createMessage({
        content: aiResponse.content,
        sender: aiResponse.sender,
        senderName: aiResponse.senderName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Apply any game actions from the AI response with validation
      if (aiResponse.actions) {
        const actions = aiResponse.actions;
        
        // Update quest if specified
        if (actions.updateQuest) {
          const questValidation = updateQuestSchema.safeParse(actions.updateQuest.updates);
          if (questValidation.success) {
            await storage.updateQuest(actions.updateQuest.id, questValidation.data);
          } else {
            console.warn('Invalid AI quest update:', questValidation.error.errors);
          }
        }

        // Create new quest if specified
        if (actions.createQuest) {
          const questValidation = insertQuestSchema.safeParse(actions.createQuest);
          if (questValidation.success) {
            await storage.createQuest(questValidation.data);
          } else {
            console.warn('Invalid AI quest creation:', questValidation.error.errors);
          }
        }

        // Update character if specified
        if (actions.updateCharacter) {
          const character = await storage.getCharacter();
          if (character) {
            const charValidation = updateCharacterSchema.safeParse(actions.updateCharacter.updates);
            if (charValidation.success) {
              await storage.updateCharacter(character.id, charValidation.data);
            } else {
              console.warn('Invalid AI character update:', charValidation.error.errors);
            }
          }
        }

        // Update game state if specified
        if (actions.updateGameState) {
          const gameStateValidation = insertGameStateSchema.partial().safeParse(actions.updateGameState);
          if (gameStateValidation.success) {
            await storage.updateGameState(gameStateValidation.data);
          } else {
            console.warn('Invalid AI game state update:', gameStateValidation.error.errors);
          }
        }

        // Give item if specified
        if (actions.giveItem) {
          const itemValidation = insertItemSchema.safeParse(actions.giveItem);
          if (itemValidation.success) {
            await storage.createItem(itemValidation.data);
          } else {
            console.warn('Invalid AI item creation:', itemValidation.error.errors);
          }
        }
      }

      res.json({
        message: aiMessage,
        actions: aiResponse.actions
      });

    } catch (error) {
      console.error('Error in AI chat:', error);
      res.status(500).json({ error: "Failed to process AI conversation" });
    }
  });

  // Quick action endpoint for predefined actions
  app.post("/api/ai/quick-action", async (req, res) => {
    try {
      const { action } = req.body;
      if (!action || typeof action !== 'string') {
        return res.status(400).json({ error: "Action is required" });
      }

      let actionMessage = '';
      switch (action) {
        case 'attack':
          actionMessage = 'I ready my weapon and prepare to attack!';
          break;
        case 'investigate':
          actionMessage = 'I carefully examine my surroundings for clues and details.';
          break;
        case 'talk':
          actionMessage = 'I attempt to communicate and engage in dialogue.';
          break;
        case 'defend':
          actionMessage = 'I take a defensive stance and prepare to protect myself.';
          break;
        case 'cast':
          actionMessage = 'I prepare to cast a spell or use magic.';
          break;
        case 'use-item':
          actionMessage = 'I look through my items to find something useful.';
          break;
        default:
          actionMessage = `I perform the ${action} action.`;
      }

      // Process the quick action as a regular chat message
      const aiResponse = await aiService.generateResponse(actionMessage);

      // Store messages and apply actions (same as regular chat)
      await storage.createMessage({
        content: actionMessage,
        sender: 'player',
        senderName: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      const aiMessage = await storage.createMessage({
        content: aiResponse.content,
        sender: aiResponse.sender,
        senderName: aiResponse.senderName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Apply actions if any with validation
      if (aiResponse.actions) {
        const actions = aiResponse.actions;
        
        if (actions.updateQuest) {
          const questValidation = updateQuestSchema.safeParse(actions.updateQuest.updates);
          if (questValidation.success) {
            await storage.updateQuest(actions.updateQuest.id, questValidation.data);
          } else {
            console.warn('Invalid AI quest update:', questValidation.error.errors);
          }
        }
        if (actions.createQuest) {
          const questValidation = insertQuestSchema.safeParse(actions.createQuest);
          if (questValidation.success) {
            await storage.createQuest(questValidation.data);
          } else {
            console.warn('Invalid AI quest creation:', questValidation.error.errors);
          }
        }
        if (actions.updateCharacter) {
          const character = await storage.getCharacter();
          if (character) {
            const charValidation = updateCharacterSchema.safeParse(actions.updateCharacter.updates);
            if (charValidation.success) {
              await storage.updateCharacter(character.id, charValidation.data);
            } else {
              console.warn('Invalid AI character update:', charValidation.error.errors);
            }
          }
        }
        if (actions.updateGameState) {
          const gameStateValidation = insertGameStateSchema.partial().safeParse(actions.updateGameState);
          if (gameStateValidation.success) {
            await storage.updateGameState(gameStateValidation.data);
          } else {
            console.warn('Invalid AI game state update:', gameStateValidation.error.errors);
          }
        }
        if (actions.giveItem) {
          const itemValidation = insertItemSchema.safeParse(actions.giveItem);
          if (itemValidation.success) {
            await storage.createItem(itemValidation.data);
          } else {
            console.warn('Invalid AI item creation:', itemValidation.error.errors);
          }
        }
      }

      res.json({
        message: aiMessage,
        actions: aiResponse.actions
      });

    } catch (error) {
      console.error('Error in quick action:', error);
      res.status(500).json({ error: "Failed to process quick action" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
