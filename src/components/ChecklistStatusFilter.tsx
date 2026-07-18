import { ChecklistFilterBubble } from "@/components/ChecklistFilterBubble";
import {
  CHECKLIST_ITEM_STATUS_OPTIONS,
  type ChecklistItemStatus,
} from "@/lib/submission-checklist-data";
import { cn } from "@/lib/utils";

type ChecklistStatusFilterProps = {
  selectedStatuses: ReadonlySet<ChecklistItemStatus>;
  onChange: (statuses: Set<ChecklistItemStatus>) => void;
  className?: string;
};

/** Multiselect overall-status filter — toggle bubbles; none or all selected shows every item. */
export function ChecklistStatusFilter({
  selectedStatuses,
  onChange,
  className,
}: ChecklistStatusFilterProps) {
  const toggle = (status: ChecklistItemStatus) => {
    const next = new Set(selectedStatuses);
    if (next.has(status)) next.delete(status);
    else next.add(status);
    onChange(next);
  };

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1", className)}
      role="group"
      aria-label="Status filter"
    >
      <span className="text-[10px] font-bold text-foreground mr-0.5 shrink-0">Status:</span>
      {CHECKLIST_ITEM_STATUS_OPTIONS.map((option) => (
        <ChecklistFilterBubble
          key={option.id}
          label={option.label}
          active={selectedStatuses.has(option.id)}
          onClick={() => toggle(option.id)}
        />
      ))}
    </div>
  );
}
