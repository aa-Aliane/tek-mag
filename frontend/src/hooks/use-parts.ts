import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type Part, type PaginatedResponse } from "@/types";

const fetchParts = async (page = 1): Promise<PaginatedResponse<Part>> => {
  const response = await api.get(`/tech/parts/?page=${page}`);
  return response.data;
};

export const useParts = (page = 1) => {
  return useQuery<PaginatedResponse<Part>, Error>({
    queryKey: ["parts", page],
    queryFn: () => fetchParts(page),
  });
};