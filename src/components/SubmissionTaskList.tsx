import { useMemo, type ReactNode } from "react";
import { CatriaTaskFlagControls } from "@/components/CatriaTaskFlagControls";
import { ChecklistPersonStatusBar } from "@/components/ChecklistPersonStatusBar";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChecklistStatusBadge } from "@/components/ChecklistBulkEditToolbar";
import {
  PREP_OWNER_LABEL,
  REVIEW_OWNER_LABEL,
  assigneeLabel,
  canCatriaApprove,
  catriaApproveBlockedReason,
  formatChecklistDueDate,
  getCatriaTaskFlags,
  getSubmissionTaskAssignee,
  isSubmissionTaskComplete,
  resolveChecklistItemStatus,
  resolveCatriaPersonStatus,
  resolveItemPersonStatus,
  resolvePrepPersonStatus,
  submissionTaskShowsCatria,
  submissionTaskShowsPrep,
  submissionTaskDueStatus,
  type CatriaTaskFlags,
  type ChecklistItemStatus,
  type ChecklistOwner,
  type ChecklistPerson,
  type ItemPersonStatuses,
  type SubmissionTaskItem,
} from "@/lib/submission-checklist-data";
import type { CarrierChecklistTask } from "@/lib/submission-checklist-carrier";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TaskLike = {
  id: string;
  title: string;
  description: string;
  assignee: ChecklistOwner;
  dueDate: string;
  reviewDueDate: string;
  submissionTarget?: string;
  carrierName?: string;
  requiresCatriaApproval?: boolean;
};

function toTaskLike(task: SubmissionTaskItem | CarrierChecklistTask): TaskLike {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    assignee: task.assignee,
    dueDate: task.dueDate,
    reviewDueDate: task.reviewDueDate,
    submissionTarget: "submissionTarget" in task ? task.submissionTarget : undefined,
    carrierName: "carrierName" in task ? task.carrierName : undefined,
    requiresCatriaApproval:
      "requiresCatriaApproval" in task ? task.requiresCatriaApproval : task.assignee !== "prep",
  };
}

function dueClass(status: ReturnType<typeof submissionTaskDueStatus>) {
  if (status === "overdue") return "text-destructive";
  if (status === "due-soon") return "text-amber-700 dark:text-amber-300";
  return "text-muted-foreground";
}

