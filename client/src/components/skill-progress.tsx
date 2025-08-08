import { Progress } from "@/components/ui/progress";

const skillLabels: Record<string, string> = {
  empathy: 'Empathy & Compassion',
  conflict_resolution: 'Conflict Resolution',
  safeguarding: 'Safeguarding',
  decision_making: 'Decision Making'
};

const skillColors = {
  empathy: 'bg-secondary',
  conflict_resolution: 'bg-brand-light-purple',
  safeguarding: 'bg-primary',
  decision_making: 'bg-brand-medium'
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
              {skillLabels[skill] || skill}
            </span>
            <span className="text-sm text-neutral-500">{level}%</span>
          </div>
          <div className="relative">
            <Progress value={level} className="h-3" />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all ${skillColors[skill as keyof typeof skillColors] || 'bg-neutral-400'}`}
              style={{ width: `${level}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}