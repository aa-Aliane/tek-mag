import { Badge } from "@/components/ui/badge"
import type { Repair, RepairStatus, DeviceType } from "@/types"
import { formatSafeDate } from "@/utils/date"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ArchivesTableProps {
  repairs: Repair[];
  onViewDetails?: (repair: Repair) => void;
  statusFilter: RepairStatus | "all";
  setStatusFilter: (value: RepairStatus | "all") => void;
  deviceTypeFilter: DeviceType | "all";
  setDeviceTypeFilter: (value: DeviceType | "all") => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function ArchivesTable({
  repairs,
  onViewDetails,
  statusFilter,
  setStatusFilter,
  deviceTypeFilter,
  setDeviceTypeFilter,
  searchTerm,
  setSearchTerm,
}: ArchivesTableProps) {
  // All filtering is now handled by the parent component (ArchivesPage)
  const filteredRepairs = repairs;

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
        <Select
          value={statusFilter}
          onValueChange={(value: RepairStatus | "all") =>
            setStatusFilter(value)
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="prete">Prête</SelectItem>
            <SelectItem value="saisie">Saisie</SelectItem>
            <SelectItem value="en-cours">En cours</SelectItem>
            <SelectItem value="en-attente">En attente</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={deviceTypeFilter as any}
          onValueChange={(value: any | "all") => setDeviceTypeFilter(value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="smartphone">Smartphone</SelectItem>
            <SelectItem value="tablet">Tablette</SelectItem>
            <SelectItem value="computer">Ordinateur</SelectItem>
            <SelectItem value="other">Autres</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                   Statut Paiement
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                   Statut
                 </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRepairs.map((repair) => (
                <tr key={repair.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onViewDetails?.(repair)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{repair.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {repair.brand} {repair.model}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">{repair.deviceType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{repair.client?.firstName} {repair.client?.lastName}</div>
                    <div className="text-xs text-muted-foreground">{repair.client?.profile?.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {repair.issues?.map((issue, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatSafeDate(repair.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatSafeDate(repair.recoveredAt)}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm font-medium">
                       {repair.finalPrice ? `${Number(repair.finalPrice).toFixed(2)} DH` : "-"}
                       {repair.remise && Number(repair.remise) > 0 && (
                         <div className="text-xs text-muted-foreground">
                           Remise: {Number(repair.remise).toFixed(2)} DH
                         </div>
                       )}
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <Badge 
                       variant={
                         repair.paymentStatus === 'paid' ? 'default' :
                         repair.paymentStatus === 'partial' ? 'secondary' : 
                         'destructive'
                       }
                     >
                       {repair.paymentStatus === 'paid' ? 'Payé' :
                        repair.paymentStatus === 'partial' ? 'Partiel' : 'Impayé'}
                     </Badge>
                     {repair.remainingBalance && Number(repair.remainingBalance) > 0 && (
                       <div className="text-xs text-muted-foreground mt-1">
                         Reste: {Number(repair.remainingBalance).toFixed(2)} DH
                       </div>
                     )}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <Badge 
                       variant={
                         repair.status === 'prete' ? 'default' :
                         repair.status === 'en-cours' ? 'secondary' :
                         'outline'
                       }
                     >
                       {repair.status === 'prete' ? 'Prête' :
                        repair.status === 'en-cours' ? 'En cours' :
                        'Inconnu'}
                     </Badge>
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
