import { users, scenarios, userScenarios, achievements, reactions, type User, type InsertUser, type UpsertUser, type Scenario, type InsertScenario, type UserScenario, type InsertUserScenario, type Achievement, type InsertAchievement, insertReactionSchema } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Legacy user methods for existing functionality
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Scenarios
  getAllScenarios(): Promise<Scenario[]>;
  getScenario(id: string): Promise<Scenario | undefined>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  
  // User Scenarios
  getUserScenarios(userId: string): Promise<UserScenario[]>;
  getUserScenario(userId: string, scenarioId: string): Promise<UserScenario | undefined>;
  createUserScenario(userScenario: InsertUserScenario): Promise<UserScenario>;
  updateUserScenario(id: string, updates: Partial<UserScenario>): Promise<UserScenario | undefined>;
  
  // Achievements
  getUserAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // User Statistics
  getUserStats(userId: string): Promise<{
    completedScenarios: number;
    totalTime: number;
    weeklyStreak: number;
    averageScore: number;
    skillLevels: Record<string, number>;
  }>;

  // New feature methods (placeholder implementations)
  getForumCategories(): Promise<any[]>;
  getForumTopics(categoryId?: string): Promise<any[]>;
  createForumTopic(data: any): Promise<any>;
  getEmotionalStates(userId: string): Promise<any[]>;
  createEmotionalState(data: any): Promise<any>;
  getCulturalProgress(userId: string): Promise<any>;
  startCulturalModule(userId: string, moduleId: string): Promise<any>;
  getUserBadges(userId: string): Promise<any[]>;
  getAvailableBadges(): Promise<any[]>;
  getManagerTeamData(userId: string, timeframe: string): Promise<any>;
  getManagerAnalytics(userId: string, timeframe: string): Promise<any>;
  getTeamWellbeingData(userId: string, timeframe: string): Promise<any>;
  getRecruiterCandidates(role?: string, skill?: string): Promise<any[]>;
  getRecruiterAnalytics(): Promise<any>;
  getRecruiterAssessments(): Promise<any[]>;
  getVisualAids(category?: string, search?: string): Promise<any[]>;
  getVisualAidsProgress(userId: string): Promise<any>;
  getNonVerbalProgress(userId: string): Promise<any>;
  getCompletedNonVerbalExercises(userId: string): Promise<any[]>;
  completeNonVerbalExercise(userId: string, exerciseId: string): Promise<any>;
  getQuickPracticeScenarios(category?: string): Promise<any[]>;
  getQuickPracticeProgress(userId: string): Promise<any>;
  startQuickPractice(userId: string, scenarioId: string): Promise<any>;
  completeDailyChallenge(userId: string, challengeId: string): Promise<any>;
  
  // Emoji Reactions
  createReaction(reaction: any): Promise<any>;
  getUserReactions(userId: string, type: string, contextId: string): Promise<any[]>;
  getReactionAnalytics(userId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Note: username field was removed for Replit Auth, but keeping method for backward compatibility
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllScenarios(): Promise<Scenario[]> {
    return await db.select().from(scenarios).where(eq(scenarios.isActive, true));
  }

  async getScenario(id: string): Promise<Scenario | undefined> {
    const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return scenario || undefined;
  }

  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    const [scenario] = await db
      .insert(scenarios)
      .values(insertScenario)
      .returning();
    return scenario;
  }

  async getUserScenarios(userId: string): Promise<UserScenario[]> {
    return await db.select().from(userScenarios).where(eq(userScenarios.userId, userId));
  }

  async getUserScenario(userId: string, scenarioId: string): Promise<UserScenario | undefined> {
    const [userScenario] = await db
      .select()
      .from(userScenarios)
      .where(and(eq(userScenarios.userId, userId), eq(userScenarios.scenarioId, scenarioId)));
    return userScenario || undefined;
  }

  async createUserScenario(insertUserScenario: InsertUserScenario): Promise<UserScenario> {
    const [userScenario] = await db
      .insert(userScenarios)
      .values(insertUserScenario)
      .returning();
    return userScenario;
  }

  async updateUserScenario(id: string, updates: Partial<UserScenario>): Promise<UserScenario | undefined> {
    const [userScenario] = await db
      .update(userScenarios)
      .set(updates)
      .where(eq(userScenarios.id, id))
      .returning();
    return userScenario || undefined;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.userId, userId));
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }

  async getUserStats(userId: string): Promise<{
    completedScenarios: number;
    totalTime: number;
    weeklyStreak: number;
    averageScore: number;
    skillLevels: Record<string, number>;
  }> {
    // Get user base data
    const user = await this.getUser(userId);
    const userScenariosList = await this.getUserScenarios(userId);
    
    // Calculate completed scenarios
    const completedScenarios = userScenariosList.filter(us => us.status === 'completed').length;
    
    // Calculate total time
    const totalTime = userScenariosList.reduce((total, us) => total + (us.totalTime || 0), 0);
    
    // Calculate average score
    const completedWithScores = userScenariosList.filter(us => us.status === 'completed' && (us.score || 0) > 0);
    const averageScore = completedWithScores.length > 0 
      ? Math.round(completedWithScores.reduce((total, us) => total + (us.score || 0), 0) / completedWithScores.length)
      : 0;
    
    return {
      completedScenarios,
      totalTime,
      weeklyStreak: user?.weeklyStreak || 0,
      averageScore,
      skillLevels: user?.skillLevels || {}
    };
  }

  // New feature methods (placeholder implementations)
  async getForumCategories(): Promise<any[]> {
    return [];
  }

  async getForumTopics(categoryId?: string): Promise<any[]> {
    return [];
  }

  async createForumTopic(data: any): Promise<any> {
    return { id: '1', ...data };
  }

  async getEmotionalStates(userId: string): Promise<any[]> {
    return [];
  }

  async createEmotionalState(data: any): Promise<any> {
    return { id: '1', ...data };
  }

  async getCulturalProgress(userId: string): Promise<any> {
    return {};
  }

  async startCulturalModule(userId: string, moduleId: string): Promise<any> {
    return { success: true };
  }

  async getUserBadges(userId: string): Promise<any[]> {
    return [];
  }

  async getAvailableBadges(): Promise<any[]> {
    return [];
  }

  async getManagerTeamData(userId: string, timeframe: string): Promise<any> {
    return { members: [] };
  }

  async getManagerAnalytics(userId: string, timeframe: string): Promise<any> {
    return { activeUsers: 0, totalScenarios: 0, averageScore: 0 };
  }

  async getTeamWellbeingData(userId: string, timeframe: string): Promise<any> {
    return { averageWellbeing: 7, confidence: 7, stress: 5, empathy: 8, resilience: 7 };
  }

  async getRecruiterCandidates(role?: string, skill?: string): Promise<any[]> {
    return [];
  }

  async getRecruiterAnalytics(): Promise<any> {
    return { activeCandidates: 0, readyCandidates: 0, averageScore: 0, culturalScore: 0 };
  }

  async getRecruiterAssessments(): Promise<any[]> {
    return [];
  }

  async getVisualAids(category?: string, search?: string): Promise<any[]> {
    return [];
  }

  async getVisualAidsProgress(userId: string): Promise<any> {
    return {};
  }

  async getNonVerbalProgress(userId: string): Promise<any> {
    return {};
  }

  async getCompletedNonVerbalExercises(userId: string): Promise<any[]> {
    return [];
  }

  async completeNonVerbalExercise(userId: string, exerciseId: string): Promise<any> {
    return { success: true };
  }

  async getQuickPracticeScenarios(category?: string): Promise<any[]> {
    return [];
  }

  async getQuickPracticeProgress(userId: string): Promise<any> {
    return { dailyStreak: 0, recentSessions: [] };
  }

  async startQuickPractice(userId: string, scenarioId: string): Promise<any> {
    return { scenarioId };
  }

  async completeDailyChallenge(userId: string, challengeId: string): Promise<any> {
    return { success: true };
  }

  // Emoji Reactions Implementation
  async createReaction(reactionData: any): Promise<any> {
    const [reaction] = await db
      .insert(reactions)
      .values(reactionData)
      .returning();
    return reaction;
  }

  async getUserReactions(userId: string, type: string, contextId: string): Promise<any[]> {
    const userReactions = await db
      .select()
      .from(reactions)
      .where(and(
        eq(reactions.userId, userId),
        eq(reactions.type, type),
        eq(reactions.contextId, contextId)
      ));
    return userReactions;
  }

  async getReactionAnalytics(userId: string): Promise<any> {
    const userReactions = await db
      .select()
      .from(reactions)
      .where(eq(reactions.userId, userId));

    const categoryCount = userReactions.reduce((acc, reaction) => {
      acc[reaction.category] = (acc[reaction.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const emojiCount = userReactions.reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalReactions = userReactions.length;
    const mostUsedCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b, 'understanding'
    );

    return {
      totalReactions,
      categoryBreakdown: categoryCount,
      emojiBreakdown: emojiCount,
      mostUsedCategory,
      averageReactionsPerSession: Math.round((totalReactions / Math.max(1, userReactions.length / 5)) * 100) / 100
    };
  }
}

export const storage = new DatabaseStorage();
