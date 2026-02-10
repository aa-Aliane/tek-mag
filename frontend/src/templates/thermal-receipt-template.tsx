import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Repair } from '@/types';

interface ThermalReceiptTemplateProps {
  repair: Repair;
}

export const ThermalReceiptTemplate = ({ repair }: ThermalReceiptTemplateProps) => {
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

  return (
    <div className="max-w-xs mx-auto bg-white text-gray-800 font-sans text-sm">
      {/* Top Part - Customer Copy */}
      <div className="border-b-2 border-gray-800 p-2">
        <div className="text-center mb-2">
          <div className="text-lg font-bold">REPAR'</div>
          <div className="text-xs">Centre de réparation</div>
          <div className="text-xs">123 Avenue Technologie</div>
          <div className="text-xs">75000 Paris - Tél: 01 23 45 67 89</div>
        </div>
        
        <div className="text-center border-t border-b py-1 my-2">
          <div className="font-bold text-lg">BON DE RÉPARATION</div>
          <div className="text-xs">N° {repair.uid}</div>
        </div>

        <div className="my-2">
          <div className="font-bold mb-1">Client:</div>
          <div>{repair.client?.first_name} {repair.client?.last_name}</div>
          <div>{repair.client?.profile?.phone_number || ''}</div>
          
          <div className="font-bold mb-1 mt-2">Appareil:</div>
          <div>{repair.deviceType} - {repair.brand} {repair.model}</div>
          
          <div className="font-bold mb-1 mt-2">Panne(s):</div>
          <div>
            {repair.issues && repair.issues.length > 0 
              ? repair.issues.slice(0, 2).join(', ') + (repair.issues.length > 2 ? '...' : '')
              : repair.issueDescription || 'Voir détails'}
          </div>

          {repair.accessories && (
            <>
              <div className="font-bold mb-1 mt-2">Accessoires:</div>
              <div>
                {typeof repair.accessories === 'string' 
                  ? repair.accessories.split(',').slice(0, 3).map(acc => acc.trim()).join(', ')
                  : Array.isArray(repair.accessories) 
                    ? repair.accessories.slice(0, 3).map(acc => typeof acc === 'string' ? acc.trim() : acc).join(', ')
                    : ''
                }
              </div>
            </>
          )}
        </div>

        <div className="my-2">
          <div className="font-bold mb-1">Coût estimé:</div>
          <div className="flex justify-between">
            <span>Montant:</span>
            <span>{totalCost.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span>Payé:</span>
            <span>{totalPaid.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span>Reste:</span>
            <span>{remaining.toFixed(2)} €</span>
          </div>
        </div>

        <div className="text-center my-2 font-bold">
          Date dépot: {formatDate(repair.created_at)}<br/>
          RDV: {repair.scheduledDate ? formatDate(repair.scheduledDate) : 'À fixer'}
        </div>

        <div className="text-xs text-center my-2 border-t pt-2">
          Signature: _________________
        </div>
        
        <div className="text-xs text-center py-2 border-y">
          Veuillez conserver ce document
        </div>
      </div>

      {/* Tear-off line - represented visually for digital */}
      <div className="flex justify-center my-1">
        <div className="border-t border-dashed border-gray-400 w-3/4"></div>
      </div>

      {/* Bottom Part - Shop Copy */}
      <div className="p-2">
        <div className="text-center mb-2">
          <div className="text-lg font-bold">REPAR'</div>
          <div className="text-xs">Copie Commerciale</div>
        </div>
        
        <div className="text-center border-t border-b py-1 my-2">
          <div className="font-bold">RÉPARATION N° {repair.uid}</div>
        </div>

        <div className="my-1">
          <div className="font-bold text-xs">CLIENT:</div>
          <div>{repair.client?.first_name} {repair.client?.last_name}</div>
          <div>{repair.client?.profile?.phone_number || ''}</div>

          <div className="font-bold text-xs mt-2">APPAREIL:</div>
          <div>{repair.deviceType} - {repair.brand} {repair.model}</div>
          
          <div className="font-bold text-xs mt-2">PANNE(S):</div>
          <div>
            {repair.issues && repair.issues.length > 0 
              ? repair.issues.slice(0, 3).join(', ') + (repair.issues.length > 3 ? '...' : '')
              : 'Voir bon complet'}
          </div>
        </div>

        <div className="my-2">
          <div className="flex justify-between text-xs">
            <span>Coût:</span>
            <span>{totalCost.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Payé:</span>
            <span>{totalPaid.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Reste:</span>
            <span>{remaining.toFixed(2)} €</span>
          </div>
        </div>

        <div className="text-xs my-2">
          <div>Date: {formatDate(repair.created_at)} {formatTime(repair.created_at)}</div>
          {repair.scheduledDate && <div>RDV: {formatDate(repair.scheduledDate)}</div>}
          <div>Statut: {repair.status || 'Saisie'}</div>
        </div>

        <div className="text-xs text-center my-2">
          QR Code ou code barres pour suivi interne<br/>
          [{repair.uid.replace(/[^A-Z0-9]/gi, '')}]
        </div>

        <div className="text-xs text-center border-t pt-2">
          Document à conserver aux fins de suivi interne
        </div>
      </div>

      {/* Receipt format - narrow width suitable for thermal printer */}
      <style jsx>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0;
            padding: 0;
          }
          
          div {
            /* Simulate thermal receipt width */
            max-width: 384px; /* Typical 57mm thermal printer */
            margin: 0 auto;
            box-sizing: border-box;
          }
        }
        
        @page {
          size: 3.125in 8in; /* Approximate thermal roll size */
          margin: 0.25in;
        }
      `}</style>
    </div>
  );
};

export default ThermalReceiptTemplate;