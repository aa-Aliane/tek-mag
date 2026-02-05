"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusChangeDialog } from "@/components/features/commands";
import { ScheduleRepairDialog } from "@/components/features/repairs";
import { printRepairTicket } from "@/lib/print-utils";
import type { RepairStatus } from "@/types";

import { RepairDetailsHeader } from "./header";
import { DeviceInfoSection } from "./device-info-section";
import { IssuesAndCostSection } from "./issues-and-cost-section";
import { ClientInfoSection } from "./client-info-section";
import { AdditionalInfoSection } from "./additional-info-section";
import { DatesInfoSection } from "./dates-info-section";
import { StatusHistorySection } from "./status-history-section";
import { PaymentForm } from "./payment-form";
import { calculatePayments, formatDate } from "./utils";
import type { RepairDetailsProps } from "./types";

export function RepairDetails({
  repair,
  onClose,
  onEdit,
  onStatusChange,
  onSchedule,
  onAddPayment,
  onRestitute,
  onDeletePayment,
  onMarkRecovered,
  currentUserName,
}: RepairDetailsProps) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isPaymentFormVisible, setIsPaymentFormVisible] = useState(false);
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);
  const [isPaymentWarningOpen, setIsPaymentWarningOpen] = useState(false);

  if (!repair) return null;

  const {
    cardPayment,
    cashPayment,
    totalPaid,
    totalCostValue,
    remaining,
    isPaymentComplete,
  } = calculatePayments(repair);

  const handleStatusChange = (
    newStatus: RepairStatus,
    comment: string,
    notifyClient: boolean,
    outcome?: boolean,
  ) => {
    if (onStatusChange) {
      onStatusChange(repair, newStatus, comment, notifyClient, outcome);
    }
    setIsStatusDialogOpen(false);
  };

  const handleSchedule = (repair: Repair, date: Date) => {
    if (onSchedule) {
      onSchedule(repair, date);
    }
    setIsScheduleDialogOpen(false);
  };

  const handleRecoveryClick = () => {
    if (!isPaymentComplete && totalCostValue > 0) {
      setIsPaymentWarningOpen(true);
    } else {
      setIsRecoveryDialogOpen(true);
    }
  };

  const handleConfirmRecovery = () => {
    if (onMarkRecovered) {
      onMarkRecovered(repair);
    }
    setIsRecoveryDialogOpen(false);
    onClose();
  };

  const handlePrint = () => {
    printRepairTicket(repair);
  };

  return (
    <>
      <div className="h-full flex flex-col bg-background border-l shadow-sm">
        <RepairDetailsHeader
          repair={repair}
          onClose={onClose}
          onEdit={onEdit}
          onStatusChange={() => setIsStatusDialogOpen(true)}
          onSchedule={() => setIsScheduleDialogOpen(true)}
          onMarkRecovered={handleRecoveryClick}
          onAddPayment={() => setIsPaymentFormVisible(true)}
          onPrint={handlePrint}
          isPaymentComplete={isPaymentComplete}
          remaining={remaining}
          totalCostValue={totalCostValue}
          isPaymentFormVisible={isPaymentFormVisible}
          setIsPaymentFormVisible={setIsPaymentFormVisible}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <DeviceInfoSection repair={repair} />

            <IssuesAndCostSection
              repair={repair}
              totalCostValue={totalCostValue}
              totalPaid={totalPaid}
              remaining={remaining}
              cardPayment={cardPayment}
              cashPayment={cashPayment}
            />

            <ClientInfoSection repair={repair} />

            <AdditionalInfoSection repair={repair} />

            <DatesInfoSection repair={repair} formatDate={formatDate} />

            {/* Notes */}
            {repair.notes && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Notes</h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">{repair.notes}</p>
                </div>
              </div>
            )}

            <StatusHistorySection repair={repair} formatDate={formatDate} />
          </div>
        </div>
      </div>

      {/* Payment Form Overlay */}
      {isPaymentFormVisible && (
        <PaymentForm
          repair={repair}
          onClose={() => setIsPaymentFormVisible(false)}
          onAddPayment={onAddPayment}
          totalCostValue={totalCostValue}
          totalPaid={totalPaid}
          remaining={remaining}
        />
      )}

      {/* Dialogs */}
      <AlertDialog
        open={isPaymentWarningOpen}
        onOpenChange={setIsPaymentWarningOpen}
      >
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-primary">
              Restitution et solde dû
            </AlertDialogTitle>
            <AlertDialogDescription>
              Le client souhaite récupérer son appareil mais il reste
              <span className="font-bold text-foreground">
                {" "}
                {remaining.toFixed(2)} €
              </span>{" "}
              à régler.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="bg-orange-50 border border-orange-100 p-3 rounded-md text-sm text-orange-800 my-4">
            Voulez-vous encaisser le reste ou autoriser le départ sans paiement
            ?
          </div>

          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row">
            <AlertDialogCancel onClick={() => setIsPaymentWarningOpen(false)}>
              Annuler
            </AlertDialogCancel>

            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => {
                setIsPaymentWarningOpen(false);
                setIsRecoveryDialogOpen(true);
              }}
            >
              Restituer sans solde
            </Button>

            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setIsPaymentWarningOpen(false);
                setIsPaymentFormVisible(true);
              }}
            >
              Encaisser le reste
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isRecoveryDialogOpen}
        onOpenChange={setIsRecoveryDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la récupération</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr que le client a récupéré son appareil ?
              <br />
              <br />
              Cette action déplacera la réparation vers les archives.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => onRestitute?.(repair)}>
              Confirmer la récupération
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StatusChangeDialog
        repair={repair}
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        onConfirm={handleStatusChange}
        currentUserName={currentUserName}
      />

      <ScheduleRepairDialog
        repair={repair}
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        onSchedule={handleSchedule}
      />
    </>
  );
}
