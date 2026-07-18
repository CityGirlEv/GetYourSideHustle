import { useCallback, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BenchmarkReportTabBar } from "@/components/BenchmarkReportSectionNav";
import { CatriaTaskFlagControls } from "@/components/CatriaTaskFlagControls";
import { ChecklistPersonStatusBar } from "@/components/ChecklistPersonStatusBar";
import { GlassCollapsibleCard } from "@/components/GlassCollapsibleCard";
import { CarrierChecklistPanel } from "@/components/CarrierChecklistPanel";
import { MetaAdConformancePanel } from "@/components/MetaAdConformancePanel";
import { SubmissionTaskList } from "@/components/SubmissionTaskList";
import { ChecklistFilterBubble } from "@/components/ChecklistFilterBubble";
import { ChecklistStatusFilter } from "@/components/ChecklistStatusFilter";
import {
  ChecklistBulkEditToolbar,
  ChecklistStatusBadge,
} from "@/components/ChecklistBulkEditToolbar";
import {
  SUBMISSION_CHECKLIST_SECTIONS,
  SUBMISSION_TASK_ITEMS,
  allSubmissionChecklistItems,
  checklistItemMatchesAssigneeFilter,
  checklistItemNumberById,
  checklistItemsByCmsRequirementId,
  checklistItemShowsCatriaReviewCheckbox,
  checklistItemShowsCatriaApproveCheckbox,
  checklistItemShowsPrepCheckbox,
  showsCatriaPerson,
  showsPrepPerson,
  canCatriaApprove,
  catriaApproveBlockedReason,
  countChecklistProgress,
  countSubmissionTasksProgress,
  formatChecklistDueDate,
  getChecklistItemAssignee,
  getCatriaTaskFlags,
  isChecklistItemComplete,
  CHECKLIST_ASSIGNEE_OPTIONS,
  CHECKLIST_OWNER_TABS,
  PREP_OWNER_LABEL,
  REVIEW_OWNER_LABEL,
  assigneeLabel,
  resolveChecklistItemStatus,
  resolveCatriaPersonStatus,
  resolveItemPersonStatus,
  resolvePrepPersonStatus,
  checklistItemMatchesStatusFilter,
  filterByChecklistItemStatus,
  submissionTaskNumberById,
  getSubmissionTaskAssignee,
  type AssigneeFilter,
  type CatriaTaskFlags,
  type ChecklistItemStatus,
  type ChecklistOwner,
  type ChecklistPerson,
  type SubmissionChecklistItem,
} from "@/lib/submission-checklist-data";
import {
  CHECKLIST_CHANNEL_TABS,
  itemMatchesChannelFilter,
  type ChecklistChannelFilter,
} from "@/lib/submission-checklist-channels";
import type { SubmissionChecklistState } from "@/lib/submission-checklist-storage";
import { applyMainChecklistItemPatch } from "@/lib/submission-checklist-meta-ad-sync";
import {
  buildCarrierMainChecklistItems,
  CARRIER_MAIN_CHECKLIST_SECTION_ID,
  CARRIER_MAIN_CHECKLIST_SECTION_SUBTITLE,
  CARRIER_MAIN_CHECKLIST_SECTION_TITLE,
} from "@/lib/submission-checklist-carrier-sync";
import { countCarrierRequirements } from "@/lib/submission-checklist-carrier";
import { applyBoolRecordPatch } from "@/lib/submission-checklist-storage";
import {
  applyBulkChecklistEdit,
  removePersonFromMainChecklistItem,
  removePersonFromSubmissionTask,
  setChecklistItemStatus,
  setItemPersonStatus,
  setTaskRowPersonStatus,
  syncItemProgressFromCheckboxes,
  syncSubmissionTaskCheckboxProgress,
} from "@/lib/submission-checklist-bulk";
import { countMetaAdConformanceProgress } from "@/lib/submission-checklist-meta-ads";
import { CmsRequirementsReference } from "@/components/CmsRequirementsReference";
import { useSubmissionChecklistProgress } from "@/hooks/use-submission-checklist-progress";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CheckCircle2, ClipboardCheck, ExternalLink, RotateCcw, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MULTIPLE_DIRTY_SAVE_THRESHOLD = 2;

const CHECKLIST_TOOLTIPS = {
  saveAll: (serverSyncAvailable: boolean, hasUnsavedChanges: boolean) =>
    !hasUnsavedChanges
      ? "No unsaved changes"
      : serverSyncAvailable
        ? "Save all unsaved item changes to the team database"
        : "Save all unsaved item changes locally",
  reset: "Discard unsaved changes and restore the last saved checklist",
  clearAll: "Clear all checklist progress locally — click Save to persist",
  saveItem: (serverSyncAvailable: boolean) =>
    serverSyncAvailable
      ? "Save this item's changes to the team database"
      : "Save this item's changes locally",
} as const;

const TAB_REFERENCE = "reference";
const TAB_CHECKLIST = "checklist";
const TAB_SUBMISSIONS = "submissions";
const TAB_CARRIER = "carrier";

function checklistPoolForFilters(
  channel: ChecklistChannelFilter,
  owner: AssigneeFilter,
  nonGapItems: SubmissionChecklistItem[],
  itemAssignees: Record<string, ChecklistOwner>,
  catriaTaskFlags: Record<string, Partial<CatriaTaskFlags>>,
): SubmissionChecklistItem[] {
  const pool =
    channel === "gaps"
      ? allSubmissionChecklistItems().filter((i) => i.id.startsWith("gap-"))
      : nonGapItems.filter((i) => itemMatchesChannelFilter(i, channel));
  return pool.filter((i) =>
    checklistItemMatchesAssigneeFilter(i, owner, itemAssignees, catriaTaskFlags),
  );
}

