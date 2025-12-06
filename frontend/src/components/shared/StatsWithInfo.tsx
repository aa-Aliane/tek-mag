import React from 'react';
import { SimpleStatsGrid } from '@/components/shared/SimpleStatsGrid';
import { StatCardProps } from '@/components/shared/StatCard';

interface StatsWithInfoProps {
  stats: StatCardProps[];
  infoElement?: React.ReactNode;
  className?: string;
}

export const StatsWithInfo: React.FC<StatsWithInfoProps> = ({
  stats,
  infoElement,
  className = ''
}) => {
  return (
    <div className={`flex flex-col lg:flex-row gap-2 ${className}`}>
      <div className="flex-1">
        <SimpleStatsGrid stats={stats} />
      </div>
      {infoElement && (
        <div className="lg:w-80 flex items-center">
          {infoElement}
        </div>
      )}
    </div>
  );
};

export default StatsWithInfo;