import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

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
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Get personalized scenarios
  const { data: scenarios, isLoading: loadingScenarios } = useQuery<{
    scenarios: RecommendedScenario[];
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

  if (loadingScenarios) {
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



  return (
    <div className="space-y-6">

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
                        <span className="flex items-center">
                          <i className="fas fa-clock mr-1"></i>
                          {scenario.estimatedTime}
                        </span>
                        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <i className="fas fa-tag mr-1.5"></i>
                          {scenario.category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                        <span className="text-[#907AD6] font-medium flex items-center">
                          <i className="fas fa-chart-line mr-1"></i>
                          {Math.round(scenario.recommendationScore || 0)}% match
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button 
                        size="sm" 
                        className="bg-[#907AD6] hover:bg-[#7B6BC7]"
                        onClick={() => setLocation(`/simulation/${scenario.id}`)}
                      >
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


    </div>
  );
}