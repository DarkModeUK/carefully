import OpenAI from "openai";
import { storage } from "../storage.js";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export interface DifficultyRecommendation {
  recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced';
  confidence: number; // 0-1
  reasoning: string;
  specificAdjustments: {
    pacing: 'slower' | 'normal' | 'faster';
    complexity: 'simplified' | 'standard' | 'enhanced';
    supportLevel: 'high' | 'medium' | 'low';
  };
  nextScenarioSuggestions: string[];
}

export interface PerformancePattern {
  averageScore: number;
  consistencyScore: number; // How consistent their performance is
  improvementTrend: 'improving' | 'stable' | 'declining';
  strengthAreas: string[];
  challengeAreas: string[];
  engagementLevel: number; // 1-10
}

// Analyze user's performance patterns across scenarios
export async function analyzePerformancePatterns(userId: string): Promise<PerformancePattern> {
  try {
    // Get user's scenario history and stats
    const userScenarios = await storage.getUserScenarios(userId);
    const userStats = await storage.getUserStats(userId);
    const user = await storage.getUser(userId);

    if (!userScenarios || userScenarios.length < 2) {
      // Not enough data for meaningful analysis
      return {
        averageScore: 75,
        consistencyScore: 0.5,
        improvementTrend: 'stable',
        strengthAreas: ['engagement'],
        challengeAreas: ['experience_needed'],
        engagementLevel: 5
      };
    }

    // Calculate performance metrics
    const completedScenarios = userScenarios.filter(s => s.progress === 100);
    const scores = completedScenarios.map(s => s.score || 0).filter(s => s > 0);
    
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 75;
    
    // Calculate consistency (lower standard deviation = higher consistency)
    const variance = scores.length > 1 ? 
      scores.reduce((acc, score) => acc + Math.pow(score - averageScore, 2), 0) / scores.length : 0;
    const consistency = Math.max(0, 1 - (Math.sqrt(variance) / 50)); // Normalize to 0-1
    
    // Analyze improvement trend
    let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (scores.length >= 3) {
      const recent = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const earlier = scores.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, scores.length - 3);
      
      if (recent > earlier + 5) improvementTrend = 'improving';
      else if (recent < earlier - 5) improvementTrend = 'declining';
    }

    // Analyze skill areas from feedback
    const allFeedback = completedScenarios.flatMap(s => s.responses || [])
      .map(r => r.feedback)
      .filter(f => f);

    const skillAverages = {
      empathy: allFeedback.reduce((acc, f) => acc + (f.empathy || 3), 0) / Math.max(1, allFeedback.length),
      communication: allFeedback.reduce((acc, f) => acc + (f.communication || 3), 0) / Math.max(1, allFeedback.length),
      professionalism: allFeedback.reduce((acc, f) => acc + (f.professionalism || 3), 0) / Math.max(1, allFeedback.length),
      problemSolving: allFeedback.reduce((acc, f) => acc + (f.problemSolving || 3), 0) / Math.max(1, allFeedback.length)
    };

    const strengthAreas = Object.entries(skillAverages)
      .filter(([_, score]) => score >= 4)
      .map(([skill, _]) => skill);

    const challengeAreas = Object.entries(skillAverages)
      .filter(([_, score]) => score < 3)
      .map(([skill, _]) => skill);

    // Calculate engagement level based on completion rate and time spent
    const completionRate = userScenarios.length > 0 ? 
      completedScenarios.length / userScenarios.length : 0;
    const avgTimePerScenario = userStats.totalTime / Math.max(1, userStats.completedScenarios);
    const engagementLevel = Math.min(10, Math.round(
      (completionRate * 5) + 
      (Math.min(avgTimePerScenario / 300, 1) * 3) + // Engagement increases with time spent (up to 5 min)
      (userStats.weeklyStreak * 0.5)
    ));

    return {
      averageScore,
      consistencyScore: consistency,
      improvementTrend,
      strengthAreas: strengthAreas.length > 0 ? strengthAreas : ['basic_engagement'],
      challengeAreas: challengeAreas.length > 0 ? challengeAreas : ['consistency'],
      engagementLevel
    };

  } catch (error) {
    console.error('Error analyzing performance patterns:', error);
    return {
      averageScore: 75,
      consistencyScore: 0.5,
      improvementTrend: 'stable',
      strengthAreas: ['engagement'],
      challengeAreas: ['experience_needed'],
      engagementLevel: 5
    };
  }
}

