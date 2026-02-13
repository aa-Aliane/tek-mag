import { PaginatedResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export interface RepairsQueryParams {
  page: number;
  pageSize: number;
  searchTerm?: string;
}

const fetchStockItems = (
  page: number,
  pageSize: number,
  searchTerm?: string,
): Promise<PaginatedResponse<any>> => {};

export const useStockList = () => {};
