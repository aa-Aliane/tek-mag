"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRepairs } from "@/hooks/use-repairs";
import { type Repair, type RepairStatus, type DeviceType } from "@/types";
import { useUserRole } from "@/components/layout/providers";
import { RepairHighlightStats } from "@/components/features/repairs/RepairHighlightStats";
import { RepairActionsPanel } from "./_components/repair-actions-panel";
import { RepairFilters } from "./_components/repair-filters";
import { RepairDetailsSidebar } from "./_components/repair-details-sidebar";
import { useRepairManagement } from "./_hooks/use-repair-management";

export default function RepairsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RepairStatus | "all">("all");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<DeviceType | "all">(
    "all"
  );
  const { data } = useRepairs(
    1,
    statusFilter === "all" ? undefined : statusFilter,
    undefined, // client filter
    deviceTypeFilter === "all" ? undefined : deviceTypeFilter
  );
  const repairs = data?.results || [];

  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { currentUser } = useUserRole();

  const {
    handleStatusChange,
    handleQuickStatusChange,
    handleSchedule,
    handleRestitution,
    handleAddPayment,
    handleDeletePayment,
    handleMarkRecovered,
  } = useRepairManagement();

  // Update selected repair when data changes
  useEffect(() => {
    if (data?.results && selectedRepair) {
      const updatedRepair = data.results.find(
        (r) => r.id === selectedRepair.id
      );
      if (updatedRepair) {
        setSelectedRepair(updatedRepair);
      }
    }
  }, [data?.results, selectedRepair]);

  const handleViewDetails = (repair: Repair) => {
    setSelectedRepair(repair);
    setIsDetailsOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <RepairActionsPanel onAddRepair={() => router.push("/add-reparation")} />

      <div className="p-4 sm:p-8 flex-1 flex flex-col gap-4 sm:gap-6 min-h-0">
        <RepairHighlightStats className="mb-4 sm:mb-6" />

        <div className="flex gap-6 flex-1 min-h-0">
          <RepairFilters
            repairs={repairs}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            deviceTypeFilter={deviceTypeFilter}
            setDeviceTypeFilter={setDeviceTypeFilter}
            onViewDetails={handleViewDetails}
            onStatusChange={handleQuickStatusChange}
          />

          <RepairDetailsSidebar
            repair={selectedRepair}
            isOpen={isDetailsOpen}
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
      </div>
    </div>
  );
}
