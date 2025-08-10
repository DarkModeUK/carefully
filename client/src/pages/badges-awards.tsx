import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { CareQualityBadge, UserBadge } from "@shared/schema";

const badgeCategories = {
  skills: {
    title: 'Care Skills',
    icon: 'fas fa-user-md',
    color: 'text-blue-600',
    description: 'Recognition for developing specific care competencies'
  },
  achievement: {
    title: 'Achievements', 
    icon: 'fas fa-trophy',
    color: 'text-yellow-600',
    description: 'Milestone badges for reaching training goals'
  },
  quality: {
    title: 'Care Quality',
    icon: 'fas fa-shield-alt', 
    color: 'text-green-600',
    description: 'Excellence in providing compassionate care'
  },
  engagement: {
    title: 'Community',
    icon: 'fas fa-users',
    color: 'text-purple-600',
    description: 'Contributing to the care community'
  }
};

const streakAwards = [
  { days: 7, title: 'Week Warrior', icon: 'fas fa-fire', color: 'text-orange-500' },
  { days: 14, title: 'Fortnight Fighter', icon: 'fas fa-flame', color: 'text-red-500' },
  { days: 30, title: 'Month Master', icon: 'fas fa-medal', color: 'text-yellow-500' },
  { days: 60, title: 'Dedication Diamond', icon: 'fas fa-gem', color: 'text-blue-500' },
  { days: 100, title: 'Century Champion', icon: 'fas fa-crown', color: 'text-purple-500' },
  { days: 365, title: 'Year Legend', icon: 'fas fa-star', color: 'text-gold-500' }
];

