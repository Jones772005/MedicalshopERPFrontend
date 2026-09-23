import { Card, CardContent } from './Card';
import { cn } from '../../utils/cn';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm font-medium text-[#64748B] dark:text-slate-400 mb-1">{title}</p>
            <h4 className="text-2xl font-bold text-[#162033] dark:text-white">{value}</h4>
          </div>
          {Icon && (
            <div className={cn(
              "p-2 rounded-lg flex items-center justify-center",
              color === 'primary' && "bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400",
              color === 'info' && "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
              color === 'success' && "bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400",
              color === 'warning' && "bg-yellow-50 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400",
              color === 'danger' && "bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400",
            )}>
              <Icon className="w-5 h-5" />
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
            <span className="text-[#64748B] dark:text-slate-400">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
