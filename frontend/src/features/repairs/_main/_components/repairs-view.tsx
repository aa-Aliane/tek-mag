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
import { useRepairStore } from "../../_shared/_store/use-repair-store";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

export const RepairsView: React.FC<Props> = ({ className, ...rest }) => {
  const router = useRouter();
  
  // Directly from store
  const searchTerm = useRepairStore((s) => s.searchTerm);
  const setSearchTerm = useRepairStore((s) => s.setSearchTerm);
  const statusFilter = useRepairStore((s) => s.statusFilter);
  const setStatusFilter = useRepairStore((s) => s.setStatusFilter);
  const deviceTypeFilter = useRepairStore((s) => s.deviceTypeFilter);
  const setDeviceTypeFilter = useRepairStore((s) => s.setDeviceTypeFilter);
  const page = useRepairStore((s) => s.page);
  const setPage = useRepairStore((s) => s.setPage);
  const pageSize = useRepairStore((s) => s.pageSize);
  const setPageSize = useRepairStore((s) => s.setPageSize);
  const selectedRepair = useRepairStore((s) => s.selectedRepair);
  const isDetailsOpen = useRepairStore((s) => s.isDetailsOpen);
  const handleViewDetails = useRepairStore((s) => s.handleViewDetails);
  const handleCloseDetails = useRepairStore((s) => s.handleCloseDetails);

  // Data hook (Now only returns data-related fields)
  const {
    repairs,
    totalCount,
    isLoading,
    error,
    refetch,
  } = useRepairList();

  // Actions hook
  const {
    handleQuickStatusChange,
    handleLocationChange,
    isLocationUpdating,
    isStatusUpdating,
    updatingRepairId,
  } = useRepairActions();

  return (
    <DashboardLayout className={cn(className)} {...rest}>
      <RepairActionsBar onAddRepair={() => router.push("/repairs/add")} />

      <div className="p-4 sm:p-8 flex-1 flex flex-col gap-4 sm:gap-6 min-h-0">
        <RepairHighlightStats className="mb-4 sm:mb-6" />

        <PaginatedLayout
          data={repairs}
          totalCount={totalCount}
          isLoading={isLoading}
          error={error}
          refetch={refetch}
          page={page}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          className="flex-1"
        >
          {(items) => (
            <RepairListContainer
              repairs={items}
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
