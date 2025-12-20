"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Smartphone, Tablet, Laptop, Monitor, Watch, Gamepad2, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Brand } from "@/types";
import { useDeviceTypes } from "@/hooks/use-device-types";

interface BrandSelectionProps {
  brands: Brand[];
  selectedBrand: string;
  onBrandSelect: (brandId: string) => void;
  deviceTypeId?: number;
}

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

// Define popular brands - in a real app, this could come from an API or config
const popularBrandIds = [1, 2, 3, 4, 5]; // Placeholder IDs - would be actual brand IDs from the system

// Function to get brand logo URL
const getBrandLogo = (brandName: string) => {
  // In a real app, you would have actual brand logos
  // Currently using the PNG files that exist in the project
  const brandLower = brandName.toLowerCase();

  // Return a brand logo based on brand name
  if (brandLower.includes('apple') || brandLower.includes('iphone') || brandLower.includes('ipad')) {
    return '/images/brands/Apple-Logo.png'; // Existing PNG file
  } else if (brandLower.includes('samsung')) {
    return '/images/brands/Samsung-Logo.png'; // Existing PNG file
  } else if (brandLower.includes('huawei')) {
    return '/images/brands/Huawei-Logo.png'; // Existing PNG file
  } else if (brandLower.includes('xiaomi')) {
    return '/images/brands/Xiaomi-logo.png'; // Existing PNG file
  } else if (brandLower.includes('honor')) {
    return '/images/brands/Honor-Logo.png'; // Existing PNG file
  } else if (brandLower.includes('google') || brandLower.includes('pixel')) {
    // Google logo not available as PNG, use SVG as fallback
    return '/brands/google.svg'; // Existing SVG file
  } else {
    // Return a generic brand icon
    return '/brands/brand-generic.svg'; // Existing SVG file as fallback
  }
};

// Component to display brand logo with fallback
const BrandLogo = ({ brandName }: { brandName: string }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    // Fallback to device icon if image fails to load
    return getDeviceIcon(brandName.toLowerCase());
  }

  return (
    <img
      src={getBrandLogo(brandName)}
      alt={brandName}
      className="w-8 h-8 object-contain"
      onError={() => setImgError(true)}
    />
  );
};

export const BrandSelection = ({ 
  brands, 
  selectedBrand, 
  onBrandSelect,
  deviceTypeId
}: BrandSelectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);
  
  // Get device type name for display
  const { data: deviceTypesData } = useDeviceTypes();
  const deviceTypes = deviceTypesData?.results || [];
  const currentDeviceType = deviceTypes.find(dt => dt.id === deviceTypeId);

  // Filter brands based on search query
  const filteredBrands = useMemo(() => {
    return brands.filter(brand => 
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [brands, searchQuery]);

  // Separate popular brands from others
  const { popularBrands, otherBrands } = useMemo(() => {
    const popular: Brand[] = [];
    const other: Brand[] = [];

    filteredBrands.forEach(brand => {
      if (popularBrandIds.includes(Number(brand.id))) {
        popular.push(brand);
      } else {
        other.push(brand);
      }
    });

    return { popularBrands: popular, otherBrands: other };
  }, [filteredBrands]);

  return (
    <div className="space-y-6">
      {/* Popular Brands Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Marques Populaires</h3>
          <Badge variant="secondary" className="text-xs">
            {currentDeviceType ? currentDeviceType.name : "Tous"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {popularBrands.length > 0 ? (
            popularBrands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => onBrandSelect(brand.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all hover:border-primary/50 relative",
                  selectedBrand === brand.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-accent"
                )}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                  <BrandLogo brandName={brand.name} />
                </div>
                <span className="text-sm font-medium text-center">{brand.name}</span>
                {selectedBrand === brand.id && (
                  <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground col-span-full">
              Aucune marque populaire trouvée
            </p>
          )}
        </div>
      </div>

      {/* All Brands Section with Search */}
      <div className="space-y-3 pt-4">
        <p className="text-sm text-muted-foreground">
          {searchQuery ? "Résultats de recherche" : "Autres marques"}
        </p>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une marque..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="max-h-60 overflow-y-auto rounded-md border">
          {(searchQuery ? filteredBrands : otherBrands).length > 0 ? (
            <div className="divide-y">
              {(searchQuery ? filteredBrands : otherBrands).map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => onBrandSelect(brand.id)}
                  className={cn(
                    "w-full px-4 py-2 text-left hover:bg-accent flex items-center justify-between",
                    selectedBrand === brand.id && "bg-primary/10"
                  )}
                >
                  <span>{brand.name}</span>
                  {selectedBrand === brand.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? "Aucune marque trouvée" : "Aucune autre marque trouvée"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};