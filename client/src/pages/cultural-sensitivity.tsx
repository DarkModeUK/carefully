import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Scenario } from "@shared/schema";

const culturalModules = [
  {
    id: 'british_asian',
    title: 'British Asian Communities',
    description: 'Understanding diverse British Asian cultures, including Indian, Pakistani, Bangladeshi, and Sri Lankan traditions.',
    icon: 'fas fa-mosque',
    color: 'bg-orange-100 text-orange-800',
    completionRate: 0,
    keyTopics: ['Religious practices', 'Dietary requirements', 'Family dynamics', 'End-of-life care']
  },
  {
    id: 'black_caribbean',
    title: 'Black Caribbean Heritage',
    description: 'Cultural awareness for caring for people from Caribbean backgrounds and understanding their unique needs.',
    icon: 'fas fa-palm-tree',
    color: 'bg-green-100 text-green-800',
    completionRate: 0,
    keyTopics: ['Traditional medicine', 'Family structures', 'Mental health stigma', 'Pain expression']
  },
  {
    id: 'eastern_european',
    title: 'Eastern European Communities',
    description: 'Supporting people from Poland, Romania, Lithuania, and other Eastern European countries.',
    icon: 'fas fa-church',
    color: 'bg-blue-100 text-blue-800',
    completionRate: 0,
    keyTopics: ['Language barriers', 'Orthodox traditions', 'Healthcare expectations', 'Family involvement']
  },
  {
    id: 'muslim_communities',
    title: 'Muslim Cultural Practices',
    description: 'Respectful care for Muslim patients including prayer, dietary laws, and modesty requirements.',
    icon: 'fas fa-star-and-crescent',
    color: 'bg-purple-100 text-purple-800',
    completionRate: 0,
    keyTopics: ['Prayer times', 'Halal requirements', 'Modesty considerations', 'Ramadan care']
  },
  {
    id: 'jewish_community',
    title: 'Jewish Cultural Awareness',
    description: 'Understanding Orthodox, Conservative, and Reform Jewish practices in healthcare settings.',
    icon: 'fas fa-star-of-david',
    color: 'bg-indigo-100 text-indigo-800',
    completionRate: 0,
    keyTopics: ['Sabbath observance', 'Kosher food', 'Family roles', 'End-of-life rituals']
  },
  {
    id: 'lgbtq_plus',
    title: 'LGBTQ+ Inclusive Care',
    description: 'Providing respectful and inclusive care for LGBTQ+ individuals and families.',
    icon: 'fas fa-rainbow',
    color: 'bg-pink-100 text-pink-800',
    completionRate: 0,
    keyTopics: ['Pronoun usage', 'Family definitions', 'Health disparities', 'Safe spaces']
  }
];

export default function CulturalSensitivityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Fetch user's cultural competency progress
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/cultural-progress'],
    enabled: !!user,
  });

  // Fetch cultural sensitivity scenarios
  const { data: scenarios, isLoading: scenariosLoading } = useQuery({
    queryKey: ['/api/scenarios', 'cultural'],
    enabled: !!selectedModule,
  });

  // Start cultural module
  const startModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      return await apiRequest('POST', `/api/cultural-modules/${moduleId}/start`, {});
    },
    onSuccess: () => {
      toast({
        title: "Module started",
        description: "You've begun your cultural sensitivity training module.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cultural-progress'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start module. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleStartModule = (moduleId: string) => {
    startModuleMutation.mutate(moduleId);
  };

  const getOverallProgress = () => {
    if (!progress) return 0;
    const completed = culturalModules.filter(module => 
      progress.completedModules?.includes(module.id)
    ).length;
    return Math.round((completed / culturalModules.length) * 100);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <i className="fas fa-globe text-4xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access cultural sensitivity training.</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cultural Sensitivity Training</h1>
        <p className="text-gray-600">
          Develop cultural competence to provide respectful, person-centred care for people from all backgrounds.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8 border-l-4 border-l-[#907AD6]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Cultural Competency Journey</h2>
              <p className="text-gray-600">Track your progress across different cultural modules</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#907AD6]">{getOverallProgress()}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
          </div>
          <Progress value={getOverallProgress()} className="h-3" />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Beginner</span>
            <span>Culturally Competent</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="scenarios">Cultural Scenarios</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Training Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {culturalModules.map((module) => {
              const isCompleted = progress?.completedModules?.includes(module.id);
              const isInProgress = progress?.currentModule === module.id;
              
              return (
                <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-full ${module.color}`}>
                        <i className={`${module.icon} text-xl`}></i>
                      </div>
                      <div>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800">
                            <i className="fas fa-check mr-1"></i>Completed
                          </Badge>
                        )}
                        {isInProgress && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <i className="fas fa-play mr-1"></i>In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{module.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{module.completionRate}%</span>
                      </div>
                      <Progress value={module.completionRate} className="h-2" />
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Topics:</h4>
                        <div className="flex flex-wrap gap-1">
                          {module.keyTopics.map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleStartModule(module.id)}
                        disabled={startModuleMutation.isPending}
                        className={`w-full ${
                          isCompleted 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : isInProgress 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'bg-[#907AD6] hover:bg-[#7B6BC7]'
                        } text-white`}
                      >
                        {isCompleted ? (
                          <>
                            <i className="fas fa-redo mr-2"></i>Review Module
                          </>
                        ) : isInProgress ? (
                          <>
                            <i className="fas fa-play mr-2"></i>Continue Module
                          </>
                        ) : (
                          <>
                            <i className="fas fa-play mr-2"></i>Start Module
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

        {/* Cultural Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Practice Cultural Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              {scenariosLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {scenarios?.map((scenario: Scenario) => (
                    <Card key={scenario.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{scenario.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                            <div className="flex gap-2">
                              {scenario.culturalContext?.cultures?.map((culture, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {culture}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            onClick={() => setLocation(`/simulation/${scenario.id}`)}
                            className="ml-4"
                            variant="outline"
                          >
                            Practice
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cultural Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-book text-blue-500 mt-1"></i>
                    <div>
                      <h4 className="font-medium">NHS Cultural Competence Framework</h4>
                      <p className="text-sm text-gray-600">Official guidance for healthcare professionals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-users text-green-500 mt-1"></i>
                    <div>
                      <h4 className="font-medium">Community Liaison Contacts</h4>
                      <p className="text-sm text-gray-600">Connect with local cultural communities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-language text-purple-500 mt-1"></i>
                    <div>
                      <h4 className="font-medium">Translation Services</h4>
                      <p className="text-sm text-gray-600">Access professional interpreters</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Remember</h4>
                    <p className="text-sm text-yellow-700">Always ask about cultural preferences rather than making assumptions</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Key Principle</h4>
                    <p className="text-sm text-blue-700">Respect individual identity while being culturally aware</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Best Practice</h4>
                    <p className="text-sm text-green-700">Include family members as appropriate to the culture</p>
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