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
  const cardPayment = Number(repair.card_payment || 0);
  const cashPayment = Number(repair.cash_payment || 0);
  const totalPaid = cardPayment + cashPayment;

  const totalCostValue =
    repair.totalCost !== undefined &&
    repair.totalCost !== null &&
    !isNaN(repair.totalCost)
      ? Number(repair.totalCost)
      : !isNaN(Number(repair.price)) && isFinite(Number(repair.price))
        ? Number(repair.price)
        : 0;

  const remaining =
    repair.payments?.reduce(
      (acc, payment) => acc - Number(payment.amount),
      totalCostValue,
    ) ?? totalCostValue;
  const isPaymentComplete = remaining <= 0;

  return {
    cardPayment,
    cashPayment,
    totalPaid,
    totalCostValue,
    remaining,
    isPaymentComplete,
  };
};
