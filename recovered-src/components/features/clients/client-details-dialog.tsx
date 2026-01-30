"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Client } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { User, Phone, Mail, Wrench, Archive, Edit } from "lucide-react"
import { useRepairs } from "@/hooks/use-repairs"

interface ClientDetailsDialogProps {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (client: Client) => void
  userRole?: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  saisie: { label: "Saisie", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  "en-cours": { label: "En cours", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  prete: { label: "Prête", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  "en-attente": {
    label: "En attente",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
}

export function ClientDetailsDialog({
  client,
  open,
  onOpenChange,
  onEdit,
  userRole,
}: ClientDetailsDialogProps) {
  // Fetch active repairs (status not 'prete' or 'livre' - assuming 'prete' is active but 'livre' is archived? 
  // Actually, let's fetch all and filter client-side for now if backend doesn't support complex filtering, 
  // OR fetch separately if we can. 
  // For now, let's fetch all repairs for this client.
  const { data: repairsData } = useRepairs(1, undefined, client ? client.id : undefined);
  const allRepairs = repairsData?.results || [];

  // Filter active vs archived
  // Assuming 'prete' means ready but not picked up? Or is 'livre' the final state?
  // Based on statusConfig, we have 'saisie', 'en-cours', 'prete', 'en-attente'.
  // Let's assume all these are active. We need a 'livre' or 'cloture' status for archived.
  // If 'prete' is the last one in config, maybe that's it? 
  // But usually there is a 'recoveredAt' field.
  // Let's use recoveredAt to determine if archived.
  
  const activeRepairs = allRepairs.filter(r => !r.recoveredAt);
  const archivedRepairs = allRepairs.filter(r => r.recoveredAt);

  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Fiche Client</DialogTitle>
            {userRole === "admin" && onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(client)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Client Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <User className="h-4 w-4" />
              INFORMATIONS
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-lg font-semibold">{client.first_name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {client.first_name} {client.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">Client ID: {client.id}</div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{client.profile?.phone_number || "Pas de numéro"}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Active Repairs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Wrench className="h-4 w-4" />
              RÉPARATIONS EN COURS ({activeRepairs.length})
            </div>
            {activeRepairs.length > 0 ? (
              <div className="space-y-3">
                {activeRepairs.map((repair) => (
                  <div key={repair.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium">
                          #{repair.id} - {repair.brand} {repair.model}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">{repair.deviceType}</div>
                      </div>
                      <Badge className={statusConfig[repair.status]?.className || "bg-gray-100 text-gray-800"}>
                        {statusConfig[repair.status]?.label || repair.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {(repair.issues || []).map((issue, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Créée le {format(new Date(repair.created_at), "dd MMM yyyy", { locale: fr })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Aucune réparation en cours
              </div>
            )}
          </div>

          <Separator />

          {/* Archived Repairs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Archive className="h-4 w-4" />
              HISTORIQUE ({archivedRepairs.length})
            </div>
            {archivedRepairs.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {archivedRepairs.map((repair) => (
                  <div key={repair.id} className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          #{repair.id} - {repair.brand} {repair.model}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(repair.issues || []).map((issue, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        {(repair.price || repair.totalCost) && (
                          <div className="text-sm font-semibold text-green-600">
                            {parseFloat(repair.price || String(repair.totalCost || 0)).toFixed(2)} €
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {repair.recoveredAt && format(new Date(repair.recoveredAt), "dd/MM/yy", { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Aucun historique
              </div>
            )}
          </div>

          {/* Stats */}
          {archivedRepairs.length > 0 && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="text-2xl font-bold">
                    {archivedRepairs.reduce((sum, r) => sum + parseFloat(r.price || String(r.totalCost || 0)), 0).toFixed(2)} €
                  </div>
                  <div className="text-sm text-muted-foreground">Total dépensé</div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="text-2xl font-bold">{activeRepairs.length + archivedRepairs.length}</div>
                  <div className="text-sm text-muted-foreground">Réparations totales</div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
