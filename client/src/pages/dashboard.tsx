import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { StatCard } from "@/components/stat-card";
import { ScenarioCard } from "@/components/scenario-card";
import { SkillProgress } from "@/components/skill-progress";
import { TrainingModal } from "@/components/training-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { User, Scenario, UserScenario, Achievement } from "@shared/schema";

export default function Dashboard() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/user']
  });

  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery<Scenario[]>({
    queryKey: ['/api/scenarios']
  });

  const { data: userScenarios = [], isLoading: userScenariosLoading } = useQuery<UserScenario[]>({
    queryKey: ['/api/user/scenarios']
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/user/achievements']
  });

  const currentScenario = userScenarios.find(us => us.status === 'in_progress');
  const currentScenarioData = scenarios.find(s => s.id === currentScenario?.scenarioId);

  const handleStartScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setIsTrainingModalOpen(true);
  };

  const handleContinueTraining = () => {
    if (currentScenarioData) {
      setSelectedScenario(currentScenarioData);
      setIsTrainingModalOpen(true);
    }
  };

  if (userLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
          Welcome back, {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Sarah'}!
        </h2>
        <p className="text-neutral-500">Continue building your care skills with personalized training scenarios.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          value={user?.totalScenarios || 12}
          title="Scenarios Completed"
          icon="fas fa-trophy"
          color="secondary"
        />
        <StatCard
          value={`${Math.round(Object.values(user?.skillLevels || {}).reduce((a, b) => a + b, 0) / Object.keys(user?.skillLevels || {}).length || 0) || 70}%`}
          title="Skill Level"
          icon="fas fa-chart-line"
          color="accent"
        />
        <StatCard
          value={user?.weeklyStreak || 5}
          title="Day Streak"
          icon="fas fa-fire"
          color="primary"
        />
        <StatCard
          value={`${((user?.totalTime || 138) / 60).toFixed(1)}h`}
          title="This Week"
          icon="fas fa-clock"
          color="neutral"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Continue Training & Scenarios */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Continue Training Section */}
          {currentScenario && currentScenarioData && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-800">Continue Training</h3>
                  <Badge className="bg-accent bg-opacity-20 text-accent">In Progress</Badge>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-primary bg-opacity-20 rounded-lg p-3 flex-shrink-0">
                    <i className="fas fa-user-nurse text-primary text-xl"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-neutral-800 mb-1">{currentScenarioData.title}</h4>
                    <p className="text-sm text-neutral-500 mb-3">{currentScenarioData.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-neutral-500 mb-1">
                        <span>Progress</span>
                        <span>{currentScenario.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${currentScenario.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <Button onClick={handleContinueTraining}>
                      <i className="fas fa-play mr-2"></i>Continue Training
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Scenarios */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Available Scenarios</CardTitle>
                <Button variant="ghost" size="sm">
                  View All <i className="fas fa-arrow-right ml-1"></i>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {scenariosLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {scenarios.slice(0, 3).map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Progress & Achievements */}
        <div className="space-y-8">
          
          {/* Skill Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {user?.skillLevels ? (
                <SkillProgress skills={user.skillLevels} />
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {achievementsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3">
                      <div className="bg-secondary bg-opacity-20 rounded-full p-2 flex-shrink-0">
                        <i className={`${achievement.icon} text-secondary text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800">{achievement.title}</p>
                        <p className="text-xs text-neutral-500">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="ghost" className="w-full mt-4" size="sm">
                    View All Achievements
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-between" size="sm">
                  <div className="flex items-center">
                    <i className="fas fa-random text-neutral-500 mr-3"></i>
                    <span className="font-medium text-neutral-700">Random Scenario</span>
                  </div>
                  <i className="fas fa-chevron-right text-neutral-400"></i>
                </Button>

                <Button variant="outline" className="w-full justify-between" size="sm">
                  <div className="flex items-center">
                    <i className="fas fa-chart-bar text-neutral-500 mr-3"></i>
                    <span className="font-medium text-neutral-700">View Full Progress</span>
                  </div>
                  <i className="fas fa-chevron-right text-neutral-400"></i>
                </Button>

                <Button variant="outline" className="w-full justify-between" size="sm">
                  <div className="flex items-center">
                    <i className="fas fa-cog text-neutral-500 mr-3"></i>
                    <span className="font-medium text-neutral-700">Training Preferences</span>
                  </div>
                  <i className="fas fa-chevron-right text-neutral-400"></i>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Training Modal */}
      <TrainingModal
        scenario={selectedScenario}
        isOpen={isTrainingModalOpen}
        onClose={() => {
          setIsTrainingModalOpen(false);
          setSelectedScenario(null);
        }}
      />
    </div>
  );
}
