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
  const basePrice = Number(repair.base_price || 0);
  const totalPaid = Number(repair.total_paid || 0);
  const remainingBalance = Number(repair.remaining_balance || 0);
  const finalPrice = Number(repair.final_price || basePrice);

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
    cardPayment = Number(repair.card_payment || 0);
    cashPayment = Number(repair.cash_payment || 0);
  }

  // Use remaining_balance from backend, or calculate as fallback
  const remaining = remainingBalance || (finalPrice - totalPaid);
  const isPaymentComplete = repair.payment_status === "paid" || remaining <= 0;

  return {
    cardPayment,
    cashPayment,
    totalPaid,
    totalCostValue: finalPrice, // Use final_price as the actual cost
    remaining,
    isPaymentComplete,
  };
};
