"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { Repair, RepairStatus, RepairOutcome, PaymentMethod } from "@/types"
import { RepairDetails } from "./repair-details"

interface RepairDetailsSheetProps {
  repair: Repair | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (repair: Repair) => void
  onStatusChange?: (
    repair: Repair,
    newStatus: RepairStatus,
    comment: string,
    notifyClient: boolean,
    outcome?: RepairOutcome,
  ) => void
  onSchedule?: (repair: Repair, date: Date) => void
  onAddPayment?: (repair: Repair, amount: number, method: PaymentMethod, note?: string) => void
  onDeletePayment?: (repair: Repair, paymentId: string) => void
  onMarkRecovered?: (repair: Repair) => void
  currentUserName: string
}

export function RepairDetailsSheet({
  repair,
  open,
  onOpenChange,
  onEdit,
  onStatusChange,
  onSchedule,
  onAddPayment,
  onDeletePayment,
  onMarkRecovered,
  currentUserName,
}: RepairDetailsSheetProps) {
  if (!repair) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:w-[540px] p-0 sm:max-w-none">
        <SheetHeader className="p-4">
          <SheetTitle>Réparation - {repair.brand || 'Inconnu'} {repair.model || 'Inconnu'}</SheetTitle>
        </SheetHeader>
        <RepairDetails
          repair={repair}
          onClose={() => onOpenChange(false)}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
          onSchedule={onSchedule}
          onAddPayment={onAddPayment}
          onDeletePayment={onDeletePayment}
          onMarkRecovered={onMarkRecovered}
          currentUserName={currentUserName}
        />
      </SheetContent>
    </Sheet>
  )
}
