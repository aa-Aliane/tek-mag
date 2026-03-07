import { useQuery } from "@tanstack/react-query";
import { useCategoriesStore } from "../../_store/categories";
import { Brand, Color, QualityTier, PartType, DeviceType } from "../../_types";
import api from "@/lib/api/client";

// Maps the category tab to the product_type param the backend understands.
const CATEGORY_TO_PRODUCT_TYPE: Record<
  string,
  "part" | "product_model" | undefined
> = {
  devices: "product_model",
  repairs: "part",
  accessories: "part",
  computers: undefined,
};

export interface FilterParams extends Partial<Brand> {
  search?: string;
  product_type?: string;
}

// Fetcher functions

const fetchBrands = async (params: FilterParams): Promise<Brand[]> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const { data } = await api.get<Brand[]>(
    `/tech/brands/?${searchParams.toString()}`,
  );
  return data;
};

const fetchQualityTiers = async (
  product_type?: string,
): Promise<QualityTier[]> => {
  const { data } = await api.get<QualityTier[]>("/tech/quality-tiers/", {
    params: { product_type },
  });
  return data;
};

const fetchColors = async (product_type?: string): Promise<Color[]> => {
  const { data } = await api.get<Color[]>("/tech/colors/", {
    params: { product_type },
  });
  return data;
};

const fetchPartTypes = async (): Promise<PartType[]> => {
  const { data } = await api.get<PartType[]>("/tech/part-types/");
  return data;
};

const fetchDeviceTypes = async (): Promise<DeviceType[]> => {
  const { data } = await api.get<DeviceType[]>("/tech/device-types/");
  return data;
};

// Query hooks

const FILTER_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 5,
  refetchOnWindowFocus: false,
} as const;

export const useBrands = (search?: string) => {
  const category = useCategoriesStore((s) => s.category);
  const product_type = CATEGORY_TO_PRODUCT_TYPE[category];

  const params: FilterParams = {
    product_type,
    search: search || undefined,
  };

  return useQuery({
    queryKey: ["brands", params],
    queryFn: () => fetchBrands(params),
    ...FILTER_QUERY_OPTIONS,
  });
};

export const useQualityTiers = () => {
  const category = useCategoriesStore((s) => s.category);
  const product_type = CATEGORY_TO_PRODUCT_TYPE[category];

  return useQuery({
    queryKey: ["quality-tiers", product_type],
    queryFn: () => fetchQualityTiers(product_type),
    ...FILTER_QUERY_OPTIONS,
  });
};

export const useColors = () => {
  const category = useCategoriesStore((s) => s.category);
  const product_type = CATEGORY_TO_PRODUCT_TYPE[category];

  return useQuery({
    queryKey: ["colors", product_type],
    queryFn: () => fetchColors(product_type),
    ...FILTER_QUERY_OPTIONS,
  });
};

export const usePartTypes = () => {
  return useQuery({
    queryKey: ["part-types"],
    queryFn: fetchPartTypes,
    ...FILTER_QUERY_OPTIONS,
  });
};

export const useDeviceTypes = () => {
  return useQuery({
    queryKey: ["device-types"],
    queryFn: fetchDeviceTypes,
    ...FILTER_QUERY_OPTIONS,
  });
};
