import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScenarioCard } from "@/components/scenario-card";
import { SkillProgress } from "@/components/skill-progress";
import { useToast } from "@/hooks/use-toast";
import { ContentSkeleton, CardSkeleton, VoiceProcessingLoader } from "@/components/smart-loading";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Scenario } from "@shared/schema";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'overview' | 'assessment' | 'preferences' | 'recommendations'>('overview');
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/user']
  });

  const { data: scenarios = [] } = useQuery<Scenario[]>({
    queryKey: ['/api/scenarios']
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      const response = await apiRequest("PATCH", "/api/user", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    }
  });

  // Profile completion calculation
  const getProfileCompletion = (user: User | undefined) => {
    if (!user) return 0;
    let completion = 0;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (fullName) completion += 20;
    if (user.email) completion += 20;
    if (user.role) completion += 20;
    if (user.skillLevels && Object.keys(user.skillLevels).length > 0) completion += 40;
    return completion;
  };

  // Role-based scenario recommendations
  const getRecommendedScenarios = (userRole: string, skillLevels: Record<string, number>) => {
    const roleScenarios: Record<string, string[]> = {
      'care_worker': ['dementia_care', 'medication_management', 'family_communication'],
      'nurse': ['end_of_life', 'family_communication', 'safeguarding'],
      'care_manager': ['safeguarding', 'family_communication', 'conflict_resolution'],
      'support_worker': ['dementia_care', 'medication_management', 'basic_care']
    };

    const relevantCategories = roleScenarios[userRole] || ['dementia_care'];
    const filteredScenarios = scenarios.filter(s => relevantCategories.includes(s.category));

    // Sort by skill level and difficulty match
    return filteredScenarios.sort((a, b) => {
      const aSkillMatch = getSkillMatch(a, skillLevels);
      const bSkillMatch = getSkillMatch(b, skillLevels);
      return bSkillMatch - aSkillMatch;
    }).slice(0, 4);
  };

  const getSkillMatch = (scenario: Scenario, skillLevels: Record<string, number>) => {
    const skillMap: Record<string, string[]> = {
      'dementia_care': ['empathy', 'conflict_resolution'],
      'family_communication': ['conflict_resolution', 'decision_making'],
      'medication_management': ['decision_making', 'empathy'],
      'end_of_life': ['empathy', 'decision_making'],
      'safeguarding': ['safeguarding', 'decision_making']
    };

    const relevantSkills = skillMap[scenario.category] || [];
    const avgSkillLevel = relevantSkills.reduce((sum, skill) => 
      sum + (skillLevels[skill] || 0), 0) / relevantSkills.length;

    // Match difficulty to skill level
    const difficultyScore = {
      'beginner': avgSkillLevel < 40 ? 100 : 60,
      'intermediate': avgSkillLevel >= 40 && avgSkillLevel < 70 ? 100 : 70,
      'advanced': avgSkillLevel >= 70 ? 100 : 50
    };

    return difficultyScore[scenario.difficulty as keyof typeof difficultyScore] || 50;
  };

  const profileCompletion = getProfileCompletion(user);
  const recommendedScenarios = user ? getRecommendedScenarios(user.role, user.skillLevels || {}) : [];

  if (userLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <ContentSkeleton lines={1} className="w-1/3 h-8" />
          <CardSkeleton className="h-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CardSkeleton className="h-64" />
            <CardSkeleton className="h-64" />
            <CardSkeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 overflow-hidden">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">Your Profile</h1>
            <p className="text-neutral-600 mt-1">Personalize your Carefully training experience</p>
          </div>
          <Button 
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <i className="fas fa-times mr-2"></i>Cancel
              </>
            ) : (
              <>
                <i className="fas fa-edit mr-2"></i>Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Profile Completion */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-800">Profile Completion</h3>
              <p className="text-sm text-neutral-600">Complete your profile to get better recommendations</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{profileCompletion}%</div>
              <div className="text-sm text-neutral-500">Complete</div>
            </div>
          </div>
          <Progress value={profileCompletion} className="h-3" />
          
          {profileCompletion < 100 && (
            <div className="mt-4 p-4 bg-[#DABFFF] bg-opacity-20 rounded-lg">
              <h4 className="font-medium text-[#2C2A4A] mb-2">Complete these steps to improve your experience:</h4>
              <ul className="text-sm text-[#4F518C] space-y-2">
                {!(user?.firstName || user?.lastName) && (
                  <li className="flex items-center justify-between">
                    <span>• Add your full name</span>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      Add Name
                    </Button>
                  </li>
                )}
                {!user?.email && <li>• Verify your email address</li>}
                {!user?.role && (
                  <li className="flex items-center justify-between">
                    <span>• Select your care role</span>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      Set Role
                    </Button>
                  </li>
                )}
                {(!user?.skillLevels || Object.keys(user.skillLevels).length === 0) && (
                  <li className="flex items-center justify-between">
                    <span>• Complete skill assessment</span>
                    <Button 
                      size="sm" 
                      className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white"
                      onClick={() => setCurrentStep('assessment')}
                    >
                      Start Assessment
                    </Button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-neutral-200 p-1 rounded-lg overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: 'fas fa-user' },
          { key: 'assessment', label: 'Skills', icon: 'fas fa-chart-line' },
          { key: 'preferences', label: 'Preferences', icon: 'fas fa-cog' },
          { key: 'recommendations', label: 'For You', icon: 'fas fa-star' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCurrentStep(tab.key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              currentStep === tab.key
                ? 'bg-white text-primary shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            <i className={`${tab.icon} text-sm`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-0 flex-1">
        {currentStep === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Basic Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-user text-primary"></i>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-2 block">Full Name</label>
                      {isEditing ? (
                        <Input defaultValue={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()} placeholder="Enter your full name" />
                      ) : (
                        <p className="text-neutral-800">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-2 block">Email</label>
                      {isEditing ? (
                        <Input defaultValue={user?.email || ''} placeholder="Enter your email" />
                      ) : (
                        <p className="text-neutral-800">{user?.email || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-2 block">Care Role</label>
                      {isEditing ? (
                        <Select defaultValue={user?.role}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="care_worker">Care Worker</SelectItem>
                            <SelectItem value="nurse">Nurse</SelectItem>
                            <SelectItem value="care_manager">Care Manager</SelectItem>
                            <SelectItem value="support_worker">Support Worker</SelectItem>
                            <SelectItem value="healthcare_assistant">Healthcare Assistant</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary text-white">
                            {user?.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-2 block">Experience Level</label>
                      {isEditing ? (
                        <Select defaultValue={user?.experienceLevel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New to care work</SelectItem>
                            <SelectItem value="some">Some experience (1-2 years)</SelectItem>
                            <SelectItem value="experienced">Experienced (3+ years)</SelectItem>
                            <SelectItem value="expert">Expert (5+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-neutral-800">
                          {user?.experienceLevel === 'new' && 'New to care work'}
                          {user?.experienceLevel === 'some' && 'Some experience (1-2 years)'}
                          {user?.experienceLevel === 'experienced' && 'Experienced (3+ years)'}
                          {user?.experienceLevel === 'expert' && 'Expert (5+ years)'}
                          {!user?.experienceLevel && 'Not specified'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-2 block">Learning Goals</label>
                    {isEditing ? (
                      <Textarea 
                        placeholder="What do you want to achieve in your care work?" 
                        defaultValue={user?.learningGoals?.join(', ') || ''}
                      />
                    ) : (
                      <div className="space-y-2">
                        {user?.learningGoals && user.learningGoals.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {user.learningGoals.map((goal, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {goal}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-neutral-500 italic">No learning goals set</p>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex space-x-3 pt-4">
                      <Button onClick={() => updateProfileMutation.mutate({})}>
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Training Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Scenarios Completed</span>
                    <span className="font-semibold text-neutral-800">{user?.totalScenarios || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Training Time</span>
                    <span className="font-semibold text-neutral-800">{((user?.totalTime || 0) / 60).toFixed(1)}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Current Streak</span>
                    <span className="font-semibold text-neutral-800">{user?.weeklyStreak || 0} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Avg. Skill Level</span>
                    <span className="font-semibold text-neutral-800">
                      {user?.skillLevels ? 
                        Math.round(Object.values(user.skillLevels).reduce((a, b) => a + b, 0) / Object.keys(user.skillLevels).length) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setCurrentStep('assessment')}
                  >
                    <i className="fas fa-chart-line mr-3"></i>
                    Update Skills Assessment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setLocation('/scenarios')}
                  >
                    <i className="fas fa-play mr-3"></i>
                    Browse All Scenarios
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setCurrentStep('recommendations')}
                  >
                    <i className="fas fa-star mr-3"></i>
                    View Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {currentStep === 'assessment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-chart-line text-primary"></i>
                Current Skill Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.skillLevels ? (
                <SkillProgress skills={user.skillLevels} />
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-chart-line text-neutral-400 text-4xl mb-4"></i>
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">No Skills Assessed</h3>
                  <p className="text-neutral-500 mb-4">Complete scenarios to build your skill profile</p>
                  <Button onClick={() => setLocation('/scenarios')}>
                    Start First Scenario
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills Development Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-brand-light-purple bg-opacity-20 p-4 rounded-lg">
                  <h4 className="font-medium text-brand-dark mb-2">Focus Areas</h4>
                  <ul className="text-sm text-brand-medium space-y-1">
                    <li>• Practice more family communication scenarios</li>
                    <li>• Improve decision-making in complex situations</li>
                    <li>• Develop conflict resolution techniques</li>
                  </ul>
                </div>

                <div className="bg-secondary bg-opacity-20 p-4 rounded-lg">
                  <h4 className="font-medium text-brand-dark mb-2">Strengths</h4>
                  <ul className="text-sm text-brand-medium space-y-1">
                    <li>• Excellent empathy and communication</li>
                    <li>• Strong safeguarding awareness</li>
                    <li>• Consistent training engagement</li>
                  </ul>
                </div>

                <Button className="w-full">
                  <i className="fas fa-target mr-2"></i>
                  Update Development Goals
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 'preferences' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-cog text-primary"></i>
              Training Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Preferred Training Duration</label>
                  <Select defaultValue={user?.preferences?.sessionLength || "medium"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short sessions (5-10 minutes)</SelectItem>
                      <SelectItem value="medium">Medium sessions (15-20 minutes)</SelectItem>
                      <SelectItem value="long">Long sessions (30+ minutes)</SelectItem>
                    </SelectContent>
                  </Select>
                  {user?.preferences?.sessionLength && (
                    <p className="text-sm text-neutral-600 mt-1">
                      Current preference: {
                        user.preferences.sessionLength === 'short' ? 'Short sessions (5-10 minutes)' :
                        user.preferences.sessionLength === 'medium' ? 'Medium sessions (15-20 minutes)' :
                        user.preferences.sessionLength === 'long' ? 'Long sessions (30+ minutes)' :
                        'Not set'
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Difficulty Preference</label>
                  <Select defaultValue={user?.preferences?.difficulty || "balanced"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gentle">Gentle approach</SelectItem>
                      <SelectItem value="balanced">Balanced difficulty</SelectItem>
                      <SelectItem value="challenging">Challenging scenarios</SelectItem>
                    </SelectContent>
                  </Select>
                  {user?.preferences?.difficulty && (
                    <p className="text-sm text-neutral-600 mt-1">
                      Current preference: {
                        user.preferences.difficulty === 'gentle' ? 'Gentle approach' :
                        user.preferences.difficulty === 'balanced' ? 'Balanced difficulty' :
                        user.preferences.difficulty === 'challenging' ? 'Challenging scenarios' :
                        'Not set'
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Notification Preferences</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-bell text-neutral-500"></i>
                        <span className="text-sm">Daily training reminders</span>
                      </div>
                      <Badge variant={user?.preferences?.notifications?.dailyReminders ? "default" : "outline"}>
                        {user?.preferences?.notifications?.dailyReminders ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-chart-line text-neutral-500"></i>
                        <span className="text-sm">Weekly progress updates</span>
                      </div>
                      <Badge variant={user?.preferences?.notifications?.progressUpdates ? "default" : "outline"}>
                        {user?.preferences?.notifications?.progressUpdates ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-trophy text-neutral-500"></i>
                        <span className="text-sm">Achievement notifications</span>
                      </div>
                      <Badge variant={user?.preferences?.notifications?.achievements ? "default" : "outline"}>
                        {user?.preferences?.notifications?.achievements ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>

              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Focus Areas from Onboarding</label>
                  <div className="space-y-2">
                    {user?.learningGoals && user.learningGoals.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.learningGoals.map((goal, index) => (
                          <Badge key={index} className="bg-primary/10 text-primary border-primary/20">
                            <i className="fas fa-target mr-1"></i>
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-500 italic">Complete onboarding to set learning goals</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Additional Learning Goals</label>
                  <Textarea 
                    placeholder="What specific skills would you like to develop? Any particular situations you'd like to practice?"
                    className="h-24"
                    defaultValue={user?.preferences?.learningGoals || ''}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-neutral-200">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'recommendations' && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-star text-primary"></i>
                Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-neutral-600">
                  Based on your role as a <strong>{user?.role?.replace(/_/g, ' ')}</strong> and current skill levels, 
                  we recommend these scenarios to help you grow:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendedScenarios.map((scenario) => (
                  <div key={scenario.id} className="relative">
                    <ScenarioCard scenario={scenario} />
                    <Badge className="absolute -top-2 -right-2 bg-secondary text-brand-dark">
                      Recommended
                    </Badge>
                  </div>
                ))}
              </div>

              {recommendedScenarios.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-lightbulb text-neutral-400 text-4xl mb-4"></i>
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">Complete Your Profile</h3>
                  <p className="text-neutral-500 mb-4">Finish setting up your profile to get personalized recommendations</p>
                  <Button onClick={() => setCurrentStep('overview')}>
                    Complete Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Path</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-brand-light-purple bg-opacity-20 rounded-lg">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">1</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-brand-dark">Foundation Skills</h4>
                    <p className="text-sm text-brand-medium">Master basic communication and empathy</p>
                  </div>
                  <Badge className="bg-secondary text-brand-dark">Current</Badge>
                </div>

                <div className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg">
                  <div className="bg-neutral-200 text-neutral-500 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">2</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-700">Intermediate Challenges</h4>
                    <p className="text-sm text-neutral-500">Handle complex family dynamics</p>
                  </div>
                  <Badge variant="outline">Next</Badge>
                </div>

                <div className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg">
                  <div className="bg-neutral-200 text-neutral-500 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">3</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-700">Advanced Scenarios</h4>
                    <p className="text-sm text-neutral-500">Navigate crisis situations with confidence</p>
                  </div>
                  <Badge variant="outline">Future</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}