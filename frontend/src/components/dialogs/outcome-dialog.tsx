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
import {
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Wrench,
} from "lucide-react";
import type { Repair, RepairStatus, RepairOutcome } from "@/types";

interface OutcomeDialogProps {
  repair: Repair | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    newStatus: RepairStatus,
    comment: string,
    notifyClient: boolean,
    outcome?: RepairOutcome,
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

export function OutcomeDialog({
  repair,
  open,
  onOpenChange,
  onConfirm,
  currentUserName,
}: OutcomeDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus | null>(
    null,
  );
  const [comment, setComment] = useState("");
  const [notifyClient, setNotifyClient] = useState(true);
  const [outcome, setOutcome] = useState<RepairOutcome>(null);

  if (!repair) return null;

  const availableStatuses = statusFlow[repair.status] || [];
  // UX logic: We need an outcome only if moving to "prete"
  const isMovingToPrete = selectedStatus === "prete";

  const handleConfirm = () => {
    if (!selectedStatus) return;
    // If moving to 'prete', an outcome (success/failed) is mandatory
    if (isMovingToPrete && !outcome) return;

    onConfirm(selectedStatus, comment, notifyClient, outcome);
    resetState();
  };

  const resetState = () => {
    setSelectedStatus(null);
    setComment("");
    setNotifyClient(true);
    setOutcome(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetState();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Mise à jour de l'intervention
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transition Visualizer */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-dashed">
            <Badge
              className={`${statusConfig[repair.status].color} text-white`}
            >
              {statusConfig[repair.status].label}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            {selectedStatus ? (
              <Badge
                className={`${statusConfig[selectedStatus].color} text-white animate-in zoom-in-95`}
              >
                {statusConfig[selectedStatus].label}
              </Badge>
            ) : (
              <span className="text-sm italic text-muted-foreground">
                Choisir nouveau statut...
              </span>
            )}
          </div>

          {/* Status Selection Buttons */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Nouveau statut</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status);
                    if (status !== "prete") setOutcome(null);
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    selectedStatus === status
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <span className="font-medium text-sm">
                    {statusConfig[status].label}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${statusConfig[status].color}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Outcome Selection */}
          {isMovingToPrete && (
            <div className="space-y-3 p-4 bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900 rounded-xl animate-in fade-in slide-in-from-top-2">
              <Label className="text-green-800 dark:text-green-300 font-bold">
                Résultat final de la réparation *
              </Label>
              <RadioGroup
                value={outcome || ""}
                onValueChange={(value) => setOutcome(value as RepairOutcome)}
                className="grid grid-cols-2 gap-3"
              >
                <div
                  className={`relative flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all ${
                    outcome === "success"
                      ? "border-green-600 bg-white dark:bg-background"
                      : "border-transparent bg-muted/50"
                  }`}
                >
                  <RadioGroupItem
                    value="success"
                    id="success"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="success"
                    className="flex flex-col items-center gap-1 cursor-pointer w-full text-center"
                  >
                    <CheckCircle
                      className={`h-6 w-6 ${outcome === "success" ? "text-green-600" : "text-muted-foreground"}`}
                    />
                    <span
                      className={`text-xs font-bold ${outcome === "success" ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      RÉUSSIE
                    </span>
                  </Label>
                </div>

                <div
                  className={`relative flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all ${
                    outcome === "failed"
                      ? "border-red-600 bg-white dark:bg-background"
                      : "border-transparent bg-muted/50"
                  }`}
                >
                  <RadioGroupItem
                    value="failed"
                    id="failed"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="failed"
                    className="flex flex-col items-center gap-1 cursor-pointer w-full text-center"
                  >
                    <XCircle
                      className={`h-6 w-6 ${outcome === "failed" ? "text-red-600" : "text-muted-foreground"}`}
                    />
                    <span
                      className={`text-xs font-bold ${outcome === "failed" ? "text-red-600" : "text-muted-foreground"}`}
                    >
                      ÉCHOUÉE
                    </span>
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-[11px] text-muted-foreground text-center italic">
                {outcome === "success"
                  ? "Le montant total sera dû par le client."
                  : outcome === "failed"
                    ? "Seuls les frais de diagnostic/prise en charge seront appliqués."
                    : "Merci d'indiquer si l'appareil est réparé."}
              </p>
            </div>
          )}

          {/* Comment Field */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-semibold">
              Commentaire interne
            </Label>
            <Textarea
              id="comment"
              placeholder="Détails sur l'intervention, pièces changées..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
            <div className="space-y-0.5">
              <Label htmlFor="notify" className="text-sm font-semibold">
                Notifier le client
              </Label>
              <p className="text-xs text-muted-foreground">
                Envoi auto d'un SMS/Email
              </p>
            </div>
            <Switch
              id="notify"
              checked={notifyClient}
              onCheckedChange={setNotifyClient}
            />
          </div>

          {notifyClient && (
            <Alert className="bg-blue-50/50 border-blue-100">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-800">
                Notification pour <strong>{repair.client?.first_name}</strong>{" "}
                au {repair.client?.profile?.phone_number}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedStatus || (isMovingToPrete && !outcome)}
            className={
              isMovingToPrete
                ? "bg-green-600 hover:bg-green-700 text-white"
                : ""
            }
          >
            Confirmer {isMovingToPrete && outcome ? "la fin des travaux" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
