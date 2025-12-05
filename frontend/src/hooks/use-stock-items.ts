import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type StockItem, type PaginatedResponse } from "@/types";

const fetchStockItems = async (page = 1): Promise<PaginatedResponse<StockItem>> => {
  const response = await api.get(`/tech/stock-items/?page=${page}`);
  return response.data;
};

const updateStockItem = async ({ id, data }: { id: number; data: Partial<StockItem> }): Promise<StockItem> => {
  const response = await api.patch(`/tech/stock-items/${id}/`, data);
  return response.data;
};

export const useStockItems = (page = 1) => {
  return useQuery<PaginatedResponse<StockItem>, Error>({
    queryKey: ["stock-items", page],
    queryFn: () => fetchStockItems(page),
    placeholderData: keepPreviousData,
  });
};

export const useUpdateStockItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStockItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-items"] });
    },
  });
};
