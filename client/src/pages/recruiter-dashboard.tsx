import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { User, UserScenario } from "@shared/schema";

const skillAreas = [
  'Communication',
  'Empathy', 
  'Problem Solving',
  'Cultural Awareness',
  'Technical Skills',
  'Time Management',
  'Resilience',
  'Teamwork'
];

export default function RecruiterDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("all");

  // Fetch candidate pool
  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['/api/recruiter/candidates', selectedRole, selectedSkill],
    enabled: !!user && user.role === 'recruiter',
  });

  // Fetch recruitment analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/recruiter/analytics'],
    enabled: !!user && user.role === 'recruiter',
  });

  // Fetch skill assessments
  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['/api/recruiter/assessments'],
    enabled: !!user && user.role === 'recruiter',
  });

  if (!user || user.role !== 'recruiter') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <i className="fas fa-user-tie text-4xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">Recruiter Access Required</h2>
            <p className="text-gray-600 mb-4">This dashboard is only available to recruiters.</p>
            <Button onClick={() => setLocation('/')}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recruiter Dashboard</h1>
        <p className="text-gray-600">Identify top care talent and assess candidate readiness through skills-based training data.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.activeCandidates || 0}</p>
                <p className="text-xs text-green-600">+15% this month</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-users text-blue-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ready for Placement</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.readyCandidates || 0}</p>
                <p className="text-xs text-blue-600">High performers</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.averageScore || 0}%</p>
                <p className="text-xs text-purple-600">Across all assessments</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="fas fa-chart-line text-purple-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cultural Competency</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.culturalScore || 0}/10</p>
                <p className="text-xs text-orange-600">Team average</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="fas fa-globe text-orange-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="care_assistant">Care Assistant</SelectItem>
            <SelectItem value="senior_carer">Senior Carer</SelectItem>
            <SelectItem value="team_leader">Team Leader</SelectItem>
            <SelectItem value="specialist">Specialist</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedSkill} onValueChange={setSelectedSkill}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {skillAreas.map(skill => (
              <SelectItem key={skill} value={skill.toLowerCase().replace(' ', '_')}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="candidates">Candidate Pool</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-6">
          {candidatesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {candidates?.map((candidate: User & { performance: any }) => (
                <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#907AD6] rounded-full flex items-center justify-center text-white font-bold">
                          {candidate.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {candidate.firstName} {candidate.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{candidate.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Overall Score</p>
                          <p className="text-lg font-bold text-[#907AD6]">
                            {candidate.performance?.overallScore || 0}%
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Scenarios</p>
                          <p className="font-semibold">
                            {candidate.performance?.completedScenarios || 0}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Streak</p>
                          <p className="font-semibold">{candidate.currentStreak || 0} days</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Readiness</p>
                          <Badge className={
                            candidate.performance?.readinessLevel === 'ready' ? 'bg-green-100 text-green-800' :
                            candidate.performance?.readinessLevel === 'nearly_ready' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {candidate.performance?.readinessLevel === 'ready' ? 'Ready' :
                             candidate.performance?.readinessLevel === 'nearly_ready' ? 'Nearly Ready' : 
                             'In Training'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Skills breakdown */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Key Skills Assessment</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {skillAreas.slice(0, 4).map(skill => (
                          <div key={skill} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{skill}</span>
                              <span>{candidate.performance?.skills?.[skill] || 0}/10</span>
                            </div>
                            <Progress 
                              value={(candidate.performance?.skills?.[skill] || 0) * 10} 
                              className="h-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button size="sm" variant="outline">
                        <i className="fas fa-eye mr-2"></i>View Profile
                      </Button>
                      <Button size="sm" variant="outline">
                        <i className="fas fa-chart-bar mr-2"></i>Full Report
                      </Button>
                      <Button size="sm" className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white">
                        <i className="fas fa-paper-plane mr-2"></i>Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Skills Analysis Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillAreas.map(skill => (
                    <div key={skill} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{skill}</span>
                        <span className="text-sm text-gray-600">
                          Avg: {Math.round(Math.random() * 3 + 6)}/10
                        </span>
                      </div>
                      <Progress value={Math.random() * 40 + 60} />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Below par: {Math.round(Math.random() * 15 + 5)}%</span>
                        <span>Excellent: {Math.round(Math.random() * 25 + 20)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#907AD6] rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium">Candidate {String.fromCharCode(65 + i)}</p>
                          <p className="text-sm text-gray-600">
                            {Math.round(Math.random() * 10 + 85)}% overall
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Ready for Placement
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills Assessment Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {assessmentsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skillAreas.map(skill => (
                    <Card key={skill} className="p-4">
                      <h3 className="font-medium mb-2">{skill}</h3>
                      <div className="text-2xl font-bold text-[#907AD6] mb-1">
                        {Math.round(Math.random() * 30 + 60)}%
                      </div>
                      <p className="text-sm text-gray-600">
                        {Math.round(Math.random() * 50 + 100)} candidates assessed
                      </p>
                      <Progress 
                        value={Math.random() * 40 + 50} 
                        className="mt-2"
                      />
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start">
                  <i className="fas fa-file-pdf mr-3"></i>
                  Candidate Readiness Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-chart-bar mr-3"></i>
                  Skills Gap Analysis
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-users mr-3"></i>
                  Cultural Competency Overview
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-trophy mr-3"></i>
                  Top Talent Summary
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-calendar mr-3"></i>
                  Training Progress Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recruitment Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start bg-[#907AD6] hover:bg-[#7B6BC7] text-white">
                  <i className="fas fa-user-plus mr-3"></i>
                  Add New Candidate
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-clipboard-check mr-3"></i>
                  Schedule Assessments
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-envelope mr-3"></i>
                  Send Bulk Communications
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-handshake mr-3"></i>
                  Match to Opportunities
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-star mr-3"></i>
                  Mark as Placement Ready
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}