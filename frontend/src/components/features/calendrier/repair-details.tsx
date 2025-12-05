"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusChangeDialog, PaymentSheet } from "@/components/features/commands"
import { ScheduleRepairDialog } from "@/components/features/calendrier"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Repair, RepairStatus, RepairOutcome, PaymentMethod } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Calendar,
  User,
  Smartphone,
  Wrench,
  Package,
  Lock,
  FileText,
  Edit,
  ArrowUpDown,
  CalendarClock,
  Wallet,
  CheckCircle,
  Printer,
  X,
  Clock,
  Euro,
  CreditCard,
  Banknote,
  ArrowLeft
} from "lucide-react"
import { printRepairTicket } from "@/lib/print-utils"

interface RepairDetailsProps {
  repair: Repair | null
  onClose: () => void
  onEdit?: (repair: Repair) => void
  onStatusChange?: (
    repair: Repair,
    newStatus: RepairStatus,
    comment: string,
    notifyClient: boolean,
    outcome?: RepairOutcome,
  ) => void
  onSchedule?: (repair: Repair, date: Date) => void
  onAddPayment?: (repair: Repair, amount: number, method: PaymentMethod, note?: string) => void
  onDeletePayment?: (repair: Repair, paymentId: string) => void
  onMarkRecovered?: (repair: Repair) => void
  currentUserName: string
}

