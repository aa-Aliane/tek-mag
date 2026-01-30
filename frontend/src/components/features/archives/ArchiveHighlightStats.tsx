import { StatCardProps } from '@/components/shared/StatCard';
import { SimpleStatsGrid } from '@/components/shared/SimpleStatsGrid';
import { type Repair } from '@/types';

interface ArchiveHighlightStatsProps {
  className?: string;
  repairs?: Repair[];
}

export const ArchiveHighlightStats: React.FC<ArchiveHighlightStatsProps> = ({ className = '', repairs = [] }) => {
  // Calculate archive metrics
  const totalRevenue = repairs.reduce((sum, repair) => sum + (Number(repair.totalCost) || 0), 0);
  const avgRepairValue = repairs.length > 0 ? (totalRevenue / repairs.length).toFixed(2) : "0.00";
  const avgRepairTime = repairs.length > 0
    ? (repairs.reduce((sum, repair) => {
        if (repair.completedAt && repair.created_at) {
          const completedDate = typeof repair.completedAt === 'string' ? new Date(repair.completedAt) : repair.completedAt;
          const createdDate = typeof repair.created_at === 'string' ? new Date(repair.created_at) : repair.created_at;

          const days = Math.ceil((completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }
        return sum;
      }, 0) / repairs.length).toFixed(1)
    : "0.0";

  const successfulRepairs = repairs.filter(repair => repair.status === 'prete').length;
  const successRate = repairs.length > 0
    ? ((successfulRepairs / repairs.length) * 100).toFixed(0)
    : "0";

  const stats: StatCardProps[] = [
    {
      title: 'Terminées',
      value: repairs.length,
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