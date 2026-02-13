import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Repair } from "@/types";
import { Package } from "lucide-react";
import React from "react";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  repair: Repair;
}

const AccessorySection: React.FC<Props> = ({ repair, ...rest }) => {
  return (
    <AccordionItem value="item-2">
      <AccordionTrigger>
        <div className="flex flex-row items-center gap-2">
          <Package className="h-4 w-4" />
          Accessoires
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <p className="text-sm bg-muted/50 p-4 rounded-lg italic text-muted-foreground">
          {repair.accessories || "Aucun accessoire fourni"}
        </p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default AccessorySection;
