'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AddReparationProgress() {
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
    <div className="sticky top-0 bg-background py-4 z-10 border-b bg-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">
          Progression
        </span>
        <span className="text-sm text-muted-foreground">
          Étape {currentStep} sur 3
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / 3) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between mt-4">
        {stepTitles.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium mb-2",
              currentStep >= step.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {step.id}
            </div>
            <span className={cn(
              "text-xs text-center",
              currentStep >= step.id
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}