export default function BadgesAwardsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch user's badges
  const { data: userBadges, isLoading: userBadgesLoading } = useQuery({
    queryKey: ['/api/user/badges'],
    enabled: !!user,
  });

  // Fetch available badges
  const { data: availableBadges, isLoading: availableBadgesLoading } = useQuery({
    queryKey: ['/api/badges/available'],
    enabled: !!user,
  });

  const getBadgeIcon = (badge: CareQualityBadge) => {
    const tierIcons = {
      bronze: 'fas fa-medal',
      silver: 'fas fa-trophy', 
      gold: 'fas fa-crown',
      platinum: 'fas fa-gem'
    };
    return badge.icon || tierIcons[badge.tier as keyof typeof tierIcons] || 'fas fa-award';
  };

  const getBadgeColor = (badge: CareQualityBadge) => {
    const tierColors = {
      bronze: 'text-orange-600 bg-orange-100',
      silver: 'text-gray-600 bg-gray-100', 
      gold: 'text-yellow-600 bg-yellow-100',
      platinum: 'text-blue-600 bg-blue-100'
    };
    return badge.color || tierColors[badge.tier as keyof typeof tierColors] || 'text-gray-600 bg-gray-100';
  };

  const getNextStreakAward = () => {
    const currentStreak = user?.currentStreak || 0;
    return streakAwards.find(award => award.days > currentStreak);
  };

  const getStreakProgress = () => {
    const nextAward = getNextStreakAward();
    if (!nextAward || !user?.currentStreak) return 0;
    
    const prevAward = streakAwards
      .filter(award => award.days <= user.currentStreak)
      .pop();
    
    const startDays = prevAward?.days || 0;
    const progress = ((user.currentStreak - startDays) / (nextAward.days - startDays)) * 100;
    return Math.min(progress, 100);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <i className="fas fa-award text-4xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to view your badges and awards.</p>
            <Button onClick={() => setLocation('/api/login')}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Badges & Awards</h1>
        <p className="text-gray-600">
          Celebrate your achievements and track your progress in becoming an exceptional care professional.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Badges Earned</p>
                <p className="text-2xl font-bold text-gray-900">{userBadges?.length || 0}</p>
                <p className="text-xs text-blue-600">Keep collecting!</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-trophy text-blue-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{user?.currentStreak || 0} days</p>
                <p className="text-xs text-orange-600">On fire! 🔥</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="fas fa-fire text-orange-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userBadges?.reduce((sum: number, badge: UserBadge & { badge: CareQualityBadge }) => 
                    sum + (badge.badge?.points || 0), 0) || 0}
                </p>
                <p className="text-xs text-green-600">Well earned!</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-star text-green-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streak Progress */}
      {getNextStreakAward() && (
        <Card className="mb-8 border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Next Streak Award</h3>
                <p className="text-gray-600">
                  Keep your streak going to earn the "{getNextStreakAward()?.title}" badge
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-500">
                  {user?.currentStreak}/{getNextStreakAward()?.days} days
                </div>
              </div>
            </div>
            <Progress value={getStreakProgress()} className="h-3" />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Current: {user?.currentStreak} days</span>
              <span>Target: {getNextStreakAward()?.days} days</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="earned" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earned">My Badges</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* My Badges Tab */}
        <TabsContent value="earned" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => setSelectedCategory('all')}
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All Badges
            </Button>
            {Object.entries(badgeCategories).map(([key, category]) => (
              <Button
                key={key}
                onClick={() => setSelectedCategory(key)}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
              >
                <i className={`${category.icon} mr-2`}></i>
                {category.title}
              </Button>
            ))}
          </div>

          {userBadgesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 mx-auto"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 mx-auto"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userBadges?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <i className="fas fa-medal text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium mb-2">Start Earning Badges</h3>
                <p className="text-gray-600 mb-4">
                  Complete training scenarios and engage with the community to earn your first badge!
                </p>
                <Button onClick={() => setLocation('/scenarios')} className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white">
                  Start Training
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBadges?.map((userBadge: UserBadge & { badge: CareQualityBadge }) => (
                <Card key={userBadge.id} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${getBadgeColor(userBadge.badge)}`}>
                      <i className={`${getBadgeIcon(userBadge.badge)} text-2xl`}></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{userBadge.badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{userBadge.badge.description}</p>
                    <div className="flex justify-center mb-2">
                      <Badge className={getBadgeColor(userBadge.badge)}>
                        {userBadge.badge.tier.charAt(0).toUpperCase() + userBadge.badge.tier.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      Earned on {new Date(userBadge.earnedAt).toLocaleDateString()}
                    </p>
                    <div className="text-sm font-medium text-[#907AD6] mt-2">
                      +{userBadge.badge.points} points
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Available Badges Tab */}
        <TabsContent value="available" className="space-y-6">
          {availableBadgesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 mx-auto"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 mx-auto"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableBadges?.map((badge: CareQualityBadge) => {
                const isEarned = userBadges?.some((ub: UserBadge) => ub.badgeId === badge.id);
                
                return (
                  <Card key={badge.id} className={`text-center ${isEarned ? 'opacity-50' : 'hover:shadow-lg'} transition-shadow`}>
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                        isEarned ? 'bg-gray-200 text-gray-400' : getBadgeColor(badge)
                      }`}>
                        <i className={`${getBadgeIcon(badge)} text-2xl`}></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{badge.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                      <div className="flex justify-center mb-2">
                        <Badge className={getBadgeColor(badge)}>
                          {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}
                        </Badge>
                      </div>
                      
                      {/* Requirements */}
                      <div className="text-xs text-gray-500 space-y-1">
                        {badge.criteria?.scenarioCount && (
                          <div>Complete {badge.criteria.scenarioCount} scenarios</div>
                        )}
                        {badge.criteria?.averageScore && (
                          <div>Achieve {badge.criteria.averageScore}% average score</div>
                        )}
                        {badge.criteria?.streakDays && (
                          <div>Maintain {badge.criteria.streakDays}-day streak</div>
                        )}
                      </div>
                      
                      <div className="text-sm font-medium text-[#907AD6] mt-2">
                        {isEarned ? '✓ Earned' : `+${badge.points} points`}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-500' : 'bg-gray-600'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="w-10 h-10 bg-[#907AD6] rounded-full flex items-center justify-center text-white font-bold">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div>
                        <h3 className="font-medium">Care Worker {String.fromCharCode(65 + i)}</h3>
                        <p className="text-sm text-gray-600">{12 - i} badges earned</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{1250 - (i * 50)} pts</div>
                      <div className="text-sm text-gray-600">{30 - i} day streak</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}