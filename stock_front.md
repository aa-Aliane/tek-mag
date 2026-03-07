# Tree View:
```
frontend/src/features/stock/
├── _catalogue
│   ├── catalogue-table.tsx
│   └── filters-bar.tsx
├── _items
│   ├── index.tsx
│   └── new
│       ├── _components
│       │   ├── header.tsx
│       │   └── index.ts
│       └── index.tsx
├── _main
│   ├── _hooks
│   │   └── use-stock-items.ts
│   └── index.tsx
├── _queries
│   ├── filters
│   │   ├── use-brand.ts
│   │   └── use-filters.ts
│   ├── use-catalogue.ts
│   ├── use-part-variants.ts
│   ├── use-products.ts
│   └── use-store-items.ts
├── _store
│   ├── catalogue.ts
│   └── categories.ts
└── _types
    ├── brand.ts
    ├── catalogue.ts
    ├── color.ts
    ├── device-type.ts
    ├── index.ts
    ├── location.ts
    ├── part-type.ts
    ├── part.ts
    ├── product-model.ts
    ├── product-variant.ts
    ├── quality-tier.ts
    ├── series.ts
    ├── store-item.ts
    ├── store-order.ts
    └── supplier.ts

```

# Content:

## _catalogue/catalogue-table.tsx

```tsx
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

```


## _catalogue/filters-bar.tsx

```tsx
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

```


## _items/index.tsx

```tsx
"use client";

import React, { useState } from "react";
import { useStockList } from "../_queries/use-store-items";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, ArrowLeft, Router } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import { CatalogueTable } from "../_catalogue/catalogue-table";
import { PartVariant } from "../_types";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const StockItems: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<PartVariant | null>(
    null,
  );

  const { data: stockItems, isLoading } = useStockList({
    page: 1,
    pageSize: 10,
  });

  const items = Array.isArray(stockItems)
    ? stockItems
    : (stockItems?.results ?? []);

  const handleSelectFromCatalogue = (variant: PartVariant) => {
    setSelectedVariant(variant);
  };

  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filtrer mon stock..." className="pl-8" />
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setSelectedVariant(null);
          }}
        >
          <DialogTrigger asChild>
            {/* <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Ajouter du stock
            </Button> */}
          </DialogTrigger>
          <Button size="sm" onClick={() => router.push("/stock/items/new")}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter du stock
          </Button>

          {/* INCREASED WIDTH: max-w-[95vw] for mobile and 7xl for desktop */}
          <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="flex items-center gap-2 text-xl">
                {selectedVariant && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedVariant(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                {selectedVariant
                  ? "Détails de l'ajout"
                  : "Catalogue des Pièces"}
              </DialogTitle>
              {/* Added Description to fix the Console Warning */}
              <DialogDescription>
                {selectedVariant
                  ? "Configurez les détails du stock pour cette pièce."
                  : "Recherchez une référence dans le catalogue global ou vos pièces perso."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              {!selectedVariant ? (
                <div className="h-full p-6">
                  <CatalogueTable onSelect={handleSelectFromCatalogue} />
                </div>
              ) : (
                <div className="p-6 h-full flex flex-col items-center justify-center">
                  <div className="w-full max-w-md space-y-6">
                    <div className="bg-muted/50 p-6 rounded-xl border border-dashed border-primary/20">
                      <h4 className="font-bold text-lg">
                        {selectedVariant.part.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedVariant.name}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="outline">{selectedVariant.sku}</Badge>
                        <Badge>{selectedVariant.quality_tier?.name}</Badge>
                      </div>
                    </div>

                    <div className="space-y-4 bg-card p-6 rounded-lg border shadow-sm">
                      <p className="text-sm text-center text-muted-foreground italic">
                        Formulaire de quantité et prix ici...
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Enregistrer en stock
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Stock Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-muted-foreground animate-pulse">
            Chargement du stock...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold">Pièce</th>
                <th className="p-4 text-right font-semibold">Quantité</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.part?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          SKU: {item.sku || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Badge
                        variant={
                          item.quantity > 0 ? "secondary" : "destructive"
                        }
                      >
                        {item.quantity} unités
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="p-10 text-center text-muted-foreground"
                  >
                    Votre inventaire est vide.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockItems;

```


## _items/new/_components/header.tsx

