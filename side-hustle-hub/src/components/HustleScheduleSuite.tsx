import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  ChartColumnIncreasing,
  Crown,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { WaitIndicator } from "./WaitFeedback";
import { MembershipFeatureLockBadge } from "./MembershipLockBadge";
import { membershipLockedBadgeLabel } from "../lib/guide-access";
import {
  SCHEDULE_BLOCK_STATUS_OPTIONS,
  SCHEDULE_DELETE_WARNING,
  SCHEDULE_REMINDER_CADENCE_OPTIONS,
  applyScheduleBlockCheckbox,
  applyScheduleWeekGrade,
  applyLaunchGuideChecksToPlan,
  applyLaunchGuideChecksToStore,
  mergePlanCheckIntoLaunchGuideProgress,
  canAccessPnl,
  canAccessScheduleSuite,
  collectScheduleValidationErrors,
  createSchedulePlan,
  emptyScheduleStore,
  ensureHoursFromEstimates,
  ensureStoreHoursFromEstimates,
  familyMemberOptions,
  filterSchedulesByOwner,
  scheduleEligibleFamilyChildren,
  scheduleSaveEnabled,
  activateSchedule,
  activeScheduleAfterOwnerFilter,
  formatEstimateMinutes,
  getWeekRoundup,
  gradeScheduleWeek,
  hustleOptionsForOwner,
  isScheduleBlockComplete,
  isScheduleBlockHoursValid,
  normalizeHustleScheduleStore,
  patchActivePlan,
  patchBlueprintGoals,
  patchPlanPnL,
  planHasRequiredHours,
  restoreDeletedSchedule,
  scheduleBlockRequiresHours,
  scheduleBlockStatusLabel,
  scheduleProgressPercent,
  scheduleTaskCountLabel,
  scheduleTaskCounts,
  scheduleSuiteLockedReason,
  scheduleTabLabel,
  schedulesForOwnerHustle,
  setBlockEstimatedMinutes,
  setBlockFocus,
  setBlockNotes,
  setScheduleBlockHours,
  setScheduleBlockStatus,
  softDeleteSchedule,
  totalHoursLogged,
  updateBlockDueDate,
  updatePlanStartDate,
  upsertSchedule,
  upsertWeekRoundup,
  addScheduleActionItem,
  removeScheduleActionItem,
  formatScheduleActionItemStamp,
  scheduleStatsBarShowsGradeMe,
  suiteViewAfterGradeMe,
  scheduleGradeMeButtonLabel,
  liveScheduleWeekGrade,
  withRefreshedWeekGrade,
  scheduleCollapsePreview,
  SCHEDULE_EMAIL_SECTION_ID,
  SCHEDULE_SUITE_DEFAULT_VIEW,
  scheduleSuiteTabsForAccess,
  type ScheduleGradeCelebration,
  type ScheduleGradeMark,
  type HustleSchedulePlan,
  type HustleScheduleStore,
  type ScheduleBlockId,
  type ScheduleBlockStatus,
  type ScheduleOwnerFilter,
  type ScheduleOwnerId,
  type ScheduleReminderCadence,
  type ScheduleSuiteView,
} from "../lib/hustle-schedule";
import { isGuideStepBlockId } from "../lib/schedule-guide-plan";
import {
  BLUEPRINT_MAX_DAYS,
  PNL_EXPENSE_CATEGORIES,
  blueprintWindowStats,
  newPnLLineId,
  pnlExpenseCategoryLabel,
  removePnLLine,
  salesVsTarget,
  summarizePnLLines,
  upsertPnLLine,
  weeklyOutcomesForBlueprint,
  type PnLExpenseCategory,
  type PnLLineKind,
  type SchedulePnLLine,
} from "../lib/hustle-schedule-pnl";
import {
  downloadWeeklyPlanPdf,
  downloadWeeklyPlanWord,
} from "../lib/hustle-schedule-export";
import {
  downloadProfitAndLossPdf,
  downloadProfitAndLossWord,
} from "../lib/hustle-schedule-pnl-export";
import { fetchMemberProgress, saveMemberProgress } from "../lib/gysh-member-progress";
import { normalizeTierId } from "../lib/member-credits";
import type { BlueprintAgeGroup } from "../lib/gysh-analytics";
import type { TierId } from "../lib/membership";

type BlueprintInput = {
  id: string;
  ageGroup: BlueprintAgeGroup;
  resultIds: string[];
  topResultId?: string | null;
  childProfileId?: string | null;
  completedAt?: string;
};

type FamilyChildInput = {
  id: string;
  displayName: string;
  ageBand: "kids" | "junior";
  source?: "profile" | "signup";
  needsRegistration?: boolean;
};

type SuiteView = ScheduleSuiteView;

function CollapseField({
  title,
  testId,
  preview,
  children,
}: {
  title: string;
  testId: string;
  preview: string;
  children: ReactNode;
}) {
  return (
    <details className="hustle-schedule-suite__collapse-field" data-testid={testId}>
      <summary className="hustle-schedule-suite__collapse-summary">
        <span className="hustle-schedule-suite__collapse-title">
          <strong>{title}</strong>
          <em className="hustle-schedule-suite__collapse-preview">{preview}</em>
        </span>
        <span className="collapse-show-hide" aria-hidden="true" />
      </summary>
      <div className="hustle-schedule-suite__collapse-body">{children}</div>
    </details>
  );
}

type HustleScheduleSuiteProps = {
  membershipTier: string | null | undefined;
  /** Admins unlock Schedule Suite even on Free/Starter (and see all suites in Admin). */
  isAdmin?: boolean;
  tierLoading?: boolean;
  memberName?: string | null;
  familyChildren?: FamilyChildInput[];
  blueprints: BlueprintInput[];
  blueprintsLoading?: boolean;
  /** Open this schedule tab when the store finishes loading. */
  focusScheduleId?: string | null;
  onFocusScheduleConsumed?: () => void;
  onOpenJoin?: () => void;
  onOpenMatchWizard?: () => void;
  onOpenGuide?: (ageGroup: BlueprintAgeGroup, hustleId: string) => void;
};

