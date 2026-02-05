"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Percent, Euro, Banknote, CreditCard } from "lucide-react";
import type { PaymentMethod } from "@/types";

interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
  remise_type?: "percentage" | "fixed" | "none";
  remise_value?: number;
  is_rounding?: boolean;
  original_amount?: number;
  effective_amount?: number;
  created_at: string;
  created_by?: string;
}

interface PaymentManagementProps {
  totalAmount: number;
  payments: Payment[];
  remainingBalance: number;
  onAddPayment: (payment: Omit<Payment, 'id' | 'created_at' | 'created_by'>) => void;
  onDeletePayment?: (paymentId: string) => void;
  className?: string;
}

export function PaymentManagement({
  totalAmount,
  payments,
  remainingBalance,
  onAddPayment,
  onDeletePayment,
  className,
}: PaymentManagementProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState("");
  const [remiseType, setRemiseType] = useState<"percentage" | "fixed" | "none">("none");
  const [remiseValue, setRemiseValue] = useState("");
  const [isRounding, setIsRounding] = useState(false);

  const calculateEffectiveAmount = () => {
    const baseAmount = parseFloat(amount) || 0;
    let effectiveAmount = baseAmount;

    if (remiseType === "percentage" && remiseValue) {
      const discount = baseAmount * (parseFloat(remiseValue) / 100);
      effectiveAmount = baseAmount - discount;
    } else if (remiseType === "fixed" && remiseValue) {
      effectiveAmount = Math.max(0, baseAmount - parseFloat(remiseValue));
    }

    // Apply rounding logic
    if (isRounding && method === "cash") {
      // Round to nearest 0.50 for cash
      effectiveAmount = Math.round(effectiveAmount * 2) / 2;
    } else {
      // Round to 2 decimal places for other methods
      effectiveAmount = Math.round(effectiveAmount * 100) / 100;
    }

    return effectiveAmount;
  };

  const effectiveAmount = calculateEffectiveAmount();
  const newRemaining = Math.max(0, remainingBalance - effectiveAmount);

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    onAddPayment({
      amount: effectiveAmount,
      method,
      note,
      remise_type: remiseType === "none" ? undefined : remiseType,
      remise_value: remiseType === "none" ? undefined : parseFloat(remiseValue) || 0,
      is_rounding: isRounding,
      original_amount: remiseType !== "none" ? parseFloat(amount) : undefined,
    });

    // Reset form
    setAmount("");
    setNote("");
    setRemiseType("none");
    setRemiseValue("");
    setIsRounding(false);
  };

  const formatPaymentMethod = (method: PaymentMethod) => {
    const methods = {
      cash: "Espèces",
      card: "Carte bancaire",
      check: "Chèque",
      transfer: "Virement",
    };
    return methods[method] || method;
  };

  const totalPaid = payments.reduce((sum, payment) => sum + (payment.effective_amount || payment.amount), 0);
  const totalRemise = payments.reduce((sum, payment) => {
    if (payment.original_amount && payment.effective_amount) {
      return sum + (payment.original_amount - payment.effective_amount);
    }
    return sum;
  }, 0);

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Récapitulatif Paiement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total à payer:</span>
                <span className="font-semibold">{totalAmount.toFixed(2)}€</span>
              </div>
              {totalRemise > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Remise totale:</span>
                  <span className="font-semibold text-green-600">-{totalRemise.toFixed(2)}€</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total payé:</span>
                <span className="font-semibold text-green-600">{totalPaid.toFixed(2)}€</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reste dû:</span>
                <span className={`font-bold ${remainingBalance <= 0 ? "text-green-600" : "text-red-600"}`}>
                  {remainingBalance.toFixed(2)}€
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    remainingBalance <= 0 ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(100, (totalPaid / totalAmount) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Nouveau Paiement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount Section */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant à payer</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            {amount && parseFloat(amount) > 0 && (
              <div className="text-sm text-muted-foreground">
                Montant effectif: <span className="font-semibold">{effectiveAmount.toFixed(2)}€</span>
              </div>
            )}
          </div>

          {/* Remise Section */}
          <div className="space-y-3">
            <Label>Type de remise</Label>
            <RadioGroup value={remiseType} onValueChange={(value) => setRemiseType(value as any)}>
              <div className="flex items-center space-x-4">
                <RadioGroupItem value="none">
                  <span>Aucune</span>
                </RadioGroupItem>
                <RadioGroupItem value="percentage">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    <span>Pourcentage</span>
                  </div>
                </RadioGroupItem>
                <RadioGroupItem value="fixed">
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4" />
                    <span>Montant fixe</span>
                  </div>
                </RadioGroupItem>
              </div>
            </RadioGroup>

            {remiseType !== "none" && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="remiseValue">
                  {remiseType === "percentage" ? "Pourcentage (%):" : "Montant (€):"}
                </Label>
                <Input
                  id="remiseValue"
                  type="number"
                  step={remiseType === "percentage" ? "0.1" : "0.01"}
                  value={remiseValue}
                  onChange={(e) => setRemiseValue(e.target.value)}
                  placeholder={remiseType === "percentage" ? "10" : "10.00"}
                  className="w-32"
                />
                {remiseType === "percentage" && remiseValue && (
                  <span className="text-sm text-green-600">
                    = -{((parseFloat(amount) || 0) * parseFloat(remiseValue) / 100).toFixed(2)}€
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Rounding Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rounding"
              checked={isRounding}
              onChange={(e) => setIsRounding(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="rounding" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              <span>Arrondir pour les espèces (0.50€)</span>
            </Label>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="method">Méthode de paiement</Label>
            <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    <span>Espèces</span>
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Carte bancaire</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ajouter une note..."
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || effectiveAmount <= 0}
            className="w-full"
          >
            Enregistrer le paiement
            {effectiveAmount > 0 && (
              <span className="ml-2">
                ({effectiveAmount.toFixed(2)}€ - {newRemaining.toFixed(2)}€ restant)
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {formatPaymentMethod(payment.method)}
                      </Badge>
                      <span className="font-medium">{(payment.effective_amount || payment.amount).toFixed(2)}€</span>
                    </div>
                    {payment.note && (
                      <p className="text-sm text-muted-foreground">{payment.note}</p>
                    )}
                    {payment.remise_type !== "none" && payment.remise_value && (
                      <div className="text-xs text-green-600">
                        Remise {payment.remise_type === "percentage" ? `${payment.remise_value}%` : `${payment.remise_value}€`}
                        {payment.original_amount && (
                          <span>
                            {" "}(de {payment.original_amount.toFixed(2)}€ à {(payment.effective_amount || payment.amount).toFixed(2)}€)
                          </span>
                        )}
                      </div>
                    )}
                    {payment.is_rounding && (
                      <Badge variant="secondary" className="text-xs">
                        Arrondi
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(payment.created_at).toLocaleDateString("fr-FR")}
                  </div>
                  {onDeletePayment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeletePayment(payment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}