"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Repair } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface ArchivesTableProps {
  repairs: Repair[]
}

export function ArchivesTable({ repairs }: ArchivesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRepairs = repairs.filter(
    (repair) =>
      repair.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.client.phone.includes(searchTerm) ||
      repair.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.id.includes(searchTerm),
  )

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par ID, client, appareil..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Appareil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Panne(s)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date création
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date récupération
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Coût
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRepairs.map((repair) => (
                <tr key={repair.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{repair.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {repair.brand} {repair.model}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">{repair.deviceType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{repair.client.name}</div>
                    <div className="text-xs text-muted-foreground">{repair.client.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {repair.issues.map((issue, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {format(repair.createdAt, "dd MMM yyyy", { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {repair.recoveredAt ? format(repair.recoveredAt, "dd MMM yyyy", { locale: fr }) : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {repair.totalCost ? `${repair.totalCost.toFixed(2)} €` : "-"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRepairs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">Aucune réparation archivée trouvée</div>
      )}
    </div>
  )
}
