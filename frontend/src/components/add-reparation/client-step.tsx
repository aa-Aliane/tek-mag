'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Search, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAddReparationStore } from '@/store/addReparationStore';
import { useReparationStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useClients } from '@/hooks/use-clients';
import { useDeviceTypes } from '@/hooks/use-device-types';
import { useCommonIssues } from '@/hooks/use-common-issues';
import type { Client } from '@/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface ClientStepProps {
  onFormSubmit?: () => void;
}

export function ClientStep({ onFormSubmit }: ClientStepProps) {
  const { formData, setFormData, submitForm } = useAddReparationStore();
  const { deviceType: deviceTypeSlug, brand, model, selectedIssues, description, accessories, password, depositReceived, scheduledDate } = useReparationStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: clientsData } = useClients(1, undefined, "Client"); // Only fetch users with role_name "Client"
  const clients = clientsData?.results || [];

  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(formData.client);
  const [newClient, setNewClient] = useState({
    firstName: formData.newClient.firstName,
    lastName: formData.newClient.lastName,
    phone: formData.newClient.phone,
    email: formData.newClient.email,
  });

  // Fetch device types to map slug to ID
  const { data: deviceTypesData } = useDeviceTypes();
  const deviceTypes = deviceTypesData?.results || [];

  // Get the numeric ID for the selected device type slug
  const deviceTypeId = deviceTypeSlug
    ? deviceTypes.find(dt => dt.slug === deviceTypeSlug)?.id || null
    : null;

  // Fetch issues to map names to IDs
  const { data: allIssuesData } = useCommonIssues(deviceTypeSlug); // Only fetch issues for the selected device type
  const allIssues = allIssuesData || [];

  // Map selected issues to the new structure with quality tiers
  const repairIssueData = selectedIssues.map(selectedIssue => {
    const issue = allIssues.find(i => i.id === selectedIssue.issueId);
    if (!issue) return null;

    return {
      issue_id: parseInt(selectedIssue.issueId),  // Convert to number for backend
      quality_tier_id: selectedIssue.selectedTierId,
      notes: selectedIssue.notes,
    };
  }).filter(Boolean) as {
    issue_id: number;
    quality_tier_id?: number;
    notes?: string;
  }[];

  useEffect(() => {
    if (formData.client) setSelectedClient(formData.client);
    setNewClient({
      firstName: formData.newClient.firstName,
      lastName: formData.newClient.lastName,
      phone: formData.newClient.phone,
      email: formData.newClient.email,
    });
  }, [formData.client, formData.newClient]);

  const searchedClients = clientSearch
    ? clients.filter((c) => {
        const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
        const phone = c.profile?.phone_number || "";
        return (
          fullName.includes(clientSearch.toLowerCase()) ||
          phone.includes(clientSearch)
        );
      })
    : clients;

  const handleSubmit = async () => {
    // Prepare final form data, syncing values from useReparationStore
    const finalData = {
      ...formData,
      deviceType: deviceTypeId,                              // Use the numeric ID for device type
      brand: brand ? parseInt(brand) : null,                 // Convert string ID to number for backend
      model: model ? parseInt(model) : null,                 // Convert string ID to number for backend
      repair_issue_data: repairIssueData,                    // New structure with issues and quality tiers
      issueDescription: description,                         // Description from reparation store
      accessories: accessories ? accessories.split(',').map(a => a.trim()).filter(a => a) : [], // Convert string to array
      password: password,                                    // Password from reparation store
      depositStatus: depositReceived ? 'deposited' : 'scheduled', // Convert boolean to deposit status
      scheduledDate: scheduledDate,                          // Scheduled date from reparation store
      client: selectedClient,
      newClient: selectedClient ? formData.newClient : newClient,
    };

    setFormData(finalData);
    await submitForm();

    // Invalidate queries to refresh data
    await queryClient.invalidateQueries({ queryKey: ['repairs'] });
    await queryClient.invalidateQueries({ queryKey: ['clients'] });

    // Navigate back to the calendar after successful submission
    router.push('/calendrier');
  };

  const handlePrev = () => {
    // Update form data with current state before navigating back
    setFormData({
      client: selectedClient,
      newClient,
    });
    // Navigate to the previous step
    router.push('/add-reparation/issues');
  };

  const canSubmit = () => {
    return (
      selectedClient || (newClient.firstName && newClient.lastName && newClient.phone)
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">
            Informations Client
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Recherchez un client existant ou créez-en un nouveau
          </p>
        </div>
        {(selectedClient || (newClient.firstName && newClient.lastName && newClient.phone)) && (
          <Badge variant="default" className="gap-1.5">
            <Check className="h-3.5 w-3.5" />
            Complété
          </Badge>
        )}
      </div>

      {!selectedClient ? (
        <div className="space-y-4">
          {/* Client Search with Popover and Command */}
          <div className="space-y-2">
            <Label
              htmlFor="client-search"
              className="text-sm font-medium text-card-foreground"
            >
              Rechercher un client
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {clientSearch || "Sélectionnez un client..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Rechercher un client..."
                    value={clientSearch}
                    onValueChange={setClientSearch}
                  />
                  <CommandList>
                    <CommandEmpty>Aucun client trouvé.</CommandEmpty>
                    <CommandGroup>
                      {searchedClients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={`${client.first_name} ${client.last_name}`}
                          onSelect={() => {
                            setSelectedClient(client);
                            setClientSearch("");
                          }}
                          className="p-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
                        >
                          <div className="font-medium text-popover-foreground">
                            {client.first_name} {client.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {client.profile?.phone_number}
                          </div>
                          {client.email && (
                            <div className="text-sm text-muted-foreground">
                              {client.email}
                            </div>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-card-foreground"
                >
                  Prénom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={newClient.firstName}
                  onChange={(e) =>
                    setNewClient({ ...newClient, firstName: e.target.value })
                  }
                  placeholder="Jean"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-card-foreground"
                >
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={newClient.lastName}
                  onChange={(e) =>
                    setNewClient({ ...newClient, lastName: e.target.value })
                  }
                  placeholder="Dupont"
                />
              </div>
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
                {selectedClient.profile?.phone_number}
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

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handlePrev}>
          Précédent
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit()}>
          Créer la réparation
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </>
  );
}