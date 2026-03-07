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
