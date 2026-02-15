import * as z from "zod";

export const LOCATION_CHOICES = [
  { value: "in_store", label: "En magasin" },
  { value: "at_client", label: "Chez le client" },
] as const;

export const updateLocationSchema = z.object({
  isInStore: z.boolean(),
});

export type UpdateLocationFormValues = z.infer<typeof updateLocationSchema>;
