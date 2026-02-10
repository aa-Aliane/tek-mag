"use client";

import { Badge } from "@/components/ui/badge";
import { statusConfig } from "./config";
import type { StatusHistorySectionProps } from "./types";

export function StatusHistorySection({
  repair,
  formatDate,
}: StatusHistorySectionProps) {
  if (!repair.statusHistory || repair.statusHistory.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="font-semibold text-lg mb-3">Historique des changements</h3>
      <div className="space-y-3">
        {repair.statusHistory.map((change) => (
          <div key={change.id} className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {statusConfig[change.from].label}
                </Badge>
                <span className="text-xs text-muted-foreground">→</span>
                <Badge variant="outline" className="text-xs">
                  {statusConfig[change.to].label}
                </Badge>
              </div>
              {formatDate(change.changedAt, "dd/MM/yyyy HH:mm") && (
                <span className="text-xs text-muted-foreground">
                  {formatDate(change.changedAt, "dd/MM/yyyy HH:mm")}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Par {change.changedBy}
              {change.clientNotified && " • Client notifié"}
            </div>
            {change.comment && (
              <p className="text-sm mt-2 pt-2 border-t">{change.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
