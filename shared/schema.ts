import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  imageUrl: text("image_url"),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  languageId: integer("language_id").notNull().references(() => languages.id),
  readingAccuracy: integer("reading_accuracy").default(0),
  vocabularyCount: integer("vocabulary_count").default(0),
  activitiesCompleted: integer("activities_completed").default(0),
  totalActivities: integer("total_activities").default(30),
  lastActivity: timestamp("last_activity").defaultNow(),
  level: integer("level").default(1),
  stars: integer("stars").default(0),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'image-ocr', 'game', 'story'
  imageUrl: text("image_url"),
  duration: text("duration").notNull(),
  category: text("category").notNull(), // 'new', 'popular', 'creative'
  badge: text("badge"),
  languages: text("languages").array(),
});

export const userActivityHistory = pgTable("user_activity_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityId: integer("activity_id").notNull().references(() => activities.id),
  languageId: integer("language_id").notNull().references(() => languages.id),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  score: integer("score"),
  feedback: json("feedback"),
});

export const extractedTexts = pgTable("extracted_texts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  languageId: integer("language_id").notNull().references(() => languages.id),
  text: text("text").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  difficulty: text("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced', 'all'
  languages: text("languages").array(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertLanguageSchema = createInsertSchema(languages).omit({
  id: true
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastActivity: true
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true
});

export const insertUserActivityHistorySchema = createInsertSchema(userActivityHistory).omit({
  id: true,
  startTime: true,
  endTime: true
});

export const insertExtractedTextSchema = createInsertSchema(extractedTexts).omit({
  id: true,
  createdAt: true
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type Language = typeof languages.$inferSelect;

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertUserActivityHistory = z.infer<typeof insertUserActivityHistorySchema>;
export type UserActivityHistory = typeof userActivityHistory.$inferSelect;

export type InsertExtractedText = z.infer<typeof insertExtractedTextSchema>;
export type ExtractedText = typeof extractedTexts.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
