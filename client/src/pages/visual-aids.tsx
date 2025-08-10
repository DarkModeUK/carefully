import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { Scenario } from "@shared/schema";

const visualAidCategories = [
  {
    id: 'anatomy',
    title: 'Anatomy & Body Systems',
    icon: 'fas fa-user-md',
    color: 'bg-blue-100 text-blue-800',
    description: 'Visual guides for understanding human anatomy and physiological processes'
  },
  {
    id: 'procedures',
    title: 'Care Procedures',
    icon: 'fas fa-clipboard-list',
    color: 'bg-green-100 text-green-800',
    description: 'Step-by-step visual guides for essential care procedures'
  },
  {
    id: 'equipment',
    title: 'Medical Equipment',
    icon: 'fas fa-stethoscope',
    color: 'bg-purple-100 text-purple-800',
    description: 'Visual references for medical devices and equipment usage'
  },
  {
    id: 'conditions',
    title: 'Health Conditions',
    icon: 'fas fa-heartbeat',
    color: 'bg-red-100 text-red-800',
    description: 'Visual representations of common health conditions and symptoms'
  },
  {
    id: 'communication',
    title: 'Communication Aids',
    icon: 'fas fa-comments',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Visual tools for effective patient communication'
  },
  {
    id: 'safety',
    title: 'Safety & Infection Control',
    icon: 'fas fa-shield-alt',
    color: 'bg-orange-100 text-orange-800',
    description: 'Visual guides for safety protocols and infection prevention'
  }
];

const sampleVisualAids = [
  {
    id: '1',
    title: 'Proper Hand Washing Technique',
    category: 'safety',
    type: 'diagram',
    description: 'Step-by-step visual guide showing proper hand hygiene technique',
    image: '/api/visual-aids/handwashing-steps.jpg',
    difficulty: 'Beginner',
    estimatedTime: '2 minutes'
  },
  {
    id: '2', 
    title: 'Patient Positioning for Bed Transfer',
    category: 'procedures',
    type: 'video',
    description: 'Visual demonstration of safe patient transfer techniques',
    image: '/api/visual-aids/patient-transfer.mp4',
    difficulty: 'Intermediate',
    estimatedTime: '5 minutes'
  },
  {
    id: '3',
    title: 'Blood Pressure Measurement',
    category: 'procedures',
    type: 'interactive',
    description: 'Interactive guide for accurate blood pressure measurement',
    image: '/api/visual-aids/bp-measurement.jpg',
    difficulty: 'Beginner',
    estimatedTime: '3 minutes'
  },
  {
    id: '4',
    title: 'Understanding Diabetes Symptoms',
    category: 'conditions',
    type: 'infographic',
    description: 'Visual overview of diabetes symptoms and management',
    image: '/api/visual-aids/diabetes-symptoms.jpg',
    difficulty: 'Intermediate',
    estimatedTime: '4 minutes'
  }
];

export default function VisualAidsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch visual aids
  const { data: visualAids, isLoading } = useQuery({
    queryKey: ['/api/visual-aids', selectedCategory, searchTerm],
    enabled: !!user,
  });

  // Fetch user's visual aid progress
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/user/visual-aids-progress'],
    enabled: !!user,
  });

  const filteredAids = sampleVisualAids.filter(aid => {
    const matchesCategory = selectedCategory === 'all' || aid.category === selectedCategory;
    const matchesSearch = aid.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aid.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'fas fa-play-circle';
      case 'diagram': return 'fas fa-image';
      case 'interactive': return 'fas fa-mouse-pointer';
      case 'infographic': return 'fas fa-chart-pie';
      default: return 'fas fa-file';
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <i className="fas fa-images text-4xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access visual learning aids.</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Visual Learning Aids</h1>
        <p className="text-gray-600">
          Enhance your understanding with interactive diagrams, videos, and visual guides designed for care workers.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search visual aids..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:border-[#907AD6] focus:ring-[#907AD6]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Button
            onClick={() => setSelectedCategory('all')}
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            className="whitespace-nowrap"
          >
            All Categories
          </Button>
          {visualAidCategories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
            >
              <i className={`${category.icon} mr-2`}></i>
              {category.title}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Aids</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
        </TabsList>

        {/* Browse Aids Tab */}
        <TabsContent value="browse" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <div className="aspect-video bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAids.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium mb-2">No visual aids found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 
                    `No results for "${searchTerm}". Try different keywords or browse categories.` :
                    'No visual aids available in this category.'
                  }
                </p>
                {searchTerm && (
                  <Button onClick={() => setSearchTerm('')} variant="outline">
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAids.map((aid) => (
                <Card key={aid.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-[#907AD6]/20 to-[#7FDEFF]/20 flex items-center justify-center">
                    <i className={`${getTypeIcon(aid.type)} text-4xl text-[#907AD6]`}></i>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{aid.title}</h3>
                      <i className={`${getTypeIcon(aid.type)} text-gray-400 ml-2`}></i>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{aid.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getDifficultyColor(aid.difficulty)}>
                        {aid.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <i className="fas fa-clock mr-1"></i>
                        {aid.estimatedTime}
                      </Badge>
                    </div>
                    
                    <Button className="w-full bg-[#907AD6] hover:bg-[#7B6BC7] text-white">
                      {aid.type === 'video' ? (
                        <>
                          <i className="fas fa-play mr-2"></i>Watch Video
                        </>
                      ) : aid.type === 'interactive' ? (
                        <>
                          <i className="fas fa-mouse-pointer mr-2"></i>Start Interactive
                        </>
                      ) : (
                        <>
                          <i className="fas fa-eye mr-2"></i>View Aid
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visualAidCategories.map((category) => {
              const categoryCount = sampleVisualAids.filter(aid => aid.category === category.id).length;
              
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${category.color}`}>
                      <i className={`${category.icon} text-2xl`}></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-center mb-2">{category.title}</h3>
                    <p className="text-sm text-gray-600 text-center mb-4">{category.description}</p>
                    
                    <div className="text-center">
                      <Badge variant="outline" className="mb-4">
                        {categoryCount} visual aid{categoryCount !== 1 ? 's' : ''}
                      </Badge>
                      <Button
                        onClick={() => {
                          setSelectedCategory(category.id);
                          // Switch to browse tab
                          const browseTab = document.querySelector('[value="browse"]') as HTMLButtonElement;
                          browseTab?.click();
                        }}
                        className="w-full"
                        variant="outline"
                      >
                        <i className="fas fa-arrow-right mr-2"></i>
                        Browse {category.title}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {progressLoading ? (
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
                    {visualAidCategories.map((category) => {
                      const categoryProgress = progress?.[category.id] || 0;
                      return (
                        <div key={category.id} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{category.title}</span>
                            <span className="text-sm text-gray-600">{categoryProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#907AD6] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${categoryProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-green-800">Completed: Hand Washing Technique</p>
                      <p className="text-sm text-green-600">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-800">Viewed: Patient Transfer Video</p>
                      <p className="text-sm text-blue-600">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-yellow-800">Started: Blood Pressure Guide</p>
                      <p className="text-sm text-yellow-600">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}