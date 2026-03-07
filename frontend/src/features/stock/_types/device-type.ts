export interface DeviceType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  domain: "COMPUTERS" | "PHONES";
  created_at: string;
  updated_at: string;
}
