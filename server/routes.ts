import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateConversationResponse, analyzeFeedback } from "./services/openai";
import { insertUserScenarioSchema, insertReactionSchema } from "@shared/schema";
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

  // Get user statistics with caching
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Cache user stats for 2 minutes
      res.set({
        'Cache-Control': 'private, max-age=120',
        'Vary': 'Authorization',
      });
      
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
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Update user profile (wizard completion)
  app.put("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role, experienceLevel, learningGoals, preferences, onboardingCompleted } = req.body;
      
      const updates: any = {
        role,
        experienceLevel,
        learningGoals,
        onboardingCompleted,
        profileCompletion: 100 // Complete profile after wizard
      };

      // Merge preferences with existing ones
      if (preferences) {
        const currentUser = await storage.getUser(userId);
        updates.preferences = {
          ...currentUser?.preferences,
          ...preferences
        };
      }

      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get all available scenarios with enhanced caching
  app.get("/api/scenarios", async (req, res) => {
    try {
      // Enhanced cache headers with ETag support
      res.set({
        'Cache-Control': 'public, max-age=600, s-maxage=1800', // 10min client, 30min CDN
        'Vary': 'Accept-Encoding',
        'X-Content-Type-Options': 'nosniff',
      });
      
      const scenarios = await storage.getAllScenarios();
      
      // Add ETag for conditional requests
      const etag = `"scenarios-${scenarios.length}-${Date.now()}"`;
      res.set('ETag', etag);
      
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }
      
      res.json(scenarios);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      res.status(500).json({ message: "Failed to get scenarios" });
    }
  });

  // Get specific scenario with enhanced caching
  app.get("/api/scenarios/:id", async (req, res) => {
    try {
      // Longer cache for individual scenarios (they change less frequently)
      res.set({
        'Cache-Control': 'public, max-age=1800, s-maxage=3600', // 30min client, 1hr CDN
        'Vary': 'Accept-Encoding',
        'X-Content-Type-Options': 'nosniff',
      });
      
      const scenario = await storage.getScenario(req.params.id);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      
      // Add ETag for conditional requests
      const etag = `"scenario-${req.params.id}-${scenario.updatedAt || scenario.createdAt}"`;
      res.set('ETag', etag);
      
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }
      
      res.json(scenario);
    } catch (error) {
      console.error("Error fetching scenario:", error);
      res.status(500).json({ message: "Failed to get scenario" });
    }
  });

  // Get user's scenario progress with caching
  app.get("/api/user/scenarios", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Cache user-specific data for shorter periods
      res.set({
        'Cache-Control': 'private, max-age=60', // 1 minute for user progress
        'Vary': 'Authorization',
      });
      
      const userScenarios = await storage.getUserScenarios(userId);
      res.json(userScenarios);
    } catch (error) {
      console.error("Error fetching user scenarios:", error);
      res.status(500).json({ message: "Failed to get user scenarios" });
    }
  });

  // Get specific user scenario by scenario ID
  app.get("/api/user/scenarios/:scenarioId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenarioId = req.params.scenarioId;
      
      // Cache user-specific data for shorter periods
      res.set({
        'Cache-Control': 'private, max-age=60',
        'Vary': 'Authorization',
      });
      
      const userScenario = await storage.getUserScenario(userId, scenarioId);
      // Return null if no user scenario exists (scenario hasn't been started)
      res.json(userScenario || null);
    } catch (error) {
      console.error("Error fetching user scenario:", error);
      res.status(500).json({ message: "Failed to get user scenario" });
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
    message: z.string().min(1), // Frontend sends 'message'
    conversationHistory: z.array(z.object({
      role: z.enum(['user', 'character']),
      message: z.string() // Frontend sends 'message' in history items
    })).default([])
  });

  app.post("/api/scenarios/:id/conversation", isAuthenticated, async (req: any, res) => {
    try {
      console.log('🗣️ Processing conversation request for scenario:', req.params.id);
      const scenarioId = req.params.id;
      const { message: userResponse, conversationHistory } = conversationSchema.parse(req.body);
      console.log('📨 User response:', userResponse);
      console.log('💬 Conversation history length:', conversationHistory?.length || 0);
      
      // Get scenario context
      const scenario = await storage.getScenario(scenarioId);
      if (!scenario) {
        console.log('❌ Scenario not found:', scenarioId);
        return res.status(404).json({ message: "Scenario not found" });
      }

      console.log('✅ Scenario found:', scenario.title);

      // Convert conversation history to match OpenAI service format
      const historyForAI = conversationHistory.map(h => ({ 
        role: h.role, 
        message: h.message 
      }));
      
      // Generate AI response and feedback in parallel for speed
      console.log('🤖 Calling OpenAI service...');
      const [aiResponse, feedback] = await Promise.all([
        generateConversationResponse(
          scenario.context,
          [...historyForAI, { role: 'user', message: userResponse }],
          "care recipient"
        ),
        analyzeFeedback(userResponse, scenario.context, historyForAI)
      ]);
      console.log('🎯 AI response generated:', aiResponse.message.substring(0, 50) + '...');
      console.log('✅ Feedback generated');
      
      // Save the conversation turn and update time tracking
      const userId = req.user.claims.sub;
      const userScenario = await storage.getUserScenario(userId, scenarioId);
      if (userScenario) {
        const updatedResponses = [
          ...(userScenario.responses || []),
          {
            userResponse: userResponse,
            aiResponse: aiResponse.message,
            sentiment: aiResponse.sentiment,
            feedback: feedback,
            timestamp: new Date()
          }
        ];
        
        // Calculate approximate time spent (rough estimate: 1-2 minutes per response)
        const estimatedTimePerResponse = 90; // seconds per response
        const totalEstimatedTime = Math.max(
          userScenario.totalTime || 0, 
          updatedResponses.length * estimatedTimePerResponse
        );
        
        await storage.updateUserScenario(userScenario.id, {
          responses: updatedResponses,
          progress: Math.min(Math.round((updatedResponses.length / 3) * 100), 100),
          totalTime: totalEstimatedTime
        });
      }
      
      res.json({
        aiResponse: aiResponse.message,
        sentiment: aiResponse.sentiment,
        shouldContinue: aiResponse.shouldContinue,
        feedback: feedback
      });
    } catch (error: any) {
      console.error('❌ Conversation error:', error);
      console.error('🔍 Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack?.split('\n').slice(0, 3).join('\n')
      });
      res.status(500).json({ message: "Failed to process conversation", error: error?.message });
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
      const { totalTime } = req.body;
      
      const userScenario = await storage.getUserScenario(userId, scenarioId);
      if (!userScenario) {
        return res.status(404).json({ message: "User scenario not found" });
      }

      // Calculate score based on feedback received during the scenario
      const calculateScenarioScore = (responses: any[] = [], scenario: any) => {
        // Base score calculation from actual responses and engagement
        let baseScore = 0;
        let totalFeedbackScore = 0;
        let feedbackCount = 0;
        let totalResponses = responses.length;
        
        // Calculate score from AI feedback metrics
        responses.forEach(response => {
          if (response.feedback) {
            const feedback = response.feedback;
            // Calculate average score from feedback metrics (each out of 5, convert to percentage)
            const metrics = [
              feedback.empathy,
              feedback.communication,
              feedback.professionalism,
              feedback.problemSolving
            ].filter(score => score !== undefined && score !== null);
            
            if (metrics.length > 0) {
              const avgMetricScore = metrics.reduce((sum, score) => sum + score, 0) / metrics.length;
              totalFeedbackScore += (avgMetricScore / 5) * 100; // Convert to percentage
              feedbackCount++;
            }
          }
        });
        
        // If we have feedback scores, use them as primary indicator
        if (feedbackCount > 0) {
          baseScore = Math.round(totalFeedbackScore / feedbackCount);
        } else {
          // Calculate engagement-based score when no AI feedback is available
          if (totalResponses === 0) {
            return 30; // Very low score for no engagement
          } else if (totalResponses === 1) {
            return 45; // Low score for minimal engagement
          } else if (totalResponses <= 3) {
            return 65; // Medium score for moderate engagement
          } else {
            return 80; // Good score for active engagement
          }
        }
        
        // Apply engagement bonus/penalty based on number of responses
        let engagementMultiplier = 1.0;
        if (totalResponses >= 5) {
          engagementMultiplier = 1.1; // 10% bonus for high engagement
        } else if (totalResponses <= 2) {
          engagementMultiplier = 0.9; // 10% penalty for low engagement
        }
        
        // Apply time-based consideration (if completed too quickly, apply penalty)
        const estimatedTime = scenario?.estimatedTime || 10;
        const actualTime = totalTime || estimatedTime;
        if (actualTime < estimatedTime * 0.5) {
          engagementMultiplier *= 0.95; // 5% penalty for rushing
        }
        
        const finalScore = Math.round(Math.min(baseScore * engagementMultiplier, 100));
        return Math.max(finalScore, 20); // Minimum score of 20%
      };

      // Get the scenario details for more accurate scoring
      const scenario = await storage.getScenario(scenarioId);
      const finalScore = calculateScenarioScore(userScenario.responses || [], scenario);

      // Update scenario as completed with the actual time spent and calculated score
      const completedScenario = await storage.updateUserScenario(userScenario.id, {
        status: "completed",
        progress: 100,
        score: finalScore,
        totalTime: totalTime || 0,
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
      console.error("Error completing scenario:", error);
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

  // Emoji Reactions API
  app.post("/api/reactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reactionData = insertReactionSchema.parse({
        ...req.body,
        userId
      });
      
      const reaction = await storage.createReaction(reactionData);
      res.status(201).json(reaction);
    } catch (error) {
      console.error("Error creating reaction:", error);
      res.status(500).json({ message: "Failed to save reaction" });
    }
  });

  app.get("/api/reactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, contextId } = req.query;
      
      const reactions = await storage.getUserReactions(userId, type as string, contextId as string);
      res.json(reactions);
    } catch (error) {
      console.error("Error fetching reactions:", error);
      res.status(500).json({ message: "Failed to get reactions" });
    }
  });

  app.get("/api/reactions/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getReactionAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching reaction analytics:", error);
      res.status(500).json({ message: "Failed to get reaction analytics" });
    }
  });

  // Emoji Reactions routes
  app.post('/api/reactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, contextId, emoji, label, category, description } = req.body;
      
      const reactionData = {
        userId,
        type,
        contextId,
        emoji,
        label,
        category,
        description,
        createdAt: new Date()
      };
      
      const reaction = await storage.createReaction(reactionData);
      res.json(reaction);
    } catch (error) {
      console.error('Error creating reaction:', error);
      res.status(500).json({ message: 'Failed to create reaction' });
    }
  });

  app.get('/api/reactions/:type/:contextId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, contextId } = req.params;
      
      const reactions = await storage.getUserReactions(userId, type, contextId);
      res.json(reactions);
    } catch (error) {
      console.error('Error fetching reactions:', error);
      res.status(500).json({ message: 'Failed to fetch reactions' });
    }
  });

  app.get('/api/user/reaction-analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getReactionAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching reaction analytics:', error);
      res.status(500).json({ message: 'Failed to fetch reaction analytics' });
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

  // Emoji Reactions API
  app.post("/api/reactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reactionData = insertReactionSchema.parse({
        ...req.body,
        userId
      });

      const reaction = await storage.createReaction(reactionData);
      
      // Update user engagement metrics
      const currentUser = await storage.getUser(userId);
      if (currentUser) {
        const engagementBoost = {
          'understanding': 2,
          'emotion': 3,
          'confidence': 1,
          'engagement': 2
        };
        
        const skillBoost = engagementBoost[reactionData.category as keyof typeof engagementBoost] || 1;
        
        // Update user's emotional state and engagement
        await storage.updateUser(userId, {
          emotionalState: {
            ...currentUser.emotionalState,
            [reactionData.category]: Math.min(10, (currentUser.emotionalState?.[reactionData.category as keyof typeof currentUser.emotionalState] || 0) + skillBoost)
          }
        });
      }

      res.json(reaction);
    } catch (error) {
      console.error('Error saving reaction:', error);
      res.status(500).json({ message: "Failed to save reaction" });
    }
  });

  // Get user reactions for a specific context
  app.get("/api/reactions/:type/:contextId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, contextId } = req.params;
      
      const reactions = await storage.getUserReactions(userId, type, contextId);
      res.json(reactions);
    } catch (error) {
      console.error('Error fetching reactions:', error);
      res.status(500).json({ message: "Failed to fetch reactions" });
    }
  });

  // Get user reaction analytics
  app.get("/api/user/reaction-analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getReactionAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching reaction analytics:', error);
      res.status(500).json({ message: "Failed to fetch reaction analytics" });
    }
  });



  // Comprehensive Recruiter API endpoints
  app.get('/api/recruiter/candidates', isAuthenticated, async (req: any, res) => {
    try {
      const { role, skill } = req.query;
      const candidates = await storage.getRecruiterCandidates(role, skill);
      res.json(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({ error: 'Failed to fetch candidates' });
    }
  });

  app.get('/api/recruiter/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const analytics = await storage.getRecruiterAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching recruiter analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/recruiter/assessments', isAuthenticated, async (req: any, res) => {
    try {
      const assessments = await storage.getRecruiterAssessments();
      res.json(assessments);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      res.status(500).json({ error: 'Failed to fetch assessments' });
    }
  });

  app.post('/api/recruiter/candidates', isAuthenticated, async (req: any, res) => {
    try {
      const candidate = await storage.createCandidate(req.body);
      res.json(candidate);
    } catch (error) {
      console.error('Error creating candidate:', error);
      res.status(500).json({ error: 'Failed to create candidate' });
    }
  });

  app.patch('/api/recruiter/candidates/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const candidate = await storage.updateCandidateStatus(id, status, notes);
      res.json(candidate);
    } catch (error) {
      console.error('Error updating candidate status:', error);
      res.status(500).json({ error: 'Failed to update candidate status' });
    }
  });

  app.get('/api/recruiter/skills-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const analysis = await storage.getRecruiterSkillsAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error('Error fetching skills analysis:', error);
      res.status(500).json({ error: 'Failed to fetch skills analysis' });
    }
  });

  app.get('/api/recruiter/recruitment-funnel', isAuthenticated, async (req: any, res) => {
    try {
      const funnel = await storage.getRecruitmentFunnel();
      res.json(funnel);
    } catch (error) {
      console.error('Error fetching recruitment funnel:', error);
      res.status(500).json({ error: 'Failed to fetch recruitment funnel' });
    }
  });

  // User role switching endpoint (for testing purposes)
  app.patch('/api/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!['care_worker', 'recruiter', 'ld_manager'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      
      await storage.updateUser(userId, { role });
      res.json({ success: true, role });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update role' });
    }
  });

  // L&D Manager API endpoints
  app.get('/api/ld-manager/team/:timeframe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { timeframe } = req.params;
      const teamData = await storage.getManagerTeamData(userId, timeframe);
      res.json(teamData);
    } catch (error) {
      console.error('Error fetching team data:', error);
      res.status(500).json({ error: 'Failed to fetch team data' });
    }
  });

  app.get('/api/ld-manager/analytics/:timeframe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { timeframe } = req.params;
      const analytics = await storage.getManagerAnalytics(userId, timeframe);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching L&D analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/ld-manager/wellbeing/:timeframe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { timeframe } = req.params;
      const wellbeingData = await storage.getTeamWellbeingData(userId, timeframe);
      res.json(wellbeingData);
    } catch (error) {
      console.error('Error fetching wellbeing data:', error);
      res.status(500).json({ error: 'Failed to fetch wellbeing data' });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
