"use client"

import { useState } from "react"
import { type StockItem } from "@/types"
import { StockTable } from "@/components/features/stock"
import { AlertTriangle } from "lucide-react"
import { SharedHeader } from '@/components/shared/shared-header';
import { useStockItems, useUpdateStockItem } from "@/hooks/use-stock-items";
import { toast } from "sonner";

export default function StockPage() {
  const { data } = useStockItems();
  const updateStockItem = useUpdateStockItem();
  const stockItems = data?.results || [];

  const handleAddStock = (itemId: number, quantity: number) => {
    const item = stockItems.find((i) => i.id === itemId);
    if (!item) return;

    updateStockItem.mutate(
      {
        id: itemId,
        data: {
          quantity: item.quantity + quantity,
        },
      },
      {
        onSuccess: () => {
          toast.success("Stock mis à jour avec succès");
        },
        onError: () => {
          toast.error("Erreur lors de la mise à jour du stock");
        },
      }
    );
  }

  const stats = {
    total: stockItems.length,
    lowStock: stockItems.filter((p) => p.quantity < 5 && p.quantity > 0).length, // Hardcoded minQuantity for now
    outOfStock: stockItems.filter((p) => p.quantity === 0).length,
    totalValue: stockItems.reduce((sum, p) => sum + p.quantity * parseFloat(p.product.price || "0"), 0),
  }

  return (
    <div className="h-full">
      <SharedHeader
        title="Stock"
        subtitle="Inventaire des pièces en magasin"
      />

      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Références</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="text-xl sm:text-2xl font-bold text-warning">{stats.lowStock}</div>
              {stats.lowStock > 0 && <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Stock faible</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="text-xl sm:text-2xl font-bold text-destructive">{stats.outOfStock}</div>
              {stats.outOfStock > 0 && <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Rupture</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalValue.toFixed(2)} €</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Valeur totale</div>
          </div>
        </div>

        {(stats.lowStock > 0 || stats.outOfStock > 0) && (
          <div className="rounded-lg border border-warning bg-warning/10 p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm sm:text-base font-medium text-warning">Attention au stock</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {stats.outOfStock > 0 && `${stats.outOfStock} pièce(s) en rupture de stock. `}
                  {stats.lowStock > 0 && `${stats.lowStock} pièce(s) avec stock faible.`}
                </div>
              </div>
            </div>
          </div>
        )}

        <StockTable stockItems={stockItems} onAddStock={handleAddStock} />
      </div>
    </div>
  )
}

