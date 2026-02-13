import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Issue } from "@/types";
import IssueCard from "./issue-card";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  issues: Issue[];
  selectedIssues: any[];
  isLoading: boolean;
  onToggleIssue: (issue: Issue) => void;
  onShowTiers: (issue: Issue) => void;
}

const IssuesGrid: React.FC<Props> = ({
  issues,
  selectedIssues,
  isLoading,
  onToggleIssue,
  onShowTiers,
  className,
  ...rest
}) => {
  if (isLoading) {
    return (
      <div
        className={cn("flex items-center justify-center py-8", className)}
        {...rest}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Chargement des problèmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}
      {...rest}
    >
      {issues.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          isSelected={selectedIssues.some(
            (i) => i.issueId === String(issue.id),
          )}
          onToggle={onToggleIssue}
          onShowTiers={onShowTiers}
          selectedTierId={
            selectedIssues.find((i) => i.issueId === String(issue.id))
              ?.selectedTierId
          }
        />
      ))}
    </div>
  );
};

export default IssuesGrid;
