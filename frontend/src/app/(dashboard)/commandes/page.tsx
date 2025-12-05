"use client"

import { useState } from "react"
import { mockPartOrders } from "@/lib/data"
import { type PartOrder } from "@/types"
import { OrdersTable } from "@/components/features/commands"
import { SharedHeader } from '@/components/shared/shared-header';

export default function CommandesPage() {
  const [orders, setOrders] = useState<PartOrder[]>(mockPartOrders)

  const handleUpdateStatus = (orderId: string, status: PartOrder["status"]) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status } : order)))
  }

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    ordered: orders.filter((o) => o.status === "ordered").length,
    received: orders.filter((o) => o.status === "received").length,
  }

  return (
    <div className="h-full">
      <SharedHeader
        title="Commande Pièces"
        subtitle="Pièces à commander pour les réparations"
      />

      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total commandes</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">En attente</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.ordered}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Commandées</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.received}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Reçues</div>
          </div>
        </div>

        <OrdersTable orders={orders} onUpdateStatus={handleUpdateStatus} />
      </div>
    </div>
  )
}
