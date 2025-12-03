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
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  };

  const IconComponent = Icons[icon];

  return (
    <div
      className={`p-4 rounded-lg border ${colorClasses[color]} transition-colors`}
    >
      <div className="flex items-center gap-2 mb-1">
        <IconComponent className="flex-shrink-0" size={20} />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        {unit && <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>}
      </div>
    </div>
  );
}
