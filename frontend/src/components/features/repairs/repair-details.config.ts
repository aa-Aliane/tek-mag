import type { RepairStatus } from "@/types";

export const statusConfig = {
  saisie: {
    label: "Saisie",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  "en-cours": {
    label: "En cours",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  prete: {
    label: "Prête",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  "en-attente": {
    label: "En attente",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
} as const satisfies Record<RepairStatus, { label: string; className: string }>;

export const depositStatusConfig = {
  deposited: {
    label: "Déposé",
    variant: "default" as const,
  },
  scheduled: {
    label: "Programmé", 
    variant: "secondary" as const,
  },
} as const;