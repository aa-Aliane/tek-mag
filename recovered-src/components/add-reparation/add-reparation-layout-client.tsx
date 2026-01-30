'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AddReparationSummary } from './add-reparation-summary';

export function AddReparationLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine current step based on pathname
  const currentStep = pathname.includes('/add-reparation/device') ? 1 :
                     pathname.includes('/add-reparation/issues') ? 2 :
                     pathname.includes('/add-reparation/client') ? 3 : 1;

  // Define step titles
  const stepTitles = [
    { id: 1, title: 'Appareil', path: '/add-reparation/device' },
    { id: 2, title: 'Pannes & Réparations', path: '/add-reparation/issues' },
    { id: 3, title: 'Client', path: '/add-reparation/client' },
  ];

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        {children}
      </div>
    </>
  );
}