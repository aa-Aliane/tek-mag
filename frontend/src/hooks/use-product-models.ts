import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type ProductModel, type PaginatedResponse } from "@/types";

const fetchProductModels = async (brandId?: string, deviceTypeId?: number): Promise<ProductModel[]> => {
  const params: any = { page_size: 1000 }; // Large page size to fetch all models
  if (brandId) params.brand = brandId;
  if (deviceTypeId) params.device_type = deviceTypeId;
  const response = await api.get("/tech/product-models/", { params });
  const data: PaginatedResponse<ProductModel> = response.data;
  return data.results; // Return only the results array
};

export const useProductModels = (brandId?: string, deviceTypeId?: number) => {
  return useQuery<ProductModel[], Error>({
    queryKey: ["product-models", brandId, deviceTypeId],
    queryFn: () => fetchProductModels(brandId, deviceTypeId),
    enabled: !!brandId, // Only fetch if brandId is provided
  });
};
