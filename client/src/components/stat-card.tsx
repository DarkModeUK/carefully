interface StatCardProps {
  value: string | number;
  label: string;
  icon: string;
  color: 'primary' | 'secondary' | 'accent' | 'neutral';
}

const colorClasses = {
  primary: 'bg-primary bg-opacity-20 text-primary',
  secondary: 'bg-secondary bg-opacity-20 text-secondary',
  accent: 'bg-accent bg-opacity-20 text-accent',
  neutral: 'bg-neutral-500 bg-opacity-20 text-neutral-500'
};

export function StatCard({ value, label, icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-2xl font-bold text-neutral-800">{value}</p>
          <p className="text-sm text-neutral-500">{label}</p>
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <i className={`${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );
}
