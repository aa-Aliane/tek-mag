"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Search,
  Globe,
  User,
  FilterX,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Package,
} from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCatalogue } from "../_queries/use-catalogue";
import { useCatalogueStore } from "../_store/catalogue";
import { useCategoriesStore } from "../_store/categories";
import {
  CatalogueItem,
  CatalogueFilters,
  VariantSummary,
  isCataloguePart,
  isCatalogueProductModel,
} from "../_types/catalogue";
import { FiltersBar } from "./filters-bar";

// Maps the header category tab to the product_type filter the API understands.
// computers is intentionally undefined — both Parts (SSD, RAM) and ProductModels
// (MacBook, iMac) live there so we show everything.
const CATEGORY_TO_PRODUCT_TYPE: Record<
  string,
  CatalogueFilters["product_type"]
> = {
  devices: "product_model", // Smartphones, Tablettes — serialized
  repairs: "part", // Écrans, Batteries — spare parts
  accessories: "part", // Coques, Protections — spare parts
  computers: undefined, // Mixed: MacBooks + SSDs
};

interface Props {
  onSelect: (item: CatalogueItem) => void;
}

// ── Variant chips ──────────────────────────────────────────────────────────

function VariantChips({ variants }: { variants: VariantSummary[] }) {
  const MAX_VISIBLE = 3;
  const visible = variants.slice(0, MAX_VISIBLE);
  const overflow = variants.length - MAX_VISIBLE;

  if (variants.length === 0) {
    return (
      <span className="text-[10px] text-muted-foreground italic">
        Aucune variante
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((v) => {
        const label = [v.quality_tier?.name, v.color?.name, v.storage]
          .filter(Boolean)
          .join(" • ");

        return (
          <Badge
            key={v.id}
            variant="outline"
            className="text-[10px] px-1.5 h-5 font-normal shadow-none"
          >
            {label || "Standard"}
          </Badge>
        );
      })}
      {overflow > 0 && (
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 h-5 font-normal shadow-none"
        >
          +{overflow}
        </Badge>
      )}
    </div>
  );
}

// ── Main table ─────────────────────────────────────────────────────────────

