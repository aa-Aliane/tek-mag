"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReparationStore } from "@/lib/store";
import { useAddReparationStore } from "@/store/addReparationStore";
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
  X,
  Wrench,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommonIssues } from "@/hooks/use-common-issues";
import { Issue } from "@/types";
import { useSubtotal } from "@/features/repairs/_add-reparation/_hooks/use-issue-pricing";
import { QualityTierSelector } from "@/features/repairs/_add-reparation/_components/issues/quality-tier-selector";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

const AddReparationIssuesPage: React.FC<Props> = ({ className, ...rest }) => {
  const router = useRouter();
  const { setFormData: setGlobalFormData } = useAddReparationStore();
  const {
    deviceType,
    model,
    selectedIssues,
    addIssue,
    removeIssue,
    updateIssueTier,
    updateIssueNotes,
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

  console.log("selected model:", model);

  // Fetch data from backend
  const {
    data: commonIssuesData,
    isLoading: isLoadingCommonIssues,
    error: commonIssuesError,
  } = useCommonIssues(deviceType);

  const commonIssues = commonIssuesData || [];

  // Calculate subtotal using the custom hook
  const { subtotal } = useSubtotal(selectedIssues, commonIssues, Number(model));

  // Sync subtotal to global store
  useEffect(() => {
    setGlobalFormData({ totalPrice: parseFloat(subtotal) });
  }, [subtotal, setGlobalFormData]);

  // State for tracking which issue's quality tiers are being loaded
  const [loadingTiersFor, setLoadingTiersFor] = useState<string | null>(null);

  // State for quality tier selection modal
  const [selectedIssueForTiers, setSelectedIssueForTiers] =
    useState<Issue | null>(null);

  const toggleIssue = (issue: Issue) => {
    const exists = selectedIssues.some((i) => i.issueId === String(issue.id));
    if (exists) {
      removeIssue(issue.id);
    } else {
      if (issue.categoryType === "part_based") {
        // For part-based issues, add the issue and then show the tier selection modal
        addIssue(issue.id, issue.name, issue.categoryType);
        setSelectedIssueForTiers(issue);
      } else {
        // For service-based issues, just add the issue
        addIssue(issue.id, issue.name, issue.categoryType);
      }
    }
  };

  // Check if we can proceed to the next step
  const canProceedStep2 =
    selectedIssues.length > 0 &&
    selectedIssues.every(
      (issue) =>
        issue.categoryType === "service_based" ||
        (issue.categoryType === "part_based" && issue.selectedTierId),
    );

  // Handle quality tier selection from modal
  const handleTierSelect = (issueId: string, tierId: number) => {
    updateIssueTier(issueId, tierId);
    // Close the modal after selection
    setSelectedIssueForTiers(null);
  };

  // Show errors if any
  if (commonIssuesError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center min-h-[400px]",
          className,
        )}
        {...rest}
      >
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
    <Card className={cn("p-8", className)} {...rest}>
      {/* Step 2: Issues */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Problèmes rencontrés</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Sélectionnez tous les problèmes qui s'appliquent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoadingCommonIssues ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Chargement des problèmes...</p>
              </div>
            </div>
          ) : (
            commonIssues.map((issue) => (
              <div
                key={issue.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (
                      issue.categoryType === "part_based" &&
                      !selectedIssues.some(
                        (i) => i.issueId === String(issue.id),
                      )
                    ) {
                      toggleIssue(issue);
                    } else {
                      toggleIssue(issue);
                    }
                  }
                }}
                onClick={() => {
                  if (
                    issue.categoryType === "part_based" &&
                    !selectedIssues.some((i) => i.issueId === String(issue.id))
                  ) {
                    // If it's a part-based issue that isn't currently selected,
                    // we'll handle tier selection after adding it
                    toggleIssue(issue);
                  } else {
                    toggleIssue(issue);
                  }
                }}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  selectedIssues.some((i) => i.issueId === String(issue.id))
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:bg-accent/30",
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors mt-1",
                    selectedIssues.some((i) => i.issueId === String(issue.id))
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/50",
                  )}
                >
                  {selectedIssues.some(
                    (i) => i.issueId === String(issue.id),
                  ) && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{issue.name}</span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        issue.categoryType === "part_based"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
                      )}
                    >
                      {issue.categoryType === "part_based" ? (
                        <>
                          <Wrench className="w-3 h-3 mr-1" />
                          Pièce
                        </>
                      ) : (
                        <>
                          <Settings className="w-3 h-3 mr-1" />
                          Service
                        </>
                      )}
                    </span>
                  </div>
                  {issue.categoryType === "part_based" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Nécessite une pièce de rechange
                    </p>
                  )}
                  {selectedIssues.some((i) => i.issueId === String(issue.id)) &&
                    issue.categoryType === "service_based" && (
                      <p className="text-xs mt-2">
                        <span className="text-muted-foreground">Prix: </span>
                        <span className="font-medium text-primary">
                          €{issue.basePrice}
                        </span>
                      </p>
                    )}
                  {selectedIssues.some((i) => i.issueId === String(issue.id)) &&
                    issue.categoryType === "part_based" && (
                      <div className="mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIssueForTiers(issue);
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          {selectedIssues.find(
                            (i) => i.issueId === String(issue.id),
                          )?.selectedTierId
                            ? "Changer la qualité"
                            : "Sélectionner la qualité"}
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Issues with Quality Tiers */}
        {selectedIssues.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-border">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="font-medium text-lg">Problèmes sélectionnés</h3>
              <div className="text-base font-semibold">
                Sous-total: <span className="text-primary">€{subtotal}</span>
              </div>
            </div>

            {selectedIssues.map((selectedIssue) => {
              // Get the full issue object from commonIssues
              const fullIssue = commonIssues.find(
                (issue) => String(issue.id) === selectedIssue.issueId,
              );

              return (
                <div
                  key={selectedIssue.issueId}
                  className="p-5 border rounded-xl bg-card shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {selectedIssue.issueName}
                        </h4>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            selectedIssue.categoryType === "part_based"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
                          )}
                        >
                          {selectedIssue.categoryType === "part_based" ? (
                            <>
                              <Wrench className="w-3 h-3 mr-1" />
                              Pièce
                            </>
                          ) : (
                            <>
                              <Settings className="w-3 h-3 mr-1" />
                              Service
                            </>
                          )}
                        </span>
                      </div>
                      {selectedIssue.categoryType === "part_based" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Nécessite une pièce de rechange
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIssue(selectedIssue.issueId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Notes for Service-Based Issues */}
                  {selectedIssue.categoryType === "service_based" && (
                    <div className="mt-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Notes supplémentaires..."
                        value={selectedIssue.notes || ""}
                        onChange={(e) =>
                          updateIssueNotes(
                            selectedIssue.issueId,
                            e.target.value,
                          )
                        }
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quality Tier Selection Modal */}
        {selectedIssueForTiers && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-xl border w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Sélectionner la qualité
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIssueForTiers(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-4">
                <p className="font-medium">{selectedIssueForTiers.name}</p>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez la qualité de la pièce
                </p>
              </div>

              <QualityTierSelector
                issueId={selectedIssueForTiers.id}
                modelId={model}
                associatedPartId={selectedIssueForTiers.associatedPart}
                onTierSelect={handleTierSelect}
                selectedTierId={
                  selectedIssues.find(
                    (i) => i.issueId === String(selectedIssueForTiers.id),
                  )?.selectedTierId
                }
                loadingTiersFor={loadingTiersFor}
                setLoadingTiersFor={setLoadingTiersFor}
              />
            </div>
          </div>
        )}

        <div className="space-y-6 pt-6">
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
                    required={false}
                    selected={scheduledDate || undefined}
                    onSelect={(date) => setScheduledDate(date || null)}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-8">
          <Button
            onClick={() => router.push("/add-reparation/device")}
            variant="outline"
            size="lg"
          >
            Retour
          </Button>
          <div className="flex flex-col items-end">
            {!canProceedStep2 && selectedIssues.length > 0 && (
              <p className="text-sm text-red-500 mb-2 flex items-center">
                <X className="h-4 w-4 mr-1" />
                Veuillez sélectionner une qualité pour tous les pièces
                sélectionnées
              </p>
            )}
            <Button
              onClick={() => router.push("/add-reparation/client")}
              disabled={!canProceedStep2}
              size="lg"
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AddReparationIssuesPage;
