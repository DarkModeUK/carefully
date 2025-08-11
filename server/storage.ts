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
  
  // Super Admin methods
  switchUserRole(userId: string, newRole: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  makeUserSuperAdmin(userId: string): Promise<User | undefined>;
  
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
  getUserReactions(userId: string, type?: string, contextId?: string): Promise<any[]>;
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

  // Role-specific methods implementation
  async getRecruiterCandidates(role?: string, skill?: string): Promise<any[]> {
    // Fetch candidates from user database with mock augmentation
    const allUsers = await db.select().from(users).where(eq(users.role, 'care_worker'));
    
    return allUsers.map(user => ({
      id: user.id,
      name: `${user.firstName || 'User'} ${user.lastName || ''}`.trim(),
      email: user.email,
      role: 'care_worker',
      completedScenarios: user.totalScenarios || 0,
      averageScore: Math.round((user.skillLevels as any)?.average || 75),
      skillLevels: user.skillLevels || {},
      lastActivity: new Date().toISOString(),
      status: user.totalScenarios > 0 ? 'active' : 'pending'
    }));
  }

  async getRecruiterAnalytics(): Promise<any> {
    const candidates = await this.getRecruiterCandidates();
    const activeCandidates = candidates.filter(c => c.status === 'active').length;
    const completedAssessments = candidates.filter(c => c.completedScenarios > 0).length;
    const averageScore = candidates.length > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + c.averageScore, 0) / candidates.length)
      : 0;

    return {
      totalCandidates: candidates.length,
      activeCandidates,
      completedAssessments,
      averageScore
    };
  }

  async getManagerTeamData(userId: string, timeframe: string): Promise<any[]> {
    // Fetch team members from user database
    const teamMembers = await db.select().from(users).where(eq(users.role, 'care_worker'));
    
    return teamMembers.map(member => ({
      id: member.id,
      name: `${member.firstName || 'User'} ${member.lastName || ''}`.trim(),
      role: 'care_worker',
      completedScenarios: member.totalScenarios || 0,
      averageScore: Math.round((member.skillLevels as any)?.average || 75),
      totalTime: member.totalTime || 0,
      lastActivity: new Date().toISOString(),
      skillProgress: member.skillLevels || {},
      weeklyStreak: member.weeklyStreak || 0
    }));
  }

  async getManagerAnalytics(userId: string, timeframe: string): Promise<any> {
    const teamData = await this.getManagerTeamData(userId, timeframe);
    const activeMembers = teamData.filter(m => m.completedScenarios > 0).length;
    const totalTrainingHours = teamData.reduce((sum, m) => sum + m.totalTime, 0);
    const teamAverageScore = teamData.length > 0 
      ? Math.round(teamData.reduce((sum, m) => sum + m.averageScore, 0) / teamData.length)
      : 0;

    return {
      totalTeamMembers: teamData.length,
      activeMembers,
      averageCompletion: Math.round((activeMembers / Math.max(teamData.length, 1)) * 100),
      teamAverageScore,
      totalTrainingHours,
      weeklyEngagement: Math.round((activeMembers / Math.max(teamData.length, 1)) * 100)
    };
  }

  async getTeamWellbeingData(userId: string, timeframe: string): Promise<any> {
    return {
      confidence: 78,
      stressManagement: 65,
      empathy: 82,
      resilience: 71
    };
  }

  // Enhanced Recruiter Methods
  async getRecruiterAssessments(): Promise<any[]> {
    return [
      {
        id: '1',
        candidateName: 'Sarah Johnson',
        status: 'in_progress',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        progress: 65,
        role: 'Care Worker'
      },
      {
        id: '2', 
        candidateName: 'Michael Chen',
        status: 'in_progress',
        startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        progress: 80,
        role: 'Care Worker'
      },
      {
        id: '3',
        candidateName: 'Emma Rodriguez',
        status: 'completed',
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        progress: 100,
        role: 'Senior Care Assistant'
      }
    ];
  }

  async createCandidate(candidateData: any): Promise<any> {
    const newCandidate = {
      id: Date.now().toString(),
      name: `${candidateData.firstName} ${candidateData.lastName}`,
      firstName: candidateData.firstName,
      lastName: candidateData.lastName,
      email: candidateData.email,
      phone: candidateData.phone,
      role: candidateData.role,
      experience: candidateData.experience,
      location: candidateData.location,
      referralSource: candidateData.referralSource,
      notes: candidateData.notes,
      status: 'pending',
      completedScenarios: 0,
      averageScore: 0,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    // In a real implementation, this would save to database
    return newCandidate;
  }

  async updateCandidateStatus(candidateId: string, status: string, notes?: string): Promise<any> {
    return {
      id: candidateId,
      status,
      notes,
      updatedAt: new Date().toISOString()
    };
  }

  async getRecruiterSkillsAnalysis(): Promise<any[]> {
    return [
      { skill: "Communication Skills", score: 87 },
      { skill: "Empathy & Compassion", score: 92 },
      { skill: "Problem Solving", score: 81 },
      { skill: "Cultural Sensitivity", score: 85 },
      { skill: "Professionalism", score: 89 }
    ];
  }

  async getRecruitmentFunnel(): Promise<any[]> {
    return [
      { stage: "Application Received", count: 24, percentage: 100 },
      { stage: "Initial Screening", count: 18, percentage: 75 },
      { stage: "Assessment Started", count: 12, percentage: 50 },
      { stage: "Assessment Completed", count: 8, percentage: 33 }
    ];
  }

  async createCandidate(candidateData: any): Promise<any> {
    // In a real implementation, this would create a new user in the database
    const newCandidate = {
      id: Date.now().toString(),
      ...candidateData,
      status: 'pending',
      completedScenarios: 0,
      averageScore: 0,
      createdAt: new Date().toISOString()
    };
    return newCandidate;
  }

  async updateCandidateStatus(candidateId: string, status: string, notes?: string): Promise<any> {
    // In a real implementation, this would update the candidate in the database
    return {
      id: candidateId,
      status,
      notes,
      updatedAt: new Date().toISOString()
    };
  }

  async getRecruiterSkillsAnalysis(): Promise<any> {
    return [
      { skill: 'Communication', score: 85, color: 'bg-blue-500' },
      { skill: 'Empathy', score: 78, color: 'bg-green-500' },
      { skill: 'Problem Solving', score: 72, color: 'bg-purple-500' },
      { skill: 'Professionalism', score: 88, color: 'bg-orange-500' },
      { skill: 'Cultural Sensitivity', score: 69, color: 'bg-pink-500' }
    ];
  }

  async getRecruitmentFunnel(): Promise<any[]> {
    return [
      { stage: 'Applications', count: 150, percentage: 100 },
      { stage: 'Initial Screening', count: 120, percentage: 80 },
      { stage: 'Assessment Started', count: 95, percentage: 63 },
      { stage: 'Assessment Completed', count: 78, percentage: 52 },
      { stage: 'Interview Stage', count: 45, percentage: 30 },
      { stage: 'Offers Made', count: 12, percentage: 8 }
    ];
  }

  // Super Admin methods implementation
  async switchUserRole(userId: string, newRole: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        role: newRole as any,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async makeUserSuperAdmin(userId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        role: 'super_admin',
        originalRole: user.originalRole || user.role,
        canSwitchRoles: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
}

export const storage = new DatabaseStorage();
