"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  brands,
  models,
  issues,
  mockClients,
  mockParts,
  deviceTypes,
} from "@/lib/data";
import { type DeviceType, type Client, type DepositStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AddReparationFormProps {
  onFormSubmit: (data: any) => void;
  initialScheduledDate?: Date;
}

export function AddReparationForm({
  onFormSubmit,
  initialScheduledDate,
}: AddReparationFormProps) {
  const [step, setStep] = useState(1);
  const [selectedDeviceType, setSelectedDeviceType] =
    useState<DeviceType | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [issueDescription, setIssueDescription] = useState("");
  const [accessories, setAccessories] = useState<string[]>([]);
  const [newAccessory, setNewAccessory] = useState("");
  const [password, setPassword] = useState("");
  const [depositStatus, setDepositStatus] =
    useState<DepositStatus>("deposited");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [partsAvailability, setPartsAvailability] = useState<
    Record<string, boolean>
  >({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    initialScheduledDate,
  );

  useEffect(() => {
    if (initialScheduledDate) {
      setScheduledDate(initialScheduledDate);
    }
  }, [initialScheduledDate]);

  const filteredBrands = selectedDeviceType
    ? brands.filter((b) => b.deviceTypes.includes(selectedDeviceType))
    : [];

  const filteredModels =
    selectedBrand && selectedDeviceType
      ? models.filter(
          (m) =>
            m.brandId === selectedBrand && m.deviceType === selectedDeviceType,
        )
      : [];

  const filteredIssues = selectedDeviceType
    ? issues.filter((i) => i.deviceTypes.includes(selectedDeviceType))
    : [];

  const searchedClients = clientSearch
    ? mockClients.filter(
        (c) =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.phone.includes(clientSearch),
      )
    : [];

  const checkPartsAvailability = (issueName: string) => {
    const issue = issues.find((i) => i.name === issueName);
    if (!issue?.requiresPart) return true;

    const availablePart = mockParts.find(
      (part) =>
        part.name
          .toLowerCase()
          .includes(issueName.toLowerCase().split(" ")[0]) && part.quantity > 0,
    );
    return !!availablePart;
  };

  const handleIssueToggle = (issueName: string, checked: boolean) => {
    if (checked) {
      setSelectedIssues([...selectedIssues, issueName]);
      const available = checkPartsAvailability(issueName);
      setPartsAvailability({ ...partsAvailability, [issueName]: available });
      const issue = issues.find((i) => i.name === issueName);
      if (issue) {
        setTotalPrice(totalPrice + issue.basePrice);
      }
    } else {
      setSelectedIssues(selectedIssues.filter((i) => i !== issueName));
      const newAvailability = { ...partsAvailability };
      delete newAvailability[issueName];
      setPartsAvailability(newAvailability);
      const issue = issues.find((i) => i.name === issueName);
      if (issue) {
        setTotalPrice(totalPrice - issue.basePrice);
      }
    }
  };

  const handleAddAccessory = () => {
    if (newAccessory.trim()) {
      setAccessories([...accessories, newAccessory.trim()]);
      setNewAccessory("");
    }
  };

  const handleRemoveAccessory = (index: number) => {
    setAccessories(accessories.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const client = selectedClient || {
      id: Date.now().toString(),
      ...newClient,
    };

    const brand = brands.find((b) => b.id === selectedBrand);
    const model = models.find((m) => m.id === selectedModel);

    onFormSubmit({
      deviceType: selectedDeviceType,
      brand: brand?.name,
      model: model?.name,
      issues: selectedIssues,
      issueDescription,
      client,
      status: "saisie",
      createdAt: new Date(),
      accessories: accessories.length > 0 ? accessories : undefined,
      password: password || undefined,
      depositStatus,
      totalCost: totalPrice,
      scheduledDate: scheduledDate,
    });

    // Reset form state
    setStep(1);
    setSelectedDeviceType(null);
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedIssues([]);
    setIssueDescription("");
    setAccessories([]);
    setPassword("");
    setDepositStatus("deposited");
    setClientSearch("");
    setSelectedClient(null);
    setNewClient({ name: "", phone: "", email: "" });
    setPartsAvailability({});
    setTotalPrice(0);
    setScheduledDate(undefined);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedDeviceType !== null;
      case 2:
        return selectedBrand !== null;
      case 3:
        return selectedModel !== null;
      case 4:
        return selectedIssues.length > 0;
      case 5:
        return true;
      case 6:
        return selectedClient !== null || (newClient.name && newClient.phone);
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Nouvelle Réparation</h2>
        <div className="text-lg font-semibold">Étape {step} sur 6</div>
      </div>
      <div className="bg-card p-6 rounded-lg shadow-md">
        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <Label className="text-base">Type d'appareil</Label>
              <div className="grid grid-cols-2 gap-4">
                {deviceTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedDeviceType(type.id as DeviceType)}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all hover:border-primary",
                      selectedDeviceType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border",
                    )}
                  >
                    <type.icon className="h-12 w-12" />
                    <span className="font-medium">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label className="text-base">Marque</Label>
              <div className="grid grid-cols-3 gap-3">
                {filteredBrands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.id)}
                    className={cn(
                      "rounded-lg border-2 p-4 text-center font-medium transition-all hover:border-primary",
                      selectedBrand === brand.id
                        ? "border-primary bg-primary/5"
                        : "border-border",
                    )}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label className="text-base">Modèle</Label>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={cn(
                      "rounded-lg border-2 p-4 text-left font-medium transition-all hover:border-primary",
                      selectedModel === model.id
                        ? "border-primary bg-primary/5"
                        : "border-border",
                    )}
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">
                  Panne(s) - Sélectionnez une ou plusieurs
                </Label>
                {totalPrice > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-base font-semibold"
                  >
                    Total: {totalPrice.toFixed(2)} €
                  </Badge>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredIssues.map((issue) => {
                  const isSelected = selectedIssues.includes(issue.name);
                  const isAvailable = partsAvailability[issue.name];
                  return (
                    <div
                      key={issue.id}
                      className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-muted"
                    >
                      <Checkbox
                        id={issue.id}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleIssueToggle(issue.name, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={issue.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {issue.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({issue.basePrice} €)
                            </span>
                            {issue.requiresPart && isSelected && (
                              <Badge
                                variant={
                                  isAvailable ? "default" : "destructive"
                                }
                                className="text-xs flex items-center gap-1"
                              >
                                {isAvailable ? (
                                  <>
                                    <CheckCircle className="h-3 w-3" />
                                    Disponible
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-3 w-3" />À
                                    commander
                                  </>
                                )}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {issue.requiresPart && (
                          <span className="text-xs text-muted-foreground">
                            (Pièce requise)
                          </span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue-description">
                  Description détaillée de la panne
                </Label>
                <Textarea
                  id="issue-description"
                  placeholder="Décrivez plus en détail le problème rencontré..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <Label className="text-base">Informations complémentaires</Label>

              <div className="space-y-3">
                <Label htmlFor="accessories">
                  Accessoires déposés (optionnel)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="accessories"
                    placeholder="Ex: Chargeur, Sacoche, Coque..."
                    value={newAccessory}
                    onChange={(e) => setNewAccessory(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddAccessory()
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddAccessory}
                  >
                    Ajouter
                  </Button>
                </div>
                {accessories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {accessories.map((acc, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveAccessory(idx)}
                      >
                        {acc} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Mot de passe de l'appareil (optionnel)
                </Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="Code PIN ou mot de passe..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Statut de dépôt</Label>
                <RadioGroup
                  value={depositStatus}
                  onValueChange={(value) =>
                    setDepositStatus(value as DepositStatus)
                  }
                >
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-4">
                    <RadioGroupItem value="deposited" id="deposited" />
                    <Label
                      htmlFor="deposited"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">Appareil déposé</div>
                      <div className="text-sm text-muted-foreground">
                        L'appareil est actuellement en atelier
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-4">
                    <RadioGroupItem value="scheduled" id="scheduled" />
                    <Label
                      htmlFor="scheduled"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">Réparation programmée</div>
                      <div className="text-sm text-muted-foreground">
                        Le client apportera l'appareil plus tard
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Programmer une date (optionnel)</Label>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    locale={fr}
                    className="rounded-md border"
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </div>
                {scheduledDate && (
                  <div className="rounded-lg border border-border bg-primary/10 p-3 text-center">
                    <span className="text-sm font-medium">
                      Programmée pour le{" "}
                      {format(scheduledDate, "dd MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <Label className="text-base">Informations Client</Label>

              <div className="space-y-2">
                <Label htmlFor="client-search">
                  Rechercher un client existant
                </Label>
                <Input
                  id="client-search"
                  placeholder="Nom ou numéro de téléphone..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />

                {searchedClients.length > 0 && (
                  <div className="space-y-2 rounded-lg border border-border p-2">
                    {searchedClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => {
                          setSelectedClient(client);
                          setClientSearch("");
                        }}
                        className="w-full rounded-lg p-3 text-left hover:bg-muted"
                      >
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.phone}
                        </div>
                        {client.email && (
                          <div className="text-sm text-muted-foreground">
                            {client.email}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedClient ? (
                <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedClient.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedClient.phone}
                      </div>
                      {selectedClient.email && (
                        <div className="text-sm text-muted-foreground">
                          {selectedClient.email}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedClient(null)}
                    >
                      Changer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 rounded-lg border border-border p-4">
                  <p className="text-sm font-medium">Nouveau client</p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Nom *</Label>
                      <Input
                        id="name"
                        value={newClient.name}
                        onChange={(e) =>
                          setNewClient({ ...newClient, name: e.target.value })
                        }
                        placeholder="Nom complet"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        value={newClient.phone}
                        onChange={(e) =>
                          setNewClient({ ...newClient, phone: e.target.value })
                        }
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email (optionnel)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email}
                        onChange={(e) =>
                          setNewClient({ ...newClient, email: e.target.value })
                        }
                        placeholder="email@exemple.com"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>

            {step < 6 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed()}>
                Créer la réparation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
