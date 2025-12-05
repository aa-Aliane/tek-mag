import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type Issue, type PaginatedResponse } from "@/types";

const fetchCommonIssues = async (deviceTypeId?: string): Promise<Issue[]> => {
  const params = deviceTypeId ? { device_types: deviceTypeId } : {};
  const response = await api.get("/repairs/issues/", { params });
  return response.data.results || response.data;
};

export const useCommonIssues = (deviceTypeId?: string) => {
  return useQuery<Issue[], Error>({
    queryKey: ["common-issues", deviceTypeId],
    queryFn: () => fetchCommonIssues(deviceTypeId),
    enabled: !!deviceTypeId,
  });
};