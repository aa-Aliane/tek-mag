import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  title: string;
  description?: string;
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  showNextIcon?: boolean;
  nextIcon?: React.ReactNode;
}

export const StepLayout: React.FC<Props> = ({
  children,
  title,
  description,
  onBack,
  onNext,
  backLabel = "Retour",
  nextLabel = "Suivant",
  isNextDisabled = false,
  isNextLoading = false,
  showNextIcon = true,
  nextIcon,
  className,
  ...rest
}) => {
  return (
    <Card className={cn("p-8", className)} {...rest}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="min-h-[300px]">{children}</div>

        <div className="flex justify-between pt-8 border-t mt-4">
          {onBack ? (
            <Button
              variant="outline"
              onClick={onBack}
              size="lg"
              type="button"
              className="px-6"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {backLabel}
            </Button>
          ) : (
            <div />
          )}

          {onNext && (
            <Button
              onClick={onNext}
              disabled={isNextDisabled || isNextLoading}
              size="lg"
              type="button"
              className="px-8 min-w-[140px]"
            >
              {isNextLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  {nextLabel}
                  {showNextIcon && (nextIcon || <ChevronRight className="h-4 w-4 ml-2" />)}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
