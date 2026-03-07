import api from "@/lib/api/client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { PaginatedResponse, PartVariant } from "../_types";

export interface PartVariantQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  brand?: string;
  quality_tier?: string;
  source?: "all" | "global" | "private";
}

//api fetcher
export const fetchPartVariants = async ({
  page = 1,
  pageSize = 10,
  search = "",
  source,
  ...filters
}: PartVariantQueryParams): Promise<PaginatedResponse<PartVariant>> => {
  const is_global =
    source === "global" ? "true" : source === "private" ? "false" : undefined;

  const response = await api.get<PaginatedResponse<PartVariant>>(
    "/tech/part-variants/",
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

// query
export const usePartVariantCatalogue = (params: PartVariantQueryParams) => {
  return useQuery({
    queryKey: ["part-variants", params],
    queryFn: () => fetchPartVariants(params),

    placeholderData: keepPreviousData,

    refetchOnWindowFocus: false,

    staleTime: 1000 * 60 * 5,
  });
};