```tsx
"use client";

import React from "react";
import {
  FileDown,
  ScanBarcode,
  Plus,
  Wrench,
  ShoppingBag,
  Headphones,
  Monitor,
  Info,
  ShoppingBasket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCategoriesStore,
  type entityCategory,
} from "@/features/stock/_store/categories";
import { useCatalogueStore } from "@/features/stock/_store/catalogue";

interface HeaderProps {
  onCategoryChange: (category: entityCategory) => void;
  onCreateNew: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCategoryChange, onCreateNew }) => {
  const category = useCategoriesStore((state) => state.category);
  const selectedItems = useCatalogueStore((state) => state.selectedItems);
  return (
    <div className="flex flex-col gap-6 pb-6 border-b">
      {/* Row 1: Titre et Actions Principales */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Ajouter au stock
          </h2>
          <p className="text-sm text-muted-foreground">
            Trouvez un article dans le catalogue ou créez une fiche
            personnalisée.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* <Button variant="outline" size="sm" className="gap-2 h-9">
            <FileDown className="size-4" /> Importer CSV
          </Button> */}
          {/* <Button variant="outline" size="sm" className="gap-2 h-9">
            <ScanBarcode className="size-4" /> Scanner
          </Button> */}
          {selectedItems.length > 0 && (
            <Button variant="destructive">
              Panier ({selectedItems.length})
              <ShoppingBasket />
            </Button>
          )}
          <Button
            onClick={onCreateNew}
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/80 h-9 transition-colors shadow-sm"
          >
            <Plus className="size-4" /> Créer nouveau
          </Button>
        </div>
      </div>

      {/* Row 2: Tabs de Workflow (Inspiration Utopya) */}
      <div className="flex items-center justify-between bg-muted/40 p-1.5 rounded-lg border border-border/50">
        <div className="flex items-center gap-4">
          <Tabs
            value={category}
            onValueChange={(v) => onCategoryChange(v as entityCategory)}
          >
            <TabsList className="h-8 bg-background/50 border shadow-sm">
              <TabsTrigger value="devices" className="gap-2 px-4 text-xs">
                <ShoppingBag className="size-3.5" /> Appareils
              </TabsTrigger>
              <TabsTrigger value="accessories" className="gap-2 px-4 text-xs">
                <Headphones className="size-3.5" /> Accessoires
              </TabsTrigger>
              <TabsTrigger value="repairs" className="gap-2 px-4 text-xs">
                <Wrench className="size-3.5" /> Réparation
              </TabsTrigger>
              <TabsTrigger value="computers" className="gap-2 px-4 text-xs">
                <Monitor className="size-3.5" /> Informatique
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Message d'aide contextuel intelligent */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
          <Info className="size-3.5 text-primary" />
          <span className="italic">
            {category === "devices" &&
              "Flux optimisé pour Smartphones et Tablettes (IMEI)."}
            {category === "accessories" &&
              "Recherche par compatibilité (Coques, Protections)."}
            {category === "repairs" &&
              "Pièces techniques filtrées par Qualité et Type (Écrans, Batteries)."}
            {category === "computers" &&
              "Composants informatiques (SSD, RAM) et périphériques."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;

```


## _items/new/_components/index.ts

```ts
import Header from "./header";

export { Header };

```


## _items/new/index.tsx

```tsx
"use client";

import React from "react";
import { CatalogueTable } from "../../_catalogue/catalogue-table";
import { Header } from "./_components";
import { entityCategory, useCategoriesStore } from "../../_store/categories";
import { useCatalogueStore } from "../../_store/catalogue";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

const StockNewItem: React.FC<Props> = ({ ...rest }) => {
  const setCategory = useCategoriesStore((state) => state.setCategory);
  const { setPage, resetFilters } = useCatalogueStore();

  const onCategoryChange = (category: entityCategory) => {
    setCategory(category);
    setPage(1);
    resetFilters();
  };

  return (
    <div {...rest}>
      <Header onCategoryChange={onCategoryChange} onCreateNew={() => {}} />
      <CatalogueTable onSelect={() => {}} />
    </div>
  );
};

export default StockNewItem;

```


## _main/_hooks/use-stock-items.ts

```ts
import { PaginatedResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export interface RepairsQueryParams {
  page: number;
  pageSize: number;
  searchTerm?: string;
}

const fetchStockItems = (
  page: number,
  pageSize: number,
  searchTerm?: string,
): Promise<PaginatedResponse<any>> => {};

export const useStockList = () => {};

```


