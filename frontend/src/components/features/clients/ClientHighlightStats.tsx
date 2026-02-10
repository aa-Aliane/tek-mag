import { StatCardProps } from '@/components/shared/StatCard';
import { SimpleStatsGrid } from '@/components/shared/SimpleStatsGrid';
import { useClients } from '@/hooks/use-clients';
import { useRepairs } from '@/hooks/use-repairs';

interface ClientHighlightStatsProps {
  className?: string;
}

export const ClientHighlightStats: React.FC<ClientHighlightStatsProps> = ({ className = '' }) => {
  const { data: clientsData } = useClients();
  const { data: repairsData } = useRepairs();

  const clients = clientsData?.results || [];
  const repairs = repairsData?.results || [];

  // Calculate client metrics
  const activeClients = clients.filter((c) => repairs.some((r) => r.client.id === c.id));
  const totalRepairsForActive = activeClients.reduce((sum, client) => {
    const clientRepairs = repairs.filter(r => r.client.id === client.id);
    return sum + clientRepairs.length;
  }, 0);
  const avgRepairsPerActiveClient = activeClients.length > 0 ? (totalRepairsForActive / activeClients.length).toFixed(1) : "0.0";

  // Calculate client retention (returning clients)
  const returningClients = activeClients.filter(client =>
    repairs.filter(r => r.client.id === client.id).length > 1
  );

  const stats: StatCardProps[] = [
    {
      title: 'Total',
      value: clients.length,
      color: 'default'
    },
    {
      title: 'Actifs',
      value: activeClients.length,
      color: 'success'
    },
    {
      title: 'Récurrence',
      value: `${((returningClients.length / (activeClients.length || 1)) * 100).toFixed(0)}%`,
      color: 'primary'
    },
    {
      title: 'Avg/Rép',
      value: avgRepairsPerActiveClient,
      color: 'warning'
    }
  ];

  return <SimpleStatsGrid stats={stats} className={className} />;
};