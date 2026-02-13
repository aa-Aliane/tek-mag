import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { Accordion } from "@/components/ui/accordion";

import { Button } from "@/components/ui/button";
import { Repair } from "@/types";
import Link from "next/link";
import { Printer, Edit3, X, Laptop, Package } from "lucide-react"; // Icons
import InfoSection from "./_sections/info-section";
import AccessorySection from "./_sections/accessory-section";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  repair: Repair | null;
  onClose: () => void;
}

const RepairDetailsDrawer: React.FC<Props> = ({ repair, onClose, ...rest }) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  if (!repair) return null;

  return (
    <Drawer direction="right" open={!!repair} onOpenChange={handleOpenChange}>
      <DrawerContent className="h-full w-[400px] ml-auto">
        {/* HEADER AREA */}
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center justify-between mb-2">
            <DrawerTitle className="text-sm font-bold">
              Détails Réparation
            </DrawerTitle>
            {/* Dedicated Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </DrawerHeader>

        {/* MAIN CONTENT (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
          <Accordion
            type="multiple"
            defaultValue={["item-1", "item-2"]}
            className="w-full"
          >
            <InfoSection repair={repair} />

            <AccessorySection repair={repair} />
          </Accordion>
        </div>

        {/* FOOTER */}
        <DrawerFooter className="border-t">
          {/* QUICK ACTIONS BOX */}
          <div className="flex gap-3 pt-4">
            <Link
              href={`/repairs/${repair.id}/edit`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Edit3 className="h-4 w-4" />
              Modifier
            </Link>
            <Button
              variant="outline"
              className="flex-1 gap-2 border-slate-300 hover:bg-slate-50 text-slate-700"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default RepairDetailsDrawer;
