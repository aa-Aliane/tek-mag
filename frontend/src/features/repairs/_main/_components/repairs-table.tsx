"use client";

import React, { useState } from "react";
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
import { formatSafeDate } from "@/utils/date";
import { Search, Loader2 } from "lucide-react";
import { RepairCard } from "./repair-card";

interface RepairsTableProps {
  repairs: Repair[];
  onViewDetails?: (repair: Repair) => void;
  onStatusChange?: (
    repair: Repair,
    newStatus: string,
    comment: string,
    notifyClient: boolean,
  ) => Promise<any> | void;
  onLocationChange?: (repair: Repair, newLocation: boolean) => Promise<any> | void;
  statusFilter: RepairStatus | "all";
  setStatusFilter: (value: RepairStatus | "all") => void;
  deviceTypeFilter: DeviceType | "all";
  setDeviceTypeFilter: (value: DeviceType | "all") => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  hiddenColumns?: string[];
  isLocationUpdating?: boolean;
  isStatusUpdating?: boolean;
  updatingRepairId?: string;
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
  hiddenColumns = [],
  isLocationUpdating,
  isStatusUpdating,
  updatingRepairId,
}: RepairsTableProps) {
  // No local filtering needed - all repairs are already filtered by parent component
  const filteredRepairs = repairs;

  const isColumnVisible = (column: string) => !hiddenColumns.includes(column);

  return (
    <div className="space-y-4">
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
              {filteredRepairs.map((repair: Repair) => (
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
                        {repair.client.firstName} {repair.client.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {repair.client.profile?.phoneNumber || "Pas de numéro"}
                      </div>
                    </td>
                  )}
                  {isColumnVisible("issues") && (
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 px-2">
                        {(repair.repairIssues || [])
                          .slice(0, 2)
                          .map((issue: any, idx: number) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {issue.issueDetails.name}
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
                        {repair.basePrice}€
                      </span>
                    </td>
                  )}
                  {isColumnVisible("status") && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {repair.status && statusConfig[repair.status] ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              disabled={isStatusUpdating && updatingRepairId === String(repair.id)}
                              className={`inline-flex h-8 select-none items-center justify-center rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${statusConfig[repair.status].className} hover:opacity-90`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isStatusUpdating && updatingRepairId === String(repair.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : null}
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
                                    e.stopPropagation();
                                    onStatusChange?.(repair, statusOption.status, "Changement rapide depuis tableau", false);
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
                            disabled={isLocationUpdating && updatingRepairId === String(repair.id)}
                            className={`inline-flex h-8 select-none items-center justify-center rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
                              repair.isInStore
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            } hover:opacity-90`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isLocationUpdating && updatingRepairId === String(repair.id) ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : null}
                            {repair.isInStore ? "En magasin" : "Chez client"}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/30 rounded-t px-4">
                            Changer la localisation vers:
                          </div>
                          {!repair.isInStore && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onLocationChange?.(repair, true);
                              }}
                              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                              En magasin
                            </DropdownMenuItem>
                          )}
                          {repair.isInStore && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onLocationChange?.(repair, false);
                              }}
                              className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            >
                              Chez client
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                  {isColumnVisible("results") && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {repair.isSuccessful === true && (
                        <Badge className={successConfig.true.className}>
                          {successConfig.true.label}
                        </Badge>
                      )}
                      {repair.isSuccessful === false && (
                        <Badge className={successConfig.false.className}>
                          {successConfig.false.label}
                        </Badge>
                      )}
                      {repair.isSuccessful === null && (
                        <span className="text-xs text-muted-foreground">
                          Non diagnostiqué
                        </span>
                      )}
                    </td>
                  )}
                  {isColumnVisible("date") && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatSafeDate(repair.createdAt)}
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