export function HustleScheduleSuite({
  membershipTier,
  isAdmin = false,
  tierLoading,
  memberName,
  familyChildren = [],
  blueprints,
  blueprintsLoading,
  focusScheduleId,
  onFocusScheduleConsumed,
  onOpenJoin,
  onOpenMatchWizard,
  onOpenGuide,
}: HustleScheduleSuiteProps) {
  const tier: TierId = normalizeTierId(membershipTier);
  const unlocked = !tierLoading && canAccessScheduleSuite(tier, { isAdmin });
  const pnlUnlocked = !tierLoading && canAccessPnl(tier, { isAdmin });
  const viewTabs = useMemo(() => scheduleSuiteTabsForAccess({ pnlUnlocked }), [pnlUnlocked]);

  const members = useMemo(
    () => familyMemberOptions(memberName, scheduleEligibleFamilyChildren(familyChildren)),
    [memberName, familyChildren],
  );

  const [store, setStore] = useState<HustleScheduleStore>(() => emptyScheduleStore());
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [pickOwner, setPickOwner] = useState<ScheduleOwnerId>("self");
  const [pickHustle, setPickHustle] = useState("");
  const [suiteView, setSuiteView] = useState<SuiteView>(SCHEDULE_SUITE_DEFAULT_VIEW);
  const [ownerFilter, setOwnerFilter] = useState<ScheduleOwnerFilter>("all");
  const [errorDialog, setErrorDialog] = useState<{
    title: string;
    errors: string[];
  } | null>(null);
  const [guideStepChecks, setGuideStepChecks] = useState<Record<string, boolean>>({});

  const hustleChoices = useMemo(
    () => hustleOptionsForOwner(pickOwner, blueprints),
    [pickOwner, blueprints],
  );

  useEffect(() => {
    if (suiteView === "pnl" && !pnlUnlocked) {
      setSuiteView(SCHEDULE_SUITE_DEFAULT_VIEW);
    }
  }, [suiteView, pnlUnlocked]);

  useEffect(() => {
    if (!hustleChoices.some((h) => h.hustleId === pickHustle)) {
      setPickHustle(hustleChoices[0]?.hustleId ?? "");
    }
  }, [hustleChoices, pickHustle]);

  useEffect(() => {
    if (!unlocked) {
      setStore(emptyScheduleStore());
      setDirty(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [raw, stepsRaw] = await Promise.all([
          fetchMemberProgress("hustle_schedule"),
          fetchMemberProgress<Record<string, boolean>>("launch_guide_steps").catch(
            () => ({}) as Record<string, boolean>,
          ),
        ]);
        if (cancelled) return;
        const checks =
          stepsRaw && typeof stepsRaw === "object" && !Array.isArray(stepsRaw) ? stepsRaw : {};
        setGuideStepChecks(checks);
        setStore(applyLaunchGuideChecksToStore(normalizeHustleScheduleStore(raw), checks));
        setDirty(false);
      } catch (e) {
        if (cancelled) return;
        setStore(emptyScheduleStore());
        setError(e instanceof Error ? e.message : "Could not load schedules.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unlocked]);

  useEffect(() => {
    if (!focusScheduleId || loading || !unlocked) return;
    if (!store.schedules.some((s) => s.id === focusScheduleId)) {
      onFocusScheduleConsumed?.();
      return;
    }
    if (store.activeScheduleId !== focusScheduleId) {
      setStore((prev) => ({
        ...prev,
        activeScheduleId: focusScheduleId,
      }));
    }
    setSuiteView(SCHEDULE_SUITE_DEFAULT_VIEW);
    onFocusScheduleConsumed?.();
  }, [focusScheduleId, loading, unlocked, store.schedules, store.activeScheduleId, onFocusScheduleConsumed]);

  const visibleSchedules = useMemo(
    () => filterSchedulesByOwner(store.schedules, ownerFilter),
    [store.schedules, ownerFilter],
  );

  useEffect(() => {
    const nextId = activeScheduleAfterOwnerFilter(
      store.schedules,
      ownerFilter,
      store.activeScheduleId,
    );
    if (nextId === store.activeScheduleId) return;
    setStore((prev) => activateSchedule(prev, nextId));
  }, [ownerFilter, store.schedules, store.activeScheduleId]);

  const applyLocal = useCallback((next: HustleScheduleStore) => {
    setStore(next);
    setDirty(true);
    setSaveOk(false);
    setError(null);
    setErrorDialog(null);
  }, []);

  const saveStore = useCallback(
    async (next?: HustleScheduleStore) => {
      const raw = next ?? store;
      const payload = ensureStoreHoursFromEstimates(raw);
      const validationErrors = collectScheduleValidationErrors(payload, {
        onlyScheduleId: payload.activeScheduleId,
      });
      if (validationErrors.length > 0) {
        setErrorDialog({
          title: "Fix these before saving",
          errors: validationErrors,
        });
        setError(null);
        if (payload !== raw) setStore(payload);
        return;
      }
      setErrorDialog(null);
      setSaving(true);
      setError(null);
      setSaveOk(false);
      try {
        await saveMemberProgress("hustle_schedule", payload);
        setStore(payload);
        setDirty(false);
        setSaveOk(true);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not save schedule.";
        setError(msg);
        setErrorDialog({ title: "Save failed", errors: [msg] });
      } finally {
        setSaving(false);
      }
    },
    [store],
  );

  const canSave = scheduleSaveEnabled(dirty, saving);
  const active = visibleSchedules.find((s) => s.id === store.activeScheduleId) ?? null;
  const pendingDelete =
    pendingDeleteId != null
      ? store.schedules.find((s) => s.id === pendingDeleteId) ?? null
      : null;

  const createNewSchedule = () => {
    if (!unlocked) return;
    const owner = members.find((m) => m.id === pickOwner);
    const hustle = hustleChoices.find((h) => h.hustleId === pickHustle);
    if (!owner || !hustle) return;
    const existing = schedulesForOwnerHustle(store, owner.id, hustle.hustleId);
    const plan = applyLaunchGuideChecksToPlan(
      createSchedulePlan({
        ownerId: owner.id,
        ownerLabel: owner.label,
        hustleId: hustle.hustleId,
        hustleLabel: hustle.hustleLabel,
        ageGroup: hustle.ageGroup,
        blueprintId: hustle.blueprintId,
        // Always allocate a new tab — even when this member+hustle already has a schedule.
        distinct: existing.length > 0,
      }),
      guideStepChecks,
    );
    applyLocal(upsertSchedule(store, plan));
    setOwnerFilter(owner.id);
    setSuiteView(SCHEDULE_SUITE_DEFAULT_VIEW);
  };

  const selectTab = (id: string) => {
    setStore((prev) => activateSchedule(prev, id));
    setSuiteView(SCHEDULE_SUITE_DEFAULT_VIEW);
  };

  const patchPlan = (fn: (p: HustleSchedulePlan) => HustleSchedulePlan) => {
    if (!active) return;
    applyLocal(patchActivePlan(store, active.id, fn));
  };

  const persistGuideStepCheck = (hustleId: string, blockId: string, checked: boolean) => {
    setGuideStepChecks((prev) => {
      const next = mergePlanCheckIntoLaunchGuideProgress(prev, hustleId, blockId, checked);
      if (next !== prev) {
        void saveMemberProgress("launch_guide_steps", next).catch(() => {
          /* next Schedule Suite / Steps-tab load will resync */
        });
      }
      return next;
    });
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const next = softDeleteSchedule(store, pendingDeleteId);
    setPendingDeleteId(null);
    setStore(next);
    setDirty(false);
    setSaving(true);
    setError(null);
    try {
      await saveMemberProgress("hustle_schedule", next);
      setSaveOk(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete schedule.");
      setDirty(true);
    } finally {
      setSaving(false);
    }
  };

  const restore = async (id: string) => {
    const next = restoreDeletedSchedule(store, id);
    setStore(next);
    setDirty(false);
    setSaving(true);
    setError(null);
    try {
      await saveMemberProgress("hustle_schedule", next);
      setSaveOk(true);
      setSuiteView(SCHEDULE_SUITE_DEFAULT_VIEW);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not restore schedule.");
      setDirty(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      id="user-portal-panel-schedule"
      role="tabpanel"
      aria-labelledby="user-portal-tab-schedule"
      className={`hustle-schedule-suite${unlocked ? "" : " is-locked"}`}
      data-testid="user-portal-schedule"
      data-unlocked={unlocked ? "1" : "0"}
    >
      <div className="hustle-schedule-suite__head">
        <h3>
          <CalendarDays size={20} aria-hidden /> Schedule Suite
        </h3>
        <MembershipFeatureLockBadge
          feature="schedule_suite"
          unlocked={unlocked}
          data-testid="schedule-suite-pro-badge"
        />
      </div>
      <p className="user-portal-panel-lead">
        Tap a family member to see their saved schedules, then tap a schedule to open it. Make a
        new schedule at the top when you need one. <strong>Save</strong> sits beside the plan tab
        you have open and turns on after you edit.
        {!unlocked ? (
          <>
            {" "}
            <strong>Requires Pro or higher</strong> (includes P&amp;L calculator, tracker, and
            progress).
          </>
        ) : null}
      </p>

      {tierLoading ? (
        <WaitIndicator data-testid="schedule-suite-tier-loading" message="Checking your plan…" />
      ) : (
        <div className="hustle-schedule-suite__body">
          {!unlocked && (
            <div className="hustle-schedule-suite__lock" data-testid="schedule-suite-locked">
              <Lock size={28} aria-hidden />
              <p>{scheduleSuiteLockedReason(tier)}</p>
              {onOpenJoin && (
                <button
                  type="button"
                  className="btn btn-primary"
                  data-testid="schedule-suite-upgrade"
                  onClick={onOpenJoin}
                >
                  <Crown size={16} aria-hidden /> See Pro &amp; Elite plans
                </button>
              )}
            </div>
          )}

          <div
            className={`hustle-schedule-suite__content${unlocked ? "" : " is-dimmed"}`}
            aria-hidden={!unlocked}
          >
            {blueprintsLoading ? (
              <WaitIndicator message="Loading Blueprints…" />
            ) : (
              <>
                <div className="hustle-schedule-suite__create" data-testid="schedule-suite-create">
                  <p className="hustle-schedule-suite__create-heading">Make a new schedule</p>
                  <label>
                    <span>Family member</span>
                    <select
                      value={pickOwner}
                      disabled={!unlocked}
                      data-testid="schedule-suite-owner"
                      onChange={(e) => {
                        const id = e.target.value as ScheduleOwnerId;
                        setPickOwner(id);
                        setOwnerFilter(id);
                      }}
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Side hustle</span>
                    <select
                      value={pickHustle}
                      disabled={!unlocked || hustleChoices.length === 0}
                      data-testid="schedule-suite-hustle"
                      onChange={(e) => setPickHustle(e.target.value)}
                    >
                      {hustleChoices.length === 0 ? (
                        <option value="">No Blueprint matches yet</option>
                      ) : (
                        hustleChoices.map((h) => (
                          <option key={h.hustleId} value={h.hustleId}>
                            {h.hustleLabel}
                          </option>
                        ))
                      )}
                    </select>
                  </label>
                  <div className="hustle-schedule-suite__create-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!unlocked || !pickHustle}
                      data-testid="schedule-suite-add"
                      onClick={createNewSchedule}
                    >
                      <Plus size={16} aria-hidden /> Make new schedule
                    </button>
                  </div>
                </div>

                {hustleChoices.length === 0 && (
                  <p className="hustle-schedule-suite__hint" data-testid="schedule-suite-no-hustle">
                    No side hustles for this member yet. Run the Match Wizard
                    {pickOwner === "self" ? "" : " (or assign a Blueprint on Family)"}
                    , then come back.
                    {onOpenMatchWizard && (
                      <>
                        {" "}
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={!unlocked}
                          onClick={onOpenMatchWizard}
                        >
                          Match Wizard
                        </button>
                      </>
                    )}
                  </p>
                )}

                <div className="hustle-schedule-suite__saved" data-testid="schedule-suite-saved-block">
                  <h4 className="hustle-schedule-suite__saved-heading">Saved schedules</h4>
                  <p className="hustle-schedule-suite__saved-lead">
                    Tap a name to see that person&apos;s schedules. Tap a schedule to open it.
                  </p>
                  <div
                    className="hustle-schedule-suite__member-bubbles"
                    role="tablist"
                    aria-label="Family members"
                    data-testid="schedule-suite-member-bubbles"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={ownerFilter === "all"}
                      className={`hustle-schedule-suite__member-bubble${
                        ownerFilter === "all" ? " is-active" : ""
                      }`}
                      data-testid="schedule-member-filter-all"
                      disabled={!unlocked}
                      onClick={() => setOwnerFilter("all")}
                    >
                      All family members
                    </button>
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        role="tab"
                        aria-selected={ownerFilter === m.id}
                        className={`hustle-schedule-suite__member-bubble${
                          ownerFilter === m.id ? " is-active" : ""
                        }`}
                        data-testid={`schedule-member-filter-${m.id}`}
                        disabled={!unlocked}
                        onClick={() => {
                          setOwnerFilter(m.id);
                          setPickOwner(m.id);
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <div
                    className="hustle-schedule-suite__tabs"
                    role="tablist"
                    aria-label="Saved side hustle schedules"
                    data-testid="schedule-suite-tabs"
                  >
                    {visibleSchedules.length === 0 ? (
                      <p
                        className="hustle-schedule-suite__hint"
                        data-testid={
                          store.schedules.length === 0
                            ? "schedule-suite-empty"
                            : "schedule-suite-filter-empty"
                        }
                      >
                        {store.schedules.length === 0
                          ? "No saved schedules yet. Make a new one above."
                          : "No saved schedules for this family member yet."}
                      </p>
                    ) : (
                      visibleSchedules.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          role="tab"
                          aria-selected={s.id === active?.id}
                          className={`hustle-schedule-suite__tab${
                            s.id === active?.id ? " is-active" : ""
                          }`}
                          data-testid={`schedule-tab-${s.id}`}
                          disabled={!unlocked}
                          onClick={() => selectTab(s.id)}
                        >
                          {scheduleTabLabel(s)}
                          <span
                            className="hustle-schedule-suite__tab-close"
                            role="button"
                            tabIndex={-1}
                            aria-label={`Delete ${scheduleTabLabel(s)}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!unlocked) return;
                              setPendingDeleteId(s.id);
                            }}
                          >
                            <X size={12} aria-hidden />
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {unlocked && loading && (
                  <WaitIndicator
                    data-testid="schedule-suite-loading"
                    message="Loading your schedules…"
                  />
                )}

                {unlocked && error && (
                  <p className="user-portal-credits-error" data-testid="schedule-suite-error">
                    {error}
                  </p>
                )}

                {unlocked && saveOk && !dirty && (
                  <p className="hustle-schedule-suite__saved-ok" data-testid="schedule-suite-saved">
                    Schedule saved.
                  </p>
                )}

                {pendingDelete && (
                  <div
                    className="hustle-schedule-suite__delete-warn"
                    role="alertdialog"
                    aria-labelledby="schedule-delete-title"
                    data-testid="schedule-suite-delete-warn"
                  >
                    <p id="schedule-delete-title">{SCHEDULE_DELETE_WARNING}</p>
                    <p>
                      <strong>{scheduleTabLabel(pendingDelete)}</strong>
                    </p>
                    <div className="hustle-schedule-suite__delete-actions">
                      <button
                        type="button"
                        className="btn btn-outline"
                        data-testid="schedule-suite-delete-cancel"
                        onClick={() => setPendingDeleteId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        data-testid="schedule-suite-delete-confirm"
                        onClick={() => void confirmDelete()}
                      >
                        <Trash2 size={14} aria-hidden /> Delete suite
                      </button>
                    </div>
                  </div>
                )}

                {unlocked && errorDialog && (
                  <ScheduleErrorsDialog
                    title={errorDialog.title}
                    errors={errorDialog.errors}
                    onDismiss={() => setErrorDialog(null)}
                  />
                )}

                {active && (
                  <ScheduleDetail
                    plan={active}
                    unlocked={unlocked}
                    pnlUnlocked={pnlUnlocked}
                    viewTabs={viewTabs}
                    suiteView={suiteView}
                    saving={saving}
                    dirty={dirty}
                    canSave={canSave}
                    onViewChange={setSuiteView}
                    onPatch={patchPlan}
                    onGuideStepCheck={persistGuideStepCheck}
                    onSave={() => void saveStore()}
                    onOpenGuide={onOpenGuide}
                    onRequestDelete={() => setPendingDeleteId(active.id)}
                  />
                )}

                {unlocked && store.deleted.length > 0 && (
                  <div
                    className="hustle-schedule-suite__trash"
                    data-testid="schedule-suite-deleted"
                  >
                    <h4>Deleted schedules</h4>
                    <p>Restore any suite you removed by mistake.</p>
                    <ul>
                      {store.deleted.map((d) => (
                        <li key={d.id} data-testid={`schedule-deleted-${d.id}`}>
                          <div>
                            <strong>{scheduleTabLabel(d)}</strong>
                            <span>
                              Deleted {d.deletedAt.slice(0, 10)} · start {d.weekStart}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline"
                            data-testid={`schedule-restore-${d.id}`}
                            disabled={saving}
                            onClick={() => void restore(d.id)}
                          >
                            <RotateCcw size={14} aria-hidden /> Restore
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function ScheduleDetail({
  plan,
  unlocked,
  pnlUnlocked,
  viewTabs,
  suiteView,
  saving,
  dirty,
  canSave,
  onViewChange,
  onPatch,
  onGuideStepCheck,
  onSave,
  onOpenGuide,
  onRequestDelete,
}: {
  plan: HustleSchedulePlan;
  unlocked: boolean;
  pnlUnlocked: boolean;
  viewTabs: { id: SuiteView; label: string }[];
  suiteView: SuiteView;
  saving: boolean;
  dirty: boolean;
  canSave: boolean;
  onViewChange: (v: SuiteView) => void;
  onPatch: (fn: (p: HustleSchedulePlan) => HustleSchedulePlan) => void;
  onGuideStepCheck?: (hustleId: string, blockId: string, checked: boolean) => void;
  onSave: () => void;
  onOpenGuide?: (ageGroup: BlueprintAgeGroup, hustleId: string) => void;
  onRequestDelete: () => void;
}) {
  const pct = scheduleProgressPercent(plan.blocks);
  const hours = totalHoursLogged(plan.blocks);
  const roundup = getWeekRoundup(plan, plan.weekStart);
  const goals = plan.blueprintGoals ?? {
    marketingPlan: "",
    targetSalesUsd: 0,
    actualSalesUsd: 0,
    expensesUsd: 0,
  };
  const [celebration, setCelebration] = useState<{
    mode: Exclude<ScheduleGradeCelebration, "none">;
    mark: ScheduleGradeMark;
    pepTalk: string;
    score: number;
  } | null>(null);
  const [actionDraft, setActionDraft] = useState("");

  const liveGrade = liveScheduleWeekGrade(plan, roundup.grade);
  const shownGrade = liveGrade ?? roundup.grade;

  const runGrade = () => {
    if (!unlocked) return;
    onViewChange(suiteViewAfterGradeMe(suiteView));
    onPatch((p) => {
      const withHours = ensureHoursFromEstimates(p);
      const next = applyScheduleWeekGrade(withHours, withHours.weekStart);
      const g = getWeekRoundup(next, next.weekStart).grade ?? gradeScheduleWeek(next);
      if (g.celebration === "congrats" || g.celebration === "a_pop") {
        const mode = g.celebration;
        queueMicrotask(() =>
          setCelebration({
            mode,
            mark: g.mark,
            pepTalk: g.pepTalk,
            score: g.score,
          }),
        );
      }
      return next;
    });
  };

  return (
    <div className="hustle-schedule-suite__detail" data-testid="schedule-suite-detail">
      <div className="hustle-schedule-suite__hustle">
        <div>
          <span className="glow-badge free">{plan.ownerLabel}</span>
          <h4>{plan.hustleLabel}</h4>
          <p>Week of {plan.weekStart}</p>
        </div>
      </div>

      <label className="hustle-schedule-suite__due">
        <span>Start date</span>
        <input
          type="date"
          value={plan.weekStart}
          disabled={!unlocked}
          data-testid="schedule-suite-start"
          aria-label="Schedule start date"
          onChange={(e) => {
            if (!unlocked || !e.target.value) return;
            onPatch((p) => updatePlanStartDate(p, e.target.value));
          }}
        />
        <em>Changing this shifts every day's due date — remember to Save</em>
      </label>

      <div className="hustle-schedule-suite__view-bar">
        <div
          className="hustle-schedule-suite__subtabs"
          role="tablist"
          aria-label="Schedule views"
          data-testid="schedule-suite-views"
        >
          {viewTabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={suiteView === id}
              className={`hustle-schedule-suite__subtab${suiteView === id ? " is-active" : ""}`}
              data-testid={`schedule-view-${id}`}
              disabled={!unlocked}
              onClick={() => onViewChange(id)}
            >
              {label}
              {!unlocked && (id === "tracker" || id === "progress") ? (
                <span className="hustle-schedule-suite__subtab-lock" aria-hidden>
                  · Pro
                </span>
              ) : null}
            </button>
          ))}
          <a
            href={`#${SCHEDULE_EMAIL_SECTION_ID}`}
            className="hustle-schedule-suite__email-me"
            data-testid="schedule-email-me-link"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(SCHEDULE_EMAIL_SECTION_ID)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            Email Me
          </a>
        </div>
        <div className="hustle-schedule-suite__view-actions">
          <button
            type="button"
            className={`btn btn-primary hustle-schedule-suite__save-detail${
              canSave ? " is-ready" : ""
            }`}
            disabled={!unlocked || !canSave}
            data-testid="schedule-suite-save-detail"
            onClick={onSave}
          >
            <Save size={16} aria-hidden />
            {saving ? "Saving…" : "Save schedule"}
          </button>
          {onOpenGuide && (
            <button
              type="button"
              className="btn btn-outline"
              disabled={!unlocked}
              data-testid="schedule-suite-open-guide"
              onClick={() => onOpenGuide(plan.ageGroup, plan.hustleId)}
            >
              Open guide
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline"
            disabled={!unlocked}
            data-testid="schedule-suite-remove"
            onClick={onRequestDelete}
            aria-label="Delete this schedule"
          >
            <Trash2 size={14} aria-hidden />
          </button>
          {dirty ? (
            <p className="hustle-schedule-suite__dirty" data-testid="schedule-suite-dirty">
              You edited this schedule. Tap <strong>Save schedule</strong> to keep it.
            </p>
          ) : (
            <p className="hustle-schedule-suite__save-hint">Save turns on after you make a change.</p>
          )}
        </div>
      </div>

      {suiteView === "tracker" && (
        <div
          className="hustle-schedule-suite__weekly-download"
          data-testid="schedule-weekly-download"
        >
          <span>Weekly plan download:</span>
          <button
            type="button"
            className="btn btn-outline"
            disabled={!unlocked}
            data-testid="schedule-weekly-pdf"
            onClick={() => void downloadWeeklyPlanPdf(plan)}
          >
            PDF
          </button>
          <button
            type="button"
            className="btn btn-outline"
            disabled={!unlocked}
            data-testid="schedule-weekly-word"
            onClick={() => downloadWeeklyPlanWord(plan)}
          >
            Word
          </button>
        </div>
      )}

      <div className="hustle-schedule-suite__stats" data-testid="schedule-suite-stats">
        <div>
          <ChartColumnIncreasing size={16} aria-hidden />
          <span>
            Progress <strong>{pct}%</strong>
          </span>
        </div>
        <div>
          <span>
            Hours logged <strong>{hours}</strong>
          </span>
        </div>
        <div>
          <span>
            Sales{" "}
            <strong data-testid="schedule-stats-actual-sales">${goals.actualSalesUsd}</strong> / $
            {goals.targetSalesUsd}
          </span>
        </div>
        <div>
          <span>
            Start <strong data-testid="schedule-stats-start">{plan.weekStart}</strong>
          </span>
        </div>
        {scheduleStatsBarShowsGradeMe(suiteView) ? (
          <button
            type="button"
            className={`btn btn-primary hustle-schedule-suite__grade-me${
              shownGrade ? ` is-letter-${shownGrade.letter.toLowerCase()}` : ""
            }`}
            disabled={!unlocked}
            data-testid="schedule-grade-me-anytime"
            aria-label={
              shownGrade
                ? `Re-grade week. ${scheduleGradeMeButtonLabel(shownGrade)}`
                : "Grade me"
            }
            onClick={runGrade}
          >
            {scheduleGradeMeButtonLabel(shownGrade)}
          </button>
        ) : null}
        {saving && <span className="hustle-schedule-suite__saving">Saving…</span>}
      </div>

      {celebration ? (
        <ScheduleGradeCelebration
          mode={celebration.mode}
          mark={celebration.mark}
          pepTalk={celebration.pepTalk}
          score={celebration.score}
          onDismiss={() => setCelebration(null)}
        />
      ) : null}

      {suiteView === "blueprint" && (
        <div className="hustle-schedule-suite__blueprint" data-testid="schedule-view-blueprint">
          <div className="hustle-schedule-suite__blueprint-head">
            <h4>Blueprint plan</h4>
            <p
              className="hustle-schedule-suite__task-count"
              data-testid="schedule-blueprint-task-count"
            >
              {scheduleTaskCountLabel(scheduleTaskCounts(plan.blocks))}
            </p>
          </div>
          <p className="hustle-schedule-suite__hint">
            Marketing and sales target for <strong>{plan.hustleLabel}</strong>. Use the{" "}
            <strong>P&amp;L calculator</strong> tab to add sales/expense line items and see weekly
            net profit (aim ≤ 10 days to complete this blueprint sprint).
          </p>
          <label className="hustle-schedule-suite__field">
            <span>Marketing plan</span>
            <textarea
              rows={6}
              value={goals.marketingPlan}
              disabled={!unlocked}
              data-testid="schedule-marketing-plan"
              aria-label="Marketing plan"
              onChange={(e) =>
                onPatch((p) => patchBlueprintGoals(p, { marketingPlan: e.target.value }))
              }
            />
          </label>
          <div className="hustle-schedule-suite__sales-row">
            <label className="hustle-schedule-suite__field">
              <span>Target sales ($)</span>
              <input
                type="number"
                min={0}
                step={1}
                value={goals.targetSalesUsd || ""}
                disabled={!unlocked}
                data-testid="schedule-target-sales"
                aria-label="Target sales USD"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onPatch((p) =>
                    patchBlueprintGoals(p, {
                      targetSalesUsd: Number.isFinite(v) ? v : 0,
                    }),
                  );
                }}
              />
            </label>
            <label className="hustle-schedule-suite__field">
              <span>Actual sales from P&amp;L ($)</span>
              <input
                type="number"
                min={0}
                step={1}
                value={goals.actualSalesUsd || ""}
                disabled
                readOnly
                data-testid="schedule-actual-sales"
                aria-label="Actual sales from P and L"
              />
              <em className="hustle-schedule-suite__field-note">
                Fills from P&amp;L sales lines — open the P&amp;L calculator tab
              </em>
            </label>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!unlocked || !pnlUnlocked}
            data-testid="schedule-open-pnl-tab"
            onClick={() => {
              if (!pnlUnlocked) return;
              onViewChange("pnl");
            }}
          >
            Open P&amp;L calculator
          </button>
        </div>
      )}

      {suiteView === "pnl" && pnlUnlocked && (
        <SchedulePnLPanel plan={plan} unlocked={unlocked} onPatch={onPatch} />
      )}

      {suiteView === "roundup" && (
        <div className="hustle-schedule-suite__roundup" data-testid="schedule-view-roundup">
          <div className="hustle-schedule-suite__roundup-head">
            <div>
              <h4>Weekly Roundup</h4>
              <p className="hustle-schedule-suite__hint">
                Week of <strong>{plan.weekStart}</strong> — tap a box to add notes, then Save
                progress.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!unlocked || !canSave}
              data-testid="schedule-roundup-save"
              onClick={onSave}
            >
              <Save size={14} aria-hidden /> {saving ? "Saving…" : "Save progress"}
            </button>
          </div>

          {shownGrade ? (
            <div
              className={`hustle-schedule-suite__grade is-letter-${shownGrade.letter.toLowerCase()}${
                shownGrade.celebration === "a_pop" ? " is-a-pop" : ""
              }${shownGrade.celebration === "congrats" ? " is-congrats" : ""}`}
              data-testid="schedule-week-grade"
            >
              <strong className="hustle-schedule-suite__grade-letter">
                {shownGrade.mark ?? shownGrade.letter}
              </strong>
              <div>
                <p>
                  Score <strong>{shownGrade.score}%</strong> complete
                </p>
                <p
                  className="hustle-schedule-suite__pep"
                  data-testid="schedule-grade-pep"
                >
                  {shownGrade.pepTalk}
                </p>
                <p>{shownGrade.summary}</p>
                <ul>
                  <li>Blocks completed: {shownGrade.breakdown.completionPct}%</li>
                  <li>Hours vs estimate: {shownGrade.breakdown.hoursPct}%</li>
                  <li>Sales vs target: {shownGrade.breakdown.salesPct}%</li>
                  <li>Roundup filled: {shownGrade.breakdown.roundupPct}%</li>
                </ul>
              </div>
            </div>
          ) : null}

          <CollapseField
            title="I killed it here"
            testId="schedule-roundup-killed-fold"
            preview={scheduleCollapsePreview(roundup.killedIt)}
          >
            <textarea
              rows={5}
              value={roundup.killedIt}
              disabled={!unlocked}
              data-testid="schedule-roundup-killed"
              aria-label="I killed it here"
              onChange={(e) =>
                onPatch((p) =>
                  upsertWeekRoundup(p, {
                    ...getWeekRoundup(p, p.weekStart),
                    killedIt: e.target.value,
                  }),
                )
              }
            />
          </CollapseField>
          <CollapseField
            title="I need improvement here"
            testId="schedule-roundup-improve-fold"
            preview={scheduleCollapsePreview(roundup.needsImprovement)}
          >
            <textarea
              rows={5}
              value={roundup.needsImprovement}
              disabled={!unlocked}
              data-testid="schedule-roundup-improve"
              aria-label="I need improvement here"
              onChange={(e) =>
                onPatch((p) =>
                  upsertWeekRoundup(p, {
                    ...getWeekRoundup(p, p.weekStart),
                    needsImprovement: e.target.value,
                  }),
                )
              }
            />
          </CollapseField>
          <CollapseField
            title="Action items for upcoming week"
            testId="schedule-roundup-actions-fold"
            preview={
              (roundup.actionItemEntries ?? []).length
                ? `${(roundup.actionItemEntries ?? []).length} item${
                    (roundup.actionItemEntries ?? []).length === 1 ? "" : "s"
                  }`
                : "Tap to add"
            }
          >
          <div className="hustle-schedule-suite__action-items">
            {(roundup.actionItemEntries ?? []).length > 0 ? (
              <ul
                className="hustle-schedule-suite__action-list"
                data-testid="schedule-roundup-actions-list"
              >
                {(roundup.actionItemEntries ?? []).map((item) => {
                  const stamp = formatScheduleActionItemStamp(item.createdAt);
                  return (
                    <li key={item.id} data-testid={`schedule-action-item-${item.id}`}>
                      <div className="hustle-schedule-suite__action-body">
                        <p>{item.text}</p>
                        {stamp ? (
                          <time dateTime={item.createdAt}>{stamp}</time>
                        ) : (
                          <span className="hustle-schedule-suite__action-stamp-muted">
                            Saved earlier
                          </span>
                        )}
                      </div>
                      {unlocked ? (
                        <button
                          type="button"
                          className="hustle-schedule-suite__action-remove"
                          aria-label={`Remove action item: ${item.text}`}
                          data-testid={`schedule-action-remove-${item.id}`}
                          onClick={() =>
                            onPatch((p) =>
                              upsertWeekRoundup(
                                p,
                                removeScheduleActionItem(getWeekRoundup(p, p.weekStart), item.id),
                              ),
                            )
                          }
                        >
                          <Trash2 size={14} aria-hidden />
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="hustle-schedule-suite__action-empty" data-testid="schedule-roundup-actions-empty">
                No action items yet — add one below.
              </p>
            )}
            {unlocked ? (
              <div className="hustle-schedule-suite__action-add">
                <input
                  type="text"
                  value={actionDraft}
                  placeholder="Add an action item…"
                  aria-label="New action item"
                  data-testid="schedule-roundup-actions"
                  onChange={(e) => setActionDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    const text = actionDraft.trim();
                    if (!text) return;
                    onPatch((p) =>
                      upsertWeekRoundup(
                        p,
                        addScheduleActionItem(getWeekRoundup(p, p.weekStart), text),
                      ),
                    );
                    setActionDraft("");
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={!actionDraft.trim()}
                  data-testid="schedule-roundup-actions-add"
                  onClick={() => {
                    const text = actionDraft.trim();
                    if (!text) return;
                    onPatch((p) =>
                      upsertWeekRoundup(
                        p,
                        addScheduleActionItem(getWeekRoundup(p, p.weekStart), text),
                      ),
                    );
                    setActionDraft("");
                  }}
                >
                  Add
                </button>
              </div>
            ) : null}
          </div>
          </CollapseField>
        </div>
      )}

      {suiteView === "progress" && (
        <div
          className="hustle-schedule-suite__progress-panel"
          data-testid="schedule-view-progress-panel"
        >
          <div className="user-portal-progress-track">
            <div className="user-portal-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p>
            {plan.blocks.filter((b) => isScheduleBlockComplete(b)).length} of{" "}
            {plan.blocks.length} guide steps done · {hours} hours logged toward{" "}
            <strong>{plan.hustleLabel}</strong>.
          </p>
          <ul>
            {plan.blocks.map((b) => (
              <li key={b.id}>
                <strong>{b.dayLabel}</strong> due {b.dueDate}:{" "}
                {scheduleBlockStatusLabel(b.status)}
                {b.hoursLogged > 0 ? ` · ${b.hoursLogged}h` : ""}
                {scheduleBlockRequiresHours(b) && !isScheduleBlockHoursValid(b.hoursLogged)
                  ? " · hours required"
                  : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {suiteView === "tracker" && (
        <>
        <p className="hustle-schedule-suite__hint" data-testid="schedule-tracker-guide-hint">
          Every Launch Guide step for <strong>{plan.hustleLabel}</strong> is on this tracker — one
          step per weekday, in guide order.
        </p>
        <ul className="hustle-schedule-suite__days" data-testid="schedule-suite-days">
          {plan.blocks.map((block) => {
            const hoursRequired = scheduleBlockRequiresHours(block);
            const hoursMissing = hoursRequired && !isScheduleBlockHoursValid(block.hoursLogged);
            return (
              <li
                key={block.id}
                className={`hustle-schedule-suite__day is-status-${block.status}${
                  isScheduleBlockComplete(block) ? " is-done" : ""
                }${hoursMissing ? " is-hours-missing" : ""}`}
                data-status={block.status}
                data-testid={`schedule-block-${block.id}`}
              >
                <div className="hustle-schedule-suite__day-main">
                  <label className="hustle-schedule-suite__day-check">
                    <input
                      type="checkbox"
                      checked={isScheduleBlockComplete(block)}
                      disabled={!unlocked}
                      aria-label={`Mark ${block.dayLabel} done`}
                      data-testid={`schedule-block-check-${block.id}`}
                      onChange={(e) => {
                        if (!unlocked) return;
                        const checked = e.target.checked;
                        onGuideStepCheck?.(plan.hustleId, block.id, checked);
                        onPatch((p) =>
                          withRefreshedWeekGrade(
                            applyScheduleBlockCheckbox(
                              p,
                              block.id as ScheduleBlockId,
                              checked,
                            ),
                          ),
                        );
                      }}
                    />
                    <strong>{block.dayLabel}</strong>
                  </label>

                  <input
                    className="hustle-schedule-suite__focus-input"
                    type="text"
                    value={block.focus}
                    disabled={!unlocked}
                    readOnly={isGuideStepBlockId(block.id)}
                    aria-label={`${block.dayLabel} focus`}
                    title={
                      isGuideStepBlockId(block.id)
                        ? "Matches the Launch Guide Steps tab"
                        : undefined
                    }
                    onChange={(e) =>
                      onPatch((p) => setBlockFocus(p, block.id as ScheduleBlockId, e.target.value))
                    }
                  />

                  <label className="hustle-schedule-suite__status">
                    <span className="sr-only">Status</span>
                    <select
                      value={block.status}
                      disabled={!unlocked}
                      aria-label={`${block.dayLabel} status`}
                      data-testid={`schedule-block-status-${block.id}`}
                      onChange={(e) => {
                        if (!unlocked) return;
                        const status = e.target.value as ScheduleBlockStatus;
                        if (status === "done" || status === "not_started") {
                          onGuideStepCheck?.(plan.hustleId, block.id, status === "done");
                        }
                        onPatch((p) =>
                          withRefreshedWeekGrade(
                            setScheduleBlockStatus(
                              p,
                              block.id as ScheduleBlockId,
                              status,
                            ),
                          ),
                        );
                      }}
                    >
                      {SCHEDULE_BLOCK_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="hustle-schedule-suite__day-meta">
                  <label className="hustle-schedule-suite__estimate">
                    <span>Est. (min)</span>
                    <input
                      type="number"
                      min={0}
                      max={1440}
                      step={15}
                      value={block.minutes || ""}
                      disabled={!unlocked}
                      aria-label={`${block.dayLabel} estimated minutes`}
                      data-testid={`schedule-block-estimate-${block.id}`}
                      onChange={(e) => {
                        if (!unlocked) return;
                        const raw = e.target.value;
                        const v = raw === "" ? 0 : Number(raw);
                        onPatch((p) =>
                          setBlockEstimatedMinutes(
                            p,
                            block.id as ScheduleBlockId,
                            Number.isFinite(v) ? v : 0,
                          ),
                        );
                      }}
                    />
                    <em title="Estimated minutes for this day">
                      {formatEstimateMinutes(block.minutes)}
                    </em>
                  </label>

                  <label className="hustle-schedule-suite__block-due">
                    <span>Due</span>
                    <input
                      type="date"
                      value={block.dueDate}
                      disabled={!unlocked}
                      aria-label={`${block.dayLabel} due date`}
                      onChange={(e) => {
                        if (!unlocked || !e.target.value) return;
                        onPatch((p) =>
                          updateBlockDueDate(p, block.id as ScheduleBlockId, e.target.value),
                        );
                      }}
                    />
                  </label>

                  <label
                    className={`hustle-schedule-suite__hours${hoursMissing ? " is-invalid" : ""}`}
                  >
                    <span>
                      Log My Hours{hoursRequired ? " *" : ""}
                    </span>
                    <input
                      type="number"
                      min={hoursRequired ? 0.5 : 0}
                      max={24}
                      step={0.5}
                      value={block.hoursLogged || ""}
                      required={hoursRequired}
                      disabled={!unlocked}
                      aria-required={hoursRequired}
                      aria-invalid={hoursMissing}
                      aria-label={`Hours logged ${block.dayLabel}${hoursRequired ? " (required)" : ""}`}
                      data-testid={`schedule-block-hours-${block.id}`}
                      onChange={(e) => {
                        if (!unlocked) return;
                        const raw = e.target.value;
                        if (raw === "") {
                          onPatch((p) => setScheduleBlockHours(p, block.id as ScheduleBlockId, 0));
                          return;
                        }
                        const v = Number(raw);
                        onPatch((p) =>
                          setScheduleBlockHours(
                            p,
                            block.id as ScheduleBlockId,
                            Number.isFinite(v) ? v : 0,
                          ),
                        );
                      }}
                    />
                  </label>
                </div>

                <details
                  className="hustle-schedule-suite__day-notes"
                  data-testid={`schedule-block-notes-fold-${block.id}`}
                >
                  <summary className="hustle-schedule-suite__collapse-summary">
                    <span className="hustle-schedule-suite__collapse-title">
                      <strong>Notes</strong>
                      <em className="hustle-schedule-suite__collapse-preview">
                        {scheduleCollapsePreview(block.notes ?? "")}
                      </em>
                    </span>
                    <span className="collapse-show-hide" aria-hidden="true" />
                  </summary>
                  <div className="hustle-schedule-suite__collapse-body">
                    <textarea
                      rows={3}
                      value={block.notes ?? ""}
                      disabled={!unlocked}
                      placeholder={`Notes for ${block.dayLabel}…`}
                      aria-label={`${block.dayLabel} notes`}
                      data-testid={`schedule-block-notes-${block.id}`}
                      onChange={(e) => {
                        if (!unlocked) return;
                        onPatch((p) =>
                          setBlockNotes(p, block.id as ScheduleBlockId, e.target.value),
                        );
                      }}
                    />
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
        </>
      )}

      {suiteView === "tracker" && !planHasRequiredHours(plan) && (
        <p className="hustle-schedule-suite__hours-hint" data-testid="schedule-hours-required-hint">
          Hours are required (*) for every day before you can Save.
        </p>
      )}

      <div
        id={SCHEDULE_EMAIL_SECTION_ID}
        className="hustle-schedule-suite__email-section"
        data-testid="schedule-email-section"
      >
        <label className="hustle-schedule-suite__email hustle-schedule-suite__cadence">
          <span>Email reminders</span>
          <select
            value={plan.reminderCadence || "none"}
            disabled={!unlocked}
            data-testid="schedule-suite-cadence"
            onChange={(e) => {
              if (!unlocked) return;
              const reminderCadence = e.target.value as ScheduleReminderCadence;
              onPatch((p) => ({
                ...p,
                reminderCadence,
                emailReminders: reminderCadence !== "none",
                updatedAt: new Date().toISOString(),
              }));
            }}
          >
            {SCHEDULE_REMINDER_CADENCE_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <em>
            We email your weekly plan table plus Kid Credit balance on this cadence (Pro or higher). Save after
            changing.
          </em>
        </label>
      </div>
    </div>
  );
}

function moneyLabel(n: number): string {
  const abs = Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `-$${abs}` : `$${abs}`;
}

function SchedulePnLPanel({
  plan,
  unlocked,
  onPatch,
}: {
  plan: HustleSchedulePlan;
  unlocked: boolean;
  onPatch: (fn: (p: HustleSchedulePlan) => HustleSchedulePlan) => void;
}) {
  const ledger = plan.pnl ?? { lines: [] };
  const window = blueprintWindowStats(plan.weekStart, plan.dueDate);
  const totals = summarizePnLLines(ledger.lines);
  const weeks = weeklyOutcomesForBlueprint(ledger.lines, plan.weekStart, plan.dueDate);
  const blockPct = scheduleProgressPercent(plan.blocks);
  const targetSalesUsd = plan.blueprintGoals?.targetSalesUsd ?? 0;
  const vsTarget = salesVsTarget(totals.salesUsd, targetSalesUsd);
  const today = new Date().toISOString().slice(0, 10);

  const [kind, setKind] = useState<PnLLineKind>("sale");
  const [date, setDate] = useState(plan.weekStart || today);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<PnLExpenseCategory>("advertising");

  const addLine = () => {
    if (!unlocked) return;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return;
    const line: SchedulePnLLine = {
      id: newPnLLineId(),
      kind,
      date: date || today,
      label: label.trim() || (kind === "sale" ? "Sale" : "Expense"),
      amountUsd: amt,
      category: kind === "expense" ? category : null,
    };
    onPatch((p) => patchPlanPnL(p, upsertPnLLine(p.pnl ?? { lines: [] }, line)));
    setLabel("");
    setAmount("");
  };

  return (
    <div className="hustle-schedule-suite__pnl-panel" data-testid="schedule-view-pnl">
      <div className="hustle-schedule-suite__pnl-head">
        <h4>P&amp;L calculator</h4>
        <MembershipFeatureLockBadge
          feature="pnl"
          unlocked={unlocked}
          data-testid="schedule-pnl-lock-badge"
        />
      </div>
      <p className="hustle-schedule-suite__hint">
        Add dated <strong>sales</strong> and <strong>expense</strong> line items. Edit{" "}
        <strong>Target sales</strong> anytime — remaining / % of target update live. Net profit
        updates from line items. Keep this blueprint sprint to about{" "}
        <strong>{BLUEPRINT_MAX_DAYS} days</strong> or less. Save when done.
        {!unlocked ? (
          <>
            {" "}
            <strong>{membershipLockedBadgeLabel("pro")}</strong> membership (Schedule Suite).
          </>
        ) : null}
      </p>

      <div
        className="hustle-schedule-suite__weekly-download"
        data-testid="schedule-pnl-download"
      >
        <span>Download P&amp;L:</span>
        <button
          type="button"
          className="btn btn-outline"
          disabled={!unlocked}
          data-testid="schedule-pnl-pdf"
          onClick={() => void downloadProfitAndLossPdf(plan)}
        >
          PDF
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={!unlocked}
          data-testid="schedule-pnl-word"
          onClick={() => downloadProfitAndLossWord(plan)}
        >
          Word
        </button>
      </div>

      <div className="hustle-schedule-suite__pnl-window" data-testid="schedule-pnl-window">
        <div>
          <span>Blueprint window</span>
          <strong>
            {window.days} day{window.days === 1 ? "" : "s"} · {window.weeks} week
            {window.weeks === 1 ? "" : "s"}
          </strong>
          <em>
            {window.start} → {window.end}
            {window.withinTenDays ? "" : ` (over ${BLUEPRINT_MAX_DAYS}-day target — pick a later start or fewer days)`}
          </em>
        </div>
        <div>
          <span>Plan tracker</span>
          <strong data-testid="schedule-pnl-blueprint-pct">{blockPct}% complete</strong>
          <em>Guide steps marked Done toward finishing this blueprint</em>
        </div>
        <div className="hustle-schedule-suite__pnl-target">
          <label>
            <span>Target sales ($)</span>
            <input
              type="number"
              min={0}
              step={1}
              value={targetSalesUsd || ""}
              disabled={!unlocked}
              data-testid="schedule-pnl-target-sales"
              aria-label="Target sales USD"
              onChange={(e) => {
                const v = Number(e.target.value);
                onPatch((p) =>
                  patchBlueprintGoals(p, {
                    targetSalesUsd: Number.isFinite(v) ? v : 0,
                  }),
                );
              }}
            />
          </label>
          <em data-testid="schedule-pnl-target-progress">
            {vsTarget.targetUsd <= 0
              ? "Set a target to track progress"
              : vsTarget.overTargetUsd > 0
                ? `${vsTarget.progressPct}% of target · ${moneyLabel(vsTarget.overTargetUsd)} over`
                : `${vsTarget.progressPct}% of target · ${moneyLabel(vsTarget.remainingUsd)} remaining`}
          </em>
        </div>
      </div>

      <div className="hustle-schedule-suite__pnl-totals" data-testid="schedule-pnl-totals">
        <div>
          <span>Sales</span>
          <strong data-testid="schedule-pnl-sales-total">{moneyLabel(totals.salesUsd)}</strong>
        </div>
        <div>
          <span>Expenses</span>
          <strong data-testid="schedule-pnl-expenses-total">{moneyLabel(totals.expensesUsd)}</strong>
        </div>
        <div className={totals.profitUsd >= 0 ? "is-profit" : "is-loss"}>
          <span>Net profit</span>
          <strong data-testid="schedule-pnl-result">{moneyLabel(totals.profitUsd)}</strong>
        </div>
        <div data-testid="schedule-pnl-vs-target">
          <span>{vsTarget.overTargetUsd > 0 ? "Over target" : "To target"}</span>
          <strong data-testid="schedule-pnl-remaining">
            {moneyLabel(vsTarget.overTargetUsd > 0 ? vsTarget.overTargetUsd : vsTarget.remainingUsd)}
          </strong>
        </div>
      </div>

      <div className="hustle-schedule-suite__pnl-add" data-testid="schedule-pnl-add">
        <h5>Add line item</h5>
        <div className="hustle-schedule-suite__pnl-add-row">
          <label>
            <span>Type</span>
            <select
              value={kind}
              disabled={!unlocked}
              data-testid="schedule-pnl-kind"
              onChange={(e) => setKind(e.target.value as PnLLineKind)}
            >
              <option value="sale">Sale</option>
              <option value="expense">Expense</option>
            </select>
          </label>
          <label>
            <span>Date</span>
            <input
              type="date"
              value={date}
              disabled={!unlocked}
              data-testid="schedule-pnl-date"
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="hustle-schedule-suite__pnl-add-grow">
            <span>Description</span>
            <input
              type="text"
              value={label}
              disabled={!unlocked}
              placeholder={kind === "sale" ? "e.g. Client payment" : "e.g. Facebook ads"}
              data-testid="schedule-pnl-label"
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>
          <label>
            <span>Amount ($)</span>
            <input
              type="number"
              min={0}
              step={1}
              value={amount}
              disabled={!unlocked}
              data-testid="schedule-pnl-amount"
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          {kind === "expense" ? (
            <label>
              <span>Category</span>
              <select
                value={category}
                disabled={!unlocked}
                data-testid="schedule-pnl-category"
                onChange={(e) => setCategory(e.target.value as PnLExpenseCategory)}
              >
                {PNL_EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            disabled={!unlocked || !amount || Number(amount) <= 0}
            data-testid="schedule-pnl-add-btn"
            onClick={addLine}
          >
            <Plus size={14} aria-hidden /> Add
          </button>
        </div>
      </div>

      <div className="hustle-schedule-suite__pnl-weeks" data-testid="schedule-pnl-weeks">
        <h5>Weekly outcomes ({weeks.length} week{weeks.length === 1 ? "" : "s"})</h5>
        <ul>
          {weeks.map((w) => (
            <li key={w.key} data-testid={`schedule-pnl-week-${w.key}`}>
              <strong>{w.label}</strong>
              <span>Sales {moneyLabel(w.salesUsd)}</span>
              <span>Exp {moneyLabel(w.expensesUsd)}</span>
              <span className={w.profitUsd >= 0 ? "is-profit" : "is-loss"}>
                Net {moneyLabel(w.profitUsd)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="hustle-schedule-suite__pnl-lines" data-testid="schedule-pnl-lines">
        <h5>Line items ({ledger.lines.length})</h5>
        {ledger.lines.length === 0 ? (
          <p className="hustle-schedule-suite__hint">No lines yet — add a sale or expense above.</p>
        ) : (
          <ul>
            {ledger.lines.map((line) => (
              <li key={line.id} data-testid={`schedule-pnl-line-${line.id}`}>
                <span className={`hustle-schedule-suite__pnl-kind is-${line.kind}`}>
                  {line.kind === "sale" ? "Sale" : "Exp"}
                </span>
                <span>{line.date}</span>
                <span className="hustle-schedule-suite__pnl-line-label">{line.label}</span>
                {line.kind === "expense" ? (
                  <span>{pnlExpenseCategoryLabel(line.category)}</span>
                ) : null}
                <strong>{moneyLabel(line.amountUsd)}</strong>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={!unlocked}
                  aria-label={`Delete ${line.label}`}
                  data-testid={`schedule-pnl-delete-${line.id}`}
                  onClick={() =>
                    onPatch((p) =>
                      patchPlanPnL(p, removePnLLine(p.pnl ?? { lines: [] }, line.id)),
                    )
                  }
                >
                  <Trash2 size={12} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ScheduleErrorsDialog({
  title,
  errors,
  onDismiss,
}: {
  title: string;
  errors: string[];
  onDismiss: () => void;
}) {
  return (
    <div
      className="hustle-schedule-suite__error-dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="schedule-errors-title"
      data-testid="schedule-errors-dialog"
      onClick={onDismiss}
    >
      <div
        className="hustle-schedule-suite__error-dialog-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 id="schedule-errors-title">{title}</h4>
        <ul data-testid="schedule-errors-list">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
        <button type="button" className="btn btn-primary" onClick={onDismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}

function ScheduleGradeCelebration({
  mode,
  mark,
  pepTalk,
  score,
  onDismiss,
}: {
  mode: "congrats" | "a_pop";
  mark: ScheduleGradeMark;
  pepTalk: string;
  score: number;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, mode === "a_pop" ? 6500 : 4500);
    return () => window.clearTimeout(t);
  }, [mode, onDismiss]);

  const stream = Array.from({ length: 8 }, () => "CONGRATS").join(" · ");

  return (
    <div
      className={`hustle-schedule-suite__celeb is-${mode}`}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "a_pop" ? "A grade celebration" : "Congrats celebration"}
      data-testid="schedule-grade-celebration"
      onClick={onDismiss}
    >
      <div
        className="hustle-schedule-suite__celeb-card"
        onClick={(e) => e.stopPropagation()}
      >
        {mode === "a_pop" ? (
          <div className="hustle-schedule-suite__confetti" aria-hidden>
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} className={`hustle-schedule-suite__confetti-bit bit-${i % 8}`} />
            ))}
          </div>
        ) : null}
        <div className="hustle-schedule-suite__celeb-stream" aria-hidden>
          <span>{stream}</span>
          <span>{stream}</span>
        </div>
        <p className="hustle-schedule-suite__celeb-mark" data-testid="schedule-celeb-mark">
          {mark}
        </p>
        <p className="hustle-schedule-suite__celeb-score">{score}% complete</p>
        <p className="hustle-schedule-suite__celeb-pep">{pepTalk}</p>
        <button type="button" className="btn btn-primary" onClick={onDismiss}>
          Keep hustling
        </button>
      </div>
    </div>
  );
}
