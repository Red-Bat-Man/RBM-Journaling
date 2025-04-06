import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Emotions table
export const emotions = pgTable("emotions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  color: text("color").notNull(),
});

export const insertEmotionSchema = createInsertSchema(emotions).pick({
  name: true,
  emoji: true,
  color: true,
});

export type InsertEmotion = z.infer<typeof insertEmotionSchema>;
export type Emotion = typeof emotions.$inferSelect;

// People table
export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const insertPersonSchema = createInsertSchema(people).pick({
  name: true,
});

export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type Person = typeof people.$inferSelect;

// Places table
export const places = pgTable("places", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").default("📍"),
});

export const insertPlaceSchema = createInsertSchema(places).pick({
  name: true,
  icon: true,
});

export type InsertPlace = z.infer<typeof insertPlaceSchema>;
export type Place = typeof places.$inferSelect;

// Journal entries table
export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  emotionId: integer("emotion_id"),
  placeId: integer("place_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isFavorite: boolean("is_favorite").notNull().default(false),
});

export const insertEntrySchema = createInsertSchema(entries).pick({
  title: true,
  content: true,
  emotionId: true,
  placeId: true,
  isFavorite: true,
});

export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entries.$inferSelect;

// Junction table for entries and people
export const entryPeople = pgTable("entry_people", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull(),
  personId: integer("person_id").notNull(),
});

export const insertEntryPersonSchema = createInsertSchema(entryPeople).pick({
  entryId: true,
  personId: true,
});

export type InsertEntryPerson = z.infer<typeof insertEntryPersonSchema>;
export type EntryPerson = typeof entryPeople.$inferSelect;

// Schema for creating an entry with people
export const createEntrySchema = z.object({
  entry: insertEntrySchema,
  peopleIds: z.array(z.number()).optional(),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;

// Extended entry type with emotion, place, and people
export type EntryWithRelations = Entry & {
  emotion?: Emotion;
  place?: Place;
  people: Person[];
};
