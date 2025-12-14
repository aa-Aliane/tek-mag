import React from 'react';
import { StatCard, type StatCardProps } from './StatCard';

interface StatsGridProps {
  stats: StatCardProps[];
  layout?: 'auto' | 'row' | 'column';
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  layout = 'auto',
  className = ''
}) => {
  const getGridClass = () => {
    switch (layout) {
      case 'row':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
      case 'column':
        return 'grid-cols-1';
      default:
        // Responsive based on number of stats
        if (stats.length === 1) return 'grid-cols-1';
        if (stats.length === 2) return 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-2';
        if (stats.length === 3) return 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3';
        if (stats.length === 4) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
    }
  };

  return (
    <div className={`grid ${getGridClass()} gap-3 sm:gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;