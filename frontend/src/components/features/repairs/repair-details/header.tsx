"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Printer,
  CheckCircle,
  Wallet,
  CalendarClock,
  ArrowLeft,
  Edit,
  ArrowUpDown,
  X,
  Tag,
} from "lucide-react";
import { statusConfig } from "./config";
import { formatDate } from "./utils";
import type { RepairDetailsHeaderProps } from "./types";

export function RepairDetailsHeader({
  repair,
  onClose,
  onEdit,
  onStatusChange,
  onSchedule,
  onMarkRecovered,
  onPrint,
  isPaymentComplete,
  remaining,
  isPaymentFormVisible,
  setIsPaymentFormVisible,
  isDiscountFormVisible,
  setIsDiscountFormVisible,
}: RepairDetailsHeaderProps) {
  return (
    <div className="border-b bg-muted/30 px-6 py-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">Réparation #{repair.id}</h2>
            {repair.status && statusConfig[repair.status] && (
              <Badge className={statusConfig[repair.status].className}>
                {statusConfig[repair.status].label}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Créée le {formatDate(repair.created_at, "dd MMMM yyyy")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={onPrint}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimer
        </Button>

        {repair.is_in_store && repair.status === "prete" && onMarkRecovered && (
          <Button
            variant={isPaymentComplete ? "default" : "outline"}
            size="sm"
            onClick={onMarkRecovered}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marquer récupéré
          </Button>
        )}

        {repair.remaining_balance > 0 ? (
          <Button
            variant={remaining > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPaymentFormVisible(true)}
          >
            <Wallet className="h-4 w-4 mr-2" />
            {`${repair.remaining_balance} € à payer`}
          </Button>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDiscountFormVisible(true)}
        >
          <Tag className="h-4 w-4 mr-2" />
          Appliquer une remise
        </Button>

        {onSchedule && (
          <Button variant="outline" size="sm" onClick={onSchedule}>
            <CalendarClock className="h-4 w-4 mr-2" />
            {repair.scheduledDate ? "Modifier date" : "Programmer"}
          </Button>
        )}

        {isPaymentFormVisible && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaymentFormVisible(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        )}

        {isDiscountFormVisible && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDiscountFormVisible(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        )}

        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(repair)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={onStatusChange}>
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Changer statut
        </Button>
      </div>
    </div>
  );
}
