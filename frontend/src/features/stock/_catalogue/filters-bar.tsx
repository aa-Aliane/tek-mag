"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCatalogueStore } from "../_store/catalogue";
import { useCategoriesStore } from "../_store/categories";
import {
  useBrands,
  useColors,
  useDeviceTypes,
  usePartTypes,
  useQualityTiers,
} from "../_queries/filters/use-filters";

// Small loading placeholder that matches the select trigger height
function FilterSkeleton() {
  return <Skeleton className="w-[140px] h-8 rounded-md" />;
}

export const FiltersBar = () => {
  const { category } = useCategoriesStore();
  const { filters, setFilter } = useCatalogueStore();

  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: qualityTiers, isLoading: tiersLoading } = useQualityTiers();
  const { data: colors, isLoading: colorsLoading } = useColors();
  const { data: partTypes, isLoading: partTypesLoading } = usePartTypes();
  const { data: deviceTypes, isLoading: deviceTypesLoading } = useDeviceTypes();

  const showQuality = category === "repairs" || category === "devices";
  const showStorage = category === "devices" || category === "computers";
  const showColor = category === "accessories" || category === "devices";
  const showPartType = category === "repairs" || category === "accessories";
  const showDeviceTypes = category === "devices";

  return (
    <div className="flex flex-wrap gap-2">
      {/* 1. BRAND — universal across all categories */}
      {brandsLoading ? (
        <FilterSkeleton />
      ) : (
        <Select
          value={filters.brand || "all"}
          onValueChange={(v) => setFilter("brand", v)}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
            <SelectValue placeholder="Marque" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes Marques</SelectItem>
            {brands?.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* 2. QUALITY TIER — repairs and devices only */}
      {showQuality &&
        (tiersLoading ? (
          <FilterSkeleton />
        ) : (
          <Select
            value={filters.quality_tier || "all"}
            onValueChange={(v) => setFilter("quality_tier", v)}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
              <SelectValue placeholder="Qualité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes Qualités</SelectItem>
              {qualityTiers?.map((qt) => (
                <SelectItem key={qt.id} value={String(qt.id)}>
                  {qt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

      {/* 3. STORAGE — devices and computers only (static choices, not from DB) */}
      {showStorage && (
        <Select
          value={filters.storage || "all"}
          onValueChange={(v) => setFilter("storage", v)}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
            <SelectValue placeholder="Stockage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tout Stockage</SelectItem>
            <SelectItem value="64GB">64 Go</SelectItem>
            <SelectItem value="128GB">128 Go</SelectItem>
            <SelectItem value="256GB">256 Go</SelectItem>
            <SelectItem value="512GB">512 Go</SelectItem>
            <SelectItem value="1TB">1 To</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* 4. COLOR — accessories and devices only */}
      {showColor &&
        (colorsLoading ? (
          <FilterSkeleton />
        ) : (
          <Select
            value={filters.color || "all"}
            onValueChange={(v) => setFilter("color", v)}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
              <SelectValue placeholder="Couleur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes Couleurs</SelectItem>
              {colors?.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

      {/* 5. PART TYPE — repairs and accessories only */}
      {showPartType &&
        (partTypesLoading ? (
          <FilterSkeleton />
        ) : (
          <Select
            value={filters.part_type || "all"}
            onValueChange={(v) => setFilter("part_type", v)}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
              <SelectValue placeholder="Type de pièce" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous Types</SelectItem>
              {partTypes?.map((pt) => (
                <SelectItem key={pt.id} value={String(pt.id)}>
                  {pt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

      {/* 6. DEVICE TYPE — devices only */}
      {showDeviceTypes && deviceTypesLoading ? (
        <FilterSkeleton />
      ) : (
        <Select
          value={filters.device_type || "all"}
          onValueChange={(v) => setFilter("device_type", v)}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
            <SelectValue placeholder="Type d'appareil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous Types</SelectItem>
            {deviceTypes?.map((pt) => (
              <SelectItem key={pt.id} value={String(pt.id)}>
                {pt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
