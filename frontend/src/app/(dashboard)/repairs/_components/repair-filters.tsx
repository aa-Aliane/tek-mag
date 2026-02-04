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
    notifyClient: boolean
  ) => void;
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
}: RepairFiltersProps) {
  return (
    <div className="flex-1 min-w-0 transition-all duration-300">
      <RepairsTable
        repairs={repairs.filter((repair: Repair) => repair.status != "prete")}
        onViewDetails={onViewDetails}
        onStatusChange={onStatusChange}
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
