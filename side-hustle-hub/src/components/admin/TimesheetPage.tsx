import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, CalendarClock, CalendarDays, ExternalLink, RefreshCw } from "lucide-react";
import { BusyOverlay, WaitIndicator } from "../WaitFeedback";
import type { AuthUser } from "../../lib/auth";
import { ApiError } from "../../lib/api";
import {
  fetchTasks,
  isoToMmddyy,
  mmddyyToIso,
  normalizeDueDateInput,
} from "../../lib/gysh-tasks";
import { openAdminStudioInNewWindow } from "../../lib/admin-deep-links";
import {
  suggestedSprintForTask,
  suggestedSprintForTest,
} from "../../lib/gysh-sprint-board";
import {
  BACKLOG_SPRINT,
  currentSprintIndex,
  sprintLabel,
} from "../../lib/gysh-sprints";
import { fetchClosedSprints, isSprintLocked } from "../../lib/gysh-closed-sprints";
import { SprintLockedBanner } from "./SprintLockedBanner";
import {
  fetchTestStatuses,
  TEST_CASES,
  withDefaultSuite,
} from "../../lib/gysh-test-plan";
import { progressPersonFromTimeEntry } from "../../lib/daily-progress-report";
import {
  bucketByDay,
  daysInInclusiveRange,
  fetchTimeEntries,
  fetchTimeEntryUsers,
  formatDuration,
  formatDurationHours,
  formatTimeOfDay,
  liveElapsedMs,
  toIsoDate,
  weekEndingFriday,
  weekStartingSaturday,
  type TimeEntry,
  type TimeEntryUser,
} from "../../lib/gysh-time-entries";

const PARTNER_CHIP_ORDER = ["Tina", "Evelyn", "Lyriq"] as const;

type PartnerChip = {
  key: string;
  label: string;
  userIds: string[];
};

function partnerKeyFromIdentity(name: string, email: string, fallbackId: string): string {
  const who = progressPersonFromTimeEntry({ userName: name, userEmail: email });
  if (who === "Tina" || who === "Evelyn" || who === "Lyriq") return who;
  return `other:${(email || fallbackId).toLowerCase()}`;
}

function partnerLabelFromIdentity(name: string, email: string, fallbackId: string): string {
  const who = progressPersonFromTimeEntry({ userName: name, userEmail: email });
  if (who === "Tina" || who === "Evelyn" || who === "Lyriq") return who;
  return (name || email || fallbackId).trim() || "Unknown";
}

function partnerKeyFromUser(u: TimeEntryUser): string {
  return partnerKeyFromIdentity(u.name || "", u.email || "", u.id);
}

function partnerLabelFromUser(u: TimeEntryUser): string {
  return partnerLabelFromIdentity(u.name || "", u.email || "", u.id);
}

function partnerKeyFromEntry(e: TimeEntry): string {
  return partnerKeyFromIdentity(e.userName || "", e.userEmail || "", e.userId);
}

function partnerLabelFromEntry(e: TimeEntry): string {
  return partnerLabelFromIdentity(e.userName || "", e.userEmail || "", e.userId);
}

/** One chip per partner (merges duplicate Evelyn/Tina accounts). */
function buildPartnerChips(users: TimeEntryUser[]): PartnerChip[] {
  const map = new Map<string, PartnerChip>();
  for (const u of users) {
    const key = partnerKeyFromUser(u);
    const label = partnerLabelFromUser(u);
    const prev = map.get(key);
    if (prev) {
      if (!prev.userIds.includes(u.id)) prev.userIds.push(u.id);
    } else {
      map.set(key, { key, label, userIds: [u.id] });
    }
  }
  return [...map.values()].sort((a, b) => {
    const ai = PARTNER_CHIP_ORDER.indexOf(a.key as (typeof PARTNER_CHIP_ORDER)[number]);
    const bi = PARTNER_CHIP_ORDER.indexOf(b.key as (typeof PARTNER_CHIP_ORDER)[number]);
    if (ai >= 0 || bi >= 0) return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    return a.label.localeCompare(b.label);
  });
}

function accentForPartner(key: string, index: number): string {
  if (key === "Tina") return "var(--crimson)";
  if (key === "Evelyn") return "var(--bronze)";
  if (key === "Lyriq") return "var(--accent-emerald)";
  const palette = ["var(--crimson)", "var(--bronze)", "var(--accent-emerald)", "#0e7490", "#7c3aed"];
  return palette[index % palette.length]!;
}

