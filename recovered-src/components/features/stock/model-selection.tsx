"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search } from "lucide-react";

interface ModelSelectionProps {
  brand: string;
  onSelect: (model: string) => void;
  onBack: () => void;
}

export function ModelSelection({
  brand,
  onSelect,
  onBack,
}: ModelSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const models = [
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13",
    "iPhone 12 Pro Max",
    "iPhone 12 Pro",
    "iPhone 12",
    "iPhone 11 Pro Max",
    "iPhone 11 Pro",
    "iPhone 11",
    "iPhone XS Max",
    "iPhone XS",
    "iPhone XR",
    "iPhone X",
    "iPhone 8 Plus",
    "iPhone 8",
  ];

  const filteredModels = models.filter((model) =>
    model.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      <h2 className="text-xl font-semibold text-center mb-6">
        Sélectionnez le modèle exact
      </h2>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher un modèle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {filteredModels.map((model) => (
          <Card
            key={model}
            className="cursor-pointer border-2 p-4 transition-all hover:border-accent hover:shadow-md"
            onClick={() => onSelect(model)}
          >
            <div className="flex items-center">
              <h3 className="font-medium">{model}</h3>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
