"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepairsTable, RepairDetails } from "@/components/features/calendrier";
import { useRepairs, useUpdateRepair } from "@/hooks/use-repairs";
import { mockArchivedRepairs } from "@/lib/data";
import {
  type Repair,
  type RepairStatus,
  type RepairOutcome,
  type PaymentMethod,
  type DeviceType,
} from "@/types";
import { useUserRole } from "@/components/layout/providers";
import { SharedHeader } from '@/components/shared/shared-header';
import { toast } from "sonner";
import { RepairHighlightStats } from "@/components/features/repairs/RepairHighlightStats";

export default function RepairsPage() {
  const router = useRouter();
  const queryClient = useQueryClient(); // Add queryClient
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RepairStatus | "all">("all");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<DeviceType | "all">("all");
  const { data, isLoading, error } = useRepairs(
    1,
    statusFilter === "all" ? undefined : statusFilter,
    undefined, // client filter
    deviceTypeFilter === "all" ? undefined : deviceTypeFilter
  );
  const updateRepair = useUpdateRepair();
  const repairs = data?.results || [];

  const [archivedRepairs, setArchivedRepairs] =
    useState<Repair[]>(mockArchivedRepairs);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { currentUser } = useUserRole();

  // Update selected repair when data changes
  useEffect(() => {
    if (data?.results && selectedRepair) {
      const updatedRepair = data.results.find(r => r.id === selectedRepair.id);
      if (updatedRepair) {
        setSelectedRepair(updatedRepair);
      }
    }
  }, [data?.results, selectedRepair]);

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
        },
        onError: (error) => {
          toast.error("Erreur lors de la mise à jour du statut");
          console.error(error);
        },
      }
    );
  };

  // Overloaded function for table quick status change (without outcome parameter)
  const handleQuickStatusChange = (
    repair: Repair,
    newStatus: RepairStatus,
    comment: string,
    notifyClient: boolean,
  ) => {
    handleStatusChange(repair, newStatus, comment, notifyClient);
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

  const handleViewDetails = (repair: Repair) => {
    setSelectedRepair(repair);
    setIsDetailsOpen(true);
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
        },
        onError: () => {
          toast.error("Erreur lors de la mise à jour");
        },
      }
    );
  };

  return (
    <div className="h-full flex flex-col">
      <SharedHeader
        title="Réparations"
        subtitle="Gérez toutes vos réparations en cours"
      >
        <div className="flex justify-end">
          <Button
            className="gap-2"
            onClick={() => router.push("/add-reparation")}
          >
            <Plus className="h-4 w-4" />
            Nouvelle Réparation
          </Button>
        </div>
      </SharedHeader>

      <div className="p-4 sm:p-8 flex-1 flex flex-col gap-4 sm:gap-6 min-h-0">
        <RepairHighlightStats className="mb-4 sm:mb-6" />

        <div className="flex gap-6 flex-1 min-h-0">
          <div className={`flex-1 min-w-0 transition-all duration-300`}>
            <RepairsTable
              repairs={repairs}
              onViewDetails={handleViewDetails}
              onStatusChange={handleQuickStatusChange}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              deviceTypeFilter={deviceTypeFilter}
              setDeviceTypeFilter={setDeviceTypeFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
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
                currentUserName={currentUser.username}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}