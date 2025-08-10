import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
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
    bookmarkedScenarios?: string[]; // Quick Win: Scenario bookmarking
  }>().default({}),
  currentStreak: integer("current_streak").default(0), // Quick Win: Progress streaks
  longestStreak: integer("longest_streak").default(0),
  lastPracticeDate: timestamp("last_practice_date"),
  emotionalState: jsonb("emotional_state").$type<{
    confidence?: number; // 1-10 scale
    stress?: number;
    empathy?: number;
    resilience?: number;
  }>().default({}),
  culturalCompetency: jsonb("cultural_competency").$type<{
    awarenessLevel?: number;
    completedCultures?: string[];
    sensitivityScore?: number;
  }>().default({}),
  profileCompletion: integer("profile_completion").default(0),
  lastAssessment: timestamp("last_assessment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  tags: jsonb("tags").$type<string[]>().default([]), // Quick Win: Difficulty tags and categorisation
  visualAids: jsonb("visual_aids").$type<{
    images?: string[];
    videos?: string[];
    diagrams?: string[];
  }>().default({}),
  culturalContext: jsonb("cultural_context").$type<{
    cultures?: string[];
    sensitivities?: string[];
    considerations?: string[];
  }>().default({}),
  nonVerbalCues: jsonb("non_verbal_cues").$type<{
    bodyLanguage?: string[];
    facialExpressions?: string[];
    gestures?: string[];
  }>().default({}),
  isOfflineAvailable: boolean("is_offline_available").default(false),
  isQuickPractice: boolean("is_quick_practice").default(false), // 5-10 minute scenarios
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

// Emotional state tracking
export const emotionalStates = pgTable("emotional_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  scenarioId: varchar("scenario_id").references(() => scenarios.id),
  timestamp: timestamp("timestamp").defaultNow(),
  confidence: integer("confidence").notNull(), // 1-10
  stress: integer("stress").notNull(),
  empathy: integer("empathy").notNull(),
  resilience: integer("resilience").notNull(),
  notes: text("notes"),
});

// Discussion forums
export const forumCategories = pgTable("forum_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumTopics = pgTable("forum_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => forumCategories.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewCount: integer("view_count").default(0),
  replyCount: integer("reply_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").notNull().references(() => forumTopics.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentReplyId: varchar("parent_reply_id").references(() => forumReplies.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Care quality badges
export const careQualityBadges = pgTable("care_quality_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon").notNull(),
  color: varchar("color").notNull(),
  criteria: jsonb("criteria").$type<{
    scenarioCount?: number;
    averageScore?: number;
    skillLevels?: Record<string, number>;
    streakDays?: number;
  }>().default({}),
  tier: varchar("tier").notNull().default("bronze"), // bronze, silver, gold, platinum
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull().references(() => careQualityBadges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  isVisible: boolean("is_visible").default(true),
});

// Reflection prompts
export const reflectionPrompts = pgTable("reflection_prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").references(() => scenarios.id),
  prompt: text("prompt").notNull(),
  type: varchar("type").notNull(), // pre_scenario, post_scenario, mid_scenario
  category: varchar("category"), // emotional, technical, ethical
  isActive: boolean("is_active").default(true),
});

export const userReflections = pgTable("user_reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  promptId: varchar("prompt_id").notNull().references(() => reflectionPrompts.id),
  scenarioId: varchar("scenario_id").references(() => scenarios.id),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Manager and recruiter roles
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // care_home, hospital, agency
  address: text("address"),
  contactEmail: varchar("contact_email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationId: varchar("organization_id").references(() => organizations.id),
  role: varchar("role").notNull(), // care_worker, manager, recruiter, admin
  permissions: jsonb("permissions").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type EmotionalState = typeof emotionalStates.$inferSelect;
export type ForumCategory = typeof forumCategories.$inferSelect;
export type ForumTopic = typeof forumTopics.$inferSelect;
export type ForumReply = typeof forumReplies.$inferSelect;
export type CareQualityBadge = typeof careQualityBadges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type ReflectionPrompt = typeof reflectionPrompts.$inferSelect;
export type UserReflection = typeof userReflections.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;
export type InsertUserScenario = z.infer<typeof insertUserScenarioSchema>;
export type UserScenario = typeof userScenarios.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