const TEST_CASE_BY_ID = new Map(withDefaultSuite(TEST_CASES).map((t) => [t.id, t]));

function entrySprintKey(e: Pick<TimeEntry, "source" | "sourceId">): string {
  return `${e.source}:${e.sourceId}`;
}

function toggleSprintFilter(prev: Set<number>, sprint: number): Set<number> {
  const next = new Set(prev);
  if (next.has(sprint)) next.delete(sprint);
  else next.add(sprint);
  return next;
}

type TimesheetPageProps = {
  authUser?: AuthUser | null;
};

/** Show empty day rows only for short ranges; longer presets list logged days only. */
const EXPAND_EMPTY_DAYS_MAX = 45;

/** First calendar day partner timers existed (America/Chicago). */
const TIMEKEEPING_START = "2026-07-19";

type DatePresetId =
  | "today"
  | "yesterday"
  | "last7"
  | "last14"
  | "last30"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "lastYear"
  | "allTime"
  | "custom";

type NamedDatePresetId = Exclude<DatePresetId, "custom">;

const DATE_PRESETS: { id: NamedDatePresetId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 days" },
  { id: "last14", label: "Last 14 days" },
  { id: "last30", label: "Last 30 days" },
  { id: "thisWeek", label: "This week" },
  { id: "lastWeek", label: "Last week" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "thisYear", label: "This year" },
  { id: "lastYear", label: "Last year" },
  { id: "allTime", label: "All time" },
];

function todayIso(): string {
  return toIsoDate(new Date());
}

function addDaysIso(iso: string, delta: number): string {
  const d = parseLocal(iso);
  d.setDate(d.getDate() + delta);
  return toIsoDate(d);
}

function rangeForPreset(id: NamedDatePresetId, now = new Date()): { from: string; to: string } {
  const today = toIsoDate(now);
  switch (id) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const y = addDaysIso(today, -1);
      return { from: y, to: y };
    }
    case "last7":
      return { from: addDaysIso(today, -6), to: today };
    case "last14":
      return { from: addDaysIso(today, -13), to: today };
    case "last30":
      return { from: addDaysIso(today, -29), to: today };
    case "thisWeek": {
      const fri = weekEndingFriday(now);
      return { from: weekStartingSaturday(fri), to: today };
    }
    case "lastWeek": {
      const thisFri = weekEndingFriday(now);
      const lastFri = addDaysIso(thisFri, -7);
      return { from: weekStartingSaturday(lastFri), to: lastFri };
    }
    case "thisMonth": {
      const d = parseLocal(today);
      const start = toIsoDate(new Date(d.getFullYear(), d.getMonth(), 1));
      return { from: start, to: today };
    }
    case "lastMonth": {
      const d = parseLocal(today);
      const start = toIsoDate(new Date(d.getFullYear(), d.getMonth() - 1, 1));
      const end = toIsoDate(new Date(d.getFullYear(), d.getMonth(), 0));
      return { from: start, to: end };
    }
    case "thisYear": {
      const d = parseLocal(today);
      return { from: toIsoDate(new Date(d.getFullYear(), 0, 1)), to: today };
    }
    case "lastYear": {
      const d = parseLocal(today);
      const y = d.getFullYear() - 1;
      return {
        from: toIsoDate(new Date(y, 0, 1)),
        to: toIsoDate(new Date(y, 11, 31)),
      };
    }
    case "allTime":
      return { from: TIMEKEEPING_START, to: today };
  }
}

function detectPreset(from: string, to: string): DatePresetId {
  for (const { id } of DATE_PRESETS) {
    const r = rangeForPreset(id);
    if (r.from === from && r.to === to) return id;
  }
  return "custom";
}

