"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { StoreOrder } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Search, Plus, Calendar, List, Square, BadgeCheck } from "lucide-react"

interface CommandsTableProps {
  orders: StoreOrder[]
  onViewDetails?: (order: StoreOrder) => void
  onStatusChange?: (order: StoreOrder, newStatus: string) => void
  onUpdateStatus?: (orderId: number, status: string) => void
  statusFilter: string | "all"
  setStatusFilter: (value: string | "all") => void
  searchTerm: string
  setSearchTerm: (value: string) => void
}

const statusConfig = {
  pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  ordered: { label: "Commandée", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  received: { label: "Reçue", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
}

// Define the allowed status transitions for each status
const statusFlow: Record<string, string[]> = {
  pending: ["ordered", "cancelled"],
  ordered: ["received", "cancelled"],
  received: [],
  cancelled: ["pending"], // Allow returning to pending if needed
};

// Get available status options based on current status
const getStatusOptions = (currentStatus: string) => {
  const availableStatuses = statusFlow[currentStatus] || [];
  return Object.entries(statusConfig).filter(([status]) =>
    availableStatuses.includes(status)
  ).map(([status, config]) => ({ status, ...config }));
};

export function CommandsTable({
  orders,
  onViewDetails,
  onStatusChange,
  onUpdateStatus,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm
}: CommandsTableProps) {
  // Apply filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm ||
      order.order_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.delivery_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="ordered">Commandée</SelectItem>
            <SelectItem value="received">Reçue</SelectItem>
            <SelectItem value="cancelled">Annulée</SelectItem>
          </SelectContent>
        </Select>
        <Button
          className="gap-2"
          onClick={() => window.location.href = "/commandes/new"}
        >
          <Plus className="h-4 w-4" />
          Nouvelle Commande
        </Button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Aucune commande trouvée</div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Détail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onViewDetails?.(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {onStatusChange ? (
                        // Use dropdown for status change when onStatusChange is provided
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`inline-flex h-8 select-none items-center justify-center rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${statusConfig[order.delivery_status as keyof typeof statusConfig]?.className || statusConfig.pending.className} hover:opacity-90`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {statusConfig[order.delivery_status as keyof typeof statusConfig]?.label || order.delivery_status}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/30 rounded-t px-4">
                              Changer le statut vers:
                            </div>
                            {getStatusOptions(order.delivery_status).map((statusOption) => (
                              <DropdownMenuItem
                                key={statusOption.status}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(order, statusOption.status);
                                }}
                                className={statusOption.className}
                              >
                                {statusOption.label}
                              </DropdownMenuItem>
                            ))}
                            {getStatusOptions(order.delivery_status).length === 0 && (
                              <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                                Aucun statut disponible
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        // Fallback to original badge display when onUpdateStatus is provided (old interface)
                        <Badge className={statusConfig[order.delivery_status as keyof typeof statusConfig]?.className || statusConfig.pending.className}>
                          {statusConfig[order.delivery_status as keyof typeof statusConfig]?.label || order.delivery_status}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">
                        {order.description || '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.supplier?.name || 'Aucun fournisseur'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {order.created_at ? format(new Date(order.created_at), "dd MMM yyyy", { locale: fr }) : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}