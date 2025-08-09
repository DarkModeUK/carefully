import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateConversationResponse, analyzeFeedback } from "./services/openai";
import { insertUserScenarioSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user statistics
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Legacy user route for backward compatibility (protected)
  app.get("/api/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Update user profile
  app.patch("/api/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      // Calculate profile completion if basic fields are updated
      if (updates.name || updates.email || updates.role || updates.skillLevels) {
        const currentUser = await storage.getUser(userId);
        if (currentUser) {
          let completion = 0;
          const updatedUser = { ...currentUser, ...updates };
          if (updatedUser.name) completion += 20;
          if (updatedUser.email) completion += 20;
          if (updatedUser.role) completion += 20;
          if (updatedUser.skillLevels && Object.keys(updatedUser.skillLevels).length > 0) completion += 40;
          updates.profileCompletion = completion;
        }
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Get all available scenarios with caching
  app.get("/api/scenarios", async (req, res) => {
    try {
      // Add cache headers for better performance
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
      
      const scenarios = await storage.getAllScenarios();
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ message: "Failed to get scenarios" });
    }
  });

  // Get specific scenario with caching
  app.get("/api/scenarios/:id", async (req, res) => {
    try {
      // Add cache headers for individual scenarios
      res.set('Cache-Control', 'public, max-age=600'); // 10 minutes
      
      const scenario = await storage.getScenario(req.params.id);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      res.json(scenario);
    } catch (error) {
      res.status(500).json({ message: "Failed to get scenario" });
    }
  });

  // Get user's scenario progress
  app.get("/api/user/scenarios", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userScenarios = await storage.getUserScenarios(userId);
      res.json(userScenarios);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user scenarios" });
    }
  });

  // Start a scenario
  app.post("/api/scenarios/:id/start", isAuthenticated, async (req: any, res) => {
    try {
      const scenarioId = req.params.id;
      const userId = req.user.claims.sub;
      
      // Check if user scenario already exists
      let userScenario = await storage.getUserScenario(userId, scenarioId);
      
      if (!userScenario) {
        // Create new user scenario
        userScenario = await storage.createUserScenario({
          userId,
          scenarioId,
          status: "in_progress",
          progress: 0,
          responses: [],
          feedback: [],
          totalTime: 0,
          score: 0,
        });
      } else {
        // Update existing scenario to in_progress
        userScenario = await storage.updateUserScenario(userScenario.id, {
          status: "in_progress"
        });
      }
      
      res.json(userScenario);
    } catch (error) {
      res.status(500).json({ message: "Failed to start scenario" });
    }
  });

  // Send message in conversation
  const conversationSchema = z.object({
    message: z.string().min(1),
    conversationHistory: z.array(z.object({
      role: z.enum(['user', 'character']),
      message: z.string()
    })).default([])
  });

  app.post("/api/scenarios/:id/conversation", async (req, res) => {
    try {
      const scenarioId = req.params.id;
      const { message, conversationHistory } = conversationSchema.parse(req.body);
      
      // Get scenario context
      const scenario = await storage.getScenario(scenarioId);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      // Generate AI response
      const aiResponse = await generateConversationResponse(
        scenario.context,
        conversationHistory,
        "care recipient"
      );

      // Analyze user's response for feedback
      const feedback = await analyzeFeedback(
        message,
        scenario.context,
        conversationHistory
      );

      res.json({
        aiResponse,
        feedback
      });
    } catch (error) {
      console.error('Conversation error:', error);
      res.status(500).json({ message: "Failed to process conversation" });
    }
  });

  // Complete scenario
  app.post("/api/scenarios/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const scenarioId = req.params.id;
      const userId = req.user.claims.sub;
      
      const userScenario = await storage.getUserScenario(userId, scenarioId);
      if (!userScenario) {
        return res.status(404).json({ message: "User scenario not found" });
      }

      // Update scenario as completed
      const completedScenario = await storage.updateUserScenario(userScenario.id, {
        status: "completed",
        progress: 100,
        completedAt: new Date(),
      });

      // Update user stats
      const currentUser = await storage.getUser(userId);
      if (currentUser) {
        await storage.updateUser(userId, {
          totalScenarios: (currentUser.totalScenarios || 0) + 1,
          totalTime: (currentUser.totalTime || 0) + (completedScenario?.totalTime || 0),
        });
      }

      res.json(completedScenario);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete scenario" });
    }
  });

  // Get user achievements
  app.get("/api/user/achievements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
