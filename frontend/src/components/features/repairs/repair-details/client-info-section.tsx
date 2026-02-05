"use client";

import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
import type { ClientInfoSectionProps } from "./types";

export function ClientInfoSection({ repair }: ClientInfoSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <User className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Client</h3>
      </div>
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Nom</span>
          <span className="font-medium">
            {repair.client?.first_name || ""} {repair.client?.last_name || ""}
          </span>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Téléphone</span>
          <span className="font-medium">
            {repair.client?.profile?.phone_number || "Pas de numéro"}
          </span>
        </div>
        {repair.client?.email && (
          <>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="font-medium text-sm">{repair.client.email}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
