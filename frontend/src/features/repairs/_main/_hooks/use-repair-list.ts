import { useState, useCallback } from "react";
import { Repair, RepairStatus, DeviceType } from "@/types";

export const useRepairList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RepairStatus | "all">("all");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<DeviceType | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = useCallback((repair: Repair) => {
    setSelectedRepair(repair);
    setIsDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    deviceTypeFilter,
    setDeviceTypeFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedRepair,
    setSelectedRepair,
    isDetailsOpen,
    setIsDetailsOpen,
    handleViewDetails,
    handleCloseDetails,
  };
};
