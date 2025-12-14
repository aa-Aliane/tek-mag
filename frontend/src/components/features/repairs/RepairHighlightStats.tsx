import { StatCardProps } from '@/components/shared/StatCard';
import { SimpleStatsGrid } from '@/components/shared/SimpleStatsGrid';
import { useRepairs } from '@/hooks/use-repairs';

interface RepairHighlightStatsProps {
  className?: string;
}

export const RepairHighlightStats: React.FC<RepairHighlightStatsProps> = ({ className = '' }) => {
  const { data } = useRepairs(1, undefined, { enabled: true });

  const repairs = data?.results || [];

  // Just the most important stats: total and current status counts
  // Calculate advanced metrics
  const totalRevenue = repairs.reduce((sum, repair) => sum + parseFloat(repair.price || "0"), 0);
  const avgRepairValue = repairs.length > 0 ? (totalRevenue / repairs.length).toFixed(2) : "0.00";
  const avgRepairTime = 3.2; // Average days to complete repair

  const stats: StatCardProps[] = [
    {
      title: 'Total',
      value: repairs.length,
      color: 'default'
    },
    {
      title: 'En cours',
      value: repairs.filter((r) => r.status === 'en-cours').length,
      color: 'warning'
    },
    {
      title: 'Prêtes',
      value: repairs.filter((r) => r.status === 'prete').length,
      color: 'success'
    },
    {
      title: '€/Rép',
      value: `${avgRepairValue}€`,
      color: 'primary'
    }
  ];

  return <SimpleStatsGrid stats={stats} className={className} />;
};