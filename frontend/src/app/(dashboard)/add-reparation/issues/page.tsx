"use client";

import { useRouter } from "next/navigation";
import { useReparationStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommonIssues } from "@/hooks/use-common-issues";

export default function AddReparationIssuesPage() {
  const router = useRouter();
  const {
    deviceType,
    setDeviceType,
    brand,
    setBrand,
    model,
    setModel,
    issues,
    setIssues,
    description,
    setDescription,
    accessories,
    setAccessories,
    password,
    setPassword,
    depositReceived,
    setDepositReceived,
    scheduledDate,
    setScheduledDate,
    clientSearch,
    setClientSearch,
  } = useReparationStore();


  // Fetch data from backend
  const {
    data: commonIssuesData,
    isLoading: isLoadingCommonIssues,
    error: commonIssuesError,
  } = useCommonIssues(deviceType);


  const commonIssues = (commonIssuesData || []); // Use the full issue objects instead of just names

  const toggleIssue = (issueName: string) => {
    if (issues.includes(issueName)) {
      setIssues(issues.filter((i) => i !== issueName));
    } else {
      setIssues([...issues, issueName]);
    }
  };

  const canProceedStep2 = issues.length > 0;

  // Show errors if any
  if (commonIssuesError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-4">
          <p className="text-lg text-red-600">
            Erreur de chargement des données
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Veuillez réessayer plus tard
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-8">
      {/* Step 2: Issues */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Problèmes rencontrés
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sélectionnez tous les problèmes qui s'appliquent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isLoadingCommonIssues ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Chargement des problèmes...</p>
              </div>
            </div>
          ) : (
            commonIssues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => toggleIssue(issue.name)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all hover:border-primary/50",
                  issues.includes(issue.name)
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card",
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                    issues.includes(issue.name)
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/50",
                  )}
                >
                  {issues.includes(issue.name) && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span className="text-sm font-medium">{issue.name}</span>
              </button>
            ))
          )}
        </div>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le problème en détail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accessories">Accessoires fournis</Label>
              <Input
                id="accessories"
                placeholder="ex: Chargeur, Étui..."
                value={accessories}
                onChange={(e) => setAccessories(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Code de déverrouillage</Label>
              <Input
                id="password"
                placeholder="Code PIN ou mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="deposit"
                checked={depositReceived}
                onCheckedChange={(checked) =>
                  setDepositReceived(checked as boolean)
                }
              />
              <Label htmlFor="deposit" className="cursor-pointer">
                Acompte reçu
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Date prévue</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate
                      ? scheduledDate.toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            onClick={() => router.push("/add-reparation/device")}
            variant="outline"
            size="lg"
          >
            Retour
          </Button>
          <Button
            onClick={() => router.push("/add-reparation/client")}
            disabled={!canProceedStep2}
            size="lg"
          >
            Suivant
          </Button>
        </div>
      </div>
    </Card>
  );
}