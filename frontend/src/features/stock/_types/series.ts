import { Brand } from "./brand";
import { DeviceType } from "./device-type";

export interface Series {
  id: string;
  name: string;
  brand: Brand;
  description?: string;
  device_type: DeviceType;
  market_segment?: "BUDGET" | "MID_RANGE" | "FLAGSHIP" | "PREMIUM";
}
