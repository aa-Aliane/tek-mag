"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Repair, PaymentMethod } from "@/types"
import { CreditCard, Banknote, Trash2, CheckCircle, Coins, Euro } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface PaymentSheetProps {
  repair: Repair | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddPayment?: (repair: Repair, amount: number, method: PaymentMethod, note?: string) => void
  onDeletePayment?: (repair: Repair, paymentId: string) => void
}

export function PaymentSheet({ repair, open, onOpenChange, onAddPayment, onDeletePayment }: PaymentSheetProps) {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [note, setNote] = useState("")

  if (!repair) return null

  const totalCost = (repair.totalCost !== undefined && repair.totalCost !== null && !isNaN(repair.totalCost)) ?
                   Number(repair.totalCost) :
                   (!isNaN(Number(repair.price)) && isFinite(Number(repair.price))) ?
                   Number(repair.price) : 0
  const cardPayment = Number(repair.card_payment || 0);
  const cashPayment = Number(repair.cash_payment || 0);
  const totalPaid = cardPayment + cashPayment;
  const remaining = totalCost - totalPaid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const paymentAmount = Number(parseFloat(amount) || 0)
    if (paymentAmount > 0 && paymentAmount <= remaining && onAddPayment) {
      onAddPayment(repair, paymentAmount, method, note || undefined)
      setAmount("")
      setNote("")
      setMethod("cash")
    }
  }

  const getPaymentStatusBadge = () => {
    if (totalPaid === 0) {
      return <Badge variant="destructive">Non payé</Badge>
    } else if (totalPaid < totalCost) {
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Partiel</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Payé</Badge>
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Coins className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">Gestion des paiements</SheetTitle>
              <SheetDescription className="text-sm mt-1">
                Réparation #{repair.id} - {repair.brand} {repair.model}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Payment Summary Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Statut du paiement</h3>
              {getPaymentStatusBadge()}
            </div>

            <div className="space-y-4">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Payé: {totalPaid.toFixed(2)} €</span>
                  <span>Reste: {remaining.toFixed(2)} €</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${Math.min(100, (totalPaid / totalCost) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Financial summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="font-bold text-xl text-gray-800">{totalCost.toFixed(2)} €</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div className="text-sm text-gray-500">Payé</div>
                  <div className="font-bold text-xl text-green-600">{totalPaid.toFixed(2)} €</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div className="text-sm text-gray-500">Reste</div>
                  <div className="font-bold text-xl text-red-500">{remaining.toFixed(2)} €</div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Payment Form */}
          {remaining > 0 && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Euro className="h-5 w-5 text-blue-600" />
                Enregistrer un paiement
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-700">
                    Montant à payer (max: {remaining.toFixed(2)} €)
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={remaining}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
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
                    value={method}
                    onValueChange={(value) => setMethod(value as PaymentMethod)}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        method === 'cash'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                      <div className="p-3 bg-yellow-100 rounded-lg peer-data-[state=checked]:bg-yellow-200">
                        <Banknote className="h-5 w-5 text-yellow-700" />
                      </div>
                      <label
                        htmlFor="cash"
                        className="text-sm font-medium peer-data-[state=checked]:font-bold flex-1 text-center"
                      >
                        Espèces
                      </label>
                    </div>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        method === 'card'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="card" id="card" className="peer sr-only" />
                      <div className="p-3 bg-blue-100 rounded-lg peer-data-[state=checked]:bg-blue-200">
                        <CreditCard className="h-5 w-5 text-blue-700" />
                      </div>
                      <label
                        htmlFor="card"
                        className="text-sm font-medium peer-data-[state=checked]:font-bold flex-1 text-center"
                      >
                        Carte
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note" className="text-gray-700">Note (facultatif)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ajouter une note au paiement..."
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <SheetFooter className="mt-4">
                  <Button type="submit" className="w-full py-6 text-lg font-semibold">
                    Enregistrer le paiement de {amount ? parseFloat(amount).toFixed(2) : '0.00'} €
                  </Button>
                </SheetFooter>
              </form>
            </div>
          )}

          {/* Full Payment Confirmation */}
          {remaining === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-1">Paiement complet</h3>
              <p className="text-green-600">La réparation a été entièrement payée</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
