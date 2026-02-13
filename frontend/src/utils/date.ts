import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Safely formats a date string or Date object.
 * Returns a fallback string if the date is invalid.
 */
export function formatSafeDate(
  dateValue: string | Date | null | undefined,
  formatStr: string = "dd MMM yyyy",
  fallback: string = "N/A"
): string {
  if (!dateValue) return fallback;

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

  if (isNaN(date.getTime())) {
    return "Date invalide";
  }

  return format(date, formatStr, { locale: fr });
}
