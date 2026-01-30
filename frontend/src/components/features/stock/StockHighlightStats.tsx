import { StatCardProps } from '@/components/shared/StatCard';
import { SimpleStatsGrid } from '@/components/shared/SimpleStatsGrid';
import { useStockItems } from '@/hooks/use-stock-items';

interface StockHighlightStatsProps {
  className?: string;
}

export const StockHighlightStats: React.FC<StockHighlightStatsProps> = ({ className = '' }) => {
  const { data } = useStockItems();
  const stockItems = data?.results || [];

  // Calculate stock metrics
  const totalValue = stockItems.reduce((sum, item) => sum + (item.quantity * parseFloat(item.part.price || "0")), 0);
  const avgPrice = stockItems.length > 0 ? (totalValue / stockItems.length).toFixed(2) : "0.00";

  // Calculate inventory health
  const inventoryHealth = stockItems.length > 0 
    ? ((stockItems.length - stockItems.filter(p => p.quantity === 0).length) / stockItems.length * 100).toFixed(0)
    : "0";

  const stats: StatCardProps[] = [
    {
      title: 'Articles',
      value: stockItems.length,
      color: 'default'
    },
    {
      title: 'Valeur',
      value: `${totalValue.toFixed(0)}€`,
      color: 'success'
    },
    {
      title: 'Faible',
      value: stockItems.filter((p) => p.quantity < 5 && p.quantity > 0).length,
      color: 'warning'
    },
    {
      title: 'Santé',
      value: `${inventoryHealth}%`,
      color: 'primary'
    }
  ];

  return <SimpleStatsGrid stats={stats} className={className} />;
};
