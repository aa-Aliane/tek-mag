import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type StoreOrder, type PaginatedResponse } from "@/types";

const fetchStoreOrders = async (): Promise<PaginatedResponse<StoreOrder>> => {
  const response = await api.get("/tech/store-orders/");
  return response.data;
};

const fetchStoreOrderById = async (id: number): Promise<StoreOrder> => {
  const response = await api.get(`/tech/store-orders/${id}/`);
  return response.data;
};

export const useStoreOrders = () => {
  return useQuery<PaginatedResponse<StoreOrder>, Error>({
    queryKey: ["storeOrders"],
    queryFn: fetchStoreOrders,
  });
};

export const useStoreOrder = (id: number) => {
  return useQuery<StoreOrder, Error>({
    queryKey: ["storeOrder", id],
    queryFn: () => fetchStoreOrderById(id),
    enabled: !!id, // Only run query if id is provided
  });
};
