import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCreatePayment, useCreateDiscount } from "@/hooks/use-repairs";
import { toast } from "sonner";
import type { Repair, RepairStatus, PaymentMethod } from "@/types";
import { useUpdateRepair } from "../_queries/use-repairs-mutations";

export const useRepairActions = () => {
  const queryClient = useQueryClient();
  const { mutate: updateRepair, isPending, variables } = useUpdateRepair();

  const handleStatusChange = useCallback((
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
  }, [updateRepair]);

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

  const createPayment = useCreatePayment();
  const createDiscount = useCreateDiscount();

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
            queryClient.invalidateQueries({ queryKey: ["repairs"] });
            queryClient.invalidateQueries({ queryKey: ["repair", String(repair.id)] });
            toast.success("Paiement ajouté avec succès");
          },
          onError: () => toast.error("Erreur lors de l'ajout du paiement"),
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
            reason: note || `Remise ${type === "percentage" ? `${value}%` : `${value}€`}`,
          },
        },
        {
          onSuccess: () => {
            toast.success("Remise appliquée avec succès");
            queryClient.invalidateQueries({ queryKey: ["repairs"] });
            queryClient.invalidateQueries({ queryKey: ["repair", String(repair.id)] });
          },
          onError: () => toast.error("Erreur lors de l'application de la remise"),
        },
      );
    },
    [createDiscount, queryClient],
  );

  const isLocationUpdating = isPending && variables?.type === "location";
  const isStatusUpdating = isPending && variables?.type === "status";

  return {
    handleStatusChange,
    handleQuickStatusChange,
    handleLocationChange,
    handleAddPayment,
    handleAddDiscount,
    isLocationUpdating,
    isStatusUpdating,
    updatingRepairId: variables?.id,
  };
};
