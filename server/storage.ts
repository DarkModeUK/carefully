import { users, scenarios, userScenarios, achievements, type User, type InsertUser, type UpsertUser, type Scenario, type InsertScenario, type UserScenario, type InsertUserScenario, type Achievement, type InsertAchievement } from "@shared/schema";
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
      .set({
        ...updates,
        updatedAt: new Date(),
      })
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
}

export const storage = new DatabaseStorage();
