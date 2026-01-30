import React from 'react';
import { cn } from '@/lib/utils';

interface SimpleStatCardProps {
  title: string;
  value: string | number;
  color?: 'default' | 'primary' | 'warning' | 'destructive' | 'success' | 'muted';
  className?: string;
}

const SimpleStatCard: React.FC<SimpleStatCardProps> = ({
  title,
  value,
  color = 'default',
  className = ''
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
    <div className={cn("flex flex-col items-start justify-center h-full px-4 py-3", className)}>
      <div className="mb-1">
        <span className={cn("text-lg sm:text-xl font-semibold", colorClasses[color])}>
          {value}
        </span>
      </div>
      <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">
        {title}
      </span>
    </div>
  );
};

export default SimpleStatCard;