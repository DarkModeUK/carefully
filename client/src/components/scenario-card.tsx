import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import type { Scenario } from "@shared/schema";

interface ScenarioCardProps {
  scenario: Scenario;
  onClick?: () => void;
}

const priorityColors = {
  high: 'bg-brand-light-purple text-brand-dark',
  medium: 'bg-brand-cyan text-brand-dark',
  low: 'bg-brand-purple bg-opacity-20 text-brand-medium'
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

export function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setLocation(`/scenarios/${scenario.id}`);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <Badge className={priorityColors[scenario.priority as keyof typeof priorityColors]}>
            {scenario.priority}
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
            handleClick();
          }}>
            Start
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}