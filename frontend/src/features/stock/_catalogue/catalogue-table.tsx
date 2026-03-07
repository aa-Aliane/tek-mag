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
} from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCatalogue } from "../_queries/use-catalogue";
import { useCatalogueStore } from "../_store/catalogue";
import { useCategoriesStore, entityCategory } from "../_store/categories";
import {
  CatalogueItem,
  CatalogueFilters,
  VariantSummary,
  isCataloguePart,
  isCatalogueProductModel,
} from "../_types/catalogue";
import { FiltersBar } from "./filters-bar";

const CATEGORY_TO_PRODUCT_TYPE: Record<
  string,
  CatalogueFilters["product_type"]
> = {
  devices: "product_model",
  repairs: "part",
  accessories: "part",
  computers: undefined,
};

interface Props {
  onSelect: (item: CatalogueItem) => void;
}

// ── Reusable chip lists ────────────────────────────────────────────────────

function ChipList({
  items,
  max = 3,
  emptyLabel,
}: {
  items: string[];
  max?: number;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <span className="text-[10px] text-muted-foreground italic">
        {emptyLabel}
      </span>
    );
  }
  const visible = items.slice(0, max);
  const overflow = items.length - max;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((label, i) => (
        <Badge
          key={i}
          variant="outline"
          className="text-[10px] px-1.5 h-5 font-normal shadow-none"
        >
          {label}
        </Badge>
      ))}
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

// ── Per-category column builders ───────────────────────────────────────────

// Shared: product name + contextual subtitle + inline source icon
function productCell(item: CatalogueItem) {
  const isGlobal = item.owner === null;

  const subtitle = isCataloguePart(item)
    ? item.subtype_data.part_type?.name
    : isCatalogueProductModel(item)
      ? (item.subtype_data.series?.name ?? item.subtype_data.device_type?.name)
      : null;

  return (
    <div className="flex flex-col py-1">
      <div className="flex items-center gap-1.5">
        {isGlobal ? (
          <Globe className="h-3 w-3 text-muted-foreground/60 shrink-0" />
        ) : (
          <User className="h-3 w-3 text-muted-foreground/60 shrink-0" />
        )}
        <span className="font-medium text-sm leading-none">{item.name}</span>
      </div>
      <span className="text-[11px] text-muted-foreground mt-1 ml-[18px]">
        {item.brand?.name ?? "Générique"}
        {subtitle ? ` • ${subtitle}` : ""}
      </span>
    </div>
  );
}

// Devices: configs = unique storage × grade combinations
function configsFromVariants(variants: VariantSummary[]): string[] {
  return variants.map((v) => {
    return (
      [v.storage, v.quality_tier?.name].filter(Boolean).join(" • ") ||
      "Standard"
    );
  });
}