export const CatalogueTable: React.FC<Props> = ({ onSelect }) => {
  const {
    search,
    setSearch,
    debouncedSearch,
    filters,
    setFilter,
    resetFilters,
    page,
    setPage,
  } = useCatalogueStore();

  const { category } = useCategoriesStore();

  const selectedItems = useCatalogueStore((state) => state.selectedItems);
  const addItem = useCatalogueStore((state) => state.addItem);
  const removeItem = useCatalogueStore((state) => state.removeItem);

  // Derived: translate header tab → API product_type param
  const product_type = CATEGORY_TO_PRODUCT_TYPE[category];

  const { data, isLoading, isPlaceholderData } = useCatalogue({
    page,
    pageSize: 10,
    search: debouncedSearch,
    product_type,
    // source -> is_global
    ...(filters.source === "global" && { is_global: true }),
    ...(filters.source === "private" && { is_global: false }),
    // numeric FK filters
    brand: filters.brand ? Number(filters.brand) : undefined,
    quality_tier: filters.quality_tier
      ? Number(filters.quality_tier)
      : undefined,
    color: filters.color ? Number(filters.color) : undefined,
    device_type: filters.device_type ? Number(filters.device_type) : undefined,
    part_type: filters.part_type ? Number(filters.part_type) : undefined,
    // string filter
    storage: filters.storage ?? undefined,
  });

  // Unpaginated fallback (no page param sent) returns a plain array
  const items = Array.isArray(data) ? data : (data?.results ?? []);
  const totalCount = Array.isArray(data) ? data.length : (data?.count ?? 0);
  const hasNext = Array.isArray(data) ? false : !!data?.next;
  const hasPrev = Array.isArray(data) ? false : !!data?.previous;

  const columns: ColumnDef<CatalogueItem>[] = [
    {
      header: "Produit",
      cell: ({ row }) => {
        const item = row.original;

        // Subtitle: part type name for parts, series name for device models
        const subtitle = isCataloguePart(item)
          ? item.subtype_data.part_type?.name
          : isCatalogueProductModel(item)
            ? (item.subtype_data.series?.name ??
              item.subtype_data.device_type?.name)
            : null;

        return (
          <div className="flex flex-col py-1">
            <span className="font-medium text-sm leading-none">
              {item.name}
            </span>
            <span className="text-[11px] text-muted-foreground mt-1">
              {item.brand?.name ?? "Générique"}
              {subtitle ? ` • ${subtitle}` : ""}
            </span>
          </div>
        );
      },
    },
    {
      header: "Type",
      cell: ({ row }) => {
        const item = row.original;

        if (isCataloguePart(item)) {
          return (
            <Badge
              variant="secondary"
              className="gap-1 font-normal text-[10px] h-5"
            >
              <Package className="h-3 w-3" />
              {item.subtype_data.part_type?.name ?? "Pièce"}
            </Badge>
          );
        }
        if (isCatalogueProductModel(item)) {
          return (
            <Badge
              variant="outline"
              className="gap-1 font-normal text-[10px] h-5"
            >
              <Cpu className="h-3 w-3" />
              {item.subtype_data.device_type?.name ?? "Appareil"}
            </Badge>
          );
        }
        return null;
      },
    },
    {
      header: "Variantes existantes",
      cell: ({ row }) => <VariantChips variants={row.original.variants} />,
    },
    {
      header: "Source",
      cell: ({ row }) => {
        const isGlobal = row.original.owner === null;
        return (
          <Badge
            variant={isGlobal ? "secondary" : "outline"}
            className="gap-1 font-normal text-[10px] h-5"
          >
            {isGlobal ? (
              <Globe className="h-3 w-3" />
            ) : (
              <User className="h-3 w-3" />
            )}
            {isGlobal ? "Global" : "Perso"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const currentItem = row.original;
        const isSelected = selectedItems.some(
          (item: CatalogueItem) => item.id === currentItem.id,
        );
        const toggleItem = isSelected
          ? (item: CatalogueItem) => removeItem(item.id)
          : (item: CatalogueItem) => addItem(item);

        return (
          <div className="text-right">
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 gap-2 transition-all ${
                isSelected
                  ? "text-green-600 bg-green-50 hover:bg-green-100"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
              onClick={() => toggleItem(currentItem)}
            >
              {isSelected ? "Retirer" : "Ajouter"}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden border rounded-lg bg-background">
      {/* 1. FILTERS */}
      <div className="flex-none p-4 space-y-3 bg-muted/10 border-b">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-background"
            />
          </div>
          <Tabs
            value={filters.source}
            onValueChange={(v: any) => setFilter("source", v)}
          >
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">
                Tout
              </TabsTrigger>
              <TabsTrigger value="global" className="text-xs">
                Global
              </TabsTrigger>
              <TabsTrigger value="private" className="text-xs">
                Perso
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9"
          >
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
        <FiltersBar />
      </div>

      {/* 2. TABLE */}
      <div
        className={`flex-1 overflow-y-auto min-h-0 ${isPlaceholderData ? "opacity-50" : ""}`}
      >
        {isLoading && items.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground animate-pulse">
            Chargement du catalogue...
          </div>
        ) : (
          <DataTable columns={columns} data={items} />
        )}
      </div>

      {/* 3. PAGINATION */}
      <div className="flex-none flex items-center justify-between p-3 border-t bg-muted/5">
        <div className="text-[11px] text-muted-foreground">
          Total: <span className="font-bold text-foreground">{totalCount}</span>{" "}
          produits
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground mr-2">
            Page {page}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={!hasPrev || isLoading}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={!hasNext || isLoading}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
