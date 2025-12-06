import { StatCardProps } from '@/components/shared/StatCard';
import { StatsGrid } from '@/components/shared/StatsGrid';
import { useRepairs } from '@/hooks/use-repairs';

interface RepairStatsProps {
  className?: string;
  compact?: boolean;
}

export const RepairStats: React.FC<RepairStatsProps> = ({ className = '', compact = false }) => {
  const { data } = useRepairs(1, undefined, { enabled: true });

  const repairs = data?.results || [];
  const stats: StatCardProps[] = [
    {
      title: 'Total',
      value: repairs.length,
      description: 'Réparations',
      color: 'default'
    },
    {
      title: 'Saisies',
      value: repairs.filter((r) => r.status === 'saisie').length,
      description: 'Nouvelles réparations',
      color: 'primary'
    },
    {
      title: 'En cours',
      value: repairs.filter((r) => r.status === 'en-cours').length,
      description: 'En réparation',
      color: 'warning'
    },
    {
      title: 'Prêtes',
      value: repairs.filter((r) => r.status === 'prete').length,
      description: 'Prêtes au retrait',
      color: 'success'
    },
    {
      title: 'En attente',
      value: repairs.filter((r) => r.status === 'en-attente').length,
      description: 'Pièces manquantes',
      color: 'warning'
    }
  ];

  return <StatsGrid stats={stats} className={className} compact={compact} />;
};