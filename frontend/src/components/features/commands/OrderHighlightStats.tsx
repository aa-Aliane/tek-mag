import { StatCardProps } from '@/components/shared/StatCard';
import { SimpleStatsGrid } from '@/components/shared/SimpleStatsGrid';
import { useStoreOrders } from '@/hooks/use-store-orders';

interface OrderHighlightStatsProps {
  className?: string;
}

export const OrderHighlightStats: React.FC<OrderHighlightStatsProps> = ({ className = '' }) => {
  const { data } = useStoreOrders();
  const orders = data?.results || [];

  // Calculate order metrics
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const orderedOrders = orders.filter((o) => o.status === 'ordered').length;
  const receivedOrders = orders.filter((o) => o.status === 'received').length;

  // Calculate average time to receive an order (in days)
  // For now, using a mock calculation - in real system this would use date comparison
  const avgOrderTime = 5.5; // Average days from order to receive

  const stats: StatCardProps[] = [
    {
      title: 'Total',
      value: orders.length,
      color: 'default'
    },
    {
      title: 'En attente',
      value: pendingOrders,
      color: 'warning'
    },
    {
      title: 'Reçues',
      value: receivedOrders,
      color: 'success'
    },
    {
      title: 'Délai moyen',
      value: `${avgOrderTime}j`,
      color: 'primary'
    }
  ];

  return <SimpleStatsGrid stats={stats} className={className} />;
};