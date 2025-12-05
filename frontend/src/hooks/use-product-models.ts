import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type ProductModel, type PaginatedResponse } from "@/types";

const fetchProductModels = async (brandId?: string): Promise<PaginatedResponse<ProductModel>> => {
  const params = brandId ? { brand: brandId } : {};
  const response = await api.get("/tech/product-models/", { params });
  return response.data;
};

export const useProductModels = (brandId?: string) => {
  return useQuery<PaginatedResponse<ProductModel>, Error>({
    queryKey: ["product-models", brandId],
    queryFn: () => fetchProductModels(brandId),
    enabled: !!brandId, // Only fetch if brandId is provided
  });
};
