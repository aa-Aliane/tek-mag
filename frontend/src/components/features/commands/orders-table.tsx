"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PartOrder } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface OrdersTableProps {
  orders: PartOrder[]
  onUpdateStatus: (orderId: string, status: PartOrder["status"]) => void
}

const statusConfig = {
  pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  ordered: { label: "Commandée", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  received: { label: "Reçue", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
}

export function OrdersTable({ orders, onUpdateStatus }: OrdersTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Pièce
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Quantité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Raison
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium">{order.partName}</div>
                  {order.repairId && (
                    <div className="text-xs text-muted-foreground">Pour réparation #{order.repairId}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">{order.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">{order.reason}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={statusConfig[order.status].className}>{statusConfig[order.status].label}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {format(order.createdAt, "dd MMM yyyy", { locale: fr })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => onUpdateStatus(order.id, "ordered")}>
                        Marquer commandée
                      </Button>
                    )}
                    {order.status === "ordered" && (
                      <Button size="sm" variant="outline" onClick={() => onUpdateStatus(order.id, "received")}>
                        Marquer reçue
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
