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
      
      // Get scenario details for generating opening message
      const scenario = await storage.getScenario(scenarioId);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      
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
      
      // Generate opening message from the patient/character
      const initialMessage = await generateConversationResponse(
        scenario.context,
        [],
        "care recipient"
      );
      
      res.json({ 
        ...userScenario, 
        initialMessage 
      });
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

  app.post("/api/scenarios/:id/conversation", isAuthenticated, async (req: any, res) => {
    try {
      const scenarioId = req.params.id;
      const { message, conversationHistory } = conversationSchema.parse(req.body);
      
      // Get scenario context
      const scenario = await storage.getScenario(scenarioId);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      // Generate AI response with proper conversation context
      const aiResponse = await generateConversationResponse(
        scenario.context,
        [...conversationHistory, { role: 'user', message }],
        "care recipient"
      );

      // Analyze user's response for feedback (run in parallel for speed)
      const feedbackPromise = analyzeFeedback(
        message,
        scenario.context,
        conversationHistory
      );

      const feedback = await feedbackPromise;

      res.json({
        aiResponse: aiResponse.message,
        feedback,
        // Quick Win: Quick feedback summary (one sentence takeaway)
        quickSummary: feedback.summary || "Good response, keep practicing!"
      });
    } catch (error) {
      console.error('Conversation error:', error);
      res.status(500).json({ message: "Failed to process conversation" });
    }
  });

  // Quick Win: Bookmark scenario endpoint
  app.post("/api/scenarios/:id/bookmark", isAuthenticated, async (req: any, res) => {
    try {
      const scenarioId = req.params.id;
      const userId = req.user.claims.sub;
      const { bookmarked } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const currentBookmarks = user.preferences?.bookmarkedScenarios || [];
      let updatedBookmarks;
      
      if (bookmarked) {
        updatedBookmarks = [...currentBookmarks, scenarioId];
      } else {
        updatedBookmarks = currentBookmarks.filter(id => id !== scenarioId);
      }
      
      await storage.updateUser(userId, {
        preferences: {
          ...user.preferences,
          bookmarkedScenarios: updatedBookmarks
        }
      });
      
      res.json({ success: true, bookmarked });
    } catch (error) {
      console.error('Bookmark error:', error);
      res.status(500).json({ message: "Failed to update bookmark" });
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

  // Forum routes
  app.get('/api/forum/categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getForumCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching forum categories:', error);
      res.status(500).json({ message: 'Failed to fetch forum categories' });
    }
  });

  app.get('/api/forum/topics/:categoryId?', isAuthenticated, async (req, res) => {
    try {
      const { categoryId } = req.params;
      const topics = await storage.getForumTopics(categoryId);
      res.json(topics);
    } catch (error) {
      console.error('Error fetching forum topics:', error);
      res.status(500).json({ message: 'Failed to fetch forum topics' });
    }
  });

  app.post('/api/forum/topics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { title, content, categoryId } = req.body;
      const topic = await storage.createForumTopic({ title, content, categoryId, authorId: userId });
      res.status(201).json(topic);
    } catch (error) {
      console.error('Error creating forum topic:', error);
      res.status(500).json({ message: 'Failed to create forum topic' });
    }
  });

  // Emotional state tracking routes
  app.get('/api/emotional-states', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const states = await storage.getEmotionalStates(userId);
      res.json(states);
    } catch (error) {
      console.error('Error fetching emotional states:', error);
      res.status(500).json({ message: 'Failed to fetch emotional states' });
    }
  });

  app.post('/api/emotional-states', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { confidence, stress, empathy, resilience, notes } = req.body;
      const state = await storage.createEmotionalState({
        userId,
        confidence,
        stress, 
        empathy,
        resilience,
        notes
      });
      res.status(201).json(state);
    } catch (error) {
      console.error('Error creating emotional state:', error);
      res.status(500).json({ message: 'Failed to record emotional state' });
    }
  });

  // Cultural sensitivity routes
  app.get('/api/cultural-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const progress = await storage.getCulturalProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error('Error fetching cultural progress:', error);
      res.status(500).json({ message: 'Failed to fetch cultural progress' });
    }
  });

  // Placeholder routes for new features (to prevent errors)
  app.get('/api/user/badges', isAuthenticated, async (req: any, res) => {
    res.json([]);
  });

  app.get('/api/badges/available', isAuthenticated, async (req: any, res) => {
    res.json([]);
  });

  app.get('/api/manager/team/:timeframe?', isAuthenticated, async (req: any, res) => {
    res.json({ members: [] });
  });

  app.get('/api/manager/analytics/:timeframe?', isAuthenticated, async (req: any, res) => {
    res.json({ activeUsers: 0, totalScenarios: 0, averageScore: 0 });
  });

  app.get('/api/manager/wellbeing/:timeframe?', isAuthenticated, async (req: any, res) => {
    res.json({ averageWellbeing: 7, confidence: 7, stress: 5, empathy: 8, resilience: 7 });
  });

  app.get('/api/recruiter/candidates', isAuthenticated, async (req: any, res) => {
    res.json([]);
  });

  app.get('/api/recruiter/analytics', isAuthenticated, async (req: any, res) => {
    res.json({ activeCandidates: 0, readyCandidates: 0, averageScore: 0, culturalScore: 0 });
  });

  app.get('/api/recruiter/assessments', isAuthenticated, async (req: any, res) => {
    res.json([]);
  });

  app.get('/api/visual-aids', isAuthenticated, async (req: any, res) => {
    res.json([]);
  });

  app.get('/api/user/visual-aids-progress', isAuthenticated, async (req: any, res) => {
    res.json({});
  });

  app.get('/api/non-verbal-progress', isAuthenticated, async (req: any, res) => {
    res.json({});
  });

  app.get('/api/non-verbal-exercises/completed', isAuthenticated, async (req: any, res) => {
    res.json([]);
  });

  app.post('/api/non-verbal-exercises/:exerciseId/complete', isAuthenticated, async (req: any, res) => {
    res.json({ success: true });
  });

  app.get('/api/scenarios/quick-practice/:category?', isAuthenticated, async (req: any, res) => {
    res.json([]);
  });

  app.get('/api/user/quick-practice-progress', isAuthenticated, async (req: any, res) => {
    res.json({ dailyStreak: 0, recentSessions: [] });
  });

  app.post('/api/quick-practice/:scenarioId/start', isAuthenticated, async (req: any, res) => {
    res.json({ scenarioId: req.params.scenarioId });
  });

  app.post('/api/daily-challenges/:challengeId/complete', isAuthenticated, async (req: any, res) => {
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
