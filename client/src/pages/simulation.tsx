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
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // Check if this is the final step (3 responses for quicker testing)
      if (newStep >= 3) {
        // Call complete scenario endpoint
        completeScenarioMutation.mutate();
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

  // Complete scenario mutation
  const completeScenarioMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/scenarios/${scenarioId}/complete`);
    },
    onSuccess: () => {
      setIsCompleted(true);
      queryClient.invalidateQueries({ queryKey: ['/api/user/scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      toast({
        title: "Scenario Completed!",
        description: "Well done! Your responses have been saved and analysed.",
      });
    },
    onError: (error: any) => {
      console.error('Complete scenario error:', error);
      toast({
        title: "Error",
        description: "Failed to complete scenario. Please try again.",
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
                    {scenario.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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

        {/* Interactive Chat Interface */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-user-nurse text-white text-lg"></i>
              </div>
              <div className="text-white">
                <h3 className="font-semibold">Training Simulation</h3>
                <p className="text-sm opacity-90">Practise real-world care scenarios</p>
              </div>
              <div className="ml-auto">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto px-6 py-4 bg-gray-50">
            <div className="space-y-4">
              {conversation.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-3 max-w-sm lg:max-w-md ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-[#907AD6]' 
                        : message.role === 'system'
                        ? 'bg-blue-500'
                        : 'bg-gray-400'
                    }`}>
                      <i className={`text-white text-xs ${
                        message.role === 'user' 
                          ? 'fas fa-user' 
                          : message.role === 'system'
                          ? 'fas fa-info'
                          : 'fas fa-robot'
                      }`}></i>
                    </div>
                    
                    {/* Message Content */}
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user' 
                        ? 'bg-[#907AD6] text-white rounded-br-md' 
                        : message.role === 'system'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200 rounded-bl-md'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {/* Timestamp */}
                      <div className={`text-xs mt-2 opacity-70 ${
                        message.role === 'user' ? 'text-white' : 'text-gray-500'
                      }`}>
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {/* Feedback */}
                      {message.feedback && (
                        <div className="mt-3 pt-3 border-t border-gray-200/30">
                          <div className="flex items-start gap-2">
                            <i className="fas fa-lightbulb text-yellow-500 text-xs mt-1"></i>
                            <div>
                              <p className="text-xs font-medium opacity-90 mb-1">Feedback:</p>
                              <p className="text-xs opacity-75 leading-relaxed">
                                {message.feedback.summary}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {submitResponseMutation.isPending && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-sm">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-robot text-white text-xs"></i>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">Analysing your response...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          {!isCompleted && (
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your response here... Focus on empathy, clarity, and appropriate care approaches."
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    rows={2}
                    className="resize-none border-gray-300 focus:border-[#907AD6] focus:ring-[#907AD6] rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (userResponse.trim() && !submitResponseMutation.isPending) {
                          handleSubmitResponse();
                        }
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={handleSubmitResponse}
                  disabled={!userResponse.trim() || submitResponseMutation.isPending}
                  className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white px-6 py-2 h-auto rounded-xl"
                  size="lg"
                >
                  {submitResponseMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <i className="fas fa-paper-plane text-lg"></i>
                  )}
                </Button>
              </div>
              
              {/* Helper Text */}
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <i className="fas fa-info-circle"></i>
                  <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Step {currentStep + 1} of 3</span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full ${
                          step <= currentStep ? 'bg-[#907AD6]' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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
                Click "View Results" to see your detailed performance analysis and feedback.
              </p>
              <div className="space-x-4">
                <Button 
                  onClick={() => setLocation(`/simulation/${scenarioId}/results`)} 
                  className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white"
                >
                  <i className="fas fa-chart-line mr-2"></i>
                  View Results
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/dashboard')} 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Skip to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}