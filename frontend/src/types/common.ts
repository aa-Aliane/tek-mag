import { type Product } from "./product";

export type DeviceType = "smartphone" | "tablet" | "computer" | "other"
export type RepairStatus = "saisie" | "en-cours" | "prete" | "en-attente"
export type DepositStatus = "deposited" | "scheduled"
export type UserRole = "admin" | "manager" | "technician"
export type RepairOutcome = "success" | "failed" | null
export type PaymentMethod = "cash" | "card"
export type PaymentStatus = "unpaid" | "partial" | "paid"

export interface Brand {
  id: string
  name: string
  deviceTypes: DeviceType[]
}

export interface Model {
  id: string
  name: string
  brandId: string
  deviceType: DeviceType
}

export interface Issue {
  id: string
  name: string
  deviceTypes: DeviceType[]
  requiresPart?: boolean
  basePrice: number
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

export interface Payment {
  id: string
  amount: number
  method: PaymentMethod
  date: Date
  note?: string
}

export interface Repair {
  id: number;
  uid: string;
  date: string;
  client: User;
  product_model: number | null; // ID of the product model
  description: string;
  password?: string;
  price: string;
  card_payment: string;
  cash_payment: string;
  comment?: string;
  device_photo?: string;
  file?: string;
  created_at: string;
  updated_at: string;
  
  // Fields expected by frontend but missing in backend model (marked optional)
  status?: RepairStatus;
  statusHistory?: StatusChange[];
  payments?: Payment[];
  completedAt?: Date;
  recoveredAt?: Date;
  depositStatus?: DepositStatus;
  outcome?: RepairOutcome;
  scheduledDate?: Date;
  paymentStatus?: PaymentStatus;
  accessories?: string[] | string;  // Can be array or comma-separated string from API
  issueDescription?: string;
  deviceType?: DeviceType;
  brand?: string;
  model?: string;
  issues?: string[];
  totalCost?: number;
  estimatedCompletion?: Date;
  notes?: string;
}

export interface Part {
  id: string
  name: string
  deviceType: DeviceType
  brand?: string
  quantity: number
  minQuantity: number
  price: number
}

export interface PartOrder {
  id: string
  partName: string
  quantity: number
  reason: string
  repairId?: string
  status: "pending" | "ordered" | "received"
  createdAt: Date
}

export interface StatusChange {
  id: string
  from: RepairStatus
  to: RepairStatus
  changedBy: string
  changedAt: Date
  comment?: string
  clientNotified: boolean
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
  product: Product;
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
  actual_delivery_date: string;
  total_price: string;
  down_payment: string;
  delivery_status: string;
  order_status: string;
  tracking_number: string;
  reference: string;
  notes: string;
  updated_at: string;
  suppliers: number[];
}