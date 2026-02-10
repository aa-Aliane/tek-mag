"use client";

import { Separator } from "@/components/ui/separator";
import { Clock } from "lucide-react";
import type { DatesInfoSectionProps } from "./types";

export function DatesInfoSection({
  repair,
  formatDate,
}: DatesInfoSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Calendrier</h3>
      </div>
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        {formatDate(repair.created_at, "dd MMMM yyyy") && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Créée le</span>
              <span className="font-medium text-sm">
                {formatDate(repair.created_at, "dd MMMM yyyy")}
              </span>
            </div>
            <Separator />
          </>
        )}
        {repair.scheduledDate &&
          formatDate(repair.scheduledDate, "dd MMMM yyyy") && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Programmée le
                </span>
                <span className="font-medium text-sm">
                  {formatDate(repair.scheduledDate, "dd MMMM yyyy")}
                </span>
              </div>
              <Separator />
            </>
          )}
        {repair.estimatedCompletion &&
          formatDate(repair.estimatedCompletion, "dd MMMM yyyy") && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Fin estimée
                </span>
                <span className="font-medium text-sm">
                  {formatDate(repair.estimatedCompletion, "dd MMMM yyyy")}
                </span>
              </div>
              <Separator />
            </>
          )}
        {repair.completedAt &&
          formatDate(repair.completedAt, "dd MMMM yyyy") && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Terminée le</span>
              <span className="font-medium text-sm">
                {formatDate(repair.completedAt, "dd MMMM yyyy")}
              </span>
            </div>
          )}
      </div>
    </div>
  );
}
