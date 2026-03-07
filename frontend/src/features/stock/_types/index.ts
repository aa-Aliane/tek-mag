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
