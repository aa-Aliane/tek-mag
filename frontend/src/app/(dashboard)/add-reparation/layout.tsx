"use client";

import type { ReactNode } from "react";
import { useState, useEffect, createElement } from "react";
import { usePathname } from "next/navigation";
import { useReparationStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Check, Smartphone, Tablet, Laptop, Monitor, Watch, Gamepad2 } from "lucide-react";
import { SharedHeader } from "@/components/shared/shared-header";
import { useDeviceTypes } from "@/hooks/use-device-types";
import { useBrands } from "@/hooks/use-brands";
import { useProductModels } from "@/hooks/use-product-models";
import { cn } from "@/lib/utils";

// Helper function to get device icon based on slug
const getDeviceIcon = (slug: string) => {
  if (slug.includes('smartphone') || slug.includes('phone')) {
    return Smartphone;
  } else if (slug.includes('tablet')) {
    return Tablet;
  } else if (slug.includes('laptop') || slug.includes('computer') || slug.includes('pc')) {
    return Laptop;
  } else if (slug.includes('desktop')) {
    return Monitor;
  } else if (slug.includes('watch')) {
    return Watch;
  } else if (slug.includes('console')) {
    return Gamepad2;
  } else if (slug.includes('other')) {
    return Smartphone; // Using smartphone as default for 'other'
  } else {
    return Smartphone;
  }
};

export default function AddReparationLayout({ children }: { children: ReactNode }) {
  const {
    deviceType,
    brand,
    model,
    issues,
    description,
    accessories,
    password,
    depositReceived,
    scheduledDate,
  } = useReparationStore();

  const [isScrolled, setIsScrolled] = useState(false);

  // Determine current step based on the pathname
  const pathname = usePathname();
  let currentStep = 1; // default to step 1

  if (pathname.includes('/add-reparation/issues')) {
    currentStep = 2;
  } else if (pathname.includes('/add-reparation/client')) {
    currentStep = 3;
  }

  // Fetch data from backend
  const {
    data: deviceTypesData,
    isLoading: isLoadingDeviceTypes,
    error: deviceTypesError,
  } = useDeviceTypes();

  const {
    data: brandsData,
    isLoading: isLoadingBrands,
    error: brandsError,
  } = useBrands();

  const {
    data: modelsData,
    isLoading: isLoadingModels,
    error: modelsError,
  } = useProductModels(brand);

  const brands = brandsData?.results || [];
  const models = modelsData?.results || [];

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get device types
  const deviceTypes = deviceTypesData?.results || [];

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader
        title="Nouvelle Réparation"
        showProgress={true}
        steps={[
          { num: 1, label: "Appareil" },
          { num: 2, label: "Problèmes" },
          { num: 3, label: "Client" },
        ]}
        currentStep={currentStep}
      />

      {/* Main Content */}
      <div
        className={"container mx-auto mt-10 px-4 transition-all duration-300"}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Area - This is where the individual step pages will be rendered */}
          <div className="lg:col-span-2">
            {children}
          </div>

          {/* Summary Sidebar - Shared across all steps */}
          <div className="lg:col-span-1">
            <div
              className={cn(
                "sticky transition-all duration-300",
                isScrolled ? "top-24" : "top-32",
              )}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">Récapitulatif</h3>

                <div className="space-y-6">
                  {/* Device Info */}
                  {deviceType && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        APPAREIL
                      </div>
                      <div className="pl-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Type</span>
                          <div className="flex items-center gap-2">
                            {createElement(getDeviceIcon(deviceType), { className: "h-4 w-4" })}
                            <span className="font-medium">{deviceType}</span>
                          </div>
                        </div>
                        {brand && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Marque
                            </span>
                            <span className="font-medium">
                              {getBrandName(brand)}
                            </span>
                          </div>
                        )}
                        {model && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Modèle
                            </span>
                            <span className="font-medium">
                              {getModelName(model)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Issues */}
                  {issues.length > 0 && (
                    <>
                      <div className="h-px bg-border" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <div className="h-1 w-1 rounded-full bg-primary" />
                          PROBLÈMES ({issues.length})
                        </div>
                        <div className="pl-3 space-y-1">
                          {issues.map((issue) => (
                            <div
                              key={issue}
                              className="text-sm text-foreground"
                            >
                              • {issue}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Additional Info */}
                  {(accessories || password || scheduledDate) && (
                    <>
                      <div className="h-px bg-border" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <div className="h-1 w-1 rounded-full bg-primary" />
                          DÉTAILS
                        </div>
                        <div className="pl-3 space-y-2">
                          {accessories && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Accessoires
                              </span>
                              <span className="font-medium">{accessories}</span>
                            </div>
                          )}
                          {password && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Code
                              </span>
                              <span className="font-medium">••••</span>
                            </div>
                          )}
                          {scheduledDate && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Date prévue
                              </span>
                              <span className="font-medium">
                                {scheduledDate.toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Deposit Status */}
                  {depositReceived && (
                    <>
                      <div className="h-px bg-border" />
                      <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
                        <span className="text-sm font-medium">
                          Acompte reçu
                        </span>
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
