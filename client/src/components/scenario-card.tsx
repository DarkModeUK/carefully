import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Scenario } from "@shared/schema";
import { memo, useState } from "react";

interface ScenarioCardProps {
  scenario: Scenario;
  onClick?: () => void;
  isBookmarked?: boolean; // Quick Win: Scenario bookmarking
  showBookmark?: boolean;
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

export const ScenarioCard = memo(({ scenario, onClick, isBookmarked = false, showBookmark = true }: ScenarioCardProps) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  
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
      <CardContent className="p-6">
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
        
        <div className="flex items-start justify-between mb-3 pr-8">
          <Badge className={`flex items-center gap-1 ${priorityConfig[scenario.priority as keyof typeof priorityConfig].color} transition-all duration-300 hover:scale-105 hover-bounce`}>
            <i className={`${priorityConfig[scenario.priority as keyof typeof priorityConfig].icon} text-xs transition-transform duration-300 group-hover:rotate-12`}></i>
            <span className="capitalize font-medium">{scenario.priority}</span>
          </Badge>
          {/* Quick Win: Enhanced difficulty tags */}
          <Badge className={`flex items-center gap-1 ${difficultyConfig[scenario.difficulty as keyof typeof difficultyConfig].color} transition-all duration-300 hover:scale-105 hover-bounce float-animation`}>
            <i className={`${difficultyConfig[scenario.difficulty as keyof typeof difficultyConfig].icon} text-xs transition-transform duration-300 group-hover:rotate-12`}></i>
            <span className="text-sm font-medium">{difficultyConfig[scenario.difficulty as keyof typeof difficultyConfig].label}</span>
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold text-neutral-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {scenario.title}
        </h3>
        
        <p className="text-sm text-neutral-600 mb-4 line-clamp-3 group-hover:text-neutral-800 transition-colors duration-300">
          {scenario.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-neutral-500 group-hover:text-neutral-700 transition-colors duration-300">
            <div className="flex items-center gap-1 hover-bounce">
              <i className="fas fa-clock transition-transform duration-300 hover:scale-110"></i>
              <span>{scenario.estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-1 hover-bounce">
              <i className="fas fa-tag transition-transform duration-300 hover:scale-110"></i>
              <span>{categoryLabels[scenario.category] || scenario.category}</span>
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="transition-all duration-300 hover-glow btn-press btn-ripple group-hover:scale-105" onClick={(e) => {
            e.stopPropagation();
            setLocation(`/simulation/${scenario.id}`);
          }}>
            Start Training <i className="fas fa-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});