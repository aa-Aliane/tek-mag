"use client";

import { useState } from "react";
import { StatusDialog } from "@/components/dialogs/repairs/status-dialog";
// Remove the 'process' import

export const RepairsDetailsView = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirmStatus = () => {
    console.log("Status confirmed!");
    setIsOpen(false);
  };

  return (
    <div className="p-8">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        Changer le statut
      </button>

      {/* The Dialog */}
      <StatusDialog
        open={isOpen}
        onOpenChange={setIsOpen} // Simplified toggle
        onConfirm={handleConfirmStatus}
        confirmLabel="Enregistrer"
        cancelLabel="Fermer"
      >
        {/* Important: You must pass the body content here */}
        <div className="space-y-4">
          <p>Sélectionnez le nouveau statut pour cette intervention.</p>
          {/* Your RadioGroups or Status buttons go here */}
        </div>
      </StatusDialog>
    </div>
  );
};
