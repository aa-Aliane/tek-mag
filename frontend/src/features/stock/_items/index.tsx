"use client";

import React, { useState } from "react";
import { useStockList } from "../_queries/use-store-items";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, ArrowLeft, Router } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import { CatalogueTable } from "../_catalogue/catalogue-table";
import { PartVariant } from "../_types";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const StockItems: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<PartVariant | null>(
    null,
  );

  const { data: stockItems, isLoading } = useStockList({
    page: 1,
    pageSize: 10,
  });

  const items = Array.isArray(stockItems)
    ? stockItems
    : (stockItems?.results ?? []);

  const handleSelectFromCatalogue = (variant: PartVariant) => {
    setSelectedVariant(variant);
  };

  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filtrer mon stock..." className="pl-8" />
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setSelectedVariant(null);
          }}
        >
          <DialogTrigger asChild>
            {/* <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Ajouter du stock
            </Button> */}
          </DialogTrigger>
          <Button size="sm" onClick={() => router.push("/stock/items/new")}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter du stock
          </Button>

          {/* INCREASED WIDTH: max-w-[95vw] for mobile and 7xl for desktop */}
          <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="flex items-center gap-2 text-xl">
                {selectedVariant && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedVariant(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                {selectedVariant
                  ? "Détails de l'ajout"
                  : "Catalogue des Pièces"}
              </DialogTitle>
              {/* Added Description to fix the Console Warning */}
              <DialogDescription>
                {selectedVariant
                  ? "Configurez les détails du stock pour cette pièce."
                  : "Recherchez une référence dans le catalogue global ou vos pièces perso."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              {!selectedVariant ? (
                <div className="h-full p-6">
                  <CatalogueTable onSelect={handleSelectFromCatalogue} />
                </div>
              ) : (
                <div className="p-6 h-full flex flex-col items-center justify-center">
                  <div className="w-full max-w-md space-y-6">
                    <div className="bg-muted/50 p-6 rounded-xl border border-dashed border-primary/20">
                      <h4 className="font-bold text-lg">
                        {selectedVariant.part.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedVariant.name}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="outline">{selectedVariant.sku}</Badge>
                        <Badge>{selectedVariant.quality_tier?.name}</Badge>
                      </div>
                    </div>

                    <div className="space-y-4 bg-card p-6 rounded-lg border shadow-sm">
                      <p className="text-sm text-center text-muted-foreground italic">
                        Formulaire de quantité et prix ici...
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Enregistrer en stock
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Stock Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-muted-foreground animate-pulse">
            Chargement du stock...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold">Pièce</th>
                <th className="p-4 text-right font-semibold">Quantité</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.part?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          SKU: {item.sku || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Badge
                        variant={
                          item.quantity > 0 ? "secondary" : "destructive"
                        }
                      >
                        {item.quantity} unités
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="p-10 text-center text-muted-foreground"
                  >
                    Votre inventaire est vide.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockItems;
