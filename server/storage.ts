import { type User, type InsertUser, type Scenario, type InsertScenario, type UserScenario, type InsertUserScenario, type Achievement, type InsertAchievement } from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private scenarios: Map<string, Scenario>;
  private userScenarios: Map<string, UserScenario>;
  private achievements: Map<string, Achievement>;

  constructor() {
    this.users = new Map();
    this.scenarios = new Map();
    this.userScenarios = new Map();
    this.achievements = new Map();
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: "demo-user-1",
      username: "sarah.adams",
      name: "Sarah Adams",
      email: "sarah.adams@care.com",
      role: "care_worker",
      skillLevels: {
        empathy: 85,
        conflict_resolution: 72,
        safeguarding: 65,
        decision_making: 58
      },
      totalScenarios: 12,
      weeklyStreak: 5,
      totalTime: 138, // 2.3 hours in minutes
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo scenarios
    const demoScenarios: Scenario[] = [
      {
        id: "scenario-1",
        title: "Supporting Someone with Dementia Distress",
        description: "Practice calming techniques and empathetic communication when a resident becomes agitated.",
        category: "dementia_care",
        difficulty: "intermediate",
        estimatedTime: 15,
        priority: "high",
        context: "Mrs. Johnson, a resident with dementia, has become agitated and is asking repeatedly for her deceased husband. She's becoming increasingly distressed and other residents are getting worried.",
        learningObjectives: ["Practice validation techniques", "Develop empathetic responses", "Learn redirection strategies"],
        isActive: true,
      },
      {
        id: "scenario-2",
        title: "Family Conflict Resolution",
        description: "Handle disagreements between family members about care decisions.",
        category: "family_communication",
        difficulty: "intermediate",
        estimatedTime: 15,
        priority: "high",
        context: "Two siblings are arguing about their mother's care plan. One wants aggressive treatment while the other prefers comfort care.",
        learningObjectives: ["Navigate family dynamics", "Facilitate difficult conversations", "Find common ground"],
        isActive: true,
      },
      {
        id: "scenario-3",
        title: "Medication Refusal",
        description: "Support someone who is refusing to take their prescribed medication.",
        category: "medication_management",
        difficulty: "beginner",
        estimatedTime: 12,
        priority: "medium",
        context: "Mr. Thompson has been refusing his blood pressure medication, saying it makes him feel dizzy.",
        learningObjectives: ["Understand medication concerns", "Build trust", "Find solutions together"],
        isActive: true,
      },
      {
        id: "scenario-4",
        title: "End of Life Conversation",
        description: "Provide comfort and support during difficult end-of-life discussions.",
        category: "end_of_life",
        difficulty: "advanced",
        estimatedTime: 20,
        priority: "medium",
        context: "A resident has received a terminal diagnosis and wants to discuss their fears about dying.",
        learningObjectives: ["Provide emotional support", "Listen actively", "Offer appropriate comfort"],
        isActive: true,
      }
    ];

    demoScenarios.forEach(scenario => {
      this.scenarios.set(scenario.id, scenario);
    });

    // Create user scenario progress
    const userScenario: UserScenario = {
      id: "user-scenario-1",
      userId: "demo-user-1",
      scenarioId: "scenario-1",
      status: "in_progress",
      progress: 60,
      responses: [],
      feedback: [],
      startedAt: new Date(),
      completedAt: null,
      totalTime: 8,
      score: 0,
    };
    this.userScenarios.set(userScenario.id, userScenario);

    // Create achievements
    const demoAchievements: Achievement[] = [
      {
        id: "achievement-1",
        userId: "demo-user-1",
        type: "empathy_expert",
        title: "Empathy Expert",
        description: "Completed 5 communication scenarios",
        icon: "fas fa-medal",
        unlockedAt: new Date(),
      },
      {
        id: "achievement-2",
        userId: "demo-user-1",
        type: "quick_learner",
        title: "Quick Learner",
        description: "Completed first scenario in under 10 mins",
        icon: "fas fa-star",
        unlockedAt: new Date(),
      },
      {
        id: "achievement-3",
        userId: "demo-user-1",
        type: "consistent_trainer",
        title: "Consistent Trainer",
        description: "5-day training streak",
        icon: "fas fa-trophy",
        unlockedAt: new Date(),
      }
    ];

    demoAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllScenarios(): Promise<Scenario[]> {
    return Array.from(this.scenarios.values()).filter(scenario => scenario.isActive);
  }

  async getScenario(id: string): Promise<Scenario | undefined> {
    return this.scenarios.get(id);
  }

  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    const id = randomUUID();
    const scenario: Scenario = { ...insertScenario, id };
    this.scenarios.set(id, scenario);
    return scenario;
  }

  async getUserScenarios(userId: string): Promise<UserScenario[]> {
    return Array.from(this.userScenarios.values()).filter(us => us.userId === userId);
  }

  async getUserScenario(userId: string, scenarioId: string): Promise<UserScenario | undefined> {
    return Array.from(this.userScenarios.values()).find(
      us => us.userId === userId && us.scenarioId === scenarioId
    );
  }

  async createUserScenario(insertUserScenario: InsertUserScenario): Promise<UserScenario> {
    const id = randomUUID();
    const userScenario: UserScenario = {
      ...insertUserScenario,
      id,
      startedAt: new Date(),
      completedAt: null,
    };
    this.userScenarios.set(id, userScenario);
    return userScenario;
  }

  async updateUserScenario(id: string, updates: Partial<UserScenario>): Promise<UserScenario | undefined> {
    const userScenario = this.userScenarios.get(id);
    if (!userScenario) return undefined;
    
    const updatedUserScenario = { ...userScenario, ...updates };
    this.userScenarios.set(id, updatedUserScenario);
    return updatedUserScenario;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(achievement => achievement.userId === userId);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const achievement: Achievement = { ...insertAchievement, id, unlockedAt: new Date() };
    this.achievements.set(id, achievement);
    return achievement;
  }
}

export const storage = new MemStorage();
