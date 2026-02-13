export interface Location {
  id: number;
  name: string;
  address: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  stateProvince: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  type:
    | "warehouse"
    | "store"
    | "lab"
    | "service_center"
    | "client_location"
    | "";
  serviceRadiusKm: number;
  isPickupLocation: boolean;
  isDropoffLocation: boolean;
  phone: string;
  email: string;
  openingHours: Record<string, string>;
  maxDailyRepairs: number | null;
  requiresAppointment: boolean;
  createdAt: string;
  updatedAt: string;
}
