"use client";

import { type Repair, type RepairStatus, type DeviceType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search } from "lucide-react";
import { RepairCard } from "@/components/features/repairs";

interface RepairsTableProps {
  repairs: Repair[];
  onViewDetails?: (repair: Repair) => void;
  onStatusChange?: (
    repair: Repair,
    newStatus: string,
    comment: string,
    notifyClient: boolean,
  ) => void;
  onLocationChange?: (repair: Repair, newLocation: boolean) => void;
  statusFilter: RepairStatus | "all";
  setStatusFilter: (value: RepairStatus | "all") => void;
  deviceTypeFilter: DeviceType | "all";
  setDeviceTypeFilter: (value: DeviceType | "all") => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  hiddenColumns?: string[]; // Default to empty array
}

const successConfig = {
  true: {
    label: "Réussi",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  false: {
    label: "Échec / Irréparable",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  null: {
    label: "En attente",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
};
const statusConfig = {
  saisie: {
    label: "Saisie",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  "en-cours": {
    label: "En cours",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  prete: {
    label: "Prête",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  "en-attente": {
    label: "En attente",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
};

// Define the allowed status transitions for each status
const statusFlow: Record<string, string[]> = {
  saisie: ["en-cours", "en-attente"],
  "en-cours": ["prete", "en-attente", "saisie"],
  prete: ["en-cours"],
  "en-attente": ["en-cours", "saisie"],
};

// Get available status options based on current status
const getStatusOptions = (currentStatus: string) => {
  const availableStatuses = statusFlow[currentStatus] || [];
  return Object.entries(statusConfig)
    .filter(([status]) => availableStatuses.includes(status))
    .map(([status, config]) => ({ status, ...config }));
};

export function RepairsTable({
  repairs,
  onViewDetails,
  onStatusChange,
  onLocationChange,
  statusFilter,
  setStatusFilter,
  deviceTypeFilter,
  setDeviceTypeFilter,
  searchTerm,
  setSearchTerm,
  hiddenColumns = [], // Default to empty array
}: RepairsTableProps) {
  // No local filtering needed - all repairs are already filtered by parent component
  const filteredRepairs = repairs;

  const isColumnVisible = (column: string) => !hiddenColumns.includes(column);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: RepairStatus | "all") =>
            setStatusFilter(value)
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="saisie">Saisie</SelectItem>
            <SelectItem value="en-cours">En cours</SelectItem>
            <SelectItem value="prete">Prête</SelectItem>
            <SelectItem value="en-attente">En attente</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={deviceTypeFilter}
          onValueChange={(value: DeviceType | "all") =>
            setDeviceTypeFilter(value)
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="smartphone">Smartphone</SelectItem>
            <SelectItem value="tablet">Tablette</SelectItem>
            <SelectItem value="computer">Ordinateur</SelectItem>
            <SelectItem value="other">Autres</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {filteredRepairs.map((repair) => (
          <RepairCard
            key={repair.id}
            repair={repair}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      <div className="hidden lg:block rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-0">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {isColumnVisible("id") && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    ID
                  </th>
                )}
                {isColumnVisible("device") && (
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Appareil
                  </th>
                )}
                {isColumnVisible("client") && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Client
                  </th>
                )}
                {isColumnVisible("issues") && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Panne(s)
                  </th>
                )}
                {isColumnVisible("price") && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Prix
                  </th>
                )}
                {isColumnVisible("status") && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Statut
                  </th>
                )}
                {isColumnVisible("location") && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Localisation
                  </th>
                )}
                {isColumnVisible("results") && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Résultat
                  </th>
                )}
                {isColumnVisible("date") && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRepairs.map((repair) => (
                <tr
                  key={repair.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onViewDetails?.(repair)}
                >
                  {isColumnVisible("id") && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      #{repair.id}
                    </td>
                  )}
                  {isColumnVisible("device") && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {repair.brand} {repair.model}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {repair.deviceType}
                      </div>
                    </td>
                  )}
                  {isColumnVisible("client") && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {repair.client.first_name} {repair.client.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {repair.client.profile?.phone_number || "Pas de numéro"}
                      </div>
                    </td>
                  )}
                  {isColumnVisible("issues") && (
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 px-2">
                        {(repair.repair_issues || [])
                          .slice(0, 2)
                          .map((issue, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {issue.issue.name}
                            </Badge>
                          ))}
                        {(repair.issues || []).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{(repair.issues || []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                  )}
                  {isColumnVisible("price") && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {repair.base_price}€
                      </span>
                    </td>
                  )}
                  {isColumnVisible("status") && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {repair.status && statusConfig[repair.status] ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`inline-flex h-8 select-none items-center justify-center rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${statusConfig[repair.status].className} hover:opacity-90`}
                              onClick={(e) => e.stopPropagation()} // Prevent the click from bubbling up to the table row
                            >
                              {statusConfig[repair.status].label}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/30 rounded-t px-4">
                              Changer le statut vers:
                            </div>
                            {getStatusOptions(repair.status).map(
                              (statusOption) => (
                                <DropdownMenuItem
                                  key={statusOption.status}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent the click from bubbling up to the table row
                                    // For now, we'll provide a default comment and notifyClient settings
                                    onStatusChange?.(
                                      repair,
                                      statusOption.status,
                                      "Changement rapide depuis tableau",
                                      false,
                                    );
                                  }}
                                  className={statusOption.className}
                                >
                                  {statusOption.label}
                                </DropdownMenuItem>
                              ),
                            )}
                            {getStatusOptions(repair.status).length === 0 && (
                              <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                                Aucun statut disponible
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Badge variant="outline">Inconnu</Badge>
                      )}
                    </td>
                  )}
                  {isColumnVisible("location") && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`inline-flex h-8 select-none items-center justify-center rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
                              repair.is_in_store
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            } hover:opacity-90`}
                            onClick={(e) => e.stopPropagation()} // Prevent the click from bubbling up to the table row
                          >
                            {repair.is_in_store ? "En magasin" : "Chez client"}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/30 rounded-t px-4">
                            Changer la localisation vers:
                          </div>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the click from bubbling up to the table row
                              onLocationChange?.(repair, true);
                            }}
                            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            En magasin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the click from bubbling up to the table row
                              onLocationChange?.(repair, false);
                            }}
                            className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          >
                            Chez client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                  {isColumnVisible("results") && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {repair.is_successful === true && (
                        <Badge className={successConfig.true.className}>
                          {successConfig.true.label}
                        </Badge>
                      )}
                      {repair.is_successful === false && (
                        <Badge className={successConfig.false.className}>
                          {successConfig.false.label}
                        </Badge>
                      )}
                      {repair.is_successful === null && (
                        <span className="text-xs text-muted-foreground">
                          Non diagnostiqué
                        </span>
                      )}
                    </td>
                  )}
                  {isColumnVisible("date") && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {format(new Date(repair.created_at), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRepairs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucune réparation trouvée
        </div>
      )}
    </div>
  );
}
