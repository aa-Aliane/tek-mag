import { create } from "zustand";
import { Repair, RepairStatus, DeviceType } from "@/types";

interface RepairState {
  searchTerm: string;
  statusFilter: RepairStatus | "all";
  deviceTypeFilter: DeviceType | "all";
  page: number;
  pageSize: number;
  selectedRepair: Repair | null;
  isDetailsOpen: boolean;

  // Actions
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: RepairStatus | "all") => void;
  setDeviceTypeFilter: (deviceType: DeviceType | "all") => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSelectedRepair: (repair: Repair | null) => void;
  setIsDetailsOpen: (isOpen: boolean) => void;
  handleViewDetails: (repair: Repair) => void;
  handleCloseDetails: () => void;
  resetFilters: () => void;
}

export const useRepairStore = create<RepairState>((set) => ({
  searchTerm: "",
  statusFilter: "all",
  deviceTypeFilter: "all",
  page: 1,
  pageSize: 10,
  selectedRepair: null,
  isDetailsOpen: false,

  setSearchTerm: (searchTerm) => set({ searchTerm, page: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
  setDeviceTypeFilter: (deviceTypeFilter) => set({ deviceTypeFilter, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setSelectedRepair: (selectedRepair) => set({ selectedRepair }),
  setIsDetailsOpen: (isDetailsOpen) => set({ isDetailsOpen }),
  
  handleViewDetails: (repair) => set({ 
    selectedRepair: repair, 
    isDetailsOpen: true 
  }),
  
  handleCloseDetails: () => set({ 
    selectedRepair: null, 
    isDetailsOpen: false 
  }),

  resetFilters: () => set({
    searchTerm: "",
    statusFilter: "all",
    deviceTypeFilter: "all",
    page: 1
  }),
}));
