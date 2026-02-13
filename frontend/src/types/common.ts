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
  remiseType?: "percentage" | "fixed" | "none";
  remiseValue?: number;
  isRounding?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Discount {
  id: string;
  repair: string;
  amount: number;
  reason: string;
  createdAt: string;
  createdBy?: User;
  createdByName?: string;
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
  partId: number;
  qualityTier: "standard" | "premium" | "original" | "refurbished";
  price: number;
  warrantyDays: number;
  availabilityStatus:
    | "in_stock"
    | "low_stock"
    | "out_of_stock"
    | "discontinued";
  descriptionFr?: string;
  descriptionEn?: string;
}

export interface ServicePricing {
  id: number;
  pricingType: "fixed" | "hourly" | "tiered";
  basePrice: number;
  timeEstimateMinutes?: number;
  complexityLevel: "low" | "medium" | "high" | "critical";
  descriptionFr?: string;
  descriptionEn?: string;
}

export interface RepairIssue {
  id: number;
  issue: Issue;
  issueId: number;
  qualityTier?: PartQualityTier;
  qualityTierId?: number;
  customPrice?: number;
  notes?: string;
  getPrice: number;
}

export interface Profile {
  id: number;
  type: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string | null;
  profilePicture: string | null;
}

export interface User {
  id: number; // Mapped from pk or added to serializer
  pk: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profile: Profile;
}

export interface Client extends User {}

export interface Series {
  id: number;
  name: string;
  deviceType: DeviceType;
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
  // scheduledDate?: string | null;
  client: User;
  productModel?: ProductModel | null;
  description: string;
  password?: string | null;
  accessories?: string | null;
  comment?: string | null;
  devicePhoto?: string | null;
  file?: string | null;
  createdAt: string;
  updatedAt: string;
  isInStore: boolean;
  isSuccessful: boolean | null;
  status: RepairStatus;

  // Financial fields from new backend
  basePrice: number;
  totalDiscounts: number;
  finalPrice: number;
  totalPaid: number;
  remainingBalance: number;
  paymentStatus: PaymentStatus;

  // Related data
  repairIssues: RepairIssue[];
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
  repairIssueData?: {
    issueId: number;
    qualityTierId?: number;
    customPrice?: number;
    notes?: string;
  }[];
  totalCost?: number;

  estimatedCompletion?: Date;
  notes?: string;

  // Legacy fields for backward compatibility (deprecated)
  price?: string;
  remise?: string;
  cardPayment?: string;
  cashPayment?: string;
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
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  notes: string;
  isActive: boolean;
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
  stockType: StockType;
  quantity: number;
}

export interface StoreOrder {
  id: number;
  orderName: string;
  description: string;
  url: string;
  orderedBy: number;
  createdAt: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  totalPrice: string;
  downPayment: string;
  status?: string; // Backend field (fallback)
  deliveryStatus: string; // Primary field from serializer
  orderStatus: string;
  trackingNumber: string;
  reference: string;
  notes: string;
  updatedAt: string;
  suppliers: number[];
}
