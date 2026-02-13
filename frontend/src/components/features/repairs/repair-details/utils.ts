import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Repair } from "@/types";

export const formatDate = (
  date: Date | string | undefined,
  formatStr: string,
) => {
  if (!date) return null;
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return null;
    return format(dateObj, formatStr, { locale: fr });
  } catch {
    return null;
  }
};

export const calculatePayments = (repair: Repair) => {
  // Use new backend financial structure
  const basePrice = Number(repair.basePrice || 0);
  const totalPaid = Number(repair.totalPaid || 0);
  const remainingBalance = Number(repair.remainingBalance || 0);
  const finalPrice = Number(repair.finalPrice || basePrice);

  // Calculate card and cash payments from payments array if available
  let cardPayment = 0;
  let cashPayment = 0;
  
  if (repair.payments && Array.isArray(repair.payments)) {
    repair.payments.forEach((payment) => {
      const amount = Number(payment.amount || 0);
      if (payment.method === "card") {
        cardPayment += amount;
      } else if (payment.method === "cash") {
        cashPayment += amount;
      }
    });
  } else {
    // Fallback to legacy fields for backward compatibility
    cardPayment = Number(repair.cardPayment || 0);
    cashPayment = Number(repair.cashPayment || 0);
  }

  // Use remainingBalance from backend, or calculate as fallback
  const remaining = remainingBalance || (finalPrice - totalPaid);
  const isPaymentComplete = repair.paymentStatus === "paid" || remaining <= 0;

  return {
    cardPayment,
    cashPayment,
    totalPaid,
    totalCostValue: finalPrice, // Use finalPrice as the actual cost
    remaining,
    isPaymentComplete,
  };
};
