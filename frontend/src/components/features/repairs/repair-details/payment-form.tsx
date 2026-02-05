"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Euro, CreditCard, Banknote } from "lucide-react";
import type { PaymentMethod } from "@/types";
import type { PaymentFormProps } from "./types";

export function PaymentForm({
  repair,
  onClose,
  onAddPayment,
  totalCostValue,
  totalPaid,
  remaining,
}: PaymentFormProps) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentNote, setPaymentNote] = useState("");

  // Reset form when repair changes
  useEffect(() => {
    setPaymentAmount("");
    setPaymentNote("");
    setPaymentMethod("cash");
  }, [repair]);

  const handleSubmit = () => {
    const parsedAmount = parseFloat(paymentAmount || "0");

    if (
      !isNaN(parsedAmount) &&
      parsedAmount > 0 &&
      onAddPayment &&
      parsedAmount <= remaining + 0.01
    ) {
      onAddPayment(
        repair,
        parsedAmount,
        paymentMethod,
        paymentNote || undefined,
      );
      setPaymentAmount("");
      setPaymentNote("");
      onClose();
    }
  };

  const isSubmitDisabled = !(
    paymentAmount &&
    !isNaN(parseFloat(paymentAmount)) &&
    parseFloat(paymentAmount) > 0 &&
    parseFloat(paymentAmount) <= remaining + 0.01
  );

  return (
    <div className="absolute inset-0 bg-white z-10 flex flex-col">
      {/* Header */}
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">Ajouter un paiement</h2>
            </div>
            <p className="text-sm text-muted-foreground">
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
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">Coût total</span>
            <span className="text-2xl font-bold text-blue-600">
              {totalCostValue.toFixed(2)} €
            </span>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Payé: {totalPaid.toFixed(2)} €</span>
              <span>Reste: {remaining.toFixed(2)} €</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{
                  width: `${Math.min(100, (totalPaid / totalCostValue) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Euro className="h-5 w-5 text-blue-600" />
            Détails du paiement
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount" className="text-gray-700">
                Montant à payer (max: {remaining.toFixed(2)} €)
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
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="cash"
                    id="cash"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="cash"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Banknote className="mb-3 h-6 w-6" />
                    Espèces
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
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <CreditCard className="mb-3 h-6 w-6" />
                    Carte
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
                placeholder="Ajouter une note au paiement..."
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
                Enregistrer{" "}
                {paymentAmount ? parseFloat(paymentAmount).toFixed(2) : "0.00"}{" "}
                €
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
