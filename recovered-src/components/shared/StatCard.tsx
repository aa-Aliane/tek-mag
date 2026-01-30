// src/components/shared/StatCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: 'default' | 'primary' | 'warning' | 'destructive' | 'success' | 'muted';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  color = 'default',
  className
}) => {
  const colorClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    warning: 'text-warning',
    destructive: 'text-destructive',
    success: 'text-green-600',
    muted: 'text-muted-foreground'
  };

  return (
    <Card className={cn("overflow-hidden h-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && <div>{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-xl sm:text-2xl font-bold", colorClasses[color])}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p className={`flex items-center text-xs mt-1 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
            <span>{trend.value}</span>
            <span className="ml-1">{trend.positive ? '↑' : '↓'}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;