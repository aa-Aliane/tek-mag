import { PaginatedResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { StockItem } from "../../_shared/_types/store-item";
import api from "@/lib/api/client";

export interface StockItemQueryParams {
  page: number;
  pageSize: number;
  searchTerm?: string;
}

const fetchStockItems = async (
  page: number,
  pageSize: number,
  searchTerm?: string,
): Promise<PaginatedResponse<StockItem>> => {
  const params: any = { page, page_size: pageSize, search: searchTerm };

  const response = await api.get("/stock/sore-items/", { params });

  return response.data;
};

export const useStockList = ({
  page,
  pageSize,
  searchTerm,
}: StockItemQueryParams) => {
  return useQuery({
    queryKey: ["stock-items", { page, pageSize, searchTerm }],
    queryFn: () => fetchStockItems(page, pageSize, searchTerm),
  });
};
