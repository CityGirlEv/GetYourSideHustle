import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Trash2, Save, Pencil, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import {
  CARRIER_CHECKLIST_FILE_ACCEPT,
  carrierAssigneeLabel,
  carrierUploadOriginalTaskCount,
  carrierUploadTabLabel,
  isCarrierUploadCurated,
  applyBulkCurationIncluded,
  buildCurationDraftFromCurated,
  buildPendingCurationDraft,
  filterIncludedCurationTasks,
  parseCarrierChecklistText,
  readCarrierChecklistFile,
  resolveCurationDraftForUpload,
  type CarrierChecklistTask,
  type CarrierChecklistUploadMeta,
  type CarrierCurationDraftEntry,
} from "@/lib/submission-checklist-carrier";
import {
  carrierCuratedTasksForUpload,
  carrierOriginalTasksForUpload,
  clearCarrierChecklistTasks,
  renameCarrierUpload,
  saveCuratedCarrierChecklist,
  stageCarrierChecklistUpload,
  type CarrierCurationSelection,
  type SubmissionChecklistState,
} from "@/lib/submission-checklist-storage";
import {
  setChecklistItemStatus,
  removePersonFromSubmissionTask,
  setTaskRowPersonStatus,
  syncCarrierTaskCheckboxProgress,
} from "@/lib/submission-checklist-bulk";
import { SubmissionTaskList } from "@/components/SubmissionTaskList";
import { CarrierCurationBulkToolbar } from "@/components/CarrierCurationBulkToolbar";
import { useConfirm } from "@/components/ConfirmDialog";
import {
  CHECKLIST_ASSIGNEE_OPTIONS,
  PREP_OWNER_LABEL,
  REVIEW_OWNER_LABEL,
  filterByChecklistItemStatus,
  getSubmissionTaskAssignee,
  type ChecklistItemStatus,
} from "@/lib/submission-checklist-data";
import { BENCHMARK_REPORT_TAB_TRIGGER_CLASS } from "@/lib/benchmark-report-ui";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CarrierChecklistPanelProps = {
  state: SubmissionChecklistState;
  onStateChange: (next: SubmissionChecklistState) => void;
  statusFilter?: ReadonlySet<ChecklistItemStatus>;
  bulkSelectEnabled?: boolean;
  selectedIds?: ReadonlySet<string>;
  onSelectedChange?: (id: string, selected: boolean) => void;
  bulkToolbar?: ReactNode;
};

const VIEW_ORIGINAL = "original";
const VIEW_SAVED = "saved";

