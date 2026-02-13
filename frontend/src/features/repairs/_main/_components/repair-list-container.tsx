"use client";

import React from "react";
import { RepairsTable } from "./repairs-table";
import { Repair, RepairStatus, DeviceType } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  repairs: Repair[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: RepairStatus | "all";
  setStatusFilter: (value: RepairStatus | "all") => void;
  deviceTypeFilter: DeviceType | "all";
  setDeviceTypeFilter: (value: DeviceType | "all") => void;
  onViewDetails: (repair: Repair) => void;
  onStatusChange: (
    repair: Repair,
    newStatus: RepairStatus,
    comment: string,
    notifyClient: boolean,
  ) => void;
  onLocationChange?: (repair: Repair, newLocation: boolean) => void;
  isLocationUpdating?: boolean;
  isStatusUpdating?: boolean;
  updatingRepairId?: string;
}

export const RepairListContainer: React.FC<Props> = ({
  repairs,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  deviceTypeFilter,
  setDeviceTypeFilter,
  onViewDetails,
  onStatusChange,
  onLocationChange,
  isLocationUpdating,
  isStatusUpdating,
  updatingRepairId,
  className,
  ...rest
}) => {
  return (
    <div
      className={cn("flex-1 min-w-0 transition-all duration-300", className)}
      {...rest}
    >
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
            value={deviceTypeFilter as any}
            onValueChange={(value: any | "all") => setDeviceTypeFilter(value)}
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

        <RepairsTable
          repairs={repairs}
          onViewDetails={onViewDetails}
          onStatusChange={onStatusChange as any}
          onLocationChange={onLocationChange}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          deviceTypeFilter={deviceTypeFilter}
          setDeviceTypeFilter={setDeviceTypeFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          hiddenColumns={["results"]}
          isLocationUpdating={isLocationUpdating}
          isStatusUpdating={isStatusUpdating}
          updatingRepairId={updatingRepairId}
        />
      </div>
    </div>
  );
};
