import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type Location } from "@/types";

const fetchInventoryLocations = async (): Promise<Location[]> => {
  const response = await api.get("/tech/locations/"); // Adjust your API endpoint
  return response.data;
};

export const useInventoryLocations = () => {
  return useQuery<Location[], Error>({
    queryKey: ["inventoryLocations"],
    queryFn: fetchInventoryLocations,
  });
};
