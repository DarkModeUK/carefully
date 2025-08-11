import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

const statusColors = {
  not_started: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800"
};

const skillColors = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"
];

export default function AssessmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['/api/recruiter/assessments'],
  });

  const { data: skillsAnalysis = [], isLoading: skillsLoading } = useQuery({
    queryKey: ['/api/recruiter/skills-analysis'],
  });

  const { data: funnel = [], isLoading: funnelLoading } = useQuery({
    queryKey: ['/api/recruiter/funnel'],
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      return await apiRequest(`/api/assessments/${assessmentId}/remind`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Reminder Sent",
        description: "Assessment reminder has been sent to the candidate",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reminder",
        variant: "destructive"
      });
    }
  });

  const viewAssessmentDetails = (assessment: any) => {
    setSelectedAssessment(assessment);
    setDetailsOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Assessments</h1>
        <p className="text-neutral-600">Monitor candidate assessment progress and results</p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Assessments</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Active Assessments */}
        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {assessments.filter((a: any) => a.status === 'in_progress').length}
                </div>
                <p className="text-xs text-neutral-500 mt-1">Active assessments</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {assessments.filter((a: any) => a.status === 'not_started').length}
                </div>
                <p className="text-xs text-neutral-500 mt-1">Not yet started</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {assessments.filter((a: any) => a.status === 'completed').length}
                </div>
                <p className="text-xs text-neutral-500 mt-1">Completed assessments</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : assessments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <i className="fas fa-clipboard-check text-gray-400 text-4xl mb-4"></i>
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No active assessments</h3>
                  <p className="text-gray-500">New candidate assessments will appear here</p>
                </CardContent>
              </Card>
            ) : (
              assessments.map((assessment: any) => (
                <Card key={assessment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <i className="fas fa-user-check text-primary text-xl"></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-neutral-800">
                            {assessment.candidateName}
                          </h3>
                          <p className="text-neutral-600">{assessment.role}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge className={statusColors[assessment.status as keyof typeof statusColors]}>
                              {assessment.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className="text-sm text-neutral-500">
                              Started {formatDistanceToNow(new Date(assessment.startedAt))} ago
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-primary">
                            {assessment.progress}%
                          </div>
                          <div className="text-xs text-neutral-500">Progress</div>
                          <Progress value={assessment.progress} className="w-20 mt-1" />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewAssessmentDetails(assessment)}
                          >
                            <i className="fas fa-eye mr-2"></i>
                            View Details
                          </Button>
                          
                          {assessment.status === 'not_started' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => sendReminderMutation.mutate(assessment.id)}
                              disabled={sendReminderMutation.isPending}
                            >
                              <i className="fas fa-bell mr-2"></i>
                              Remind
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Completed Assessments */}
        <TabsContent value="completed" className="space-y-6">
          <div className="space-y-4">
            {assessments
              .filter((a: any) => a.status === 'completed')
              .map((assessment: any) => (
                <Card key={assessment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-check-circle text-green-600 text-xl"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-800">
                            {assessment.candidateName}
                          </h3>
                          <p className="text-neutral-600">{assessment.role}</p>
                          <p className="text-sm text-neutral-500">
                            Completed {formatDistanceToNow(new Date(assessment.completedAt))} ago
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">85%</div>
                          <div className="text-xs text-neutral-500">Overall Score</div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          onClick={() => viewAssessmentDetails(assessment)}
                        >
                          <i className="fas fa-chart-bar mr-2"></i>
                          View Results
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {skillsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {skillsAnalysis.map((skill: any, index: number) => (
                      <div key={skill.skill}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{skill.skill}</span>
                          <span className="text-sm text-neutral-600">{skill.score}%</span>
                        </div>
                        <Progress 
                          value={skill.score} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assessment Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                {funnelLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="animate-pulse h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {funnel.map((stage: any, index: number) => (
                      <div 
                        key={stage.stage}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: skillColors[index % skillColors.length] }}
                          />
                          <span className="font-medium">{stage.stage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{stage.count}</span>
                          <span className="text-sm text-neutral-500">({stage.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Assessment Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assessment Details - {selectedAssessment?.candidateName}</DialogTitle>
          </DialogHeader>
          
          {selectedAssessment && (
            <div className="space-y-6">
              {/* Assessment Overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedAssessment.progress}%
                  </div>
                  <div className="text-sm text-blue-600">Progress</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-sm text-green-600">Current Score</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">3/5</div>
                  <div className="text-sm text-purple-600">Scenarios Done</div>
                </div>
              </div>

              {/* Scenario Breakdown */}
              <div>
                <h4 className="font-semibold mb-4">Scenario Performance</h4>
                <div className="space-y-3">
                  {[
                    { name: "Dementia Care - Agitation", score: 88, status: "completed" },
                    { name: "Family Communication", score: 82, status: "completed" }, 
                    { name: "Medication Management", score: 0, status: "in_progress" },
                    { name: "End of Life Care", score: 0, status: "not_started" },
                    { name: "Safeguarding Concerns", score: 0, status: "not_started" }
                  ].map((scenario, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          scenario.status === 'completed' ? 'bg-green-500' :
                          scenario.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <span className="font-medium">{scenario.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {scenario.score > 0 && (
                          <span className="font-semibold text-green-600">{scenario.score}%</span>
                        )}
                        <Badge className={
                          scenario.status === 'completed' ? 'bg-green-100 text-green-800' :
                          scenario.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {scenario.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Breakdown */}
              <div>
                <h4 className="font-semibold mb-4">Skills Assessment</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { skill: "Communication", score: 85 },
                    { skill: "Empathy", score: 92 },
                    { skill: "Problem Solving", score: 78 },
                    { skill: "Professionalism", score: 88 }
                  ].map((skill, index) => (
                    <div key={skill.skill} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{skill.skill}</span>
                        <span className="text-lg font-semibold text-primary">{skill.score}%</span>
                      </div>
                      <Progress value={skill.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}