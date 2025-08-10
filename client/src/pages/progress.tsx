import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/stat-card";
import { ScenarioCard } from "@/components/scenario-card";
import { EmojiReactionButtons, QuickEmojiReaction } from "@/components/emoji-reaction-buttons";
import { useToast } from "@/hooks/use-toast";
import type { User, Scenario, UserScenario, Achievement } from "@shared/schema";

export default function ProgressPage() {
  const [, setLocation] = useLocation();
  const [timeframe, setTimeframe] = useState('week');
  const [skillFilter, setSkillFilter] = useState('all');
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/user']
  });

  const { data: scenarios = [] } = useQuery<Scenario[]>({
    queryKey: ['/api/scenarios']
  });

  const { data: userScenarios = [] } = useQuery<UserScenario[]>({
    queryKey: ['/api/user/scenarios']
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/user/achievements']
  });

  const completedScenarios = userScenarios.filter(us => us.status === 'completed');
  const inProgressScenarios = userScenarios.filter(us => us.status === 'in_progress');

  // Calculate dynamic statistics based on timeframe
  const getTimeframeDates = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default: // 'all'
        startDate = new Date(0);
    }
    
    return { startDate, endDate: now };
  };

  const { startDate } = getTimeframeDates();
  
  const timeframeScenarios = userScenarios.filter(us => {
    if (timeframe === 'all') return true;
    const updatedAt = (us as any).updatedAt ? new Date((us as any).updatedAt) : new Date((us as any).createdAt || 0);
    return updatedAt >= startDate;
  });
  
  const timeframeCompleted = timeframeScenarios.filter(us => us.status === 'completed');
  
  const totalTime = timeframeScenarios.reduce((sum, us) => sum + (us.totalTime || 0), 0);
  const averageScore = timeframeCompleted.length > 0 
    ? Math.round(timeframeCompleted.reduce((sum, us) => sum + (us.score || 0), 0) / timeframeCompleted.length)
    : 0;

  // Calculate current streak (consecutive days with completed scenarios)
  const getCurrentStreak = () => {
    const sortedCompleted = completedScenarios
      .filter(us => us.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
    
    if (sortedCompleted.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Check if there's activity today or yesterday
    const latestCompletion = new Date(sortedCompleted[0].completedAt!);
    latestCompletion.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - latestCompletion.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 1) return 0; // Streak broken if no activity for more than 1 day
    
    // Count consecutive days
    const uniqueDays = new Set();
    sortedCompleted.forEach(us => {
      const date = new Date(us.completedAt!);
      date.setHours(0, 0, 0, 0);
      uniqueDays.add(date.getTime());
    });
    
    const sortedDays = Array.from(uniqueDays).sort((a: unknown, b: unknown) => (b as number) - (a as number));
    streak = 1; // At least 1 day if we get here
    
    for (let i = 1; i < sortedDays.length; i++) {
      const dayDiff = ((sortedDays[i-1] as number) - (sortedDays[i] as number)) / (1000 * 60 * 60 * 24);
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = getCurrentStreak();

  // Get recent activity (last 7 days)
  const getRecentActivity = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return completedScenarios
      .filter(us => us.completedAt && new Date(us.completedAt) >= weekAgo)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 5);
  };

  const recentActivity = getRecentActivity();

  // Get skill improvement data
  const getSkillImprovement = () => {
    if (!user?.skillLevels) return [];
    
    return Object.entries(user.skillLevels).map(([skill, level]) => {
      const skillLabel = skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const previousLevel = Math.max(0, level - 15); // Mock previous level for demonstration
      const improvement = level - previousLevel;
      
      return {
        skill: skillLabel,
        current: level,
        previous: previousLevel,
        improvement,
        scenarios: completedScenarios.filter(us => {
          const scenario = scenarios.find(s => s.id === us.scenarioId);
          return scenario && getRelevantSkills(scenario.category).includes(skill);
        }).length
      };
    }).sort((a, b) => b.improvement - a.improvement);
  };

  const getRelevantSkills = (category: string) => {
    const skillMap: Record<string, string[]> = {
      'dementia_care': ['empathy', 'conflict_resolution'],
      'family_communication': ['conflict_resolution', 'decision_making'],
      'medication_management': ['decision_making', 'empathy'],
      'end_of_life': ['empathy', 'decision_making'],
      'safeguarding': ['safeguarding', 'decision_making']
    };
    return skillMap[category] || [];
  };

  const skillData = getSkillImprovement();

  // Get achievement progress
  const getAchievementProgress = () => {
    const totalAchievements = 12; // Total possible achievements
    const unlockedAchievements = achievements.length;
    return {
      unlocked: unlockedAchievements,
      total: totalAchievements,
      percentage: Math.round((unlockedAchievements / totalAchievements) * 100)
    };
  };

  const achievementProgress = getAchievementProgress();

  if (userLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">Your Progress</h1>
            <p className="text-neutral-600 mt-1">Track your learning journey and skill development</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          value={timeframeCompleted.length}
          title={`Completed ${timeframe === 'all' ? 'Total' : timeframe === 'week' ? 'This Week' : 'This Month'}`}
          icon="fas fa-trophy"
          color="secondary"
        />
        <StatCard
          value={totalTime >= 60 ? `${Math.round(totalTime / 60)}h ${totalTime % 60}m` : `${totalTime}min`}
          title={`Training Time ${timeframe === 'all' ? 'Total' : timeframe === 'week' ? 'This Week' : 'This Month'}`}
          icon="fas fa-clock"
          color="accent"
        />
        <StatCard
          value={averageScore > 0 ? `${averageScore}%` : 'N/A'}
          title={`Average Score ${timeframe === 'all' ? 'Overall' : timeframe === 'week' ? 'This Week' : 'This Month'}`}
          icon="fas fa-chart-line"
          color="primary"
        />
        <StatCard
          value={currentStreak > 0 ? `${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}` : 'Start today!'}
          title="Current Streak"
          icon="fas fa-fire"
          color="secondary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Skills & Performance */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Skill Progress Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-chart-bar text-primary"></i>
                Skill Development
              </CardTitle>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  <SelectItem value="improved">Most Improved</SelectItem>
                  <SelectItem value="focus">Focus Areas</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {skillData.slice(0, 5).map((skill, index) => (
                  <div key={skill.skill} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 text-primary flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-800">{skill.skill}</h4>
                          <p className="text-sm text-neutral-500">{skill.scenarios} scenarios completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-neutral-800">{skill.current}%</div>
                        {skill.improvement > 0 && (
                          <div className="text-sm text-green-600 flex items-center gap-1">
                            <i className="fas fa-arrow-up text-xs"></i>
                            +{skill.improvement}%
                          </div>
                        )}
                      </div>
                    </div>
                    <Progress value={skill.current} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-trending-up text-accent"></i>
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {averageScore > 0 ? `${averageScore}%` : 'N/A'}
                  </div>
                  <div className="text-sm text-green-700">Avg Score</div>
                  <div className="text-xs text-green-600 mt-1">
                    {timeframe === 'all' ? 'all time' : timeframe}
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {timeframeCompleted.length > 0 
                      ? `${Math.round(totalTime / timeframeCompleted.length)}min`
                      : 'N/A'
                    }
                  </div>
                  <div className="text-sm text-blue-700">Avg Completion</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {timeframe === 'all' ? 'all time' : timeframe}
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {currentStreak > 0 ? `${currentStreak}` : '0'}
                  </div>
                  <div className="text-sm text-purple-700">Daily Streak</div>
                  <div className="text-xs text-purple-600 mt-1">
                    {currentStreak > 0 ? `${currentStreak === 1 ? 'day' : 'days'} running` : 'start today!'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* In Progress Scenarios */}
          {inProgressScenarios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-play-circle text-primary"></i>
                  Continue Training
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inProgressScenarios.map((userScenario) => {
                    const scenario = scenarios.find(s => s.id === userScenario.scenarioId);
                    if (!scenario) return null;
                    
                    return (
                      <div key={userScenario.id} className="flex items-center justify-between p-4 border border-primary/20 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                            <i className="fas fa-clock text-primary"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-neutral-800">{scenario.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-neutral-500">
                              <span>Progress: {userScenario.progress || 0}%</span>
                              <span>Time: {userScenario.totalTime || 0}min</span>
                              <Badge variant="outline" className="border-primary/30 text-primary">In Progress</Badge>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setLocation(`/simulation/${scenario.id}`)}
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <i className="fas fa-play mr-2"></i>
                          Continue
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-check-circle text-green-600"></i>
                Completed Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedScenarios.length > 0 ? (
                  completedScenarios.map((userScenario) => {
                    const scenario = scenarios.find(s => s.id === userScenario.scenarioId);
                    if (!scenario) return null;
                    
                    return (
                      <div key={userScenario.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <i className="fas fa-check text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-neutral-800">{scenario.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-neutral-500">
                              <span className="text-green-600 font-medium">Score: {userScenario.score}%</span>
                              <span>Time: {userScenario.totalTime}min</span>
                              <span>{userScenario.completedAt ? new Date(userScenario.completedAt).toLocaleDateString() : ''}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation(`/simulation/${scenario.id}`)}
                            title="Retry scenario"
                          >
                            <i className="fas fa-redo mr-2"></i>
                            Retry
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setLocation(`/scenarios/${scenario.id}`)}
                            title="View scenario details"
                          >
                            <i className="fas fa-info-circle"></i>
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-graduation-cap text-neutral-400 text-4xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-neutral-700 mb-2">No Completed Training</h3>
                    <p className="text-neutral-500 mb-4">Complete your first scenario to see your achievements here</p>
                    <Button onClick={() => setLocation('/scenarios')}>
                      Browse Scenarios
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-history text-neutral-600"></i>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => {
                    const scenario = scenarios.find(s => s.id === activity.scenarioId);
                    if (!scenario) return null;
                    
                    return (
                      <div key={activity.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center">
                            <i className="fas fa-check text-secondary"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-neutral-800">{scenario.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-neutral-500">
                              <span>Score: {activity.score}%</span>
                              <span>Time: {activity.totalTime}min</span>
                              <span>{activity.completedAt ? new Date(activity.completedAt).toLocaleDateString() : ''}</span>
                            </div>
                            {/* Recent Activity Reactions */}
                            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <QuickEmojiReaction
                                type="content"
                                contextId={`recent-activity-${activity.id}`}
                                onReaction={(reaction) => {
                                  toast({
                                    title: `${reaction.emoji} ${reaction.label}!`,
                                    description: `Reflecting on "${scenario.title}" made you feel ${reaction.description.toLowerCase()}`,
                                    duration: 3000,
                                  });
                                }}

                                className="scale-75"
                              />
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setLocation(`/simulation/${scenario.id}`)}
                          title="Practice again"
                        >
                          <i className="fas fa-redo mr-1"></i>
                          Retry
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-calendar-alt text-neutral-400 text-4xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-neutral-700 mb-2">No Recent Activity</h3>
                    <p className="text-neutral-500 mb-4">Start a training scenario to begin tracking your progress</p>
                    <Button onClick={() => setLocation('/scenarios')}>
                      Browse Scenarios
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Achievements & Goals */}
        <div className="space-y-8">
          
          {/* Achievement Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-trophy text-accent"></i>
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-24 h-24 rounded-full bg-neutral-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-neutral-800">{achievementProgress.unlocked}</div>
                      <div className="text-xs text-neutral-500">of {achievementProgress.total}</div>
                    </div>
                  </div>
                </div>
                <Progress value={achievementProgress.percentage} className="h-2 mb-2" />
                <p className="text-sm text-neutral-600">{achievementProgress.percentage}% Complete</p>
                
                {/* Achievement Progress Reactions */}
                {achievementProgress.unlocked > 0 && (
                  <div className="mt-4">
                    <EmojiReactionButtons
                      type="achievement"
                      contextId="achievement-progress"
                      onReaction={(reaction) => {
                        toast({
                          title: `${reaction.emoji} ${reaction.label}!`,
                          description: `Your progress feels ${reaction.description.toLowerCase()}! Keep building your care skills.`,
                          duration: 3500,
                        });
                      }}
                      className="scale-90 opacity-90 hover:opacity-100 transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg relative group">
                    <div className="w-8 h-8 rounded-full bg-accent bg-opacity-20 flex items-center justify-center">
                      <i className="fas fa-medal text-accent text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-800 text-sm">{achievement.title}</h4>
                      <p className="text-xs text-neutral-500">{achievement.description}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <QuickEmojiReaction
                        type="achievement"
                        contextId={`achievement-${achievement.id}`}
                        onReaction={(reaction) => {
                          toast({
                            title: `${reaction.emoji} Achievement unlocked!`,
                            description: `You earned "${achievement.title}" and felt ${reaction.description.toLowerCase()}`,
                            duration: 3000,
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
                
                {achievements.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-medal text-neutral-400 text-2xl mb-2"></i>
                    <p className="text-sm text-neutral-500">Complete scenarios to unlock achievements</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Learning Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-target text-primary"></i>
                Learning Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-primary border-opacity-30 bg-primary bg-opacity-5 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-neutral-800">Empathy Mastery</h4>
                    <Badge className="bg-primary text-white">Active</Badge>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">Reach 85% in empathy-focused scenarios</p>
                  <Progress value={75} className="h-2 mb-1" />
                  <div className="text-xs text-neutral-500">75% complete (3 more scenarios)</div>
                </div>

                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-neutral-700">Conflict Resolution</h4>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                  <p className="text-sm text-neutral-600">Master difficult family conversations</p>
                </div>

                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-neutral-700">Advanced Care</h4>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                  <p className="text-sm text-neutral-600">Handle complex care situations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-rocket text-secondary"></i>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setLocation('/scenarios')}
                >
                  <i className="fas fa-play mr-2"></i>
                  Start New Scenario
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setLocation('/profile')}
                >
                  <i className="fas fa-user mr-2"></i>
                  Update Profile
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => {/* Export progress functionality */}}
                >
                  <i className="fas fa-download mr-2"></i>
                  Export Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}