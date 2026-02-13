"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useClientSelection } from "../../_hooks/use-client-selection";
import { StepLayout } from "../../_layouts/step-layout";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  params?: any;
  searchParams?: any;
}

export const ClientStep: React.FC<Props> = ({
  className,
  params,
  searchParams,
  ...rest
}) => {
  const {
    clientSearch,
    setClientSearch,
    selectedClient,
    setSelectedClient,
    newClient,
    setNewClient,
    searchedClients,
    handleSubmit,
    handlePrev,
    canSubmit,
  } = useClientSelection();

  return (
    <StepLayout
      title="Informations Client"
      description="Recherchez un client existant ou créez-en un nouveau"
      onBack={handlePrev}
      onNext={handleSubmit}
      isNextDisabled={!canSubmit}
      className={className}
      {...rest}
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          {(selectedClient ||
            (newClient.firstName && newClient.lastName && newClient.phone)) && (
            <Badge variant="default" className="gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Complété
            </Badge>
          )}
        </div>

        {!selectedClient ? (
          <div className="space-y-4">
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
      </div>
    </StepLayout>
  );
};