const statusConfig = {
  saisie: { label: "Saisie", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  "en-cours": { label: "En cours", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  prete: { label: "Prête", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  "en-attente": {
    label: "En attente",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
}

export function RepairDetails({
  repair,
  onClose,
  onEdit,
  onStatusChange,
  onSchedule,
  onAddPayment,
  onDeletePayment,
  onMarkRecovered,
  currentUserName,
}: RepairDetailsProps) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isPaymentFormVisible, setIsPaymentFormVisible] = useState(false) // Changed from dialog to inline form
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false)
  const [isPaymentWarningOpen, setIsPaymentWarningOpen] = useState(false)

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [paymentNote, setPaymentNote] = useState("")

  // Reset payment form when repair changes (when new payment data arrives from parent)
  useEffect(() => {
    // Reset form states when repair data changes to ensure clean state
    setPaymentAmount("");
    setPaymentNote("");
    setPaymentMethod("cash");
  }, [repair]);

  if (!repair) return null

  const formatDate = (date: Date | string | undefined, formatStr: string) => {
    if (!date) return null
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return null
      return format(dateObj, formatStr, { locale: fr })
    } catch {
      return null
    }
  }

  const handleStatusChange = (
    newStatus: RepairStatus,
    comment: string,
    notifyClient: boolean,
    outcome?: RepairOutcome,
  ) => {
    if (onStatusChange) {
      onStatusChange(repair, newStatus, comment, notifyClient, outcome)
    }
    setIsStatusDialogOpen(false)
  }

  const handleSchedule = (repair: Repair, date: Date) => {
    if (onSchedule) {
      onSchedule(repair, date)
    }
    setIsScheduleDialogOpen(false)
  }

  // Calculate payments using string values from API
  const cardPayment = Number(repair.card_payment || 0);
  const cashPayment = Number(repair.cash_payment || 0);
  const totalPaid = cardPayment + cashPayment;
  const totalCostValue = (repair.totalCost !== undefined && repair.totalCost !== null && !isNaN(repair.totalCost)) ?
                         Number(repair.totalCost) :
                         (!isNaN(Number(repair.price)) && isFinite(Number(repair.price))) ?
                         Number(repair.price) : 0;
  const remaining = totalCostValue - totalPaid;
  const isPaymentComplete = remaining <= 0;

  const handleRecoveryClick = () => {
    if (!isPaymentComplete && totalCostValue > 0) {
      setIsPaymentWarningOpen(true)
    } else {
      setIsRecoveryDialogOpen(true)
    }
  }

  const handleConfirmRecovery = () => {
    if (onMarkRecovered) {
      onMarkRecovered(repair)
    }
    setIsRecoveryDialogOpen(false)
    onClose()
  }

  const handlePrint = () => {
    printRepairTicket(repair)
  }

  return (
    <>
      <div className="h-full flex flex-col bg-background border-l shadow-sm">
        {/* Header */}
        <div className="border-b bg-muted/30 px-6 py-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">Réparation #{repair.id}</h2>
                {repair.status && (
                  <Badge className={statusConfig[repair.status].className}>
                    {statusConfig[repair.status].label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Créée le {formatDate(repair.created_at, "dd MMMM yyyy")}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            
            {repair.status === "prete" && onMarkRecovered && (
              <Button
                variant={isPaymentComplete ? "default" : "outline"}
                size="sm"
                onClick={handleRecoveryClick}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marquer récupéré
              </Button>
            )}
            
            {totalCostValue > 0 ? (
              <Button
                variant={remaining > 0 ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPaymentFormVisible(true)}
              >
                <Wallet className="h-4 w-4 mr-2" />
                {remaining > 0 ? `${remaining.toFixed(2)} €` : "Payé"}
              </Button>
            ) : null}

            {onSchedule && (
              <Button variant="outline" size="sm" onClick={() => setIsScheduleDialogOpen(true)}>
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
            
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(repair)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={() => setIsStatusDialogOpen(true)}>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Changer statut
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Device Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Appareil</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{repair.deviceType || 'Non spécifié'}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Marque</span>
                  <span className="font-medium">{repair.brand || 'Non spécifié'}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Modèle</span>
                  <span className="font-medium">{repair.model || 'Non spécifié'}</span>
                </div>
              </div>
            </div>

            {/* Issues & Cost */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Panne(s) & Tarification</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {repair.issues?.map((issue, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm">
                      {issue}
                    </Badge>
                  ))}
                </div>
                
                {repair.issueDescription && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm font-medium mb-1 text-muted-foreground">Description détaillée</p>
                    <p className="text-sm">{repair.issueDescription}</p>
                  </div>
                )}
                
                {(totalCostValue > 0 || cardPayment > 0 || cashPayment > 0) && (
                  <div className="space-y-3">
                    {totalCostValue > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-700">Coût total</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {totalCostValue.toFixed(2)} €
                          </span>
                        </div>

                        {/* Progress bar showing payment progress */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Payé: {totalPaid.toFixed(2)} €</span>
                            <span>Reste: {remaining.toFixed(2)} €</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                              style={{ width: `${Math.min(100, (totalPaid / totalCostValue) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {(cardPayment > 0 || cashPayment > 0) && (
                      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-green-600" />
                          Paiements reçus
                        </h4>

                        <div className="space-y-3">
                          {cardPayment > 0 && (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <CreditCard className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-700">Carte bancaire</div>
                                  <div className="text-xs text-gray-500">Paiement enregistré</div>
                                </div>
                              </div>
                              <span className="font-bold text-green-600">
                                {cardPayment.toFixed(2)} €
                              </span>
                            </div>
                          )}

                          {cashPayment > 0 && (
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <Banknote className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-700">Espèces</div>
                                  <div className="text-xs text-gray-500">Paiement enregistré</div>
                                </div>
                              </div>
                              <span className="font-bold text-green-600">
                                {cashPayment.toFixed(2)} €
                              </span>
                            </div>
                          )}

                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Total payé</span>
                              <span className="text-lg font-bold text-green-600">
                                {totalPaid.toFixed(2)} €
                              </span>
                            </div>

                            {remaining > 0 ? (
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm font-medium text-gray-600">Reste à payer</span>
                                <span className="text-lg font-bold text-red-500">
                                  {remaining.toFixed(2)} €
                                </span>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm font-medium text-gray-600">Status</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Entièrement payé
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Client Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Client</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Nom</span>
                  <span className="font-medium">
                    {repair.client?.first_name || ''} {repair.client?.last_name || ''}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Téléphone</span>
                  <span className="font-medium">
                    {repair.client?.profile?.phone_number || "Pas de numéro"}
                  </span>
                </div>
                {repair.client?.email && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="font-medium text-sm">{repair.client.email}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {(repair.accessories?.length || repair.password || repair.depositStatus) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Informations complémentaires</h3>
                </div>
                <div className="space-y-3">
                  {repair.accessories && (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">Accessoires déposés</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {typeof repair.accessories === 'string'
                          ? repair.accessories.split(',').map((acc, idx) => {
                              const item = acc.trim();
                              return item ? (
                                <Badge key={idx} variant="outline">
                                  {item}
                                </Badge>
                              ) : null;
                            }).filter(Boolean)
                          : Array.isArray(repair.accessories)
                            ? repair.accessories.map((acc, idx) => {
                                const item = typeof acc === 'string' ? acc.trim() : acc;
                                return item ? (
                                  <Badge key={idx} variant="outline">
                                    {item}
                                  </Badge>
                                ) : null;
                              }).filter(Boolean)
                            : null
                        }
                      </div>
                    </div>
                  )}

                  {repair.password && repair.password.trim() && (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">Mot de passe</span>
                      </div>
                      <code className="text-sm bg-background px-3 py-1.5 rounded border">
                        {repair.password}
                      </code>
                    </div>
                  )}

                  {repair.depositStatus && (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Statut de dépôt</span>
                        <Badge variant={repair.depositStatus === "deposited" ? "default" : "secondary"}>
                          {repair.depositStatus === "deposited" ? "Déposé" : "Programmé"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dates */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Calendrier</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                {formatDate(repair.created_at, "dd MMMM yyyy") && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Créée le</span>
                      <span className="font-medium text-sm">
                        {formatDate(repair.created_at, "dd MMMM yyyy")}
                      </span>
                    </div>
                    <Separator />
                  </>
                )}
                {repair.scheduledDate && formatDate(repair.scheduledDate, "dd MMMM yyyy") && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Programmée le</span>
                      <span className="font-medium text-sm">
                        {formatDate(repair.scheduledDate, "dd MMMM yyyy")}
                      </span>
                    </div>
                    <Separator />
                  </>
                )}
                {repair.estimatedCompletion && formatDate(repair.estimatedCompletion, "dd MMMM yyyy") && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fin estimée</span>
                      <span className="font-medium text-sm">
                        {formatDate(repair.estimatedCompletion, "dd MMMM yyyy")}
                      </span>
                    </div>
                    <Separator />
                  </>
                )}
                {repair.completedAt && formatDate(repair.completedAt, "dd MMMM yyyy") && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Terminée le</span>
                    <span className="font-medium text-sm">
                      {formatDate(repair.completedAt, "dd MMMM yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {repair.notes && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Notes</h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">{repair.notes}</p>
                </div>
              </div>
            )}

            {/* Status History */}
            {repair.statusHistory && repair.statusHistory.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Historique des changements</h3>
                <div className="space-y-3">
                  {repair.statusHistory.map((change) => (
                    <div key={change.id} className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {statusConfig[change.from].label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">→</span>
                          <Badge variant="outline" className="text-xs">
                            {statusConfig[change.to].label}
                          </Badge>
                        </div>
                        {formatDate(change.changedAt, "dd/MM/yyyy HH:mm") && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(change.changedAt, "dd/MM/yyyy HH:mm")}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Par {change.changedBy}
                        {change.clientNotified && " • Client notifié"}
                      </div>
                      {change.comment && (
                        <p className="text-sm mt-2 pt-2 border-t">{change.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Form Inline */}
      {isPaymentFormVisible && (
        <div className="absolute inset-0 bg-white z-10 flex flex-col">
          {/* Payment Form Header */}
          <div className="border-b bg-muted/30 px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">Ajouter un paiement</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Réparation #{repair.id} - {repair.brand} {repair.model}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPaymentFormVisible(false)}
                className="shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Payment Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Payment Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">Coût total</span>
                <span className="text-2xl font-bold text-blue-600">
                  {totalCostValue.toFixed(2)} €
                </span>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Payé: {totalPaid.toFixed(2)} €</span>
                  <span>Reste: {remaining.toFixed(2)} €</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${Math.min(100, (totalPaid / totalCostValue) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Euro className="h-5 w-5 text-blue-600" />
                Détails du paiement
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount" className="text-gray-700">
                    Montant à payer (max: {remaining.toFixed(2)} €)
                  </Label>
                  <div className="relative">
                    <Input
                      id="paymentAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={remaining}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-10 pr-4 py-3 text-lg"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Euro className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-700">Mode de paiement</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        paymentMethod === 'cash'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="cash" id="pay_cash" className="peer sr-only" />
                      <div className="p-3 bg-yellow-100 rounded-lg peer-data-[state=checked]:bg-yellow-200">
                        <Banknote className="h-5 w-5 text-yellow-700" />
                      </div>
                      <label
                        htmlFor="pay_cash"
                        className="text-sm font-medium peer-data-[state=checked]:font-bold flex-1 text-center"
                      >
                        Espèces
                      </label>
                    </div>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="card" id="pay_card" className="peer sr-only" />
                      <div className="p-3 bg-blue-100 rounded-lg peer-data-[state=checked]:bg-blue-200">
                        <CreditCard className="h-5 w-5 text-blue-700" />
                      </div>
                      <label
                        htmlFor="pay_card"
                        className="text-sm font-medium peer-data-[state=checked]:font-bold flex-1 text-center"
                      >
                        Carte
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentNote" className="text-gray-700">Note (facultatif)</Label>
                  <Textarea
                    id="paymentNote"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Ajouter une note au paiement..."
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPaymentFormVisible(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const parsedAmount = parseFloat(paymentAmount || '0');

                      if (!isNaN(parsedAmount) && parsedAmount > 0 && onAddPayment && parsedAmount <= remaining + 0.01) { // Small tolerance for floating point precision
                        onAddPayment(repair, parsedAmount, paymentMethod, paymentNote || undefined);
                        setPaymentAmount("");
                        setPaymentNote("");
                        setIsPaymentFormVisible(false); // Close form after successful payment
                      }
                    }}
                    disabled={!(paymentAmount && !isNaN(parseFloat(paymentAmount)) && parseFloat(paymentAmount) > 0 && parseFloat(paymentAmount) <= remaining + 0.01)}
                  >
                    Enregistrer {paymentAmount ? parseFloat(paymentAmount).toFixed(2) : '0.00'} €
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AlertDialog open={isPaymentWarningOpen} onOpenChange={setIsPaymentWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Paiement incomplet</AlertDialogTitle>
            <AlertDialogDescription>
              Le client n'a pas encore payé la totalité de la réparation. Il reste {remaining.toFixed(2)} € à payer.
              <br />
              <br />
              Voulez-vous enregistrer un paiement maintenant ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsPaymentWarningOpen(false)
                setIsPaymentDialogOpen(true)
              }}
            >
              Enregistrer un paiement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRecoveryDialogOpen} onOpenChange={setIsRecoveryDialogOpen}>
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
            <AlertDialogAction onClick={handleConfirmRecovery}>Confirmer la récupération</AlertDialogAction>
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
  )
}
