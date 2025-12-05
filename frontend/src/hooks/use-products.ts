import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type Product, type PaginatedResponse } from "@/types";

const fetchProducts = async (page = 1): Promise<PaginatedResponse<Product>> => {
  const response = await api.get(`/tech/products/?page=${page}`);
  return response.data;
};

export const useProducts = (page = 1) => {
  return useQuery<PaginatedResponse<Product>, Error>({
    queryKey: ["products", page],
    queryFn: () => fetchProducts(page),
    placeholderData: keepPreviousData,
  });
};


