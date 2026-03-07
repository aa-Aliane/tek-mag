import api from "@/lib/api/client";
import { Brand } from "../../_types";
import { useQuery } from "@tanstack/react-query";

interface Params extends Partial<Brand> {
  search?: string;
}

const fetchBrands = async (params: Params): Promise<Brand[]> => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const { data } = await api.get<Brand[]>(
    `/tech/brands/?${searchParams.toString()}`,
  );

  return data;
};

export const useBrands = (params: Params) => {
  return useQuery({
    queryKey: ["brands", params],
    queryFn: () => fetchBrands(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });
};
