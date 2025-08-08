interface SkillProgressProps {
  skills: Record<string, number>;
}

const skillLabels = {
  empathy: 'Empathy & Communication',
  conflict_resolution: 'Conflict Resolution',
  safeguarding: 'Safeguarding',
  decision_making: 'Decision Making'
};

const skillColors = {
  empathy: 'bg-secondary',
  conflict_resolution: 'bg-accent',
  safeguarding: 'bg-primary',
  decision_making: 'bg-red-400'
};

export function SkillProgress({ skills }: SkillProgressProps) {
  return (
    <div className="space-y-4">
      {Object.entries(skills).map(([skill, progress]) => (
        <div key={skill}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-neutral-700">
              {skillLabels[skill as keyof typeof skillLabels] || skill}
            </span>
            <span className="text-neutral-500">{progress}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${skillColors[skill as keyof typeof skillColors] || 'bg-neutral-400'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
