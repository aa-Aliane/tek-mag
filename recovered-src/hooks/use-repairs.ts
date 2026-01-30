import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type Repair, type PaginatedResponse, type DeviceType } from "@/types";

// Fetch all repairs
const fetchRepairs = async (page = 1, status?: string, client?: number, deviceType?: DeviceType): Promise<PaginatedResponse<Repair>> => {
  const params = { page, status, client, device_type: deviceType };
  const response = await api.get("/repairs/repairs/", { params });
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

export const useRepairs = (page = 1, status?: string, client?: number, deviceType?: DeviceType) => {
  return useQuery<PaginatedResponse<Repair>, Error>({
    queryKey: ["repairs", page, status, client, deviceType],
    queryFn: () => fetchRepairs(page, status, client, deviceType),
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