// Generate AI-powered difficulty recommendations
export async function generateDifficultyRecommendation(
  userId: string,
  currentScenarioType?: string
): Promise<DifficultyRecommendation> {
  try {
    const performancePattern = await analyzePerformancePatterns(userId);
    const user = await storage.getUser(userId);
    const userStats = await storage.getUserStats(userId);

    const systemPrompt = `You are an AI learning specialist for care worker training. Analyze this user's performance and recommend optimal scenario difficulty.

USER PERFORMANCE DATA:
- Average Score: ${performancePattern.averageScore}/100
- Performance Consistency: ${Math.round(performancePattern.consistencyScore * 100)}%
- Trend: ${performancePattern.improvementTrend}
- Completed Scenarios: ${userStats.completedScenarios}
- Total Training Time: ${userStats.totalTime} minutes
- Engagement Level: ${performancePattern.engagementLevel}/10
- Strength Areas: ${performancePattern.strengthAreas.join(', ')}
- Challenge Areas: ${performancePattern.challengeAreas.join(', ')}
- Current Preference: ${user?.preferences?.difficultyPreference || 'adaptive'}

DIFFICULTY LEVELS:
- Beginner: Simple scenarios, clear guidance, basic care situations
- Intermediate: Moderate complexity, some ambiguity, multi-step problems
- Advanced: Complex scenarios, ethical dilemmas, challenging patient behaviors

Provide a recommendation that optimizes learning while maintaining engagement. Consider:
1. Challenge should be just above current comfort level (zone of proximal development)
2. Avoid overwhelming struggling learners
3. Prevent boredom for high performers
4. Build on strengths while addressing weaknesses

Return JSON:
{
  "recommendedDifficulty": "beginner|intermediate|advanced",
  "confidence": 0.0-1.0,
  "reasoning": "Clear explanation of why this difficulty is optimal for this user",
  "specificAdjustments": {
    "pacing": "slower|normal|faster",
    "complexity": "simplified|standard|enhanced", 
    "supportLevel": "high|medium|low"
  },
  "nextScenarioSuggestions": ["scenario_type1", "scenario_type2", "scenario_type3"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this user's performance and recommend optimal difficulty settings.` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      recommendedDifficulty: result.recommendedDifficulty || 'intermediate',
      confidence: result.confidence || 0.7,
      reasoning: result.reasoning || 'Based on current performance metrics and learning progression',
      specificAdjustments: result.specificAdjustments || {
        pacing: 'normal',
        complexity: 'standard',
        supportLevel: 'medium'
      },
      nextScenarioSuggestions: result.nextScenarioSuggestions || ['dementia_care', 'communication_skills', 'family_support']
    };

  } catch (error) {
    console.error('Error generating difficulty recommendation:', error);
    return {
      recommendedDifficulty: 'intermediate',
      confidence: 0.5,
      reasoning: 'Unable to analyze performance data. Defaulting to intermediate difficulty.',
      specificAdjustments: {
        pacing: 'normal',
        complexity: 'standard',
        supportLevel: 'medium'
      },
      nextScenarioSuggestions: ['dementia_care', 'communication_skills', 'family_support']
    };
  }
}

// Get personalized scenario recommendations based on performance
export async function getPersonalizedScenarioRecommendations(
  userId: string,
  limit: number = 5
): Promise<any[]> {
  try {
    const difficultyRec = await generateDifficultyRecommendation(userId);
    const performancePattern = await analyzePerformancePatterns(userId);
    const allScenarios = await storage.getScenarios();
    const userScenarios = await storage.getUserScenarios(userId);
    
    // Get completed scenario IDs
    const completedIds = userScenarios
      .filter(us => us.progress === 100)
      .map(us => us.scenarioId);

    // Filter available scenarios
    const availableScenarios = allScenarios.filter(s => 
      s.isActive && !completedIds.includes(s.id)
    );

    // Score scenarios based on recommendation
    const scoredScenarios = availableScenarios.map(scenario => {
      let score = 0;
      
      // Difficulty match
      if (scenario.difficulty === difficultyRec.recommendedDifficulty) {
        score += 50;
      } else if (
        (scenario.difficulty === 'intermediate' && difficultyRec.recommendedDifficulty !== 'intermediate') ||
        (difficultyRec.recommendedDifficulty === 'intermediate' && scenario.difficulty !== 'intermediate')
      ) {
        score += 25; // Partial match
      }
      
      // Category preferences based on challenge areas
      if (performancePattern.challengeAreas.includes('empathy') && 
          scenario.category.toLowerCase().includes('emotional')) {
        score += 30;
      }
      if (performancePattern.challengeAreas.includes('communication') && 
          scenario.category.toLowerCase().includes('communication')) {
        score += 30;
      }
      if (performancePattern.challengeAreas.includes('problemSolving') && 
          scenario.category.toLowerCase().includes('complex')) {
        score += 30;
      }
      
      // Boost suggested scenario types
      if (difficultyRec.nextScenarioSuggestions.some(suggestion => 
          scenario.title.toLowerCase().includes(suggestion.toLowerCase().replace('_', ' ')))) {
        score += 40;
      }
      
      // Priority boost
      if (scenario.priority === 'high') score += 20;
      if (scenario.priority === 'medium') score += 10;
      
      return { ...scenario, recommendationScore: score };
    });

    // Sort by score and return top recommendations
    return scoredScenarios
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);

  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    // Fallback to basic scenario list
    const allScenarios = await storage.getScenarios();
    return allScenarios.filter(s => s.isActive).slice(0, limit);
  }
}

// Update user's difficulty preference based on performance
export async function updateAdaptiveDifficulty(userId: string): Promise<void> {
  try {
    const recommendation = await generateDifficultyRecommendation(userId);
    const user = await storage.getUser(userId);
    
    if (user && recommendation.confidence > 0.7) {
      // Only update if we're confident in the recommendation
      const updatedPreferences = {
        ...user.preferences,
        difficultyPreference: recommendation.recommendedDifficulty as any,
        lastDifficultyUpdate: new Date().toISOString(),
        adaptiveRecommendations: {
          lastRecommendation: recommendation,
          updateReason: 'performance_analysis'
        }
      };
      
      await storage.updateUser(userId, { preferences: updatedPreferences });
      console.log(`✅ Updated difficulty preference for user ${userId} to ${recommendation.recommendedDifficulty}`);
    }
  } catch (error) {
    console.error('Error updating adaptive difficulty:', error);
  }
}