"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { RepairCalendar, RepairDetails } from "@/components/features/calendrier"
import { useRepairs, useUpdateRepair } from "@/hooks/use-repairs"
import { type Repair, type RepairStatus, type RepairOutcome, type PaymentMethod } from "@/types"
import { currentUser } from "@/components/layout/providers"
import { SharedHeader } from '@/components/shared/shared-header';
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CalendrierPage() {
  const { data: repairsData, isLoading, isError, refetch } = useRepairs(1); // Use first page
  const updateRepair = useUpdateRepair();
  const queryClient = useQueryClient(); // Add queryClient
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    if (repairsData) {
      // Filter repairs to only include those with scheduled dates
      const scheduledRepairs = repairsData.results.filter(repair => repair.scheduledDate);
      setRepairs(scheduledRepairs);

      // If we have a selected repair, update it with the new data
      if (selectedRepair) {
        const updatedRepair = repairsData.results.find(r => r.id === selectedRepair.id);
        if (updatedRepair) {
          setSelectedRepair(updatedRepair);
        }
      }
    }
  }, [repairsData, selectedRepair]);

  const handleSelectRepair = (repair: Repair) => {
    setSelectedRepair(repair)
    setIsDetailsOpen(true)
  }

  const handleStatusChange = (
    repair: Repair,
    newStatus: RepairStatus,
    comment: string,
    notifyClient: boolean,
    outcome?: RepairOutcome,
  ) => {
    updateRepair.mutate(
      {
        id: String(repair.id),
        data: {
          status: newStatus,
          outcome: outcome,
          comment: comment ? `${repair.comment || ''}${repair.comment ? ' | ' : ''}${comment}` : repair.comment, // Append comment to existing comment if provided
          // TODO: Implement notification system on backend
        },
      },
      {
        onSuccess: () => {
          toast.success("Statut mis à jour avec succès");
          // Refresh the calendar data
          refetch();
        },
        onError: (error) => {
          toast.error("Erreur lors de la mise à jour du statut");
          console.error(error);
        },
      }
    );
  };

  const handleSchedule = (repair: Repair, date: Date) => {
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
          // Refresh the calendar data
          refetch();
        },
        onError: () => {
          toast.error("Erreur lors de la planification");
        },
      }
    );
  };

  const handleAddPayment = (
    repair: Repair,
    amount: number,
    method: PaymentMethod,
    note?: string,
  ) => {
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
          // Invalidate the repairs query to refresh data everywhere
          queryClient.invalidateQueries({ queryKey: ["repairs"] });
          queryClient.invalidateQueries({ queryKey: ["repair", repair.id.toString()] });
        },
        onError: () => {
          toast.error("Erreur lors de l'ajout du paiement");
        },
      }
    );
  };

  const handleDeletePayment = (repair: Repair, paymentId: string) => {
    toast.error("Suppression de paiement non supportée pour le moment");
  };

  const handleMarkRecovered = (repair: Repair) => {
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
          setIsDetailsOpen(false);
          // Refresh the calendar data
          refetch();
        },
        onError: () => {
          toast.error("Erreur lors de la mise à jour");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Erreur lors du chargement des réparations</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <SharedHeader
        title="Calendrier"
        subtitle="Planifiez et visualisez vos réparations"
      />

      <div className="p-4 sm:p-8 flex-1 flex flex-col min-h-0">
        <div className="flex gap-6 flex-1 min-h-0">
          <div className={`flex-1 min-w-0 transition-all duration-300`}>
            <RepairCalendar repairs={repairs} onSelectRepair={handleSelectRepair} />
          </div>

          {isDetailsOpen && selectedRepair && (
            <div className="w-[400px] flex-none animate-in slide-in-from-right-10 duration-300">
              <RepairDetails
                repair={selectedRepair}
                onClose={() => setIsDetailsOpen(false)}
                onStatusChange={handleStatusChange}
                onSchedule={handleSchedule}
                onAddPayment={handleAddPayment}
                onDeletePayment={handleDeletePayment}
                onMarkRecovered={handleMarkRecovered}
                currentUserName={currentUser.name}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