export function SubmissionTaskList({
  tasks,
  taskNumbers,
  done,
  reviewed,
  approved,
  catriaTaskFlags,
  taskAssignees,
  itemStatuses,
  personStatuses,
  notes,
  bulkSelectEnabled,
  canRemoveAssignee,
  selectedIds,
  onSelectedChange,
  onDoneChange,
  onReviewedChange,
  onApprovedChange,
  onCatriaTaskFlagsChange,
  onRemovePerson,
  onStatusChange,
  onNoteChange,
  bulkToolbar,
}: {
  tasks: (SubmissionTaskItem | CarrierChecklistTask)[];
  taskNumbers?: ReadonlyMap<string, number>;
  done: Record<string, boolean>;
  reviewed: Record<string, boolean>;
  approved: Record<string, boolean>;
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>;
  taskAssignees?: Record<string, ChecklistOwner>;
  itemStatuses?: Record<string, ChecklistItemStatus>;
  personStatuses?: Record<string, ItemPersonStatuses>;
  notes: Record<string, string>;
  bulkSelectEnabled?: boolean;
  canRemoveAssignee?: boolean;
  selectedIds?: ReadonlySet<string>;
  onSelectedChange?: (id: string, selected: boolean) => void;
  onDoneChange: (id: string, value: boolean) => void;
  onReviewedChange: (id: string, value: boolean) => void;
  onApprovedChange: (id: string, value: boolean) => void;
  onCatriaTaskFlagsChange?: (id: string, flags: Partial<CatriaTaskFlags>) => void;
  onRemovePerson?: (id: string, person: ChecklistPerson) => void;
  onPersonStatusChange?: (id: string, person: ChecklistPerson, status: ChecklistItemStatus) => void;
  onStatusChange?: (id: string, status: ChecklistItemStatus) => void;
  onNoteChange: (id: string, value: string) => void;
  bulkToolbar?: ReactNode;
}) {
  const normalized = useMemo(() => tasks.map(toTaskLike), [tasks]);
  const statuses = itemStatuses ?? {};
  const personStatusMap = personStatuses ?? {};

  const completeCount = normalized.filter((t) =>
    isSubmissionTaskComplete(t as SubmissionTaskItem, done, approved, reviewed, catriaTaskFlags),
  ).length;

  return (
    <div className="space-y-3">
      {bulkToolbar}

      <div className="flex items-center justify-end text-xs tabular-nums text-muted-foreground">
        {completeCount}/{normalized.length} complete
      </div>

      {normalized.length > 0 ? (
        <Progress
          value={normalized.length > 0 ? Math.round((completeCount / normalized.length) * 100) : 0}
          className="h-1.5"
        />
      ) : null}

      <div className="space-y-2">
        {normalized.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No tasks in this list.</p>
        ) : (
          normalized.map((task, index) => {
            const itemNumber = taskNumbers?.get(task.id) ?? index + 1;
            const prepDone = !!done[task.id];
            const catriaReviewed = !!reviewed[task.id];
            const catriaApproved = !!approved[task.id];
            const flags = getCatriaTaskFlags(task.id, catriaTaskFlags);
            const assignee = getSubmissionTaskAssignee(task, taskAssignees);
            const status = resolveChecklistItemStatus(task.id, statuses);
            const dueStatus = submissionTaskDueStatus(task.dueDate);
            const showPrep = submissionTaskShowsPrep(task, assignee);
            const showCatriaReview = flags.review && submissionTaskShowsCatria(task, assignee, catriaTaskFlags);
            const showCatriaApprove = flags.approve && submissionTaskShowsCatria(task, assignee, catriaTaskFlags);
            const showPrepPersonRow = showPrep;
            const showCatriaPersonRow = submissionTaskShowsCatria(task, assignee, catriaTaskFlags);
            const prepPersonStatus = resolveItemPersonStatus(
              task.id,
              "prep",
              personStatusMap,
              resolvePrepPersonStatus(prepDone, showPrepPersonRow),
            );
            const catriaPersonStatus = resolveItemPersonStatus(
              task.id,
              "review",
              personStatusMap,
              resolveCatriaPersonStatus(flags, catriaReviewed, catriaApproved),
            );
            const approveGate = {
              prepDone,
              showPrep,
              catriaReviewed,
              flags,
            };
            const approveEnabled = canCatriaApprove(approveGate);
            const approveBlockedReason = catriaApproveBlockedReason(approveGate);
            const complete = isSubmissionTaskComplete(
              task as SubmissionTaskItem,
              done,
              approved,
              reviewed,
              catriaTaskFlags,
            );

            return (
              <div
                key={task.id}
                className={cn(
                  "rounded-md border px-3 py-2.5 space-y-2",
                  complete ? "border-emerald/30 bg-emerald/5" : "border-border/70 bg-background/40",
                )}
              >
                <div className="flex flex-wrap items-start gap-2">
                  {bulkSelectEnabled ? (
                    <Checkbox
                      checked={selectedIds?.has(task.id) ?? false}
                      onCheckedChange={(v) => onSelectedChange?.(task.id, v === true)}
                      aria-label={`Select ${task.title} for bulk edit`}
                      className="mt-0.5"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold leading-snug">
                        {itemNumber}. {task.title}
                      </p>
                      {onStatusChange ? (
                        <ChecklistStatusBadge
                          status={status}
                          onStatusChange={(next) => onStatusChange(task.id, next)}
                          compact
                        />
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {task.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>
                        Owner:{" "}
                        <strong className="text-foreground">{assigneeLabel(assignee)}</strong>
                      </span>
                      <span className={dueClass(dueStatus)}>
                        Due {formatChecklistDueDate(task.dueDate)}
                      </span>
                      {showCatriaReview || showCatriaApprove ? (
                        <span>
                          {REVIEW_OWNER_LABEL} by {formatChecklistDueDate(task.reviewDueDate)}
                        </span>
                      ) : null}
                      {task.submissionTarget ? <span>→ {task.submissionTarget}</span> : null}
                      {task.carrierName ? <span>· {task.carrierName}</span> : null}
                    </p>
                  </div>
                </div>

                <ChecklistPersonStatusBar
                  showPrep={showPrepPersonRow}
                  showCatria={showCatriaPersonRow}
                  prepStatus={prepPersonStatus}
                  catriaStatus={catriaPersonStatus}
                  catriaReviewed={catriaReviewed}
                  catriaApproved={catriaApproved}
                  catriaTaskFlags={flags}
                  canRemoveAssignee={canRemoveAssignee}
                  onPrepStatusChange={
                    onPersonStatusChange
                      ? (status) => onPersonStatusChange(task.id, "prep", status)
                      : undefined
                  }
                  onCatriaStatusChange={
                    onPersonStatusChange
                      ? (status) => onPersonStatusChange(task.id, "review", status)
                      : undefined
                  }
                  onRemovePerson={
                    onRemovePerson ? (person) => onRemovePerson(task.id, person) : undefined
                  }
                />

                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                    {showPrep ? (
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={prepDone}
                          onCheckedChange={(v) => onDoneChange(task.id, v === true)}
                          aria-label={`${PREP_OWNER_LABEL} complete: ${task.title}`}
                        />
                        <span>{PREP_OWNER_LABEL} done</span>
                      </label>
                    ) : null}
                    {showCatriaReview ? (
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={catriaReviewed}
                          onCheckedChange={(v) => onReviewedChange(task.id, v === true)}
                          aria-label={`${REVIEW_OWNER_LABEL} reviewed: ${task.title}`}
                        />
                        <span>{REVIEW_OWNER_LABEL} reviewed</span>
                      </label>
                    ) : null}
                    {showCatriaApprove ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label
                            className={cn(
                              "inline-flex items-center gap-2",
                              !approveEnabled && !catriaApproved
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer",
                            )}
                          >
                            <Checkbox
                              checked={catriaApproved}
                              disabled={!approveEnabled && !catriaApproved}
                              onCheckedChange={(v) => {
                                if (v === true && !approveEnabled) return;
                                onApprovedChange(task.id, v === true);
                              }}
                              aria-label={`${REVIEW_OWNER_LABEL} approved: ${task.title}`}
                            />
                            <span>{REVIEW_OWNER_LABEL} approved</span>
                          </label>
                        </TooltipTrigger>
                        {!approveEnabled && !catriaApproved && approveBlockedReason ? (
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            {approveBlockedReason}
                          </TooltipContent>
                        ) : null}
                      </Tooltip>
                    ) : null}
                  </div>
                  {onCatriaTaskFlagsChange ? (
                    <CatriaTaskFlagControls
                      flags={flags}
                      onChange={(next) => onCatriaTaskFlagsChange(task.id, next)}
                      itemLabel={task.title}
                    />
                  ) : null}
                </div>

                <Textarea
                  value={notes[task.id] ?? ""}
                  onChange={(e) => onNoteChange(task.id, e.target.value)}
                  placeholder="Reference ID, SMID, notes…"
                  rows={2}
                  className="text-xs bg-background/50"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