function ChecklistItemRow({
  item,
  itemNumber,
  assignee,
  status,
  prepDone,
  catriaReviewed,
  catriaApproved,
  catriaTaskFlags,
  personStatuses,
  note,
  isDirty,
  isSaving,
  bulkSelectEnabled,
  showCatriaTaskFlagControls,
  canRemoveAssignee,
  selected,
  onSelectedChange,
  onPrepDone,
  onCatriaReviewed,
  onCatriaApproved,
  onCatriaTaskFlagsChange,
  onAssigneeChange,
  onRemovePerson,
  onPrepStatusChange,
  onCatriaStatusChange,
  onStatusChange,
  onNoteChange,
  onSave,
  saveTooltip,
  onCmsRequirementClick,
  defaultOpen,
}: {
  item: SubmissionChecklistItem;
  itemNumber: number;
  assignee: ChecklistOwner;
  status: ChecklistItemStatus;
  prepDone: boolean;
  catriaReviewed: boolean;
  catriaApproved: boolean;
  catriaTaskFlags: CatriaTaskFlags;
  personStatuses?: SubmissionChecklistState["personStatuses"];
  note: string;
  isDirty?: boolean;
  isSaving?: boolean;
  bulkSelectEnabled?: boolean;
  showCatriaTaskFlagControls?: boolean;
  canRemoveAssignee?: boolean;
  selected?: boolean;
  onSelectedChange?: (v: boolean) => void;
  onPrepDone: (v: boolean) => void;
  onCatriaReviewed: (v: boolean) => void;
  onCatriaApproved: (v: boolean) => void;
  onCatriaTaskFlagsChange: (flags: Partial<CatriaTaskFlags>) => void;
  onAssigneeChange: (v: ChecklistOwner) => void;
  onRemovePerson?: (person: ChecklistPerson) => void;
  onPrepStatusChange?: (status: ChecklistItemStatus) => void;
  onCatriaStatusChange?: (status: ChecklistItemStatus) => void;
  onStatusChange: (status: ChecklistItemStatus) => void;
  onNoteChange: (v: string) => void;
  onSave?: () => void;
  saveTooltip?: string;
  onCmsRequirementClick: (requirementId: string) => void;
  defaultOpen?: boolean;
}) {
  const isGap = item.id.startsWith("gap-");
  const showPrep = checklistItemShowsPrepCheckbox(item, assignee);
  const showCatriaReview = checklistItemShowsCatriaReviewCheckbox(item.id, {
    [item.id]: catriaTaskFlags,
  });
  const showCatriaApprove = checklistItemShowsCatriaApproveCheckbox(item.id, {
    [item.id]: catriaTaskFlags,
  });
  const showPrepPersonRow = showsPrepPerson(item, assignee);
  const showCatriaPersonRow = showsCatriaPerson(item, assignee, { [item.id]: catriaTaskFlags });
  const prepPersonStatus = resolveItemPersonStatus(
    item.id,
    "prep",
    personStatuses,
    resolvePrepPersonStatus(prepDone, showPrepPersonRow),
  );
  const catriaPersonStatus = resolveItemPersonStatus(
    item.id,
    "review",
    personStatuses,
    resolveCatriaPersonStatus(catriaTaskFlags, catriaReviewed, catriaApproved),
  );
  const approveGate = {
    prepDone,
    showPrep,
    catriaReviewed,
    flags: catriaTaskFlags,
  };
  const approveEnabled = canCatriaApprove(approveGate);
  const approveBlockedReason = catriaApproveBlockedReason(approveGate);
  const complete = isChecklistItemComplete(
    item,
    { [item.id]: prepDone },
    { [item.id]: catriaApproved },
    { [item.id]: catriaReviewed },
    { [item.id]: catriaTaskFlags },
  );

  return (
    <GlassCollapsibleCard
      title={`${itemNumber}. ${item.title}`}
      subtitle={
        <span className="flex flex-wrap gap-x-2 gap-y-0.5">
          {showPrep && item.prepDueDate ? (
            <span>
              {PREP_OWNER_LABEL} {formatChecklistDueDate(item.prepDueDate)}
            </span>
          ) : null}
          {showCatriaReview || showCatriaApprove ? (
            <span>
              {REVIEW_OWNER_LABEL} {formatChecklistDueDate(item.reviewDueDate)}
            </span>
          ) : null}
          {item.siteVerified ? <span className="text-emerald-700 dark:text-emerald-300">· verified</span> : null}
          {isGap ? <span className="text-amber-700 dark:text-amber-300">· gap</span> : null}
        </span>
      }
      defaultOpen={defaultOpen ?? !complete}
      className={cn(
        "border-border/60",
        complete && "border-emerald/25",
        isGap && !complete && "border-amber-500/25",
      )}
      headerExtra={
        <span className="flex items-center gap-1.5 shrink-0">
          {bulkSelectEnabled ? (
            <Checkbox
              checked={!!selected}
              onCheckedChange={(v) => onSelectedChange?.(v === true)}
              aria-label={`Select ${item.title} for bulk edit`}
              onClick={(e) => e.stopPropagation()}
            />
          ) : null}
          <ChecklistStatusBadge status={status} onStatusChange={onStatusChange} compact />
          {isDirty ? (
            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">Unsaved</span>
          ) : null}
          {isDirty && onSave ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  disabled={isSaving}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave();
                  }}
                >
                  <Save className="h-3 w-3 mr-0.5" />
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              </TooltipTrigger>
              {saveTooltip ? (
                <TooltipContent side="top" className="max-w-xs text-xs">
                  {saveTooltip}
                </TooltipContent>
              ) : null}
            </Tooltip>
          ) : null}
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {complete ? "✓" : showPrep ? (prepDone ? "…" : "○") : ""}
          </span>
        </span>
      }
    >
      <div className="space-y-3 pt-1">
        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Assignee</span>
          <Select value={assignee} onValueChange={(v) => onAssigneeChange(v as ChecklistOwner)}>
            <SelectTrigger className="h-7 w-[9rem] text-xs bg-background/50">
              <SelectValue>{assigneeLabel(assignee)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CHECKLIST_ASSIGNEE_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {item.verificationNote ? (
          <p className="text-[11px] text-emerald-800/90 dark:text-emerald-200/90">
            Site review: {item.verificationNote}
          </p>
        ) : null}

        {item.cmsRequirementIds && item.cmsRequirementIds.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground self-center">
              CMS ref:
            </span>
            {item.cmsRequirementIds.map((reqId) => (
              <button
                key={reqId}
                type="button"
                onClick={() => onCmsRequirementClick(reqId)}
                className="inline-flex items-center gap-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 dark:text-amber-100 hover:bg-amber-500/20"
              >
                {reqId}
                <ExternalLink className="h-2.5 w-2.5 opacity-60" aria-hidden />
              </button>
            ))}
          </div>
        ) : null}

        <ChecklistPersonStatusBar
          showPrep={showPrepPersonRow}
          showCatria={showCatriaPersonRow}
          prepStatus={prepPersonStatus}
          catriaStatus={catriaPersonStatus}
          catriaReviewed={catriaReviewed}
          catriaApproved={catriaApproved}
          catriaTaskFlags={catriaTaskFlags}
          canRemoveAssignee={canRemoveAssignee}
          onPrepStatusChange={onPrepStatusChange}
          onCatriaStatusChange={onCatriaStatusChange}
          onRemovePerson={onRemovePerson}
        />

        <div className="flex flex-col gap-2 text-xs">
          {showPrep ? (
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={prepDone}
                onCheckedChange={(v) => onPrepDone(v === true)}
                aria-label={`${PREP_OWNER_LABEL}: ${item.title}`}
              />
              <span>{PREP_OWNER_LABEL} complete</span>
            </label>
          ) : null}
          {showCatriaReview ? (
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={catriaReviewed}
                onCheckedChange={(v) => onCatriaReviewed(v === true)}
                aria-label={`${REVIEW_OWNER_LABEL} reviewed: ${item.title}`}
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
                    !approveEnabled && !catriaApproved ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                  )}
                >
                  <Checkbox
                    checked={catriaApproved}
                    disabled={!approveEnabled && !catriaApproved}
                    onCheckedChange={(v) => {
                      if (v === true && !approveEnabled) return;
                      onCatriaApproved(v === true);
                    }}
                    aria-label={`${REVIEW_OWNER_LABEL} approved: ${item.title}`}
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
          {showCatriaTaskFlagControls ? (
            <CatriaTaskFlagControls
              flags={catriaTaskFlags}
              onChange={onCatriaTaskFlagsChange}
              itemLabel={item.title}
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Status</span>
          <ChecklistStatusBadge status={status} onStatusChange={onStatusChange} />
        </div>

        <Textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Notes, SMID, Meta case ID…"
          rows={2}
          className="text-xs bg-background/50"
        />
      </div>
    </GlassCollapsibleCard>
  );
}

