import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Issue } from "@/types";
import { QualityTierSelector } from "./quality-tier-selector";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  issue: Issue;
  modelId: string | number;
  onClose: () => void;
  onTierSelect: (issueId: string, tierId: number) => void;
  selectedTierId?: number;
  loadingTiersFor: string | null;
  setLoadingTiersFor: (id: string | null) => void;
}

const QualityTierDialog: React.FC<Props> = ({
  issue,
  modelId,
  onClose,
  onTierSelect,
  selectedTierId,
  loadingTiersFor,
  setLoadingTiersFor,
  ...rest
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" {...rest}>
      <div className="bg-background rounded-xl border w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sélectionner la qualité</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          <p className="font-medium">{issue.name}</p>
          <p className="text-sm text-muted-foreground">
            Sélectionnez la qualité de la pièce
          </p>
        </div>

        <QualityTierSelector
          issueId={issue.id}
          modelId={modelId}
          associatedPartId={issue.associatedPart}
          onTierSelect={(issueId, tierId) => {
            onTierSelect(issueId, tierId);
            onClose();
          }}
          selectedTierId={selectedTierId}
          loadingTiersFor={loadingTiersFor}
          setLoadingTiersFor={setLoadingTiersFor}
        />
      </div>
    </div>
  );
};

export default QualityTierDialog;
