import { type Part as PartType } from "./part";

export type DeviceType = "smartphone" | "tablet" | "computer" | "other";
export type RepairStatus = "saisie" | "en-cours" | "prete" | "en-attente";
export type DepositStatus = "deposited" | "scheduled";
export type UserRole = "admin" | "manager" | "technician";
export type RepairOutcome = "success" | "failed" | null;
export type PaymentMethod = "cash" | "card" | "check" | "transfer";
export type PaymentStatus = "unpaid" | "partial" | "paid";

// Payment interface for the new payment system
export interface Payment {
  id: string;
  repair: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
  remise_type?: "percentage" | "fixed" | "none";
  remise_value?: number;
  is_rounding?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Discount {
  id: string;
  repair: string;
  amount: number;
  reason: string;
  created_at: string;
  created_by?: User;
  created_by_name?: string;
}

export interface Brand {
  id: string;
  name: string;
  deviceTypes: DeviceType[];
}

export interface Model {
  id: string;
  name: string;
  brandId: string;
  deviceType: DeviceType;
}

export interface Issue {
  id: string;
  name: string;
  deviceTypes: DeviceType[];
  requiresPart?: boolean;
  basePrice: number;
  categoryType: "part_based" | "service_based";
  associatedPart?: number;
  compatibleParts?: number[];
  servicePricing?: ServicePricing[];
}

export interface PartQualityTier {
  id: number;
  part_id: number;
  quality_tier: "standard" | "premium" | "original" | "refurbished";
  price: number;
  warranty_days: number;
  availability_status:
    | "in_stock"
    | "low_stock"
    | "out_of_stock"
    | "discontinued";
  description_fr?: string;
  description_en?: string;
}

export interface ServicePricing {
  id: number;
  pricing_type: "fixed" | "hourly" | "tiered";
  base_price: number;
  time_estimate_minutes?: number;
  complexity_level: "low" | "medium" | "high" | "critical";
  description_fr?: string;
  description_en?: string;
}

export interface RepairIssue {
  id: number;
  issue: Issue;
  issue_id: number;
  quality_tier?: PartQualityTier;
  quality_tier_id?: number;
  custom_price?: number;
  notes?: string;
  get_price: number;
}

export interface Profile {
  id: number;
  type: string;
  phone_number: string;
  address: string;
  date_of_birth: string | null;
  profile_picture: string | null;
}

export interface User {
  id: number; // Mapped from pk or added to serializer
  pk: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: Profile;
}

export interface Client extends User {}

export interface Series {
  id: number;
  name: string;
  device_type: DeviceType;
}
export interface ProductModel {
  id: number;
  name: string;
  brand: Brand;
  series?: Series;
}

export interface Repair {
  id: number;
  uid: string;
  date: string;
  scheduled_date?: string | null;
  client: User;
  product_model?: ProductModel | null;
  description: string;
  password?: string | null;
  accessories?: string | null;
  comment?: string | null;
  device_photo?: string | null;
  file?: string | null;
  created_at: string;
  updated_at: string;
  is_in_store: boolean;
  is_successful: boolean | null;
  status: RepairStatus;

  // Financial fields from new backend
  base_price: number;
  total_discounts: number;
  final_price: number;
  total_paid: number;
  remaining_balance: number;
  payment_status: PaymentStatus;

  // Related data
  repair_issues: RepairIssue[];
  payments: Payment[];
  discounts?: any[]; // Discount model if needed

  // Computed display fields from serializer
  brand?: string;
  model?: string;
  deviceType?: string;

  // Frontend-specific fields (marked optional)
  statusHistory?: StatusChange[];
  completedAt?: Date;
  recoveredAt?: Date;
  depositStatus?: DepositStatus;
  outcome?: RepairOutcome;
  scheduledDate?: Date;
  issueDescription?: string;
  issues?: string[];
  repair_issue_data?: {
    issue_id: number;
    quality_tier_id?: number;
    custom_price?: number;
    notes?: string;
  }[];
  totalCost?: number;
  finalPrice?: number;
  remainingBalance?: number;
  estimatedCompletion?: Date;
  notes?: string;

  // Legacy fields for backward compatibility (deprecated)
  price?: string;
  remise?: string;
  card_payment?: string;
  cash_payment?: string;
  payment?: Payment[];
}

export interface Part {
  id: string;
  name: string;
  deviceType: DeviceType;
  brand?: string;
  quantity: number;
  minQuantity: number;
  price: number;
}

export interface PartOrder {
  id: string;
  partName: string;
  quantity: number;
  reason: string;
  repairId?: string;
  status: "pending" | "ordered" | "received";
  createdAt: Date;
}

export interface StatusChange {
  id: string;
  from: RepairStatus;
  to: RepairStatus;
  changedBy: string;
  changedAt: Date;
  comment?: string;
  clientNotified: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  notes: string;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Location {
  id: number;
  name: string;
}

export interface StockType {
  id: number;
  name: string;
}

export interface StockItem {
  id: number;
  part: Part;
  location: Location;
  stock_type: StockType;
  quantity: number;
}

export interface StoreOrder {
  id: number;
  order_name: string;
  description: string;
  url: string;
  ordered_by: number;
  created_at: string;
  estimated_delivery_date: string;
  actual_delivery_date?: string;
  total_price: string;
  down_payment: string;
  status?: string; // Backend field (fallback)
  delivery_status: string; // Primary field from serializer
  order_status: string;
  tracking_number: string;
  reference: string;
  notes: string;
  updated_at: string;
  suppliers: number[];
}
