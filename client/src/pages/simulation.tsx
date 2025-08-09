import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Scenario, UserScenario } from "@shared/schema";

export default function Simulation() {
  const [, params] = useRoute("/simulation/:scenarioId");
  const [, setLocation] = useLocation();
  const scenarioId = params?.scenarioId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [conversation, setConversation] = useState<{ role: 'user' | 'ai' | 'system'; content: string; feedback?: any }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch scenario data
  const { data: scenario, isLoading: scenarioLoading } = useQuery<Scenario>({
    queryKey: ['/api/scenarios', scenarioId],
    enabled: !!scenarioId
  });

  // Fetch user scenario progress
  const { data: userScenario, isLoading: userScenarioLoading } = useQuery<UserScenario>({
    queryKey: ['/api/user/scenarios', scenarioId],
    enabled: !!scenarioId
  });

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async (response: string) => {
      return await apiRequest('POST', `/api/scenarios/${scenarioId}/conversation`, { 
        message: response,
        conversationHistory: conversation.map(c => ({ role: c.role, message: c.content }))
      });
    },
    onSuccess: (data: any) => {
      setConversation(prev => [
        ...prev,
        { role: 'user', content: userResponse },
        { role: 'ai', content: data.aiResponse, feedback: data.feedback }
      ]);
      setUserResponse("");
      setCurrentStep(prev => prev + 1);
      
      // Check if this is the final step (5 responses)
      if (currentStep >= 4) {
        setIsCompleted(true);
        queryClient.invalidateQueries({ queryKey: ['/api/user/scenarios'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
        toast({
          title: "Scenario Completed!",
          description: "Well done! Your responses have been saved and analysed.",
        });
      }
    },
    onError: (error: any) => {
      console.error('Submit response error:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Start scenario mutation
  const startScenarioMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/scenarios/${scenarioId}/start`);
    },
    onSuccess: (data) => {
      setConversation([{ role: 'system', content: scenario?.context || 'Welcome to this training scenario.' }]);
      queryClient.invalidateQueries({ queryKey: ['/api/user/scenarios', scenarioId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start scenario. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Initialize scenario if not started
  useEffect(() => {
    if (scenario && !userScenario && !conversation.length) {
      startScenarioMutation.mutate();
    } else if (userScenario?.responses?.length) {
      // Restore conversation from saved responses
      const restoredConversation = userScenario.responses.map((response: any, index: number) => [
        { role: 'system' as const, content: response.aiMessage },
        { role: 'user' as const, content: response.userResponse },
        { role: 'ai' as const, content: response.aiResponse, feedback: response.feedback }
      ]).flat().filter(Boolean);
      setConversation(restoredConversation);
      setCurrentStep(userScenario.responses.length);
      setIsCompleted(userScenario.status === 'completed');
    }
  }, [scenario, userScenario]);

  const handleSubmitResponse = () => {
    if (!userResponse.trim()) return;
    submitResponseMutation.mutate(userResponse);
  };

  const handleReturnToDashboard = () => {
    setLocation('/');
  };

  if (scenarioLoading || userScenarioLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-64" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Scenario Not Found</h2>
            <p className="text-gray-600 mb-4">The requested training scenario could not be found.</p>
            <Button onClick={handleReturnToDashboard}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = userScenario?.progress || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleReturnToDashboard}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">{scenario.title}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant={scenario.difficulty === 'beginner' ? 'secondary' : scenario.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                    {scenario.difficulty}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    <i className="fas fa-clock mr-1"></i>
                    {scenario.estimatedTime} min
                  </span>
                  <span className="text-sm text-gray-500">
                    <i className="fas fa-tag mr-1"></i>
                    {scenario.category}
                  </span>
                </div>
              </div>
            </div>
            {progress > 0 && (
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Progress:</span>
                  <Progress value={progress} className="w-32" />
                  <span className="text-sm font-medium text-gray-800">{progress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Scenario Context */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-info-circle text-blue-500"></i>
              Scenario Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{scenario.context}</p>
            {scenario.learningObjectives && scenario.learningObjectives.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">Learning Objectives:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {scenario.learningObjectives.map((objective, index) => (
                    <li key={index} className="text-gray-600 text-sm">{objective}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation Area */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-comments text-green-500"></i>
              Training Simulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversation.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-[#907AD6] text-white' 
                      : message.role === 'ai'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    {message.feedback && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          <strong>Feedback:</strong> {message.feedback.summary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {submitResponseMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                      <span className="text-sm">Analysing your response...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Response Area */}
        {!isCompleted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-reply text-purple-500"></i>
                Your Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your response to the scenario here..."
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Take your time to consider your response. Focus on empathy, clarity, and appropriate care approaches.
                  </p>
                  <Button 
                    onClick={handleSubmitResponse}
                    disabled={!userResponse.trim() || submitResponseMutation.isPending}
                    className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white"
                  >
                    {submitResponseMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Response
                        <i className="fas fa-paper-plane ml-2"></i>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Card */}
        {isCompleted && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Scenario Completed!</h3>
              <p className="text-green-700 mb-4">
                Well done! You've successfully completed this training scenario. 
                Your responses have been saved and you can review your progress on the dashboard.
              </p>
              <Button onClick={handleReturnToDashboard} className="bg-green-600 hover:bg-green-700 text-white">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}