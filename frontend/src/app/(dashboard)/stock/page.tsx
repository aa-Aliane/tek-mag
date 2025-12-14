"use client"

import { useState } from "react"
import { type StockItem } from "@/types"
import { StockTable } from "@/components/features/stock"
import { AlertTriangle } from "lucide-react"
import { SharedHeader } from '@/components/shared/shared-header';
import { useStockItems, useUpdateStockItem } from "@/hooks/use-stock-items";
import { toast } from "sonner";
import { StockHighlightStats } from "@/components/features/stock/StockHighlightStats";

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

  return (
    <div className="h-full">
      <SharedHeader
        title="Stock"
        subtitle="Inventaire des pièces en magasin"
      />

      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        <StockHighlightStats className="mb-4 sm:mb-6" />

        {(stockItems.filter((p) => p.quantity < 5 && p.quantity > 0).length > 0 ||
          stockItems.filter((p) => p.quantity === 0).length > 0) && (
          <div className="rounded-lg border border-warning bg-warning/10 p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm sm:text-base font-medium text-warning">Attention au stock</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {stockItems.filter((p) => p.quantity === 0).length > 0 &&
                    `${stockItems.filter((p) => p.quantity === 0).length} pièce(s) en rupture de stock. `}
                  {stockItems.filter((p) => p.quantity < 5 && p.quantity > 0).length > 0 &&
                    `${stockItems.filter((p) => p.quantity < 5 && p.quantity > 0).length} pièce(s) avec stock faible.`}
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

