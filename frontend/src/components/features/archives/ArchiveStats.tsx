import { StatCardProps } from '@/components/shared/StatCard';
import { StatsGrid } from '@/components/shared/StatsGrid';
import { type Repair } from '@/types';

interface ArchiveStatsProps {
  className?: string;
  compact?: boolean;
  repairs: Repair[];
}

export const ArchiveStats: React.FC<ArchiveStatsProps> = ({ className = '', compact = false, repairs = [] }) => {
  const totalRevenue = repairs.reduce((sum, repair) => sum + (Number(repair.totalCost) || 0), 0);

  const avgRepairTime = repairs.length > 0
    ? repairs.reduce((sum, repair) => {
        if (repair.completedAt && repair.created_at) {
          const completedDate = typeof repair.completedAt === 'string' ? new Date(repair.completedAt) : repair.completedAt;
          const createdDate = typeof repair.created_at === 'string' ? new Date(repair.created_at) : repair.created_at;

          const days = Math.ceil((completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }
        return sum;
      }, 0) / repairs.length
    : 0;

  const deviceTypeCount = repairs.reduce(
    (acc, repair) => {
      const deviceType = repair.deviceType || 'unknown';
      acc[deviceType] = (acc[deviceType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const stats: StatCardProps[] = [
    {
      title: 'Réparations terminées',
      value: repairs.length,
      description: 'Total',
      color: 'default'
    },
    {
      title: 'Revenu total',
      value: `${totalRevenue.toFixed(2)} €`,
      description: 'Gains',
      color: 'success'
    },
    {
      title: 'Temps moyen',
      value: `${avgRepairTime.toFixed(1)} jours`,
      description: 'Délai réparation',
      color: 'primary'
    },
    {
      title: 'Smartphones',
      value: deviceTypeCount["smartphone"] || 0,
      description: 'Réparés',
      color: 'default'
    },
    {
      title: 'Tablettes',
      value: deviceTypeCount["tablet"] || 0,
      description: 'Réparées',
      color: 'default'
    },
    {
      title: 'Ordinateurs',
      value: deviceTypeCount["computer"] || 0,
      description: 'Réparés',
      color: 'default'
    }
  ];

  return <StatsGrid stats={stats} className={className} compact={compact} />;
};