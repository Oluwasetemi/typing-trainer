import { Icons } from '../../utils/icons';

type StatCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  icon: keyof typeof Icons;
  color?: 'blue' | 'green' | 'red' | 'yellow';
};

export default function StatCard({
  label,
  value,
  unit,
  icon,
  color = 'blue',
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    green: 'bg-green-50 text-green-800 border-green-200',
    red: 'bg-red-50 text-red-800 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  };

  const IconComponent = Icons[icon];

  return (
    <div
      className={`p-4 rounded-lg border ${colorClasses[color]} transition-colors`}
    >
      <div className="flex items-center gap-2 mb-1">
        <IconComponent className="flex-shrink-0" size={20} />
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}
