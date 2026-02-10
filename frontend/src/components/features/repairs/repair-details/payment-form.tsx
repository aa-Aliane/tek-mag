"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  X,
  Euro,
  CreditCard,
  Banknote,
  FileText,
  Building,
} from "lucide-react";
import type { PaymentMethod } from "@/types";
import type { PaymentFormProps } from "./types";

export function PaymentForm({
  repair,
  onClose,
  onAddPayment,

  totalPaid,
  remaining,
}: PaymentFormProps) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentNote, setPaymentNote] = useState("");
  const [isRounding, setIsRounding] = useState(false);

  // Reset form when repair changes
  useEffect(() => {
    setPaymentAmount("");
    setPaymentNote("");
    setPaymentMethod("cash");
    setIsRounding(false);
  }, [repair]);

  // Calculate final amount after rounding
  const calculateFinalAmount = () => {
    const amount = parseFloat(paymentAmount || "0");
    let finalAmount = amount;

    // Apply rounding if enabled and method is cash
    if (isRounding && paymentMethod === "cash") {
      // Round to nearest 0.50
      finalAmount = Math.round(finalAmount * 2) / 2;
    } else {
      // Round to 2 decimal places for other methods
      finalAmount = Math.round(finalAmount * 100) / 100;
    }

    return finalAmount;
  };

  const handleSubmit = () => {
    const finalAmount = calculateFinalAmount();

    if (
      !isNaN(finalAmount) &&
      finalAmount > 0 &&
      onAddPayment &&
      finalAmount <= remaining + 0.01
    ) {
      // Build note with rounding information
      let enhancedNote = paymentNote || "";

      if (isRounding && paymentMethod === "cash") {
        const roundingText = `Arrondi espèces: ${Number(finalAmount).toFixed(2)}€`;
        enhancedNote = enhancedNote
          ? `${enhancedNote} | ${roundingText}`
          : roundingText;
      }

      onAddPayment(
        repair,
        finalAmount,
        paymentMethod,
        enhancedNote || undefined,
      );
      setPaymentAmount("");
      setPaymentNote("");
      setIsRounding(false);
      onClose();
    }
  };

  const finalAmount = calculateFinalAmount();

  const isSubmitDisabled = !(
    paymentAmount &&
    !isNaN(parseFloat(paymentAmount)) &&
    finalAmount > 0 &&
    finalAmount <= remaining + 0.01
  );
  let x =
    !isNaN(parseFloat(paymentAmount)) &&
    finalAmount > 0 &&
    finalAmount <= remaining + 0.01;
  console.log("hohoho ohoh", x);

  console.log("hiihihhih paymantAmount:", paymentAmount);
  console.log("hiihihhih finalAmount:", finalAmount);
  console.log("hiihihhih finale price:", repair.final_price);

  return (
    <div className="absolute inset-0 bg-white z-10 flex flex-col">
      {/* Header */}
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">Ajouter un paiement</h2>
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
        {/* Payment Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-l p-5 border border-blue-100 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">Coût total</span>
            <span className="text-2xl font-bold text-blue-600">
              {Number(repair.final_price || repair.base_price || 0).toFixed(2)}{" "}
              €
            </span>
          </div>

          {/* Show discounts if any */}
          {repair.total_discounts > 0 && (
            <div className="flex justify-between text-sm text-orange-600 mb-2">
              <span>Remises appliquées</span>
              <span>-{Number(repair.total_discounts || 0).toFixed(2)} €</span>
            </div>
          )}

          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Payé: {Number(totalPaid).toFixed(2)} €</span>
              <span>Reste: {Number(remaining).toFixed(2)} €</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{
                  width: `${Math.min(100, (totalPaid / Number(repair.final_price || repair.base_price || 1)) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Rounding Adjustment Section */}
        <div className="bg-amber-50/50 rounded-l p-5 border border-amber-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Ajustements
          </h3>

          <div className="flex items-center space-x-3">
            <Switch
              id="rounding"
              checked={isRounding}
              onCheckedChange={setIsRounding}
              disabled={paymentMethod !== "cash"}
            />
            <Label htmlFor="rounding" className="text-sm">
              Appliquer un arrondi automatique (Mode: Espèces)
            </Label>
          </div>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white rounded-l p-5 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Détails du règlement
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount" className="text-gray-700">
                Montant à encaisser
              </Label>
              <div className="relative">
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remaining}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10 pr-4 py-3 text-lg"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Euro className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-700">Mode de paiement</Label>

              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: PaymentMethod) =>
                  setPaymentMethod(value)
                }
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <RadioGroupItem
                    value="cash"
                    id="cash"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="cash"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Banknote className="mb-2 h-5 w-5" />
                    <span className="text-sm">Espèces</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="card"
                    id="card"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="card"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <CreditCard className="mb-2 h-5 w-5" />
                    <span className="text-sm">Carte</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="check"
                    id="check"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="check"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <FileText className="mb-2 h-5 w-5" />
                    <span className="text-sm">Chèque</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="transfer"
                    id="transfer"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="transfer"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Building className="mb-2 h-5 w-5" />
                    <span className="text-sm">Virement</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentNote">Note (optionnel)</Label>
              <Textarea
                id="paymentNote"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Client fidèle, remise de 10% appliquée..."
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
                Confirmer le Paiement ({repair.remaining_balance} €)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
