"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Smartphone,
  Battery,
  Droplets,
  Plug,
  Speaker,
  Camera,
  Wifi,
} from "lucide-react";

interface RepairSelectionProps {
  onSelect: (repair: string) => void;
  onBack: () => void;
}

export function RepairSelection({ onSelect, onBack }: RepairSelectionProps) {
  const repairs = [
    {
      id: "screen",
      name: "Écran",
      icon: Smartphone,
      description: "Écran cassé, tactile défectueux",
      price: "À partir de 79€",
    },
    {
      id: "battery",
      name: "Batterie",
      icon: Battery,
      description: "Batterie faible, charge rapide",
      price: "À partir de 49€",
    },
    {
      id: "oxidation",
      name: "Oxydation",
      icon: Droplets,
      description: "Dégât des eaux, nettoyage",
      price: "À partir de 39€",
    },
    {
      id: "charging-port",
      name: "Connecteur de charge",
      icon: Plug,
      description: "Port de charge défectueux",
      price: "À partir de 59€",
    },
    {
      id: "speaker",
      name: "Haut-parleur",
      icon: Speaker,
      description: "Son faible ou absent",
      price: "À partir de 45€",
    },
    {
      id: "camera",
      name: "Caméra",
      icon: Camera,
      description: "Caméra floue ou cassée",
      price: "À partir de 69€",
    },
    {
      id: "connectivity",
      name: "Connectivité",
      icon: Wifi,
      description: "WiFi, Bluetooth, réseau",
      price: "À partir de 55€",
    },
  ];

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      <h2 className="text-xl font-semibold text-center mb-6">
        Quel type de réparation nécessitez-vous ?
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {repairs.map((repair) => {
          const Icon = repair.icon;
          return (
            <Card
              key={repair.id}
              className="cursor-pointer border-2 p-5 transition-all hover:border-accent hover:shadow-lg"
              onClick={() => onSelect(repair.id)}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-accent/10 p-3">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold">{repair.name}</h3>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {repair.description}
                  </p>
                  <p className="text-sm font-medium text-accent">
                    {repair.price}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