## _main/index.tsx

```tsx
import React from "react";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import StockItems from "@/features/stock/_items";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

const StockView: React.FC<Props> = ({ ...rest }) => {
  return <div className="p-10"></div>;
};

export default StockView;

```


## _queries/filters/use-brand.ts

```ts
import api from "@/lib/api/client";
import { Brand } from "../../_types";
import { useQuery } from "@tanstack/react-query";

interface Params extends Partial<Brand> {
  search?: string;
}

const fetchBrands = async (params: Params): Promise<Brand[]> => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const { data } = await api.get<Brand[]>(
    `/tech/brands/?${searchParams.toString()}`,
  );

  return data;
};

export const useBrands = (params: Params) => {
  return useQuery({
    queryKey: ["brands", params],
    queryFn: () => fetchBrands(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });
};

```


## _queries/filters/use-filters.ts

```ts
import { useQuery } from "@tanstack/react-query";
import { useCategoriesStore } from "../../_store/categories";
import { Brand, Color, QualityTier, PartType, DeviceType } from "../../_types";
import api from "@/lib/api/client";

// Maps the category tab to the product_type param the backend understands.
const CATEGORY_TO_PRODUCT_TYPE: Record<
  string,
  "part" | "product_model" | undefined
> = {
  devices: "product_model",
  repairs: "part",
  accessories: "part",
  computers: undefined,
};

export interface FilterParams extends Partial<Brand> {
  search?: string;
  product_type?: string;
}

// Fetcher functions

const fetchBrands = async (params: FilterParams): Promise<Brand[]> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const { data } = await api.get<Brand[]>(
    `/tech/brands/?${searchParams.toString()}`,
  );
  return data;
};

const fetchQualityTiers = async (
  product_type?: string,
): Promise<QualityTier[]> => {
  const { data } = await api.get<QualityTier[]>("/tech/quality-tiers/", {
    params: { product_type },
  });
  return data;
};

const fetchColors = async (product_type?: string): Promise<Color[]> => {
  const { data } = await api.get<Color[]>("/tech/colors/", {
    params: { product_type },
  });
  return data;
};

const fetchPartTypes = async (): Promise<PartType[]> => {
  const { data } = await api.get<PartType[]>("/tech/part-types/");
  return data;
};

const fetchDeviceTypes = async (): Promise<DeviceType[]> => {
  const { data } = await api.get<DeviceType[]>("/tech/device-types/");
  return data;
};

// Query hooks

const FILTER_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 5,
  refetchOnWindowFocus: false,
} as const;

export const useBrands = (search?: string) => {
  const category = useCategoriesStore((s) => s.category);
  const product_type = CATEGORY_TO_PRODUCT_TYPE[category];

  const params: FilterParams = {
    product_type,
    search: search || undefined,
  };

  return useQuery({
    queryKey: ["brands", params],
    queryFn: () => fetchBrands(params),
    ...FILTER_QUERY_OPTIONS,
  });
};

export const useQualityTiers = () => {
  const category = useCategoriesStore((s) => s.category);
  const product_type = CATEGORY_TO_PRODUCT_TYPE[category];

  return useQuery({
    queryKey: ["quality-tiers", product_type],
    queryFn: () => fetchQualityTiers(product_type),
    ...FILTER_QUERY_OPTIONS,
  });
};

export const useColors = () => {
  const category = useCategoriesStore((s) => s.category);
  const product_type = CATEGORY_TO_PRODUCT_TYPE[category];

  return useQuery({
    queryKey: ["colors", product_type],
    queryFn: () => fetchColors(product_type),
    ...FILTER_QUERY_OPTIONS,
  });
};

export const usePartTypes = () => {
  return useQuery({
    queryKey: ["part-types"],
    queryFn: fetchPartTypes,
    ...FILTER_QUERY_OPTIONS,
  });
};

export const useDeviceTypes = () => {
  return useQuery({
    queryKey: ["device-types"],
    queryFn: fetchDeviceTypes,
    ...FILTER_QUERY_OPTIONS,
  });
};

```


## _queries/use-catalogue.ts

