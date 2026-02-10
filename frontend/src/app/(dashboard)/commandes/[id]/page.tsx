"use client";

import { useParams } from "next/navigation";
import { CommandDetails } from "@/components/features/commands/command-details";
import { SharedHeader } from "@/components/shared/shared-header";

export default function CommandDetailPage() {
  const params = useParams();
  const orderId = parseInt(params.id as string, 10);

  return (
    <div className="h-full">
      <SharedHeader
        title={`Détail de la commande #${orderId}`}
        subtitle="Informations détaillées sur la commande de pièces"
      />

      <div className="flex justify-center items-start p-4 sm:p-8 min-h-screen">
        <CommandDetails orderId={orderId} isStandalone={true} />
      </div>
    </div>
  );
}