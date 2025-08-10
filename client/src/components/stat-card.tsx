import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'secondary' | 'accent' | 'neutral';
  subtitle?: string; // Quick Win: Subtitle support for streak details
}

const colorClasses = {
  primary: 'bg-[#907AD6] bg-opacity-20 text-[#907AD6]',
  secondary: 'bg-[#7FDEFF] bg-opacity-20 text-[#2C2A4A]',
  accent: 'bg-[#DABFFF] bg-opacity-20 text-[#4F518C]',
  neutral: 'bg-[#4F518C] bg-opacity-20 text-[#4F518C]'
};

export function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card className="hover-lift transition-all duration-300 hover:shadow-lg hover-glow btn-press stagger-item fade-in-up cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`rounded-full w-12 h-12 flex items-center justify-center ${colorClasses[color]} hover-wobble transition-all duration-300 float-animation group-hover:scale-110`}>
            <i className={`${icon} text-lg transition-transform duration-300 group-hover:rotate-12`}></i>
          </div>
          <div>
            <p className="text-sm text-neutral-600 transition-colors duration-300 group-hover:text-neutral-800">{title}</p>
            <p className="text-2xl font-bold text-neutral-800 transition-all duration-300 group-hover:scale-105 group-hover:text-primary">{value}</p>
            {subtitle && (
              <p className="text-xs text-neutral-500 mt-1 transition-colors duration-300 group-hover:text-neutral-600">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}