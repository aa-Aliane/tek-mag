import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client"
import { type Supplier, type PaginatedResponse } from "@/types"

const fetchSuppliers = async (): Promise<PaginatedResponse<Supplier>> => {
  const response = await api.get("/tech/suppliers/");
  return response.data;
};

export const useSuppliers = () => {
  return useQuery<PaginatedResponse<Supplier>, Error>({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });
};
