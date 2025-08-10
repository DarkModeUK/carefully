import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  completedScenarios: number;
  averageScore: number;
  skillLevels: Record<string, number>;
  lastActivity: string;
  status: 'active' | 'pending' | 'completed';
}

export default function RecruiterDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");

  const { data: candidates, isLoading } = useQuery<Candidate[]>({
    queryKey: ['/api/recruiter/candidates', roleFilter, skillFilter],
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/recruiter/analytics'],
  });

  const filteredCandidates = candidates?.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#DABFFF]/20 via-white to-[#7FDEFF]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#907AD6] rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-search text-white text-xl animate-pulse"></i>
          </div>
          <p className="text-gray-600">Loading candidate data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DABFFF]/20 via-white to-[#7FDEFF]/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] rounded-full flex items-center justify-center hover-glow">
              <i className="fas fa-search text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2C2A4A]">Recruiter Dashboard</h1>
              <p className="text-gray-600">Candidate assessment and talent pipeline management</p>
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#907AD6]">{analytics?.totalCandidates || 0}</div>
              <div className="text-sm text-gray-600">Total Candidates</div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{analytics?.activeCandidates || 0}</div>
              <div className="text-sm text-gray-600">Active Candidates</div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#7FDEFF]">{analytics?.completedAssessments || 0}</div>
              <div className="text-sm text-gray-600">Completed Assessments</div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics?.averageScore || 0}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-filter text-[#907AD6]"></i>
              Candidate Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Search Candidates</label>
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-[#907AD6]/30 focus:border-[#907AD6]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Role Filter</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="border-[#907AD6]/30 focus:border-[#907AD6]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="care_worker">Care Worker</SelectItem>
                    <SelectItem value="senior_care_worker">Senior Care Worker</SelectItem>
                    <SelectItem value="care_coordinator">Care Coordinator</SelectItem>
                    <SelectItem value="team_leader">Team Leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Skill Level</label>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="border-[#907AD6]/30 focus:border-[#907AD6]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidate List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fas fa-users text-[#7FDEFF]"></i>
                Candidate Pipeline ({filteredCandidates.length})
              </div>
              <Button className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white">
                <i className="fas fa-plus mr-2"></i>
                Add Candidate
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <div key={candidate.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2C2A4A]">{candidate.name}</h3>
                        <p className="text-sm text-gray-600">{candidate.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {candidate.role.replace('_', ' ')}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(candidate.status)}`}>
                            {candidate.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-[#907AD6]">{candidate.completedScenarios}</div>
                          <div className="text-xs text-gray-500">Scenarios</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-green-600">{candidate.averageScore}%</div>
                          <div className="text-xs text-gray-500">Avg Score</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-[#907AD6] text-[#907AD6] hover:bg-[#907AD6] hover:text-white">
                          <i className="fas fa-eye mr-1"></i>
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm" className="border-[#7FDEFF] text-[#2C2A4A] hover:bg-[#7FDEFF] hover:text-white">
                          <i className="fas fa-chart-line mr-1"></i>
                          Assessment
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Skill Levels */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-500">Top Skills:</span>
                      {Object.entries(candidate.skillLevels || {}).slice(0, 4).map(([skill, level]) => (
                        <div key={skill} className="flex items-center gap-1">
                          <span className="capitalize">{skill.replace('_', ' ')}</span>
                          <div className={`w-2 h-2 rounded-full ${level > 80 ? 'bg-green-500' : level > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCandidates.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-users text-gray-300 text-4xl mb-4"></i>
                  <p className="text-gray-500">No candidates found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Utility functions
function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}