"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepairsTable, RepairDetails } from "@/components/features/repairs";
import { useUpdateRepair } from "@/hooks/use-repairs";
import {
  type Repair,
  type RepairStatus,
  type RepairOutcome,
  type PaymentMethod,
  type DeviceType,
  type PaginatedResponse,
} from "@/types";
import { useUserRole } from "@/components/layout/providers";
import { SharedHeader } from "@/components/shared/shared-header";
import { toast } from "sonner";
import { RepairHighlightStats } from "@/components/features/repairs/RepairHighlightStats";
import { PaginatedLayout } from "@/components/layout/paginated-layout";
import api from "@/lib/api/client";

export default function ArchivesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RepairStatus | "all">("prete"); // Default to "prete" for archives
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<DeviceType | "all">(
    "all",
  );
  const updateRepair = useUpdateRepair();

  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { currentUser } = useUserRole();

  // Build query key for archives (only "prete" status)
  const baseQueryKey = ["archives", statusFilter, deviceTypeFilter];

  // Create query function for archives
  const fetchArchives = async (page: number, pageSize: number): Promise<PaginatedResponse<Repair>> => {
    const params: any = { page, page_size: pageSize };
    
    // For archives, always filter by "prete" status or specific status if selected
    if (statusFilter === "all") {
      params.status = "prete"; // Show only "prete" when "all" is selected
    } else {
      params.status = statusFilter;
    }
    
    if (deviceTypeFilter !== "all") params.device_type = deviceTypeFilter;
    
    const response = await api.get("/repairs/repairs/", { params });
    return response.data;
  };

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
          comment: comment
            ? `${repair.comment || ""}${repair.comment ? " | " : ""}${comment}`
            : repair.comment, // Append comment to existing comment if provided
          // TODO: Implement notification system on backend
        },
      },
      {
        onSuccess: () => {
          toast.success("Statut mis à jour avec succès");
          queryClient.invalidateQueries({ queryKey: ["archives"] });
        },
        onError: (error) => {
          toast.error("Erreur lors de la mise à jour du statut");
          console.error(error);
        },
      },
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
          queryClient.invalidateQueries({ queryKey: ["archives"] });
        },
        onError: () => {
          toast.error("Erreur lors de la planification");
        },
      },
    );
  };

  const handleRestitution = (repair: Repair) => {
    const updateData: Partial<Repair> = {};
    updateData.is_in_store = false;
    updateRepair.mutate(
      {
        id: String(repair.id),
        data: updateData,
      },
      {
        onSuccess: () => {
          toast.success("Appareil réstitué au client");
          queryClient.invalidateQueries({ queryKey: ["archives"] });
          queryClient.invalidateQueries({
            queryKey: ["repair", repair.id.toString()],
          });
        },
      },
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
          // Invalidate the archives query to refresh data everywhere
          queryClient.invalidateQueries({ queryKey: ["archives"] });
          queryClient.invalidateQueries({
            queryKey: ["repair", repair.id.toString()],
          });
        },
        onError: () => {
          toast.error("Erreur lors de l'ajout du paiement");
        },
      },
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
          status: "prete" as RepairStatus,
        },
      },
      {
        onSuccess: () => {
          toast.success("Marqué comme récupéré");
          setIsDetailsOpen(false);
          queryClient.invalidateQueries({ queryKey: ["archives"] });
        },
        onError: () => {
          toast.error("Erreur lors de la mise à jour");
        },
      },
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
          <PaginatedLayout
            queryKey={baseQueryKey}
            queryFn={fetchArchives}
            initialPageSize={10}
            className="flex-1"
          >
            {(repairs, isLoading, error, refetch) => (
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
                hiddenColumns={["status"]}
              />
            )}
          </PaginatedLayout>

          {isDetailsOpen && selectedRepair && (
            <div className="w-[400px] flex-none animate-in slide-in-from-right-10 duration-300">
              <RepairDetails
                repair={selectedRepair}
                onClose={() => setIsDetailsOpen(false)}
                onStatusChange={handleStatusChange}
                onSchedule={handleSchedule}
                onAddPayment={handleAddPayment}
                onRestitute={handleRestitution}
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
