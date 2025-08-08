import { users, scenarios, userScenarios, achievements, type User, type InsertUser, type Scenario, type InsertScenario, type UserScenario, type InsertUserScenario, type Achievement, type InsertAchievement } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
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
}

export const storage = new DatabaseStorage();
