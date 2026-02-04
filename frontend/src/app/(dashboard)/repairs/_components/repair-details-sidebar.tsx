import { RepairDetails } from "@/components/features/repairs";
import type { Repair, RepairStatus, PaymentMethod } from "@/types";

interface RepairDetailsSidebarProps {
  repair: Repair | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (
    repair: Repair,
    newStatus: RepairStatus,
    comment: string,
    outcome?: boolean
  ) => void;
  onSchedule: (repair: Repair, date: Date) => void;
  onAddPayment: (
    repair: Repair,
    amount: number,
    method: PaymentMethod,
    note?: string
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
  onRestitute,
  onDeletePayment,
  onMarkRecovered,
  currentUserName,
}: RepairDetailsSidebarProps) {
  if (!isOpen || !repair) return null;

  return (
    <div className="w-[400px] flex-none animate-in slide-in-from-right-10 duration-300">
      <RepairDetails
        repair={repair}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onSchedule={onSchedule}
        onAddPayment={onAddPayment}
        onRestitute={onRestitute}
        onDeletePayment={onDeletePayment}
        onMarkRecovered={onMarkRecovered}
        currentUserName={currentUserName}
      />
    </div>
  );
}
