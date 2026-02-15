import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Info } from "lucide-react";
import {
  updateStatusSchema,
  UpdateStatusFormValues,
  STATUS_CHOICES,
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface Props {
  currentStatus: string;
  onSubmit: (values: UpdateStatusFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UpdateStatusForm: React.FC<Props> = ({
  currentStatus,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const form = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: currentStatus,
      sendNotification: true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Status Selection */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouveau Statut</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STATUS_CHOICES.map((choice) => (
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

        {/* Notification Toggle - The "Shopify/SaaS" Style */}
        <FormField
          control={form.control}
          name="sendNotification"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border p-4 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Notifier le client
                </FormLabel>
                <FormDescription className="text-xs">
                  Envoyer un email automatique (noreply) au client.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

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
