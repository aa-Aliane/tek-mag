import React from "react";
import { DialogLayout } from "@/components/layout/dialog-layout";

interface Props extends React.ComponentPropsWithoutRef<"dialog"> {
  title?: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  onConfirm: () => void;
  confirmLabel: string;
  confirmDisabled?: boolean;
  cancelLabel: string;
}

export const StatusDialog: React.FC<Props> = ({
  title = "Changement du status de la réparation",
  open,
  onOpenChange,
  onConfirm,
  confirmLabel,
  confirmDisabled,
  cancelLabel,
  children,
  className,
  ...rest
}) => {
  return (
    <DialogLayout
      title={title}
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      confirmLabel={confirmLabel}
      confirmDisabled={confirmDisabled}
      cancelLabel={cancelLabel}
      className={className}
      {...rest}
    >
      <div>status change here</div>
    </DialogLayout>
  );
};
