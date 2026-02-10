"use client";

import { Separator } from "@/components/ui/separator";
import { Smartphone } from "lucide-react";
import type { DeviceInfoSectionProps } from "./types";

export function DeviceInfoSection({ repair }: DeviceInfoSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Smartphone className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Appareil</h3>
      </div>
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Type</span>
          <span className="font-medium capitalize">
            {repair.deviceType || "Non spécifié"}
          </span>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Marque</span>
          <span className="font-medium">{repair.brand || "Non spécifié"}</span>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Modèle</span>
          <span className="font-medium">{repair.model || "Non spécifié"}</span>
        </div>
      </div>
    </div>
  );
}
