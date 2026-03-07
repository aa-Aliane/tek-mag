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
