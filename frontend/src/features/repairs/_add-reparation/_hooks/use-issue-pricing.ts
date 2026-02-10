import { useMultipleIssuePricingOptions } from "../_queries/use-issue-pricing-queries";
import { PartQualityTier } from "@/types";

// Custom hook to calculate subtotal
export function useSubtotal(
  selectedIssues: any[],
  commonIssues: any[],
  modelId: number,
) {
  // Create an array of issue IDs that need pricing options
  const issueIdsRequiringPricing = selectedIssues
    .filter(
      (issue) => issue.categoryType === "part_based" && issue.selectedTierId,
    )
    .map((issue) => Number(issue.issueId));

  // Fetch pricing options for all relevant issues
  const pricingQueries = useMultipleIssuePricingOptions(
    issueIdsRequiringPricing,
    modelId,
  );

  // Check if all pricing queries are loaded
  const allLoaded = pricingQueries.every((query) => !query.isLoading);

  // Calculate subtotal
  let subtotal = 0;
  for (const selectedIssue of selectedIssues) {
    if (
      selectedIssue.categoryType === "part_based" &&
      selectedIssue.selectedTierId
    ) {
      // For part-based issues, we need to get the price of the selected tier
      const fullIssue = commonIssues.find(
        (issue: any) => String(issue.id) === selectedIssue.issueId,
      );
      if (fullIssue) {
        // Find the pricing query for this issue
        const pricingQuery = pricingQueries.find(
          (query, index) =>
            issueIdsRequiringPricing[index] === Number(selectedIssue.issueId),
        );

        if (pricingQuery && pricingQuery.data) {
          const selectedTier = pricingQuery.data.find(
            (tier: PartQualityTier) => tier.id === selectedIssue.selectedTierId,
          );
          if (selectedTier) {
            subtotal += selectedTier.price;
          }
        }
      }
    } else if (selectedIssue.categoryType === "service_based") {
      // For service-based issues, use the base price from the issue
      const fullIssue = commonIssues.find(
        (issue: any) => String(issue.id) === selectedIssue.issueId,
      );
      if (fullIssue) {
        subtotal += fullIssue.basePrice;
      }
    }
  }

  return { subtotal: subtotal.toFixed(2), allLoaded };
}
