import { StatCardProps } from '@/components/shared/StatCard';
import { StatsGrid } from '@/components/shared/StatsGrid';
import { useClients } from '@/hooks/use-clients';
import { useRepairs } from '@/hooks/use-repairs';

interface ClientStatsProps {
  className?: string;
  compact?: boolean;
}

export const ClientStats: React.FC<ClientStatsProps> = ({ className = '', compact = false }) => {
  const { data: clientsData } = useClients();
  const { data: repairsData } = useRepairs();

  const clients = clientsData?.results || [];
  const repairs = repairsData?.results || [];

  const stats: StatCardProps[] = [
    {
      title: 'Total clients',
      value: clients.length,
      description: 'Clients enregistrés',
      color: 'default'
    },
    {
      title: 'Avec réparations',
      value: clients.filter((c) => repairs.some((r) => r.client.id === c.id)).length,
      description: 'Ayant des réparations',
      color: 'primary'
    }
  ];

  return <StatsGrid stats={stats} className={className} compact={compact} />;
};