"use client"

import type { Repair } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface RepairTicketProps {
  repair: Repair
}

export function RepairTicket({ repair }: RepairTicketProps) {
  const formatDate = (date: Date | string | undefined, formatStr: string) => {
    if (!date) return "N/A"
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return "N/A"
      return format(dateObj, formatStr, { locale: fr })
    } catch {
      return "N/A"
    }
  }

  const totalPaid = repair.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const remaining = (repair.totalCost || 0) - totalPaid

  return (
    <div className="repair-ticket">
      <div className="ticket-header">
        <h1>SMART DEVICE REPAIR</h1>
        <p>123 Rue de la Réparation</p>
        <p>75001 Paris</p>
        <p>Tél: 01 23 45 67 89</p>
        <p>Email: contact@smartrepair.fr</p>
      </div>

      <div className="ticket-divider">================================</div>

      <div className="ticket-section">
        <h2>FICHE DE RÉPARATION</h2>
        <p>
          <strong>N° {repair.id}</strong>
        </p>
        <p>Date: {formatDate(repair.created_at, "dd/MM/yyyy HH:mm")}</p>
      </div>

      <div className="ticket-divider">--------------------------------</div>

      <div className="ticket-section">
        <h3>CLIENT</h3>
        <p>
          {repair.client.first_name} {repair.client.last_name}
        </p>
        <p>Tél: {repair.client.profile?.phone_number || "N/A"}</p>
        {repair.client.email && <p>Email: {repair.client.email}</p>}
      </div>

      <div className="ticket-divider">--------------------------------</div>

      <div className="ticket-section">
        <h3>APPAREIL</h3>
        <p>
          Type: <span className="capitalize">{repair.deviceType}</span>
        </p>
        <p>Marque: {repair.brand}</p>
        <p>Modèle: {repair.model}</p>
      </div>

      <div className="ticket-divider">--------------------------------</div>

      <div className="ticket-section">
        <h3>RÉPARATION(S)</h3>
        {repair.issues.map((issue, idx) => (
          <p key={idx}>• {issue}</p>
        ))}
        {repair.issueDescription && (
          <>
            <p>
              <strong>Description:</strong>
            </p>
            <p className="description">{repair.issueDescription}</p>
          </>
        )}
      </div>

      {repair.accessories && repair.accessories.length > 0 && (
        <>
          <div className="ticket-divider">--------------------------------</div>
          <div className="ticket-section">
            <h3>ACCESSOIRES DÉPOSÉS</h3>
            {repair.accessories.map((acc, idx) => (
              <p key={idx}>• {acc}</p>
            ))}
          </div>
        </>
      )}

      {repair.password && (
        <>
          <div className="ticket-divider">--------------------------------</div>
          <div className="ticket-section">
            <h3>MOT DE PASSE</h3>
            <p className="password">{repair.password}</p>
          </div>
        </>
      )}

      <div className="ticket-divider">--------------------------------</div>

      <div className="ticket-section">
        <h3>TARIFICATION</h3>
        {repair.totalCost && (
          <>
            <p className="price-line">
              <span>Total:</span>
              <span>{repair.totalCost.toFixed(2)} €</span>
            </p>
            {totalPaid > 0 && (
              <>
                <p className="price-line">
                  <span>Acompte versé:</span>
                  <span>{totalPaid.toFixed(2)} €</span>
                </p>
                <p className="price-line total">
                  <span>
                    <strong>Reste à payer:</strong>
                  </span>
                  <span>
                    <strong>{remaining.toFixed(2)} €</strong>
                  </span>
                </p>
              </>
            )}
          </>
        )}
      </div>

      {repair.estimatedCompletion && (
        <>
          <div className="ticket-divider">--------------------------------</div>
          <div className="ticket-section">
            <h3>DATE DE RÉCUPÉRATION ESTIMÉE</h3>
            <p className="estimated-date">{formatDate(repair.estimatedCompletion, "dd/MM/yyyy")}</p>
          </div>
        </>
      )}

      <div className="ticket-divider">================================</div>

      <div className="ticket-footer">
        <p>
          <strong>CONDITIONS GÉNÉRALES</strong>
        </p>
        <p className="small">
          - Devis gratuit, réparation sous 48-72h
          <br />- Garantie 3 mois sur les pièces
          <br />- Appareil à récupérer sous 30 jours
          <br />- Paiement: CB, Espèces
        </p>
        <p className="small">Merci de votre confiance !</p>
      </div>

      <div className="ticket-divider">================================</div>

      <div className="ticket-barcode">
        <p>*** {repair.id} ***</p>
      </div>
    </div>
  )
}
