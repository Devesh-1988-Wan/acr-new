import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'warning' | 'success' | 'danger';
  className?: string;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) => {
  const variantStyles = {
    default: 'bg-card',
    primary: 'bg-primary/5 border-primary/20',
    warning: 'bg-status-pending/5 border-status-pending/20',
    success: 'bg-status-approved/5 border-status-approved/20',
    danger: 'bg-status-critical/5 border-status-critical/20',
  };

  const iconStyles = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    warning: 'bg-status-pending/10 text-status-pending',
    success: 'bg-status-approved/10 text-status-approved',
    danger: 'bg-status-critical/10 text-status-critical',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 shadow-card transition-all duration-300 hover:shadow-lg',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-status-approved' : 'text-status-critical'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-3', iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
