import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SimulationPage() {
  const [, params] = useRoute("/simulation/:scenarioId");
  const [, setLocation] = useLocation();
  const scenarioId = params?.scenarioId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [conversation, setConversation] = useState<{ role: 'user' | 'ai' | 'system'; content: string; feedback?: any }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [viewState, setViewState] = useState<'preparation' | 'simulation' | 'completed'>('preparation');

  // Fetch scenario data
  const { data: scenario, isLoading: scenarioLoading } = useQuery({
    queryKey: ['/api/scenarios', scenarioId],
    enabled: !!scenarioId,
  });

  // Fetch user scenario progress
  const { data: userScenario } = useQuery({
    queryKey: ['/api/user/scenarios', scenarioId],
    enabled: !!scenarioId,
  });

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async (response: string) => {
      return await apiRequest('POST', `/api/scenarios/${scenarioId}/respond`, { response });
    },
    onSuccess: (data) => {
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
      setViewState('completed');
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
    onSuccess: (data: any) => {
      setConversation([{ role: 'system', content: data.initialMessage || 'Welcome to this training scenario. Let\'s begin.' }]);
      setViewState('simulation');
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

  // Initialize scenario state
  useEffect(() => {
    if (userScenario?.responses?.length) {
      // Restore conversation from saved responses
      const restoredConversation = userScenario.responses.map((response: any, index: number) => [
        { role: 'system' as const, content: response.aiMessage },
        { role: 'user' as const, content: response.userResponse },
        { role: 'ai' as const, content: response.aiResponse, feedback: response.feedback }
      ]).flat().filter(Boolean);
      setConversation(restoredConversation);
      setCurrentStep(userScenario.responses.length);
      if (userScenario.status === 'completed') {
        setIsCompleted(true);
        setViewState('completed');
      } else {
        setViewState('simulation');
      }
    } else if (userScenario?.status === 'in_progress') {
      setViewState('simulation');
    }
  }, [scenario, userScenario]);

  const handleStartSimulation = () => {
    startScenarioMutation.mutate();
  };

  const handleSubmitResponse = () => {
    if (!userResponse.trim()) return;
    submitResponseMutation.mutate(userResponse);
  };

  if (!scenario) return <div>Loading...</div>;

  const progress = userScenario?.responses ? (userScenario.responses.length * 33.33) : 0;

  // Render preparation screen
  if (viewState === 'preparation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#907AD6]/5 to-[#7FDEFF]/5">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/scenarios')}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Scenarios
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Before You Begin</h1>
                <p className="text-gray-600">Review the scenario details before starting your simulation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preparation Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Scenario Overview */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{scenario.title}</CardTitle>
                <div className="flex items-center gap-3">
                  <Badge className={`${
                    scenario.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    scenario.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {scenario.difficulty}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    <i className="fas fa-clock mr-1"></i>
                    {scenario.estimatedTime} min
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{scenario.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <i className="fas fa-tag text-gray-400"></i>
                <span className="text-gray-600">
                  {scenario.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Context & Setup */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-scenario text-blue-500"></i>
                Scenario Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{scenario.context}</p>
              </div>
            </CardContent>
          </Card>

          {/* Learning Objectives */}
          {scenario.learningObjectives && scenario.learningObjectives.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-target text-green-500"></i>
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {scenario.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs font-medium">{index + 1}</span>
                      </div>
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-info-circle text-purple-500"></i>
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-comments text-purple-600"></i>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">Interactive Chat</h4>
                  <p className="text-sm text-gray-600">Engage in realistic conversations with AI characters</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-lightbulb text-blue-600"></i>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">Real-time Feedback</h4>
                  <p className="text-sm text-gray-600">Receive instant feedback on your responses</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-chart-line text-green-600"></i>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">Performance Analysis</h4>
                  <p className="text-sm text-gray-600">Get detailed analysis at the end</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="text-center">
            <Button 
              onClick={handleStartSimulation}
              disabled={startScenarioMutation.isPending}
              className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white px-8 py-3 text-lg"
              size="lg"
            >
              {startScenarioMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Starting Simulation...
                </>
              ) : (
                <>
                  <i className="fas fa-play mr-3"></i>
                  Start Simulation
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              Ready to begin? This simulation will take approximately {scenario.estimatedTime} minutes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render simulation screen
  if (viewState === 'simulation') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] px-6 py-4 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-user-nurse text-white text-lg"></i>
              </div>
              <div className="text-white">
                <h3 className="font-semibold">{scenario.title}</h3>
                <p className="text-sm opacity-90">Interactive Training Simulation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <span className="text-sm text-white">Step {currentStep + 1} of 3</span>
                <div className="flex gap-1 ml-2">
                  {[0, 1, 2].map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full ${
                        step <= currentStep ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-white">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {conversation.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-3 max-w-2xl ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-[#907AD6]' 
                        : message.role === 'system'
                        ? 'bg-blue-500'
                        : 'bg-gray-400'
                    }`}>
                      <i className={`text-white ${
                        message.role === 'user' 
                          ? 'fas fa-user' 
                          : message.role === 'system'
                          ? 'fas fa-info'
                          : 'fas fa-robot'
                      }`}></i>
                    </div>
                    
                    {/* Message Content */}
                    <div className={`px-6 py-4 rounded-2xl ${
                      message.role === 'user' 
                        ? 'bg-[#907AD6] text-white rounded-br-md' 
                        : message.role === 'system'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200 rounded-bl-md'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                    }`}>
                      <p className="leading-relaxed">{message.content}</p>
                      
                      {/* Timestamp */}
                      <div className={`text-xs mt-3 opacity-70 ${
                        message.role === 'user' ? 'text-white' : 'text-gray-500'
                      }`}>
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {/* Feedback */}
                      {message.feedback && (
                        <div className="mt-4 pt-4 border-t border-gray-200/30">
                          <div className="flex items-start gap-2">
                            <i className="fas fa-lightbulb text-yellow-500 mt-1"></i>
                            <div>
                              <p className="text-sm font-medium opacity-90 mb-2">Feedback:</p>
                              <p className="text-sm opacity-75 leading-relaxed">
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
                  <div className="flex items-start gap-3 max-w-2xl">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-robot text-white"></i>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-gray-500">Analysing your response...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          {!isCompleted && (
            <div className="bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your response here... Focus on empathy, clarity, and appropriate care approaches."
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    rows={3}
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
                  className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white px-6 py-3 h-auto rounded-xl"
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
              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <i className="fas fa-info-circle"></i>
                  <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
                <div className="text-right">
                  <span>Focus on empathy, clarity, and care approaches</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render completion screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#907AD6]/5 to-[#7FDEFF]/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    </div>
  );
}