```ts
import { useQuery } from "@tanstack/react-query";

import { PaginatedResponse } from "../_types";
import { CatalogueFilters, CatalogueItem } from "../_types/catalogue";
import api from "@/lib/api/client";

interface Params extends CatalogueFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}

const fetchCatalogue = async (
  params: Params,
): Promise<PaginatedResponse<CatalogueItem>> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("page_size", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.product_type)
    searchParams.set("product_type", params.product_type);
  if (params.brand) searchParams.set("brand", String(params.brand));
  if (params.is_global !== undefined)
    searchParams.set("is_global", String(params.is_global));
  if (params.quality_tier)
    searchParams.set("quality_tier", String(params.quality_tier));
  if (params.color) searchParams.set("color", String(params.color));
  if (params.part_type) searchParams.set("part_type", String(params.part_type));
  if (params.compatible_model)
    searchParams.set("compatible_model", String(params.compatible_model));
  if (params.device_type)
    searchParams.set("device_type", String(params.device_type));
  if (params.series) searchParams.set("series", String(params.series));
  if (params.is_popular !== undefined)
    searchParams.set("is_popular", String(params.is_popular));

  const { data } = await api.get<PaginatedResponse<CatalogueItem>>(
    `/tech/catalogue/?${searchParams.toString()}`,
  );
  return data;
};

export function useCatalogue(params: Params = {}) {
  return useQuery({
    queryKey: ["catalogue", params],
    queryFn: () => fetchCatalogue(params),
    placeholderData: (prev) => prev, // keep showing previous page while loading next
    staleTime: 1000 * 60 * 2, // 2 min — catalogue doesn't change mid-session
  });
}

```


## _queries/use-part-variants.ts

```ts
import api from "@/lib/api/client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { PaginatedResponse, PartVariant } from "../_types";

export interface PartVariantQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  brand?: string;
  quality_tier?: string;
  source?: "all" | "global" | "private";
}

//api fetcher
export const fetchPartVariants = async ({
  page = 1,
  pageSize = 10,
  search = "",
  source,
  ...filters
}: PartVariantQueryParams): Promise<PaginatedResponse<PartVariant>> => {
  const is_global =
    source === "global" ? "true" : source === "private" ? "false" : undefined;

  const response = await api.get<PaginatedResponse<PartVariant>>(
    "/tech/part-variants/",
    {
      params: {
        page,
        page_size: pageSize,
        search: search,
        is_global,
        ...filters,
      },
    },
  );

  return response.data;
};

// query
export const usePartVariantCatalogue = (params: PartVariantQueryParams) => {
  return useQuery({
    queryKey: ["part-variants", params],
    queryFn: () => fetchPartVariants(params),

    placeholderData: keepPreviousData,

    refetchOnWindowFocus: false,

    staleTime: 1000 * 60 * 5,
  });
};

```


## _queries/use-products.ts

```ts
import api from "@/lib/api/client";
import { PaginatedResponse, ProductVariant } from "../_types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export interface ProductVariantParams {
  page?: number;
  pageSize?: number;
  search?: string;
  source?: "all" | "global" | "private";
}

const fetchProducts = async ({
  page = 1,
  pageSize = 10,
  search = "",
  source,
  ...filters
}: ProductVariantParams) => {
  const is_global =
    source === "global" ? "true" : source === "private" ? "false" : undefined;

  const response = await api.get<PaginatedResponse<ProductVariant>>(
    "/tech/product-variants/",
    {
      params: {
        page,
        page_size: pageSize,
        search: search,
        is_global,
        ...filters,
      },
    },
  );

  return response.data;
};

export const useProductVariants = (params: ProductVariantParams) => {
  return useQuery({
    queryKey: ["product-variants", params],
    queryFn: () => fetchProducts(params),

    placeholderData: keepPreviousData,

    refetchOnWindowFocus: false,

    staleTime: 1000 * 60 * 5,
  });
};

```


## _queries/use-store-items.ts

```ts
import { PaginatedResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { StockItem } from "../_types/store-item";
import api from "@/lib/api/client";

export interface StockItemQueryParams {
  page: number;
  pageSize: number;
  searchTerm?: string;
  paginate?: boolean;
}

const fetchStockItems = async (
  page: number,
  pageSize: number,
  searchTerm?: string,
  paginate?: boolean,
): Promise<PaginatedResponse<StockItem>> => {
  const params: any = {
    page,
    page_size: pageSize,
    search: searchTerm,
    paginate: true,
  };

  const response = await api.get("/stock/stock-items/", { params });

  return response.data;
};

export const useStockList = ({
  page,
  pageSize,
  searchTerm,
}: StockItemQueryParams) => {
  return useQuery({
    queryKey: ["stock-items", { page, pageSize, searchTerm }],
    queryFn: () => fetchStockItems(page, pageSize, searchTerm),
  });
};

```


