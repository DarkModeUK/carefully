import { Badge } from "@/components/ui/badge";
import type { Scenario } from "@shared/schema";

interface ScenarioCardProps {
  scenario: Scenario;
  onClick: () => void;
}

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800'
};

const difficultyIcons = {
  beginner: 'fas fa-leaf',
  intermediate: 'fas fa-users',
  advanced: 'fas fa-heart'
};

export function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
  return (
    <div 
      className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Badge className={`mr-2 text-xs ${priorityColors[scenario.priority as keyof typeof priorityColors]}`}>
              {scenario.priority === 'high' ? 'High Priority' : 
               scenario.priority === 'medium' ? 'Recommended' : 'New'}
            </Badge>
            <span className="text-xs text-neutral-500">{scenario.estimatedTime} mins</span>
          </div>
          <h4 className="font-medium text-neutral-800 mb-1">{scenario.title}</h4>
          <p className="text-sm text-neutral-500 mb-2">{scenario.description}</p>
          <div className="flex items-center text-xs text-neutral-500">
            <i className={`${difficultyIcons[scenario.difficulty as keyof typeof difficultyIcons]} mr-1`}></i>
            <span className="capitalize">{scenario.difficulty} Level</span>
          </div>
        </div>
        <div className="ml-4">
          <i className="fas fa-chevron-right text-neutral-400"></i>
        </div>
      </div>
    </div>
  );
}
