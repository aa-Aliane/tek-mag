import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddReparationStore } from "@/store/addReparationStore";
import {
  Trash2,
  Plus,
  Wallet,
  CreditCard,
  Landmark,
  Banknote,
  Check,
} from "lucide-react";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

export const PaymentMethods: React.FC<Props> = ({ className, ...rest }) => {
  const { formData, setFormData } = useAddReparationStore();
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<string>("cash");
  const [note, setNote] = useState<string>("");

  const totalDiscounts = formData.discounts.reduce(
    (sum, d) => sum + d.amount,
    0,
  );
  const finalPrice = Math.max(0, formData.totalPrice - totalDiscounts);
  const totalPaid = formData.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, finalPrice - totalPaid);

  const paymentMethods = [
    { id: "cash", label: "Espèces", icon: Banknote },
    { id: "card", label: "Carte", icon: CreditCard },
    { id: "check", label: "Chèque", icon: Wallet },
    { id: "transfer", label: "Virement", icon: Landmark },
  ];

  const handleAddPayment = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setFormData({
      payments: [
        ...formData.payments,
        {
          amount: numAmount,
          method: method as any,
          note: note || undefined,
        },
      ],
    });
    setAmount("");
    setNote("");
  };

  const handleRemovePayment = (index: number) => {
    const newPayments = [...formData.payments];
    newPayments.splice(index, 1);
    setFormData({ payments: newPayments });
  };

  const getMethodIcon = (m: string) => {
    switch (m) {
      case "cash":
        return <Banknote className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "check":
        return <Wallet className="h-4 w-4" />;
      case "transfer":
        return <Landmark className="h-4 w-4" />;
      default:
        return <Banknote className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)} {...rest}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="payment-amount">Montant (€)</Label>
          <Input
            id="payment-amount"
            type="number"
            placeholder={`Reste: ${remaining.toFixed(2)}€`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg py-6"
          />
        </div>

        <div className="space-y-3">
          <Label>Méthode de paiement</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {paymentMethods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                  method === m.id
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-border bg-card hover:border-primary/50 text-muted-foreground",
                )}
              >
                <m.icon
                  className={cn(
                    "h-6 w-6",
                    method === m.id ? "text-primary" : "",
                  )}
                />
                <span className="text-sm font-medium">{m.label}</span>
                {method === m.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-note">Note (optionnel)</Label>
        <Input
          id="payment-note"
          placeholder="Ex: Acompte, Paiement partiel..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full gap-2"
        onClick={handleAddPayment}
        disabled={!amount || parseFloat(amount) <= 0}
      >
        <Plus className="h-4 w-4" />
        Ajouter le paiement
      </Button>

      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Paiements enregistrés
        </h4>
        {formData.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucun paiement ajouté</p>
        ) : (
          <div className="space-y-2">
            {formData.payments.map((p, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {getMethodIcon(p.method)}
                  </div>
                  <div>
                    <div className="font-medium">{p.amount.toFixed(2)}€</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {p.method} {p.note && `• ${p.note}`}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePayment(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
