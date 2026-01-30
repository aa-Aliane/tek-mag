"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Smartphone, Tablet, Laptop, Monitor, Watch, Gamepad2, ChevronsUpDown, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductModel } from "@/types";

interface ModelSelectionProps {
  models: ProductModel[];
  selectedBrand: string;
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

// Component to display device icon
const DeviceIcon = ({ modelName }: { modelName: string }) => {
  const modelLower = modelName.toLowerCase();

  if (modelLower.includes('smartphone') || modelLower.includes('phone') || modelLower.includes('iphone')) {
    return <Smartphone className="h-8 w-8" />;
  } else if (modelLower.includes('tablet')) {
    return <Tablet className="h-8 w-8" />;
  } else if (modelLower.includes('laptop') || modelLower.includes('computer') || modelLower.includes('pc') || modelLower.includes('macbook')) {
    return <Laptop className="h-8 w-8" />;
  } else if (modelLower.includes('desktop')) {
    return <Monitor className="h-8 w-8" />;
  } else if (modelLower.includes('watch') || modelLower.includes('apple watch')) {
    return <Watch className="h-8 w-8" />;
  } else if (modelLower.includes('console')) {
    return <Gamepad2 className="h-8 w-8" />;
  } else {
    return <Smartphone className="h-8 w-8" />;
  }
};

export const ModelSelection = ({
  models,
  selectedBrand,
  selectedModel,
  onModelSelect,
}: ModelSelectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSelectionView, setShowSelectionView] = useState(true); // Controls view mode

  // Get selected model object to display details
  const selectedModelObject = models.find(model => model.id === selectedModel);

  // Filter models based on search query
  const filteredModels = useMemo(() => {
    return models.filter(model =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [models, searchQuery]);

  // Separate popular models from others based on the is_popular field
  const { popularModels, otherModels } = useMemo(() => {
    const popular: ProductModel[] = [];
    const other: ProductModel[] = [];

    filteredModels.forEach(model => {
      // Use the is_popular field from the backend
      // Use name patterns as fallback for backward compatibility
      const isPopular = model.is_popular !== undefined ?
                        model.is_popular :
                        model.name.toLowerCase().includes('iphone') ||
                        model.name.toLowerCase().includes('galaxy') ||
                        model.name.toLowerCase().includes('pixel') ||
                        model.name.toLowerCase().includes('macbook') ||
                        model.name.toLowerCase().includes('ipad');

      if (isPopular) {
        popular.push(model);
      } else {
        other.push(model);
      }
    });

    return { popularModels: popular, otherModels: other };
  }, [filteredModels]);

  // If a model is selected and we're in selection view, show the single model box
  if (selectedModel && !showSelectionView && selectedModelObject) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Modèle Sélectionné</h3>
          <Badge variant="secondary" className="text-xs">
            Marque: {selectedBrand}
          </Badge>
        </div>

        <Card className="p-4 flex items-center space-x-4 border-2 border-primary/30 bg-primary/5 transition-all hover:shadow-md">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white border border-border shadow-sm p-1">
              <DeviceIcon modelName={selectedModelObject.name} />
            </div>
            <div>
              <h4 className="font-semibold">{selectedModelObject.name}</h4>
              <p className="text-xs text-muted-foreground">Sélectionné</p>
            </div>
          </div>

          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSelectionView(true)}
              className="flex items-center space-x-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Changer</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Popular Models Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Modèles Populaires</h3>
          <Badge variant="secondary" className="text-xs">
            Marque: {selectedBrand}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {popularModels.length > 0 ? (
            popularModels.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelSelect(model.id);
                  setShowSelectionView(false); // Switch to single model view after selection
                }}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all hover:border-primary/50 relative",
                  selectedModel === model.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-accent"
                )}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                  <DeviceIcon modelName={model.name} />
                </div>
                <span className="text-sm font-medium text-center">{model.name}</span>
                {selectedModel === model.id && (
                  <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground col-span-full">
              Aucun modèle populaire trouvé
            </p>
          )}
        </div>
      </div>

      {/* All Models Section with Search */}
      <div className="space-y-3 pt-4">
        <p className="text-sm text-muted-foreground">
          {searchQuery ? "Résultats de recherche" : "Autres modèles"}
        </p>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un modèle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="max-h-60 overflow-y-auto rounded-md border">
          {(searchQuery ? filteredModels : otherModels).length > 0 ? (
            <div className="divide-y">
              {(searchQuery ? filteredModels : otherModels).map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelSelect(model.id);
                    setShowSelectionView(false); // Switch to single model view after selection
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left hover:bg-accent flex items-center justify-between",
                    selectedModel === model.id && "bg-primary/10"
                  )}
                >
                  <span>{model.name}</span>
                  {selectedModel === model.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? "Aucun modèle trouvé" : "Aucun autre modèle trouvé"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};