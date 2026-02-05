import { Dispatch, SetStateAction } from "react";
import { RepairsTable } from "@/components/features/repairs";
import type { Repair, RepairStatus, DeviceType } from "@/types";

interface RepairFiltersProps {
  repairs: Repair[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  statusFilter: RepairStatus | "all";
  setStatusFilter: Dispatch<SetStateAction<RepairStatus | "all">>;
  deviceTypeFilter: DeviceType | "all";
  setDeviceTypeFilter: Dispatch<SetStateAction<DeviceType | "all">>;
  onViewDetails: (repair: Repair) => void;
  onStatusChange: (
    repair: Repair,
    newStatus: RepairStatus,
    comment: string,
    notifyClient: boolean,
  ) => void;
  onLocationChange?: (repair: Repair, newLocation: boolean) => void;
}

export function RepairFilters({
  repairs,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  deviceTypeFilter,
  setDeviceTypeFilter,
  onViewDetails,
  onStatusChange,
  onLocationChange,
}: RepairFiltersProps) {
  const filteredRepairs = repairs.filter((repair: Repair) => repair.status !== "prete");
  console.log("RepairFilters debug:", {
    totalRepairs: repairs.length,
    filteredRepairs: filteredRepairs.length,
    statusFilter,
    deviceTypeFilter,
    searchTerm
  });
  
  return (
    <div className="flex-1 min-w-0 transition-all duration-300">
      <RepairsTable
        repairs={repairs} // Backend now handles filtering out "prete" when needed
        onViewDetails={onViewDetails}
        onStatusChange={onStatusChange}
        onLocationChange={onLocationChange}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        deviceTypeFilter={deviceTypeFilter}
        setDeviceTypeFilter={setDeviceTypeFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        hiddenColumns={["results"]}
      />
    </div>
  );
}
