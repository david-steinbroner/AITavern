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
  type Enemy,
  type InsertEnemy,
  type GameState,
  type InsertGameState,
  type Campaign,
  type InsertCampaign,
  type StorySummary,
  type InsertStorySummary
} from "@shared/schema";
import { DbStorage } from "./dbStorage";

// AI TTRPG Game Storage Interface
export interface IStorage {
  // User management (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Character management
  init(sessionId: string): Promise<void>;
  getCharacter(sessionId: string, storyId?: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: string, sessionId: string, updates: Partial<Character>): Promise<Character | null>;

  // Quest management
  getQuests(sessionId: string, storyId?: string): Promise<Quest[]>;
  getQuest(id: string, sessionId: string): Promise<Quest | undefined>;
  createQuest(quest: InsertQuest): Promise<Quest>;
  updateQuest(id: string, sessionId: string, updates: Partial<Quest>): Promise<Quest | null>;
  deleteQuest(id: string, sessionId: string): Promise<boolean>;
  clearQuests(sessionId: string): Promise<void>;

  // Inventory management
  getItems(sessionId: string, storyId?: string): Promise<Item[]>;
  getItem(id: string, sessionId: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, sessionId: string, updates: Partial<Item>): Promise<Item | null>;
  deleteItem(id: string, sessionId: string): Promise<boolean>;

  // Enemy management
  getEnemies(combatId?: string): Promise<Enemy[]>;
  getEnemy(id: string): Promise<Enemy | undefined>;
  createEnemy(enemy: InsertEnemy): Promise<Enemy>;
  updateEnemy(id: string, updates: Partial<Enemy>): Promise<Enemy | null>;
  deleteEnemy(id: string): Promise<boolean>;

  // Message history for AI conversations
  getMessages(sessionId: string, storyId?: string): Promise<Message[]>;
  getRecentMessages(sessionId: string, limit: number, storyId?: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  clearMessages(sessionId: string): Promise<void>;

  // Clear all adventure data
  clearAllAdventureData(sessionId: string, storyId?: string): Promise<void>;

  // Campaign management
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  getActiveCampaign(): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null>;
  deleteCampaign(id: string): Promise<boolean>;
  setActiveCampaign(id: string): Promise<Campaign | null>;

  // Game state management
  getGameState(sessionId: string, storyId?: string): Promise<GameState | undefined>;
  getStories(sessionId: string): Promise<GameState[]>;
  createGameState(state: InsertGameState): Promise<GameState>;
  updateGameState(sessionId: string, updates: Partial<GameState>, storyId?: string): Promise<GameState>;

  // Story summary management (AI memory)
  getActiveSummary(sessionId: string, storyId?: string): Promise<StorySummary | null>;
  createSummary(sessionId: string, summary: InsertStorySummary): Promise<StorySummary>;
  deactivateSummaries(sessionId: string, storyId?: string): Promise<void>;
}

export const storage: IStorage = new DbStorage();
