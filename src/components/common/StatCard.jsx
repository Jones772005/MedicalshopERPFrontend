import { Card, CardContent } from './Card';
import { cn } from '../../utils/cn';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{title}</p>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h4>
          </div>
          {Icon && (
            <div className={cn(
              "p-3 rounded-lg flex items-center justify-center",
              color === 'primary' && "bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400",
              color === 'success' && "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
              color === 'warning' && "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400",
              color === 'danger' && "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
            )}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span className={cn(
              "font-medium mr-2",
              trend === 'up' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </span>
            <span className="text-gray-500 dark:text-slate-400">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
