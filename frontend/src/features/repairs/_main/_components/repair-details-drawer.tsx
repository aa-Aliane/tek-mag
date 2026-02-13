"use client";

import React from "react";
import { RepairDetails } from "@/components/features/repairs/repair-details/repair-details";
import type { Repair, RepairStatus, PaymentMethod } from "@/types";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  repair: Repair | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (
    repair: Repair,
    newStatus: RepairStatus,
    comment: string,
    outcome?: boolean,
  ) => void;
  onSchedule: (repair: Repair, date: Date) => void;
  onAddPayment: (
    repair: Repair,
    amount: number,
    method: PaymentMethod,
    note?: string,
  ) => void;
  onAddDiscount?: (
    repair: Repair,
    amount: number,
    type: "percentage" | "fixed",
    value: string,
    note?: string,
  ) => void;
  onRestitute: (repair: Repair) => void;
  onDeletePayment: (repair: Repair, paymentId: string) => void;
  onMarkRecovered: (repair: Repair) => void;
  currentUserName: string;
}

export const RepairDetailsDrawer: React.FC<Props> = ({
  repair,
  isOpen,
  onClose,
  onStatusChange,
  onSchedule,
  onAddPayment,
  onAddDiscount,
  onRestitute,
  onDeletePayment,
  onMarkRecovered,
  currentUserName,
  className,
  ...rest
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className={cn("sm:max-w-[500px] p-0 overflow-y-auto", className)} {...rest}>
        <SheetHeader className="sr-only">
          <SheetTitle>Détails de la réparation</SheetTitle>
        </SheetHeader>
        {repair && (
          <RepairDetails
            repair={repair}
            onClose={onClose}
            onStatusChange={onStatusChange}
            onSchedule={onSchedule}
            onAddPayment={onAddPayment}
            onAddDiscount={onAddDiscount}
            onRestitute={onRestitute}
            onDeletePayment={onDeletePayment}
            onMarkRecovered={onMarkRecovered}
            currentUserName={currentUserName}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
