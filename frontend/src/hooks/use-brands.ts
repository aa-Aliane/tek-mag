import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type Brand, type PaginatedResponse } from "@/types";

const fetchBrands = async (deviceTypeId?: number): Promise<PaginatedResponse<Brand>> => {
  const params = deviceTypeId ? { device_type: deviceTypeId } : {};
  const response = await api.get("/tech/brands/", { params });
  return response.data;
};

export const useBrands = (deviceTypeId?: number) => {
  return useQuery<PaginatedResponse<Brand>, Error>({
    queryKey: ["brands", deviceTypeId],
    queryFn: () => fetchBrands(deviceTypeId),
  });
};
