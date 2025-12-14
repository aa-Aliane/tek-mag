"use client"

import { useState } from "react"
import { ClientsTable, ClientDetailsDialog } from "@/components/features/clients"
import type { Client, Repair } from "@/types"
import { SharedHeader } from '@/components/shared/shared-header';
import { useClients } from "@/hooks/use-clients";
import { useRepairs } from "@/hooks/use-repairs";
import { ClientHighlightStats } from "@/components/features/clients/ClientHighlightStats";

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

  return (
    <div className="h-full">
      <SharedHeader
        title="Clients"
        subtitle="Base de données des clients"
      />

      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        <ClientHighlightStats className="mb-4 sm:mb-6" />

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
