"use client";

import { CommandForm } from "@/components/features/commands/command-form";
import { SharedHeader } from "@/components/shared/shared-header";

export default function NewCommandPage() {
  return (
    <div className="h-full">
      <SharedHeader
        title="Nouvelle commande de pièces"
        subtitle="Créer une nouvelle commande de pièces détachées"
      />

      <div className="p-4 sm:p-8">
        <CommandForm 
          onSuccess={() => {
            // Redirect to commandes list on success
            window.location.href = "/commandes";
          }}
        />
      </div>
    </div>
  );
}