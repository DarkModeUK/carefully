import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const nonVerbalSkills = [
  {
    id: 'body_language',
    title: 'Body Language Reading',
    description: 'Learn to interpret body language signals and understand patient discomfort, anxiety, or satisfaction.',
    icon: 'fas fa-user-friends',
    color: 'bg-blue-100 text-blue-800',
    scenarios: [
      { id: '1', title: 'Recognising Pain in Non-Verbal Patients', difficulty: 'Intermediate' },
      { id: '2', title: 'Understanding Agitation Signals', difficulty: 'Advanced' },
      { id: '3', title: 'Comfort Positioning Cues', difficulty: 'Beginner' }
    ]
  },
  {
    id: 'facial_expressions',
    title: 'Facial Expression Analysis',
    description: 'Master the art of reading facial expressions to better understand patient emotions and needs.',
    icon: 'fas fa-smile',
    color: 'bg-green-100 text-green-800',
    scenarios: [
      { id: '4', title: 'Micro-Expressions in Elderly Care', difficulty: 'Advanced' },
      { id: '5', title: 'Fear and Anxiety Recognition', difficulty: 'Intermediate' },
      { id: '6', title: 'Satisfaction vs. Discomfort', difficulty: 'Beginner' }
    ]
  },
  {
    id: 'gestures',
    title: 'Gesture Communication',
    description: 'Understand cultural gestures and learn effective non-verbal communication techniques.',
    icon: 'fas fa-hand-paper',
    color: 'bg-purple-100 text-purple-800',
    scenarios: [
      { id: '7', title: 'Cultural Gesture Sensitivity', difficulty: 'Intermediate' },
      { id: '8', title: 'Calming Hand Movements', difficulty: 'Beginner' },
      { id: '9', title: 'Professional Boundaries in Touch', difficulty: 'Advanced' }
    ]
  },
  {
    id: 'eye_contact',
    title: 'Eye Contact & Presence',
    description: 'Learn appropriate eye contact techniques and presence awareness for different cultural contexts.',
    icon: 'fas fa-eye',
    color: 'bg-yellow-100 text-yellow-800',
    scenarios: [
      { id: '10', title: 'Cultural Eye Contact Norms', difficulty: 'Intermediate' },
      { id: '11', title: 'Building Trust Through Presence', difficulty: 'Beginner' },
      { id: '12', title: 'Respectful Attention Giving', difficulty: 'Advanced' }
    ]
  }
];

const practiceExercises = [
  {
    id: '1',
    title: 'Emotion Recognition Challenge',
    description: 'View photos and identify the primary emotion being expressed',
    type: 'interactive',
    duration: '5 min',
    difficulty: 'Beginner',
    points: 10
  },
  {
    id: '2', 
    title: 'Body Language Scenarios',
    description: 'Watch video clips and interpret patient comfort levels',
    type: 'video',
    duration: '8 min', 
    difficulty: 'Intermediate',
    points: 15
  },
  {
    id: '3',
    title: 'Cultural Gesture Quiz',
    description: 'Test your knowledge of appropriate gestures across cultures',
    type: 'quiz',
    duration: '6 min',
    difficulty: 'Advanced', 
    points: 20
  }
];