function weekdayLabel(iso: string): string {
  return parseLocal(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function periodLabel(from: string, to: string): string {
  if (from === to) return weekdayLabel(from);
  return `${weekdayLabel(from)} – ${weekdayLabel(to)}`;
}

function membersSummary(chips: PartnerChip[], selectedKeys: Set<string>): string {
  if (selectedKeys.size === 0 || selectedKeys.size === chips.length) return "All team members";
  if (selectedKeys.size === 1) {
    const chip = chips.find((c) => selectedKeys.has(c.key));
    return chip?.label ?? "1 member";
  }
  return `${selectedKeys.size} members`;
}

function togglePartner(prev: Set<string>, key: string): Set<string> {
  const next = new Set(prev);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

type DayRowSort = "start" | "duration-desc" | "duration-asc";

function sortDayEntries(list: TimeEntry[], sort: DayRowSort): TimeEntry[] {
  const copy = [...list];
  if (sort === "duration-desc") {
    copy.sort(
      (a, b) =>
        liveElapsedMs(b) - liveElapsedMs(a) || a.startedAt.localeCompare(b.startedAt),
    );
  } else if (sort === "duration-asc") {
    copy.sort(
      (a, b) =>
        liveElapsedMs(a) - liveElapsedMs(b) || a.startedAt.localeCompare(b.startedAt),
    );
  } else {
    copy.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  }
  return copy;
}

function nextDurationSort(current: DayRowSort): DayRowSort {
  if (current === "duration-desc") return "duration-asc";
  if (current === "duration-asc") return "start";
  return "duration-desc";
}

function openTestInNewWindow(testId: string) {
  openAdminStudioInNewWindow({ tab: "testing", testId });
}

function openTaskInNewWindow(taskId: string) {
  openAdminStudioInNewWindow({ tab: "tasks", taskId });
}

export function TimesheetPage(_props: TimesheetPageProps = {}) {
  const today = todayIso();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [activePreset, setActivePreset] = useState<DatePresetId>("today");
  const [draftFrom, setDraftFrom] = useState(today);
  const [draftTo, setDraftTo] = useState(today);
  const [typedDate, setTypedDate] = useState("");
  const [rangeMode, setRangeMode] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [users, setUsers] = useState<TimeEntryUser[]>([]);
  /** Empty set = all partners. Keys are Tina/Evelyn/Lyriq (or other:email). */
  const [selectedPartners, setSelectedPartners] = useState<Set<string>>(() => new Set());
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const partnerChips = useMemo(() => buildPartnerChips(users), [users]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  /** Sort rows inside each day block (Start time default; Duration clickable). */
  const [dayRowSort, setDayRowSort] = useState<DayRowSort>("start");
  /**
   * Work-type multi-select. Empty set = Tasks & tests (both).
   * Otherwise only the selected sources (`task` / `test`).
   */
  const [sourceFilters, setSourceFilters] = useState<Set<"task" | "test">>(() => new Set());
  /** Sprint multi-select. Empty set = all sprints. */
  const [sprintFilters, setSprintFilters] = useState<Set<number>>(() => new Set());
  /** `${source}:${sourceId}` → sprint index (incl. BACKLOG_SPRINT). */
  const [sprintByEntryKey, setSprintByEntryKey] = useState<Map<string, number>>(() => new Map());
  const [closedSprints, setClosedSprints] = useState<Set<number>>(() => new Set());
  const pickerRef = useRef<HTMLDivElement>(null);
  const typedId = useId();

  const applyRange = (nextFrom: string, nextTo: string, preset: DatePresetId = "custom") => {
    let a = nextFrom;
    let b = nextTo;
    if (a > b) {
      const tmp = a;
      a = b;
      b = tmp;
    }
    setFrom(a);
    setTo(b);
    setActivePreset(preset === "custom" ? detectPreset(a, b) : preset);
    setDraftFrom(a);
    setDraftTo(b);
    setRangeMode(a !== b);
    setTypedDate(isoToMmddyy(a) || "");
  };

  const applyPreset = (id: NamedDatePresetId) => {
    const r = rangeForPreset(id);
    applyRange(r.from, r.to, id);
    setPickerOpen(false);
  };

  const reload = async (rangeFrom = from, rangeTo = to) => {
    setLoading(true);
    setError("");
    try {
      const [u, list, testPayload, tasks] = await Promise.all([
        fetchTimeEntryUsers(),
        // Always load the team range, then filter client-side for multi-select.
        fetchTimeEntries({ userId: "all", from: rangeFrom, to: rangeTo }),
        fetchTestStatuses().catch(() => ({ sprints: {} as Record<string, number> })),
        fetchTasks().catch(() => []),
      ]);
      setUsers(u);
      setEntries(list);

      const taskById = new Map(tasks.map((t) => [t.id, t]));
      const testSprints = testPayload.sprints ?? {};
      const sprintMap = new Map<string, number>();
      for (const e of list) {
        const key = entrySprintKey(e);
        if (sprintMap.has(key)) continue;
        if (e.source === "test") {
          const stored = testSprints[e.sourceId];
          if (typeof stored === "number") {
            sprintMap.set(key, stored);
          } else {
            const tc = TEST_CASE_BY_ID.get(e.sourceId);
            sprintMap.set(
              key,
              tc ? suggestedSprintForTest(tc) : BACKLOG_SPRINT,
            );
          }
        } else {
          const task = taskById.get(e.sourceId);
          if (task && typeof task.sprint === "number") {
            sprintMap.set(key, task.sprint);
          } else {
            sprintMap.set(
              key,
              suggestedSprintForTask(
                task ?? { id: e.sourceId, category: "admin_ops", notes: "" },
              ),
            );
          }
        }
      }
      setSprintByEntryKey(sprintMap);

      // Drop partner selections that no longer exist after roster merge.
      const chipKeys = new Set(buildPartnerChips(u).map((c) => c.key));
      setSelectedPartners((prev) => {
        if (prev.size === 0) return prev;
        const next = new Set([...prev].filter((key) => chipKeys.has(key)));
        return next.size === prev.size ? prev : next;
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load timesheet.");
      setEntries([]);
      setSprintByEntryKey(new Map());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when range changes
  }, [from, to]);

  useEffect(() => {
    let cancelled = false;
    void fetchClosedSprints()
      .then((closed) => {
        if (!cancelled) setClosedSprints(new Set(closed));
      })
      .catch(() => {
        /* optional */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [pickerOpen]);

  const openPicker = () => {
    setDraftFrom(from);
    setDraftTo(to);
    setRangeMode(from !== to);
    setTypedDate(isoToMmddyy(from) || "");
    setPickerOpen((o) => !o);
  };

  const applyPicker = () => {
    let nextFrom = draftFrom;
    let nextTo = rangeMode ? draftTo : draftFrom;
    const typed = normalizeDueDateInput(typedDate.trim());
    if (typed) {
      const iso = mmddyyToIso(typed);
      if (iso) {
        nextFrom = iso;
        if (!rangeMode) nextTo = iso;
      }
    }
    applyRange(nextFrom, nextTo, "custom");
    setPickerOpen(false);
  };

  const selectToday = () => applyPreset("today");

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (selectedPartners.size > 0 && !selectedPartners.has(partnerKeyFromEntry(e))) {
        return false;
      }
      if (sourceFilters.size > 0 && !sourceFilters.has(e.source)) return false;
      if (sprintFilters.size > 0) {
        const sprint = sprintByEntryKey.get(entrySprintKey(e)) ?? BACKLOG_SPRINT;
        if (!sprintFilters.has(sprint)) return false;
      }
      return true;
    });
  }, [entries, selectedPartners, sourceFilters, sprintFilters, sprintByEntryKey]);

  const sprintFilterOptions = useMemo(() => {
    const set = new Set<number>([currentSprintIndex(), BACKLOG_SPRINT]);
    for (const sprint of sprintByEntryKey.values()) set.add(sprint);
    return [...set].sort((a, b) => a - b);
  }, [sprintByEntryKey]);

  const allSprintsSelected = sprintFilters.size === 0;
  const sprintFilterSummary = useMemo(() => {
    if (allSprintsSelected) return "All sprints";
    if (sprintFilters.size === 1) {
      const only = [...sprintFilters][0]!;
      return sprintLabel(only);
    }
    return `${sprintFilters.size} sprints`;
  }, [allSprintsSelected, sprintFilters]);

  const byDayMap = useMemo(() => {
    const buckets = bucketByDay(filteredEntries);
    return new Map(buckets.map((b) => [b.date, b]));
  }, [filteredEntries]);

  const spanDays = useMemo(() => daysInInclusiveRange(from, to), [from, to]);
  const longRange = spanDays.length > EXPAND_EMPTY_DAYS_MAX;
  const rangeDays = useMemo(() => {
    if (!longRange) return [...spanDays].reverse();
    // Long presets: only days that actually have time (newest first).
    return [...byDayMap.keys()]
      .filter((d) => d >= from && d <= to)
      .sort((a, b) => b.localeCompare(a));
  }, [longRange, spanDays, byDayMap, from, to]);
  const rangeTotalMs = filteredEntries.reduce((sum, e) => sum + liveElapsedMs(e), 0);
  const taskTotalMs = filteredEntries
    .filter((e) => e.source === "task")
    .reduce((sum, e) => sum + liveElapsedMs(e), 0);
  const testTotalMs = filteredEntries
    .filter((e) => e.source === "test")
    .reduce((sum, e) => sum + liveElapsedMs(e), 0);
  const label = periodLabel(from, to);
  const showMemberCol = selectedPartners.size !== 1;
  const usersLabel = membersSummary(partnerChips, selectedPartners);
  const allSelected = selectedPartners.size === 0;
  const allSourcesSelected = sourceFilters.size === 0;
  const showTasks = allSourcesSelected || sourceFilters.has("task");
  const showTests = allSourcesSelected || sourceFilters.has("test");
  const showSourceSplit = showTasks && showTests;

  const memberTotals = useMemo(() => {
    const byKey = new Map<
      string,
      { key: string; name: string; ms: number; taskMs: number; testMs: number }
    >();
    for (const e of filteredEntries) {
      const ms = liveElapsedMs(e);
      if (ms <= 0) continue;
      const key = partnerKeyFromEntry(e);
      const name = partnerLabelFromEntry(e);
      const prev = byKey.get(key);
      if (prev) {
        prev.ms += ms;
        if (e.source === "task") prev.taskMs += ms;
        else prev.testMs += ms;
      } else {
        byKey.set(key, {
          key,
          name,
          ms,
          taskMs: e.source === "task" ? ms : 0,
          testMs: e.source === "test" ? ms : 0,
        });
      }
    }
    // Include selected partners with zero time so multi-select stays clear.
    if (selectedPartners.size > 0) {
      for (const key of selectedPartners) {
        if (byKey.has(key)) continue;
        const chip = partnerChips.find((c) => c.key === key);
        byKey.set(key, {
          key,
          name: chip?.label ?? key,
          ms: 0,
          taskMs: 0,
          testMs: 0,
        });
      }
    }
    return [...byKey.values()].sort((a, b) => b.ms - a.ms || a.name.localeCompare(b.name));
  }, [filteredEntries, selectedPartners, partnerChips]);

  const durationSortActive = dayRowSort.startsWith("duration");

  const renderEntryTable = (
    rows: TimeEntry[],
    kind: "test" | "task",
    opts?: { testId?: string; heading?: string },
  ) => {
    if (rows.length === 0) return null;
    const kindLabel = opts?.heading ?? (kind === "test" ? "Tests" : "Tasks");
    const subtotal = rows.reduce((sum, e) => sum + liveElapsedMs(e), 0);
    return (
      <div className="timesheet-day__group" data-testid={opts?.testId}>
        <div className="timesheet-day__group-head">
          <h4>{kindLabel}</h4>
          <span>
            {rows.length} item{rows.length === 1 ? "" : "s"} · {formatDuration(subtotal)} (
            {formatDurationHours(subtotal)})
          </span>
        </div>
        <table className="timesheet-day__table">
          <thead>
            <tr>
              {showMemberCol && <th>Member</th>}
              <th>Item</th>
              <th>
                <button
                  type="button"
                  className="timesheet-day__sort-btn"
                  data-active={dayRowSort === "start" ? "true" : "false"}
                  aria-pressed={dayRowSort === "start"}
                  title="Sort by start time"
                  onClick={() => setDayRowSort("start")}
                >
                  Start
                  {dayRowSort === "start" ? <ArrowUp size={14} aria-hidden /> : null}
                </button>
              </th>
              <th>End</th>
              <th>Status</th>
              <th>
                <button
                  type="button"
                  className="timesheet-day__sort-btn"
                  data-active={durationSortActive ? "true" : "false"}
                  aria-pressed={durationSortActive}
                  title="Sort by duration (click to toggle longest / shortest)"
                  onClick={() => setDayRowSort((s) => nextDurationSort(s))}
                >
                  Duration
                  {dayRowSort === "duration-desc" ? (
                    <ArrowDown size={14} aria-hidden />
                  ) : dayRowSort === "duration-asc" ? (
                    <ArrowUp size={14} aria-hidden />
                  ) : null}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                {showMemberCol && <td>{partnerLabelFromEntry(e)}</td>}
                <td>
                  {kind === "test" ? (
                    <button
                      type="button"
                      className="timesheet-day__item-link"
                      title={`Open ${e.sourceId} in Testing Portal (new window)`}
                      onClick={() => openTestInNewWindow(e.sourceId)}
                    >
                      <code>{e.sourceId}</code>
                      <ExternalLink size={12} aria-hidden />
                      {e.sourceLabel ? (
                        <span className="timesheet-day__label">{e.sourceLabel}</span>
                      ) : null}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="timesheet-day__item-link"
                      title={`Open ${e.sourceId} in Task List (new window)`}
                      onClick={() => openTaskInNewWindow(e.sourceId)}
                    >
                      <code>{e.sourceId}</code>
                      <ExternalLink size={12} aria-hidden />
                      {e.sourceLabel ? (
                        <span className="timesheet-day__label">{e.sourceLabel}</span>
                      ) : null}
                    </button>
                  )}
                </td>
                <td className="timesheet-day__clock">{formatTimeOfDay(e.startedAt)}</td>
                <td className="timesheet-day__clock">
                  {e.status === "running" ? "now" : formatTimeOfDay(e.endedAt)}
                </td>
                <td>
                  <span className={`timesheet-status timesheet-status--${e.status}`}>
                    {e.status}
                  </span>
                </td>
                <td>{formatDuration(liveElapsedMs(e))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="timesheet-page" data-testid="timesheet-page">
      <BusyOverlay active={loading} message="Loading timesheet…" />
      <header className="glass timesheet-page__hero">
        <div>
          <p className="timesheet-page__eyebrow">
            <CalendarClock size={14} aria-hidden /> Partner timesheet
          </p>
          <h2>Daily & weekly time</h2>
          <p>
            Pick a single day or a date range. Multi-select team members (or All). Start / pause /
            end timers on Task List and Testing Portal — timers stop when status changes or work is
            marked done.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => void reload()} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <div className="glass timesheet-page__controls">
        <div className="timesheet-page__members" data-testid="timesheet-users">
          <span className="timesheet-page__date-label">Team member</span>
          <div className="timesheet-page__member-chips" role="listbox" aria-label="Team members" aria-multiselectable="true">
            <button
              type="button"
              role="option"
              aria-selected={allSelected}
              className="qa-tester-bubble"
              data-active={allSelected ? "true" : "false"}
              data-testid="timesheet-user-all"
              onClick={() => setSelectedPartners(new Set())}
            >
              All
            </button>
            {partnerChips.map((chip, i) => {
              const active = selectedPartners.has(chip.key);
              const accent = accentForPartner(chip.key, i);
              return (
                <button
                  key={chip.key}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className="qa-tester-bubble"
                  data-active={active ? "true" : "false"}
                  data-testid={`timesheet-user-${chip.key}`}
                  title={chip.userIds.length > 1 ? `${chip.userIds.length} linked logins` : undefined}
                  onClick={() => setSelectedPartners((prev) => togglePartner(prev, chip.key))}
                  style={{
                    borderColor: active ? accent : undefined,
                    boxShadow: active ? `0 0 0 1px ${accent}` : undefined,
                  }}
                >
                  <span className="qa-tester-dot" style={{ background: accent }} aria-hidden />
                  {chip.label}
                </button>
              );
            })}
          </div>
          <p className="timesheet-page__members-hint">
            Multi-select · All = entire team · duplicate logins merged
          </p>
        </div>

        <div className="timesheet-page__source-filter" data-testid="timesheet-source-filter">
          <span className="timesheet-page__date-label">Filter · Tasks / Tests</span>
          <div
            className="timesheet-page__member-chips"
            role="listbox"
            aria-label="Filter by tasks or tests"
            aria-multiselectable="true"
          >
            <button
              type="button"
              role="option"
              aria-selected={allSourcesSelected}
              className="qa-tester-bubble"
              data-active={allSourcesSelected ? "true" : "false"}
              data-testid="timesheet-source-all"
              onClick={() => setSourceFilters(new Set())}
            >
              Both
            </button>
            <button
              type="button"
              role="option"
              aria-selected={sourceFilters.has("task")}
              className="qa-tester-bubble"
              data-active={sourceFilters.has("task") ? "true" : "false"}
              data-testid="timesheet-source-task"
              onClick={() =>
                setSourceFilters((prev) => {
                  const next = new Set(prev);
                  if (next.has("task")) next.delete("task");
                  else next.add("task");
                  // Both selected = same as Both (clear)
                  if (next.has("task") && next.has("test")) return new Set();
                  return next;
                })
              }
            >
              <span className="qa-filter-chip__check" aria-hidden>
                {sourceFilters.has("task") ? "✓" : ""}
              </span>
              Tasks
            </button>
            <button
              type="button"
              role="option"
              aria-selected={sourceFilters.has("test")}
              className="qa-tester-bubble"
              data-active={sourceFilters.has("test") ? "true" : "false"}
              data-testid="timesheet-source-test"
              onClick={() =>
                setSourceFilters((prev) => {
                  const next = new Set(prev);
                  if (next.has("test")) next.delete("test");
                  else next.add("test");
                  if (next.has("task") && next.has("test")) return new Set();
                  return next;
                })
              }
            >
              <span className="qa-filter-chip__check" aria-hidden>
                {sourceFilters.has("test") ? "✓" : ""}
              </span>
              Tests
            </button>
          </div>
          <p className="timesheet-page__members-hint">
            {showTasks ? `Tasks ${formatDurationHours(taskTotalMs)}` : "Tasks hidden"}
            {" · "}
            {showTests ? `Tests ${formatDurationHours(testTotalMs)}` : "Tests hidden"}
          </p>
        </div>

        <div className="timesheet-page__sprint-filter" data-testid="timesheet-sprint-filter">
          <span className="timesheet-page__date-label">Filter · Sprint</span>
          <div
            className="timesheet-page__member-chips"
            role="listbox"
            aria-label="Filter by sprint"
            aria-multiselectable="true"
          >
            <button
              type="button"
              role="option"
              aria-selected={allSprintsSelected}
              className="qa-tester-bubble"
              data-active={allSprintsSelected ? "true" : "false"}
              data-testid="timesheet-sprint-all"
              onClick={() => setSprintFilters(new Set())}
            >
              All
            </button>
            {sprintFilterOptions.map((sprint) => {
              const active = sprintFilters.has(sprint);
              const locked = isSprintLocked(closedSprints, sprint);
              return (
                <button
                  key={sprint}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className="qa-tester-bubble"
                  data-active={active ? "true" : "false"}
                  data-locked={locked ? "true" : "false"}
                  data-testid={`timesheet-sprint-${sprint === BACKLOG_SPRINT ? "backlog" : sprint}`}
                  title={locked ? `${sprintLabel(sprint)} · Closed & locked` : sprintLabel(sprint)}
                  onClick={() => setSprintFilters((prev) => toggleSprintFilter(prev, sprint))}
                >
                  <span className="qa-filter-chip__check" aria-hidden>
                    {active ? "✓" : ""}
                  </span>
                  {sprintLabel(sprint)}
                  {locked ? <SprintLockedBanner /> : null}
                </button>
              );
            })}
          </div>
          <p className="timesheet-page__members-hint">Multi-select · {sprintFilterSummary}</p>
        </div>

        <div className="timesheet-page__date-control" ref={pickerRef}>
          <span className="timesheet-page__date-label">Schedule</span>
          <div
            className="timesheet-page__presets"
            role="listbox"
            aria-label="Date range presets"
            data-testid="timesheet-presets"
          >
            {DATE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={activePreset === p.id}
                className="qa-tester-bubble"
                data-active={activePreset === p.id ? "true" : "false"}
                data-testid={`timesheet-preset-${p.id}`}
                onClick={() => applyPreset(p.id)}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              role="option"
              aria-selected={activePreset === "custom"}
              className="qa-tester-bubble"
              data-active={activePreset === "custom" ? "true" : "false"}
              data-testid="timesheet-preset-custom"
              onClick={openPicker}
              title="Pick a custom day or range"
            >
              <CalendarDays size={14} aria-hidden /> Custom
            </button>
          </div>
          <div className="timesheet-page__date-row">
            <span className="daily-progress-report__period" aria-live="polite">
              {label}
            </span>
          </div>

          {pickerOpen && (
            <div
              className="daily-progress-report__picker timesheet-page__picker"
              role="dialog"
              aria-label="Select timesheet period"
            >
              <div className="daily-progress-report__modes">
                <button
                  type="button"
                  className={!rangeMode ? "is-active" : undefined}
                  onClick={() => {
                    setRangeMode(false);
                    setDraftTo(draftFrom);
                  }}
                >
                  Single day
                </button>
                <button
                  type="button"
                  className={rangeMode ? "is-active" : undefined}
                  onClick={() => setRangeMode(true)}
                >
                  Date range
                </button>
              </div>

              <button
                type="button"
                className="btn btn-outline timesheet-page__picker-today"
                onClick={selectToday}
              >
                Jump to today
              </button>

              <label className="daily-progress-report__field">
                <span>{rangeMode ? "From" : "Day"}</span>
                <input
                  type="date"
                  value={draftFrom}
                  max={todayIso()}
                  onChange={(e) => {
                    setDraftFrom(e.target.value);
                    if (!rangeMode) setDraftTo(e.target.value);
                    setTypedDate(isoToMmddyy(e.target.value) || "");
                  }}
                />
              </label>

              {rangeMode && (
                <label className="daily-progress-report__field">
                  <span>To</span>
                  <input
                    type="date"
                    value={draftTo}
                    max={todayIso()}
                    min={draftFrom}
                    onChange={(e) => setDraftTo(e.target.value)}
                  />
                </label>
              )}

              <label className="daily-progress-report__field" htmlFor={typedId}>
                <span>Or enter date (MM/DD/YY)</span>
                <input
                  id={typedId}
                  type="text"
                  inputMode="numeric"
                  placeholder="07/20/26"
                  value={typedDate}
                  onChange={(e) => setTypedDate(e.target.value)}
                />
              </label>

              <div className="daily-progress-report__picker-actions">
                <button type="button" className="btn btn-outline" onClick={() => setPickerOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={applyPicker}>
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="timesheet-page__week-total">
          <span>{from === to ? "Day total" : "Range total"}</span>
          <strong>{formatDuration(rangeTotalMs)}</strong>
          <em>{formatDurationHours(rangeTotalMs)}</em>
        </div>
      </div>

      {!loading && showMemberCol && memberTotals.length > 0 && (
        <section
          className="glass timesheet-page__member-totals"
          aria-label="Totals by team member"
          data-testid="timesheet-member-totals"
        >
          <header className="timesheet-page__member-totals-head">
            <h3>By member</h3>
            <span>{label}</span>
          </header>
          <ul className="timesheet-page__member-totals-list">
            {memberTotals.map((row, i) => {
              const accent = accentForPartner(row.key, i);
              return (
                <li key={row.key} data-testid={`timesheet-member-total-${row.key}`}>
                  <span className="timesheet-page__member-totals-name">
                    <span className="qa-tester-dot" style={{ background: accent }} aria-hidden />
                    {row.name}
                    {showSourceSplit && (row.taskMs > 0 || row.testMs > 0) ? (
                      <span className="timesheet-page__member-totals-split">
                        tasks {formatDurationHours(row.taskMs)} · tests{" "}
                        {formatDurationHours(row.testMs)}
                      </span>
                    ) : null}
                  </span>
                  <span className="timesheet-page__member-totals-dur">
                    <strong>{formatDuration(row.ms)}</strong>
                    <em>{formatDurationHours(row.ms)}</em>
                  </span>
                </li>
              );
            })}
          </ul>
          <footer className="timesheet-page__member-totals-foot">
            <span>Team total</span>
            <strong>{formatDuration(rangeTotalMs)}</strong>
            <em>{formatDurationHours(rangeTotalMs)}</em>
          </footer>
        </section>
      )}

      {error && <div className="timesheet-page__error">{error}</div>}
      {loading && (
        <WaitIndicator className="timesheet-page__muted" message="Loading timesheet…" style={{ marginTop: 0 }} />
      )}

      {!loading && longRange && rangeDays.length > 0 && (
        <p className="timesheet-page__muted timesheet-page__range-note">
          Showing {rangeDays.length} day{rangeDays.length === 1 ? "" : "s"} with logged time in this
          period (empty days hidden).
        </p>
      )}

      {!loading && (
        <div className="timesheet-page__days">
          {rangeDays.length === 0 ? (
            <p className="timesheet-page__muted">
              {spanDays.length === 0
                ? "Pick a valid date or range."
                : "No time logged in this period."}
            </p>
          ) : (
            rangeDays.map((date) => {
              const bucket = byDayMap.get(date);
              const total = bucket?.totalMs ?? 0;
              const list = sortDayEntries(bucket?.entries ?? [], dayRowSort);
              const testList = list.filter((e) => e.source === "test");
              const taskList = list.filter((e) => e.source === "task");
              return (
                <section key={date} className="glass timesheet-day" data-testid={`timesheet-day-${date}`}>
                  <header className="timesheet-day__head">
                    <div>
                      <h3>{weekdayLabel(date)}</h3>
                      <span className="timesheet-day__iso">{date}</span>
                    </div>
                    <div className="timesheet-day__total">
                      <strong>{formatDuration(total)}</strong>
                      <span>{formatDurationHours(total)}</span>
                    </div>
                  </header>
                  {list.length === 0 ? (
                    <p className="timesheet-page__muted">No time logged.</p>
                  ) : (
                    <div className="timesheet-day__groups">
                      {showTests
                        ? renderEntryTable(testList, "test", {
                            testId: `timesheet-day-${date}-test`,
                          })
                        : null}
                      {showTasks
                        ? renderEntryTable(taskList, "task", {
                            testId: `timesheet-day-${date}-task`,
                          })
                        : null}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
      )}

      <p className="timesheet-page__footnote">
        Showing {usersLabel} · {from === to ? from : `${from} → ${to}`}
      </p>
    </div>
  );
}
