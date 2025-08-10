import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { EmojiReactionButtons, QuickEmojiReaction } from "@/components/emoji-reaction-buttons";
import { useToast } from "@/hooks/use-toast";
import type { Scenario, UserScenario } from "@shared/schema";

export default function SimulationResults() {
  const [, params] = useRoute("/simulation/:scenarioId/results");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const scenarioId = params?.scenarioId;

  const { data: scenario, isLoading: scenarioLoading, error: scenarioError } = useQuery<Scenario>({
    queryKey: ['/api/scenarios', scenarioId],
    enabled: !!scenarioId
  });

  const { data: userScenario, isLoading: userScenarioLoading, error: userScenarioError } = useQuery<UserScenario>({
    queryKey: ['/api/user/scenarios', scenarioId],
    enabled: !!scenarioId,
    retry: 1,
    retryDelay: 1000
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

  // Handle case where scenario doesn't exist
  if (!scenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#907AD6]/5 to-[#7FDEFF]/5 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Scenario Not Found</h2>
            <p className="text-gray-600 mb-4">
              The requested scenario could not be found. It may have been removed or the link is incorrect.
            </p>

            <Button onClick={() => setLocation('/dashboard')} className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle case where user scenario doesn't exist, hasn't been completed, or there's an error
  if (userScenarioError || !userScenario || userScenario.status !== "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#907AD6]/5 to-[#7FDEFF]/5 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-clock text-amber-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {userScenarioError ? "Unable to Load Results" : "Scenario Not Completed"}
            </h2>
            <p className="text-gray-600 mb-4">
              {userScenarioError 
                ? "We're having trouble loading your results. Please try again or complete the scenario again."
                : "This scenario hasn't been completed yet. Complete the scenario first to see your results."
              }
            </p>

            <div className="space-y-2">
              <Button 
                onClick={() => setLocation(`/simulation/${scenarioId}`)} 
                className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white w-full"
              >
                <i className="fas fa-play mr-2"></i>
                Start Scenario
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/dashboard')} 
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </div>
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

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return "border-green-200";
    if (score >= 60) return "border-amber-200";
    return "border-red-200";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreLabelColor = (score: number) => {
    if (score >= 80) return "text-green-700";
    if (score >= 60) return "text-amber-700";
    return "text-red-700";
  };

  const getCardTheme = (score: number) => {
    if (score >= 80) return "border-2 border-green-200 bg-green-50";
    if (score >= 60) return "border-2 border-amber-200 bg-amber-50";
    return "border-2 border-red-200 bg-red-50";
  };

  const getHeaderTextColor = (score: number) => {
    if (score >= 80) return "text-green-800";
    if (score >= 60) return "text-amber-800";
    return "text-red-800";
  };

  const getDescriptionTextColor = (score: number) => {
    if (score >= 80) return "text-green-700";
    if (score >= 60) return "text-amber-700";
    return "text-red-700";
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Use the authentic score calculated during scenario completion
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
        <Card className={`mb-8 ${getCardTheme(overallScore)}`}>
          <CardHeader>
            <CardTitle className={`text-center text-2xl ${getHeaderTextColor(overallScore)}`}>
              <i className="fas fa-chart-line mr-2"></i>
              Overall Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-white border-4 ${getScoreBorderColor(overallScore)} mb-4`}>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreTextColor(overallScore)}`}>{overallScore}%</div>
                  <div className={`text-sm ${getScoreLabelColor(overallScore)} font-medium`}>{getScoreLabel(overallScore)}</div>
                </div>
              </div>
              <h3 className={`text-xl font-semibold ${getHeaderTextColor(overallScore)} mb-2`}>{scenario.title}</h3>
              <p className={`${getDescriptionTextColor(overallScore)} max-w-2xl mx-auto`}>
                {overallScore >= 80 
                  ? "Excellent work! You've successfully completed this care scenario with outstanding performance."
                  : overallScore >= 60 
                  ? "Well done! You've completed this care scenario with good understanding and consideration."
                  : "You've completed this care scenario. There are opportunities to improve your approach in future attempts."
                }
              </p>
              {/* Quick Win: Quick feedback summary */}
              {userScenario?.feedback?.[0]?.quickSummary && (
                <div className={`bg-white rounded-lg p-4 mt-6 border ${getScoreBorderColor(overallScore)}`}>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-lightbulb text-yellow-500 mt-1"></i>
                    <div>
                      <p className="font-medium text-gray-800 mb-1">Key Takeaway</p>
                      <p className="text-gray-700">{userScenario.feedback[0].quickSummary}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Emoji Reactions for Overall Performance */}
              <div className="mt-6">
                <EmojiReactionButtons
                  type="feedback"
                  contextId={`${scenarioId}-overall-performance`}
                  onReaction={(reaction) => {
                    toast({
                      title: `${reaction.emoji} ${reaction.label}!`,
                      description: reaction.description,
                      duration: 3000,
                    });
                  }}
                  showPersonalized={true}
                  className="border-none shadow-md hover:shadow-lg transition-all duration-300"
                />
              </div>
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
            {/* Individual Skills Breakdown */}
            {userScenario.feedback && Array.isArray(userScenario.feedback) && userScenario.feedback.length > 0 && (() => {
              // Calculate average skill scores from all feedback
              const skillTotals = { empathy: 0, communication: 0, professionalism: 0, problemSolving: 0 };
              const skillCounts = { empathy: 0, communication: 0, professionalism: 0, problemSolving: 0 };
              
              userScenario.feedback.forEach(feedback => {
                if (feedback.empathy) { skillTotals.empathy += feedback.empathy; skillCounts.empathy++; }
                if (feedback.communication) { skillTotals.communication += feedback.communication; skillCounts.communication++; }
                if (feedback.professionalism) { skillTotals.professionalism += feedback.professionalism; skillCounts.professionalism++; }
                if (feedback.problemSolving) { skillTotals.problemSolving += feedback.problemSolving; skillCounts.problemSolving++; }
              });
              
              const skillAverages = {
                empathy: skillCounts.empathy > 0 ? Math.round((skillTotals.empathy / skillCounts.empathy) * 20) : null,
                communication: skillCounts.communication > 0 ? Math.round((skillTotals.communication / skillCounts.communication) * 20) : null,
                professionalism: skillCounts.professionalism > 0 ? Math.round((skillTotals.professionalism / skillCounts.professionalism) * 20) : null,
                problemSolving: skillCounts.problemSolving > 0 ? Math.round((skillTotals.problemSolving / skillCounts.problemSolving) * 20) : null,
              };
              
              return (
                <>
                  <div className="col-span-full mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Individual Skills Assessment</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {skillAverages.empathy && (
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                            <i className="fas fa-heart text-blue-600"></i>
                          </div>
                          <h4 className="font-medium text-gray-800 mb-1">Empathy</h4>
                          <div className={`text-lg font-bold ${getScoreTextColor(skillAverages.empathy)}`}>
                            {skillAverages.empathy}%
                          </div>
                          <Progress value={skillAverages.empathy} className="mt-2" />
                        </div>
                      )}
                      {skillAverages.communication && (
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                            <i className="fas fa-comments text-green-600"></i>
                          </div>
                          <h4 className="font-medium text-gray-800 mb-1">Communication</h4>
                          <div className={`text-lg font-bold ${getScoreTextColor(skillAverages.communication)}`}>
                            {skillAverages.communication}%
                          </div>
                          <Progress value={skillAverages.communication} className="mt-2" />
                        </div>
                      )}
                      {skillAverages.professionalism && (
                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
                            <i className="fas fa-user-tie text-purple-600"></i>
                          </div>
                          <h4 className="font-medium text-gray-800 mb-1">Professionalism</h4>
                          <div className={`text-lg font-bold ${getScoreTextColor(skillAverages.professionalism)}`}>
                            {skillAverages.professionalism}%
                          </div>
                          <Progress value={skillAverages.professionalism} className="mt-2" />
                        </div>
                      )}
                      {skillAverages.problemSolving && (
                        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                            <i className="fas fa-lightbulb text-orange-600"></i>
                          </div>
                          <h4 className="font-medium text-gray-800 mb-1">Problem Solving</h4>
                          <div className={`text-lg font-bold ${getScoreTextColor(skillAverages.problemSolving)}`}>
                            {skillAverages.problemSolving}%
                          </div>
                          <Progress value={skillAverages.problemSolving} className="mt-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
            
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
                      ? userScenario.feedback[userScenario.feedback.length - 1]?.summary || "You completed this care scenario with thoughtful consideration."
                      : (userScenario.responses?.length || 0) > 0 
                        ? `You engaged with this scenario by providing ${userScenario.responses?.length || 0} thoughtful response${(userScenario.responses?.length || 0) === 1 ? '' : 's'} and completed the training successfully.`
                        : "You reviewed this care scenario and completed the training. Consider engaging more actively with future scenarios to maximize your learning experience."
                    }
                  </p>
                </div>
                
                <Separator className="my-6" />
                
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <h4 className="text-lg font-medium text-amber-800 mb-2">Areas for development:</h4>
                  <p className="text-amber-700 mb-3">
                    {overallScore >= 80 
                      ? "Keep up the excellent work! Continue practicing diverse scenarios to maintain your high performance level and explore advanced care situations."
                      : overallScore >= 60 
                      ? "Focus on increasing engagement and response depth. Try providing more detailed responses and consider multiple perspectives in care situations."
                      : "Consider spending more time exploring the scenario context and providing more comprehensive responses. Practice active listening and empathy skills."
                    }
                  </p>
                  
                  {/* Emoji Reactions for Development Areas */}
                  <div className="mt-4">
                    <QuickEmojiReaction
                      type="feedback"
                      contextId={`${scenarioId}-development-feedback`}
                      onReaction={(reaction) => {
                        toast({
                          title: `${reaction.emoji} ${reaction.label}!`,
                          description: reaction.description,
                          duration: 2500,
                        });
                      }}
                      className="opacity-80 hover:opacity-100 transition-opacity"
                    />
                  </div>
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

        {/* Reflection and Final Reactions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-heart text-pink-600"></i>
              How did this learning experience feel?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmojiReactionButtons
              type="achievement"
              contextId={`${scenarioId}-learning-experience`}
              onReaction={(reaction) => {
                toast({
                  title: `${reaction.emoji} ${reaction.label}!`,
                  description: `This helps us understand your learning journey better. ${reaction.description}`,
                  duration: 4000,
                });
              }}
              showPersonalized={true}
              className="border-none"
            />
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