function CarrierNameEditor({
  upload,
  onRename,
}: {
  upload: CarrierChecklistUploadMeta;
  onRename: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(upload.carrierName);

  useEffect(() => {
    if (!editing) setDraft(upload.carrierName);
  }, [upload.carrierName, editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(upload.carrierName);
      setEditing(false);
      return;
    }
    if (trimmed !== upload.carrierName.trim()) {
      onRename(trimmed);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(upload.carrierName);
              setEditing(false);
            }
          }}
          onBlur={commit}
          autoFocus
          className="h-8 max-w-xs text-sm"
          aria-label="Carrier name"
        />
        <Button type="button" variant="ghost" size="sm" className="h-8" onClick={commit}>
          <Check className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="text-sm font-semibold">{upload.carrierName.trim() || "Carrier"}</h3>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2"
        onClick={() => setEditing(true)}
        aria-label="Edit carrier name"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function CarrierCurationList({
  tasks,
  draft,
  readOnly,
  onToggleIncluded,
  bulkSelectEnabled,
  selectedIds,
  onSelectedChange,
  onSelectAll,
}: {
  tasks: CarrierChecklistTask[];
  draft: Record<string, CarrierCurationDraftEntry>;
  readOnly?: boolean;
  onToggleIncluded?: (taskId: string, included: boolean) => void;
  bulkSelectEnabled?: boolean;
  selectedIds?: ReadonlySet<string>;
  onSelectedChange?: (taskId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">No items in this upload.</p>
    );
  }

  const allSelected =
    bulkSelectEnabled && tasks.length > 0 && tasks.every((task) => selectedIds?.has(task.id));

  return (
    <div className="space-y-2">
      {!readOnly && bulkSelectEnabled ? (
        <div className="flex items-center gap-2 px-1 pb-1">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(v) => onSelectAll?.(v === true)}
            aria-label="Select all items"
          />
          <span className="text-[11px] text-muted-foreground">Select all</span>
        </div>
      ) : null}
      <ul className="space-y-2">
        {tasks.map((task, index) => {
          const entry = draft[task.id] ?? { included: true };
          return (
            <li
              key={task.id}
              className={cn(
                "rounded-md border border-border/60 bg-muted/20 px-3 py-2 space-y-1.5",
                selectedIds?.has(task.id) && "ring-1 ring-primary/40",
              )}
            >
              <div className="flex flex-wrap items-start gap-2">
                {!readOnly && bulkSelectEnabled ? (
                  <Checkbox
                    checked={selectedIds?.has(task.id) ?? false}
                    onCheckedChange={(v) => onSelectedChange?.(task.id, v === true)}
                    aria-label={`Select ${task.title}`}
                    className="mt-0.5"
                  />
                ) : null}
                {!readOnly ? (
                  <Checkbox
                    checked={entry.included}
                    onCheckedChange={(v) => onToggleIncluded?.(task.id, v === true)}
                    aria-label={`Include ${task.title}`}
                    className="mt-0.5"
                  />
                ) : null}
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs font-medium leading-snug">
                    {index + 1}. {task.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Line {task.lineNumber}
                    {readOnly ? ` · ${carrierAssigneeLabel(task.assignee)}` : " · include in saved checklist"}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CarrierChecklistPanel({
  state,
  onStateChange,
  statusFilter,
  bulkSelectEnabled,
  selectedIds,
  onSelectedChange,
  bulkToolbar,
}: CarrierChecklistPanelProps) {
  const { user } = useApp();
  const confirm = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);
  const importCardRef = useRef<HTMLDivElement>(null);
  const [carrierName, setCarrierName] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [importing, setImporting] = useState(false);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const [curationDrafts, setCurationDrafts] = useState<
    Record<string, Record<string, CarrierCurationDraftEntry>>
  >({});
  const [curationSelectedIds, setCurationSelectedIds] = useState<Record<string, Set<string>>>({});
  const [editingUploadId, setEditingUploadId] = useState<string | null>(null);
  const [uploadViewMode, setUploadViewMode] = useState<Record<string, typeof VIEW_ORIGINAL | typeof VIEW_SAVED>>(
    {},
  );

  useEffect(() => {
    if (state.carrierUploads.length === 0) {
      setActiveUploadId(null);
      return;
    }
    if (!activeUploadId || !state.carrierUploads.some((upload) => upload.id === activeUploadId)) {
      setActiveUploadId(state.carrierUploads[0]?.id ?? null);
    }
  }, [state.carrierUploads, activeUploadId]);

  const stageUpload = (text: string, fileName?: string) => {
    const name = carrierName.trim() || fileName?.replace(/\.[^.]+$/, "") || "Carrier";
    if (!text.trim()) {
      toast.error("Paste checklist lines or upload a file first.");
      return;
    }

    const uploadId = `upload-${Date.now()}`;
    const tasks = parseCarrierChecklistText(text, {
      carrierName: name,
      sourceFile: fileName,
      uploadId,
    });

    if (tasks.length === 0) {
      toast.error("No checklist items found — use one task per line.");
      return;
    }

    const upload: CarrierChecklistUploadMeta = {
      id: uploadId,
      carrierName: name,
      fileName,
      uploadedAt: new Date().toISOString(),
      originalTaskCount: tasks.length,
    };

    onStateChange(stageCarrierChecklistUpload(state, tasks, upload));
    setActiveUploadId(uploadId);
    setEditingUploadId(uploadId);
    setCurationDrafts((prev) => ({
      ...prev,
      [uploadId]: buildPendingCurationDraft(tasks),
    }));
    setPasteText("");
    toast.success(`Parsed ${tasks.length} items — select what to include, then save the checklist.`);
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setImporting(true);
    try {
      const text = await readCarrierChecklistFile(file);
      if (!carrierName.trim()) {
        setCarrierName(file.name.replace(/\.[^.]+$/, ""));
      }
      stageUpload(text, file.name);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read file.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleClear = () => {
    if (!state.carrierOriginalTasks.length && !state.carrierTasks.length) return;
    if (!window.confirm("Remove all imported carrier checklist tasks?")) return;
    onStateChange(clearCarrierChecklistTasks(state));
    setActiveUploadId(null);
    setCurationDrafts({});
    setEditingUploadId(null);
    toast.success("Carrier checklist cleared");
  };

  const getDraftForUpload = (uploadId: string): Record<string, CarrierCurationDraftEntry> => {
    const upload = state.carrierUploads.find((entry) => entry.id === uploadId);
    return resolveCurationDraftForUpload(
      curationDrafts[uploadId],
      carrierOriginalTasksForUpload(state, uploadId),
      carrierCuratedTasksForUpload(state, uploadId),
      upload,
    );
  };

  const resolveDraftFromState = (
    prevDrafts: Record<string, Record<string, CarrierCurationDraftEntry>>,
    uploadId: string,
  ): Record<string, CarrierCurationDraftEntry> => {
    const upload = state.carrierUploads.find((entry) => entry.id === uploadId);
    return resolveCurationDraftForUpload(
      prevDrafts[uploadId],
      carrierOriginalTasksForUpload(state, uploadId),
      carrierCuratedTasksForUpload(state, uploadId),
      upload,
    );
  };

  const updateDraftEntry = (
    uploadId: string,
    taskId: string,
    patch: Partial<CarrierCurationDraftEntry>,
  ) => {
    setCurationDrafts((prev) => {
      const current = prev[uploadId] ?? getDraftForUpload(uploadId);
      const entry = current[taskId] ?? { included: true };
      return {
        ...prev,
        [uploadId]: {
          ...current,
          [taskId]: { ...entry, ...patch },
        },
      };
    });
  };

  const getCurationSelection = (uploadId: string): Set<string> =>
    curationSelectedIds[uploadId] ?? new Set();

  const toggleCurationSelected = (uploadId: string, taskId: string, selected: boolean) => {
    setCurationSelectedIds((prev) => {
      const current = new Set(prev[uploadId] ?? []);
      if (selected) current.add(taskId);
      else current.delete(taskId);
      return { ...prev, [uploadId]: current };
    });
  };

  const selectAllCuration = (uploadId: string, taskIds: string[], selected: boolean) => {
    setCurationSelectedIds((prev) => ({
      ...prev,
      [uploadId]: selected ? new Set(taskIds) : new Set(),
    }));
  };

  const bulkCurationKeep = (uploadId: string) => {
    const selected = getCurationSelection(uploadId);
    if (selected.size === 0) return;
    setCurationDrafts((prev) => ({
      ...prev,
      [uploadId]: applyBulkCurationIncluded(resolveDraftFromState(prev, uploadId), selected, true),
    }));
    clearCurationSelection(uploadId);
  };

  const bulkCurationDiscard = async (uploadId: string) => {
    const selected = getCurationSelection(uploadId);
    if (selected.size === 0) return;
    const count = selected.size;
    if (
      !(await confirm({
        title: "Discard selected items?",
        description: `Discard ${count} selected item${count === 1 ? "" : "s"} from the curated checklist? They will be excluded until you Keep them again.`,
        confirmLabel: "Discard",
        destructive: true,
      }))
    ) {
      return;
    }
    setCurationDrafts((prev) => ({
      ...prev,
      [uploadId]: applyBulkCurationIncluded(resolveDraftFromState(prev, uploadId), selected, false),
    }));
    clearCurationSelection(uploadId);
  };

  const clearCurationSelection = (uploadId: string) => {
    setCurationSelectedIds((prev) => ({ ...prev, [uploadId]: new Set() }));
  };

  const handleRenameCarrier = (uploadId: string, name: string) => {
    onStateChange(renameCarrierUpload(state, uploadId, name));
    toast.success(`Carrier renamed to ${name}`);
  };

  const focusImportSection = () => {
    importCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setCarrierName("");
    setPasteText("");
  };

  const handleSaveCuration = (uploadId: string) => {
    const original = carrierOriginalTasksForUpload(state, uploadId);
    const draft = getDraftForUpload(uploadId);
    const selections: CarrierCurationSelection[] = original.map((task) => ({
      taskId: task.id,
      included: draft[task.id]?.included ?? false,
    }));
    const includedCount = selections.filter((entry) => entry.included).length;
    if (includedCount === 0) {
      toast.error("Include at least one item in the saved checklist.");
      return;
    }

    onStateChange(
      saveCuratedCarrierChecklist(state, uploadId, selections, user?.email ?? user?.id ?? "admin"),
    );
    setEditingUploadId(null);
    setUploadViewMode((prev) => ({ ...prev, [uploadId]: VIEW_SAVED }));
    setCurationDrafts((prev) => {
      const next = { ...prev };
      delete next[uploadId];
      return next;
    });
    toast.success(`Saved checklist with ${includedCount} item${includedCount === 1 ? "" : "s"}.`);
  };

  const pendingCurationCount = useMemo(
    () =>
      state.carrierUploads.filter(
        (upload) => !isCarrierUploadCurated(upload) || editingUploadId === upload.id,
      ).length,
    [editingUploadId, state.carrierUploads],
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-4">
        <Card ref={importCardRef} className="glass p-4 space-y-3 border-primary/15">
          <h2 className="font-display text-base font-bold">Import carrier checklist</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Upload a carrier compliance checklist (.txt, .csv, .tsv, .pdf, .docx) or paste one item
            per line. After upload, choose which deliverables belong in the saved checklist.
            Kept items are assigned to both {PREP_OWNER_LABEL} and {REVIEW_OWNER_LABEL} — Evelyn
            delivers, Catria reviews and approves.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="carrier-name" className="text-xs">
              Carrier / plan sponsor name
            </Label>
            <Input
              id="carrier-name"
              value={carrierName}
              onChange={(e) => setCarrierName(e.target.value)}
              placeholder="e.g. Humana, UHC, Aetna MA"
              className="text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept={CARRIER_CHECKLIST_FILE_ACCEPT}
              className="hidden"
              onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={importing}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload file
            </Button>
            {state.carrierUploads.length > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear imported
              </Button>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="carrier-paste" className="text-xs">
              Or paste checklist lines
            </Label>
            <Textarea
              id="carrier-paste"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={
                "SMID on file for landing page\nTPMO disclaimer in ad primary text\nPrivacy policy linked from footer"
              }
              rows={5}
              className="text-xs font-mono"
            />
            <Button
              type="button"
              size="sm"
              disabled={importing || !pasteText.trim()}
              onClick={() => stageUpload(pasteText)}
            >
              Parse lines for curation
            </Button>
          </div>

          {pendingCurationCount > 0 ? (
            <p className="text-[11px] text-amber-800 dark:text-amber-200">
              {pendingCurationCount} upload{pendingCurationCount === 1 ? "" : "s"} waiting to save a
              curated checklist.
            </p>
          ) : null}
        </Card>

        {state.carrierUploads.length > 0 ? (
          <Tabs
            value={activeUploadId ?? state.carrierUploads[0]?.id}
            onValueChange={setActiveUploadId}
            className="w-full space-y-0"
          >
            <div className="border-b border-border">
              <TabsList
                className={cn(
                  "flex h-auto min-w-0 flex-1 items-end gap-0 rounded-none bg-transparent p-0",
                  "flex-nowrap overflow-x-auto justify-start [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  "w-full",
                )}
              >
                {state.carrierUploads.map((upload) => {
                  const curatedCount = carrierCuratedTasksForUpload(state, upload.id).length;
                  const tabLabel = carrierUploadTabLabel(upload, curatedCount);
                  const isDraft = !isCarrierUploadCurated(upload);
                  return (
                    <TabsTrigger
                      key={upload.id}
                      value={upload.id}
                      className={cn(
                        BENCHMARK_REPORT_TAB_TRIGGER_CLASS,
                        "shrink-0 max-w-[16rem] truncate",
                      )}
                      title={tabLabel}
                    >
                      {tabLabel}
                      {isDraft ? " · draft" : ""}
                    </TabsTrigger>
                  );
                })}
                <button
                  type="button"
                  onClick={focusImportSection}
                  className={cn(
                    BENCHMARK_REPORT_TAB_TRIGGER_CLASS,
                    "shrink-0 inline-flex items-center gap-1 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add carrier
                </button>
              </TabsList>
            </div>

            {state.carrierUploads.map((upload) => {
              const originalTasks = carrierOriginalTasksForUpload(state, upload.id);
              const curatedTasks = carrierCuratedTasksForUpload(state, upload.id);
              const visibleCuratedTasks = filterByChecklistItemStatus(
                curatedTasks,
                state.itemStatuses,
                statusFilter ?? new Set(),
              );
              const isCurated = isCarrierUploadCurated(upload);
              const isEditing = editingUploadId === upload.id || !isCurated;
              const draft = getDraftForUpload(upload.id);
              const visibleCurationTasks = filterIncludedCurationTasks(originalTasks, draft);
              const viewMode = uploadViewMode[upload.id] ?? VIEW_SAVED;
              const originalCount = carrierUploadOriginalTaskCount(upload);

              return (
                <TabsContent key={upload.id} value={upload.id} className="mt-3 space-y-3">
                  <CarrierNameEditor
                    upload={upload}
                    onRename={(name) => handleRenameCarrier(upload.id, name)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {originalCount} original items
                    {isCurated
                      ? ` · ${upload.curatedTaskCount ?? curatedTasks.length} saved`
                      : " · not saved yet"}
                    {upload.fileName ? ` · ${upload.fileName}` : null}
                    {" · "}
                    imported {new Date(upload.uploadedAt).toLocaleString()}
                    {upload.curatedAt
                      ? ` · saved ${new Date(upload.curatedAt).toLocaleString()}`
                      : null}
                  </p>

                  {isEditing ? (
                    <Card className="glass p-3 space-y-3 border-primary/15">
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold">Curate checklist items</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Select rows for bulk keep/discard, or toggle each item to include in the
                          saved carrier checklist. Saved items sync to the main checklist for both{" "}
                          {PREP_OWNER_LABEL} and {REVIEW_OWNER_LABEL}.
                        </p>
                      </div>
                      <CarrierCurationBulkToolbar
                        selectedCount={getCurationSelection(upload.id).size}
                        onKeep={() => bulkCurationKeep(upload.id)}
                        onDiscard={() => void bulkCurationDiscard(upload.id)}
                        onClearSelection={() => clearCurationSelection(upload.id)}
                      />
                      <CarrierCurationList
                        tasks={visibleCurationTasks}
                        draft={draft}
                        bulkSelectEnabled
                        selectedIds={getCurationSelection(upload.id)}
                        onSelectedChange={(taskId, selected) =>
                          toggleCurationSelected(upload.id, taskId, selected)
                        }
                        onSelectAll={(selected) =>
                          selectAllCuration(
                            upload.id,
                            visibleCurationTasks.map((task) => task.id),
                            selected,
                          )
                        }
                        onToggleIncluded={(taskId, included) =>
                          updateDraftEntry(upload.id, taskId, { included })
                        }
                      />
                      <div className="flex flex-wrap gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleSaveCuration(upload.id)}
                            >
                              <Save className="h-3.5 w-3.5 mr-1.5" />
                              Save curated checklist
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            Persist the selected items as the official carrier checklist and sync
                            them to the main compliance checklist for both assignees.
                          </TooltipContent>
                        </Tooltip>
                        {isCurated ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUploadId(null)}
                          >
                            Cancel
                          </Button>
                        ) : null}
                      </div>
                    </Card>
                  ) : (
                    <>
                      <Tabs
                        value={viewMode}
                        onValueChange={(value) =>
                          setUploadViewMode((prev) => ({
                            ...prev,
                            [upload.id]: value as typeof VIEW_ORIGINAL | typeof VIEW_SAVED,
                          }))
                        }
                      >
                        <TabsList className="h-8">
                          <TabsTrigger value={VIEW_SAVED} className="text-xs">
                            Saved checklist
                          </TabsTrigger>
                          <TabsTrigger value={VIEW_ORIGINAL} className="text-xs">
                            Original upload
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value={VIEW_SAVED} className="mt-3 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[11px] text-muted-foreground">
                              Working checklist — {curatedTasks.length} item
                              {curatedTasks.length === 1 ? "" : "s"}
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingUploadId(upload.id);
                                setCurationDrafts((prev) => ({
                                  ...prev,
                                  [upload.id]: buildCurationDraftFromCurated(
                                    originalTasks,
                                    curatedTasks,
                                  ),
                                }));
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1.5" />
                              Re-curate
                            </Button>
                          </div>
                          {visibleCuratedTasks.length > 0 ? (
                            <SubmissionTaskList
                              tasks={visibleCuratedTasks}
                              taskNumbers={new Map(
                                visibleCuratedTasks.map((task, index) => [task.id, index + 1]),
                              )}
                              done={state.carrierTaskDone}
                              reviewed={state.carrierTaskReviewed}
                              approved={state.carrierTaskApproved}
                              catriaTaskFlags={state.carrierCatriaTaskFlags}
                              itemStatuses={state.itemStatuses}
                              personStatuses={state.personStatuses}
                              notes={state.carrierTaskNotes}
                              bulkSelectEnabled={bulkSelectEnabled}
                              canRemoveAssignee={bulkSelectEnabled}
                              selectedIds={selectedIds}
                              onSelectedChange={onSelectedChange}
                              bulkToolbar={bulkToolbar}
                              onDoneChange={(id, value) =>
                                onStateChange((prev) => {
                                  const task = prev.carrierTasks.find((entry) => entry.id === id);
                                  if (!task) return prev;
                                  return syncCarrierTaskCheckboxProgress(prev, task, { done: value });
                                })
                              }
                              onReviewedChange={(id, value) =>
                                onStateChange((prev) => {
                                  const task = prev.carrierTasks.find((entry) => entry.id === id);
                                  if (!task) return prev;
                                  return syncCarrierTaskCheckboxProgress(prev, task, {
                                    reviewed: value,
                                  });
                                })
                              }
                              onApprovedChange={(id, value) =>
                                onStateChange((prev) => {
                                  const task = prev.carrierTasks.find((entry) => entry.id === id);
                                  if (!task) return prev;
                                  return syncCarrierTaskCheckboxProgress(prev, task, {
                                    approved: value,
                                  });
                                })
                              }
                              onCatriaTaskFlagsChange={(id, flags) =>
                                onStateChange({
                                  ...state,
                                  carrierCatriaTaskFlags: {
                                    ...state.carrierCatriaTaskFlags,
                                    [id]: {
                                      ...state.carrierCatriaTaskFlags[id],
                                      ...flags,
                                    },
                                  },
                                })
                              }
                              onRemovePerson={(id, person) => {
                                const task = curatedTasks.find((t) => t.id === id);
                                const label = person === "prep" ? PREP_OWNER_LABEL : REVIEW_OWNER_LABEL;
                                if (
                                  !task ||
                                  !window.confirm(
                                    `Remove ${label} from "${task.title}"? Their sub-tasks will be cleared.`,
                                  )
                                ) {
                                  return;
                                }
                                onStateChange((prev) =>
                                  removePersonFromSubmissionTask(
                                    prev,
                                    id,
                                    person,
                                    getSubmissionTaskAssignee(task, prev.submissionTaskAssignees),
                                    "carrier",
                                  ),
                                );
                              }}
                              onPersonStatusChange={(id, person, status) =>
                                onStateChange((prev) => {
                                  const task = prev.carrierTasks.find((entry) => entry.id === id);
                                  if (!task) return prev;
                                  return setTaskRowPersonStatus(prev, task, person, status, "carrier");
                                })
                              }
                              onStatusChange={(id, status) =>
                                onStateChange((prev) => setChecklistItemStatus(prev, id, status))
                              }
                              onNoteChange={(id, value) =>
                                onStateChange({
                                  ...state,
                                  carrierTaskNotes: { ...state.carrierTaskNotes, [id]: value },
                                })
                              }
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-6">
                              No saved items — re-curate to include tasks.
                            </p>
                          )}
                        </TabsContent>

                        <TabsContent value={VIEW_ORIGINAL} className="mt-3">
                          <p className="text-[11px] text-muted-foreground mb-2">
                            Read-only reference — full upload dump ({originalTasks.length} items)
                          </p>
                          <CarrierCurationList
                            tasks={originalTasks}
                            draft={Object.fromEntries(
                              originalTasks.map((task) => [
                                task.id,
                                { included: true },
                              ]),
                            )}
                            readOnly
                          />
                        </TabsContent>
                      </Tabs>
                    </>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            No carrier tasks yet — import a checklist above.
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}
