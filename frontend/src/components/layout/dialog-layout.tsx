import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils"; // Shadcn helper for merging classes

interface Props extends React.ComponentPropsWithoutRef<"dialog"> {
  /** Controlled open state of the dialog */
  open: boolean;
  /** Callback fired when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** Title displayed in the header */
  title: string;
  /** Main content of the dialog */
  onConfirm?: () => void;
  /** Label for the primary action button */
  confirmLabel?: string;
  /** Disables the primary action button (e.g., during validation or loading) */
  confirmDisabled?: boolean;
  /** Label for the close/cancel button */
  cancelLabel?: string;
  /** Visual style of the confirm button */
  variant?: "default" | "destructive";
  /** * Tailwind max-width class (e.g., "max-w-md", "max-w-[800px]").
   * Note: If using arbitrary values like [500px], ensure the full string
   * is passed to the prop so Tailwind's JIT engine can detect it.
   */
  maxWidth?: string;
}

/**
 * A reusable wrapper for application dialogs to ensure consistent
 * layout, padding, and action button placement.
 */
export const DialogLayout: React.FC<Props> = ({
  open,
  onOpenChange,
  title,
  children,
  onConfirm,
  confirmLabel = "Confirmer", // Default values
  confirmDisabled = false,
  cancelLabel = "Annuler",
  variant = "default",
  className,
  maxWidth = "max-w-lg", // Default width
  ...rest
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...rest}>
      <DialogContent className={cn(maxWidth, className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Scrollable area or content container */}
        <div className="py-4 text-sm text-muted-foreground">{children}</div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            {cancelLabel}
          </Button>

          {onConfirm && (
            <Button
              variant={variant}
              onClick={onConfirm}
              disabled={confirmDisabled}
              type="button"
            >
              {confirmLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
