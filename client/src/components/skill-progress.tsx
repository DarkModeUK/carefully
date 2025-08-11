import { Progress } from "@/components/ui/progress";

const skillLabels: Record<string, string> = {
  empathy: 'Empathy & Compassion',
  communication: 'Communication Skills',
  professionalism: 'Professionalism',
  problemSolving: 'Problem Solving',
  decisionMaking: 'Decision Making',
  conflictResolution: 'Conflict Resolution',
  conflict_resolution: 'Conflict Resolution',
  safeguarding: 'Safeguarding',
  decision_making: 'Decision Making',
  // Handle snake_case to human readable conversion
  problem_solving: 'Problem Solving'
};

const skillColors = {
  empathy: 'bg-secondary',
  communication: 'bg-primary', 
  professionalism: 'bg-accent',
  problemSolving: 'bg-secondary',
  decisionMaking: 'bg-primary',
  conflictResolution: 'bg-accent',
  conflict_resolution: 'bg-accent',
  safeguarding: 'bg-primary',
  decision_making: 'bg-primary',
  problem_solving: 'bg-secondary'
};

interface SkillProgressProps {
  skills: Record<string, number>;
}

export function SkillProgress({ skills }: SkillProgressProps) {
  return (
    <div className="space-y-4">
      {Object.entries(skills).map(([skill, level]) => (
        <div key={skill} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">
              {skillLabels[skill] || skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className="text-sm text-neutral-500">{level}%</span>
          </div>
          <div className="relative">
            <Progress value={level} className="h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}