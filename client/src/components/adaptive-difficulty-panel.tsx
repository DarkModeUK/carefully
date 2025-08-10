import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

interface DifficultyRecommendation {
  recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced';
  confidence: number;
  reasoning: string;
  specificAdjustments: {
    pacing: 'slower' | 'normal' | 'faster';
    complexity: 'simplified' | 'standard' | 'enhanced';
    supportLevel: 'high' | 'medium' | 'low';
  };
  nextScenarioSuggestions: string[];
}

interface RecommendedScenario {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  estimatedTime: string;
  recommendationScore: number;
  description: string;
}

export function AdaptiveDifficultyPanel() {
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();

  // Get difficulty recommendations
  const { data: recommendation, isLoading: loadingRec } = useQuery<DifficultyRecommendation>({
    queryKey: ['/api/user/difficulty-recommendation'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (new TanStack Query v5 property)
  });

  // Get personalized scenarios
  const { data: scenarios, isLoading: loadingScenarios } = useQuery<{
    scenarios: RecommendedScenario[];
    difficultyRecommendation: DifficultyRecommendation;
    isPersonalized: boolean;
  }>({
    queryKey: ['/api/scenarios/recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/scenarios/recommendations?limit=3', {
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Update adaptive difficulty
  const updateDifficultyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/user/adaptive-difficulty', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/difficulty-recommendation'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios/recommendations'] });
    }
  });

  if (loadingRec || loadingScenarios) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
    beginner: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    intermediate: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    advanced: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' }
  };

  const confidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Main Recommendation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-l-4 border-l-[#907AD6]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fas fa-brain text-[#907AD6]"></i>
                AI Difficulty Recommendation
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateDifficultyMutation.mutate()}
                disabled={updateDifficultyMutation.isPending}
              >
                {updateDifficultyMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-refresh mr-2"></i>
                )}
                Update
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendation && (
              <div className="space-y-4">
                {/* Current Recommendation */}
                <div className="flex items-center justify-between">
                  <div>
                    <Badge 
                      className={`${difficultyColors[recommendation.recommendedDifficulty].bg} ${difficultyColors[recommendation.recommendedDifficulty].text} ${difficultyColors[recommendation.recommendedDifficulty].border}`}
                    >
                      <i className="fas fa-target mr-1"></i>
                      {recommendation.recommendedDifficulty.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">Recommended difficulty level</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${confidenceColor(recommendation.confidence)}`}>
                      {Math.round(recommendation.confidence * 100)}%
                    </div>
                    <p className="text-xs text-gray-500">Confidence</p>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Recommendation Confidence</span>
                    <span className={confidenceColor(recommendation.confidence)}>
                      {recommendation.confidence >= 0.8 ? 'High' : 
                       recommendation.confidence >= 0.6 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <Progress 
                    value={recommendation.confidence * 100} 
                    className="h-2"
                  />
                </div>

                {/* Reasoning */}
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                    <i className="fas fa-lightbulb mr-1 text-yellow-500"></i>
                    Why This Recommendation?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {recommendation.reasoning}
                  </p>
                </div>

                {/* Specific Adjustments */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <i className="fas fa-clock text-blue-600 mb-1"></i>
                    <div className="text-sm font-medium">{recommendation.specificAdjustments.pacing}</div>
                    <div className="text-xs text-gray-500">Pacing</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <i className="fas fa-puzzle-piece text-green-600 mb-1"></i>
                    <div className="text-sm font-medium">{recommendation.specificAdjustments.complexity}</div>
                    <div className="text-xs text-gray-500">Complexity</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <i className="fas fa-hands-helping text-purple-600 mb-1"></i>
                    <div className="text-sm font-medium">{recommendation.specificAdjustments.supportLevel}</div>
                    <div className="text-xs text-gray-500">Support</div>
                  </div>
                </div>

                {/* Toggle Details */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full mt-2"
                >
                  {showDetails ? 'Hide' : 'Show'} Detailed Analysis
                  <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'} ml-2`}></i>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommended Scenarios */}
      {scenarios?.scenarios && scenarios.scenarios.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-star text-yellow-500"></i>
                Recommended for You
              </CardTitle>
              <p className="text-sm text-gray-600">
                Scenarios tailored to your current skill level and learning goals
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {scenarios.scenarios.slice(0, 3).map((scenario: RecommendedScenario, index: number) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-[#907AD6]">
                          {scenario.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {scenario.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {scenario.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>
                          <i className="fas fa-clock mr-1"></i>
                          {scenario.estimatedTime}
                        </span>
                        <span>
                          <i className="fas fa-tag mr-1"></i>
                          {scenario.category}
                        </span>
                        <span className="text-[#907AD6] font-medium">
                          <i className="fas fa-chart-line mr-1"></i>
                          {Math.round(scenario.recommendationScore || 0)}% match
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button size="sm" className="bg-[#907AD6] hover:bg-[#7B6BC7]">
                        <i className="fas fa-play mr-1"></i>
                        Start
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Detailed Analysis */}
      {showDetails && recommendation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-chart-bar text-blue-600"></i>
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Next Scenario Suggestions */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Suggested Focus Areas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.nextScenarioSuggestions?.map((suggestion: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {suggestion.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-info-circle text-amber-600 mt-1"></i>
                    <div>
                      <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                        Learning Path Optimization
                      </h5>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Based on your performance patterns, we've identified optimal difficulty settings 
                        that will challenge you appropriately while maintaining engagement. Your learning 
                        journey is continuously adapted to maximize skill development.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}