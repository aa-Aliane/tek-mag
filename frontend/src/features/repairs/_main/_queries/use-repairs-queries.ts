import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { Repair, PaginatedResponse, RepairStatus, DeviceType } from "@/types";
import { useRepairStore } from "../../_shared/_store/use-repair-store";

export interface RepairsQueryParams {
  page: number;
  pageSize: number;
  status?: RepairStatus | "all";
  deviceType?: DeviceType | "all";
  searchTerm?: string;
}

export const fetchRepairsApi = async (
  page: number,
  pageSize: number,
  status?: RepairStatus | "all",
  deviceType?: DeviceType | "all",
  searchTerm?: string,
): Promise<PaginatedResponse<Repair>> => {
  const params: any = {
    page,
    page_size: pageSize,
    search: searchTerm,
  };

  if (status && status !== "all") params.status = status;
  if (deviceType && deviceType !== "all") params.device_type = deviceType;

  // Default behavior: exclude "prete" when "all" is selected
  if (status === "all" || !status) params.exclude_status = "prete";

  const response = await api.get("/repairs/repairs/", { params });
  return response.data;
};

export const fetchRepairApi = async (id: string): Promise<Repair> => {
  const response = await api.get(`/repairs/repairs/${id}/`);
  return response.data;
};

export const useRepairs = ({
  page,
  pageSize,
  status,
  deviceType,
  searchTerm,
}: RepairsQueryParams) => {
  return useQuery({
    queryKey: ["repairs", { page, pageSize, status, deviceType, searchTerm }],
    queryFn: () => fetchRepairsApi(page, pageSize, status, deviceType, searchTerm),
  });
};

export const useRepair = (id: string | null) => {
  return useQuery({
    queryKey: ["repair", id],
    queryFn: () => (id ? fetchRepairApi(id) : Promise.reject("No ID")),
    enabled: !!id,
  });
};

export const useRepairListQuery = () => {
  const page = useRepairStore((s) => s.page);
  const pageSize = useRepairStore((s) => s.pageSize);
  const statusFilter = useRepairStore((s) => s.statusFilter);
  const deviceTypeFilter = useRepairStore((s) => s.deviceTypeFilter);
  const searchTerm = useRepairStore((s) => s.searchTerm);

  return useRepairs({
    page,
    pageSize,
    status: statusFilter,
    deviceType: deviceTypeFilter,
    searchTerm,
  });
};

export const useUpdateRepairStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      repairId, 
      status, 
      comment, 
      notifyClient 
    }: { 
      repairId: number; 
      status: RepairStatus; 
      comment: string; 
      notifyClient: boolean 
    }) => {
      const response = await api.post(`/repairs/repairs/${repairId}/update_status/`, {
        status,
        comment,
        notify_client: notifyClient,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
    },
  });
};
