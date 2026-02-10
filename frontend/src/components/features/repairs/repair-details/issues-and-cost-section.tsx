"use client";

import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Wallet,
  CreditCard,
  Banknote,
  CheckCircle,
} from "lucide-react";
import type { IssuesAndCostSectionProps } from "./types";

export function IssuesAndCostSection({
  repair,
  basePrice,
  totalPaid,
  remaining,
  cardPayment,
  cashPayment,
}: IssuesAndCostSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Wrench className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Panne(s) & Tarification</h3>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {repair.repair_issues?.map((repairIssue, idx) => (
            <Badge key={idx} variant="secondary" className="text-sm">
              {repairIssue.issue?.name || `Issue #${repairIssue.issue_id}`}
            </Badge>
          ))}
        </div>

        {repair.description && (
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm font-medium mb-1 text-muted-foreground">
              Description détaillée
            </p>
            <p className="text-sm">{repair.description}</p>
          </div>
        )}

        {basePrice > 0 && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">Coût total</span>
                <span className="text-2xl font-bold text-blue-600">
                  {Number(basePrice).toFixed(2)} €
                </span>
              </div>

              {/* Show discounts if any */}
              {repair.total_discounts > 0 && (
                <div className="flex justify-between text-sm text-orange-600 mb-2">
                  <span>Remises</span>
                  <span>-{repair.total_discounts} €</span>
                </div>
              )}

              {/* Show final price */}
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-600">Prix final</span>
                <span className="text-xl font-bold text-green-600">
                  {Number(repair.final_price || basePrice).toFixed(2)} €
                </span>
              </div>

              {/* Progress bar showing payment progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>
                    Payé: {Number(repair.total_paid || totalPaid).toFixed(2)} €
                  </span>
                  <span>
                    Reste:{" "}
                    {Number(repair.remaining_balance || remaining).toFixed(2)} €
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                    style={{
                      width: `${Math.min(100, (totalPaid / basePrice) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

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
                          <div className="font-medium text-gray-700">
                            Carte bancaire
                          </div>
                          <div className="text-xs text-gray-500">
                            Paiement enregistré
                          </div>
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
                          <div className="font-medium text-gray-700">
                            Espèces
                          </div>
                          <div className="text-xs text-gray-500">
                            Paiement enregistré
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">
                        {cashPayment.toFixed(2)} €
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Total payé
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {Number(totalPaid).toFixed(2)} €
                      </span>
                    </div>

                    {remaining > 0 ? (
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-gray-600">
                          Reste à payer
                        </span>
                        <span className="text-lg font-bold text-red-500">
                          {Number(remaining).toFixed(2)} €
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-gray-600">
                          Status
                        </span>
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
  );
}
