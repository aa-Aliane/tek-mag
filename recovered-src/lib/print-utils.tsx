import type { Repair } from "@/types";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function printRepairTicket(repair: Repair) {
  // Calculate payments
  const cardPayment = Number(repair.card_payment || 0);
  const cashPayment = Number(repair.cash_payment || 0);
  const totalPaid = cardPayment + cashPayment;
  const totalCost = (repair.totalCost !== undefined && repair.totalCost !== null && !isNaN(repair.totalCost)) 
    ? Number(repair.totalCost) 
    : (!isNaN(Number(repair.price)) && isFinite(Number(repair.price))) 
      ? Number(repair.price) 
      : 0;
  const remaining = totalCost - totalPaid;

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '';
      return format(dateObj, 'dd/MM/yyyy', { locale: fr });
    } catch {
      return '';
    }
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '';
      return format(dateObj, 'HH:mm', { locale: fr });
    } catch {
      return '';
    }
  };

  // Create the complete HTML document
  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bon de Réparation - ${repair.uid}</title>
  <style>
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      margin: 0;
      padding: 0.2in;
      max-width: 3.5in;
      background: white;
      color: black;
    }
    .container {
      max-width: 100%;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .business-info {
      font-size: 10px;
      margin-bottom: 5px;
    }
    .title {
      font-weight: bold;
      font-size: 16px;
      margin: 10px 0;
    }
    .section {
      margin-bottom: 15px;
    }
    .section-title {
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 5px;
    }
    .customer-info div, .repair-info div, .device-info div {
      margin: 2px 0;
    }
    .issues, .accessories, .security {
      padding: 5px;
      border: 1px solid #ccc;
      margin: 5px 0;
    }
    .cost-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    .cost-table td, .cost-table th {
      padding: 3px;
      border: 1px solid #000;
      font-size: 11px;
    }
    .payment-summary {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 5px;
      margin: 10px 0;
    }
    .payment-item {
      border: 1px solid #000;
      padding: 5px;
      text-align: center;
    }
    .conditions {
      font-size: 9px;
      margin: 15px 0;
    }
    .signature-section {
      margin-top: 20px;
    }
    .signature-line {
      border-bottom: 1px solid #000;
      padding: 20px 0 5px 0;
    }
    .footer {
      text-align: center;
      font-size: 9px;
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #000;
    }
    .divider {
      border-top: 1px dashed #666;
      margin: 15px 0;
      position: relative;
    }
    .divider::after {
      content: 'COUPER ICI';
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 0 5px;
      font-size: 9px;
      color: #666;
    }
    @page {
      size: 3.5in auto;
      margin: 0.2in;
    }
    @media print {
      body {
        padding: 0.1in;
        font-size: 11px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Top Section: Customer Copy -->
    <div class="header">
      <div class="business-name">REPAR'</div>
      <div class="business-info">Centre de réparation</div>
      <div class="business-info">123 Avenue Technologie, 75000 Paris</div>
      <div class="business-info">Tél: 01 23 45 67 89</div>
      <div class="title">BON DE RÉPARATION</div>
      <div>N° ${repair.uid}</div>
    </div>

    <div class="section customer-info">
      <div class="section-title">Client:</div>
      <div>${repair.client?.first_name} ${repair.client?.last_name}</div>
      <div>${repair.client?.profile?.phone_number || ''}</div>
      ${repair.client?.email ? `<div>${repair.client.email}</div>` : ''}
    </div>

    <div class="section device-info">
      <div class="section-title">Appareil:</div>
      <div>Type: ${repair.deviceType || 'N/A'}</div>
      <div>Marque: ${repair.brand || 'N/A'}</div>
      <div>Modèle: ${repair.model || 'N/A'}</div>
    </div>

    <div class="section issues">
      <div class="section-title">Panne(s):</div>
      <div>
        ${repair.issues && repair.issues.length > 0 
          ? repair.issues.slice(0, 3).join(', ') + (repair.issues.length > 3 ? '...' : '')
          : repair.issueDescription || 'Voir détails'}
      </div>
    </div>

    ${repair.accessories ? `
    <div class="section accessories">
      <div class="section-title">Accessoires:</div>
      <div>
        ${typeof repair.accessories === 'string' 
          ? repair.accessories.split(',').slice(0, 3).map(acc => acc.trim()).join(', ')
          : Array.isArray(repair.accessories) 
            ? repair.accessories.slice(0, 3).map(acc => typeof acc === 'string' ? acc.trim() : acc).join(', ')
            : ''}
      </div>
    </div>
    ` : ''}

    ${repair.password ? `
    <div class="section security">
      <div class="section-title">Sécurité:</div>
      <div>Code/PIN: ${repair.password}</div>
    </div>
    ` : ''}

    ${totalCost > 0 ? `
    <table class="cost-table">
      <thead>
        <tr>
          <th>Désignation</th>
          <th>Prix TTC</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Diagnostic & Réparation</td>
          <td style="text-align: right;">${totalCost.toFixed(2)} €</td>
        </tr>
        <tr>
          <td><strong>Total</strong></td>
          <td style="text-align: right;"><strong>${totalCost.toFixed(2)} €</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="payment-summary">
      <div class="payment-item">
        <div>CB</div>
        <div>${cardPayment.toFixed(2)} €</div>
      </div>
      <div class="payment-item">
        <div>Espèces</div>
        <div>${cashPayment.toFixed(2)} €</div>
      </div>
      <div class="payment-item" style="${remaining > 0 ? 'background: #ffebee;' : 'background: #e8f5e9;'}">
        <div>Reste</div>
        <div>${remaining.toFixed(2)} €</div>
      </div>
    </div>
    ` : ''}

    <div class="section repair-info">
      <div class="section-title">Réparation:</div>
      <div>Dépôt: ${formatDate(repair.created_at)} à ${formatTime(repair.created_at)}</div>
      ${repair.scheduledDate ? `<div>RDV: ${formatDate(repair.scheduledDate)}</div>` : ''}
    </div>

    <div class="signature-section">
      <div>Signature du client:</div>
      <div class="signature-line">&nbsp;</div>
    </div>

    <div class="footer">
      Conservez ce document jusqu'au retrait de votre appareil.<br/>
      Ce bon fait foi de réception de votre appareil en l'état.
    </div>

    <!-- Tear-off line -->
    <div class="divider"></div>

    <!-- Bottom Section: Shop Copy -->
    <div class="header">
      <div class="business-name">COPIE COMMERCIALE - REPAR'</div>
      <div class="title">RÉPARATION N° ${repair.uid}</div>
    </div>

    <div class="section customer-info">
      <div class="section-title">Client:</div>
      <div>${repair.client?.first_name} ${repair.client?.last_name}</div>
      <div>${repair.client?.profile?.phone_number || ''}</div>
    </div>

    <div class="section device-info">
      <div class="section-title">Appareil:</div>
      <div>${repair.deviceType || 'N/A'} - ${repair.brand || 'N/A'} ${repair.model || 'N/A'}</div>
    </div>

    <div class="section">
      <div class="section-title">Panne(s):</div>
      <div>
        ${repair.issues && repair.issues.length > 0 
          ? repair.issues.slice(0, 3).join(', ') + (repair.issues.length > 3 ? '...' : '')
          : 'Voir bon complet'}
      </div>
    </div>

    ${totalCost > 0 ? `
    <div class="payment-summary">
      <div class="payment-item">
        <div>Coût</div>
        <div>${totalCost.toFixed(2)} €</div>
      </div>
      <div class="payment-item">
        <div>Payé</div>
        <div>${totalPaid.toFixed(2)} €</div>
      </div>
      <div class="payment-item">
        <div>Reste</div>
        <div>${remaining.toFixed(2)} €</div>
      </div>
    </div>
    ` : ''}

    <div class="section repair-info">
      <div class="section-title">Info:</div>
      <div>Date: ${formatDate(repair.created_at)} ${formatTime(repair.created_at)}</div>
      ${repair.scheduledDate ? `<div>RDV: ${formatDate(repair.scheduledDate)}</div>` : ''}
      <div>Statut: ${repair.status || 'Saisie'}</div>
    </div>

    <div class="footer">
      Document à conserver pour suivi interne<br/>
      N°: ${repair.uid}
    </div>
  </div>
</body>
</html>`;

  // Create a new window with the HTML content
  const printWindow = window.open('', '_blank', 'width=400,height=800');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for the content to load and then print
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      // Optionally close the window after printing
      // printWindow.close();
    }, 250);
  }
}