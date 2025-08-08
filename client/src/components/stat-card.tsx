import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'secondary' | 'accent' | 'neutral';
}

const colorClasses = {
  primary: 'bg-primary bg-opacity-20 text-primary',
  secondary: 'bg-secondary bg-opacity-20 text-secondary',
  accent: 'bg-brand-light-purple bg-opacity-20 text-brand-medium',
  neutral: 'bg-brand-medium bg-opacity-20 text-brand-medium'
};

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`rounded-full w-12 h-12 flex items-center justify-center ${colorClasses[color]}`}>
            <i className={`${icon} text-lg`}></i>
          </div>
          <div>
            <p className="text-sm text-neutral-600">{title}</p>
            <p className="text-2xl font-bold text-neutral-800">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}