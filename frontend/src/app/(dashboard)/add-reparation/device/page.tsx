"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { BrandSelection } from "@/components/features/brand-selection/BrandSelection";
import { ModelSelection } from "@/components/features/model-selection/ModelSelection";
import { useAddReparationDevice } from "@/features/repairs/_add-reparation/_hooks/use-device-selection";
import { DeviceTypeGrid } from "@/features/repairs/_add-reparation/_components/device/device-type-grid";
import { StepLayout } from "@/features/repairs/_add-reparation/_layouts/step-layout";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  params?: any;
  searchParams?: any;
}

const AddReparationDevicePage: React.FC<Props> = ({
  className,
  params,
  searchParams,
  ...rest
}) => {
  const {
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
    canProceedStep1,
    isBrandLoadingForDevice,
    isModelLoadingForBrand,
  } = useAddReparationDevice();

  // defines router for navigation to next page
  const router = useRouter();

  // Handle loading states
  if (isLoadingDeviceTypes) {
    return (
      <div
        className={cn(
          "flex items-center justify-center min-h-[400px]",
          className,
        )}
        {...rest}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-lg">Chargement des types d'appareils...</p>
        </div>
      </div>
    );
  }

  // Show errors if any
  if (deviceTypesError || brandsError || modelsError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center min-h-[400px]",
          className,
        )}
        {...rest}
      >
        <div className="text-center p-4">
          <p className="text-lg text-red-600">
            Erreur de chargement des données
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Veuillez réessayer plus tard
          </p>
        </div>
      </div>
    );
  }

  return (
    <StepLayout
      title="Type d'appareil"
      description="Sélectionnez le type d'appareil à réparer"
      onNext={() => router.push("/add-reparation/issues")}
      isNextDisabled={!canProceedStep1}
      isNextLoading={isBrandLoadingForDevice || isModelLoadingForBrand}
      className={className}
      {...rest}
    >
      <div className="space-y-6">
        <DeviceTypeGrid
          deviceTypes={deviceTypes}
          deviceType={deviceType}
          onDeviceTypeSelect={(slug) => {
            setDeviceType(slug);
            setBrand("");
            setModel("");
          }}
        />

        {deviceType && (
          <div className="grid gap-4 pt-4">
            <div className="space-y-2">
              <Label>Marque</Label>
              {isLoadingBrands ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Chargement des marques...</span>
                </div>
              ) : (
                <BrandSelection
                  brands={filteredBrands}
                  selectedBrand={brand}
                  onBrandSelect={(brandId) => {
                    setBrand(brandId);
                    setModel("");
                  }}
                  deviceTypeId={selectedDeviceTypeId}
                />
              )}
            </div>

            {brand && (
              <div className="space-y-2">
                <Label>Modèle</Label>
                {isLoadingModels ? (
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Chargement des modèles...</span>
                  </div>
                ) : (
                  <ModelSelection
                    models={filteredModels}
                    selectedBrand={getBrandName(brand)}
                    selectedModel={model}
                    onModelSelect={(modelId) => {
                      setModel(modelId);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </StepLayout>
  );
};

export default AddReparationDevicePage;
