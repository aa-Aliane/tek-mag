import { Brand } from "./brand";
import { Series } from "./series";

export interface ProductModel {
  id: string;
  name: string;
  brand: Brand;
  series?: Series;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}
