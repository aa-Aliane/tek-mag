import { StatCardProps } from '@/components/shared/StatCard';
import { StatsGrid } from '@/components/shared/StatsGrid';
import { mockArchivedRepairs } from '@/lib/data';

interface ArchiveStatsProps {
  className?: string;
  compact?: boolean;
}

export const ArchiveStats: React.FC<ArchiveStatsProps> = ({ className = '', compact = false }) => {
  const totalRevenue = mockArchivedRepairs.reduce((sum, repair) => sum + (repair.totalCost || 0), 0);

  const avgRepairTime =
    mockArchivedRepairs.reduce((sum, repair) => {
      if (repair.completedAt && repair.createdAt) {
        const days = Math.ceil((repair.completedAt.getTime() - repair.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }
      return sum;
    }, 0) / mockArchivedRepairs.length;

  const deviceTypeCount = mockArchivedRepairs.reduce(
    (acc, repair) => {
      acc[repair.deviceType] = (acc[repair.deviceType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const stats: StatCardProps[] = [
    {
      title: 'Réparations terminées',
      value: mockArchivedRepairs.length,
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