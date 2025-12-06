import { StatCardProps } from '@/components/shared/StatCard';
import { SimpleStatsGrid } from '@/components/shared/SimpleStatsGrid';
import { mockArchivedRepairs } from '@/lib/data';

interface ArchiveHighlightStatsProps {
  className?: string;
}

export const ArchiveHighlightStats: React.FC<ArchiveHighlightStatsProps> = ({ className = '' }) => {
  // Calculate archive metrics
  const totalRevenue = mockArchivedRepairs.reduce((sum, repair) => sum + (repair.totalCost || 0), 0);
  const avgRepairValue = mockArchivedRepairs.length > 0 ? (totalRevenue / mockArchivedRepairs.length).toFixed(2) : "0.00";
  const avgRepairTime = mockArchivedRepairs.length > 0
    ? (mockArchivedRepairs.reduce((sum, repair) => {
        if (repair.completedAt && repair.createdAt) {
          const days = Math.ceil((repair.completedAt.getTime() - repair.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }
        return sum;
      }, 0) / mockArchivedRepairs.length).toFixed(1)
    : "0.0";

  const successfulRepairs = mockArchivedRepairs.filter(repair => repair.status === 'prete').length;
  const successRate = mockArchivedRepairs.length > 0
    ? ((successfulRepairs / mockArchivedRepairs.length) * 100).toFixed(0)
    : "0";

  const stats: StatCardProps[] = [
    {
      title: 'Terminées',
      value: mockArchivedRepairs.length,
      color: 'default'
    },
    {
      title: 'Revenu',
      value: `${totalRevenue.toFixed(0)}€`,
      color: 'success'
    },
    {
      title: '€/Rép',
      value: `${avgRepairValue}€`,
      color: 'primary'
    },
    {
      title: 'Taux succès',
      value: `${successRate}%`,
      color: 'warning'
    }
  ];

  return <SimpleStatsGrid stats={stats} className={className} />;
};