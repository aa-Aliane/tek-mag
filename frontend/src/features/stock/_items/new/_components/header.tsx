"use client";

import React from "react";
import {
  FileDown,
  ScanBarcode,
  Plus,
  Wrench,
  ShoppingBag,
  Headphones,
  Monitor,
  Info,
  ShoppingBasket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCategoriesStore,
  type entityCategory,
} from "@/features/stock/_store/categories";
import { useCatalogueStore } from "@/features/stock/_store/catalogue";

interface HeaderProps {
  onCategoryChange: (category: entityCategory) => void;
  onCreateNew: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCategoryChange, onCreateNew }) => {
  const category = useCategoriesStore((state) => state.category);
  const selectedItems = useCatalogueStore((state) => state.selectedItems);
  return (
    <div className="flex flex-col gap-6 pb-6 border-b">
      {/* Row 1: Titre et Actions Principales */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Ajouter au stock
          </h2>
          <p className="text-sm text-muted-foreground">
            Trouvez un article dans le catalogue ou créez une fiche
            personnalisée.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* <Button variant="outline" size="sm" className="gap-2 h-9">
            <FileDown className="size-4" /> Importer CSV
          </Button> */}
          {/* <Button variant="outline" size="sm" className="gap-2 h-9">
            <ScanBarcode className="size-4" /> Scanner
          </Button> */}
          {selectedItems.length > 0 && (
            <Button variant="destructive">
              Panier ({selectedItems.length})
              <ShoppingBasket />
            </Button>
          )}
          <Button
            onClick={onCreateNew}
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/80 h-9 transition-colors shadow-sm"
          >
            <Plus className="size-4" /> Créer nouveau
          </Button>
        </div>
      </div>

      {/* Row 2: Tabs de Workflow (Inspiration Utopya) */}
      <div className="flex items-center justify-between bg-muted/40 p-1.5 rounded-lg border border-border/50">
        <div className="flex items-center gap-4">
          <Tabs
            value={category}
            onValueChange={(v) => onCategoryChange(v as entityCategory)}
          >
            <TabsList className="h-8 bg-background/50 border shadow-sm">
              <TabsTrigger value="devices" className="gap-2 px-4 text-xs">
                <ShoppingBag className="size-3.5" /> Appareils
              </TabsTrigger>
              <TabsTrigger value="accessories" className="gap-2 px-4 text-xs">
                <Headphones className="size-3.5" /> Accessoires
              </TabsTrigger>
              <TabsTrigger value="repairs" className="gap-2 px-4 text-xs">
                <Wrench className="size-3.5" /> Réparation
              </TabsTrigger>
              <TabsTrigger value="computers" className="gap-2 px-4 text-xs">
                <Monitor className="size-3.5" /> Informatique
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Message d'aide contextuel intelligent */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
          <Info className="size-3.5 text-primary" />
          <span className="italic">
            {category === "devices" &&
              "Flux optimisé pour Smartphones et Tablettes (IMEI)."}
            {category === "accessories" &&
              "Recherche par compatibilité (Coques, Protections)."}
            {category === "repairs" &&
              "Pièces techniques filtrées par Qualité et Type (Écrans, Batteries)."}
            {category === "computers" &&
              "Composants informatiques (SSD, RAM) et périphériques."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
