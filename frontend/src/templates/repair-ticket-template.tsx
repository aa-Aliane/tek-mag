import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Repair } from '@/types';

interface RepairTicketTemplateProps {
  repair: Repair;
}

export const RepairTicketTemplate = ({ repair }: RepairTicketTemplateProps) => {
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
    <div className="max-w-3xl mx-auto p-6 bg-white text-gray-800 font-sans">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">BON DE RÉPARATION</h1>
            <p className="text-sm text-gray-600">N° {repair.uid}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">REPAR'</div>
            <div className="text-xs text-gray-600">Centre de réparation</div>
            <div className="text-xs text-gray-600">123 Avenue Technologie</div>
            <div className="text-xs text-gray-600">75000 Paris</div>
            <div className="text-xs text-gray-600">Tél: 01 23 45 67 89</div>
            <div className="text-xs text-gray-600">SIRET: 123 456 789 00012</div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-900 border-b-2 border-gray-700 pb-1">Client</h2>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Nom:</span> {repair.client?.first_name} {repair.client?.last_name}</p>
            <p><span className="font-medium">Téléphone:</span> {repair.client?.profile?.phone_number || 'N/A'}</p>
            {repair.client?.email && <p><span className="font-medium">Email:</span> {repair.client.email}</p>}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-900 border-b-2 border-gray-700 pb-1">Réparation</h2>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Date de dépôt:</span> {formatDate(repair.created_at)} à {formatTime(repair.created_at)}</p>
            <p><span className="font-medium">Date prévue:</span> {repair.scheduledDate ? formatDate(repair.scheduledDate) : 'À définir'}</p>
            <p><span className="font-medium">Statut:</span> <span className="uppercase">{repair.status || 'Saisie'}</span></p>
          </div>
        </div>
      </div>

      {/* Device Info */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 border-b-2 border-gray-700 pb-1">Appareil à réparer</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-2 border border-gray-300 rounded">
            <p className="font-medium text-gray-700 text-sm">Type</p>
            <p>{repair.deviceType || 'N/A'}</p>
          </div>
          <div className="p-2 border border-gray-300 rounded">
            <p className="font-medium text-gray-700 text-sm">Marque</p>
            <p>{repair.brand || 'N/A'}</p>
          </div>
          <div className="p-2 border border-gray-300 rounded">
            <p className="font-medium text-gray-700 text-sm">Modèle</p>
            <p>{repair.model || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Issues */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 border-b-2 border-gray-700 pb-1">Panne(s) constatée(s)</h2>
        <div className="p-3 border border-gray-300 rounded min-h-16">
          {repair.issues && repair.issues.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {repair.issues.map((issue, idx) => (
                <li key={idx} className="text-sm">{issue}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600 italic">Aucune panne spécifique mentionnée</p>
          )}
          {repair.issueDescription && (
            <div className="mt-2 text-sm">
              <p className="font-medium">Description détaillée:</p>
              <p className="mt-1">{repair.issueDescription}</p>
            </div>
          )}
        </div>
      </div>

      {/* Accessories & Security */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Accessories */}
        {repair.accessories && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-900 border-b-2 border-gray-700 pb-1">Accessoires remis</h2>
            <div className="p-3 border border-gray-300 rounded min-h-16">
              {typeof repair.accessories === 'string'
                ? repair.accessories.split(',').map((acc, idx) => {
                    const item = acc.trim();
                    return item ? <span key={idx} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-2 mb-1 border">{item}</span> : null;
                  }).filter(Boolean)
                : Array.isArray(repair.accessories)
                  ? repair.accessories.map((acc, idx) => {
                      const item = typeof acc === 'string' ? acc.trim() : acc;
                      return item ? <span key={idx} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-2 mb-1 border">{item}</span> : null;
                    }).filter(Boolean)
                  : null
              }
            </div>
          </div>
        )}

        {/* Security Info */}
        {repair.password && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-900 border-b-2 border-gray-700 pb-1">Sécurité</h2>
            <div className="p-3 border border-yellow-300 bg-yellow-50 rounded min-h-16">
              <p className="text-sm font-medium">Code/PIN de déverrouillage:</p>
              <p className="text-lg font-bold tracking-widest mt-2">{repair.password}</p>
              <p className="text-xs text-gray-600 mt-2 italic">Merci de noter que l'appareil est protégé. La connaissance de ce code est nécessaire au diagnostic.</p>
            </div>
          </div>
        )}
      </div>

      {/* Estimate & Payment */}
      {totalCost > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 border-b-2 border-gray-700 pb-1">Devis & Paiement</h2>
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="grid grid-cols-2 bg-gray-100 border-b border-gray-300">
              <div className="p-2 font-medium">Désignation</div>
              <div className="p-2 font-medium text-right">Prix TTC</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="p-2 border-b border-gray-300">Diagnostic & Réparation</div>
              <div className="p-2 border-b border-gray-300 text-right">{totalCost.toFixed(2)} €</div>
            </div>
            <div className="grid grid-cols-2 bg-gray-50">
              <div className="p-2 font-medium border-t border-gray-300">Total</div>
              <div className="p-2 font-bold text-right border-t border-gray-300">{totalCost.toFixed(2)} €</div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="p-3 border border-gray-300">
              <p className="text-xs text-gray-600">Payé CB</p>
              <p className="font-bold text-sm">{cardPayment.toFixed(2)} €</p>
            </div>
            <div className="p-3 border border-gray-300">
              <p className="text-xs text-gray-600">Payé Espèces</p>
              <p className="font-bold text-sm">{cashPayment.toFixed(2)} €</p>
            </div>
            <div className={`p-3 border ${remaining > 0 ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
              <p className="text-xs">Reste à payer</p>
              <p className={`font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>{remaining.toFixed(2)} €</p>
            </div>
          </div>
        </div>
      )}

      {/* Conditions */}
      <div className="mb-8 text-xs text-gray-700">
        <h3 className="font-bold mb-2 border-b border-gray-400 pb-1">Conditions générales</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Le devis est gratuit et sans engagement</li>
          <li>Le délai de réparation est estimé entre 3 à 15 jours ouvrés selon la complexité</li>
          <li>Les réparations sont garanties 3 mois pièces et main d'œuvre</li>
          <li>Tout appareil non récupéré dans les 6 mois sera détruit ou revendu</li>
          <li>Notre responsabilité est limitée à la valeur marchande du terminal</li>
        </ul>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="font-medium mb-8">Vu du client (Accusé de réception)</p>
          <div className="border-b border-gray-800 pb-1">Signature</div>
          <div className="text-xs mt-1">Merci de conserver ce document</div>
        </div>
        <div className="text-right">
          <p className="font-medium mb-8">Vu du technicien</p>
          <div className="h-16 flex items-center justify-center">
            <div className="border-2 border-gray-800 rounded-full w-16 h-16 flex items-center justify-center text-xs font-bold">
              REPAR'
            </div>
          </div>
          <div className="text-xs">Tampon et signature</div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-800 text-center text-xs text-gray-600">
        <p>Ce bon de réparation fait foi de la réception de votre appareil en l'état.</p>
        <p>Merci de conserver ce document jusqu'au retrait de votre appareil réparé.</p>
        <p className="mt-2">N° TVA: FR123456789 - N° d'inscription RCS: Paris B 123 456 789</p>
      </div>
    </div>
  );
};

export default RepairTicketTemplate;