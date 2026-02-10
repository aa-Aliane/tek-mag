import { StatCardProps } from '@/components/shared/StatCard';
import { StatsGrid } from '@/components/shared/StatsGrid';
import { useStoreOrders } from '@/hooks/use-store-orders';

interface OrderStatsProps {
  className?: string;
  compact?: boolean;
}

export const OrderStats: React.FC<OrderStatsProps> = ({ className = '', compact = false }) => {
  const { data } = useStoreOrders();
  const orders = data?.results || [];

  const stats: StatCardProps[] = [
    {
      title: 'Total commandes',
      value: orders.length,
      description: 'Commandes passées',
      color: 'default'
    },
    {
      title: 'En attente',
      value: orders.filter((o) => o.status === 'pending').length,
      description: 'Non confirmées',
      color: 'warning'
    },
    {
      title: 'Commandées',
      value: orders.filter((o) => o.status === 'ordered').length,
      description: 'En cours de livraison',
      color: 'primary'
    },
    {
      title: 'Reçues',
      value: orders.filter((o) => o.status === 'received').length,
      description: 'Disponibles',
      color: 'success'
    }
  ];

  return <StatsGrid stats={stats} className={className} compact={compact} />;
};