export function SubmissionChecklist() {
  const { user } = useApp();
  const isMobile = useIsMobile();
  const {
    state,
    setState,
    resetChecklist,
    clearChecklist,
    saveNow,
    saveItem,
    saveStatus,
    hasUnsavedChanges,
    dirtyItemIds,
    savingItemId,
    isLoading,
    serverSyncAvailable,
  } = useSubmissionChecklistProgress(user);
  const [activeTab, setActiveTab] = useState(TAB_CHECKLIST);
  const [channelFilter, setChannelFilter] = useState<ChecklistChannelFilter>("all");
  const [ownerTab, setOwnerTab] = useState<AssigneeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<Set<ChecklistItemStatus>>(() => new Set());
  const [cmsHighlightId, setCmsHighlightId] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const isAdmin = userHasAdminRole(user);

  const toggleSelected = useCallback((itemId: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  }, []);

  const applyBulkEdit = useCallback(
    (patch: Parameters<typeof applyBulkChecklistEdit>[2]) => {
      if (selectedIds.size === 0) return;
      setState((prev) => applyBulkChecklistEdit(prev, selectedIds, patch));
      setSelectedIds(new Set());
    },
    [selectedIds, setState],
  );

  const handleBulkRemove = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Clear progress and status for ${selectedIds.size} selected item${selectedIds.size === 1 ? "" : "s"}?`,
      )
    ) {
      return;
    }
    applyBulkEdit({ remove: true });
    toast.success("Selected items cleared");
  }, [applyBulkEdit, selectedIds.size]);

  const checklistItems = useMemo(
    () => allSubmissionChecklistItems().filter((i) => !i.id.startsWith("gap-")),
    [],
  );

  const carrierSyncedItems = useMemo(
    () => buildCarrierMainChecklistItems(state.carrierTasks),
    [state.carrierTasks],
  );

  const allChecklistItemsForProgress = useMemo(
    () => [...checklistItems, ...carrierSyncedItems],
    [checklistItems, carrierSyncedItems],
  );

  const itemNumbers = useMemo(() => {
    const base = checklistItemNumberById();
    const map = new Map(base);
    let next = base.size + 1;
    for (const item of carrierSyncedItems) {
      map.set(item.id, next++);
    }
    return map;
  }, [carrierSyncedItems]);
  const submissionNumbers = useMemo(() => submissionTaskNumberById(), []);

  const progressFixed = useMemo(() => {
    const done = allChecklistItemsForProgress.filter((item) =>
      isChecklistItemComplete(
        item,
        state.completed,
        state.catriaApproved,
        state.catriaReviewed,
        state.catriaTaskFlags,
      ),
    ).length;
    return {
      done,
      total: allChecklistItemsForProgress.length,
      percent: allChecklistItemsForProgress.length
        ? Math.round((done / allChecklistItemsForProgress.length) * 100)
        : 0,
    };
  }, [
    allChecklistItemsForProgress,
    state.catriaApproved,
    state.catriaReviewed,
    state.catriaTaskFlags,
    state.completed,
  ]);

  const checklistTabProgress = useMemo(
    () =>
      countChecklistProgress(
        allChecklistItemsForProgress,
        state.completed,
        state.catriaApproved,
        state.catriaReviewed,
        state.catriaTaskFlags,
      ),
    [
      allChecklistItemsForProgress,
      state.catriaApproved,
      state.catriaReviewed,
      state.catriaTaskFlags,
      state.completed,
    ],
  );

  const submissionsTabProgress = useMemo(
    () =>
      countSubmissionTasksProgress(
        SUBMISSION_TASK_ITEMS,
        state.submissionTasks,
        state.submissionTaskApproved,
        state.submissionTaskReviewed,
        state.submissionCatriaTaskFlags,
      ),
    [
      state.submissionCatriaTaskFlags,
      state.submissionTaskApproved,
      state.submissionTaskReviewed,
      state.submissionTasks,
    ],
  );

  const carrierTabProgress = useMemo(
    () =>
      countSubmissionTasksProgress(
        state.carrierTasks,
        state.carrierTaskDone,
        state.carrierTaskApproved,
        state.carrierTaskReviewed,
        state.carrierCatriaTaskFlags,
      ),
    [
      state.carrierCatriaTaskFlags,
      state.carrierTaskApproved,
      state.carrierTaskDone,
      state.carrierTaskReviewed,
      state.carrierTasks,
    ],
  );

  const linkedChecklistByRequirement = useMemo(() => checklistItemsByCmsRequirementId(), []);

  const carrierRequirementCount = useMemo(
    () => countCarrierRequirements(state.carrierTasks),
    [state.carrierTasks],
  );

  const mainTabs = useMemo(
    () => [
      { id: TAB_REFERENCE, label: "Reference", number: 1 },
      { id: TAB_CHECKLIST, label: "Checklist", number: 2, progress: checklistTabProgress },
      { id: TAB_SUBMISSIONS, label: "Submissions", number: 3, progress: submissionsTabProgress },
      {
        id: TAB_CARRIER,
        label:
          carrierRequirementCount > 0
            ? `Carrier · ${carrierRequirementCount}`
            : "Carrier",
        number: 4,
        progress: carrierTabProgress,
      },
    ],
    [carrierRequirementCount, carrierTabProgress, checklistTabProgress, submissionsTabProgress],
  );

  const allTabProgress = useMemo(
    () =>
      countChecklistProgress(
        checklistItems,
        state.completed,
        state.catriaApproved,
        state.catriaReviewed,
        state.catriaTaskFlags,
      ),
    [checklistItems, state.catriaApproved, state.catriaReviewed, state.catriaTaskFlags, state.completed],
  );

  const channelTabProgress = useMemo(() => {
    const map = {} as Record<ChecklistChannelFilter, { done: number; total: number }>;
    for (const tab of CHECKLIST_CHANNEL_TABS) {
      if (tab.id === "all") {
        map[tab.id] = allTabProgress;
        continue;
      }
      if (tab.id === "gaps") {
        map[tab.id] = countMetaAdConformanceProgress(state.metaAdConformanceRecords);
        continue;
      }
      const pool = checklistPoolForFilters(
        tab.id,
        ownerTab,
        checklistItems,
        state.itemAssignees,
        state.catriaTaskFlags,
      );
      map[tab.id] = countChecklistProgress(
        pool,
        state.completed,
        state.catriaApproved,
        state.catriaReviewed,
        state.catriaTaskFlags,
      );
    }
    return map;
  }, [
    allTabProgress,
    checklistItems,
    ownerTab,
    state.catriaApproved,
    state.catriaReviewed,
    state.catriaTaskFlags,
    state.completed,
    state.itemAssignees,
    state.metaAdConformanceRecords,
  ]);

  const ownerTabProgress = useMemo(() => {
    const map = {} as Record<AssigneeFilter | "all", { done: number; total: number }>;
    for (const tab of CHECKLIST_OWNER_TABS) {
      const pool = checklistPoolForFilters(
        channelFilter,
        tab.id,
        checklistItems,
        state.itemAssignees,
        state.catriaTaskFlags,
      );
      map[tab.id] = countChecklistProgress(
        pool,
        state.completed,
        state.catriaApproved,
        state.catriaReviewed,
        state.catriaTaskFlags,
      );
    }
    return map;
  }, [
    channelFilter,
    checklistItems,
    state.catriaApproved,
    state.catriaReviewed,
    state.catriaTaskFlags,
    state.completed,
    state.itemAssignees,
  ]);

  const handleReset = () => {
    if (!hasUnsavedChanges) return;
    if (!window.confirm("Discard unsaved changes and revert to the last saved state?")) {
      return;
    }
    resetChecklist();
    toast.success("Reverted to last saved state");
  };

  const handleClearAll = () => {
    if (
      !window.confirm(
        "Clear all checklist progress, notes, carrier tasks, and Meta ad records? Changes stay local until you click Save.",
      )
    ) {
      return;
    }
    clearChecklist();
    toast.success("Checklist cleared locally — click Save to persist");
  };

  const handleItemUpdate = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<
          SubmissionChecklistState,
          | "completed"
          | "catriaReviewed"
          | "catriaApproved"
          | "catriaTaskFlags"
          | "itemNotes"
          | "itemAssignees"
        >
      >,
    ) => {
      setState((prev) => {
        const hasChecklistSync =
          patch.completed !== undefined ||
          patch.catriaReviewed !== undefined ||
          patch.catriaApproved !== undefined ||
          patch.itemNotes !== undefined;
        let next: SubmissionChecklistState;
        if (hasChecklistSync && patch.itemAssignees === undefined) {
          next = applyMainChecklistItemPatch(prev, id, patch);
        } else {
          next = {
            ...prev,
            completed:
              patch.completed !== undefined
                ? applyBoolRecordPatch(prev.completed, patch.completed)
                : prev.completed,
            catriaReviewed:
              patch.catriaReviewed !== undefined
                ? applyBoolRecordPatch(prev.catriaReviewed, patch.catriaReviewed)
                : prev.catriaReviewed,
            catriaApproved:
              patch.catriaApproved !== undefined
                ? applyBoolRecordPatch(prev.catriaApproved, patch.catriaApproved)
                : prev.catriaApproved,
            catriaTaskFlags: patch.catriaTaskFlags
              ? {
                  ...prev.catriaTaskFlags,
                  ...Object.fromEntries(
                    Object.entries(patch.catriaTaskFlags).map(([key, value]) => [
                      key,
                      { ...prev.catriaTaskFlags[key], ...value },
                    ]),
                  ),
                }
              : prev.catriaTaskFlags,
            itemAssignees: patch.itemAssignees
              ? { ...prev.itemAssignees, ...patch.itemAssignees }
              : prev.itemAssignees,
            itemNotes: patch.itemNotes ? { ...prev.itemNotes, ...patch.itemNotes } : prev.itemNotes,
          };
        }

        const checkboxPatch =
          patch.completed !== undefined ||
          patch.catriaReviewed !== undefined ||
          patch.catriaApproved !== undefined;
        if (checkboxPatch) {
          const item = allSubmissionChecklistItems().find((entry) => entry.id === id);
          if (item) {
            const assignee = getChecklistItemAssignee(item, next.itemAssignees);
            const flags = getCatriaTaskFlags(id, next.catriaTaskFlags);
            const showPrepPersonRow = showsPrepPerson(item, assignee);
            const showCatriaPersonRow = showsCatriaPerson(item, assignee, next.catriaTaskFlags);
            next = syncItemProgressFromCheckboxes(next, id, {
              flags,
              showPrep: showPrepPersonRow,
              showCatria: showCatriaPersonRow,
              prepDone: !!next.completed[id],
              catriaReviewed: !!next.catriaReviewed[id],
              catriaApproved: !!next.catriaApproved[id],
            });
          }
        }
        return next;
      });
      if (isMobile) {
        setOpenSection(null);
      }
    },
    [isMobile, setState],
  );

  const handleItemPersonStatusChange = useCallback(
    (item: SubmissionChecklistItem, person: ChecklistPerson, status: ChecklistItemStatus) => {
      setState((prev) => {
        const assignee = getChecklistItemAssignee(item, prev.itemAssignees);
        const flags = getCatriaTaskFlags(item.id, prev.catriaTaskFlags);
        const showPrep = showsPrepPerson(item, assignee);
        return setItemPersonStatus(prev, item.id, person, status, flags, showPrep);
      });
    },
    [setState],
  );

  const handleSubmissionTaskCheckbox = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<
          SubmissionChecklistState,
          "submissionTasks" | "submissionTaskReviewed" | "submissionTaskApproved"
        >
      >,
    ) => {
      setState((prev) => {
        const task = SUBMISSION_TASK_ITEMS.find((entry) => entry.id === id);
        if (!task) return prev;
        return syncSubmissionTaskCheckboxProgress(prev, task, {
          done: patch.submissionTasks?.[id],
          reviewed: patch.submissionTaskReviewed?.[id],
          approved: patch.submissionTaskApproved?.[id],
        });
      });
    },
    [setState],
  );

  const handleSubmissionTaskPersonStatus = useCallback(
    (id: string, person: ChecklistPerson, status: ChecklistItemStatus) => {
      setState((prev) => {
        const task = SUBMISSION_TASK_ITEMS.find((entry) => entry.id === id);
        if (!task) return prev;
        return setTaskRowPersonStatus(prev, task, person, status, "submission");
      });
    },
    [setState],
  );

  const handleItemStatusChange = useCallback(
    (itemId: string, status: ChecklistItemStatus) => {
      setState((prev) => setChecklistItemStatus(prev, itemId, status));
    },
    [setState],
  );

  const handleCmsRequirementClick = useCallback((requirementId: string) => {
    setCmsHighlightId(requirementId);
    setActiveTab(TAB_REFERENCE);
    window.history.replaceState(null, "", `#${requirementId}`);
  }, []);

  const mainSections = SUBMISSION_CHECKLIST_SECTIONS.filter((s) => s.id !== "gaps");
  const gapsSection = SUBMISSION_CHECKLIST_SECTIONS.find((s) => s.id === "gaps");

  const matchesOwnerTab = useCallback(
    (item: SubmissionChecklistItem) =>
      checklistItemMatchesAssigneeFilter(
        item,
        ownerTab,
        state.itemAssignees,
        state.catriaTaskFlags,
      ),
    [ownerTab, state.itemAssignees, state.catriaTaskFlags],
  );

  const matchesStatusFilter = useCallback(
    (item: { id: string }) =>
      checklistItemMatchesStatusFilter(item.id, state.itemStatuses, statusFilter),
    [state.itemStatuses, statusFilter],
  );

  const filteredSubmissionTasks = useMemo(
    () => filterByChecklistItemStatus(SUBMISSION_TASK_ITEMS, state.itemStatuses, statusFilter),
    [state.itemStatuses, statusFilter],
  );

  const gapChecklistItems = useMemo(() => {
    const items = gapsSection?.items ?? [];
    return items.filter(matchesStatusFilter);
  }, [gapsSection?.items, matchesStatusFilter]);

  const visibleSections = useMemo(() => {
    if (channelFilter === "gaps") {
      return [];
    }
    const sections = mainSections
      .map((section) => ({
        ...section,
        items: section.items
          .filter((item) => itemMatchesChannelFilter(item, channelFilter))
          .filter(matchesOwnerTab)
          .filter(matchesStatusFilter),
      }))
      .filter((section) => section.items.length > 0);

    const carrierItems = carrierSyncedItems.filter(matchesOwnerTab).filter(matchesStatusFilter);
    if (carrierItems.length > 0 && (channelFilter === "all" || channelFilter === "website")) {
      sections.push({
        id: CARRIER_MAIN_CHECKLIST_SECTION_ID,
        title: CARRIER_MAIN_CHECKLIST_SECTION_TITLE,
        subtitle: CARRIER_MAIN_CHECKLIST_SECTION_SUBTITLE,
        items: carrierItems,
      });
    }

    return sections;
  }, [carrierSyncedItems, channelFilter, mainSections, matchesOwnerTab, matchesStatusFilter]);

  const dirtyItemIdSet = useMemo(() => new Set(dirtyItemIds), [dirtyItemIds]);

  const handleSave = async () => {
    const ok = await saveNow();
    if (ok) {
      toast.success(serverSyncAvailable ? "Checklist saved to team database" : "Checklist saved locally");
    }
  };

  const handleItemSave = async (itemId: string) => {
    const ok = await saveItem(itemId);
    if (ok) {
      toast.success(serverSyncAvailable ? "Item saved" : "Item saved locally");
    }
  };

  const renderItem = (item: SubmissionChecklistItem) => (
    <ChecklistItemRow
      key={item.id}
      item={item}
      itemNumber={itemNumbers.get(item.id) ?? 0}
      assignee={getChecklistItemAssignee(item, state.itemAssignees)}
      status={resolveChecklistItemStatus(item.id, state.itemStatuses)}
      prepDone={!!state.completed[item.id]}
      catriaReviewed={!!state.catriaReviewed[item.id]}
      catriaApproved={!!state.catriaApproved[item.id]}
      catriaTaskFlags={getCatriaTaskFlags(item.id, state.catriaTaskFlags)}
      personStatuses={state.personStatuses}
      note={state.itemNotes[item.id] ?? ""}
      isDirty={dirtyItemIdSet.has(item.id)}
      isSaving={savingItemId === item.id}
      bulkSelectEnabled={isAdmin}
      showCatriaTaskFlagControls={isAdmin}
      canRemoveAssignee={isAdmin}
      selected={selectedIds.has(item.id)}
      onSelectedChange={(v) => toggleSelected(item.id, v)}
      onPrepDone={(v) => handleItemUpdate(item.id, { completed: { [item.id]: v } })}
      onCatriaReviewed={(v) =>
        handleItemUpdate(item.id, { catriaReviewed: { [item.id]: v } })
      }
      onCatriaApproved={(v) =>
        handleItemUpdate(item.id, { catriaApproved: { [item.id]: v } })
      }
      onCatriaTaskFlagsChange={(flags) =>
        handleItemUpdate(item.id, { catriaTaskFlags: { [item.id]: flags } })
      }
      onAssigneeChange={(v) =>
        handleItemUpdate(item.id, { itemAssignees: { [item.id]: v } })
      }
      onRemovePerson={(person) => {
        const label = person === "prep" ? PREP_OWNER_LABEL : REVIEW_OWNER_LABEL;
        if (!window.confirm(`Remove ${label} from "${item.title}"? Their sub-tasks will be cleared.`)) {
          return;
        }
        setState((prev) =>
          removePersonFromMainChecklistItem(
            prev,
            item.id,
            person,
            getChecklistItemAssignee(item, prev.itemAssignees),
          ),
        );
      }}
      onPrepStatusChange={(status) => handleItemPersonStatusChange(item, "prep", status)}
      onCatriaStatusChange={(status) => handleItemPersonStatusChange(item, "review", status)}
      onStatusChange={(status) => handleItemStatusChange(item.id, status)}
      onNoteChange={(n) =>
        handleItemUpdate(item.id, { itemNotes: { [item.id]: n } })
      }
      onSave={() => void handleItemSave(item.id)}
      saveTooltip={CHECKLIST_TOOLTIPS.saveItem(serverSyncAvailable)}
      onCmsRequirementClick={handleCmsRequirementClick}
      defaultOpen={!isMobile}
    />
  );

  const saveButtonLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "error"
          ? "Save failed"
          : hasUnsavedChanges
            ? "Save all changes"
            : "Save all";

  const showItemsSaveAllBar = dirtyItemIds.length >= MULTIPLE_DIRTY_SAVE_THRESHOLD;
  const showHeaderSaveAll =
    hasUnsavedChanges && !(activeTab === TAB_CHECKLIST && showItemsSaveAllBar);
  const saveAllDisabled = saveStatus === "saving" || isLoading || !hasUnsavedChanges;

  const saveAllButton = (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button
            variant="default"
            size="sm"
            onClick={() => void handleSave()}
            disabled={saveAllDisabled}
            className={cn(
              saveStatus === "saved" && "bg-emerald hover:bg-emerald/90",
              showItemsSaveAllBar &&
                "animate-pulse bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500 ring-offset-2 font-semibold",
            )}
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {saveButtonLabel}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-xs">
        {CHECKLIST_TOOLTIPS.saveAll(serverSyncAvailable, hasUnsavedChanges)}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider delayDuration={300}>
    <div className="w-full space-y-3">
      <Card className="glass p-3 sm:p-4 border-primary/15 sticky top-2 z-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <h2 className="font-display text-base font-bold flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary shrink-0" />
              Compliance checklist
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {serverSyncAvailable
                ? "Changes save locally as you edit. Click Save to sync to the team database."
                : "Database not set up — changes are saved locally only. Contact an admin to apply migrations."}
              {isLoading ? " (loading…)" : null}
              {hasUnsavedChanges
                ? ` ${dirtyItemIds.length} unsaved item${dirtyItemIds.length === 1 ? "" : "s"}.`
                : null}
            </p>
          </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {showHeaderSaveAll ? saveAllButton : null}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={!hasUnsavedChanges || saveStatus === "saving" || isLoading}
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Reset
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs">
                  {CHECKLIST_TOOLTIPS.reset}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button variant="outline" size="sm" onClick={handleClearAll}>
                      Clear all
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs">
                  {CHECKLIST_TOOLTIPS.clearAll}
                </TooltipContent>
              </Tooltip>
            </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-3">
      <BenchmarkReportTabBar sections={mainTabs} />

      <TabsContent value={TAB_REFERENCE} className="mt-0">
        <CmsRequirementsReference
          highlightId={cmsHighlightId}
          linkedChecklistItemsByRequirementId={linkedChecklistByRequirement}
          renderChecklistItem={renderItem}
        />
      </TabsContent>

      <TabsContent value={TAB_CHECKLIST} className="mt-0 space-y-3">
        <Card className="glass p-3 sm:p-4 space-y-3 border-primary/15">
          <div className="space-y-1 min-w-0">
            <h2 className="font-display text-base font-bold">Checklist items</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {PREP_OWNER_LABEL} owns Meta account setup and internal prep; {REVIEW_OWNER_LABEL}{" "}
              approves front-facing copy, creative, and live-page compliance.
            </p>
          </div>
          <div className="flex items-center justify-between text-sm gap-2">
            <span className="font-semibold tabular-nums">
              {progressFixed.done}/{progressFixed.total} complete
            </span>
            <span className="text-xs text-muted-foreground">{progressFixed.percent}%</span>
          </div>
          <Progress value={progressFixed.percent} className="h-1.5" />
          {progressFixed.done === progressFixed.total && progressFixed.total > 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              All items complete — ready for launch sign-off.
            </div>
          ) : null}
        </Card>

        <div className="space-y-1 border-b border-border pb-2">
          <div className="flex flex-wrap items-center gap-1">
            {CHECKLIST_CHANNEL_TABS.map((tab) => (
              <ChecklistFilterBubble
                key={tab.id}
                label={tab.label}
                active={
                  tab.id === "all"
                    ? channelFilter === "all" && ownerTab === "all"
                    : channelFilter === tab.id
                }
                progress={channelTabProgress[tab.id]}
                onClick={() => {
                  if (tab.id === "all") {
                    setChannelFilter("all");
                    setOwnerTab("all");
                    return;
                  }
                  setChannelFilter(tab.id);
                }}
              />
            ))}
          </div>
          {channelFilter !== "gaps" ? (
            <div className="flex flex-wrap items-center gap-1">
              {CHECKLIST_OWNER_TABS.filter((tab) => tab.id !== "all").map((tab) => (
                <ChecklistFilterBubble
                  key={tab.id}
                  label={tab.label}
                  active={ownerTab === tab.id}
                  progress={ownerTabProgress[tab.id]}
                  onClick={() => setOwnerTab(tab.id)}
                />
              ))}
            </div>
          ) : null}
          <ChecklistStatusFilter
            selectedStatuses={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {showItemsSaveAllBar ? (
          <div
            className="sticky top-14 z-[9] -mx-0.5 px-0.5 py-1"
            data-testid="checklist-items-save-all-bar"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-500/40 bg-background/95 p-2.5 shadow-md backdrop-blur">
              <p className="text-xs text-muted-foreground">
                {dirtyItemIds.length} unsaved item{dirtyItemIds.length === 1 ? "" : "s"} — use per-item
                Save or save everything at once.
              </p>
              {saveAllButton}
            </div>
          </div>
        ) : null}

        {isAdmin ? (
          <ChecklistBulkEditToolbar
            selectedCount={selectedIds.size}
            onApplyAssignee={(assignee) => {
              const count = selectedIds.size;
              applyBulkEdit({ assignee });
              toast.success(`Assignee updated for ${count} item${count === 1 ? "" : "s"}`);
            }}
            onApplyStatus={(status) => {
              const count = selectedIds.size;
              applyBulkEdit({ status });
              toast.success(`Status updated for ${count} item${count === 1 ? "" : "s"}`);
            }}
            onRemove={handleBulkRemove}
            onClearSelection={() => setSelectedIds(new Set())}
          />
        ) : null}

        {channelFilter === "gaps" ? (
          <>
            <MetaAdConformancePanel state={state} onStateChange={setState} />
            {gapChecklistItems.length > 0 && gapsSection ? (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <h3 className="text-sm font-bold text-[var(--brand-navy)] px-0.5">{gapsSection.title}</h3>
                <p className="text-xs text-muted-foreground px-0.5">{gapsSection.subtitle}</p>
                {gapChecklistItems.map(renderItem)}
              </div>
            ) : null}
          </>
        ) : visibleSections.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No checklist items for this channel, owner, and status filter.
          </p>
        ) : (
          visibleSections.map((section) => {
            const isOpen = !isMobile || openSection === section.id || openSection === null;
            if (isMobile && openSection !== null && openSection !== section.id) {
              return (
                <button
                  key={section.id}
                  type="button"
                  className="w-full text-left rounded-md border border-border/70 px-3 py-2 text-sm font-semibold hover:bg-muted/40"
                  onClick={() => setOpenSection(section.id)}
                >
                  {section.title}
                  <span className="text-muted-foreground font-normal text-xs ml-2">
                    {
                      section.items.filter((i) =>
                        isChecklistItemComplete(
                          i,
                          state.completed,
                          state.catriaApproved,
                          state.catriaReviewed,
                          state.catriaTaskFlags,
                        ),
                      ).length
                    }
                    /{section.items.length}
                  </span>
                </button>
              );
            }

            return (
              <div key={section.id} className="space-y-2">
                {isMobile ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary underline"
                    onClick={() => setOpenSection(null)}
                  >
                    ← All sections
                  </button>
                ) : null}
                <h3 className="text-sm font-bold text-[var(--brand-navy)] px-0.5">{section.title}</h3>
                <p className="text-xs text-muted-foreground px-0.5">{section.subtitle}</p>
                {section.items.map(renderItem)}
                {section.id !== "gaps" ? (
                  <Textarea
                    value={state.sectionNotes[section.id] ?? ""}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        sectionNotes: { ...prev.sectionNotes, [section.id]: e.target.value },
                      }))
                    }
                    placeholder={`${section.title} notes (${REVIEW_OWNER_LABEL})…`}
                    rows={2}
                    className="text-xs"
                  />
                ) : null}
              </div>
            );
          })
        )}
      </TabsContent>

      <TabsContent value={TAB_SUBMISSIONS} className="mt-0 space-y-3">
        <Card className="glass p-3 border-primary/15">
          <h2 className="font-display text-base font-bold">Submission tasks</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Meta, CMS, and internal sign-offs with due dates. Each item assigns{" "}
            {PREP_OWNER_LABEL} one deliverable task and {REVIEW_OWNER_LABEL} separate review and
            approve tasks.
          </p>
        </Card>
        <ChecklistStatusFilter
          selectedStatuses={statusFilter}
          onChange={setStatusFilter}
          className="border-b border-border pb-2"
        />
        <SubmissionTaskList
          tasks={filteredSubmissionTasks}
          taskNumbers={submissionNumbers}
          done={state.submissionTasks}
          reviewed={state.submissionTaskReviewed}
          approved={state.submissionTaskApproved}
          catriaTaskFlags={state.submissionCatriaTaskFlags}
          taskAssignees={state.submissionTaskAssignees}
          itemStatuses={state.itemStatuses}
          personStatuses={state.personStatuses}
          notes={state.submissionTaskNotes}
          bulkSelectEnabled={isAdmin}
          canRemoveAssignee={isAdmin}
          selectedIds={selectedIds}
          onSelectedChange={toggleSelected}
          onDoneChange={(id, value) =>
            handleSubmissionTaskCheckbox(id, { submissionTasks: { [id]: value } })
          }
          onReviewedChange={(id, value) =>
            handleSubmissionTaskCheckbox(id, { submissionTaskReviewed: { [id]: value } })
          }
          onApprovedChange={(id, value) =>
            handleSubmissionTaskCheckbox(id, { submissionTaskApproved: { [id]: value } })
          }
          onCatriaTaskFlagsChange={(id, flags) =>
            setState((prev) => ({
              ...prev,
              submissionCatriaTaskFlags: {
                ...prev.submissionCatriaTaskFlags,
                [id]: { ...prev.submissionCatriaTaskFlags[id], ...flags },
              },
            }))
          }
          onRemovePerson={(id, person) => {
            const task = SUBMISSION_TASK_ITEMS.find((t) => t.id === id);
            const label = person === "prep" ? PREP_OWNER_LABEL : REVIEW_OWNER_LABEL;
            if (
              !task ||
              !window.confirm(`Remove ${label} from "${task.title}"? Their sub-tasks will be cleared.`)
            ) {
              return;
            }
            setState((prev) =>
              removePersonFromSubmissionTask(
                prev,
                id,
                person,
                getSubmissionTaskAssignee(task, prev.submissionTaskAssignees),
                "submission",
              ),
            );
          }}
          onPersonStatusChange={handleSubmissionTaskPersonStatus}
          onStatusChange={(id, status) =>
            setState((prev) => setChecklistItemStatus(prev, id, status))
          }
          onNoteChange={(id, value) =>
            setState((prev) => ({
              ...prev,
              submissionTaskNotes: { ...prev.submissionTaskNotes, [id]: value },
            }))
          }
          bulkToolbar={
            isAdmin ? (
              <ChecklistBulkEditToolbar
                selectedCount={selectedIds.size}
                onApplyAssignee={(assignee) => {
                  const count = selectedIds.size;
                  applyBulkEdit({ assignee });
                  toast.success(`Assignee updated for ${count} task${count === 1 ? "" : "s"}`);
                }}
                onApplyStatus={(status) => {
                  const count = selectedIds.size;
                  applyBulkEdit({ status });
                  toast.success(`Status updated for ${count} task${count === 1 ? "" : "s"}`);
                }}
                onRemove={handleBulkRemove}
                onClearSelection={() => setSelectedIds(new Set())}
              />
            ) : null
          }
        />
      </TabsContent>

      <TabsContent value={TAB_CARRIER} className="mt-0">
        <ChecklistStatusFilter
          selectedStatuses={statusFilter}
          onChange={setStatusFilter}
          className="border-b border-border pb-2 mb-3"
        />
        <CarrierChecklistPanel
          state={state}
          onStateChange={setState}
          statusFilter={statusFilter}
          bulkSelectEnabled={isAdmin}
          selectedIds={selectedIds}
          onSelectedChange={toggleSelected}
          bulkToolbar={
            isAdmin ? (
              <ChecklistBulkEditToolbar
                selectedCount={selectedIds.size}
                onApplyAssignee={(assignee) => {
                  const count = selectedIds.size;
                  applyBulkEdit({ assignee });
                  toast.success(
                    `Assignee updated for ${count} carrier task${count === 1 ? "" : "s"}`,
                  );
                }}
                onApplyStatus={(status) => {
                  const count = selectedIds.size;
                  applyBulkEdit({ status });
                  toast.success(`Status updated for ${count} carrier task${count === 1 ? "" : "s"}`);
                }}
                onRemove={handleBulkRemove}
                onClearSelection={() => setSelectedIds(new Set())}
              />
            ) : null
          }
        />
      </TabsContent>
    </Tabs>
    </div>
    </TooltipProvider>
  );
}
