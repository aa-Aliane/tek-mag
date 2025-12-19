"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useReparationStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Check, Smartphone, Tablet, Laptop, Monitor, Watch, Gamepad2, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDeviceTypes } from "@/hooks/use-device-types";
import { useBrands } from "@/hooks/use-brands";
import { useProductModels } from "@/hooks/use-product-models";

// Helper function to get device icon
const getDeviceIcon = (slug: string) => {
  if (slug.includes('smartphone') || slug.includes('phone')) {
    return <Smartphone className="h-8 w-8" />;
  } else if (slug.includes('tablet')) {
    return <Tablet className="h-8 w-8" />;
  } else if (slug.includes('laptop') || slug.includes('computer') || slug.includes('pc')) {
    return <Laptop className="h-8 w-8" />;
  } else if (slug.includes('desktop')) {
    return <Monitor className="h-8 w-8" />;
  } else if (slug.includes('watch')) {
    return <Watch className="h-8 w-8" />;
  } else if (slug.includes('console')) {
    return <Gamepad2 className="h-8 w-8" />;
  } else if (slug.includes('other')) {
    return <Smartphone className="h-8 w-8" />; // Using smartphone as default for 'other'
  } else {
    return <Smartphone className="h-8 w-8" />;
  }
};


export default function AddReparationDevicePage() {
  const router = useRouter();
  const {
    deviceType,
    setDeviceType,
    brand,
    setBrand,
    model,
    setModel,
    scheduledDate,
  } = useReparationStore();

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

  const brands = brandsData?.results || [];
  const models = modelsData?.results || [];

  // Brands are already filtered by device type from the backend
  const filteredBrands = brands;

  // Client-side filtering since API doesn't seem to filter properly
  // Filter models based on selected brand
  const filteredModels = brand
    ? models.filter(model => model.brand == brand)
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

  // Handle loading states
  if (isLoadingDeviceTypes) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
      <div className="flex items-center justify-center min-h-[400px]">
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
    <Card className="p-8">
      {/* Step 1: Device */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Type d'appareil
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sélectionnez le type d'appareil à réparer
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {deviceTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setDeviceType(type.slug); // Use slug instead of name to match backend expectations
                setBrand("");
                setModel("");
              }}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all hover:border-primary/50",
                deviceType === type.slug // Compare with slug
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card",
              )}
            >
              {getDeviceIcon(type.slug)}
              <span className="text-xs font-medium text-center">{type.name}</span>
            </button>
          ))}
        </div>

        {deviceType && (
          <div className="grid gap-4 pt-4">
            <div className="space-y-2">
              <Label>Marque</Label>
              <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={brandOpen}
                    className="w-full justify-between"
                    disabled={isLoadingBrands} // Disable while loading brands
                  >
                    {isLoadingBrands ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Chargement...
                      </div>
                    ) : (
                      <>
                        {brand
                          ? getBrandName(brand)
                          : "Sélectionnez une marque..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder={
                        brand ? brand : "rechercher une marque..."
                      }
                    />
                    <CommandList>
                      {isLoadingBrands ? (
                        <CommandItem disabled>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Chargement des marques...
                        </CommandItem>
                      ) : (
                        <>
                          <CommandEmpty>
                            Aucune marque trouvée.
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredBrands.map((b) => (
                              <CommandItem
                                key={b.id}
                                value={b.id.toString()}
                                onSelect={(currentValue) => {
                                  // Always select the clicked brand (no toggle behavior)
                                  const newBrandId = b.id.toString();
                                  setBrand(newBrandId);
                                  setModel("");
                                  setBrandOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    brand === b.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {b.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {brand && (
              <div className="space-y-2">
                <Label>Modèle</Label>
                <Popover open={modelOpen} onOpenChange={setModelOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={modelOpen}
                      className="w-full justify-between"
                      disabled={isLoadingModels} // Disable while loading models
                    >
                      {isLoadingModels ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Chargement...
                        </div>
                      ) : (
                        <>
                          {model
                            ? getModelName(model)
                            : "Sélectionnez un modèle..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Rechercher un modèle..." />
                      <CommandList>
                        {isLoadingModels ? (
                          <CommandItem disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Chargement des modèles...
                          </CommandItem>
                        ) : (
                          <>
                            <CommandEmpty>
                              Aucun modèle trouvé.
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredModels.map((m) => (
                                <CommandItem
                                  key={m.id}
                                  value={m.id.toString()}
                                  onSelect={(currentValue) => {
                                    // Always select the clicked model (no toggle behavior)
                                    const newModelId = m.id.toString();
                                    setModel(newModelId);
                                    setModelOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      model === m.id.toString()
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {m.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            onClick={() => router.push("/add-reparation/issues")}
            disabled={
              !canProceedStep1 ||
              isBrandLoadingForDevice ||
              isModelLoadingForBrand
            }
            size="lg"
          >
            {isBrandLoadingForDevice || isModelLoadingForBrand ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              "Suivant"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}