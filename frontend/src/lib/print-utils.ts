import { Repair } from '@/types';
import { RepairTicketPrint } from '@/templates/repair-ticket-print';

/**
 * Prints a repair ticket using a temporary iframe
 * @param repair The repair object to print
 */
export const printRepairTicket = (repair: Repair) => {
  // Create a temporary iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.zIndex = '-1';
  
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (iframeDoc) {
    // Write the print template to the iframe
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Repair Ticket</title>
          <style>
            ${generateStyles()}
          </style>
        </head>
        <body>
          <div id="ticket-content"></div>
          <script>
            // Wait for the content to be injected and then print
            setTimeout(() => {
              window.print();
              // Remove the iframe after printing
              setTimeout(() => {
                const iframe = document.querySelector('iframe');
                if (iframe) {
                  iframe.parentNode.removeChild(iframe);
                }
              }, 1000);
            }, 500);
          </script>
        </body>
      </html>
    `);
    
    iframeDoc.close();
    
    // Inject the repair ticket content after the document is loaded
    setTimeout(() => {
      const container = iframeDoc.getElementById('ticket-content');
      if (container) {
        // Create a temporary container to render the component
        const tempDiv = document.createElement('div');
        document.body.appendChild(tempDiv);
        
        // Render the repair ticket component
        const ticketHtml = renderRepairTicketToString(repair);
        container.innerHTML = ticketHtml;
        
        // Clean up the temporary container
        document.body.removeChild(tempDiv);
      }
    }, 100);
  }
};

// Helper function to generate the required styles
const generateStyles = (): string => {
  return `
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        margin: 0;
        padding: 0;
      }

      .print-container {
        margin: 0;
        padding: 0.25in;
        box-shadow: none;
        background: white;
        color: black;
        font-size: 12px;
      }

      .thermal-paper {
        max-width: 4in; /* Standard thermal paper width */
        width: 100%;
        margin: 0 auto;
      }

      .page-break {
        page-break-before: always;
      }

      /* Force black and white printing */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }

    @media screen {
      .print-container {
        max-width: 3.5in; /* Close to thermal paper width */
        margin: 20px auto;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        background: #f8fafc;
        font-family: 'Courier New', monospace; /* Close to thermal printer fonts */
      }
    }
    
    .max-w-xs {
      max-width: 24rem;
    }
    
    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }
    
    .bg-white {
      background-color: #fff;
    }
    
    .text-gray-800 {
      color: #1f2937;
    }
    
    .font-sans {
      font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    }
    
    .text-sm {
      font-size: 0.875rem;
      line-height: 1rem;
    }
    
    .border-b-2 {
      border-bottom-width: 2px;
    }
    
    .border-gray-800 {
      border-color: #1f2937;
    }
    
    .p-2 {
      padding: 0.5rem;
    }
    
    .text-center {
      text-align: center;
    }
    
    .mb-2 {
      margin-bottom: 0.5rem;
    }
    
    .text-lg {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }
    
    .font-bold {
      font-weight: 700;
    }
    
    .text-xs {
      font-size: 0.75rem;
      line-height: 1rem;
    }
    
    .border-t {
      border-top-width: 1px;
    }
    
    .border-b {
      border-bottom-width: 1px;
    }
    
    .py-1 {
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }
    
    .my-2 {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .font-bold {
      font-weight: 700;
    }
    
    .mb-1 {
      margin-bottom: 0.25rem;
    }
    
    .mt-2 {
      margin-top: 0.5rem;
    }
    
    .flex {
      display: flex;
    }
    
    .justify-between {
      justify-content: space-between;
    }
    
    .items-center {
      align-items: center;
    }
    
    .border-dashed {
      border-style: dashed;
    }
    
    .border-gray-400 {
      border-color: #9ca3af;
    }
    
    .w-3\/4 {
      width: 75%;
    }
    
    .justify-center {
      justify-content: center;
    }
    
    .my-1 {
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
    }
    
    .pt-2 {
      padding-top: 0.5rem;
    }
    
    .border-y {
      border-top-width: 1px;
      border-bottom-width: 1px;
    }
    
    .py-2 {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    
    .text-center {
      text-align: center;
    }
    
    .border-t {
      border-top-width: 1px;
    }
    
    .pt-2 {
      padding-top: 0.5rem;
    }
    
    .box-border {
      box-sizing: border-box;
    }
  `;
};

// Helper function to render the repair ticket to a string
// Note: This is a simplified version - in a real implementation you'd want to use a proper renderer
const renderRepairTicketToString = (repair: Repair): string => {
  // This is a simplified HTML representation of the repair ticket
  // In a real implementation, you'd want to use a proper JSX-to-string renderer
  return `
    <div class="print-container thermal-paper">
      <div class="max-w-xs mx-auto bg-white text-gray-800 font-sans text-sm">
        <!-- Top Part - Customer Copy -->
        <div class="border-b-2 border-gray-800 p-2">
          <div class="text-center mb-2">
            <div class="text-lg font-bold">REPAR'</div>
            <div class="text-xs">Centre de réparation</div>
            <div class="text-xs">123 Avenue Technologie</div>
            <div class="text-xs">75000 Paris - Tél: 01 23 45 67 89</div>
          </div>

          <div class="text-center border-t border-b py-1 my-2">
            <div class="font-bold text-lg">BON DE RÉPARATION</div>
            <div class="text-xs">N° ${repair.uid || repair.id}</div>
          </div>

          <div class="my-2">
            <div class="font-bold mb-1">Client:</div>
            <div>${repair.client?.first_name || ''} ${repair.client?.last_name || ''}</div>
            <div>${repair.client?.profile?.phone_number || ''}</div>

            <div class="font-bold mb-1 mt-2">Appareil:</div>
            <div>${repair.deviceType || ''} - ${repair.brand || ''} ${repair.model || ''}</div>

            <div class="font-bold mb-1 mt-2">Panne(s):</div>
            <div>
              ${repair.issues && repair.issues.length > 0
                ? repair.issues.slice(0, 2).join(', ') + (repair.issues.length > 2 ? '...' : '')
                : repair.issueDescription || 'Voir détails'}
            </div>

            ${repair.accessories ? `
            <div class="font-bold mb-1 mt-2">Accessoires:</div>
            <div>
              ${typeof repair.accessories === 'string'
                ? repair.accessories.split(',').slice(0, 3).map(acc => acc.trim()).join(', ')
                : Array.isArray(repair.accessories)
                  ? repair.accessories.slice(0, 3).map(acc => typeof acc === 'string' ? acc.trim() : acc).join(', ')
                  : ''
              }
            </div>` : ''}
          </div>

          <div class="my-2">
            <div class="font-bold mb-1">Coût estimé:</div>
            <div class="flex justify-between">
              <span>Montant:</span>
              <span>${calculateTotalCost(repair).toFixed(2)} €</span>
            </div>
            <div class="flex justify-between">
              <span>Payé:</span>
              <span>${calculateTotalPaid(repair).toFixed(2)} €</span>
            </div>
            <div class="flex justify-between">
              <span>Reste:</span>
              <span>${calculateRemaining(repair).toFixed(2)} €</span>
            </div>
          </div>

          <div class="text-center my-2 font-bold">
            Date dépot: ${formatDate(repair.created_at)}<br/>
            RDV: ${repair.scheduledDate ? formatDate(repair.scheduledDate) : 'À fixer'}
          </div>

          <div class="text-xs text-center my-2 border-t pt-2">
            Signature: _________________
          </div>

          <div class="text-xs text-center py-2 border-y">
            Veuillez conserver ce document
          </div>
        </div>

        <!-- Tear-off line -->
        <div class="flex justify-center my-1">
          <div class="border-t border-dashed border-gray-400 w-3/4"></div>
        </div>

        <!-- Bottom Part - Shop Copy -->
        <div class="p-2">
          <div class="text-center mb-2">
            <div class="text-lg font-bold">REPAR'</div>
            <div class="text-xs">Copie Commerciale</div>
          </div>

          <div class="text-center border-t border-b py-1 my-2">
            <div class="font-bold">RÉPARATION N° ${repair.uid || repair.id}</div>
          </div>

          <div class="my-1">
            <div class="font-bold text-xs">CLIENT:</div>
            <div>${repair.client?.first_name || ''} ${repair.client?.last_name || ''}</div>
            <div>${repair.client?.profile?.phone_number || ''}</div>

            <div class="font-bold text-xs mt-2">APPAREIL:</div>
            <div>${repair.deviceType || ''} - ${repair.brand || ''} ${repair.model || ''}</div>

            <div class="font-bold text-xs mt-2">PANNE(S):</div>
            <div>
              ${repair.issues && repair.issues.length > 0
                ? repair.issues.slice(0, 3).join(', ') + (repair.issues.length > 3 ? '...' : '')
                : 'Voir bon complet'}
            </div>
          </div>

          <div class="my-2">
            <div class="flex justify-between text-xs">
              <span>Coût:</span>
              <span>${calculateTotalCost(repair).toFixed(2)} €</span>
            </div>
            <div class="flex justify-between text-xs">
              <span>Payé:</span>
              <span>${calculateTotalPaid(repair).toFixed(2)} €</span>
            </div>
            <div class="flex justify-between text-xs">
              <span>Reste:</span>
              <span>${calculateRemaining(repair).toFixed(2)} €</span>
            </div>
          </div>

          <div class="text-xs my-2">
            <div>Date: ${formatDate(repair.created_at)} ${formatTime(repair.created_at)}</div>
            ${repair.scheduledDate ? `<div>RDV: ${formatDate(repair.scheduledDate)}</div>` : ''}
            <div>Statut: ${repair.status || 'Saisie'}</div>
          </div>

          <div class="text-xs text-center my-2">
            QR Code ou code barres pour suivi interne<br/>
            [${(repair.uid || repair.id || '').toString().replace(/[^A-Z0-9]/gi, '')}]
          </div>

          <div class="text-xs text-center border-t pt-2">
            Document à conserver aux fins de suivi interne
          </div>
        </div>
      </div>
    </div>
  `;
};

// Helper functions for calculations
const calculateTotalCost = (repair: Repair): number => {
  const totalCost = (repair.totalCost !== undefined && repair.totalCost !== null && !isNaN(Number(repair.totalCost)))
    ? Number(repair.totalCost)
    : (!isNaN(Number(repair.price)) && isFinite(Number(repair.price)))
      ? Number(repair.price)
      : 0;
  return totalCost;
};

const calculateTotalPaid = (repair: Repair): number => {
  const cardPayment = Number(repair.card_payment || 0);
  const cashPayment = Number(repair.cash_payment || 0);
  return cardPayment + cashPayment;
};

const calculateRemaining = (repair: Repair): number => {
  return calculateTotalCost(repair) - calculateTotalPaid(repair);
};

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString('fr-FR');
  } catch {
    return '';
  }
};

const formatTime = (date: Date | string | undefined): string => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};