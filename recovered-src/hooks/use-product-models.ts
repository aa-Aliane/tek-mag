import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type ProductModel, type PaginatedResponse } from "@/types";

const fetchProductModels = async (
  brandId?: string,
  deviceTypeId?: number,
): Promise<PaginatedResponse<ProductModel>> => {
  const params: any = {};
  if (brandId) params.brand = brandId;
  if (deviceTypeId) params.device_type = deviceTypeId;
  const response = await api.get("/tech/product-models/", { params });
  return response.data;
};

export const useProductModels = (brandId?: string, deviceTypeId?: number) => {
  return useQuery<PaginatedResponse<ProductModel>, Error>({
    queryKey: ["product-models", brandId, deviceTypeId],
    queryFn: () => fetchProductModels(brandId, deviceTypeId),
    enabled: !!brandId, // Only fetch if brandId is provided
  });
};
