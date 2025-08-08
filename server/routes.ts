import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateConversationResponse, analyzeFeedback } from "./services/openai";
import { insertUserScenarioSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (demo user for MVP)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser("demo-user-1");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Update user profile
  app.patch("/api/user", async (req, res) => {
    try {
      const userId = "demo-user-1";
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

  // Get all available scenarios
  app.get("/api/scenarios", async (req, res) => {
    try {
      const scenarios = await storage.getAllScenarios();
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ message: "Failed to get scenarios" });
    }
  });

  // Get specific scenario
  app.get("/api/scenarios/:id", async (req, res) => {
    try {
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
  app.get("/api/user/scenarios", async (req, res) => {
    try {
      const userScenarios = await storage.getUserScenarios("demo-user-1");
      res.json(userScenarios);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user scenarios" });
    }
  });

  // Start a scenario
  app.post("/api/scenarios/:id/start", async (req, res) => {
    try {
      const scenarioId = req.params.id;
      const userId = "demo-user-1";
      
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
  app.post("/api/scenarios/:id/complete", async (req, res) => {
    try {
      const scenarioId = req.params.id;
      const userId = "demo-user-1";
      
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
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUser(userId, {
          totalScenarios: (user.totalScenarios || 0) + 1,
          totalTime: (user.totalTime || 0) + (completedScenario?.totalTime || 0),
        });
      }

      res.json(completedScenario);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete scenario" });
    }
  });

  // Get user achievements
  app.get("/api/user/achievements", async (req, res) => {
    try {
      const achievements = await storage.getUserAchievements("demo-user-1");
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
