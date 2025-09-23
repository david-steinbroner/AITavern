import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// D&D Character Schema
export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  class: text("class").notNull(),
  level: integer("level").default(1).notNull(),
  experience: integer("experience").default(0).notNull(),
  
  // Core D&D Stats
  strength: integer("strength").default(10).notNull(),
  dexterity: integer("dexterity").default(10).notNull(),
  constitution: integer("constitution").default(10).notNull(),
  intelligence: integer("intelligence").default(10).notNull(),
  wisdom: integer("wisdom").default(10).notNull(),
  charisma: integer("charisma").default(10).notNull(),
  
  // Health and Resources
  currentHealth: integer("current_health").notNull(),
  maxHealth: integer("max_health").notNull(),
  currentMana: integer("current_mana").default(0).notNull(),
  maxMana: integer("max_mana").default(0).notNull(),
});

// Quest Schema
export const quests = pgTable("quests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // active, completed, failed
  priority: text("priority").default("normal").notNull(), // low, normal, high, urgent
  progress: integer("progress").default(0).notNull(),
  maxProgress: integer("max_progress").default(1).notNull(),
  reward: text("reward"),
});

// Inventory Item Schema
export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // weapon, armor, consumable, misc
  description: text("description"),
  quantity: integer("quantity").default(1).notNull(),
  rarity: text("rarity").default("common").notNull(), // common, uncommon, rare, epic, legendary
  equipped: boolean("equipped").default(false).notNull(),
});

// Chat Message Schema for AI DM
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  sender: text("sender").notNull(), // player, dm, npc
  senderName: text("sender_name"),
  timestamp: text("timestamp").notNull(),
});

// Game State Schema
export const gameState = pgTable("game_state", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  currentScene: text("current_scene").notNull(),
  inCombat: boolean("in_combat").default(false).notNull(),
  currentTurn: text("current_turn"),
});

// Create schemas
export const insertCharacterSchema = createInsertSchema(characters);
export const insertQuestSchema = createInsertSchema(quests);
export const insertItemSchema = createInsertSchema(items);
export const insertMessageSchema = createInsertSchema(messages);
export const insertGameStateSchema = createInsertSchema(gameState);

// Types
export type Character = typeof characters.$inferSelect;
export type Quest = typeof quests.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type GameState = typeof gameState.$inferSelect;

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;

// Legacy user schema for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
