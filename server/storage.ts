import { 
  type User, 
  type InsertUser,
  type Character,
  type InsertCharacter,
  type Quest,
  type InsertQuest,
  type Item,
  type InsertItem,
  type Message,
  type InsertMessage,
  type GameState,
  type InsertGameState
} from "@shared/schema";
import { randomUUID } from "crypto";

// AI TTRPG Game Storage Interface
export interface IStorage {
  // User management (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Character management
  getCharacter(): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: string, updates: Partial<Character>): Promise<Character | null>;
  init(): Promise<void>;
  
  // Quest management
  getQuests(): Promise<Quest[]>;
  getQuest(id: string): Promise<Quest | undefined>;
  createQuest(quest: InsertQuest): Promise<Quest>;
  updateQuest(id: string, updates: Partial<Quest>): Promise<Quest | null>;
  deleteQuest(id: string): Promise<boolean>;
  
  // Inventory management
  getItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, updates: Partial<Item>): Promise<Item | null>;
  deleteItem(id: string): Promise<boolean>;
  
  // Message history for AI conversations
  getMessages(): Promise<Message[]>;
  getRecentMessages(limit: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  clearMessages(): Promise<void>;
  
  // Game state management
  getGameState(): Promise<GameState | undefined>;
  createGameState(state: InsertGameState): Promise<GameState>;
  updateGameState(updates: Partial<GameState>): Promise<GameState>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private character: Character | undefined;
  private quests: Map<string, Quest>;
  private items: Map<string, Item>;
  private messages: Message[];
  private gameState: GameState | undefined;

  constructor() {
    this.users = new Map();
    this.quests = new Map();
    this.items = new Map();
    this.messages = [];
  }

  async init(): Promise<void> {
    await this.initializeDefaultData();
  }

  private async initializeDefaultData(): Promise<void> {
    // Create a default character if none exists
    if (!this.character) {
      await this.createCharacter({
        name: 'Adventurer',
        class: 'Fighter',
        level: 1,
        experience: 0,
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 12,
        charisma: 11,
        currentHealth: 10,
        maxHealth: 10,
        currentMana: 0,
        maxMana: 0,
      });
    }

    // Initialize with some starter items
    if (this.items.size === 0) {
      await this.createItem({
        name: 'Iron Sword',
        type: 'weapon',
        description: 'A sturdy iron blade.',
        quantity: 1,
        rarity: 'common',
        equipped: true,
      });
      
      await this.createItem({
        name: 'Leather Armor',
        type: 'armor',
        description: 'Basic protection.',
        quantity: 1,
        rarity: 'common',
        equipped: true,
      });
      
      await this.createItem({
        name: 'Health Potion',
        type: 'consumable',
        description: 'Restores 25 HP.',
        quantity: 2,
        rarity: 'common',
        equipped: false,
      });
    }

    // Initialize with a starter quest
    if (this.quests.size === 0) {
      await this.createQuest({
        title: 'Begin Your Adventure',
        description: 'Welcome to your journey! Explore the world and discover your destiny.',
        status: 'active',
        priority: 'normal',
        progress: 0,
        maxProgress: 1,
        reward: 'Experience and glory',
      });
    }

    // Initialize game state
    if (!this.gameState) {
      this.gameState = {
        id: randomUUID(),
        currentScene: 'Starting Village',
        inCombat: false,
        currentTurn: null,
      };
    }
  }

  // User management (legacy)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Character management
  async getCharacter(): Promise<Character | undefined> {
    return this.character;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const id = randomUUID();
    const newCharacter: Character = {
      id,
      name: character.name,
      class: character.class,
      level: character.level ?? 1,
      experience: character.experience ?? 0,
      strength: character.strength ?? 10,
      dexterity: character.dexterity ?? 10,
      constitution: character.constitution ?? 10,
      intelligence: character.intelligence ?? 10,
      wisdom: character.wisdom ?? 10,
      charisma: character.charisma ?? 10,
      currentHealth: character.currentHealth,
      maxHealth: character.maxHealth,
      currentMana: character.currentMana ?? 0,
      maxMana: character.maxMana ?? 0,
    };
    this.character = newCharacter;
    return this.character;
  }

  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character | null> {
    if (!this.character || this.character.id !== id) {
      return null;
    }
    
    // Apply updates with validation
    const updatedCharacter = { ...this.character, ...updates };
    
    // Ensure health doesn't exceed max and isn't negative
    if (updatedCharacter.currentHealth > updatedCharacter.maxHealth) {
      updatedCharacter.currentHealth = updatedCharacter.maxHealth;
    }
    if (updatedCharacter.currentHealth < 0) {
      updatedCharacter.currentHealth = 0;
    }
    
    // Ensure mana doesn't exceed max and isn't negative
    if (updatedCharacter.currentMana > updatedCharacter.maxMana) {
      updatedCharacter.currentMana = updatedCharacter.maxMana;
    }
    if (updatedCharacter.currentMana < 0) {
      updatedCharacter.currentMana = 0;
    }
    
    this.character = updatedCharacter;
    return this.character;
  }

  // Quest management
  async getQuests(): Promise<Quest[]> {
    return Array.from(this.quests.values()).sort((a, b) => {
      // Sort by priority (urgent > high > normal > low), then by status (active first)
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const statusOrder = { active: 0, completed: 1, failed: 2 };
      
      const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;
      
      return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
    });
  }

  async getQuest(id: string): Promise<Quest | undefined> {
    return this.quests.get(id);
  }

  async createQuest(quest: InsertQuest): Promise<Quest> {
    const id = randomUUID();
    const newQuest: Quest = {
      id,
      title: quest.title,
      description: quest.description,
      status: quest.status,
      priority: quest.priority ?? 'normal',
      progress: quest.progress ?? 0,
      maxProgress: quest.maxProgress ?? 1,
      reward: quest.reward ?? null,
    };
    this.quests.set(id, newQuest);
    return newQuest;
  }

  async updateQuest(id: string, updates: Partial<Quest>): Promise<Quest | null> {
    const quest = this.quests.get(id);
    if (!quest) {
      return null;
    }
    
    const updatedQuest = { ...quest, ...updates };
    
    // Ensure progress doesn't exceed max and isn't negative
    if (updatedQuest.progress > updatedQuest.maxProgress) {
      updatedQuest.progress = updatedQuest.maxProgress;
    }
    if (updatedQuest.progress < 0) {
      updatedQuest.progress = 0;
    }
    
    this.quests.set(id, updatedQuest);
    return updatedQuest;
  }

  async deleteQuest(id: string): Promise<boolean> {
    return this.quests.delete(id);
  }

  // Inventory management
  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values()).sort((a, b) => {
      // Sort by equipped status first, then by rarity, then by type
      if (a.equipped !== b.equipped) return a.equipped ? -1 : 1;
      
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
      const rarityDiff = rarityOrder[a.rarity as keyof typeof rarityOrder] - rarityOrder[b.rarity as keyof typeof rarityOrder];
      if (rarityDiff !== 0) return rarityDiff;
      
      const typeOrder = { weapon: 0, armor: 1, consumable: 2, misc: 3 };
      return typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder];
    });
  }

  async getItem(id: string): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async createItem(item: InsertItem): Promise<Item> {
    const id = randomUUID();
    const newItem: Item = {
      id,
      name: item.name,
      type: item.type,
      description: item.description ?? null,
      quantity: item.quantity ?? 1,
      rarity: item.rarity ?? 'common',
      equipped: item.equipped ?? false,
    };
    this.items.set(id, newItem);
    return newItem;
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item | null> {
    const item = this.items.get(id);
    if (!item) {
      return null;
    }
    
    const updatedItem = { ...item, ...updates };
    
    // Ensure quantity isn't negative
    if (updatedItem.quantity < 0) {
      updatedItem.quantity = 0;
    }
    
    // If equipped, ensure quantity is at least 1
    if (updatedItem.equipped && updatedItem.quantity === 0) {
      updatedItem.equipped = false;
    }
    
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  async deleteItem(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  // Message history for AI conversations
  async getMessages(): Promise<Message[]> {
    return [...this.messages];
  }

  async getRecentMessages(limit: number): Promise<Message[]> {
    return this.messages.slice(-limit);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const newMessage: Message = {
      id,
      content: message.content,
      sender: message.sender,
      senderName: message.senderName ?? null,
      timestamp: message.timestamp,
    };
    this.messages.push(newMessage);
    
    // Keep only the last 100 messages to prevent memory issues
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100);
    }
    
    return newMessage;
  }

  async clearMessages(): Promise<void> {
    this.messages = [];
  }

  // Game state management
  async getGameState(): Promise<GameState | undefined> {
    return this.gameState;
  }

  async createGameState(state: InsertGameState): Promise<GameState> {
    const id = randomUUID();
    const newGameState: GameState = {
      id,
      currentScene: state.currentScene,
      inCombat: state.inCombat ?? false,
      currentTurn: state.currentTurn ?? null,
    };
    this.gameState = newGameState;
    return this.gameState;
  }

  async updateGameState(updates: Partial<GameState>): Promise<GameState> {
    if (!this.gameState) {
      throw new Error('Game state not found');
    }
    this.gameState = { ...this.gameState, ...updates };
    return this.gameState;
  }
}

export const storage = new MemStorage();
