import React from "react";
import { Check, Wrench, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Issue } from "@/types";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  issue: Issue;
  isSelected: boolean;
  onToggle: (issue: Issue) => void;
  onShowTiers?: (issue: Issue) => void;
  selectedTierId?: number;
}

const IssueCard: React.FC<Props> = ({
  issue,
  isSelected,
  onToggle,
  onShowTiers,
  selectedTierId,
  className,
  ...rest
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(issue);
        }
      }}
      onClick={() => onToggle(issue)}
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:bg-accent/30",
        className
      )}
      {...rest}
    >
      <div
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors mt-1",
          isSelected
            ? "border-primary bg-primary"
            : "border-muted-foreground/50"
        )}
      >
        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{issue.name}</span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              issue.categoryType === "part_based"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
            )}
          >
            {issue.categoryType === "part_based" ? (
              <>
                <Wrench className="w-3 h-3 mr-1" />
                Pièce
              </>
            ) : (
              <>
                <Settings className="w-3 h-3 mr-1" />
                Service
              </>
            )}
          </span>
        </div>
        {issue.categoryType === "part_based" && (
          <p className="text-xs text-muted-foreground mt-1">
            Nécessite une pièce de rechange
          </p>
        )}
        {isSelected && issue.categoryType === "service_based" && (
          <p className="text-xs mt-2">
            <span className="text-muted-foreground">Prix: </span>
            <span className="font-medium text-primary">€{issue.basePrice}</span>
          </p>
        )}
        {isSelected && issue.categoryType === "part_based" && (
          <div className="mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowTiers?.(issue);
              }}
              className="text-xs text-primary hover:underline"
            >
              {selectedTierId
                ? "Changer la qualité"
                : "Sélectionner la qualité"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
