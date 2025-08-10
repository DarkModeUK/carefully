import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const forumCategories = [
  {
    id: 'general',
    title: 'General Discussion',
    description: 'Open discussions about care work and experiences',
    icon: 'fas fa-comments',
    color: 'bg-blue-100 text-blue-800',
    topics: 12
  },
  {
    id: 'scenarios',
    title: 'Scenario Help',
    description: 'Get help with specific training scenarios and challenges',
    icon: 'fas fa-question-circle',
    color: 'bg-green-100 text-green-800',
    topics: 8
  },
  {
    id: 'wellbeing',
    title: 'Wellbeing & Self-Care',
    description: 'Support and tips for maintaining mental health',
    icon: 'fas fa-heart',
    color: 'bg-pink-100 text-pink-800',
    topics: 15
  },
  {
    id: 'professional',
    title: 'Professional Development',
    description: 'Career advancement and skill building discussions',
    icon: 'fas fa-graduation-cap',
    color: 'bg-purple-100 text-purple-800',
    topics: 6
  }
];

export default function ForumsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('general');

  // Fetch forum topics
  const { data: topics, isLoading } = useQuery({
    queryKey: ['/api/forum/topics', selectedCategory !== 'all' ? selectedCategory : undefined],
    enabled: !!user,
  });

  // Create new topic mutation
  const createTopicMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/forum/topics', {
        title: newTopicTitle,
        content: newTopicContent,
        categoryId: newTopicCategory
      });
    },
    onSuccess: () => {
      toast({
        title: "Topic created",
        description: "Your new discussion topic has been created successfully.",
      });
      setShowNewTopic(false);
      setNewTopicTitle('');
      setNewTopicContent('');
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create topic. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopicTitle.trim() && newTopicContent.trim()) {
      createTopicMutation.mutate();
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <i className="fas fa-users text-4xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access the community forums.</p>
            <Button onClick={() => setLocation('/api/login')}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Forums</h1>
          <p className="text-gray-600">Connect with fellow care professionals and share experiences</p>
        </div>
        <Button 
          onClick={() => setShowNewTopic(true)}
          className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white"
        >
          <i className="fas fa-plus mr-2"></i>New Topic
        </Button>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        <Button
          onClick={() => setSelectedCategory('all')}
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
        >
          All Categories
        </Button>
        {forumCategories.map(category => (
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {forumCategories.map(category => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-[#907AD6] text-white' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-full ${
                      selectedCategory === category.id 
                        ? 'bg-white/20 text-white' 
                        : category.color
                    }`}>
                      <i className={`${category.icon} text-sm`}></i>
                    </div>
                    <Badge variant="outline" className={
                      selectedCategory === category.id ? 'border-white text-white' : ''
                    }>
                      {category.topics}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm mb-1">{category.title}</h3>
                  <p className={`text-xs ${
                    selectedCategory === category.id ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {category.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Topics List */}
        <div className="lg:col-span-3">
          {showNewTopic && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTopic} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Select value={newTopicCategory} onValueChange={setNewTopicCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {forumCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Topic Title</label>
                    <Input
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder="What would you like to discuss?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <Textarea
                      value={newTopicContent}
                      onChange={(e) => setNewTopicContent(e.target.value)}
                      placeholder="Share your thoughts, questions, or experiences..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      disabled={createTopicMutation.isPending}
                      className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white"
                    >
                      {createTopicMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>Creating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus mr-2"></i>Create Topic
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowNewTopic(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2 w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : topics && topics.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <i className="fas fa-comments text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
                <p className="text-gray-600 mb-4">
                  Be the first to start a conversation in this category.
                </p>
                <Button 
                  onClick={() => setShowNewTopic(true)}
                  className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white"
                >
                  <i className="fas fa-plus mr-2"></i>Start Discussion
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Sample topics */}
              {[
                {
                  id: '1',
                  title: 'How do you handle difficult family conversations?',
                  author: 'Sarah M.',
                  category: 'general',
                  replies: 12,
                  lastActivity: '2 hours ago',
                  isSticky: false
                },
                {
                  id: '2',
                  title: 'Dementia care scenario - need advice',
                  author: 'Michael R.',
                  category: 'scenarios',
                  replies: 8,
                  lastActivity: '4 hours ago',
                  isSticky: false
                },
                {
                  id: '3',
                  title: 'Self-care tips for night shift workers',
                  author: 'Emma K.',
                  category: 'wellbeing',
                  replies: 23,
                  lastActivity: '1 day ago',
                  isSticky: true
                }
              ].map(topic => {
                const category = forumCategories.find(c => c.id === topic.category);
                return (
                  <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {topic.isSticky && (
                              <Badge variant="outline" className="text-xs">
                                <i className="fas fa-thumbtack mr-1"></i>Sticky
                              </Badge>
                            )}
                            <Badge className={category?.color}>
                              <i className={`${category?.icon} mr-1`}></i>
                              {category?.title}
                            </Badge>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 mb-2">{topic.title}</h3>
                          
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <span>
                              <i className="fas fa-user mr-1"></i>
                              {topic.author}
                            </span>
                            <span>
                              <i className="fas fa-reply mr-1"></i>
                              {topic.replies} replies
                            </span>
                            <span>
                              <i className="fas fa-clock mr-1"></i>
                              {topic.lastActivity}
                            </span>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <i className="fas fa-arrow-right"></i>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}