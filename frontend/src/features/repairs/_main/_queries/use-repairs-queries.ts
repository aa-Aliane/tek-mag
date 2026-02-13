import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { Repair, PaginatedResponse, RepairStatus, DeviceType } from "@/types";

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
