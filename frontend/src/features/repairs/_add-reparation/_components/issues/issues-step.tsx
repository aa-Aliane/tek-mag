"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReparationStore } from "@/lib/store";
import { useAddReparationStore } from "@/store/addReparationStore";
import { useCommonIssues } from "@/hooks/use-common-issues";
import { Issue } from "@/types";
import { useSubtotal } from "../../_hooks/use-issue-pricing";
import { StepLayout } from "../../_layouts/step-layout";
import IssuesGrid from "./issues-grid";
import IssueDetailsForm from "./issue-details-form";
import QualityTierDialog from "./quality-tier-dialog";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  params?: any;
  searchParams?: any;
}

export const IssuesStep: React.FC<Props> = ({ 
  className, 
  params,
  searchParams,
  ...rest 
}) => {
  const router = useRouter();
  const { setFormData: setGlobalFormData } = useAddReparationStore();
  const {
    deviceType,
    model,
    selectedIssues,
    addIssue,
    removeIssue,
    updateIssueTier,
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
  } = useReparationStore();

  // Fetch data from backend
  const {
    data: commonIssuesData,
    isLoading: isLoadingCommonIssues,
    error: commonIssuesError,
  } = useCommonIssues(deviceType);

  const commonIssues = commonIssuesData || [];

  // Calculate subtotal
  const { subtotal } = useSubtotal(selectedIssues, commonIssues, Number(model));

  // Sync subtotal to global store
  useEffect(() => {
    setGlobalFormData({ totalPrice: parseFloat(subtotal) });
  }, [subtotal, setGlobalFormData]);

  // State for quality tier selection
  const [loadingTiersFor, setLoadingTiersFor] = useState<string | null>(null);
  const [selectedIssueForTiers, setSelectedIssueForTiers] = useState<Issue | null>(null);

  const toggleIssue = (issue: Issue) => {
    const exists = selectedIssues.some((i) => i.issueId === String(issue.id));
    if (exists) {
      removeIssue(issue.id);
    } else {
      addIssue(issue.id, issue.name, issue.categoryType);
      if (issue.categoryType === "part_based") {
        setSelectedIssueForTiers(issue);
      }
    }
  };

  const handleTierSelect = (issueId: string, tierId: number) => {
    updateIssueTier(issueId, tierId);
  };

  const canProceed =
    selectedIssues.length > 0 &&
    selectedIssues.every(
      (issue) =>
        issue.categoryType === "service_based" ||
        (issue.categoryType === "part_based" && issue.selectedTierId)
    );

  if (commonIssuesError) {
    return (
      <div className={cn("flex items-center justify-center min-h-[400px]", className)} {...rest}>
        <div className="text-center p-4">
          <p className="text-lg text-red-600">Erreur de chargement des données</p>
          <p className="text-sm text-muted-foreground mt-2">Veuillez réessayer plus tard</p>
        </div>
      </div>
    );
  }

  return (
    <StepLayout
      title="Problèmes rencontrés"
      description="Sélectionnez tous les problèmes qui s'appliquent"
      onBack={() => router.push("/add-reparation/device")}
      onNext={() => router.push("/add-reparation/client")}
      isNextDisabled={!canProceed}
      className={className}
      {...rest}
    >
      <div className="space-y-8">
        <IssuesGrid
          issues={commonIssues}
          selectedIssues={selectedIssues}
          isLoading={isLoadingCommonIssues}
          onToggleIssue={toggleIssue}
          onShowTiers={setSelectedIssueForTiers}
        />

        {selectedIssueForTiers && (
          <QualityTierDialog
            issue={selectedIssueForTiers}
            modelId={model}
            onClose={() => setSelectedIssueForTiers(null)}
            onTierSelect={handleTierSelect}
            selectedTierId={
              selectedIssues.find((i) => i.issueId === String(selectedIssueForTiers.id))
                ?.selectedTierId
            }
            loadingTiersFor={loadingTiersFor}
            setLoadingTiersFor={setLoadingTiersFor}
          />
        )}

        <IssueDetailsForm
          description={description}
          setDescription={setDescription}
          accessories={accessories}
          setAccessories={setAccessories}
          password={password}
          setPassword={setPassword}
          depositReceived={depositReceived}
          setDepositReceived={setDepositReceived}
          scheduledDate={scheduledDate}
          setScheduledDate={setScheduledDate}
        />
      </div>
    </StepLayout>
  );
};
