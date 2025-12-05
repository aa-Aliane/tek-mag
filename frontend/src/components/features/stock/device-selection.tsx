"use client";

import { Card } from "@/components/ui/card";
import { Smartphone, Laptop, Tablet } from "lucide-react";

interface DeviceSelectionProps {
  onSelect: (device: string) => void;
}

export function DeviceSelection({ onSelect }: DeviceSelectionProps) {
  const devices = [
    {
      id: "phone",
      name: "Téléphone",
      icon: Smartphone,
      description: "Smartphone et téléphone portable",
    },
    {
      id: "computer",
      name: "Ordinateur",
      icon: Laptop,
      description: "PC portable et ordinateur de bureau",
    },
    {
      id: "tablet",
      name: "Tablette",
      icon: Tablet,
      description: "Tablette tactile",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center mb-6">
        Quel type d&apos;appareil souhaitez-vous faire réparer ?
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {devices.map((device) => {
          const Icon = device.icon;
          return (
            <Card
              key={device.id}
              className="cursor-pointer border-2 p-6 transition-all hover:border-accent hover:shadow-lg"
              onClick={() => onSelect(device.id)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-accent/10 p-4">
                  <Icon className="h-12 w-12 text-accent" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{device.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {device.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
