import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateRepair } from "@/hooks/use-repairs";
import { toast } from "sonner";
import type { Repair, RepairStatus, PaymentMethod } from "@/types";

export function useRepairManagement() {
  const queryClient = useQueryClient();
  const updateRepair = useUpdateRepair();

  const handleStatusChange = useCallback(
    (
      repair: Repair,
      newStatus: RepairStatus,
      comment: string,
      outcome?: boolean
    ) => {
      updateRepair.mutate(
        {
          id: String(repair.id),
          data: {
            status: newStatus,
            is_successful: outcome,
            comment: comment
              ? `${repair.comment || ""}${repair.comment ? " | " : ""}${comment}`
              : repair.comment,
          },
        },
        {
          onSuccess: () => {
            toast.success("Statut mis à jour avec succès");
          },
          onError: (error) => {
            toast.error("Erreur lors de la mise à jour du statut");
            console.error(error);
          },
        }
      );
    },
    [updateRepair]
  );

  const handleQuickStatusChange = useCallback(
    (
      repair: Repair,
      newStatus: RepairStatus,
      comment: string,
      notifyClient: boolean
    ) => {
      handleStatusChange(repair, newStatus, comment, notifyClient);
    },
    [handleStatusChange]
  );

  const handleSchedule = useCallback(
    (repair: Repair, date: Date) => {
      updateRepair.mutate(
        {
          id: String(repair.id),
          data: {
            scheduledDate: date,
            depositStatus: "scheduled",
          },
        },
        {
          onSuccess: () => {
            toast.success("Rendez-vous planifié avec succès");
          },
          onError: () => {
            toast.error("Erreur lors de la planification");
          },
        }
      );
    },
    [updateRepair]
  );

  const handleRestitution = useCallback(
    (repair: Repair) => {
      const updateData: Partial<Repair> = {};
      updateData.is_in_store = false;
      updateRepair.mutate(
        {
          id: repair.id,
          data: updateData,
        },
        {
          onSuccess: () => {
            toast.success("Appareil réstitué au client");
            queryClient.invalidateQueries({ queryKey: ["repairs"] });
            queryClient.invalidateQueries({
              queryKey: ["repair", repair.id.toString()],
            });
          },
        }
      );
    },
    [updateRepair, queryClient]
  );

  const handleAddPayment = useCallback(
    (repair: Repair, amount: number, method: PaymentMethod, note?: string) => {
      const currentCard = Number(repair.card_payment || 0);
      const currentCash = Number(repair.cash_payment || 0);

      const updateData: Partial<Repair> = {};
      if (method === "card") {
        updateData.card_payment = String(currentCard + amount);
      } else {
        updateData.cash_payment = String(currentCash + amount);
      }

      updateRepair.mutate(
        {
          id: String(repair.id),
          data: updateData,
        },
        {
          onSuccess: () => {
            toast.success("Paiement ajouté avec succès");
            queryClient.invalidateQueries({ queryKey: ["repairs"] });
            queryClient.invalidateQueries({
              queryKey: ["repair", repair.id.toString()],
            });
          },
          onError: () => {
            toast.error("Erreur lors de l'ajout du paiement");
          },
        }
      );
    },
    [updateRepair, queryClient]
  );

  const handleDeletePayment = useCallback(
    (repair: Repair, paymentId: string) => {
      toast.error("Suppression de paiement non supportée pour le moment");
    },
    []
  );

  const handleMarkRecovered = useCallback(
    (repair: Repair) => {
      updateRepair.mutate(
        {
          id: String(repair.id),
          data: {
            recoveredAt: new Date(),
            status: "prete",
          },
        },
        {
          onSuccess: () => {
            toast.success("Marqué comme récupéré");
          },
          onError: () => {
            toast.error("Erreur lors de la mise à jour");
          },
        }
      );
    },
    [updateRepair]
  );

  return {
    handleStatusChange,
    handleQuickStatusChange,
    handleSchedule,
    handleRestitution,
    handleAddPayment,
    handleDeletePayment,
    handleMarkRecovered,
  };
}
