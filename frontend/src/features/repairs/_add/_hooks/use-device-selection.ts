import { useState } from "react";
import { useRouter } from "next/navigation";
import { useReparationStore } from "@/lib/store";
import { useDeviceTypes } from "@/hooks/use-device-types";
import { useBrands } from "@/hooks/use-brands";
import { useProductModels } from "@/hooks/use-product-models";

export function useAddReparationDevice() {
  const router = useRouter();
  const { deviceType, setDeviceType, brand, setBrand, model, setModel } =
    useReparationStore();

  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  // Fetch data from backend
  const {
    data: deviceTypesData,
    isLoading: isLoadingDeviceTypes,
    error: deviceTypesError,
  } = useDeviceTypes();

  // Get device types, brands, and models from API data
  const deviceTypes = deviceTypesData?.results || [];

  // Get device type ID based on the selected device type slug
  const selectedDeviceTypeId = deviceType
    ? deviceTypes.find((dt) => dt.slug === deviceType)?.id
    : undefined;

  const {
    data: brandsData,
    isLoading: isLoadingBrands,
    error: brandsError,
  } = useBrands(selectedDeviceTypeId);

  const {
    data: modelsData,
    isLoading: isLoadingModels,
    error: modelsError,
  } = useProductModels(brand, selectedDeviceTypeId);

  const brands = brandsData || [];
  const models = modelsData || [];

  // Brands are already filtered by device type from the backend
  const filteredBrands = brands;

  // Filter models based on selected brand
  const filteredModels = brand
    ? models.filter((model: any) => model.brand == brand)
    : models;

  // Get brand name by ID
  const getBrandName = (brandId: string) => {
    const brandNumId = parseInt(brandId);
    const brandObj = brands.find((b) => b.id === brandNumId);
    return brandObj ? brandObj.name : brandId;
  };

  // Get model name by ID
  const getModelName = (modelId: string) => {
    const modelNumId = parseInt(modelId);
    const modelObj = models.find((m) => m.id === modelNumId);
    return modelObj ? modelObj.name : modelId;
  };

  const canProceedStep1 = deviceType && brand && model;

  // Check if we're still loading dependent data
  const isBrandLoadingForDevice = deviceType && isLoadingBrands;
  const isModelLoadingForBrand = brand && isLoadingModels;

  return {
    deviceType,
    setDeviceType,
    brand,
    setBrand,
    model,
    setModel,
    deviceTypes,
    isLoadingDeviceTypes,
    deviceTypesError,
    selectedDeviceTypeId,
    isLoadingBrands,
    brandsError,
    filteredBrands,
    isLoadingModels,
    modelsError,
    filteredModels,
    getBrandName,
    getModelName,
    canProceedStep1,
    isBrandLoadingForDevice,
    isModelLoadingForBrand,
    brandOpen,
    setBrandOpen,
    modelOpen,
    setModelOpen,
  };
}
