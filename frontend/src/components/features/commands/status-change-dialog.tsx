"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import type { Repair, RepairStatus } from "@/types";

interface StatusChangeDialogProps {
  repair: Repair | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Updated signature to use boolean for outcome
  onConfirm: (
    newStatus: RepairStatus,
    comment: string,
    notifyClient: boolean,
    outcome?: boolean,
  ) => void;
  currentUserName: string;
}

const statusConfig = {
  saisie: { label: "Saisie", color: "bg-blue-500" },
  "en-cours": { label: "En cours", color: "bg-yellow-500" },
  prete: { label: "Prête", color: "bg-green-500" },
  "en-attente": { label: "En attente", color: "bg-orange-500" },
};

const statusFlow: Record<RepairStatus, RepairStatus[]> = {
  saisie: ["en-cours", "en-attente"],
  "en-cours": ["prete", "en-attente", "saisie"],
  prete: ["en-cours"],
  "en-attente": ["en-cours", "saisie"],
};

export function StatusChangeDialog({
  repair,
  open,
  onOpenChange,
  onConfirm,
}: StatusChangeDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus | null>(
    null,
  );
  const [comment, setComment] = useState("");
  const [notifyClient, setNotifyClient] = useState(true);

  // Changed outcome state to boolean | null
  const [outcome, setOutcome] = useState<boolean | null>(null);

  if (!repair) return null;

  const availableStatuses = statusFlow[repair.status] || [];
  const isMovingToPrete = selectedStatus === "prete";
  const needsOutcome = isMovingToPrete && repair.status === "en-cours";

  const handleConfirm = () => {
    if (!selectedStatus) return;
    // Block if moving to "Prête" but success/failure isn't selected
    if (needsOutcome && outcome === null) return;

    // Send the boolean value to the parent
    onConfirm(
      selectedStatus,
      comment,
      notifyClient,
      needsOutcome ? outcome! : undefined,
    );

    handleClose();
  };

  const handleClose = () => {
    setSelectedStatus(null);
    setComment("");
    setNotifyClient(true);
    setOutcome(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) handleClose();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Changer le statut de la réparation</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Status Visualization */}
          <div className="flex items-center gap-3">
            <Badge
              className={`${statusConfig[repair.status].color} text-white`}
            >
              {statusConfig[repair.status].label}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Nouveau statut
            </span>
          </div>

          {/* Status Selection Buttons */}
          <div className="space-y-3">
            <Label>Sélectionner le nouveau statut</Label>
            <div className="grid gap-2">
              {availableStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    selectedStatus === status
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${statusConfig[status].color}`}
                  />
                  <span className="font-medium">
                    {statusConfig[status].label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Boolean Outcome Selection */}
          {needsOutcome && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <Label className="text-primary font-bold">
                L'appareil est-il réparé ? *
              </Label>
              <RadioGroup
                value={outcome === null ? "" : outcome.toString()}
                onValueChange={(value) => setOutcome(value === "true")}
              >
                <div
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${outcome === true ? "border-green-600 bg-green-50/50" : "border-border"}`}
                >
                  <RadioGroupItem value="true" id="success" />
                  <Label
                    htmlFor="success"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium text-green-700">
                        Oui, réparation réussie
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Le client paiera le prix total
                      </div>
                    </div>
                  </Label>
                </div>
                <div
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${outcome === false ? "border-red-600 bg-red-50/50" : "border-border"}`}
                >
                  <RadioGroupItem value="false" id="failed" />
                  <Label
                    htmlFor="failed"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <XCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="font-medium text-red-700">
                        Non, irréparable / échec
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Seuls les frais de diagnostic s'appliquent
                      </div>
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
              placeholder="Détails sur l'intervention..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Notify Client Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="notify" className="text-base">
                Prévenir le client
              </Label>
              <p className="text-sm text-muted-foreground">
                Envoyer un SMS/Email automatiquement
              </p>
            </div>
            <Switch
              id="notify"
              checked={notifyClient}
              onCheckedChange={setNotifyClient}
            />
          </div>

          {notifyClient && (
            <Alert className="bg-blue-50 border-blue-100">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-xs">
                Le client{" "}
                <strong>
                  {repair.client?.first_name} {repair.client?.last_name}
                </strong>{" "}
                sera notifié.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedStatus || (needsOutcome && outcome === null)}
          >
            Confirmer le changement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
