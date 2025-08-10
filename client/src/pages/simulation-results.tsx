import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { Scenario, UserScenario } from "@shared/schema";

export default function SimulationResults() {
  const [, params] = useRoute("/simulation/:scenarioId/results");
  const [, setLocation] = useLocation();
  const scenarioId = params?.scenarioId;

  const { data: scenario, isLoading: scenarioLoading } = useQuery<Scenario>({
    queryKey: ['/api/scenarios', scenarioId],
    enabled: !!scenarioId
  });

  const { data: userScenario, isLoading: userScenarioLoading } = useQuery<UserScenario>({
    queryKey: ['/api/user/scenarios', scenarioId],
    enabled: !!scenarioId
  });

  const isLoading = scenarioLoading || userScenarioLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#907AD6]/5 to-[#7FDEFF]/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="text-center">
                      <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!scenario || !userScenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#907AD6]/5 to-[#7FDEFF]/5 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Results Not Found</h2>
            <p className="text-gray-600 mb-4">
              We couldn't find the results for this scenario. This may be because the scenario hasn't been completed yet.
            </p>
            <Button onClick={() => setLocation('/dashboard')} className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const overallScore = userScenario.score || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#907AD6]/5 to-[#7FDEFF]/5">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-trophy text-green-600 text-xl"></i>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Scenario Complete!</h1>
                  <p className="text-gray-600">Well done on completing this training scenario</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-[#907AD6] text-white">
                  {formatCategory(scenario.category)}
                </Badge>
                <span className="text-sm text-gray-500">
                  <i className="fas fa-clock mr-1"></i>
                  {scenario.estimatedTime} minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score */}
        <Card className="mb-8 border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-green-800">
              <i className="fas fa-chart-line mr-2"></i>
              Overall Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white border-4 border-green-200 mb-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{overallScore}%</div>
                  <div className="text-sm text-green-700 font-medium">{getScoreLabel(overallScore)}</div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">{scenario.title}</h3>
              <p className="text-green-700 max-w-2xl mx-auto">
                You've successfully completed this care scenario. Your responses showed thoughtful consideration 
                of the care situation and demonstrated your developing skills in this area.
              </p>
              {/* Quick Win: Quick feedback summary */}
              {userScenario?.feedback?.[0]?.quickSummary && (
                <div className="bg-white rounded-lg p-4 mt-6 border border-green-200">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-lightbulb text-yellow-500 mt-1"></i>
                    <div>
                      <p className="font-medium text-gray-800 mb-1">Key Takeaway</p>
                      <p className="text-gray-700">{userScenario.feedback[0].quickSummary}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-chart-bar text-[#907AD6]"></i>
              Detailed Skills Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Performance */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <i className="fas fa-star text-purple-600 text-2xl"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Overall Performance</h4>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(overallScore)}`}>
                  {overallScore}%
                </div>
                <Progress value={overallScore} className="mt-3" />
                <p className="text-xs text-gray-600 mt-2">
                  Your overall performance in this scenario
                </p>
              </div>

              {/* Training Time */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <i className="fas fa-clock text-blue-600 text-2xl"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Time Spent</h4>
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {userScenario.totalTime || 0} min
                </div>
                <div className="mt-3 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((userScenario.totalTime || 0) / (scenario?.estimatedTime || 10) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Time invested in learning this scenario
                </p>
              </div>

              {/* Responses Given */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <i className="fas fa-comments text-amber-600 text-2xl"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Responses</h4>
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                  {userScenario.responses?.length || 0}
                </div>
                <div className="mt-3 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((userScenario.responses?.length || 0) / 5 * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Number of thoughtful responses provided
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        {userScenario.feedback && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-lightbulb text-yellow-600"></i>
                Key Insights & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h4 className="text-lg font-medium text-blue-800 mb-2">What you did well:</h4>
                  <p className="text-blue-700 mb-0">
                    {userScenario.feedback && Array.isArray(userScenario.feedback) && userScenario.feedback.length > 0 
                      ? userScenario.feedback[0]?.summary || "You showed good care skills in this scenario."
                      : "You demonstrated thoughtful responses and consideration in this care scenario."
                    }
                  </p>
                </div>
                
                <Separator className="my-6" />
                
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <h4 className="text-lg font-medium text-amber-800 mb-2">Areas for development:</h4>
                  <p className="text-amber-700 mb-0">
                    Continue practising to build confidence in similar scenarios. Focus on applying care principles 
                    consistently and building your communication skills through regular training sessions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-arrow-right text-[#7FDEFF]"></i>
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-[#907AD6]/10 to-[#7FDEFF]/10 rounded-lg border border-[#907AD6]/20">
                <h4 className="font-medium text-gray-800 mb-2">Continue Learning</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Explore more scenarios in the {formatCategory(scenario.category)} category to build your expertise.
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
                  Review your overall progress and achievements on your personal dashboard.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation('/dashboard')}
                  className="border-[#7FDEFF] text-[#2C2A4A] hover:bg-[#7FDEFF] hover:text-white"
                >
                  <i className="fas fa-chart-line mr-2"></i>
                  View Dashboard
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
              onClick={() => setLocation(`/scenarios`)}
              className="border-[#907AD6] text-[#907AD6] hover:bg-[#907AD6] hover:text-white px-8"
            >
              <i className="fas fa-redo mr-2"></i>
              Try Another Scenario
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}