## _store/catalogue.ts

```ts
import { create } from "zustand";
import { CatalogueItem } from "../_types/catalogue";

interface CatalogueFilters {
  brand?: string;
  quality_tier?: string; // repairs and devices
  storage?: string; // devices / computers
  color?: string; // accessories / devices
  part_type?: string; // repairs / accessories
  device_type?: string; // computers
  source: "all" | "global" | "private";
}

interface CatalogueStore {
  search: string;
  debouncedSearch: string;
  page: number;
  filters: CatalogueFilters;
  selectedItems: CatalogueItem[];
  setSearch: (val: string) => void;
  setPage: (page: number) => void;
  setFilter: (key: keyof CatalogueFilters, val: string) => void;
  resetFilters: () => void;
  addItem: (item: CatalogueItem) => void;
  removeItem: (itemId: number) => void;
  removeAllItems: () => void;
}

export const useCatalogueStore = create<CatalogueStore>((set) => ({
  search: "",
  debouncedSearch: "",
  page: 1,
  filters: {
    source: "all",
  },
  selectedItems: [],
  setSearch: (val) => {
    set({ search: val, page: 1 });
    clearTimeout((window as any).searchTimer);
    (window as any).searchTimer = setTimeout(() => {
      set({ debouncedSearch: val });
    }, 400);
  },

  setPage: (page) => set({ page }),

  setFilter: (key, val) =>
    set((state) => ({
      page: 1,
      filters: {
        ...state.filters,
        [key]: val === "all" ? undefined : val,
      },
    })),

  resetFilters: () =>
    set({
      search: "",
      debouncedSearch: "",
      page: 1,
      filters: { source: "all" },
    }),

  addItem: (item: CatalogueItem) =>
    set((state) => ({ selectedItems: [...state.selectedItems, item] })),
  removeItem: (itemId: number) =>
    set((state) => ({
      selectedItems: state.selectedItems.filter(
        (item: CatalogueItem) => item.id !== itemId,
      ),
    })),
  removeAllItems: () => ({ selectedItems: [] }),
}));

```


## _store/categories.ts

```ts
import { create } from "zustand";

export type entityCategory =
  | "devices"
  | "accessories"
  | "repairs"
  | "computers";

interface CategoriesStore {
  category: entityCategory;
  setCategory: (category: entityCategory) => void;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
  category: "devices",
  setCategory: (category: entityCategory) => set({ category }),
}));

```


## _types/brand.ts

```ts
export interface Brand {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

```


## _types/catalogue.ts

```ts
import { Brand } from "./brand";
import { Color } from "./color";
import { DeviceType } from "./device-type";
import { PartType } from "./part-type";
import { ProductModel } from "./product-model";
import { QualityTier } from "./quality-tier";
import { Series } from "./series";

// ── Variant summary (chips per row) ───────────────────────────────────────

export interface VariantSummary {
  id: number;
  quality_tier: QualityTier | null;
  color: Color | null;
  storage: string | null;
  sku: string | null;
  cost_price: string;
  retail_price: string;
}

// ── Subtype-specific data ──────────────────────────────────────────────────

export interface PartSubtypeData {
  part_type: PartType | null;
  compatible_models: ProductModel[];
}

export interface ProductModelSubtypeData {
  device_type: DeviceType | null;
  series: Series | null;
  is_popular: boolean;
  release_year: number | null;
}

// ── Discriminated union ────────────────────────────────────────────────────

interface CatalogueItemBase {
  id: number;
  name: string;
  brand: Brand | null;
  owner: number | null;
  is_serialized: boolean;
  created_at: string;
  updated_at: string;
  variants: VariantSummary[];
}

export interface CataloguePart extends CatalogueItemBase {
  product_type: "part";
  subtype_data: PartSubtypeData;
}

export interface CatalogueProductModel extends CatalogueItemBase {
  product_type: "product_model";
  subtype_data: ProductModelSubtypeData;
}

export interface CatalogueUnknown extends CatalogueItemBase {
  product_type: "unknown";
  subtype_data: Record<string, never>;
}

export type CatalogueItem =
  | CataloguePart
  | CatalogueProductModel
  | CatalogueUnknown;

// ── Type guards ────────────────────────────────────────────────────────────

export function isCataloguePart(item: CatalogueItem): item is CataloguePart {
  return item.product_type === "part";
}

export function isCatalogueProductModel(
  item: CatalogueItem,
): item is CatalogueProductModel {
  return item.product_type === "product_model";
}

// ── Filter params (mirrors CatalogueFilter on the backend) ────────────────

export interface CatalogueFilters {
  product_type?: "part" | "product_model";
  is_global?: boolean;
  brand?: number;
  quality_tier?: number;
  color?: number;
  // Part-specific
  part_type?: number;
  compatible_model?: number;
  // ProductModel-specific
  device_type?: number;
  series?: number;
  is_popular?: boolean;
  //
  storage?: string;
}

```


