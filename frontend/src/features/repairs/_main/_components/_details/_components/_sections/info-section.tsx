import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Repair } from "@/types";
import { Laptop } from "lucide-react";
import React from "react";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  repair: Repair;
}

const InfoSection: React.FC<Props> = ({ repair, ...rest }) => {
  return (
    <AccordionItem value="item-1">
      <AccordionTrigger>
        <div className="flex flex-row items-center gap-2">
          <Laptop className="h-4 w-4" />
          Information sur l'appareil
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <ul className="grid grid-cols-2 gap-y-2 text-sm bg-muted/50 p-4 rounded-lg">
          <li className="text-muted-foreground">Type:</li>
          <li className="font-medium">{repair.deviceType}</li>
          <li className="text-muted-foreground">Marque:</li>
          <li className="font-medium">{repair.brand}</li>
          <li className="text-muted-foreground">Modèle:</li>
          <li className="font-medium">{repair.model}</li>
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
};

export default InfoSection;
