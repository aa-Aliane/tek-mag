import { useQuery } from "@tanstack/react-query";

import { PaginatedResponse } from "../_types";
import { CatalogueFilters, CatalogueItem } from "../_types/catalogue";
import api from "@/lib/api/client";

interface Params extends CatalogueFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}

const fetchCatalogue = async (
  params: Params,
): Promise<PaginatedResponse<CatalogueItem>> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("page_size", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.product_type)
    searchParams.set("product_type", params.product_type);
  if (params.brand) searchParams.set("brand", String(params.brand));
  if (params.is_global !== undefined)
    searchParams.set("is_global", String(params.is_global));
  if (params.quality_tier)
    searchParams.set("quality_tier", String(params.quality_tier));
  if (params.color) searchParams.set("color", String(params.color));
  if (params.part_type) searchParams.set("part_type", String(params.part_type));
  if (params.compatible_model)
    searchParams.set("compatible_model", String(params.compatible_model));
  if (params.device_type)
    searchParams.set("device_type", String(params.device_type));
  if (params.series) searchParams.set("series", String(params.series));
  if (params.is_popular !== undefined)
    searchParams.set("is_popular", String(params.is_popular));

  const { data } = await api.get<PaginatedResponse<CatalogueItem>>(
    `/tech/catalogue/?${searchParams.toString()}`,
  );
  return data;
};

export function useCatalogue(params: Params = {}) {
  return useQuery({
    queryKey: ["catalogue", params],
    queryFn: () => fetchCatalogue(params),
    placeholderData: (prev) => prev, // keep showing previous page while loading next
    staleTime: 1000 * 60 * 2, // 2 min — catalogue doesn't change mid-session
  });
}
