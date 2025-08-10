import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  completedScenarios: number;
  averageScore: number;
  totalTime: number;
  lastActivity: string;
  skillProgress: Record<string, number>;
  weeklyStreak: number;
}

interface TeamAnalytics {
  totalTeamMembers: number;
  activeMembers: number;
  averageCompletion: number;
  teamAverageScore: number;
  totalTrainingHours: number;
  weeklyEngagement: number;
}

export default function LDManagerDashboard() {
  const [timeframe, setTimeframe] = useState("monthly");
  const [teamFilter, setTeamFilter] = useState("all");

  const { data: teamData, isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/ld-manager/team', timeframe],
  });

  const { data: analytics } = useQuery<TeamAnalytics>({
    queryKey: ['/api/ld-manager/analytics', timeframe],
  });

  const { data: wellbeingData } = useQuery({
    queryKey: ['/api/ld-manager/wellbeing', timeframe],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#DABFFF]/20 via-white to-[#7FDEFF]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#907AD6] rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chart-line text-white text-xl animate-pulse"></i>
          </div>
          <p className="text-gray-600">Loading team analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DABFFF]/20 via-white to-[#7FDEFF]/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] rounded-full flex items-center justify-center hover-glow">
                <i className="fas fa-chart-line text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#2C2A4A]">L&D Manager Dashboard</h1>
                <p className="text-gray-600">Team performance and learning analytics</p>
              </div>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Timeframe:</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32 border-[#907AD6]/30 focus:border-[#907AD6]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#907AD6]">{analytics?.totalTeamMembers || 0}</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{analytics?.activeMembers || 0}</div>
              <div className="text-sm text-gray-600">Active This Week</div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#7FDEFF]">{analytics?.averageCompletion || 0}%</div>
              <div className="text-sm text-gray-600">Avg Completion</div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics?.teamAverageScore || 0}%</div>
              <div className="text-sm text-gray-600">Team Avg Score</div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round((analytics?.totalTrainingHours || 0) / 60)}h</div>
              <div className="text-sm text-gray-600">Training Hours</div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics?.weeklyEngagement || 0}%</div>
              <div className="text-sm text-gray-600">Engagement</div>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance & Wellbeing */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Team Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-users text-[#907AD6]"></i>
                Team Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamData?.slice(0, 8).map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#2C2A4A]">{member.name}</h4>
                        <p className="text-xs text-gray-600">{member.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-[#907AD6]">{member.completedScenarios}</div>
                        <div className="text-xs text-gray-500">Scenarios</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{member.averageScore}%</div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{member.weeklyStreak}</div>
                        <div className="text-xs text-gray-500">Streak</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Wellbeing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-heart text-[#7FDEFF]"></i>
                Team Wellbeing & Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Team Confidence</span>
                    <span className="font-medium">{wellbeingData?.confidence || 78}%</span>
                  </div>
                  <Progress value={wellbeingData?.confidence || 78} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Stress Management</span>
                    <span className="font-medium">{wellbeingData?.stressManagement || 65}%</span>
                  </div>
                  <Progress value={wellbeingData?.stressManagement || 65} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Empathy Development</span>
                    <span className="font-medium">{wellbeingData?.empathy || 82}%</span>
                  </div>
                  <Progress value={wellbeingData?.empathy || 82} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Resilience Building</span>
                    <span className="font-medium">{wellbeingData?.resilience || 71}%</span>
                  </div>
                  <Progress value={wellbeingData?.resilience || 71} className="h-2" />
                </div>

                <div className="bg-[#DABFFF]/30 p-4 rounded-lg">
                  <h4 className="font-medium text-[#2C2A4A] mb-2">Weekly Insights</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 85% of team completed weekly training goals</li>
                    <li>• Dementia care scenarios show highest engagement</li>
                    <li>• 3 team members achieved new skill milestones</li>
                    <li>• Average session time increased by 12%</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skill Development Tracking */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-graduation-cap text-[#907AD6]"></i>
              Skill Development Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { skill: 'Communication', average: 78, trend: '+5%', color: 'text-green-600' },
                { skill: 'Empathy', average: 82, trend: '+3%', color: 'text-green-600' },
                { skill: 'Problem Solving', average: 71, trend: '+8%', color: 'text-green-600' },
                { skill: 'Professionalism', average: 85, trend: '+2%', color: 'text-green-600' }
              ].map((skill) => (
                <div key={skill.skill} className="text-center p-4 bg-gradient-to-br from-[#DABFFF]/20 to-[#7FDEFF]/20 rounded-lg">
                  <h4 className="font-medium text-[#2C2A4A] mb-2">{skill.skill}</h4>
                  <div className="text-2xl font-bold text-[#907AD6] mb-1">{skill.average}%</div>
                  <div className={`text-sm ${skill.color} flex items-center justify-center gap-1`}>
                    <i className="fas fa-arrow-up text-xs"></i>
                    {skill.trend} this month
                  </div>
                  <Progress value={skill.average} className="h-2 mt-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white px-8">
            <i className="fas fa-download mr-2"></i>
            Export Team Report
          </Button>
          <Button variant="outline" className="border-[#907AD6] text-[#907AD6] hover:bg-[#907AD6] hover:text-white px-8">
            <i className="fas fa-calendar-plus mr-2"></i>
            Schedule Team Training
          </Button>
          <Button variant="outline" className="border-[#7FDEFF] text-[#2C2A4A] hover:bg-[#7FDEFF] hover:text-white px-8">
            <i className="fas fa-cog mr-2"></i>
            Team Settings
          </Button>
        </div>
      </div>
    </div>
  );
}