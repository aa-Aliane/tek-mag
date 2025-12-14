"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandsTable, CommandDetails } from "@/components/features/commands";
import { useStoreOrders } from "@/hooks/use-store-orders";
import { commandsApi } from "@/services/api/commands";
import { type StoreOrder } from "@/types";
import { SharedHeader } from '@/components/shared/shared-header';
import { toast } from "sonner";
import { OrderHighlightStats } from "@/components/features/commands/OrderHighlightStats";

export default function CommandesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data, isLoading, error } = useStoreOrders();
  const orders = data?.results || [];

  // Update selected order when data changes
  useEffect(() => {
    if (data?.results && selectedOrder) {
      const updatedOrder = data.results.find(r => r.id === selectedOrder.id);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [data?.results, selectedOrder]);

  const handleStatusChange = async (order: StoreOrder, newStatus: string) => {
    try {
      await commandsApi.updateStoreOrderStatus(order.id, newStatus);
      // Invalidate and refetch the store orders to update the UI
      await queryClient.invalidateQueries({ queryKey: ['storeOrders'] });
      toast.success(`Statut de la commande mis à jour à: ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Erreur lors de la mise à jour du statut de la commande");
    }
  };

  const handleViewDetails = (order: StoreOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <SharedHeader
        title="Commande Pièces"
        subtitle="Pièces à commander pour les réparations"
      >
        <div className="flex justify-end">
          <Button
            className="gap-2"
            onClick={() => router.push("/commandes/new")}
          >
            <Plus className="h-4 w-4" />
            Nouvelle Commande
          </Button>
        </div>
      </SharedHeader>

      <div className="p-4 sm:p-8 flex-1 flex flex-col gap-4 sm:gap-6 min-h-0">
        <OrderHighlightStats className="mb-4 sm:mb-6" />

        <div className="flex gap-6 flex-1 min-h-0">
          <div className={`flex-1 min-w-0 transition-all duration-300`}>
            <CommandsTable
              orders={orders}
              onViewDetails={handleViewDetails}
              onStatusChange={handleStatusChange}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>

          {isDetailsOpen && selectedOrder && (
            <div className="w-[500px] flex-none animate-in slide-in-from-right-10 duration-300 overflow-y-auto max-h-[calc(100vh-2rem)]">
              <CommandDetails
                order={selectedOrder}
                onClose={() => setIsDetailsOpen(false)}
                isStandalone={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}