"use client"

import { useState } from "react"
import { ClientsTable, ClientDetailsDialog } from "@/components/features/clients"
import type { Client, Repair } from "@/types"
import { SharedHeader } from '@/components/shared/shared-header';
import { useClients } from "@/hooks/use-clients";
import { useRepairs } from "@/hooks/use-repairs";

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { data: clientsData } = useClients();
  const { data: repairsData } = useRepairs();

  const clients = clientsData?.results || [];
  const repairs = repairsData?.results || [];

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client)
    setIsDetailsOpen(true)
  }

  const stats = {
    total: clients.length,
    withRepairs: clients.filter((c) => repairs.some((r) => r.client.id === c.id)).length,
  }

  return (
    <div className="h-full">
      <SharedHeader
        title="Clients"
        subtitle="Base de données des clients"
      />

      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total clients</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-primary">{stats.withRepairs}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Avec réparations</div>
          </div>
        </div>

        <ClientsTable clients={clients} repairs={repairs} onViewDetails={handleViewDetails} />
      </div>

      <ClientDetailsDialog
        client={selectedClient}
        open={!!selectedClient}
        onOpenChange={(open) => !open && setSelectedClient(null)}
      />
    </div>
  )
}
