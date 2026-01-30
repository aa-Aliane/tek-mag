import React from 'react';
import SimpleStatCard from './SimpleStatCard';
import { StatCardProps } from './StatCard'; // Reusing the interface

interface SimpleStatsGridProps {
  stats: StatCardProps[];
  className?: string;
}

export const SimpleStatsGrid: React.FC<SimpleStatsGridProps> = ({
  stats,
  className = ''
}) => {
  return (
    <div className={`flex items-center bg-white rounded-lg border border-gray-200 w-full ${className}`} style={{ height: '86px' }}>
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center justify-center flex-1 h-full">
            <SimpleStatCard
              title={stat.title}
              value={stat.value}
              color={stat.color}
            />
          </div>
          {index < stats.length - 1 && (
            <div
              className="w-px h-11 self-center border-l border-gray-300"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SimpleStatsGrid;