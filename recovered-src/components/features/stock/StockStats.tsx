import { StatCardProps } from '@/components/shared/StatCard';
import { StatsGrid } from '@/components/shared/StatsGrid';
import { useStockItems } from '@/hooks/use-stock-items';
import { AlertTriangle } from 'lucide-react';

interface StockStatsProps {
  className?: string;
  compact?: boolean;
}

export const StockStats: React.FC<StockStatsProps> = ({ className = '', compact = false }) => {
  const { data } = useStockItems();
  const stockItems = data?.results || [];

  const stats: StatCardProps[] = [
    {
      title: 'Références',
      value: stockItems.length,
      description: 'Articles uniques',
      color: 'default'
    },
    {
      title: 'Stock faible',
      value: stockItems.filter((p) => p.quantity < 5 && p.quantity > 0).length,
      description: 'Articles à surveiller',
      color: 'warning',
      icon: <AlertTriangle className="h-4 w-4 text-warning" />
    },
    {
      title: 'Rupture',
      value: stockItems.filter((p) => p.quantity === 0).length,
      description: 'Articles indisponibles',
      color: 'destructive',
      icon: <AlertTriangle className="h-4 w-4 text-destructive" />
    },
    {
      title: 'Valeur totale',
      value: `${stockItems.reduce((sum, p) => sum + p.quantity * parseFloat(p.part.price || "0"), 0).toFixed(2)} €`,
      description: 'Estimation valeur',
      color: 'success'
    }
  ];

  return <StatsGrid stats={stats} className={className} compact={compact} />;
};
