import type {
  Repair,
  RepairStatus,
  RepairOutcome,
  PaymentMethod,
} from "@/types";

export interface RepairDetailsProps {
  repair: Repair | null;
  onClose: () => void;
  onEdit?: (repair: Repair) => void;
  onStatusChange?: (
    repair: Repair,
    newStatus: RepairStatus,
    comment: string,
    notifyClient: boolean,
    outcome?: RepairOutcome,
  ) => void;
  onSchedule?: (repair: Repair, date: Date) => void;
  onAddPayment?: (
    repair: Repair,
    amount: number,
    method: PaymentMethod,
    note?: string,
  ) => void;
  onRestitute?: (repair: Repair) => void;
  onDeletePayment?: (repair: Repair, paymentId: string) => void;
  onMarkRecovered?: (repair: Repair) => void;
  currentUserName: string;
}

export interface RepairDetailsHeaderProps {
  repair: Repair;
  onClose: () => void;
  onEdit?: (repair: Repair) => void;
  onStatusChange?: () => void;
  onSchedule?: () => void;
  onMarkRecovered?: () => void;
  onAddPayment?: () => void;
  onPrint: () => void;
  isPaymentComplete: boolean;
  remaining: number;
  totalCostValue: number;
  isPaymentFormVisible: boolean;
  setIsPaymentFormVisible: (visible: boolean) => void;
}

export interface DeviceInfoSectionProps {
  repair: Repair;
}

export interface IssuesAndCostSectionProps {
  repair: Repair;
  totalCostValue: number;
  totalPaid: number;
  remaining: number;
  cardPayment: number;
  cashPayment: number;
}

export interface ClientInfoSectionProps {
  repair: Repair;
}

export interface AdditionalInfoSectionProps {
  repair: Repair;
}

export interface DatesInfoSectionProps {
  repair: Repair;
  formatDate: (
    date: Date | string | undefined,
    formatStr: string,
  ) => string | null;
}

export interface StatusHistorySectionProps {
  repair: Repair;
  formatDate: (
    date: Date | string | undefined,
    formatStr: string,
  ) => string | null;
}

export interface PaymentFormProps {
  repair: Repair;
  onClose: () => void;
  onAddPayment?: (
    repair: Repair,
    amount: number,
    method: PaymentMethod,
    note?: string,
  ) => void;
  totalCostValue: number;
  totalPaid: number;
  remaining: number;
}
