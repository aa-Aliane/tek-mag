import { RepairDetails } from "@/components/features/repairs/repair-details/repair-details";
import type { Repair, RepairStatus, PaymentMethod } from "@/types";

interface RepairDetailsSidebarProps {
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

export function RepairDetailsSidebar({
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
}: RepairDetailsSidebarProps) {
  return (
    <div className={`
      fixed right-0 top-0 h-full w-[400px] bg-background border-l border-border shadow-lg
      transform transition-transform duration-300 ease-in-out z-50
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
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
    </div>
  );
}
