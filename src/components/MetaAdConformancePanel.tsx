import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCollapsibleCard } from "@/components/GlassCollapsibleCard";
import { ChecklistOwnerTabBar } from "@/components/ChecklistOwnerTabBar";
import {
  createMetaAdConformanceRecord,
  deriveMetaAdStatus,
  filterMetaAdRecordsByAssignee,
  getMetaAdRecordAssignee,
  metaAdStatusLabel,
  META_AD_ASSET_ACCEPT,
  readMetaAdAssetFile,
  withDerivedMetaAdStatus,
  countMetaAdConformanceProgress,
  type MetaAdConformanceRecord,
} from "@/lib/submission-checklist-meta-ads";
import {
  removeMetaAdConformanceRecordFromState,
  upsertMetaAdConformanceRecordInState,
  type SubmissionChecklistState,
} from "@/lib/submission-checklist-storage";
import {
  groupMetaAdConformanceChecklistByCategory,
  resolveMetaAdChecklistItemProgress,
  seedMetaAdRecordFromGlobalChecklist,
  updateMetaAdRecordChecklistProgress,
  countMetaAdRecordChecklistProgress,
} from "@/lib/submission-checklist-meta-ad-sync";
import {
  assigneeLabel,
  CHECKLIST_ASSIGNEE_OPTIONS,
  CHECKLIST_OWNER_TABS,
  checklistItemNumberById,
  PREP_OWNER_LABEL,
  REVIEW_OWNER_LABEL,
  type AssigneeFilter,
  type ChecklistOwner,
  type SubmissionChecklistItem,
} from "@/lib/submission-checklist-data";
import { cn } from "@/lib/utils";
import { CheckCircle2, ExternalLink, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

type MetaAdConformancePanelProps = {
  state: SubmissionChecklistState;
  onStateChange: (next: SubmissionChecklistState) => void;
};

function formatDisplayDate(iso?: string): string {
  if (!iso) return "—";
  const d = iso.slice(0, 10);
  return d || "—";
}

function statusBadgeClass(status: MetaAdConformanceRecord["status"]): string {
  switch (status) {
    case "ready":
      return "border-emerald/40 bg-emerald/10 text-emerald-800 dark:text-emerald-200";
    case "approved":
      return "border-primary/40 bg-primary/10 text-primary";
    case "submitted":
      return "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100";
    default:
      return "border-border/70 bg-muted/30 text-muted-foreground";
  }
}

function MetaAdChecklistSection({
  item,
  itemNumber,
  globalState,
  record,
  onProgressChange,
}: {
  item: SubmissionChecklistItem;
  itemNumber: number;
  globalState: SubmissionChecklistState;
  record: MetaAdConformanceRecord;
  onProgressChange: (
    itemId: string,
    patch: { prepDone?: boolean; catriaApproved?: boolean; note?: string },
  ) => void;
}) {
  const resolved = resolveMetaAdChecklistItemProgress(item, globalState, record.checklistProgress);
  const showPrep = item.owner === "prep";
  const showCatria = item.owner === "review" || item.requiresCatriaApproval;
  const category = item.id.startsWith("cms-")
    ? "CMS"
    : item.id.startsWith("gap-")
      ? "Gap"
      : "Creative";

  return (
    <div
      className={cn(
        "rounded-md border border-border/50 bg-muted/20 p-2 space-y-1.5",
        resolved.complete && "border-emerald/30 bg-emerald/5",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-1">
        <p className="text-[11px] font-medium leading-snug">
          {itemNumber}. {item.title}
        </p>
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground shrink-0">
          {category}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {showPrep ? (
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={resolved.prepDone}
              disabled={resolved.inheritedFromGlobal.prepDone}
              onCheckedChange={(v) => onProgressChange(item.id, { prepDone: v === true })}
              aria-label={`${PREP_OWNER_LABEL}: ${item.title}`}
            />
            <span className={cn(resolved.inheritedFromGlobal.prepDone && "text-muted-foreground")}>
              {PREP_OWNER_LABEL} complete
              {resolved.inheritedFromGlobal.prepDone ? " (from checklist)" : ""}
            </span>
          </label>
        ) : null}
        {showCatria ? (
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={resolved.catriaApproved}
              disabled={resolved.inheritedFromGlobal.catriaApproved}
              onCheckedChange={(v) => onProgressChange(item.id, { catriaApproved: v === true })}
              aria-label={`${REVIEW_OWNER_LABEL} approved: ${item.title}`}
            />
            <span
              className={cn(resolved.inheritedFromGlobal.catriaApproved && "text-muted-foreground")}
            >
              {REVIEW_OWNER_LABEL} approved
              {resolved.inheritedFromGlobal.catriaApproved ? " (from checklist)" : ""}
            </span>
          </label>
        ) : null}
      </div>
    </div>
  );
}

function MetaAdRecordCard({
  record,
  globalState,
  onChange,
  onRemove,
  onChecklistProgressChange,
}: {
  record: MetaAdConformanceRecord;
  globalState: SubmissionChecklistState;
  onChange: (next: MetaAdConformanceRecord) => void;
  onRemove: () => void;
  onChecklistProgressChange: (
    recordId: string,
    itemId: string,
    patch: { prepDone?: boolean; catriaApproved?: boolean; note?: string },
  ) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const status = deriveMetaAdStatus(record);
  const complete = status === "ready";
  const itemNumbers = useMemo(() => checklistItemNumberById(), []);
  const checklistGroups = useMemo(() => groupMetaAdConformanceChecklistByCategory(), []);
  const checklistProgress = countMetaAdRecordChecklistProgress(record, globalState);

  const patch = (partial: Partial<MetaAdConformanceRecord>) => {
    onChange(withDerivedMetaAdStatus({ ...record, ...partial }));
  };

  const handleAsset = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const asset = await readMetaAdAssetFile(file);
      patch({ asset });
      toast.success(`Uploaded ${file.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload asset.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleMarkSubmitted = () => {
    const today = new Date().toISOString().slice(0, 10);
    patch({ dateSubmitted: record.dateSubmitted ?? today });
  };

  const handleReadyToGo = (checked: boolean) => {
    if (checked && !record.dateApproved) {
      toast.error(`Set ${REVIEW_OWNER_LABEL} approval date before marking ready to go.`);
      return;
    }
    if (checked && !record.catriaApproved) {
      toast.error(`${REVIEW_OWNER_LABEL} must sign off before marking ready to go.`);
      return;
    }
    patch({ readyToGo: checked });
  };

  const handleCatriaApproved = (checked: boolean) => {
    patch({
      catriaApproved: checked,
      catriaReviewedAt: checked ? new Date().toISOString().slice(0, 10) : undefined,
      readyToGo: checked ? record.readyToGo : false,
    });
  };

  return (
    <GlassCollapsibleCard
      title={record.label.trim() || "Untitled ad"}
      subtitle={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", statusBadgeClass(status))}>
            {metaAdStatusLabel(status)}
          </span>
          {record.dateSubmitted ? (
            <span>Submitted {formatDisplayDate(record.dateSubmitted)}</span>
          ) : null}
          {record.dateApproved ? (
            <span>Approved {formatDisplayDate(record.dateApproved)}</span>
          ) : null}
          {record.asset ? <span>· {record.asset.fileName}</span> : null}
        </span>
      }
      defaultOpen={!complete}
      className={cn("border-border/60", complete && "border-emerald/25")}
      headerExtra={
        complete ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald shrink-0" aria-hidden />
        ) : null
      }
    >
      <div className="space-y-3 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">Assignee</span>
          <Select
            value={getMetaAdRecordAssignee(record)}
            onValueChange={(v) => patch({ assignee: v as ChecklistOwner })}
          >
            <SelectTrigger className="h-7 w-[9rem] text-xs bg-background/50">
              <SelectValue>{assigneeLabel(getMetaAdRecordAssignee(record))}</SelectValue>
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

        <div className="space-y-1.5">
          <Label htmlFor={`meta-ad-label-${record.id}`} className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Ad name / label
          </Label>
          <Input
            id={`meta-ad-label-${record.id}`}
            value={record.label}
            onChange={(e) => patch({ label: e.target.value })}
            placeholder="e.g. MA educational carousel — Jul 2026"
            className="text-sm h-8"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Creative asset</Label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept={META_AD_ASSET_ACCEPT}
              className="hidden"
              onChange={(e) => void handleAsset(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              {record.asset ? "Replace asset" : "Upload asset"}
            </Button>
            {record.asset ? (
              record.asset.dataUrl ? (
                <a
                  href={record.asset.dataUrl}
                  download={record.asset.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {record.asset.fileName}
                  <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
                </a>
              ) : (
                <span className="text-muted-foreground">
                  {record.asset.fileName} (saved on this device — re-upload to preview)
                </span>
              )
            ) : (
              <span className="text-muted-foreground">Image or video (max 15 MB)</span>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`meta-ad-submitted-${record.id}`} className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Date submitted
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id={`meta-ad-submitted-${record.id}`}
                type="date"
                value={record.dateSubmitted ?? ""}
                onChange={(e) => patch({ dateSubmitted: e.target.value || undefined })}
                className="h-8 text-sm"
              />
              {!record.dateSubmitted ? (
                <Button type="button" variant="ghost" size="sm" onClick={handleMarkSubmitted}>
                  Mark submitted today
                </Button>
              ) : null}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`meta-ad-approved-${record.id}`} className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Date approved ({REVIEW_OWNER_LABEL})
            </Label>
            <Input
              id={`meta-ad-approved-${record.id}`}
              type="date"
              value={record.dateApproved ?? ""}
              onChange={(e) =>
                patch({ dateApproved: e.target.value || undefined, readyToGo: false })
              }
              className="h-8 text-sm"
            />
          </div>
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={record.catriaApproved}
            onCheckedChange={(v) => handleCatriaApproved(v === true)}
            aria-label={`${REVIEW_OWNER_LABEL} approved: ${record.label}`}
          />
          <span className={cn(record.catriaApproved && "text-primary font-medium")}>
            {REVIEW_OWNER_LABEL} approved
            {record.catriaReviewedAt ? ` · ${formatDisplayDate(record.catriaReviewedAt)}` : ""}
          </span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={record.readyToGo}
            onCheckedChange={(v) => handleReadyToGo(v === true)}
            disabled={!record.dateApproved || !record.catriaApproved}
            aria-label={`Ready to go: ${record.label}`}
          />
          <span className={cn(record.readyToGo && "text-emerald font-medium")}>
            Ready to go — approved asset cleared to run
          </span>
        </label>

        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Linked checklist items
            </p>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {checklistProgress.done}/{checklistProgress.total} complete
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Creative assets and CMS compliance items from the main checklist — grouped by section.
            Checks on the main checklist sync here automatically.
          </p>
          {checklistGroups.map((group) => (
            <div key={group.sectionId} className="space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground">
                {group.sectionTitle}
                <span className="font-normal"> · {group.channelLabel}</span>
              </p>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <MetaAdChecklistSection
                    key={item.id}
                    item={item}
                    itemNumber={itemNumbers.get(item.id) ?? 0}
                    globalState={globalState}
                    record={record}
                    onProgressChange={(itemId, progressPatch) =>
                      onChecklistProgressChange(record.id, itemId, progressPatch)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-1">
          <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Remove ad
          </Button>
        </div>
      </div>
    </GlassCollapsibleCard>
  );
}

export function MetaAdConformancePanel({ state, onStateChange }: MetaAdConformancePanelProps) {
  const [ownerTab, setOwnerTab] = useState<AssigneeFilter>("all");
  const records = state.metaAdConformanceRecords;

  const handleChecklistProgressChange = (
    recordId: string,
    itemId: string,
    patch: { prepDone?: boolean; catriaApproved?: boolean; note?: string },
  ) => {
    onStateChange(updateMetaAdRecordChecklistProgress(state, recordId, itemId, patch));
  };

  const ownerTabProgress = useMemo(() => {
    const map = {} as Record<AssigneeFilter | "all", { done: number; total: number }>;
    for (const tab of CHECKLIST_OWNER_TABS) {
      const pool = filterMetaAdRecordsByAssignee(records, tab.id);
      map[tab.id] = countMetaAdConformanceProgress(pool);
    }
    return map;
  }, [records]);

  const filteredRecords = useMemo(
    () => filterMetaAdRecordsByAssignee(records, ownerTab),
    [ownerTab, records],
  );

  const readyCount = filteredRecords.filter((r) => deriveMetaAdStatus(r) === "ready").length;
  const filteredProgress = countMetaAdConformanceProgress(filteredRecords);

  const updateRecord = (next: MetaAdConformanceRecord) => {
    onStateChange(upsertMetaAdConformanceRecordInState(state, next));
  };

  const addRecord = () => {
    const record = seedMetaAdRecordFromGlobalChecklist(createMetaAdConformanceRecord(), state);
    onStateChange(upsertMetaAdConformanceRecordInState(state, record));
    toast.success("New ad submission added");
  };

  const removeRecord = (id: string) => {
    if (!window.confirm("Remove this ad submission record?")) return;
    onStateChange(removeMetaAdConformanceRecordFromState(state, id));
    toast.success("Ad record removed");
  };

  return (
    <div className="space-y-3">
      <Card className="glass p-3 sm:p-4 space-y-2 border-primary/15">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <h2 className="font-display text-base font-bold">Meta Ads</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Track each Meta ad before launch: upload the creative, record submission and approval
              dates, get {REVIEW_OWNER_LABEL} sign-off, then mark ready to go. {PREP_OWNER_LABEL}{" "}
              uploads and submits; {REVIEW_OWNER_LABEL} approves compliance. Checklist progress syncs
              to the team database; creative files stay on your device.
            </p>
          </div>
          <Button type="button" size="sm" onClick={addRecord}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add ad
          </Button>
        </div>
        {records.length > 0 ? (
          <p className="text-xs text-muted-foreground tabular-nums">
            {ownerTab === "all"
              ? `${readyCount}/${records.length} ready to run`
              : `${filteredProgress.done}/${filteredProgress.total} ready in this view`}
          </p>
        ) : null}
      </Card>

      {records.length > 0 ? (
        <ChecklistOwnerTabBar
          value={ownerTab}
          onChange={setOwnerTab}
          progressByTab={ownerTabProgress}
        />
      ) : null}

      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No ad submissions yet — add an ad to start the conformance checklist.
        </p>
      ) : filteredRecords.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No ad submissions for this owner filter.
        </p>
      ) : (
        filteredRecords.map((record) => (
          <MetaAdRecordCard
            key={record.id}
            record={record}
            globalState={state}
            onChange={updateRecord}
            onRemove={() => removeRecord(record.id)}
            onChecklistProgressChange={handleChecklistProgressChange}
          />
        ))
      )}
    </div>
  );
}
