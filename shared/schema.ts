import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nickname: text("nickname").notNull(),
  restDays: text("rest_days").notNull().default("Sun-Mon"),
  status: text("status").notNull().default("N/A"),
  assignments: jsonb("assignments").notNull().default({}),
  total: integer("total").notNull().default(0),
  avatar: text("avatar"),
  sortOrder: integer("sort_order").notNull().default(0),
  productivity: integer("productivity").notNull().default(0),
});

export const insertAgentSchema = createInsertSchema(agents).omit({ id: true });
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export const appState = pgTable("app_state", {
  id: varchar("id").primaryKey().default("default"),
  headcountData: jsonb("headcount_data").notNull().default({}),
  timeSlots: text("time_slots").array().notNull().default([]),
  lockedSlots: text("locked_slots").array().notNull().default([]),
  segmentationResults: jsonb("segmentation_results").notNull().default([]),
  queueTimeSlots: jsonb("queue_time_slots").notNull().default({}),
  productivityImage: text("productivity_image").default(""),
  productivityQuota: integer("productivity_quota").notNull().default(100),
  hasGenerated: text("has_generated").notNull().default("false"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertAppStateSchema = createInsertSchema(appState).omit({ id: true, lastUpdated: true });
export type InsertAppState = z.infer<typeof insertAppStateSchema>;
export type AppState = typeof appState.$inferSelect;
