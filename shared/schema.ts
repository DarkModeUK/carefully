import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("care_worker"),
  skillLevels: jsonb("skill_levels").$type<Record<string, number>>().default({}),
  totalScenarios: integer("total_scenarios").default(0),
  weeklyStreak: integer("weekly_streak").default(0),
  totalTime: integer("total_time").default(0), // in minutes
  preferences: jsonb("preferences").$type<{
    trainingDuration?: number;
    difficultyPreference?: 'beginner' | 'intermediate' | 'advanced' | 'adaptive';
    focusAreas?: string[];
    notifications?: {
      dailyReminders?: boolean;
      weeklyProgress?: boolean;
      newScenarios?: boolean;
      achievements?: boolean;
    };
    learningGoals?: string;
  }>().default({}),
  profileCompletion: integer("profile_completion").default(0),
  lastAssessment: timestamp("last_assessment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scenarios = pgTable("scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  estimatedTime: integer("estimated_time").notNull(), // in minutes
  priority: text("priority").notNull().default("medium"),
  context: text("context").notNull(),
  learningObjectives: jsonb("learning_objectives").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
});

export const userScenarios = pgTable("user_scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  scenarioId: varchar("scenario_id").notNull().references(() => scenarios.id),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
  progress: integer("progress").default(0), // 0-100
  responses: jsonb("responses").$type<any[]>().default([]),
  feedback: jsonb("feedback").$type<any[]>().default([]),
  completedAt: timestamp("completed_at"),
  startedAt: timestamp("started_at"),
  totalTime: integer("total_time").default(0), // in minutes
  score: integer("score").default(0), // 0-100
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
});

export const insertUserScenarioSchema = createInsertSchema(userScenarios).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  unlockedAt: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userScenarios: many(userScenarios),
  achievements: many(achievements),
}));

export const scenariosRelations = relations(scenarios, ({ many }) => ({
  userScenarios: many(userScenarios),
}));

export const userScenariosRelations = relations(userScenarios, ({ one }) => ({
  user: one(users, {
    fields: [userScenarios.userId],
    references: [users.id],
  }),
  scenario: one(scenarios, {
    fields: [userScenarios.scenarioId],
    references: [scenarios.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;
export type InsertUserScenario = z.infer<typeof insertUserScenarioSchema>;
export type UserScenario = typeof userScenarios.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