// Repairs / accessories: quality tier chips
function tiersFromVariants(variants: VariantSummary[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const v of variants) {
    const name = v.quality_tier?.name;
    if (name && !seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }
  return result;
}

// Accessories: color chips
function colorsFromVariants(variants: VariantSummary[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const v of variants) {
    const name = v.color?.name;
    if (name && !seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }
  return result;
}

// Compatible models chips (repairs / accessories)
function compatibleModels(item: CatalogueItem): string[] {
  if (!isCataloguePart(item)) return [];
  return item.subtype_data.compatible_models.map((m) => m.name);
}

// ── Column definitions per category ───────────────────────────────────────

function buildColumns(
  category: entityCategory,
  selectedItems: CatalogueItem[],
  addItem: (item: CatalogueItem) => void,
  removeItem: (id: number) => void,
): ColumnDef<CatalogueItem>[] {
  const actionColumn: ColumnDef<CatalogueItem> = {
    id: "actions",
    cell: ({ row }) => {
      const current = row.original;
      const isSelected = selectedItems.some((i) => i.id === current.id);
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
            onClick={() =>
              isSelected ? removeItem(current.id) : addItem(current)
            }
          >
            {isSelected ? "Retirer" : "Ajouter"}
          </Button>
        </div>
      );
    },
  };

  // ── Appareils ────────────────────────────────────────────────────────────
  if (category === "devices") {
    return [
      {
        header: "Appareil",
        cell: ({ row }) => productCell(row.original),
      },
      {
        header: "Configurations disponibles",
        cell: ({ row }) => (
          <ChipList
            items={configsFromVariants(row.original.variants)}
            emptyLabel="Aucune config"
          />
        ),
      },
      actionColumn,
    ];
  }

  // ── Réparation ────────────────────────────────────────────────────────────
  if (category === "repairs") {
    return [
      {
        header: "Pièce",
        cell: ({ row }) => productCell(row.original),
      },
      {
        header: "Compatible avec",
        cell: ({ row }) => (
          <ChipList
            items={compatibleModels(row.original)}
            max={4}
            emptyLabel="Non renseigné"
          />
        ),
      },
      {
        header: "Qualités dispo",
        cell: ({ row }) => (
          <ChipList
            items={tiersFromVariants(row.original.variants)}
            emptyLabel="Aucune"
          />
        ),
      },
      actionColumn,
    ];
  }

  // ── Accessoires ───────────────────────────────────────────────────────────
  if (category === "accessories") {
    return [
      {
        header: "Accessoire",
        cell: ({ row }) => productCell(row.original),
      },
      {
        header: "Compatible avec",
        cell: ({ row }) => (
          <ChipList
            items={compatibleModels(row.original)}
            max={4}
            emptyLabel="Non renseigné"
          />
        ),
      },
      {
        header: "Couleurs dispo",
        cell: ({ row }) => (
          <ChipList
            items={colorsFromVariants(row.original.variants)}
            emptyLabel="Aucune"
          />
        ),
      },
      actionColumn,
    ];
  }

  // ── Informatique (mixed) ──────────────────────────────────────────────────
  return [
    {
      header: "Produit",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col py-1">
            <div className="flex items-center gap-1.5">
              {item.owner === null ? (
                <Globe className="h-3 w-3 text-muted-foreground/60 shrink-0" />
              ) : (
                <User className="h-3 w-3 text-muted-foreground/60 shrink-0" />
              )}
              <span className="font-medium text-sm leading-none">
                {item.name}
              </span>
              {/* Show Part vs Device badge only in the mixed computers tab */}
              <Badge
                variant="secondary"
                className="text-[9px] h-4 px-1 font-normal ml-1"
              >
                {isCataloguePart(item) ? "Composant" : "Appareil"}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 ml-[18px]">
              {item.brand?.name ?? "Générique"}
              {isCatalogueProductModel(item) && item.subtype_data.device_type
                ? ` • ${item.subtype_data.device_type.name}`
                : ""}
            </span>
          </div>
        );
      },
    },
    {
      header: "Configurations",
      cell: ({ row }) => (
        <ChipList
          items={configsFromVariants(row.original.variants)}
          emptyLabel="Aucune config"
        />
      ),
    },
    actionColumn,
  ];
}

// ── Main component ─────────────────────────────────────────────────────────

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
    selectedItems,
    addItem,
    removeItem,
  } = useCatalogueStore();

  const { category } = useCategoriesStore();
  const product_type = CATEGORY_TO_PRODUCT_TYPE[category];

  const { data, isLoading, isPlaceholderData } = useCatalogue({
    page,
    pageSize: 10,
    search: debouncedSearch,
    product_type,
    ...(filters.source === "global" && { is_global: true }),
    ...(filters.source === "private" && { is_global: false }),
    brand: filters.brand ? Number(filters.brand) : undefined,
    quality_tier: filters.quality_tier
      ? Number(filters.quality_tier)
      : undefined,
    color: filters.color ? Number(filters.color) : undefined,
    device_type: filters.device_type ? Number(filters.device_type) : undefined,
    part_type: filters.part_type ? Number(filters.part_type) : undefined,
    storage: filters.storage ?? undefined,
  });

  const items = Array.isArray(data) ? data : (data?.results ?? []);
  const totalCount = Array.isArray(data) ? data.length : (data?.count ?? 0);
  const hasNext = Array.isArray(data) ? false : !!data?.next;
  const hasPrev = Array.isArray(data) ? false : !!data?.previous;

  const columns = buildColumns(category, selectedItems, addItem, removeItem);

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
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            Aucun résultat pour ces filtres.
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
