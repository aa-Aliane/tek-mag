import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import {
  updateLocationSchema,
  UpdateLocationFormValues,
  LOCATION_CHOICES,
} from "../_schemas";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Props {
  isInStore: boolean;
  onSubmit: (values: UpdateLocationFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UpdateLocationForm: React.FC<Props> = ({
  isInStore,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const form = useForm<UpdateLocationFormValues>({
    resolver: zodResolver(updateLocationSchema),
    defaultValues: {
      isInStore: isInStore,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Location Selection */}
        <FormField
          control={form.control}
          name="isInStore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouvel Emplacement</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "in_store")}
                defaultValue={field.value ? "in_store" : "at_client"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un emplacement" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LOCATION_CHOICES.map((choice) => (
                    <SelectItem key={choice.value} value={choice.value}>
                      {choice.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-md border p-4 bg-muted/20">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Note</p>
              <p className="text-xs text-muted-foreground">
                L'emplacement permet de savoir si l'appareil est actuellement en magasin ou chez le client.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Mise à jour..." : "Confirmer le changement"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
