import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type DeviceType, type PaginatedResponse } from "@/types";

const fetchDeviceTypes = async (): Promise<PaginatedResponse<DeviceType>> => {
  const response = await api.get("/tech/device-types/");
  return response.data;
};

export const useDeviceTypes = () => {
  return useQuery<PaginatedResponse<DeviceType>, Error>({
    queryKey: ["device-types"],
    queryFn: fetchDeviceTypes,
  });
};
