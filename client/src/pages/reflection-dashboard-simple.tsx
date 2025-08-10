import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";

interface ReflectionInsight {
  category: string;
  strength: number;
  completedScenarios: number;
  averageScore: number;
  timeSpent: number;
  lastActivity: string;
  topSkills: string[];
  improvementAreas: string[];
  personalizedTips: string[];
}

export default function ReflectionDashboard() {
  const [, setLocation] = useLocation();

  const { data: reflectionInsights, isLoading } = useQuery<ReflectionInsight[]>({
    queryKey: ['/api/reflection/insights'],
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/user/stats'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#DABFFF]/20 via-white to-[#7FDEFF]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#907AD6] rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-brain text-white text-xl animate-pulse"></i>
          </div>
          <p className="text-gray-600">Loading your reflection insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DABFFF]/20 via-white to-[#7FDEFF]/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] rounded-full flex items-center justify-center hover-glow">
              <i className="fas fa-brain text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2C2A4A]">Reflection Dashboard</h1>
              <p className="text-gray-600">Personalized insights into your learning journey</p>
            </div>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#907AD6]">{userStats?.completedScenarios || 0}</div>
              <div className="text-sm text-gray-600">Scenarios Completed</div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#7FDEFF]">{Math.round((userStats?.totalTime || 0) / 60)}h</div>
              <div className="text-sm text-gray-600">Time Invested</div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{reflectionInsights?.length || 0}</div>
              <div className="text-sm text-gray-600">Categories Explored</div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{userStats?.weeklyStreak || 0}</div>
              <div className="text-sm text-gray-600">Weekly Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {reflectionInsights?.map((insight, index) => (
            <Card key={insight.category} className="hover-lift transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className={`${getCategoryIcon(insight.category)} text-[#907AD6]`}></i>
                    <span className="capitalize">{insight.category.replace('_', ' ')}</span>
                  </div>
                  <Badge className={`${getStrengthColor(insight.strength)} text-xs`}>
                    {getStrengthLabel(insight.strength)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Strength Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Strength</span>
                      <span className="font-medium">{insight.strength}%</span>
                    </div>
                    <Progress value={insight.strength} className="h-2" />
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Completed</div>
                      <div className="font-semibold text-[#2C2A4A]">{insight.completedScenarios} scenarios</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Average Score</div>
                      <div className="font-semibold text-[#2C2A4A]">{insight.averageScore}%</div>
                    </div>
                  </div>

                  {/* Time Spent */}
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Time Invested</div>
                    <div className="text-sm font-medium">{insight.timeSpent > 0 ? Math.round(insight.timeSpent / 60) : 0} minutes</div>
                  </div>

                  {/* Top Skills */}
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Strengths</div>
                    <div className="flex flex-wrap gap-1">
                      {insight.topSkills.slice(0, 3).map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Personalized Tip */}
                  {insight.personalizedTips.length > 0 && (
                    <div className="bg-[#DABFFF]/30 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <i className="fas fa-lightbulb text-[#907AD6] mt-1 text-xs"></i>
                        <p className="text-xs text-[#2C2A4A] leading-relaxed">
                          {insight.personalizedTips[0]}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Learning Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-target text-[#7FDEFF]"></i>
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-[#907AD6]/10 to-[#7FDEFF]/10 rounded-lg border border-[#907AD6]/20">
                <h4 className="font-medium text-gray-800 mb-2">Continue Learning</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Explore more scenarios in areas where you show strength to build expertise.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation('/scenarios')}
                  className="border-[#907AD6] text-[#907AD6] hover:bg-[#907AD6] hover:text-white"
                >
                  <i className="fas fa-search mr-2"></i>
                  Browse Scenarios
                </Button>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-[#7FDEFF]/10 to-[#907AD6]/10 rounded-lg border border-[#7FDEFF]/20">
                <h4 className="font-medium text-gray-800 mb-2">Track Progress</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Review your overall progress and see how you're improving over time.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation('/progress')}
                  className="border-[#7FDEFF] text-[#2C2A4A] hover:bg-[#7FDEFF] hover:text-white"
                >
                  <i className="fas fa-chart-line mr-2"></i>
                  View Progress
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center">
          <div className="space-x-4">
            <Button 
              onClick={() => setLocation('/dashboard')} 
              className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white px-8"
            >
              <i className="fas fa-home mr-2"></i>
              Return to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/scenarios')}
              className="border-[#907AD6] text-[#907AD6] hover:bg-[#907AD6] hover:text-white px-8"
            >
              <i className="fas fa-play mr-2"></i>
              Start New Scenario
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility functions
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'dementia_care': 'fas fa-brain',
    'end_of_life': 'fas fa-heart',
    'family_support': 'fas fa-users',
    'medication_management': 'fas fa-pills',
    'communication': 'fas fa-comments',
    'safeguarding': 'fas fa-shield-alt',
    'personal_care': 'fas fa-hands-helping'
  };
  return icons[category] || 'fas fa-circle';
}

function getStrengthColor(strength: number): string {
  if (strength >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (strength >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

function getStrengthLabel(strength: number): string {
  if (strength >= 80) return 'Strong';
  if (strength >= 60) return 'Developing';
  return 'Emerging';
}