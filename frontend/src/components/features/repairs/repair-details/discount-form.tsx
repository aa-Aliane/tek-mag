"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Euro, Percent } from "lucide-react";
import type { DiscountFormProps } from "./types";

type DiscountType = "none" | "percentage" | "fixed";

export function DiscountForm({
  repair,
  onClose,
  onAddDiscount,
}: DiscountFormProps) {
  const [discountType, setDiscountType] = useState<DiscountType>("none");
  const [discountValue, setDiscountValue] = useState("");
  const [discountNote, setDiscountNote] = useState("");

  // Reset form when repair changes
  useEffect(() => {
    setDiscountType("none");
    setDiscountValue("");
    setDiscountNote("");
  }, [repair]);

  // Calculate discount amount
  const calculateDiscount = () => {
    const basePrice = Number(repair.final_price || repair.base_price || 0);
    const discount = parseFloat(discountValue || "0");

    if (isNaN(basePrice) || discountType === "none" || isNaN(discount)) {
      return 0;
    }

    if (discountType === "percentage") {
      return basePrice * (discount / 100);
    } else if (discountType === "fixed") {
      return Math.min(discount, basePrice); // Don't discount more than the base price
    }

    return 0;
  };

  const handleSubmit = () => {
    const discountAmount = calculateDiscount();

    if (
      discountType !== "none" &&
      !isNaN(discountAmount) &&
      discountAmount > 0 &&
      onAddDiscount
    ) {
      // Build note with discount information
      let enhancedNote = discountNote || "";

      const discountText =
        discountType === "percentage"
          ? `Remise: ${discountValue}% (-${Number(discountAmount).toFixed(2)}€)`
          : `Remise: -${Number(discountAmount).toFixed(2)}€`;
      
      enhancedNote = enhancedNote
        ? `${enhancedNote} | ${discountText}`
        : discountText;

      onAddDiscount(
        repair,
        discountAmount,
        discountType,
        discountValue,
        enhancedNote || undefined,
      );
      setDiscountType("none");
      setDiscountValue("");
      setDiscountNote("");
      onClose();
    }
  };

  const discountAmount = calculateDiscount();
  const basePrice = Number(repair.final_price || repair.base_price || 0);
  const finalPrice = basePrice - discountAmount;

  const isSubmitDisabled = !(
    discountType !== "none" &&
    discountValue &&
    !isNaN(parseFloat(discountValue)) &&
    parseFloat(discountValue) > 0 &&
    discountAmount > 0
  );

  return (
    <div className="absolute inset-0 bg-white z-10 flex flex-col">
      {/* Header */}
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">Ajouter une remise</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Réparation #{repair.id} - {repair.brand} {repair.model}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Price Summary */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-l p-5 border border-amber-100 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">Coût total</span>
            <span className="text-2xl font-bold text-amber-600">
              {basePrice.toFixed(2)} €
            </span>
          </div>

          {discountAmount > 0 && (
            <>
              <div className="flex justify-between text-sm text-red-600 mb-2">
                <span>Remise</span>
                <span>-{discountAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Nouveau prix</span>
                <span className="text-xl font-bold text-green-600">
                  {finalPrice.toFixed(2)} €
                </span>
              </div>
            </>
          )}

          {/* Show existing discounts if any */}
          {repair.total_discounts > 0 && (
            <div className="mt-3 pt-3 border-t border-amber-200">
              <div className="flex justify-between text-xs text-orange-600">
                <span>Remises déjà appliquées</span>
                <span>-{Number(repair.total_discounts || 0).toFixed(2)} €</span>
              </div>
            </div>
          )}
        </div>

        {/* Discount Details Card */}
        <div className="bg-white rounded-l p-5 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Détails de la remise
          </h3>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-gray-700">Type de remise</Label>
              <Tabs
                value={discountType}
                onValueChange={(value) =>
                  setDiscountType(value as DiscountType)
                }
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="none">Aucune</TabsTrigger>
                  <TabsTrigger value="percentage">%</TabsTrigger>
                  <TabsTrigger value="fixed">€</TabsTrigger>
                </TabsList>
                <TabsContent value="percentage" className="mt-3">
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder="0.00"
                      className="pr-8"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <Percent className="h-4 w-4" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="fixed" className="mt-3">
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={basePrice}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder="0.00"
                      className="pr-8"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <Euro className="h-4 w-4" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="none" className="mt-3">
                  <p className="text-sm text-gray-500">
                    Aucune remise appliquée
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountNote">Note (optionnel)</Label>
              <Textarea
                id="discountNote"
                value={discountNote}
                onChange={(e) => setDiscountNote(e.target.value)}
                placeholder="Client fidèle, remise commerciale..."
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                Appliquer la remise
                {discountAmount > 0 && ` (${discountAmount.toFixed(2)} €)`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}