import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrainingModal } from "@/components/training-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Scenario, UserScenario, User } from "@shared/schema";

export default function ScenarioDetailPage() {
  const [, params] = useRoute("/scenarios/:id");
  const [, setLocation] = useLocation();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [currentStep, setCurrentStep] = useState<'overview' | 'preparation' | 'training' | 'evaluation'>('overview');
  const { toast } = useToast();

  const scenarioId = params?.id;

  const { data: scenario, isLoading: scenarioLoading } = useQuery<Scenario>({
    queryKey: ['/api/scenarios', scenarioId],
    enabled: !!scenarioId
  });

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user']
  });

  const { data: userScenarios = [] } = useQuery<UserScenario[]>({
    queryKey: ['/api/user/scenarios']
  });

  const userScenario = userScenarios.find(us => us.scenarioId === scenarioId);
  const isCompleted = userScenario?.status === 'completed';
  const isInProgress = userScenario?.status === 'in_progress';

  const completeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/scenarios/${scenarioId}/complete`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setShowEvaluation(true);
      setCurrentStep('evaluation');
    }
  });

  useEffect(() => {
    if (scenario && currentStep === 'training') {
      setSelectedScenario(scenario);
      setIsTrainingModalOpen(true);
    }
  }, [scenario, currentStep]);

  const handleStartTraining = () => {
    setCurrentStep('training');
  };

  const handleCompleteScenario = () => {
    completeMutation.mutate();
  };

  const getSkillRelevance = (skill: string) => {
    if (!scenario) return 0;
    const skillMap: Record<string, string[]> = {
      'dementia_care': ['empathy', 'conflict_resolution'],
      'family_communication': ['conflict_resolution', 'decision_making'],
      'medication_management': ['decision_making', 'empathy'],
      'end_of_life': ['empathy', 'decision_making'],
      'safeguarding': ['safeguarding', 'decision_making']
    };
    return skillMap[scenario.category]?.includes(skill) ? 90 : 40;
  };

  if (scenarioLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-32 w-full mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="text-center py-12">
          <CardContent>
            <i className="fas fa-exclamation-circle text-neutral-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">Scenario not found</h3>
            <p className="text-neutral-500 mb-4">This training scenario could not be found.</p>
            <Button onClick={() => setLocation('/scenarios')}>
              <i className="fas fa-arrow-left mr-2"></i>Back to Scenarios
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
      
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/scenarios')}
          className="mb-4"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back to Scenarios
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-neutral-800">{scenario.title}</h1>
              {isCompleted && <Badge className="bg-secondary text-white">Completed</Badge>}
              {isInProgress && <Badge className="bg-accent text-white">In Progress</Badge>}
            </div>
            <p className="text-neutral-600 mb-4">{scenario.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <div className="flex items-center gap-1">
                <i className="fas fa-clock"></i>
                <span>{scenario.estimatedTime} minutes</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="fas fa-signal"></i>
                <span className="capitalize">{scenario.difficulty}</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="fas fa-tag"></i>
                <span>{scenario.category.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between mb-4">
            <div className={`flex items-center gap-2 ${currentStep === 'overview' ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-neutral-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'overview' ? 'bg-primary text-white' : 
                isCompleted ? 'bg-secondary text-white' : 'bg-neutral-200'
              }`}>
                1
              </div>
              <span className="font-medium whitespace-nowrap">Overview</span>
            </div>
            <div className="flex-1 h-0.5 bg-neutral-200 mx-2 min-w-4"></div>
            <div className={`flex items-center gap-2 ${currentStep === 'preparation' ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-neutral-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'preparation' ? 'bg-primary text-white' : 
                isCompleted ? 'bg-secondary text-white' : 'bg-neutral-200'
              }`}>
                2
              </div>
              <span className="font-medium whitespace-nowrap">Preparation</span>
            </div>
            <div className="flex-1 h-0.5 bg-neutral-200 mx-2 min-w-4"></div>
            <div className={`flex items-center gap-2 ${currentStep === 'training' ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-neutral-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'training' ? 'bg-primary text-white' : 
                isCompleted ? 'bg-secondary text-white' : 'bg-neutral-200'
              }`}>
                3
              </div>
              <span className="font-medium whitespace-nowrap">Training</span>
            </div>
            <div className="flex-1 h-0.5 bg-neutral-200 mx-2 min-w-4"></div>
            <div className={`flex items-center gap-2 ${currentStep === 'evaluation' ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-neutral-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'evaluation' ? 'bg-primary text-white' : 
                isCompleted ? 'bg-secondary text-white' : 'bg-neutral-200'
              }`}>
                4
              </div>
              <span className="font-medium whitespace-nowrap">Evaluation</span>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex justify-between items-center mb-4">
              <div className={`flex flex-col items-center gap-1 flex-1 ${currentStep === 'overview' ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-neutral-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'overview' ? 'bg-primary text-white' : 
                  isCompleted ? 'bg-secondary text-white' : 'bg-neutral-200'
                }`}>
                  1
                </div>
                <span className="text-xs font-medium text-center">Overview</span>
              </div>
              <div className="w-8 h-0.5 bg-neutral-200 mx-1"></div>
              <div className={`flex flex-col items-center gap-1 flex-1 ${currentStep === 'preparation' ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-neutral-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'preparation' ? 'bg-primary text-white' : 
                  isCompleted ? 'bg-secondary text-white' : 'bg-neutral-200'
                }`}>
                  2
                </div>
                <span className="text-xs font-medium text-center">Prep</span>
              </div>
              <div className="w-8 h-0.5 bg-neutral-200 mx-1"></div>
              <div className={`flex flex-col items-center gap-1 flex-1 ${currentStep === 'training' ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-neutral-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'training' ? 'bg-primary text-white' : 
                  isCompleted ? 'bg-secondary text-white' : 'bg-neutral-200'
                }`}>
                  3
                </div>
                <span className="text-xs font-medium text-center">Training</span>
              </div>
              <div className="w-8 h-0.5 bg-neutral-200 mx-1"></div>
              <div className={`flex flex-col items-center gap-1 flex-1 ${currentStep === 'evaluation' ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-neutral-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'evaluation' ? 'bg-primary text-white' : 
                  isCompleted ? 'bg-secondary text-white' : 'bg-neutral-200'
                }`}>
                  4
                </div>
                <span className="text-xs font-medium text-center">Results</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {currentStep === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scenario Context */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-info-circle text-primary"></i>
                  Scenario Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 leading-relaxed">{scenario.context}</p>
              </CardContent>
            </Card>

            {/* Learning Objectives */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-target text-primary"></i>
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(scenario.learningObjectives || []).map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <i className="fas fa-check-circle text-secondary mt-1 text-sm"></i>
                      <span className="text-neutral-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Skills Progress */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-chart-line text-primary"></i>
                  Skills You'll Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user?.skillLevels && Object.entries(user.skillLevels).map(([skill, currentLevel]) => {
                    const relevance = getSkillRelevance(skill);
                    const skillLabel = skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    
                    return (
                      <div key={skill}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{skillLabel}</span>
                          <span className="text-neutral-500">{currentLevel}%</span>
                        </div>
                        <Progress value={currentLevel} className="h-2 mb-1" />
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                          <div className={`w-2 h-2 rounded-full ${relevance > 70 ? 'bg-secondary' : 'bg-neutral-300'}`}></div>
                          <span>{relevance > 70 ? 'Primary focus' : 'Supporting skill'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Button 
                onClick={() => setCurrentStep('preparation')} 
                className="w-full"
                size="lg"
              >
                {isInProgress ? 'Resume Training' : 'Begin Scenario'}
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
              
              {isCompleted && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('evaluation')} 
                  className="w-full"
                >
                  View Results
                  <i className="fas fa-chart-bar ml-2"></i>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {currentStep === 'preparation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-lightbulb text-accent"></i>
                  Preparation Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Communication Approach</h4>
                    <p className="text-blue-800 text-sm">Use a calm, empathetic tone. Listen actively and validate emotions before offering solutions.</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Key Strategies</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Ask open-ended questions to understand concerns</li>
                      <li>• Provide clear, simple explanations</li>
                      <li>• Offer choices when appropriate</li>
                      <li>• Respect dignity and autonomy</li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-medium text-amber-900 mb-2">What to Avoid</h4>
                    <ul className="text-amber-800 text-sm space-y-1">
                      <li>• Dismissing or minimizing concerns</li>
                      <li>• Using medical jargon</li>
                      <li>• Making decisions without consultation</li>
                      <li>• Rushing the conversation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Ready to Start?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-neutral-600">
                    <p className="mb-2">This roleplay will take approximately <strong>{scenario.estimatedTime} minutes</strong>.</p>
                    <p>You'll have a conversation with a virtual care recipient and receive real-time feedback on your responses.</p>
                  </div>
                  
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <i className="fas fa-info-circle"></i>
                      <span>Your progress will be automatically saved</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button onClick={handleStartTraining} className="w-full" size="lg">
                <i className="fas fa-play mr-2"></i>Start Training
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('overview')} 
                className="w-full"
              >
                <i className="fas fa-arrow-left mr-2"></i>Back to Overview
              </Button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'evaluation' && isCompleted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-trophy text-accent"></i>
                  Training Complete!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="bg-secondary bg-opacity-20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-secondary">{userScenario?.score || 85}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Overall Score</h3>
                  <p className="text-neutral-600">Great job on completing this scenario!</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userScenario?.totalTime || 12}</div>
                    <div className="text-sm text-neutral-500">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">8</div>
                    <div className="text-sm text-neutral-500">Responses</div>
                  </div>
                </div>

                {/* Skill Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-800">Performance Breakdown</h4>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Empathy & Communication</span>
                      <span className="text-secondary font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tone & Approach</span>
                      <span className="text-accent font-medium">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Clarity</span>
                      <span className="text-primary font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Decision Making</span>
                      <span className="text-red-500 font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-comment-dots text-primary"></i>
                  Detailed Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-2">Strengths</h5>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Excellent use of validation techniques</li>
                      <li>• Showed genuine empathy and understanding</li>
                      <li>• Maintained a calm, reassuring tone throughout</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h5 className="font-medium text-amber-900 mb-2">Areas for Improvement</h5>
                    <ul className="text-amber-800 text-sm space-y-1">
                      <li>• Consider asking more open-ended questions</li>
                      <li>• Take more time before offering solutions</li>
                      <li>• Practice active listening techniques</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Next Steps</h5>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Try the "Family Conflict Resolution" scenario</li>
                      <li>• Focus on decision-making skills practice</li>
                      <li>• Review active listening resources</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Next Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => setLocation('/scenarios')}>
                    <i className="fas fa-list mr-2"></i>Try Another Scenario
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setCurrentStep('overview')}>
                    <i className="fas fa-redo mr-2"></i>Review This Scenario
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setLocation('/progress')}>
                    <i className="fas fa-chart-bar mr-2"></i>View Full Progress
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievement Unlocked!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="bg-accent bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-medal text-accent text-2xl"></i>
                  </div>
                  <h4 className="font-medium text-neutral-800 mb-1">Dementia Care Expert</h4>
                  <p className="text-sm text-neutral-600">Completed advanced dementia scenario</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Training Modal */}
      <TrainingModal
        scenario={selectedScenario}
        isOpen={isTrainingModalOpen}
        onClose={() => {
          setIsTrainingModalOpen(false);
          setSelectedScenario(null);
          handleCompleteScenario();
        }}
      />
    </div>
  );
}