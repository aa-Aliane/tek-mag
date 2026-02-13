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
