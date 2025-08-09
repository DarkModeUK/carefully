import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import type { Scenario } from "@shared/schema";
import { memo } from "react";

interface ScenarioCardProps {
  scenario: Scenario;
  onClick?: () => void;
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

const difficultyIcons = {
  beginner: 'fas fa-seedling',
  intermediate: 'fas fa-graduation-cap',
  advanced: 'fas fa-trophy'
};

const categoryLabels: Record<string, string> = {
  dementia_care: 'Dementia Care',
  family_communication: 'Family Communication',
  medication_management: 'Medication Management',
  end_of_life: 'End of Life Care',
  safeguarding: 'Safeguarding'
};

export const ScenarioCard = memo(({ scenario, onClick }: ScenarioCardProps) => {
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setLocation(`/simulation/${scenario.id}`);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <Badge className={`flex items-center gap-1 ${priorityConfig[scenario.priority as keyof typeof priorityConfig].color}`}>
            <i className={`${priorityConfig[scenario.priority as keyof typeof priorityConfig].icon} text-xs`}></i>
            <span className="capitalize font-medium">{scenario.priority}</span>
          </Badge>
          <div className="flex items-center gap-2 text-neutral-500">
            <i className={difficultyIcons[scenario.difficulty as keyof typeof difficultyIcons]}></i>
            <span className="text-sm capitalize">{scenario.difficulty}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-neutral-800 mb-2 line-clamp-2">
          {scenario.title}
        </h3>
        
        <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
          {scenario.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <div className="flex items-center gap-1">
              <i className="fas fa-clock"></i>
              <span>{scenario.estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <i className="fas fa-tag"></i>
              <span>{categoryLabels[scenario.category] || scenario.category}</span>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={(e) => {
            e.stopPropagation();
            setLocation(`/simulation/${scenario.id}`);
          }}>
            Start Training
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});