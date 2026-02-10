import { Repair } from '@/types';
import { ThermalReceiptTemplate } from './thermal-receipt-template';

interface RepairTicketPrintProps {
  repair: Repair;
}

export const RepairTicketPrint = ({ repair }: RepairTicketPrintProps) => {
  return (
    <div className="print-container thermal-paper">
      <style>{`
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
      `}</style>
      <ThermalReceiptTemplate repair={repair} />
    </div>
  );
};

export default RepairTicketPrint;