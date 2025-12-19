import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type Brand } from "@/types";

const fetchBrands = async (deviceTypeId?: number): Promise<Brand[]> => {
  const params: any = {};

  if (deviceTypeId) {
    params.device_type = deviceTypeId;
  }

  // With pagination disabled in the backend, the API returns the array directly
  const response = await api.get("/tech/brands/", { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const useBrands = (deviceTypeId?: number) => {
  return useQuery<Brand[], Error>({
    queryKey: ["brands", deviceTypeId],
    queryFn: () => fetchBrands(deviceTypeId),
  });
};
