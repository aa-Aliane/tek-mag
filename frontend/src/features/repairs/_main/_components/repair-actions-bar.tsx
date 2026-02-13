import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharedHeader } from "@/components/shared/shared-header";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  onAddRepair: () => void;
  title?: string;
  subtitle?: string;
}

export const RepairActionsBar: React.FC<Props> = ({
  onAddRepair,
  title = "Réparations",
  subtitle = "Gérez toutes vos réparations en cours",
  className,
  ...rest
}) => {
  return (
    <SharedHeader
      title={title}
      subtitle={subtitle}
      className={cn(className)}
      {...rest}
    >
      <div className="flex justify-end">
        <Button className="gap-2" onClick={onAddRepair}>
          <Plus className="h-4 w-4" />
          Nouvelle Réparation
        </Button>
      </div>
    </SharedHeader>
  );
};
