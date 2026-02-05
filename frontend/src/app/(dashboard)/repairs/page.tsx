"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type Repair, type RepairStatus, type DeviceType, type PaginatedResponse } from "@/types";
import { useUserRole } from "@/components/layout/providers";
import { RepairHighlightStats } from "@/components/features/repairs/RepairHighlightStats";
import { RepairActionsPanel } from "./_components/repair-actions-panel";
import { RepairFilters } from "./_components/repair-filters";
import { RepairDetailsSidebar } from "./_components/repair-details-sidebar";
import { useRepairManagement } from "./_hooks/use-repair-management";
import { PaginatedLayout } from "@/components/layout/paginated-layout";
import api from "@/lib/api/client";

export default function RepairsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RepairStatus | "all">("all");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<DeviceType | "all">(
    "all",
  );

  // Create query function that uses current filter values
  const fetchRepairs = async (page: number, pageSize: number): Promise<PaginatedResponse<Repair>> => {
    console.log("fetchRepairs called with:", { page, pageSize, statusFilter, deviceTypeFilter });
    
    const params: any = { page, page_size: pageSize };
    
    if (statusFilter !== "all") params.status = statusFilter;
    if (deviceTypeFilter !== "all") params.device_type = deviceTypeFilter;
    if (statusFilter === "all") params.exclude_status = "prete"; // Exclude "prete" when "all" is selected
    
    const response = await api.get("/repairs/repairs/", { params });
    return response.data;
  };

  // Build query key that includes filters
  const baseQueryKey = ["repairs", statusFilter, deviceTypeFilter];
  


  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { currentUser } = useUserRole();

  const {
    handleStatusChange,
    handleQuickStatusChange,
    handleSchedule,
    handleLocationChange,
    handleRestitution,
    handleAddPayment,
    handleDeletePayment,
    handleMarkRecovered,
  } = useRepairManagement();

  const handleViewDetails = (repair: Repair) => {
    setSelectedRepair(repair);
    setIsDetailsOpen(true);
  };

  // Update selected repair when data changes
  useEffect(() => {
    // This will be handled inside the PaginatedLayout children
  }, [selectedRepair]);

  return (
    <div className="h-full flex flex-col">
      <RepairActionsPanel onAddRepair={() => router.push("/add-reparation")} />

      <div className="p-4 sm:p-8 flex-1 flex flex-col gap-4 sm:gap-6 min-h-0">
        <RepairHighlightStats className="mb-4 sm:mb-6" />

        <div className="flex gap-6 flex-1 min-h-0">
          <PaginatedLayout
            queryKey={baseQueryKey}
            queryFn={fetchRepairs}
            initialPageSize={10}
            className="flex-1"
          >
            {(repairs, isLoading, error, refetch) => (
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
                onLocationChange={handleLocationChange}
              />
            )}
          </PaginatedLayout>

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
