import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddReparationStore } from "@/store/addReparationStore";
import { Trash2, Plus, Tag } from "lucide-react";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

export const DiscountSection: React.FC<Props> = ({ className, ...rest }) => {
  const { formData, setFormData } = useAddReparationStore();
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const handleAddDiscount = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !reason) return;

    setFormData({
      discounts: [
        ...formData.discounts,
        {
          amount: numAmount,
          reason: reason,
        },
      ],
    });
    setAmount("");
    setReason("");
  };

  const handleRemoveDiscount = (index: number) => {
    const newDiscounts = [...formData.discounts];
    newDiscounts.splice(index, 1);
    setFormData({ discounts: newDiscounts });
  };

  return (
    <div className={cn("space-y-6", className)} {...rest}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discount-amount">Montant de la remise (€)</Label>
          <Input
            id="discount-amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount-reason">Raison</Label>
          <Input
            id="discount-reason"
            placeholder="Ex: Geste commercial, Fidélité..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full gap-2"
        onClick={handleAddDiscount}
        disabled={!amount || parseFloat(amount) <= 0 || !reason}
      >
        <Plus className="h-4 w-4" />
        Ajouter la remise
      </Button>

      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Remises appliquées
        </h4>
        {formData.discounts.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucune remise appliquée</p>
        ) : (
          <div className="space-y-2">
            {formData.discounts.map((d, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">-{d.amount.toFixed(2)}€</div>
                    <div className="text-xs text-muted-foreground">
                      {d.reason}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDiscount(index)}
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
