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
