import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CHECKLIST_ASSIGNEE_OPTIONS,
  CHECKLIST_ITEM_STATUS_OPTIONS,
  type ChecklistItemStatus,
  type ChecklistOwner,
} from "@/lib/submission-checklist-data";
import { Trash2, X } from "lucide-react";

type ChecklistBulkEditToolbarProps = {
  selectedCount: number;
  onApplyAssignee: (assignee: ChecklistOwner) => void;
  onApplyStatus: (status: ChecklistItemStatus) => void;
  onRemove: () => void;
  onClearSelection: () => void;
};

export function ChecklistBulkEditToolbar({
  selectedCount,
  onApplyAssignee,
  onApplyStatus,
  onRemove,
  onClearSelection,
}: ChecklistBulkEditToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="sticky top-14 z-[9] flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-background/95 p-2.5 shadow-md backdrop-blur"
      data-testid="checklist-bulk-edit-toolbar"
    >
      <span className="text-xs font-medium tabular-nums shrink-0">
        {selectedCount} selected
      </span>

      <Select onValueChange={(v) => onApplyAssignee(v as ChecklistOwner)}>
        <SelectTrigger className="h-7 w-[7.5rem] text-xs bg-background/50" aria-label="Bulk assign">
          <SelectValue placeholder="Assign…" />
        </SelectTrigger>
        <SelectContent>
          {CHECKLIST_ASSIGNEE_OPTIONS.map((opt) => (
            <SelectItem key={opt.id} value={opt.id} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(v) => onApplyStatus(v as ChecklistItemStatus)}>
        <SelectTrigger className="h-7 w-[8.5rem] text-xs bg-background/50" aria-label="Bulk status">
          <SelectValue placeholder="Status…" />
        </SelectTrigger>
        <SelectContent>
          {CHECKLIST_ITEM_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.id} value={opt.id} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        onClick={onRemove}
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Remove
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 text-xs ml-auto"
        onClick={onClearSelection}
      >
        <X className="h-3 w-3 mr-1" />
        Clear
      </Button>
    </div>
  );
}

export function ChecklistStatusBadge({
  status,
  onStatusChange,
  compact,
}: {
  status: ChecklistItemStatus;
  onStatusChange: (status: ChecklistItemStatus) => void;
  compact?: boolean;
}) {
  const statusClass =
    status === "done"
      ? "border-emerald/40 bg-emerald/10 text-emerald-800 dark:text-emerald-200"
      : status === "in_progress"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100"
        : "border-border/60 bg-muted/30 text-muted-foreground";

  return (
    <Select value={status} onValueChange={(v) => onStatusChange(v as ChecklistItemStatus)}>
      <SelectTrigger
        className={
          compact
            ? `h-6 w-[6.75rem] text-[10px] px-1.5 ${statusClass}`
            : `h-7 w-[7.5rem] text-xs ${statusClass}`
        }
        aria-label="Task status"
        onClick={(e) => e.stopPropagation()}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CHECKLIST_ITEM_STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.id} value={opt.id} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
