"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import type { Repair, RepairStatus, RepairOutcome } from "@/types"

interface StatusChangeDialogProps {
  repair: Repair | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (newStatus: RepairStatus, comment: string, notifyClient: boolean, outcome?: RepairOutcome) => void
  currentUserName: string
}

const statusConfig = {
  saisie: { label: "Saisie", color: "bg-blue-500" },
  "en-cours": { label: "En cours", color: "bg-yellow-500" },
  prete: { label: "Prête", color: "bg-green-500" },
  "en-attente": { label: "En attente", color: "bg-orange-500" },
}

const statusFlow: Record<RepairStatus, RepairStatus[]> = {
  saisie: ["en-cours", "en-attente"],
  "en-cours": ["prete", "en-attente", "saisie"],
  prete: ["en-cours"],
  "en-attente": ["en-cours", "saisie"],
}

export function StatusChangeDialog({
  repair,
  open,
  onOpenChange,
  onConfirm,
  currentUserName,
}: StatusChangeDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus | null>(null)
  const [comment, setComment] = useState("")
  const [notifyClient, setNotifyClient] = useState(true)
  const [outcome, setOutcome] = useState<RepairOutcome>(null)

  if (!repair) return null

  const availableStatuses = statusFlow[repair.status] || []
  const isMovingToPrete = selectedStatus === "prete"
  const needsOutcome = isMovingToPrete && repair.status === "en-cours"

  const handleConfirm = () => {
    if (!selectedStatus) return
    if (needsOutcome && !outcome) return

    onConfirm(selectedStatus, comment, notifyClient, outcome)
    setSelectedStatus(null)
    setComment("")
    setNotifyClient(true)
    setOutcome(null)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedStatus(null)
      setComment("")
      setNotifyClient(true)
      setOutcome(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Changer le statut de la réparation</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Status */}
          <div className="flex items-center gap-3">
            <Badge className={`${statusConfig[repair.status].color} text-white`}>
              {statusConfig[repair.status].label}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Nouveau statut</span>
          </div>

          {/* Status Selection */}
          <div className="space-y-3">
            <Label>Sélectionner le nouveau statut</Label>
            <div className="grid gap-2">
              {availableStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    selectedStatus === status
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${statusConfig[status].color}`} />
                  <span className="font-medium">{statusConfig[status].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Outcome Selection (only when moving to "prete" from "en-cours") */}
          {needsOutcome && (
            <div className="space-y-3">
              <Label>Résultat de la réparation *</Label>
              <RadioGroup value={outcome || ""} onValueChange={(value) => setOutcome(value as RepairOutcome)}>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50">
                  <RadioGroupItem value="success" id="success" />
                  <Label htmlFor="success" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Réparation réussie</div>
                      <div className="text-xs text-muted-foreground">Le prix sera appliqué</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50">
                  <RadioGroupItem value="failed" id="failed" />
                  <Label htmlFor="failed" className="flex items-center gap-2 cursor-pointer flex-1">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="font-medium">Réparation échouée</div>
                      <div className="text-xs text-muted-foreground">Seul le diagnostic sera facturé</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              placeholder="Ajouter un commentaire sur ce changement de statut..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Notify Client */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="notify" className="text-base">
                Prévenir le client
              </Label>
              <p className="text-sm text-muted-foreground">Envoyer une notification au client par SMS/Email</p>
            </div>
            <Switch id="notify" checked={notifyClient} onCheckedChange={setNotifyClient} />
          </div>

          {notifyClient && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Le client {repair.client?.first_name} {repair.client?.last_name} sera notifié au {repair.client?.profile?.phone_number}
                {repair.client?.email && ` et ${repair.client?.email}`}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedStatus || (needsOutcome && !outcome)}>
            Confirmer le changement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
