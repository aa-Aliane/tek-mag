import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type Brand, type PaginatedResponse } from "@/types";

const fetchBrands = async (deviceTypeId?: number): Promise<Brand[]> => {
  // Fetch brands with a large page size to get all results
  const params: any = { page_size: 1000 }; // Large page size to fetch all brands

  if (deviceTypeId) {
    params.device_type = deviceTypeId;
  }

  const response = await api.get("/tech/brands/", { params });
  const data: PaginatedResponse<Brand> = response.data;
  return data.results; // Return only the results array
};

export const useBrands = (deviceTypeId?: number) => {
  return useQuery<Brand[], Error>({
    queryKey: ["brands", deviceTypeId],
    queryFn: () => fetchBrands(deviceTypeId),
  });
};
