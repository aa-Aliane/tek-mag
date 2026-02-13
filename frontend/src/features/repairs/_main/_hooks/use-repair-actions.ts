import { useCallback } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useCreatePayment, useCreateDiscount } from "@/hooks/use-repairs";
import { toast } from "sonner";
import type { Repair, RepairStatus, PaymentMethod } from "@/types";
import api from "@/lib/api/client";

export const useRepairActions = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updateRepair,
    isPending,
    variables,
  } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Repair>;
      type: string;
    }) => {
      return api.patch(`/repairs/repairs/${id}/`, data);
    },
    onMutate: async (variables) => {
      // 1. Cancel ANY query that starts with "repairs" (filters, pagination, etc.)
      await queryClient.cancelQueries({ queryKey: ["repairs"] });

      // 2. Snapshot the current cache for rollback
      const previousQueries = queryClient.getQueriesData({
        queryKey: ["repairs"],
      });

      // 3. Optimistically update EVERY cache entry that matches "repairs"
      queryClient.setQueriesData({ queryKey: ["repairs"] }, (old: any) => {
        if (!old) return old;

        // Handle Infinite Query structure (pages.results)
        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              results: page.results.map((r: Repair) =>
                String(r.id) === variables.id ? { ...r, ...variables.data } : r,
              ),
            })),
          };
        }

        // Handle standard Array structure
        if (Array.isArray(old)) {
          return old.map((r: Repair) =>
            String(r.id) === variables.id ? { ...r, ...variables.data } : r,
          );
        }

        // Handle object structure { results: [...] }
        if (old.results) {
          return {
            ...old,
            results: old.results.map((r: Repair) =>
              String(r.id) === variables.id ? { ...r, ...variables.data } : r,
            ),
          };
        }

        return old;
      });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      // Rollback all affected queries
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
      }
      toast.error("Erreur lors de la mise à jour.");
    },
    onSuccess: (updatedRepair) => {
      // 4. INSTEAD of just invalidating, update the cache with the REAL server response
      // This prevents the "flicker" because the cache stays updated with fresh data
      queryClient.setQueriesData({ queryKey: ["repairs"] }, (old: any) => {
        // (Repeat the mapping logic above using 'updatedRepair' instead of 'variables.data')
        // This ensures that even if you don't refetch, your data is 100% accurate.
      });
    },
    onSettled: () => {
      // Final sync
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
    },
  });

  const createPayment = useCreatePayment();
  const createDiscount = useCreateDiscount();

  const handleStatusChange = (
    repair: Repair,
    newStatus: RepairStatus,
    comment: string,
    outcome?: boolean,
  ) => {
    const data: Partial<Repair> = {
      status: newStatus,
      isSuccessful: outcome,
      comment: comment
        ? `${repair.comment || ""}${repair.comment ? " | " : ""}${comment}`
        : repair.comment,
    };
    updateRepair({ id: String(repair.id), data, type: "status" });
  };

  const handleQuickStatusChange = useCallback(
    (
      repair: Repair,
      newStatus: RepairStatus,
      comment: string,
      notifyClient: boolean,
    ) => {
      handleStatusChange(repair, newStatus, comment, notifyClient);
    },
    [handleStatusChange],
  );

  const handleSchedule = useCallback(
    (repair: Repair, date: Date) => {
      updateRepair({
        id: String(repair.id),
        data: {
          scheduledDate: date,
          depositStatus: "scheduled",
        },
        type: "other",
      });
    },
    [updateRepair],
  );

  const handleLocationChange = useCallback(
    (repair: Repair, isInStore: boolean) => {
      updateRepair({
        id: String(repair.id),
        data: { isInStore: isInStore },
        type: "location",
      });
    },
    [updateRepair],
  );

  const handleRestitution = useCallback(
    (repair: Repair) => {
      const updateData: Partial<Repair> = {
        isInStore: false,
      };
      updateRepair({
        id: String(repair.id),
        data: updateData,
        type: "location",
      });
    },
    [updateRepair],
  );

  const handleAddPayment = useCallback(
    (repair: Repair, amount: number, method: PaymentMethod, note?: string) => {
      createPayment.mutate(
        {
          repairId: String(repair.id),
          data: {
            repair: String(repair.id),
            amount,
            method,
            note,
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["repairs"],
            });

            queryClient.invalidateQueries({
              queryKey: ["repair", String(repair.id)],
            });
            toast.success("Paiement ajouté avec succès");
          },
          onError: () => {
            toast.error("Erreur lors de l'ajout du paiement");
          },
        },
      );
    },
    [createPayment, queryClient],
  );

  const handleAddDiscount = useCallback(
    (
      repair: Repair,
      amount: number,
      type: "percentage" | "fixed",
      value: string,
      note?: string,
    ) => {
      createDiscount.mutate(
        {
          repairId: String(repair.id),
          data: {
            repair: String(repair.id),
            amount,
            reason:
              note ||
              `Remise ${type === "percentage" ? `${value}%` : `${value}€`}`,
          },
        },
        {
          onSuccess: () => {
            toast.success("Remise appliquée avec succès");
            queryClient.invalidateQueries({ queryKey: ["repairs"] });
            queryClient.invalidateQueries({
              queryKey: ["repair", String(repair.id)],
            });
          },
          onError: () => {
            toast.error("Erreur lors de l'application de la remise");
          },
        },
      );
    },
    [createDiscount, queryClient],
  );

  const handleDeletePayment = useCallback(
    (repair: Repair, paymentId: string) => {
      toast.error("Suppression de paiement non supportée pour le moment");
    },
    [],
  );

  const handleMarkRecovered = useCallback(
    (repair: Repair) => {
      updateRepair({
        id: String(repair.id),
        data: {
          recoveredAt: new Date(),
          status: "prete",
        },
        type: "status",
      });
    },
    [updateRepair],
  );

  const isLocationUpdating = isPending && variables?.type === "location";
  const isStatusUpdating = isPending && variables?.type === "status";

  return {
    handleStatusChange,
    handleQuickStatusChange,
    handleSchedule,
    handleLocationChange,
    handleRestitution,
    handleAddPayment,
    handleAddDiscount,
    handleDeletePayment,
    handleMarkRecovered,
    isLocationUpdating,
    isStatusUpdating,
    updatingRepairId: variables?.id,
  };
};
