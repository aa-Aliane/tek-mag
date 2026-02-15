import React from "react";
import { DialogLayout } from "@/layouts";
import { Repair } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repair: Repair;
  children?: React.ReactNode;
}

const StatusUpdateDialog: React.FC<Props> = ({
  open,

  onOpenChange,
  children,
}) => {
  return (
    <DialogLayout
      title="Mise à jour du statut de la réparation"
      open={open}
      onOpenChange={onOpenChange}
    >
      {children}
    </DialogLayout>
  );
};

export default StatusUpdateDialog;
