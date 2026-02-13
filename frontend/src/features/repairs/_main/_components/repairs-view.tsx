"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/components/layout/providers";
import { PaginatedLayout } from "@/components/layout/paginated-layout";
import { cn } from "@/lib/utils";

import { DashboardLayout } from "@/layouts";
import { RepairActionsBar } from "./repair-actions-bar";
import { RepairListContainer } from "./repair-list-container";
import { RepairDetailsDrawer } from "./_details";
import { RepairHighlightStats } from "./stats/repair-highlight-stats";
import { useRepairList } from "../_hooks/use-repair-list";
import { useRepairActions } from "../_hooks/use-repair-actions";
import { fetchRepairsApi } from "../_queries/use-repairs-queries";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

export const RepairsView: React.FC<Props> = ({ className, ...rest }) => {
  const router = useRouter();
  const { currentUser } = useUserRole();
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    deviceTypeFilter,
    setDeviceTypeFilter,
    selectedRepair,
    isDetailsOpen,
    handleViewDetails,
    handleCloseDetails,
  } = useRepairList();

  const {
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
    updatingRepairId,
  } = useRepairActions();

  // Create query function that uses current filter values
  const fetchRepairs = (page: number, pageSize: number) =>
    fetchRepairsApi(page, pageSize, statusFilter, deviceTypeFilter, searchTerm);

  const baseQueryKey = ["repairs", statusFilter, deviceTypeFilter, searchTerm];

  return (
    <DashboardLayout className={cn(className)} {...rest}>
      <RepairActionsBar onAddRepair={() => router.push("/repairs/add")} />

      <div className="p-4 sm:p-8 flex-1 flex flex-col gap-4 sm:gap-6 min-h-0">
        <RepairHighlightStats className="mb-4 sm:mb-6" />

        <PaginatedLayout
          queryKey={baseQueryKey}
          queryFn={fetchRepairs}
          initialPageSize={10}
          className="flex-1"
        >
          {(repairs) => (
            <RepairListContainer
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
              isLocationUpdating={isLocationUpdating}
              isStatusUpdating={isStatusUpdating}
              updatingRepairId={updatingRepairId}
            />
          )}
        </PaginatedLayout>

        <RepairDetailsDrawer
          repair={selectedRepair}
          onClose={handleCloseDetails}
        />
      </div>
    </DashboardLayout>
  );
};
