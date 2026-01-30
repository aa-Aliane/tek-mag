'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAddReparationStore } from '@/store/addReparationStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface StepNavigationProps {
  currentStep: number;
  onNext?: () => void;
  onPrev?: () => void;
  canGoNext?: boolean;
  canGoPrev?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  nextHref?: string;
  prevHref?: string;
}

export function StepNavigation({
  currentStep,
  onNext,
  onPrev,
  canGoNext = true,
  canGoPrev = true,
  nextLabel = 'Suivant',
  prevLabel = 'Précédent',
  nextHref,
  prevHref,
}: StepNavigationProps) {
  const router = useRouter();
  const { formData } = useAddReparationStore();

  const handleNext = () => {
    if (nextHref) {
      router.push(nextHref);
    } else if (onNext) {
      onNext();
    }
  };

  const handlePrev = () => {
    if (prevHref) {
      router.push(prevHref);
    } else if (onPrev) {
      onPrev();
    }
  };

  return (
    <div className="flex justify-between mt-8 pt-6 border-t">
      <Button
        variant="outline"
        onClick={handlePrev}
        disabled={!canGoPrev}
        className={cn(!canGoPrev && 'opacity-50 cursor-not-allowed')}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        {prevLabel}
      </Button>
      
      <div className="flex items-center space-x-2">
        {[1, 2, 3].map((step) => (
          <div 
            key={step} 
            className={cn(
              "h-2 w-8 rounded-full",
              step === currentStep 
                ? "bg-primary" 
                : step < currentStep 
                  ? "bg-green-500" 
                  : "bg-muted"
            )}
          />
        ))}
      </div>
      
      <Button
        onClick={handleNext}
        disabled={!canGoNext}
        className={cn(!canGoNext && 'opacity-50 cursor-not-allowed')}
      >
        {nextLabel}
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}