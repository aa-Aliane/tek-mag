"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Check,
  AlertCircle,
  Search,
  CalendarIcon,
  Plus,
  X,
  ChevronRight,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  issues,
  mockParts,
} from "@/lib/data";
import type { DeviceType, Client, DepositStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useBrands } from "@/hooks/use-brands";
import { useDeviceTypes } from "@/hooks/use-device-types";
import { useProductModels } from "@/hooks/use-product-models";
import { useClients } from "@/hooks/use-clients";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AddReparationFormProps {
  onFormSubmit: (data: any) => void;
  initialScheduledDate?: Date;
}

export function AddReparationForm({
  onFormSubmit,
  initialScheduledDate,
}: AddReparationFormProps) {
  const [selectedDeviceType, setSelectedDeviceType] =
    useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
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
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  useEffect(() => {
    if (initialScheduledDate) {
      setScheduledDate(initialScheduledDate);
    }
  }, [initialScheduledDate]);

  const { data: deviceTypesData } = useDeviceTypes();
  const deviceTypes = deviceTypesData?.results || [];

  const { data: brandsData } = useBrands();
  const brands = brandsData?.results || [];

  const { data: modelsData } = useProductModels(
    selectedBrand ? selectedBrand : undefined
  );
  const models = modelsData?.results || [];

  const { data: clientsData } = useClients(1, clientSearch);
  const searchedClients = clientsData?.results || [];

  // Filter brands based on selected device type
  // Note: The backend Brand model doesn't explicitly link to DeviceType in the list response
  // We might need to adjust this if the API supports filtering brands by device type
  // For now, we'll show all brands or rely on the backend to filter if we pass a param
  const filteredBrands = brands; 

  // Models are already filtered by the hook when selectedBrand changes

  const filteredIssues = selectedDeviceType
    ? issues.filter((i) => i.deviceTypes.includes("smartphone")) // Temporary fix: mapping ID to string type
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

  const handleSubmit = () => {
    // TODO: Adapt this to match the actual mutation payload
    const client = selectedClient || {
      id: Date.now(), // Temporary ID for new client
      username: newClient.email || `user${Date.now()}`,
      email: newClient.email,
      first_name: newClient.name.split(" ")[0],
      last_name: newClient.name.split(" ").slice(1).join(" "),
      profile: {
        phone_number: newClient.phone,
      }
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

    // Reset form
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

  const canSubmit = () => {
    return (
      selectedDeviceType &&
      selectedBrand &&
      selectedModel &&
      selectedIssues.length > 0 &&
      (selectedClient || (newClient.name && newClient.phone))
    );
  };

  const deviceIcons = {
    smartphone: Smartphone,
    tablet: Tablet,
    laptop: Laptop,
    watch: Watch,
  };

  const completedSections = [
    selectedDeviceType && selectedBrand && selectedModel,
    selectedIssues.length > 0,
    selectedClient || (newClient.name && newClient.phone),
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-foreground">
              Progression
            </span>
            <span className="text-sm text-muted-foreground">
              {completedSections}/3 sections complétées
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(completedSections / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device Selection */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground">
                    Appareil
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sélectionnez le type, la marque et le modèle
                  </p>
                </div>
                {selectedDeviceType && selectedBrand && selectedModel && (
                  <Badge variant="default" className="gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    Complété
                  </Badge>
                )}
              </div>

              {/* Device Type */}
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-medium text-card-foreground">
                  Type d'appareil
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {deviceTypes.map((type) => {
                    // Map backend domain/slug to icon key if needed, or use a default
                    const iconKey = type.slug?.toLowerCase() || "smartphone";
                    const Icon =
                      deviceIcons[iconKey as keyof typeof deviceIcons] ||
                      Smartphone;
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          setSelectedDeviceType(type.id);
                          setSelectedBrand(null);
                          setSelectedModel(null);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-primary hover:bg-primary/5",
                          selectedDeviceType === type.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card",
                        )}
                      >
                        <Icon className="h-6 w-6 text-foreground" />
                        <span className="text-sm font-medium text-card-foreground">
                          {type.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand Selection */}
              {selectedDeviceType && (
                <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <Label className="text-sm font-medium text-card-foreground">
                    Marque
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {filteredBrands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => {
                          setSelectedBrand(brand.id);
                          setSelectedModel(null);
                        }}
                        className={cn(
                          "rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all hover:border-primary hover:bg-primary/5",
                          selectedBrand === brand.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-card-foreground",
                        )}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Selection */}
              {selectedBrand && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <Label className="text-sm font-medium text-card-foreground">
                    Modèle
                  </Label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={cn(
                          "rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-all hover:border-primary hover:bg-primary/5",
                          selectedModel === model.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-card-foreground",
                        )}
                      >
                        {model.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Issues Selection */}
            {selectedModel && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-card-foreground">
                      Pannes & Réparations
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sélectionnez toutes les réparations nécessaires
                    </p>
                  </div>
                  {selectedIssues.length > 0 && (
                    <Badge variant="default" className="gap-1.5">
                      <Check className="h-3.5 w-3.5" />
                      {selectedIssues.length} sélectionnée
                      {selectedIssues.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  {filteredIssues.map((issue) => {
                    const isSelected = selectedIssues.includes(issue.name);
                    const isAvailable = partsAvailability[issue.name];
                    return (
                      <div
                        key={issue.id}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-4 transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50",
                        )}
                      >
                        <Checkbox
                          id={issue.id}
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleIssueToggle(issue.name, checked as boolean)
                          }
                          className="mt-0.5"
                        />
                        <label
                          htmlFor={issue.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium text-card-foreground">
                              {issue.name}
                            </span>
                            <span className="text-sm font-semibold text-accent">
                              {issue.basePrice} €
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {issue.requiresPart && (
                              <span className="text-xs text-muted-foreground">
                                Pièce requise
                              </span>
                            )}
                            {issue.requiresPart && isSelected && (
                              <Badge
                                variant={
                                  isAvailable ? "default" : "destructive"
                                }
                                className="text-xs gap-1"
                              >
                                {isAvailable ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    En stock
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
                        </label>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="issue-description"
                    className="text-sm font-medium text-card-foreground"
                  >
                    Description détaillée (optionnel)
                  </Label>
                  <Textarea
                    id="issue-description"
                    placeholder="Ajoutez des détails supplémentaires sur les problèmes rencontrés..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            {/* Additional Info */}
            {selectedIssues.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-xl font-semibold text-card-foreground mb-6">
                  Informations complémentaires
                </h2>

                <div className="space-y-6">
                  {/* Accessories */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="accessories"
                      className="text-sm font-medium text-card-foreground"
                    >
                      Accessoires déposés
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="accessories"
                        placeholder="Ex: Chargeur, Coque, Écouteurs..."
                        value={newAccessory}
                        onChange={(e) => setNewAccessory(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddAccessory())
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddAccessory}
                        size="icon"
                        variant="secondary"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {accessories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {accessories.map((acc, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="gap-1.5 pr-1 cursor-pointer hover:bg-secondary/80"
                            onClick={() => handleRemoveAccessory(idx)}
                          >
                            {acc}
                            <X className="h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-card-foreground"
                    >
                      Mot de passe de l'appareil
                    </Label>
                    <Input
                      id="password"
                      type="text"
                      placeholder="Code PIN ou mot de passe..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <Separator />

                  {/* Deposit Status */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-card-foreground">
                      Statut de dépôt
                    </Label>
                    <RadioGroup
                      value={depositStatus}
                      onValueChange={(value) =>
                        setDepositStatus(value as DepositStatus)
                      }
                      className="gap-3"
                    >
                      <div
                        className={cn(
                          "flex items-start gap-3 rounded-lg border-2 p-4 transition-all cursor-pointer",
                          depositStatus === "deposited"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <RadioGroupItem
                          value="deposited"
                          id="deposited"
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor="deposited"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-card-foreground">
                            Appareil déposé
                          </div>
                          <div className="text-sm text-muted-foreground">
                            L'appareil est actuellement en atelier
                          </div>
                        </Label>
                      </div>
                      <div
                        className={cn(
                          "flex items-start gap-3 rounded-lg border-2 p-4 transition-all cursor-pointer",
                          depositStatus === "scheduled"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <RadioGroupItem
                          value="scheduled"
                          id="scheduled"
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor="scheduled"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-card-foreground">
                            Réparation programmée
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Le client apportera l'appareil plus tard
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Scheduled Date */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-card-foreground">
                      Date programmée (optionnel)
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !scheduledDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDate ? (
                            format(scheduledDate, "dd MMMM yyyy", {
                              locale: fr,
                            })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={setScheduledDate}
                          locale={fr}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}

            {/* Client Info */}
            {selectedIssues.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-card-foreground">
                      Informations Client
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Recherchez un client existant ou créez-en un nouveau
                    </p>
                  </div>
                  {(selectedClient || (newClient.name && newClient.phone)) && (
                    <Badge variant="default" className="gap-1.5">
                      <Check className="h-3.5 w-3.5" />
                      Complété
                    </Badge>
                  )}
                </div>

                {!selectedClient ? (
                  <div className="space-y-4">
                    {/* Client Search */}
                    <div className="space-y-2 relative">
                      <Label
                        htmlFor="client-search"
                        className="text-sm font-medium text-card-foreground"
                      >
                        Rechercher un client
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="client-search"
                          placeholder="Nom ou numéro de téléphone..."
                          value={clientSearch}
                          onChange={(e) => {
                            setClientSearch(e.target.value);
                            setShowClientDropdown(e.target.value.length > 0);
                          }}
                          onFocus={() =>
                            setShowClientDropdown(clientSearch.length > 0)
                          }
                          className="pl-9"
                        />
                      </div>

                      {showClientDropdown && searchedClients.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {searchedClients.map((client) => (
                            <button
                              key={client.id}
                              onClick={() => {
                                setSelectedClient(client);
                                setClientSearch("");
                                setShowClientDropdown(false);
                              }}
                              className="w-full p-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
                            >
                              <div className="font-medium text-popover-foreground">
                                {client.first_name} {client.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {client.profile?.phone_number || "Pas de numéro"}
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

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Ou créer un nouveau client
                        </span>
                      </div>
                    </div>

                    {/* New Client Form */}
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium text-card-foreground"
                        >
                          Nom complet{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={newClient.name}
                          onChange={(e) =>
                            setNewClient({ ...newClient, name: e.target.value })
                          }
                          placeholder="Jean Dupont"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium text-card-foreground"
                        >
                          Téléphone <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="phone"
                          value={newClient.phone}
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              phone: e.target.value,
                            })
                          }
                          placeholder="06 12 34 56 78"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-card-foreground"
                        >
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newClient.email}
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              email: e.target.value,
                            })
                          }
                          placeholder="jean.dupont@exemple.com"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-card-foreground text-lg">
                          {selectedClient.first_name} {selectedClient.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {selectedClient.profile?.phone_number || "Pas de numéro"}
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
                        className="text-primary hover:text-primary"
                      >
                        Changer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Récapitulatif
              </h3>

              <div className="space-y-4 mb-6">
                {/* Device Summary */}
                {selectedDeviceType && selectedBrand && selectedModel && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Appareil
                    </div>
                    <div className="text-sm text-card-foreground">
                      {
                        deviceTypes.find((d) => d.id === selectedDeviceType)
                          ?.name
                      }
                    </div>
                    <div className="text-sm font-medium text-card-foreground">
                      {brands.find((b) => b.id === selectedBrand)?.name}{" "}
                      {models.find((m) => m.id === selectedModel)?.name}
                    </div>
                  </div>
                )}

                {/* Issues Summary */}
                {selectedIssues.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Réparations
                      </div>
                      <div className="space-y-1.5">
                        {selectedIssues.map((issueName) => {
                          const issue = issues.find(
                            (i) => i.name === issueName,
                          );
                          return (
                            <div
                              key={issueName}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-card-foreground">
                                {issueName}
                              </span>
                              <span className="font-medium text-accent">
                                {issue?.basePrice} €
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Client Summary */}
                {(selectedClient || (newClient.name && newClient.phone)) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Client
                      </div>
                      <div className="text-sm font-medium text-card-foreground">
                        {selectedClient
                          ? `${selectedClient.first_name} ${selectedClient.last_name}`
                          : newClient.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedClient
                          ? selectedClient.profile?.phone_number || "Pas de numéro"
                          : newClient.phone}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Total Price */}
              {totalPrice > 0 && (
                <>
                  <Separator className="mb-4" />
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium text-card-foreground">
                      Total estimé
                    </span>
                    <span className="text-2xl font-bold text-accent">
                      {totalPrice.toFixed(2)} €
                    </span>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit()}
                className="w-full gap-2"
                size="lg"
              >
                Créer la réparation
                <ChevronRight className="h-4 w-4" />
              </Button>

              {!canSubmit() && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Complétez tous les champs requis pour continuer
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
