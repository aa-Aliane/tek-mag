import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharedHeader } from "@/components/shared/shared-header";

interface RepairActionsPanelProps {
  onAddRepair: () => void;
}

export function RepairActionsPanel({ onAddRepair }: RepairActionsPanelProps) {
  return (
    <SharedHeader
      title="Réparations"
      subtitle="Gérez toutes vos réparations en cours"
    >
      <div className="flex justify-end">
        <Button className="gap-2" onClick={onAddRepair}>
          <Plus className="h-4 w-4" />
          Nouvelle Réparation
        </Button>
      </div>
    </SharedHeader>
  );
}
