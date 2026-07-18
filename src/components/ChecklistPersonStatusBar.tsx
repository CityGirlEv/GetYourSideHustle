import { ChecklistStatusBadge } from "@/components/ChecklistBulkEditToolbar";
import { Button } from "@/components/ui/button";
import {
  PREP_OWNER_LABEL,
  REVIEW_OWNER_LABEL,
  type CatriaTaskFlags,
  type ChecklistItemStatus,
  type ChecklistPerson,
} from "@/lib/submission-checklist-data";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

function AssigneeRemoveButton({
  person,
  personLabel,
  canRemove,
  onRemove,
}: {
  person: ChecklistPerson;
  personLabel: string;
  canRemove: boolean;
  onRemove?: (person: ChecklistPerson) => void;
}) {
  if (!canRemove || !onRemove) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
      aria-label={`Remove ${personLabel} from this item`}
      onClick={() => onRemove(person)}
    >
      <X className="h-3 w-3" />
    </Button>
  );
}

export function ChecklistPersonStatusBar({
  showPrep,
  showCatria,
  prepStatus,
  catriaStatus,
  catriaReviewed,
  catriaApproved,
  catriaTaskFlags,
  canRemoveAssignee,
  onPrepStatusChange,
  onCatriaStatusChange,
  onRemovePerson,
}: {
  showPrep: boolean;
  showCatria: boolean;
  prepStatus: ChecklistItemStatus;
  catriaStatus: ChecklistItemStatus;
  catriaReviewed: boolean;
  catriaApproved: boolean;
  catriaTaskFlags: CatriaTaskFlags;
  canRemoveAssignee?: boolean;
  onPrepStatusChange?: (status: ChecklistItemStatus) => void;
  onCatriaStatusChange?: (status: ChecklistItemStatus) => void;
  onRemovePerson?: (person: ChecklistPerson) => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-border/50 bg-muted/20 px-2 py-1.5"
      data-testid="checklist-person-status-bar"
    >
      {showPrep ? (
        <span className="inline-flex items-center gap-1 text-xs">
          <span className="font-medium text-foreground">{PREP_OWNER_LABEL}</span>
          {onPrepStatusChange ? (
            <ChecklistStatusBadge
              status={prepStatus}
              onStatusChange={onPrepStatusChange}
              compact
            />
          ) : null}
          <AssigneeRemoveButton
            person="prep"
            personLabel={PREP_OWNER_LABEL}
            canRemove={!!canRemoveAssignee}
            onRemove={onRemovePerson}
          />
        </span>
      ) : null}
      {showCatria ? (
        <span className="inline-flex flex-wrap items-center gap-1 text-xs">
          <span className="font-medium text-foreground">{REVIEW_OWNER_LABEL}</span>
          {catriaTaskFlags.review ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-[10px]",
                catriaReviewed ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground",
              )}
            >
              Review
              {catriaReviewed ? <Check className="h-3 w-3" aria-hidden /> : " ○"}
            </span>
          ) : null}
          {catriaTaskFlags.approve ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-[10px]",
                catriaApproved ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground",
              )}
            >
              Approve
              {catriaApproved ? <Check className="h-3 w-3" aria-hidden /> : " ○"}
            </span>
          ) : null}
          {onCatriaStatusChange ? (
            <ChecklistStatusBadge
              status={catriaStatus}
              onStatusChange={onCatriaStatusChange}
              compact
            />
          ) : null}
          <AssigneeRemoveButton
            person="review"
            personLabel={REVIEW_OWNER_LABEL}
            canRemove={!!canRemoveAssignee}
            onRemove={onRemovePerson}
          />
        </span>
      ) : null}
    </div>
  );
}
