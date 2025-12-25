import { useQuery, useQueries } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { type Issue, type PaginatedResponse } from "@/types";

const fetchCommonIssues = async (deviceTypeId?: string): Promise<Issue[]> => {
  const params = deviceTypeId ? { device_types: deviceTypeId } : {};
  const response = await api.get("/repairs/issues/", { params });
  const results = response.data.results || response.data;
  
  return results.map((issue: any) => ({
    id: issue.id,
    name: issue.name,
    deviceTypes: issue.device_types,
    requiresPart: issue.requires_part,
    basePrice: issue.base_price,
    categoryType: issue.category_type,
    associatedProduct: issue.associated_product,
    servicePricing: issue.service_pricing,
  }));
};

export const useCommonIssues = (deviceTypeId?: string) => {
  return useQuery<Issue[], Error>({
    queryKey: ["common-issues", deviceTypeId],
    queryFn: () => fetchCommonIssues(deviceTypeId),
    enabled: !!deviceTypeId,
  });
};

// New hook to fetch pricing options for an issue
export const useIssuePricingOptions = (issueId?: number) => {
  return useQuery({
    queryKey: ["issue-pricing-options", issueId],
    queryFn: async () => {
      if (!issueId) throw new Error("Issue ID is required");
      const response = await api.get(`/repairs/issues/${issueId}/pricing_options/`);
      return response.data;
    },
    enabled: !!issueId,
  });
};

export const useMultipleIssuePricingOptions = (issueIds: number[]) => {
  return useQueries({
    queries: issueIds.map((issueId) => ({
      queryKey: ["issue-pricing-options", issueId],
      queryFn: async () => {
        const response = await api.get(`/repairs/issues/${issueId}/pricing_options/`);
        return response.data;
      },
      enabled: !!issueId,
    })),
  });
};