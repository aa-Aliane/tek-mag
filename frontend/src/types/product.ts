export interface DeviceType {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  domain: "COMPUTERS" | "PHONES";
}

export interface Brand {
  id: number;
  name: string;
}

export interface Series {
  id: number;
  name: string;
  brand: number; // ID
  device_type: number; // ID
  description: string;
}

export interface ProductModel {
  id: number;
  name: string;
  brand: number; // ID
  series: number; // ID
}

export interface Product {
  id: number;
  name: string;
  ean13: string | null;
  sku: string | null;
  serial_number: string;
  image_url: string;
  price: string;
  repair_price: string;
  special_price: string;
  other_price: string;
  brand: number | null; // ID
  model: number | null; // ID
  created_at: string;
  updated_at: string;
}
