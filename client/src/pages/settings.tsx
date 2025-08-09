import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('account');

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/user']
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      return apiRequest('PATCH', '/api/user', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handlePreferenceUpdate = (key: string, value: any) => {
    const currentPreferences = user?.preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      [key]: value
    };
    
    updateUserMutation.mutate({ preferences: updatedPreferences });
  };

  const handleNotificationUpdate = (key: string, value: boolean) => {
    const currentPreferences = user?.preferences || {};
    const currentNotifications = currentPreferences.notifications || {};
    const updatedNotifications = {
      ...currentNotifications,
      [key]: value
    };
    
    const updatedPreferences = {
      ...currentPreferences,
      notifications: updatedNotifications
    };
    
    updateUserMutation.mutate({ preferences: updatedPreferences });
  };

  if (userLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Skeleton className="h-96" />
            <div className="lg:col-span-3">
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const settingsSections = [
    { id: 'account', label: 'Account', icon: 'fas fa-user' },
    { id: 'preferences', label: 'Learning Preferences', icon: 'fas fa-brain' },
    { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
    { id: 'privacy', label: 'Privacy & Security', icon: 'fas fa-shield-alt' },
    { id: 'support', label: 'Help & Support', icon: 'fas fa-life-ring' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">Settings</h1>
        <p className="text-neutral-600 mt-1">Manage your account, preferences, and application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? "bg-[#907AD6] text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <i className={`${section.icon} mr-2`}></i>
                    {section.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Account Settings */}
          {activeSection === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-user text-[#907AD6]"></i>
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
                    <div className="p-3 bg-neutral-50 rounded-md text-neutral-800">
                      {user?.firstName || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
                    <div className="p-3 bg-neutral-50 rounded-md text-neutral-800">
                      {user?.lastName || 'Not specified'}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                    <div className="p-3 bg-neutral-50 rounded-md text-neutral-800">
                      {user?.email || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                    <div className="p-3 bg-neutral-50 rounded-md">
                      <Badge className="bg-[#907AD6] text-white">
                        {user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Care Worker'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Profile Completion</label>
                    <div className="p-3 bg-neutral-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-neutral-200 rounded-full h-2">
                          <div 
                            className="bg-[#907AD6] h-2 rounded-full" 
                            style={{ width: `${user?.profileCompletion || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{user?.profileCompletion || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-sm text-neutral-600 mb-4">
                    Account information is managed through your authentication provider. 
                    To update your name or email, please contact support.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline">
                      <i className="fas fa-envelope mr-2"></i>
                      Contact Support
                    </Button>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      <i className="fas fa-trash mr-2"></i>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Preferences */}
          {activeSection === 'preferences' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-brain text-[#7FDEFF]"></i>
                  Learning Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Training Duration</label>
                    <Select 
                      value={user?.preferences?.trainingDuration?.toString() || "15"} 
                      onValueChange={(value) => handlePreferenceUpdate('trainingDuration', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Difficulty Preference</label>
                    <Select 
                      value={user?.preferences?.difficultyPreference || "adaptive"} 
                      onValueChange={(value) => handlePreferenceUpdate('difficultyPreference', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="adaptive">Adaptive (Recommended)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Focus Areas</label>
                  <div className="space-y-2">
                    {['Empathy', 'Conflict Resolution', 'Decision Making', 'Safeguarding', 'End-of-Life Care'].map((area) => (
                      <div key={area} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                        <span className="text-sm font-medium text-neutral-700">{area}</span>
                        <Switch 
                          checked={user?.preferences?.focusAreas?.includes(area.toLowerCase().replace(/\s+/g, '_')) || false}
                          onCheckedChange={(checked) => {
                            const currentAreas = user?.preferences?.focusAreas || [];
                            const areaKey = area.toLowerCase().replace(/\s+/g, '_');
                            const updatedAreas = checked 
                              ? [...currentAreas.filter(a => a !== areaKey), areaKey]
                              : currentAreas.filter(a => a !== areaKey);
                            handlePreferenceUpdate('focusAreas', updatedAreas);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Learning Goals</label>
                  <textarea
                    className="w-full p-3 border border-neutral-200 rounded-md resize-none"
                    rows={3}
                    placeholder="Describe your learning goals and objectives..."
                    value={user?.preferences?.learningGoals || ''}
                    onChange={(e) => handlePreferenceUpdate('learningGoals', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-bell text-[#DABFFF]"></i>
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-800">Daily Reminders</h4>
                      <p className="text-sm text-neutral-600">Get daily reminders to complete your training</p>
                    </div>
                    <Switch 
                      checked={user?.preferences?.notifications?.dailyReminders || false}
                      onCheckedChange={(checked) => handleNotificationUpdate('dailyReminders', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-800">Weekly Progress</h4>
                      <p className="text-sm text-neutral-600">Receive weekly progress summaries and insights</p>
                    </div>
                    <Switch 
                      checked={user?.preferences?.notifications?.weeklyProgress || false}
                      onCheckedChange={(checked) => handleNotificationUpdate('weeklyProgress', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-800">New Scenarios</h4>
                      <p className="text-sm text-neutral-600">Get notified when new training scenarios are available</p>
                    </div>
                    <Switch 
                      checked={user?.preferences?.notifications?.newScenarios || false}
                      onCheckedChange={(checked) => handleNotificationUpdate('newScenarios', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-800">Achievement Updates</h4>
                      <p className="text-sm text-neutral-600">Celebrate your achievements and milestones</p>
                    </div>
                    <Switch 
                      checked={user?.preferences?.notifications?.achievements || false}
                      onCheckedChange={(checked) => handleNotificationUpdate('achievements', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy & Security */}
          {activeSection === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-shield-alt text-[#4F518C]"></i>
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-check-circle text-green-600"></i>
                      <h4 className="font-medium text-green-800">Data Protection</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Your training data is encrypted and stored securely. We comply with GDPR and healthcare data protection standards.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-neutral-800">Data Management</h4>
                    <div className="flex gap-3">
                      <Button variant="outline">
                        <i className="fas fa-download mr-2"></i>
                        Export My Data
                      </Button>
                      <Button variant="outline">
                        <i className="fas fa-history mr-2"></i>
                        View Data Usage
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-neutral-800">Session Management</h4>
                    <div className="flex gap-3">
                      <Button variant="outline">
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Sign Out All Devices
                      </Button>
                      <Button variant="outline">
                        <i className="fas fa-mobile-alt mr-2"></i>
                        Manage Sessions
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help & Support */}
          {activeSection === 'support' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-life-ring text-[#7FDEFF]"></i>
                  Help & Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-neutral-800">Resources</h4>
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start">
                        <i className="fas fa-book mr-2"></i>
                        User Guide
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <i className="fas fa-video mr-2"></i>
                        Training Videos
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <i className="fas fa-question-circle mr-2"></i>
                        FAQs
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <i className="fas fa-comments mr-2"></i>
                        Community Forum
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-neutral-800">Get Help</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <i className="fas fa-envelope mr-2"></i>
                        Contact Support
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <i className="fas fa-bug mr-2"></i>
                        Report a Bug
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <i className="fas fa-lightbulb mr-2"></i>
                        Request Feature
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                  <h4 className="font-medium text-neutral-800 mb-2">App Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
                    <div>Version: 1.2.0</div>
                    <div>Last Updated: Aug 2025</div>
                    <div>Environment: Development</div>
                    <div>Support: 24/7 Available</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}