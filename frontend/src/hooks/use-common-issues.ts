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
    basePrice: parseFloat(issue.base_price || "0"),
    categoryType: issue.category_type,
    associatedPart: issue.associated_part,
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
export const usePartQualityTiers = (issueId?: number, modelId?: number) => {
  return useQuery({
    queryKey: ["part-quality-tiers", issueId, modelId],
    queryFn: async () => {
      if (!issueId || !modelId) {
        // Return null or empty array instead of throwing if you want to
        // keep the UI quiet until both are selected
        return [];
      }

      const response = await api.get("/repairs/part-quality-tiers/", {
        params: {
          issue_id: issueId,
          model_id: modelId,
        },
      });

      return response.data;
    },
    // Only run the query when both IDs are truthy
    enabled: !!issueId && !!modelId,
  });
};

export const useMultipleIssuePricingOptions = (issueIds: number[], modelId?: number) => {
  return useQueries({
    queries: issueIds.map((issueId) => ({
      queryKey: ["issue-pricing-options", issueId, modelId],
      queryFn: async () => {
        const params = modelId ? { model_id: modelId } : {};
        const response = await api.get(
          `/repairs/issues/${issueId}/pricing_options/`,
          { params }
        );
        // Parse prices in quality tiers
        return (response.data || []).map((tier: any) => ({
          ...tier,
          price: parseFloat(tier.price || "0"),
        }));
      },
      enabled: !!issueId,
    })),
  });
};
