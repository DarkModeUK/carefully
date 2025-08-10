import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Scenario, UserScenario } from "@shared/schema";
import { memo, useState } from "react";

interface ScenarioCardProps {
  scenario: Scenario;
  onClick?: () => void;
  isBookmarked?: boolean; // Quick Win: Scenario bookmarking
  showBookmark?: boolean;
  userScenario?: UserScenario; // Progress status information
}

const priorityConfig = {
  high: {
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: 'fas fa-exclamation-triangle',
    label: 'High Priority'
  },
  medium: {
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: 'fas fa-minus-circle',
    label: 'Medium Priority'
  },
  low: {
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: 'fas fa-check-circle',
    label: 'Low Priority'
  }
};

const difficultyConfig = {
  beginner: {
    icon: 'fas fa-seedling',
    color: 'bg-green-100 text-green-700 border-green-200',
    label: 'Beginner'
  },
  intermediate: {
    icon: 'fas fa-graduation-cap', 
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    label: 'Intermediate'
  },
  advanced: {
    icon: 'fas fa-trophy',
    color: 'bg-red-100 text-red-700 border-red-200', 
    label: 'Advanced'
  }
};

const categoryLabels: Record<string, string> = {
  dementia_care: 'Dementia Care',
  family_communication: 'Family Communication',
  medication_management: 'Medication Management',
  end_of_life: 'End of Life Care',
  safeguarding: 'Safeguarding'
};

const statusConfig = {
  not_started: {
    label: 'Not Started',
    color: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    icon: 'fas fa-play-circle',
    buttonText: 'Start Training'
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: 'fas fa-spinner',
    buttonText: 'Continue'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: 'fas fa-check-circle',
    buttonText: 'Review Results'
  }
};

export const ScenarioCard = memo(({ scenario, onClick, isBookmarked = false, showBookmark = true, userScenario }: ScenarioCardProps) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  
  // Determine the progress status
  const status = userScenario?.status || 'not_started';
  const progress = userScenario?.progress || 0;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setLocation(`/simulation/${scenario.id}`);
    }
  };

  // Quick Win: Bookmark functionality
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/scenarios/${scenario.id}/bookmark`, {
        bookmarked: !bookmarked
      });
    },
    onSuccess: () => {
      setBookmarked(!bookmarked);
      toast({
        title: bookmarked ? "Bookmark removed" : "Scenario bookmarked",
        description: bookmarked 
          ? "Scenario removed from your bookmarks" 
          : "Scenario saved to your bookmarks for easy access",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    bookmarkMutation.mutate();
  };

  return (
    <Card className="hover-lift transition-all duration-300 hover:shadow-lg hover-glow cursor-pointer relative stagger-item fade-in-up group btn-press" onClick={handleClick}>
      <CardContent className="p-4 sm:p-6">
        {/* Quick Win: Bookmark button */}
        {showBookmark && (
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 p-2 h-8 w-8 hover-bounce transition-all duration-300 ${
              bookmarked ? 'text-yellow-500 hover:text-yellow-600 hover-pulse' : 'text-gray-400 hover:text-yellow-500'
            }`}
            onClick={handleBookmarkClick}
            disabled={bookmarkMutation.isPending}
            title={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
          >
            <i className={`fas ${bookmarked ? 'fa-bookmark' : 'fa-bookmark-o'} text-sm transition-transform duration-300 hover:scale-110`}></i>
          </Button>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3 pr-6 sm:pr-8">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className={`flex items-center gap-1 ${priorityConfig[scenario.priority as keyof typeof priorityConfig].color} transition-all duration-300 hover:scale-105 hover-bounce text-xs`}>
              <i className={`${priorityConfig[scenario.priority as keyof typeof priorityConfig].icon} text-xs transition-transform duration-300 group-hover:rotate-12`}></i>
              <span className="capitalize font-medium">{scenario.priority}</span>
            </Badge>
            {/* Progress status badge */}
            <Badge className={`flex items-center gap-1 ${statusConfig[status as keyof typeof statusConfig].color} transition-all duration-300 hover:scale-105 hover-bounce text-xs`}>
              <i className={`${statusConfig[status as keyof typeof statusConfig].icon} text-xs transition-transform duration-300 ${status === 'in_progress' ? 'fa-spin' : 'group-hover:rotate-12'}`}></i>
              <span className="text-xs font-medium">{statusConfig[status as keyof typeof statusConfig].label}</span>
            </Badge>
          </div>
          {/* Quick Win: Enhanced difficulty tags */}
          <Badge className={`flex items-center gap-1 ${difficultyConfig[scenario.difficulty as keyof typeof difficultyConfig].color} transition-all duration-300 hover:scale-105 hover-bounce float-animation text-xs self-start`}>
            <i className={`${difficultyConfig[scenario.difficulty as keyof typeof difficultyConfig].icon} text-xs transition-transform duration-300 group-hover:rotate-12`}></i>
            <span className="text-xs font-medium">{difficultyConfig[scenario.difficulty as keyof typeof difficultyConfig].label}</span>
          </Badge>
        </div>
        
        <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
          {scenario.title}
        </h3>
        
        <p className="text-xs sm:text-sm text-neutral-600 mb-4 line-clamp-3 group-hover:text-neutral-800 transition-colors duration-300 leading-relaxed">
          {scenario.description}
        </p>
        
        {/* Progress bar for in-progress scenarios */}
        {status === 'in_progress' && progress > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-neutral-500 group-hover:text-neutral-700 transition-colors duration-300">
            <div className="flex items-center gap-1 hover-bounce">
              <i className="fas fa-clock transition-transform duration-300 hover:scale-110"></i>
              <span>{scenario.estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-1 hover-bounce">
              <i className="fas fa-tag transition-transform duration-300 hover:scale-110"></i>
              <span className="truncate">{categoryLabels[scenario.category] || scenario.category}</span>
            </div>
          </div>
          
          <Button 
            variant={status === 'completed' ? 'default' : 'outline'} 
            size="sm" 
            className={`transition-all duration-300 hover-glow btn-press btn-ripple group-hover:scale-105 shrink-0 ${
              status === 'completed' ? 'bg-green-600 hover:bg-green-700 text-white' :
              status === 'in_progress' ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' :
              ''
            }`} 
            onClick={(e) => {
              e.stopPropagation();
              if (status === 'completed') {
                setLocation(`/simulation/${scenario.id}/results`);
              } else {
                setLocation(`/simulation/${scenario.id}`);
              }
            }}
          >
            <span className="text-xs sm:text-sm">{statusConfig[status as keyof typeof statusConfig].buttonText}</span>
            <i className={`fas ${
              status === 'completed' ? 'fa-eye' : 
              status === 'in_progress' ? 'fa-play' : 
              'fa-arrow-right'
            } ml-1 transition-transform duration-300 group-hover:translate-x-1`}></i>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});