import React, { createElement } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Smartphone, Tablet, Laptop, Monitor, Watch, Gamepad2 } from "lucide-react";
import { useAddReparationStore } from "@/store/addReparationStore";
import { useSummaryLayout } from "./use-summary-layout";

// Helper function to get device icon based on slug
const getDeviceIcon = (slug: string) => {
  if (!slug) return Smartphone;
  const s = slug.toLowerCase();
  if (s.includes("smartphone") || s.includes("phone")) return Smartphone;
  if (s.includes("tablet")) return Tablet;
  if (s.includes("laptop") || s.includes("computer") || s.includes("pc")) return Laptop;
  if (s.includes("desktop")) return Monitor;
  if (s.includes("watch")) return Watch;
  if (s.includes("console")) return Gamepad2;
  return Smartphone;
};

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  isScrolled?: boolean;
}

export const SummarySidebar: React.FC<Props> = ({ className, isScrolled, ...rest }) => {
  const {
    deviceType,
    brand,
    model,
    selectedIssues,
    accessories,
    password,
    scheduledDate,
    getBrandName,
    getModelName,
  } = useSummaryLayout();

  const { formData } = useAddReparationStore();

  // Financial Calculations
  const basePrice = formData.totalPrice || 0;
  const totalDiscounts = formData.discounts.reduce((sum, d) => sum + d.amount, 0);
  const finalPrice = Math.max(0, basePrice - totalDiscounts);
  const totalPaid = formData.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, finalPrice - totalPaid);

  return (
    <div
      className={cn(
        "sticky transition-all duration-300",
        isScrolled ? "top-24" : "top-32",
        className
      )}
      {...rest}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Récapitulatif</h3>

        <div className="space-y-6">
          {/* Device Info */}
          {deviceType && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="h-1 w-1 rounded-full bg-primary" />
                APPAREIL
              </div>
              <div className="pl-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <div className="flex items-center gap-2">
                    {createElement(getDeviceIcon(deviceType), {
                      className: "h-4 w-4",
                    })}
                    <span className="font-medium capitalize">{deviceType}</span>
                  </div>
                </div>
                {brand && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Marque</span>
                    <span className="font-medium">{getBrandName(brand)}</span>
                  </div>
                )}
                {model && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Modèle</span>
                    <span className="font-medium">{getModelName(model)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Issues */}
          {selectedIssues.length > 0 && (
            <>
              <div className="h-px bg-border" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  PROBLÈMES ({selectedIssues.length})
                </div>
                <div className="pl-3 space-y-2">
                  {selectedIssues.map((selectedIssue) => (
                    <div key={selectedIssue.issueId} className="text-sm">
                      <div className="font-medium">• {selectedIssue.issueName}</div>
                      {selectedIssue.categoryType === "part_based" && selectedIssue.selectedTierId && (
                        <div className="text-xs text-muted-foreground ml-2">
                          Qualité: {selectedIssue.selectedTierId}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Financial Breakdown */}
          <>
            <div className="h-px bg-border" />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="h-1 w-1 rounded-full bg-primary" />
                FINANCE
              </div>
              <div className="pl-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prix de base</span>
                  <span className="font-medium">{basePrice.toFixed(2)}€</span>
                </div>
                {totalDiscounts > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Remises</span>
                    <span className="font-medium">-{totalDiscounts.toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t pt-2">
                  <span>Total final</span>
                  <span>{finalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Payé</span>
                  <span className="font-medium">{totalPaid.toFixed(2)}€</span>
                </div>
                <div className={cn(
                  "flex justify-between text-sm font-bold pt-1",
                  remaining > 0 ? "text-destructive" : "text-green-600"
                )}>
                  <span>Reste à payer</span>
                  <span>{remaining.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          </>

          {/* Additional Info */}
          {(accessories || password || scheduledDate) && (
            <>
              <div className="h-px bg-border" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  DÉTAILS
                </div>
                <div className="pl-3 space-y-2">
                  {accessories && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Accessoires</span>
                      <span className="font-medium truncate max-w-[120px]">{accessories}</span>
                    </div>
                  )}
                  {password && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Code</span>
                      <span className="font-medium">••••</span>
                    </div>
                  )}
                  {scheduledDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date prévue</span>
                      <span className="font-medium">
                        {scheduledDate.toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
