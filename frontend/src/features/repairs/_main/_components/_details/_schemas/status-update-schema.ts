import * as z from "zod";

export const STATUS_CHOICES = [
  { value: "saisie", label: "Saisie" },
  { value: "en-cours", label: "En cours" },
  { value: "prete", label: "Prête" },
  { value: "en-attente", label: "En attente" },
  { value: "terminé", label: "Terminé" },
] as const;

export const updateStatusSchema = z.object({
  status: z.string().min(1, "Le statut est requis"),
  sendNotification: z.boolean().default(true),
  note: z.string().optional(),
});

export type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;
