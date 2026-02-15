import React, { useState } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Repair } from "@/types";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationUpdateDialog } from "../../_layouts";
import { useUpdateRepairLocation } from "../../_queries/use-details";
import { UpdateLocationForm } from "../../_forms";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  repair: Repair;
}

const LocationSection: React.FC<Props> = ({ repair }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutate: updateLocation } = useUpdateRepairLocation();

  const handleUpdateClick = () => {
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: { isInStore: boolean }) => {
    updateLocation({
      repairId: repair.id,
      isInStore: data.isInStore,
    });
    setIsDialogOpen(false);
  };

  return (
    <AccordionItem value="item-location">
      <AccordionTrigger className="flex flex-row items-center gap-2">
        <div className="flex flex-row items-center gap-2">
          <MapPin className="h-4 w-4" />
          Emplacement de la réparation
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none">
                Localisation actuelle
              </h4>
            </div>
            <Badge variant="secondary" className="capitalize">
              {repair.isInStore ? "En magasin" : "Chez le client"}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left font-normal"
              onClick={handleUpdateClick}
            >
              <MapPin className="mr-2 h-3 w-3 opacity-50" />
              <span>Modifier l'emplacement...</span>
            </Button>
          </div>

          <LocationUpdateDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            repair={repair}
          >
            <UpdateLocationForm
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isLoading={false}
              isInStore={repair.isInStore}
            />
          </LocationUpdateDialog>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default LocationSection;
