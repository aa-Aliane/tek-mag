import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type Repair, type PaginatedResponse, type DeviceType, type Payment } from "@/types";

// Fetch all repairs
const fetchRepairs = async (page = 1, status?: string, client?: number, deviceType?: DeviceType, excludeStatus?: string): Promise<PaginatedResponse<Repair>> => {
  const params: any = { page, status, client, device_type: deviceType };
  if (excludeStatus) {
    params.exclude_status = excludeStatus;
  }
  console.log("Fetching repairs with params:", params);
  const response = await api.get("/repairs/repairs/", { params });
  console.log("API response:", response.data);
  return response.data;
};

// Fetch single repair
const fetchRepair = async (id: string): Promise<Repair> => {
  const response = await api.get(`/repairs/repairs/${id}/`);
  return response.data;
};

// Create repair
const createRepair = async (data: Partial<Repair>): Promise<Repair> => {
  const response = await api.post("/repairs/repairs/", data);
  return response.data;
};

// Update repair
const updateRepair = async ({ id, data }: { id: string; data: Partial<Repair> }): Promise<Repair> => {
  const response = await api.patch(`/repairs/repairs/${id}/`, data);
  return response.data;
};

export const useRepairs = (page = 1, status?: string, client?: number, deviceType?: DeviceType, excludeStatus?: string) => {
  return useQuery<PaginatedResponse<Repair>, Error>({
    queryKey: ["repairs", page, status, client, deviceType, excludeStatus],
    queryFn: () => fetchRepairs(page, status, client, deviceType, excludeStatus),
    placeholderData: keepPreviousData,
  });
};

export const useRepair = (id: string) => {
  return useQuery<Repair, Error>({
    queryKey: ["repair", id],
    queryFn: () => fetchRepair(id),
    enabled: !!id,
  });
};

export const useCreateRepair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRepair,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
    },
  });
};

export const useUpdateRepair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRepair,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
      queryClient.invalidateQueries({ queryKey: ["repair", data.id.toString()] });
    },
  });
};

// Payment functions
const createPayment = async (repairId: string, data: Partial<Payment>): Promise<Payment> => {
  const response = await api.post(`/repairs/repairs/${repairId}/payments/`, data);
  return response.data;
};

const fetchPayments = async (repairId: string): Promise<Payment[]> => {
  const response = await api.get(`/repairs/repairs/${repairId}/payments/`);
  return response.data;
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ repairId, data }: { repairId: string; data: Partial<Payment> }) => 
      createPayment(repairId, data),
    onSuccess: (_, { repairId }) => {
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
      queryClient.invalidateQueries({ queryKey: ["repair", repairId] });
      queryClient.invalidateQueries({ queryKey: ["payments", repairId] });
    },
  });
};

export const usePayments = (repairId: string) => {
  return useQuery<Payment[], Error>({
    queryKey: ["payments", repairId],
    queryFn: () => fetchPayments(repairId),
    enabled: !!repairId,
  });
};
