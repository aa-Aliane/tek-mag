"use client";

import { Badge } from "@/components/ui/badge";
import { FileText, Package, Lock } from "lucide-react";
import type { AdditionalInfoSectionProps } from "./types";

export function AdditionalInfoSection({ repair }: AdditionalInfoSectionProps) {
  if (
    !repair.accessories?.length &&
    !repair.password &&
    !repair.depositStatus
  ) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Informations complémentaires</h3>
      </div>
      <div className="space-y-3">
        {repair.accessories && (
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Accessoires déposés</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {typeof repair.accessories === "string"
                ? repair.accessories
                    .split(",")
                    .map((acc, idx) => {
                      const item = acc.trim();
                      return item ? (
                        <Badge key={idx} variant="outline">
                          {item}
                        </Badge>
                      ) : null;
                    })
                    .filter(Boolean)
                : Array.isArray(repair.accessories)
                  ? repair.accessories
                      .map((acc, idx) => {
                        const item = typeof acc === "string" ? acc.trim() : acc;
                        return item ? (
                          <Badge key={idx} variant="outline">
                            {item}
                          </Badge>
                        ) : null;
                      })
                      .filter(Boolean)
                  : null}
            </div>
          </div>
        )}

        {repair.password && repair.password.trim() && (
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Mot de passe</span>
            </div>
            <code className="text-sm bg-background px-3 py-1.5 rounded border">
              {repair.password}
            </code>
          </div>
        )}

        {repair.depositStatus && (
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Statut de dépôt</span>
              <Badge
                variant={
                  repair.depositStatus === "deposited" ? "default" : "secondary"
                }
              >
                {repair.depositStatus === "deposited" ? "Déposé" : "Programmé"}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
