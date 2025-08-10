import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { User, UserScenario, EmotionalState } from "@shared/schema";

export default function ManagerDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [selectedTeam, setSelectedTeam] = useState("all");

  // Fetch team members and their progress
  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ['/api/manager/team', selectedTimeframe],
    enabled: !!user && user.role === 'manager',
  });

  // Fetch organizational analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/manager/analytics', selectedTimeframe],
    enabled: !!user && user.role === 'manager',
  });

  // Fetch team emotional wellbeing data
  const { data: wellbeingData, isLoading: wellbeingLoading } = useQuery({
    queryKey: ['/api/manager/wellbeing', selectedTimeframe],
    enabled: !!user && user.role === 'manager',
  });

  if (!user || user.role !== 'manager') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <i className="fas fa-user-shield text-4xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">Manager Access Required</h2>
            <p className="text-gray-600 mb-4">This dashboard is only available to managers.</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
        <p className="text-gray-600">Monitor team performance, wellbeing, and training progress.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            <SelectItem value="day_shift">Day Shift</SelectItem>
            <SelectItem value="night_shift">Night Shift</SelectItem>
            <SelectItem value="weekend">Weekend Team</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Learners</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.activeUsers || 0}</p>
                <p className="text-xs text-green-600">+12% vs last period</p>
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
                <p className="text-sm text-gray-600">Scenarios Completed</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.totalScenarios || 0}</p>
                <p className="text-xs text-green-600">+28% vs last period</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-trophy text-green-600"></i>
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
                <p className="text-xs text-blue-600">+5% vs last period</p>
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
                <p className="text-sm text-gray-600">Team Wellbeing</p>
                <p className="text-2xl font-bold text-gray-900">{wellbeingData?.averageWellbeing || 0}/10</p>
                <p className="text-xs text-yellow-600">Monitor closely</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="fas fa-heart text-yellow-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="wellbeing">Wellbeing Monitor</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Team Performance Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {teamLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {teamData?.members?.map((member: User & { progress: any }) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#907AD6] rounded-full flex items-center justify-center text-white font-bold">
                          {member.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h3 className="font-medium">{member.firstName} {member.lastName}</h3>
                          <p className="text-sm text-gray-600">
                            {member.progress?.completedScenarios || 0} scenarios completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Average Score</p>
                          <p className="font-semibold">{member.progress?.averageScore || 0}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Current Streak</p>
                          <p className="font-semibold">{member.currentStreak || 0} days</p>
                        </div>
                        <Badge 
                          className={`${
                            member.progress?.status === 'active' ? 'bg-green-100 text-green-800' : 
                            member.progress?.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {member.progress?.status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wellbeing Monitor Tab */}
        <TabsContent value="wellbeing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Emotional State Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {wellbeingLoading ? (
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
                    {['confidence', 'stress', 'empathy', 'resilience'].map((metric) => (
                      <div key={metric} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="capitalize font-medium">{metric}</span>
                          <span>{wellbeingData?.[metric] || 0}/10</span>
                        </div>
                        <Progress value={(wellbeingData?.[metric] || 0) * 10} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wellbeing Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                    <i className="fas fa-exclamation-triangle text-red-500 mt-1"></i>
                    <div>
                      <p className="font-medium text-red-800">High Stress Levels</p>
                      <p className="text-sm text-red-600">3 team members showing elevated stress</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <i className="fas fa-info-circle text-yellow-500 mt-1"></i>
                    <div>
                      <p className="font-medium text-yellow-800">Low Confidence</p>
                      <p className="text-sm text-yellow-600">2 team members need support</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Skills Analysis Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Skills Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['Communication', 'Empathy', 'Problem Solving', 'Cultural Awareness', 'Technical Skills', 'Time Management'].map((skill) => (
                  <div key={skill} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{skill}</h4>
                      <span className="text-sm text-gray-600">7.2/10</span>
                    </div>
                    <Progress value={72} />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Beginner: 20%</span>
                      <span>Advanced: 35%</span>
                    </div>
                  </div>
                ))}
              </div>
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
                  Team Performance Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-chart-bar mr-3"></i>
                  Skills Gap Analysis
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-heart mr-3"></i>
                  Wellbeing Summary
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-calendar mr-3"></i>
                  Training Schedule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start bg-[#907AD6] hover:bg-[#7B6BC7] text-white">
                  <i className="fas fa-plus mr-3"></i>
                  Assign Training Scenarios
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-calendar-plus mr-3"></i>
                  Schedule Team Meeting
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-envelope mr-3"></i>
                  Send Team Update
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-award mr-3"></i>
                  Recognise Achievement
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}