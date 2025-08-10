import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, TrendingUp, Clock, Award, Search, Filter, Eye, MessageSquare, 
  Calendar, Star, Download, Mail, Phone, MapPin, Briefcase, GraduationCap,
  CheckCircle, AlertCircle, XCircle, BarChart3, Target, Zap
} from "lucide-react";
import { useState } from "react";

export default function RecruiterDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/recruiter/analytics'],
    queryFn: () => fetch('/api/recruiter/analytics').then(res => res.json())
  });

  // Fetch candidates data
  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['/api/recruiter/candidates', roleFilter, skillFilter],
    queryFn: () => fetch(`/api/recruiter/candidates?role=${roleFilter}&skill=${skillFilter}`).then(res => res.json())
  });

  const filteredCandidates = candidates?.filter((candidate: any) => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return { variant: 'default' as const, color: 'bg-green-100 text-green-800' };
      case 'pending': return { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' };
      case 'completed': return { variant: 'outline' as const, color: 'bg-blue-100 text-blue-800' };
      case 'rejected': return { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' };
      default: return { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (analyticsLoading || candidatesLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2C2A4A]">Recruiter Dashboard</h1>
            <p className="text-gray-600">Manage candidates and track assessments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button className="bg-[#907AD6] hover:bg-[#7C66C4] text-white">
              <Users className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-[#907AD6]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2A4A]">{analytics?.totalCandidates || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{Math.floor((analytics?.totalCandidates || 0) * 0.15)}</span> this week
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assessments</CardTitle>
              <Clock className="h-4 w-4 text-[#7FDEFF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2A4A]">{analytics?.activeCandidates || 0}</div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2A4A]">{analytics?.completedAssessments || 0}</div>
              <p className="text-xs text-muted-foreground">
                Ready for review
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2A4A]">{analytics?.averageScore || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Across all assessments
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="candidates">Candidate Pipeline</TabsTrigger>
            <TabsTrigger value="assessments">Assessment Center</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Candidate Pipeline</CardTitle>
                <CardDescription>Search, filter, and manage candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="care_worker">Care Worker</SelectItem>
                      <SelectItem value="senior_care">Senior Care</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={skillFilter} onValueChange={setSkillFilter}>
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skills</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="empathy">Empathy</SelectItem>
                      <SelectItem value="problem_solving">Problem Solving</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Candidates Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredCandidates.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-gray-500">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No candidates found matching your criteria</p>
                    </div>
                  ) : (
                    filteredCandidates.map((candidate: any) => (
                      <Card key={candidate.id} className="hover-lift cursor-pointer transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                  {candidate.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                                <p className="text-sm text-gray-500">{candidate.email}</p>
                              </div>
                            </div>
                            <Badge className={getStatusBadge(candidate.status).color}>
                              {candidate.status}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{candidate.completedScenarios} scenarios</span>
                            </div>
                            <Progress value={(candidate.completedScenarios / 10) * 100} className="h-2" />
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Average Score</span>
                              <span className={`font-bold ${getScoreColor(candidate.averageScore)}`}>
                                {candidate.averageScore}%
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedCandidate(candidate)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Contact
                              </Button>
                            </div>
                            <span className="text-xs text-gray-500">
                              Last active {candidate.lastActivity || 'Never'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Center</CardTitle>
                <CardDescription>Track and review candidate assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Assessment Statistics */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">87%</div>
                      <p className="text-sm text-gray-600">of started assessments</p>
                      <Progress value={87} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Average Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">42m</div>
                      <p className="text-sm text-gray-600">per assessment</p>
                      <div className="flex items-center mt-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600">15% faster than average</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Pass Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600">73%</div>
                      <p className="text-sm text-gray-600">meet requirements</p>
                      <div className="flex items-center mt-2 text-sm">
                        <Target className="w-4 h-4 text-orange-500 mr-1" />
                        <span className="text-orange-600">Target: 75%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Assessment Queue */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Assessment Queue</h3>
                  <div className="space-y-3">
                    {['Sarah Johnson', 'Michael Chen', 'Emily Davis', 'James Wilson'].map((name, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{name}</p>
                            <p className="text-sm text-gray-500">Care Worker Assessment</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            In Progress
                          </Badge>
                          <span className="text-sm text-gray-500">Started 2h ago</span>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Monitor
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills Performance</CardTitle>
                  <CardDescription>Average scores by skill category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { skill: 'Communication', score: 85, color: 'bg-blue-500' },
                    { skill: 'Empathy', score: 78, color: 'bg-green-500' },
                    { skill: 'Problem Solving', score: 72, color: 'bg-purple-500' },
                    { skill: 'Professionalism', score: 88, color: 'bg-orange-500' },
                    { skill: 'Cultural Sensitivity', score: 69, color: 'bg-pink-500' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.skill}</span>
                        <span className="text-sm text-gray-600">{item.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recruitment Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle>Recruitment Funnel</CardTitle>
                  <CardDescription>Candidate journey analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { stage: 'Applications', count: 150, percentage: 100 },
                    { stage: 'Initial Screening', count: 120, percentage: 80 },
                    { stage: 'Assessment Started', count: 95, percentage: 63 },
                    { stage: 'Assessment Completed', count: 78, percentage: 52 },
                    { stage: 'Interview Stage', count: 45, percentage: 30 },
                    { stage: 'Offers Made', count: 12, percentage: 8 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' : index <= 2 ? 'bg-blue-500' : index <= 4 ? 'bg-orange-500' : 'bg-purple-500'}`}></div>
                        <span className="font-medium">{item.stage}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.count}</div>
                        <div className="text-sm text-gray-500">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key recruitment indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">3.2 days</div>
                    <div className="text-sm text-gray-600">Avg. time to complete</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">94%</div>
                    <div className="text-sm text-gray-600">Candidate satisfaction</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">8.4/10</div>
                    <div className="text-sm text-gray-600">Assessment quality rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {selectedCandidate.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2>{selectedCandidate.name}</h2>
                    <p className="text-sm text-gray-500 font-normal">{selectedCandidate.email}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status and Progress */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Badge className={`mt-1 ${getStatusBadge(selectedCandidate.status).color}`}>
                      {selectedCandidate.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Progress</Label>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Scenarios Completed</span>
                        <span>{selectedCandidate.completedScenarios}/10</span>
                      </div>
                      <Progress value={(selectedCandidate.completedScenarios / 10) * 100} />
                    </div>
                  </div>
                </div>

                {/* Skills Breakdown */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Skill Assessment</Label>
                  <div className="space-y-3">
                    {Object.entries(selectedCandidate.skillLevels || {}).map(([skill, level]: [string, any]) => (
                      <div key={skill} className="flex justify-between items-center">
                        <span className="capitalize text-sm">{skill.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={level} className="w-24 h-2" />
                          <span className="text-sm font-medium w-8">{level}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Average Score */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Overall Assessment Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(selectedCandidate.averageScore)}`}>
                    {selectedCandidate.averageScore}%
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Interview
                    </Button>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button className="bg-[#907AD6] hover:bg-[#7C66C4] text-white" size="sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Advance
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}