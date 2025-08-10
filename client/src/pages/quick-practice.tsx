import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Scenario } from "@shared/schema";

const quickPracticeCategories = [
  {
    id: 'communication',
    title: 'Communication Skills',
    description: 'Quick exercises for better patient conversations',
    icon: 'fas fa-comments',
    color: 'bg-blue-100 text-blue-800',
    scenarios: 5
  },
  {
    id: 'empathy',
    title: 'Empathy Building', 
    description: 'Short practices to develop emotional connection',
    icon: 'fas fa-heart',
    color: 'bg-pink-100 text-pink-800',
    scenarios: 4
  },
  {
    id: 'problem_solving',
    title: 'Problem Solving',
    description: 'Quick decision-making scenarios',
    icon: 'fas fa-puzzle-piece',
    color: 'bg-green-100 text-green-800',
    scenarios: 6
  },
  {
    id: 'cultural_awareness',
    title: 'Cultural Sensitivity',
    description: 'Brief cultural awareness exercises',
    icon: 'fas fa-globe',
    color: 'bg-purple-100 text-purple-800',
    scenarios: 3
  }
];

const dailyChallenges = [
  {
    id: '1',
    title: "Today's Empathy Challenge",
    description: 'Practice understanding a patient\'s emotional needs in a 3-minute scenario',
    duration: '3 min',
    points: 15,
    category: 'empathy',
    isCompleted: false
  },
  {
    id: '2', 
    title: "Communication Quick Fix",
    description: 'Improve your explanation skills with a medication scenario',
    duration: '2 min',
    points: 10,
    category: 'communication',
    isCompleted: true
  },
  {
    id: '3',
    title: "Cultural Moment",
    description: 'Navigate a cultural sensitivity situation effectively',
    duration: '4 min', 
    points: 20,
    category: 'cultural_awareness',
    isCompleted: false
  }
];

export default function QuickPracticePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch quick practice scenarios
  const { data: scenarios, isLoading: scenariosLoading } = useQuery({
    queryKey: ['/api/scenarios/quick-practice', selectedCategory],
    enabled: !!user,
  });

  // Fetch user's quick practice progress
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/user/quick-practice-progress'],
    enabled: !!user,
  });

  // Start quick practice mutation
  const startPracticeMutation = useMutation({
    mutationFn: async (scenarioId: string) => {
      return await apiRequest('POST', `/api/quick-practice/${scenarioId}/start`, {});
    },
    onSuccess: (data) => {
      toast({
        title: "Quick practice started",
        description: "Your focused practice session has begun.",
      });
      setLocation(`/simulation/${data.scenarioId}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start practice session. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Complete daily challenge mutation
  const completeChallengeMap = useMutation({
    mutationFn: async (challengeId: string) => {
      return await apiRequest('POST', `/api/daily-challenges/${challengeId}/complete`, {});
    },
    onSuccess: (data, challengeId) => {
      const challenge = dailyChallenges.find(c => c.id === challengeId);
      toast({
        title: "Daily challenge completed!",
        description: `You earned ${challenge?.points} points for completing today's challenge.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/quick-practice-progress'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleStartPractice = (scenarioId: string) => {
    startPracticeMutation.mutate(scenarioId);
  };

  const handleCompleteChallenge = (challengeId: string) => {
    completeChallengeMap.mutate(challengeId);
  };

  const getTodayStreak = () => {
    return progress?.dailyStreak || 0;
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <i className="fas fa-bolt text-4xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access quick practice sessions.</p>
            <Button onClick={() => setLocation('/api/login')}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Practice Sessions</h1>
        <p className="text-gray-600">
          Bite-sized training sessions designed to fit into your busy schedule. Practice key skills in just 2-5 minutes.
        </p>
      </div>

      {/* Daily Progress */}
      <Card className="mb-8 border-l-4 border-l-[#7FDEFF]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Today's Practice Streak
              </h2>
              <p className="text-gray-600">Keep your skills sharp with daily micro-learning</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#7FDEFF]">{getTodayStreak()}</div>
              <div className="text-sm text-gray-600">days in a row</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={Math.min((getTodayStreak() / 7) * 100, 100)} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Start streak</span>
              <span>7-day milestone</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenges */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-calendar-day text-[#907AD6]"></i>
            Today's Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dailyChallenges.map((challenge) => (
              <Card key={challenge.id} className={`border ${
                challenge.isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:shadow-md'
              } transition-all`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-full ${
                      quickPracticeCategories.find(c => c.id === challenge.category)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      <i className={`${
                        quickPracticeCategories.find(c => c.id === challenge.category)?.icon || 'fas fa-book'
                      } text-sm`}></i>
                    </div>
                    {challenge.isCompleted && (
                      <Badge className="bg-green-100 text-green-800">
                        <i className="fas fa-check mr-1"></i>Done
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      <i className="fas fa-clock mr-1"></i>
                      {challenge.duration}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <i className="fas fa-star mr-1"></i>
                      {challenge.points} pts
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={() => handleCompleteChallenge(challenge.id)}
                    disabled={challenge.isCompleted || completeChallengeMap.isPending}
                    className={`w-full ${
                      challenge.isCompleted 
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                        : 'bg-[#907AD6] hover:bg-[#7B6BC7] text-white'
                    }`}
                  >
                    {completeChallengeMap.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>Starting...
                      </>
                    ) : challenge.isCompleted ? (
                      <>
                        <i className="fas fa-check mr-2"></i>Completed
                      </>
                    ) : (
                      <>
                        <i className="fas fa-play mr-2"></i>Start Challenge
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Practice Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {quickPracticeCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-full ${category.color}`}>
                  <i className={`${category.icon} text-xl`}></i>
                </div>
                <Badge variant="outline">
                  {category.scenarios} scenarios
                </Badge>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {progress?.[category.id]?.completed || 0}/{category.scenarios}
                  </span>
                </div>
                <Progress 
                  value={((progress?.[category.id]?.completed || 0) / category.scenarios) * 100} 
                  className="h-2" 
                />
                
                <Button
                  onClick={() => setSelectedCategory(category.id)}
                  className="w-full bg-[#907AD6] hover:bg-[#7B6BC7] text-white"
                >
                  <i className="fas fa-play mr-2"></i>
                  Practice {category.title}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Practice Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {progressLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {progress?.recentSessions?.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-rocket text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-medium mb-2">Start Your First Quick Practice</h3>
                  <p className="text-gray-600 mb-4">
                    Begin with today's challenges or choose a category above to get started.
                  </p>
                  <Button 
                    onClick={() => setSelectedCategory('communication')}
                    className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white"
                  >
                    <i className="fas fa-play mr-2"></i>Start Quick Practice
                  </Button>
                </div>
              ) : (
                progress?.recentSessions?.map((session: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        session.score >= 80 ? 'bg-green-500' : 
                        session.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <p className="text-sm text-gray-600">
                          {session.duration} • {new Date(session.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{session.score}%</div>
                      <div className="text-sm text-gray-600">+{session.points} pts</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}