## _types/color.ts

```ts
export interface Color {
  id: string;
  name: string;
}

```


## _types/device-type.ts

```ts
export interface DeviceType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  domain: "COMPUTERS" | "PHONES";
  created_at: string;
  updated_at: string;
}

```


## _types/index.ts

```ts
// Core Metadata
export * from "./brand";
export * from "./color";
export * from "./quality-tier";
export * from "./part-type";

// Device Hierarchy
export * from "./device-type";
export * from "./series";
export * from "./product-model";

// Main Inventory Entities
export * from "./part";
export * from "./product-variant";

// Common API Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

```


## _types/location.ts

```ts
export interface Location {
  id: number;
  name: string;
  address: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  stateProvince: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  type:
    | "warehouse"
    | "store"
    | "lab"
    | "service_center"
    | "client_location"
    | "";
  serviceRadiusKm: number;
  isPickupLocation: boolean;
  isDropoffLocation: boolean;
  phone: string;
  email: string;
  openingHours: Record<string, string>;
  maxDailyRepairs: number | null;
  requiresAppointment: boolean;
  createdAt: string;
  updatedAt: string;
}

```


## _types/part-type.ts

```ts
export interface PartType {
  id: string;
  name: string;
}

```


## _types/part.ts

```ts
import { Brand } from "./brand";
import { PartType } from "./part-type";

export interface Part {
  id: string;
  name: string;
  owner: number | null;
  brand?: Brand;
  part_type: PartType;
  created_at: string;
  updated_at: string;
}

```


## _types/product-model.ts

```ts
import { Brand } from "./brand";
import { Series } from "./series";

export interface ProductModel {
  id: string;
  name: string;
  brand: Brand;
  series?: Series;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

```


## _types/product-variant.ts

```ts
import { Brand } from "./brand";
import { Color } from "./color";
import { QualityTier } from "./quality-tier";

export interface Owner {
  id: number;
  username: string;
}

export interface BaseProduct {
  id: number;
  name: string;
  brand: Brand;
  image_url?: string;
  owner: Owner | null;
  is_serialized: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  product: BaseProduct;
  name: string;
  sku: string | null;
  ean13: string | null;
  color?: Color | null;
  quality_tier?: QualityTier | null;
  storage?: string | null;
  retail_price: string;
  cost_price: string;
  special_price?: string;
  is_active: boolean;
}

```


## _types/quality-tier.ts

```ts
export interface QualityTier {
  id: string;
  name: string;
  description?: string;
}

```


## _types/series.ts

```ts
import { Brand } from "./brand";
import { DeviceType } from "./device-type";

export interface Series {
  id: string;
  name: string;
  brand: Brand;
  description?: string;
  device_type: DeviceType;
  market_segment?: "BUDGET" | "MID_RANGE" | "FLAGSHIP" | "PREMIUM";
}

```


## _types/store-item.ts

```ts
import { Part } from "@/types/part";

export interface StockItem {
  id: number;
  part: Part;
  location: number | null;
  locationName?: string;
  quantity: number;
  serialNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

```


## _types/store-order.ts

```ts
import { Supplier } from "./supplier";

export type OrderStatus = "pending" | "ordered" | "received" | "cancelled";

export interface StoreOrder {
  id: number;
  supplier: Supplier;
  suppliers: Supplier[];
  status: OrderStatus;
  deliveryStatus: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  notes: string;
  itemsDescription: string;
  totalPrice: string;
  downPayment: string;
  orderStatus: string;
  trackingNumber: string;
  reference: string;
  orderName: string;
  url: string;
  orderedBy: number;
  createdAt: string;
  updatedAt: string;
}

```


## _types/supplier.ts

```ts
export interface Supplier {
  id: number;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

```

