"use client";

import type React from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Check } from "lucide-react";
import { useState } from "react";

interface BookingSummaryProps {
  deviceType: string;
  brand: string;
  model: string;
  repairType: string;
  onBack: () => void;
}

export function BookingSummary({
  deviceType,
  brand,
  model,
  repairType,
  onBack,
}: BookingSummaryProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Booking submitted:", {
      ...formData,
      deviceType,
      brand,
      model,
      repairType,
    });
  };

  const repairNames: Record<string, string> = {
    screen: "Écran",
    battery: "Batterie",
    oxidation: "Oxydation",
    "charging-port": "Connecteur de charge",
    speaker: "Haut-parleur",
    camera: "Caméra",
    connectivity: "Connectivité",
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <Card className="border-2 p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Récapitulatif de votre réparation
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type d&apos;appareil:</span>
            <span className="font-medium capitalize">{deviceType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Marque:</span>
            <span className="font-medium capitalize">{brand}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Modèle:</span>
            <span className="font-medium">{model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type de réparation:</span>
            <span className="font-medium">{repairNames[repairType]}</span>
          </div>
        </div>
      </Card>

      <Card className="border-2 p-6">
        <h2 className="mb-4 text-xl font-semibold">Vos informations</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jean Dupont"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="jean.dupont@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="06 12 34 56 78"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date souhaitée</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Heure souhaitée</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90"
            size="lg"
          >
            <Check className="mr-2 h-5 w-5" />
            Confirmer le rendez-vous
          </Button>
        </form>
      </Card>
    </div>
  );
}