export default function NonVerbalCommunicationPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Fetch user's non-verbal communication progress
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/non-verbal-progress'],
    enabled: !!user,
  });

  // Fetch completed exercises
  const { data: completedExercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ['/api/non-verbal-exercises/completed'],
    enabled: !!user,
  });

  // Complete exercise mutation
  const completeExerciseMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      return await apiRequest('POST', `/api/non-verbal-exercises/${exerciseId}/complete`, {});
    },
    onSuccess: (data, exerciseId) => {
      const exercise = practiceExercises.find(e => e.id === exerciseId);
      toast({
        title: "Exercise completed!",
        description: `You earned ${exercise?.points} points for completing "${exercise?.title}".`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/non-verbal-progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/non-verbal-exercises/completed'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete exercise. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCompleteExercise = (exerciseId: string) => {
    completeExerciseMutation.mutate(exerciseId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'; 
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'fas fa-play-circle';
      case 'interactive': return 'fas fa-mouse-pointer';
      case 'quiz': return 'fas fa-question-circle';
      default: return 'fas fa-book';
    }
  };

  const getOverallProgress = () => {
    if (!progress) return 0;
    const totalSkills = nonVerbalSkills.length;
    const completedSkills = nonVerbalSkills.filter(skill => 
      progress[skill.id]?.completed
    ).length;
    return Math.round((completedSkills / totalSkills) * 100);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <i className="fas fa-hand-peace text-4xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access non-verbal communication training.</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Non-Verbal Communication Training</h1>
        <p className="text-gray-600">
          Master the art of reading and using non-verbal cues to enhance patient care and build stronger connections.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8 border-l-4 border-l-[#7FDEFF]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Non-Verbal Communication Skills</h2>
              <p className="text-gray-600">Building expertise in understanding unspoken communication</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#7FDEFF]">{getOverallProgress()}%</div>
              <div className="text-sm text-gray-600">Overall Mastery</div>
            </div>
          </div>
          <Progress value={getOverallProgress()} className="h-3" />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Beginning Awareness</span>
            <span>Expert Interpreter</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills">Skill Areas</TabsTrigger>
          <TabsTrigger value="practice">Practice Exercises</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Skill Areas Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nonVerbalSkills.map((skill) => {
              const skillProgress = progress?.[skill.id]?.progress || 0;
              const isCompleted = progress?.[skill.id]?.completed || false;
              
              return (
                <Card key={skill.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-full ${skill.color}`}>
                        <i className={`${skill.icon} text-xl`}></i>
                      </div>
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-800">
                          <i className="fas fa-check mr-1"></i>Mastered
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{skill.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{skill.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{skillProgress}%</span>
                      </div>
                      <Progress value={skillProgress} className="h-2" />
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Practice Scenarios:</h4>
                        <div className="space-y-2">
                          {skill.scenarios.map((scenario) => (
                            <div key={scenario.id} className="flex items-center justify-between text-sm">
                              <span>{scenario.title}</span>
                              <Badge className={getDifficultyColor(scenario.difficulty)}>
                                {scenario.difficulty}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setSelectedSkill(skill.id)}
                        className={`w-full ${
                          isCompleted 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-[#7FDEFF] hover:bg-[#5AC8D4] text-[#2C2A4A]'
                        } text-white`}
                      >
                        {isCompleted ? (
                          <>
                            <i className="fas fa-redo mr-2"></i>Review Skills
                          </>
                        ) : (
                          <>
                            <i className="fas fa-play mr-2"></i>Start Training
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Practice Exercises Tab */}
        <TabsContent value="practice" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practiceExercises.map((exercise) => {
              const isCompleted = completedExercises?.includes(exercise.id);
              
              return (
                <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-full ${
                        isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <i className={`${getTypeIcon(exercise.type)} text-lg`}></i>
                      </div>
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-800">
                          <i className="fas fa-check mr-1"></i>Done
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{exercise.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getDifficultyColor(exercise.difficulty)}>
                        {exercise.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <i className="fas fa-clock mr-1"></i>
                        {exercise.duration}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <i className="fas fa-star mr-1"></i>
                        {exercise.points} pts
                      </Badge>
                    </div>
                    
                    <Button
                      onClick={() => handleCompleteExercise(exercise.id)}
                      disabled={isCompleted || completeExerciseMutation.isPending}
                      className={`w-full ${
                        isCompleted 
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                          : 'bg-[#907AD6] hover:bg-[#7B6BC7] text-white'
                      }`}
                    >
                      {completeExerciseMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>Processing...
                        </>
                      ) : isCompleted ? (
                        <>
                          <i className="fas fa-check mr-2"></i>Completed
                        </>
                      ) : (
                        <>
                          <i className="fas fa-play mr-2"></i>Start Exercise
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-World Non-Verbal Communication Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {nonVerbalSkills.flatMap(skill => skill.scenarios).map((scenario) => (
                  <Card key={scenario.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{scenario.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Practice reading non-verbal cues in realistic care situations
                          </p>
                          <Badge className={getDifficultyColor(scenario.difficulty)}>
                            {scenario.difficulty}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => setLocation(`/simulation/non-verbal-${scenario.id}`)}
                          className="ml-4"
                          variant="outline"
                        >
                          <i className="fas fa-play mr-2"></i>Practice
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill Progression</CardTitle>
              </CardHeader>
              <CardContent>
                {progressLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nonVerbalSkills.map((skill) => {
                      const skillProgress = progress?.[skill.id]?.progress || 0;
                      return (
                        <div key={skill.id} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{skill.title}</span>
                            <span className="text-sm text-gray-600">{skillProgress}%</span>
                          </div>
                          <Progress value={skillProgress} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements & Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 flex items-center">
                      <i className="fas fa-lightbulb mr-2"></i>Key Principle
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      70% of communication is non-verbal. Pay attention to body language, tone, and facial expressions.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 flex items-center">
                      <i className="fas fa-eye mr-2"></i>Observation Tip
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Look for clusters of non-verbal signals rather than isolated gestures for accurate interpretation.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 flex items-center">
                      <i className="fas fa-globe mr-2"></i>Cultural Awareness
                    </h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Non-verbal communication varies across cultures. Always consider cultural context in your interpretations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}