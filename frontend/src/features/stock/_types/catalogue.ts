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
