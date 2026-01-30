import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type Client, type PaginatedResponse } from "@/types";

const fetchClients = async (page = 1, search?: string, profileType?: string): Promise<PaginatedResponse<Client>> => {
  const params: { page: number; search?: string; role_name?: string } = { page };
  if (search) params.search = search;
  if (profileType) params.role_name = profileType;

  const response = await api.get("/users/", { params });
  return response.data;
};

export const useClients = (page = 1, search?: string, profileType?: string) => {
  return useQuery<PaginatedResponse<Client>, Error>({
    queryKey: ["clients", page, search, profileType],
    queryFn: () => fetchClients(page, search, profileType),
    placeholderData: keepPreviousData,
  });
};
