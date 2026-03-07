import api from "@/lib/api/client";
import { PaginatedResponse, ProductVariant } from "../_types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export interface ProductVariantParams {
  page?: number;
  pageSize?: number;
  search?: string;
  source?: "all" | "global" | "private";
}

const fetchProducts = async ({
  page = 1,
  pageSize = 10,
  search = "",
  source,
  ...filters
}: ProductVariantParams) => {
  const is_global =
    source === "global" ? "true" : source === "private" ? "false" : undefined;

  const response = await api.get<PaginatedResponse<ProductVariant>>(
    "/tech/product-variants/",
    {
      params: {
        page,
        page_size: pageSize,
        search: search,
        is_global,
        ...filters,
      },
    },
  );

  return response.data;
};

export const useProductVariants = (params: ProductVariantParams) => {
  return useQuery({
    queryKey: ["product-variants", params],
    queryFn: () => fetchProducts(params),

    placeholderData: keepPreviousData,

    refetchOnWindowFocus: false,

    staleTime: 1000 * 60 * 5,
  });
};
