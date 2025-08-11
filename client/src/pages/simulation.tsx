import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { EmojiReactionButtons, QuickEmojiReaction } from "@/components/emoji-reaction-buttons";
import { Progress } from "@/components/ui/progress";
import { AIThinkingLoader, ScenarioLoadingSpinner, FeedbackLoadingIndicator } from "@/components/smart-loading";
import { motion } from "framer-motion";
import { extractPatientName } from "@/utils/extract-patient-name";

export default function SimulationPage() {
  const [, params] = useRoute("/simulation/:scenarioId");
  const [, setLocation] = useLocation();
  const scenarioId = params?.scenarioId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [conversation, setConversation] = useState<{ role: 'user' | 'character' | 'system'; content: string; feedback?: any; learningHints?: any[]; alternatives?: any[] }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [viewState, setViewState] = useState<'preparation' | 'simulation' | 'completed'>('preparation');
  const [isListening, setIsListening] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showLearningHints, setShowLearningHints] = useState(true);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [conversationAnalysis, setConversationAnalysis] = useState<any>(null);
  const [currentHints, setCurrentHints] = useState<any[]>([]);

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
      // Convert conversation to the expected format
      const conversationHistory = conversation
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'character',
          message: msg.content
        }));
      
      const apiResponse = await apiRequest('POST', `/api/scenarios/${scenarioId}/conversation`, {
        message: response,
        conversationHistory
      });
      
      return await apiResponse.json();
    },
    onSuccess: (data) => {
      const newMessages = [
        { role: 'user' as const, content: userResponse },
        { 
          role: 'character' as const, 
          content: data.aiResponse, 
          feedback: data.feedback,
          learningHints: data.learningHints || [],
          alternatives: data.alternatives || []
        }
      ];
      
      setConversation(prev => [...prev, ...newMessages]);
      
      // Update learning data
      if (data.learningHints) setCurrentHints(data.learningHints);
      if (data.conversationAnalysis) setConversationAnalysis(data.conversationAnalysis);
      
      setUserResponse("");
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
    },
    onError: (error: any) => {
      console.error('❌ Submit response error:', error);
      console.error('🔍 Error details:', error?.response?.data || error?.message);
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
      // Calculate elapsed time in minutes
      const elapsedTime = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60)) : 0;
      
      const apiResponse = await apiRequest('POST', `/api/scenarios/${scenarioId}/complete`, {
        totalTime: elapsedTime
      });
      return await apiResponse.json();
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
      const apiResponse = await apiRequest('POST', `/api/scenarios/${scenarioId}/start`);
      return await apiResponse.json();
    },
    onSuccess: (data: any) => {
      // Set up the conversation with the patient's opening message
      const initialMessage = typeof data.initialMessage === 'string' 
        ? data.initialMessage 
        : data.initialMessage?.message || 'Hello, I need to speak with someone about my care...';
        
      const initialMessages = [
        { role: 'system' as const, content: 'Training simulation started. The patient will now speak to you.' },
        { role: 'character' as const, content: initialMessage }
      ];
      setConversation(initialMessages);
      setViewState('simulation');
      
      // Start countdown timer
      const estimatedTime = scenario?.estimatedTime || 15;
      setTimeRemaining(estimatedTime * 60); // Convert minutes to seconds
      setStartTime(new Date());
      
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

  // Countdown timer effect
  useEffect(() => {
    if (viewState === 'simulation' && timeRemaining > 0 && !isCompleted) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - auto complete scenario
            completeScenarioMutation.mutate();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [viewState, timeRemaining, isCompleted, completeScenarioMutation]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize scenario state
  useEffect(() => {
    if (userScenario?.status === 'completed') {
      // Handle completed scenarios - redirect to results
      setIsCompleted(true);
      setViewState('completed');
      setLocation(`/simulation/${scenarioId}/results`);
      return;
    } else if (userScenario?.responses?.length) {
      // Restore conversation from saved responses for in-progress scenarios
      const systemMessage = { role: 'system' as const, content: 'Training simulation in progress.' };
      const restoredConversation = [
        systemMessage,
        ...userScenario.responses.map((response: any, index: number) => [
          { role: 'user' as const, content: response.userResponse },
          { role: 'character' as const, content: typeof response.aiResponse === 'string' ? response.aiResponse : response.aiResponse?.message || '', feedback: response.feedback }
        ]).flat().filter(Boolean)
      ];
      setConversation(restoredConversation);
      setCurrentStep(userScenario.responses.length);
      setViewState('simulation');
    } else if (userScenario?.status === 'in_progress' && (!userScenario.responses || userScenario.responses.length === 0)) {
      // Started but no responses yet
      setViewState('simulation');
    } else if (!userScenario) {
      // Scenario hasn't been started yet - show preparation screen
      setViewState('preparation');
      setConversation([]);
      setCurrentStep(0);
      setIsCompleted(false);
    }
  }, [scenario, userScenario, scenarioId, setLocation]);

  const handleStartSimulation = () => {
    // Clear any existing conversation state
    setConversation([]);
    setCurrentStep(0);
    setIsCompleted(false);
    startScenarioMutation.mutate();
  };

  const handleSubmitResponse = () => {
    if (!userResponse.trim()) return;
    submitResponseMutation.mutate(userResponse);
  };

  // Quick Win: Voice responses using Web Speech API
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recognition. Please type your response.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-GB'; // British English to match app language
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserResponse(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      setIsListening(false);
      toast({
        title: "Voice recognition failed",
        description: "Please try again or type your response.",
        variant: "destructive",
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  if (!scenario) return (
    <div className="container mx-auto px-4 py-8">
      <ScenarioLoadingSpinner />
    </div>
  );

  const progress = userScenario?.responses ? (userScenario.responses.length * 33.33) : 0;

  // Render preparation screen
  if (viewState === 'preparation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#907AD6]/5 to-[#7FDEFF]/5">
        {/* Clean Simple Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/scenarios')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back
                </Button>
                <div className="h-5 w-px bg-gray-300"></div>
                <h1 className="text-2xl font-semibold text-gray-900">Scenario Overview</h1>
              </div>
              <div className="text-sm text-gray-500">
                <i className="fas fa-clock mr-1"></i>
                {scenario?.estimatedTime} min
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
              <p className="text-gray-700 mb-6">{scenario.description}</p>
              
              {/* Skills Practice Section */}
              <div className="bg-[#907AD6]/5 border border-[#907AD6]/20 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-dumbbell text-[#907AD6]"></i>
                  Skills You'll Practice
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white border border-blue-200 rounded-lg p-3 text-center">
                    <i className="fas fa-heart text-blue-500 text-lg mb-2"></i>
                    <div className="text-sm font-medium text-gray-800">Empathy</div>
                    <div className="text-xs text-gray-500">Understanding patient needs</div>
                  </div>
                  <div className="bg-white border border-green-200 rounded-lg p-3 text-center">
                    <i className="fas fa-comments text-green-500 text-lg mb-2"></i>
                    <div className="text-sm font-medium text-gray-800">Communication</div>
                    <div className="text-xs text-gray-500">Clear, caring dialogue</div>
                  </div>
                  <div className="bg-white border border-purple-200 rounded-lg p-3 text-center">
                    <i className="fas fa-user-tie text-purple-500 text-lg mb-2"></i>
                    <div className="text-sm font-medium text-gray-800">Professionalism</div>
                    <div className="text-xs text-gray-500">Appropriate boundaries</div>
                  </div>
                  <div className="bg-white border border-orange-200 rounded-lg p-3 text-center">
                    <i className="fas fa-puzzle-piece text-orange-500 text-lg mb-2"></i>
                    <div className="text-sm font-medium text-gray-800">Problem Solving</div>
                    <div className="text-xs text-gray-500">Finding solutions</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <i className="fas fa-tag text-gray-400"></i>
                <span className="text-gray-600">
                  {scenario.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Patient Background */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-user-injured text-blue-500"></i>
                Patient Background
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">Take time to read and understand the patient's history and current situation</p>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <div className="prose prose-sm max-w-none">
                  {scenario.context.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
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
                <p className="text-sm text-gray-600 mt-1">Skills you'll practice and develop during this simulation</p>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-400">
                  <ul className="space-y-4">
                    {scenario.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 border-green-200">
                          <span className="text-green-700 text-sm font-bold">{index + 1}</span>
                        </div>
                        <span className="text-gray-700 leading-relaxed font-medium">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
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

          {/* Enhanced Start Button Section */}
          <div className="text-center">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#907AD6] to-[#7FDEFF] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <i className="fas fa-play text-white text-2xl ml-1"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Start?</h3>
                <p className="text-gray-600">
                  This simulation will take approximately <span className="font-semibold text-[#907AD6]">{scenario?.estimatedTime} minutes</span>
                </p>
              </div>
              
              <Button 
                onClick={handleStartSimulation}
                disabled={startScenarioMutation.isPending}
                className="bg-gradient-to-r from-[#907AD6] to-[#7B6BC7] hover:from-[#7B6BC7] hover:to-[#6B5BB7] text-white px-8 py-4 text-lg font-semibold w-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                {startScenarioMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Preparing Scenario...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play mr-3"></i>
                    Begin Simulation
                  </>
                )}
              </Button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <i className="fas fa-shield-alt text-green-500"></i>
                <span>Safe learning environment</span>
              </div>
            </div>
            
            {/* Additional Tips */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-lightbulb text-amber-600 mt-1"></i>
                  <div className="text-left">
                    <h4 className="font-medium text-amber-800 mb-1">💡 Quick Tips</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Take your time to read each message carefully</li>
                      <li>• Focus on empathy and professional communication</li>
                      <li>• Use the patient context if you need a reminder</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
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
              {/* Timer */}
              {timeRemaining > 0 && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  timeRemaining < 120 ? 'bg-red-500/20 text-red-100' : 'bg-white/20'
                }`}>
                  <i className="fas fa-clock text-sm"></i>
                  <span className="text-sm font-medium text-white">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              

              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-white capitalize">{scenario.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Context Modal */}
        <div className="bg-amber-50 border-l-4 border-amber-400 px-6 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <i className="fas fa-user-injured text-amber-600"></i>
                <div>
                  <h4 className="font-medium text-amber-800">Patient Context Available</h4>
                  <p className="text-xs text-amber-600">Click to view full patient background and context</p>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-400"
                  >
                    <i className="fas fa-info-circle mr-2"></i>
                    View Context
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-800">
                      <i className="fas fa-user-injured"></i>
                      Patient Context
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                        {scenario.context}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <i className="fas fa-lightbulb text-blue-600 mt-1"></i>
                        <div>
                          <p className="text-xs font-medium text-blue-800 mb-1">Remember:</p>
                          <p className="text-xs text-blue-700">
                            Keep this context in mind during your conversation. Focus on empathy, understanding, and appropriate care approaches.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
            <div className="space-y-4 sm:space-y-6">
              {conversation.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-2xl ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar with Name */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-[#907AD6]' 
                          : message.role === 'system'
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                      }`}>
                        <i className={`text-white text-xs sm:text-sm ${
                          message.role === 'user' 
                            ? 'fas fa-user' 
                            : message.role === 'system'
                            ? 'fas fa-info'
                            : 'fas fa-user-nurse'
                        }`}></i>
                      </div>
                      {/* Character Name */}
                      {message.role === 'character' && scenario?.context && (
                        <div className="text-xs text-gray-500 mt-1 text-center max-w-16 truncate">
                          {extractPatientName(scenario.context)}
                        </div>
                      )}
                      {message.role === 'user' && (
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          You
                        </div>
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className={`px-3 py-3 sm:px-6 sm:py-4 rounded-2xl ${
                        message.role === 'user' 
                          ? 'bg-[#907AD6] text-white rounded-br-md' 
                          : message.role === 'system'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200 rounded-bl-md'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                      }`}>
                      <p className="leading-relaxed text-sm sm:text-base break-words">{message.content}</p>
                      
                      {/* Timestamp */}
                      <div className={`text-xs mt-2 sm:mt-3 opacity-70 ${
                        message.role === 'user' ? 'text-white' : 'text-gray-500'
                      }`}>
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {/* Enhanced Feedback Display */}
                      {message.feedback && (
                        <motion.div 
                          className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200/30"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="flex items-start gap-2 mb-2 sm:mb-3">
                            <motion.i 
                              className="fas fa-lightbulb text-yellow-500 mt-1 text-sm"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            />
                            <div className="flex-1">
                              <p className="text-xs sm:text-sm font-medium opacity-90 mb-1 sm:mb-2">Key Insights & Feedback:</p>
                              <motion.p 
                                className="text-xs sm:text-sm opacity-75 leading-relaxed mb-2 sm:mb-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                {message.feedback.summary}
                              </motion.p>
                              
                              {/* Skills breakdown with animations */}
                              {(message.feedback.empathy || message.feedback.communication || message.feedback.professionalism || message.feedback.problemSolving) && (
                                <motion.div 
                                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 sm:mb-3 text-xs"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  {message.feedback.empathy && (
                                    <motion.div 
                                      className="bg-blue-50/50 p-2 rounded border border-blue-100"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <span className="font-medium text-blue-800">Empathy: </span>
                                      <span className="text-blue-700 font-bold">{message.feedback.empathy}/5</span>
                                    </motion.div>
                                  )}
                                  {message.feedback.communication && (
                                    <motion.div 
                                      className="bg-green-50/50 p-2 rounded border border-green-100"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <span className="font-medium text-green-800">Communication: </span>
                                      <span className="text-green-700 font-bold">{message.feedback.communication}/5</span>
                                    </motion.div>
                                  )}
                                  {message.feedback.professionalism && (
                                    <motion.div 
                                      className="bg-purple-50/50 p-2 rounded border border-purple-100"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <span className="font-medium text-purple-800">Professionalism: </span>
                                      <span className="text-purple-700 font-bold">{message.feedback.professionalism}/5</span>
                                    </motion.div>
                                  )}
                                  {message.feedback.problemSolving && (
                                    <motion.div 
                                      className="bg-orange-50/50 p-2 rounded border border-orange-100"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <span className="font-medium text-orange-800">Problem Solving: </span>
                                      <span className="text-orange-700 font-bold">{message.feedback.problemSolving}/5</span>
                                    </motion.div>
                                  )}
                                </motion.div>
                              )}

                              {/* Key Insights */}
                              {message.feedback.keyInsights && message.feedback.keyInsights.length > 0 && (
                                <motion.div 
                                  className="bg-indigo-50/50 p-2 sm:p-3 rounded border border-indigo-100 mb-2 sm:mb-3"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                    <i className="fas fa-brain text-indigo-600 text-xs sm:text-sm"></i>
                                    <span className="font-medium text-indigo-800 text-xs">Key Insights:</span>
                                  </div>
                                  <ul className="text-xs text-indigo-700 space-y-1">
                                    {message.feedback.keyInsights.map((insight, i) => (
                                      <motion.li 
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="flex items-start gap-2"
                                      >
                                        <span className="text-indigo-400 mt-0.5">•</span>
                                        <span>{insight}</span>
                                      </motion.li>
                                    ))}
                                  </ul>
                                </motion.div>
                              )}
                              
                              {/* Quick summary with enhanced styling */}
                              {message.feedback.quickSummary && (
                                <motion.div 
                                  className="bg-gradient-to-r from-yellow-50 to-orange-50 p-2 sm:p-3 rounded border border-yellow-200 text-xs"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.5 }}
                                  whileHover={{ scale: 1.01 }}
                                >
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <motion.span 
                                      className="text-base sm:text-lg"
                                      animate={{ rotate: [0, 10, -10, 0] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                                    >
                                      💡
                                    </motion.span>
                                    <span className="font-medium text-yellow-800 text-xs">Key Takeaway: </span>
                                  </div>
                                  <p className="text-yellow-700 mt-1 font-medium text-xs">{message.feedback.quickSummary}</p>
                                </motion.div>
                              )}
                            </div>
                          </div>
                          
                          {/* Emoji Reaction Buttons for Feedback */}
                          <motion.div 
                            className="mt-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                          >
                            <QuickEmojiReaction
                              type="feedback"
                              contextId={`${scenarioId}-step-${index}`}
                              onReaction={(reaction) => {
                                toast({
                                  title: `${reaction.emoji} ${reaction.label}!`,
                                  description: reaction.description,
                                  duration: 2000,
                                });
                              }}
                              className="opacity-80 hover:opacity-100 transition-opacity"
                            />
                          </motion.div>
                        </motion.div>
                      )}
                      </div>
                      
                      {/* Emoji Reactions for AI Character Messages */}
                      {message.role === 'character' && !message.feedback && (
                        <div className="ml-13 mt-2">
                          <QuickEmojiReaction
                            type="scenario"
                            contextId={`${scenarioId}-message-${index}`}
                            onReaction={(reaction) => {
                              toast({
                                title: `${reaction.emoji} ${reaction.label}!`,
                                description: reaction.description,
                                duration: 2000,
                              });
                            }}
                            className="opacity-70 hover:opacity-100 transition-opacity"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Smart AI Thinking Indicator */}
              {submitResponseMutation.isPending && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-2xl">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-user-nurse text-white text-xs sm:text-sm"></i>
                      </div>
                      {/* Patient name while thinking */}
                      {scenario?.context && (
                        <div className="text-xs text-gray-500 mt-1 text-center max-w-16 truncate">
                          {extractPatientName(scenario.context)}
                        </div>
                      )}
                    </div>
                    <div className="bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
                      <AIThinkingLoader size="sm" className="bg-transparent border-0 p-0" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          {!isCompleted && (
            <div className="bg-white border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
              {/* Quick Tips Bar */}
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <i className="fas fa-lightbulb text-blue-600 text-sm"></i>
                  <span className="text-xs sm:text-sm font-medium text-blue-800">Remember to:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 text-xs text-blue-700">
                  <span>• Show empathy and understanding</span>
                  <span>• Listen actively to their concerns</span>
                  <span>• Maintain professional boundaries</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Type your response here... Focus on empathy, clarity, and appropriate care approaches."
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    rows={3}
                    className="resize-none border-gray-300 focus:border-[#907AD6] focus:ring-[#907AD6] rounded-xl pr-10 sm:pr-12 text-sm sm:text-base"
                    disabled={isListening}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (userResponse.trim() && !submitResponseMutation.isPending) {
                          handleSubmitResponse();
                        }
                      }
                    }}
                  />
                  {/* Quick Win: Voice input button */}
                  <Button
                    type="button"
                    onClick={startVoiceRecognition}
                    disabled={submitResponseMutation.isPending || isListening}
                    className={`absolute right-1 sm:right-2 top-2 p-1 sm:p-2 h-6 w-6 sm:h-8 sm:w-8 ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    variant="ghost"
                    title={isListening ? "Listening... Speak now" : "Click to speak your response"}
                  >
                    {isListening ? (
                      <motion.i 
                        className="fas fa-microphone text-xs sm:text-sm text-white"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    ) : (
                      <i className="fas fa-microphone text-xs sm:text-sm"></i>
                    )}
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={handleSubmitResponse}
                    disabled={!userResponse.trim() || submitResponseMutation.isPending}
                    className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white px-4 py-2 sm:px-6 sm:py-3 h-auto rounded-xl text-sm sm:text-base"
                    size="lg"
                  >
                    {submitResponseMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane text-sm sm:text-lg"></i>
                        <span className="ml-2 sm:hidden">Send</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => completeScenarioMutation.mutate()}
                    disabled={completeScenarioMutation.isPending}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 px-3 py-2 sm:px-4 sm:py-3 h-auto rounded-xl text-xs sm:text-sm"
                    size="lg"
                    title="End simulation early"
                  >
                    {completeScenarioMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-red-600"></div>
                    ) : (
                      <>
                        <i className="fas fa-stop mr-1 sm:mr-2 text-xs sm:text-sm"></i>
                        <span className="hidden sm:inline">End Simulation</span>
                        <span className="sm:hidden">End</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Helper Text */}
              <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <i className="fas fa-info-circle text-xs"></i>
                  <span>{isListening ? "Listening... Speak clearly" : "Press Enter to send, Shift+Enter for new line"}</span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="hidden sm:inline">Focus on empathy, clarity, and care approaches</span>
                  <span className="sm:hidden">Focus on empathy and clarity</span>
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
        <Card className="border-green-200 bg-green-50 mb-6">
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

        {/* Achievement Reaction Section */}
        <div className="max-w-2xl mx-auto">
          <EmojiReactionButtons
            type="achievement"
            contextId={scenarioId || 'completion'}
            onReaction={(reaction) => {
              toast({
                title: `${reaction.emoji} ${reaction.label}!`,
                description: reaction.description,
                duration: 3000,
              });
            }}
            showPersonalized={true}
            className="shadow-lg hover:shadow-xl transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
}