"use client";

import React, { useEffect } from "react";
import { Loader2, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { usePartQualityTiers } from "../../_queries/use-issue-pricing-queries";
import { PartQualityTier } from "@/types";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  issueId: string | number;
  modelId: string | number;
  associatedPartId?: string | number;
  onTierSelect: (issueId: string, tierId: number) => void;
  selectedTierId?: number;
  loadingTiersFor: string | null;
  setLoadingTiersFor: (id: string | null) => void;
}

export const QualityTierSelector: React.FC<Props> = ({
  issueId,
  modelId,
  associatedPartId,
  onTierSelect,
  selectedTierId,
  setLoadingTiersFor,
  className,
  ...rest
}) => {
  const {
    data: pricingOptions,
    isLoading,
    error,
  } = usePartQualityTiers(Number(issueId), Number(modelId));

  useEffect(() => {
    if (isLoading) {
      setLoadingTiersFor(String(issueId));
    } else {
      setLoadingTiersFor(null);
    }
  }, [isLoading, issueId, setLoadingTiersFor]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 mt-2", className)} {...rest}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Chargement des options de qualité...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-red-500 text-sm mt-2", className)} {...rest}>
        Erreur de chargement des options de qualité
      </div>
    );
  }

  // Filter to get only quality tiers (not service pricing)
  const qualityTiers: PartQualityTier[] = pricingOptions || [];

  if (!qualityTiers || qualityTiers.length === 0) {
    return (
      <div className={cn("text-yellow-600 text-sm mt-2", className)} {...rest}>
        Aucune option de qualité disponible pour ce problème
      </div>
    );
  }

  return (
    <div className={cn("mt-3 space-y-3", className)} {...rest}>
      <Label className="text-base font-semibold">Option de qualité</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {qualityTiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => onTierSelect(String(issueId), tier.id)}
            className={cn(
              "p-4 rounded-xl border-2 text-left transition-all flex flex-col h-full",
              selectedTierId === tier.id
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border hover:bg-accent/50",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {tier.quality_tier === "standard" && "Standard"}
                {tier.quality_tier === "premium" && "Premium"}
                {tier.quality_tier === "original" && "Original"}
                {tier.quality_tier === "refurbished" && "Reconditionné"}
              </div>
              {selectedTierId === tier.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="text-lg font-bold text-primary mt-1">
              {tier.price}€
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {tier.warranty_days} jours garantie
            </div>
            <div className="mt-auto pt-2">
              <div className="text-xs">
                {tier.availability_status === "in_stock" && (
                  <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    En stock
                  </span>
                )}
                {tier.availability_status === "low_stock" && (
                  <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                    Stock limité
                  </span>
                )}
                {tier.availability_status === "out_of_stock" && (
                  <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    Rupture de stock
                  </span>
                )}
                {tier.availability_status === "discontinued" && (
                  <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    Discontinué
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
