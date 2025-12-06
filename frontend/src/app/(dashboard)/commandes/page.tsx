"use client"

import { useState } from "react"
import { mockPartOrders } from "@/lib/data"
import { type PartOrder } from "@/types"
import { OrdersTable } from "@/components/features/commands"
import { SharedHeader } from '@/components/shared/shared-header';
import { OrderHighlightStats } from "@/components/features/commands/OrderHighlightStats";

export default function CommandesPage() {
  const [orders, setOrders] = useState<PartOrder[]>(mockPartOrders)

  const handleUpdateStatus = (orderId: string, status: PartOrder["status"]) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status } : order)))
  }

  return (
    <div className="h-full">
      <SharedHeader
        title="Commande Pièces"
        subtitle="Pièces à commander pour les réparations"
      />

      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        <OrderHighlightStats className="mb-4 sm:mb-6" />

        <OrdersTable orders={orders} onUpdateStatus={handleUpdateStatus} />
      </div>
    </div>
  )
}
