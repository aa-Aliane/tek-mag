"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Repair } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Eye, Phone, User } from "lucide-react"

interface RepairCardProps {
  repair: Repair
  onViewDetails?: (repair: Repair) => void
}

const statusConfig = {
  saisie: { label: "Saisie", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  "en-cours": { label: "En cours", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  prete: { label: "Prête", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  "en-attente": {
    label: "En attente",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
}

export function RepairCard({ repair, onViewDetails }: RepairCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-muted-foreground">#{repair.id}</div>
            <div className="text-lg font-bold mt-1">
              {repair.brand} {repair.model}
            </div>
            <div className="text-xs text-muted-foreground capitalize mt-0.5">{repair.deviceType}</div>
          </div>
          <Badge className={statusConfig[repair.status]?.className || "bg-gray-100 text-gray-800"}>
            {statusConfig[repair.status]?.label || repair.status}
          </Badge>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {repair.client.first_name} {repair.client.last_name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{repair.client.profile?.phone_number || "Pas de numéro"}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-1">Panne(s):</div>
          <div className="flex flex-wrap gap-1">
            {(repair.issues || []).map((issue, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {issue}
              </Badge>
            ))}
          </div>
        </div>

        {repair.totalCost != null && typeof repair.totalCost === 'number' && !isNaN(repair.totalCost) && (
          <div className="mb-3 p-2 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <div className="text-xs text-muted-foreground">Prix:</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{repair.totalCost.toFixed(2)} €</div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {format(new Date(repair.created_at), "dd MMM yyyy", { locale: fr })}
          </span>
          <Button variant="outline" size="sm" onClick={() => onViewDetails?.(repair)}>
            <Eye className="h-4 w-4 mr-1" />
            Détails
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
