"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface BrandSelectionProps {
  deviceType: string;
  onSelect: (brand: string) => void;
  onBack: () => void;
}

export function BrandSelection({
  deviceType,
  onSelect,
  onBack,
}: BrandSelectionProps) {
  const brands = [
    { id: "apple", name: "Apple", logo: "/apple-logo.png" },
    { id: "samsung", name: "Samsung", logo: "/samsung-logo.png" },
    { id: "huawei", name: "Huawei", logo: "/huawei-logo.png" },
    { id: "xiaomi", name: "Xiaomi", logo: "/xiaomi-logo.png" },
    { id: "oppo", name: "Oppo", logo: "/oppo-logo.jpg" },
    { id: "oneplus", name: "OnePlus", logo: "/oneplus-logo.jpg" },
    { id: "google", name: "Google", logo: "/google-logo.png" },
    { id: "sony", name: "Sony", logo: "/sony-logo.png" },
  ];

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      <h2 className="text-xl font-semibold text-center mb-6">
        Sélectionnez la marque de votre appareil
      </h2>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {brands.map((brand) => (
          <Card
            key={brand.id}
            className="cursor-pointer border-2 p-6 transition-all hover:border-accent hover:shadow-lg"
            onClick={() => onSelect(brand.id)}
          >
            <div className="flex flex-col items-center">
              <img
                src={brand.logo || "/placeholder.svg"}
                alt={brand.name}
                className="mb-3 h-16 w-16 object-contain"
              />
              <h3 className="text-sm font-medium">{brand.name}</h3>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
