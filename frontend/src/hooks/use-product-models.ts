import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type ProductModel } from "@/types";

const fetchProductModels = async (brandId?: string, deviceTypeId?: number): Promise<ProductModel[]> => {
  const params: any = {};
  if (brandId) params.brand = brandId;
  if (deviceTypeId) params.device_type = deviceTypeId;
  const response = await api.get("/tech/product-models/", { params });
  // With pagination disabled in the backend, the API returns the array directly
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const useProductModels = (brandId?: string, deviceTypeId?: number) => {
  return useQuery<ProductModel[], Error>({
    queryKey: ["product-models", brandId, deviceTypeId],
    queryFn: () => fetchProductModels(brandId, deviceTypeId),
    enabled: !!brandId, // Only fetch if brandId is provided
  });
};
