import { useEffect, useId, useRef, useState } from "react";
import {
  CalendarDays,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  RefreshCw,
} from "lucide-react";
import {
  buildDailyProgressReport,
  collectProgressActivityDays,
  formatProgressSortLabel,
  formatProgressSprintsLabel,
  formatProgressStatusesLabel,
  formatRangeLabel,
  listProgressSprintFilterOptions,
  PROGRESS_REPORT_PEOPLE,
  PROGRESS_SORT_OPTIONS,
  PROGRESS_STATUS_FILTERS,
  type DailyProgressReport as Report,
  type ProgressReportPerson,
  type ProgressSortBy,
  type ProgressSprintFilter,
  type ProgressStatusFilter,
} from "../../lib/daily-progress-report";
import { currentSprintIndex } from "../../lib/gysh-sprints";
import {
  downloadDailyProgressExcel,
  downloadDailyProgressPdf,
  downloadDailyProgressWord,
  type ProgressExportFormat,
} from "../../lib/daily-progress-export";
import {
  fetchDailyProgressAudit,
  logDailyProgressExport,
  type DailyProgressAuditEntry,
} from "../../lib/daily-progress-audit";
import {
  fetchTasks,
  isoToMmddyy,
  mmddyyToIso,
  normalizeDueDateInput,
  type GyshTask,
} from "../../lib/gysh-tasks";
import { fetchTestStatuses, type TestStatusesPayload } from "../../lib/gysh-test-plan";
import { fetchTimeEntries, toIsoDate, type TimeEntry } from "../../lib/gysh-time-entries";

function todayIso(): string {
  return toIsoDate(new Date());
}

const PERSON_ACCENT: Record<ProgressReportPerson, string> = {
  Tina: "var(--crimson)",
  Evelyn: "var(--bronze)",
  Lyriq: "var(--accent-emerald)",
  Both: "var(--charcoal)",
  Unassigned: "#7a7064",
};

function peopleLabel(people: ProgressReportPerson[]): string {
  if (people.length === 0) return "All";
  if (people.length === 1) return people[0]!;
  if (people.length === 2) return `${people[0]} + ${people[1]}`;
  return `${people.length} people`;
}

function togglePerson(
  prev: ProgressReportPerson[],
  person: ProgressReportPerson,
): ProgressReportPerson[] {
  if (prev.includes(person)) return prev.filter((p) => p !== person);
  return PROGRESS_REPORT_PEOPLE.filter((p) => p === person || prev.includes(p));
}

function toggleSprintFilter(
  prev: ProgressSprintFilter[],
  key: ProgressSprintFilter,
): ProgressSprintFilter[] {
  if (prev.includes(key)) return prev.filter((k) => k !== key);
  return [...prev, key];
}

function toggleStatusFilter(
  prev: ProgressStatusFilter[],
  status: ProgressStatusFilter,
): ProgressStatusFilter[] {
  if (prev.includes(status)) return prev.filter((s) => s !== status);
  return PROGRESS_STATUS_FILTERS.map((s) => s.id).filter(
    (id) => id === status || prev.includes(id),
  );
}

const SPRINT_FILTER_OPTIONS = listProgressSprintFilterOptions();
const STATUS_ACCENT: Record<ProgressStatusFilter, string> = {
  not_started: "#9ca3af",
  in_progress: "#ca8a04",
  done: "#16a34a",
  fail: "#dc2626",
  blocked: "#ea580c",
};

function formatAuditWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DailyProgressPage() {
  const [from, setFrom] = useState(todayIso);
  const [to, setTo] = useState(todayIso);
  const [draftFrom, setDraftFrom] = useState(todayIso);
  const [draftTo, setDraftTo] = useState(todayIso);
  const [typedDate, setTypedDate] = useState("");
  const [rangeMode, setRangeMode] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<ProgressReportPerson[]>([]);
  const [selectedSprints, setSelectedSprints] = useState<ProgressSprintFilter[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ProgressStatusFilter[]>([]);
  const [sortBy, setSortBy] = useState<ProgressSortBy>("id");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [rawTasks, setRawTasks] = useState<GyshTask[] | null>(null);
  const [rawTests, setRawTests] = useState<TestStatusesPayload | null>(null);
  const [rawTime, setRawTime] = useState<TimeEntry[] | null>(null);
  const [loadedFrom, setLoadedFrom] = useState(todayIso);
  const [loadedTo, setLoadedTo] = useState(todayIso);
  const [audit, setAudit] = useState<DailyProgressAuditEntry[]>([]);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ProgressExportFormat | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const typedId = useId();

  const refreshAudit = async () => {
    try {
      setAuditError(null);
      setAudit(await fetchDailyProgressAudit());
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : "Could not load audit log.");
    }
  };

  useEffect(() => {
    void refreshAudit();
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

  useEffect(() => {
    if (!rawTasks || !rawTests || !rawTime) return;
    setReport(
      buildDailyProgressReport({
        from: loadedFrom,
        to: loadedTo,
        tasks: rawTasks,
        testPayload: rawTests,
        timeEntries: rawTime,
        people: selectedPeople,
        sprints: selectedSprints,
        statuses: selectedStatuses,
        sortBy,
      }),
    );
  }, [
    selectedPeople,
    selectedSprints,
    selectedStatuses,
    sortBy,
    rawTasks,
    rawTests,
    rawTime,
    loadedFrom,
    loadedTo,
  ]);

  const loadReport = async (rangeFrom = from, rangeTo = to) => {
    setLoading(true);
    setError(null);
    try {
      const [tasks, testPayload, timeEntries] = await Promise.all([
        fetchTasks(),
        fetchTestStatuses(),
        fetchTimeEntries({ from: rangeFrom, to: rangeTo }),
      ]);
      setRawTasks(tasks);
      setRawTests(testPayload);
      setRawTime(timeEntries);
      setLoadedFrom(rangeFrom);
      setLoadedTo(rangeTo);
      setReport(
        buildDailyProgressReport({
          from: rangeFrom,
          to: rangeTo,
          tasks,
          testPayload,
          timeEntries,
          people: selectedPeople,
          sprints: selectedSprints,
          statuses: selectedStatuses,
          sortBy,
        }),
      );
    } catch (err) {
      setReport(null);
      setRawTasks(null);
      setRawTests(null);
      setRawTime(null);
      setError(err instanceof Error ? err.message : "Could not load progress report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

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
    const typed = normalizeDueDateInput(typedDate);
    if (typed) {
      const iso = mmddyyToIso(typed);
      if (iso) {
        nextFrom = iso;
        if (!rangeMode) nextTo = iso;
      }
    }
    if (nextTo < nextFrom) {
      const swap = nextFrom;
      nextFrom = nextTo;
      nextTo = swap;
    }
    setFrom(nextFrom);
    setTo(nextTo);
    setPickerOpen(false);
    void loadReport(nextFrom, nextTo);
  };

  const periodLabel = formatRangeLabel(from, to);
  const usersSummary = peopleLabel(selectedPeople);
  const sprintsSummary = formatProgressSprintsLabel(selectedSprints);
  const statusesSummary = formatProgressStatusesLabel(selectedStatuses);
  const sortSummary = formatProgressSortLabel(sortBy);
  const activeSprintIndex = currentSprintIndex();
  const openCountsLabel =
    selectedPeople.length === 0 && selectedSprints.length === 0
      ? "Still open (all)"
      : "Still open (filtered)";
  const exportUsersLabel = usersSummary === "All" ? "All users" : usersSummary;

  const activityDays =
    rawTasks && rawTests && rawTime
      ? collectProgressActivityDays({
          tasks: rawTasks,
          testPayload: rawTests,
          timeEntries: rawTime,
          limit: 21,
        })
      : [];

  const loadDay = (day: string) => {
    setFrom(day);
    setTo(day);
    setRangeMode(false);
    void loadReport(day, day);
  };

  const runExport = async (format: ProgressExportFormat) => {
    if (!report || loading || error) return;
    setExporting(format);
    try {
      const result =
        format === "pdf"
          ? await downloadDailyProgressPdf(report, exportUsersLabel)
          : format === "excel"
            ? await downloadDailyProgressExcel(report, exportUsersLabel)
            : await downloadDailyProgressWord(report, exportUsersLabel);
      await logDailyProgressExport({
        format: result.format,
        report,
        usersFilter: exportUsersLabel,
        snapshotHtml: result.snapshotHtml,
      });
      await refreshAudit();
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : "Export audit failed.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="daily-progress-page">
      <div className="glass daily-progress-page__body" style={{ padding: 24, borderRadius: 16 }}>
        <div className="daily-progress-page__title-row" ref={pickerRef}>
          <h2 className="daily-progress-page__title">
            <FileText size={22} style={{ color: "var(--bronze)" }} aria-hidden="true" />
            Daily Progress Report
          </h2>
          <div className="daily-progress-page__title-actions">
            <button
              type="button"
              className="inline-text-link daily-progress-page__refresh-link"
              onClick={() => void loadReport()}
              disabled={loading}
              aria-busy={loading}
              data-testid="daily-progress-refresh"
            >
              <RefreshCw size={15} aria-hidden="true" />
              {loading ? "Loading…" : "Refresh"}
            </button>
            <span className="daily-progress-page__users-label">Select Date</span>
            <button
              type="button"
              className="daily-progress-report__cal"
              onClick={openPicker}
              aria-expanded={pickerOpen}
              aria-label={`Select Date — choose report date or range (currently ${periodLabel})`}
              title={`Select Date · Period: ${periodLabel}`}
              data-testid="daily-progress-report-calendar"
            >
              <CalendarDays size={16} aria-hidden="true" />
            </button>
            <span className="daily-progress-report__period" aria-live="polite">
              {periodLabel}
            </span>
          </div>
          <div className="daily-progress-page__exports" aria-label="Download report">
            <button
              type="button"
              className="btn btn-outline"
              disabled={!report || loading || Boolean(error) || exporting !== null}
              onClick={() => void runExport("pdf")}
              data-testid="daily-progress-export-pdf"
            >
              <Download size={14} aria-hidden="true" />
              {exporting === "pdf" ? "…" : "PDF"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              disabled={!report || loading || Boolean(error) || exporting !== null}
              onClick={() => void runExport("excel")}
              data-testid="daily-progress-export-excel"
            >
              <FileSpreadsheet size={14} aria-hidden="true" />
              {exporting === "excel" ? "…" : "Excel"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              disabled={!report || loading || Boolean(error) || exporting !== null}
              onClick={() => void runExport("word")}
              data-testid="daily-progress-export-word"
            >
              <FileText size={14} aria-hidden="true" />
              {exporting === "word" ? "…" : "Word"}
            </button>
          </div>

          {pickerOpen && (
            <div
              className="daily-progress-report__picker daily-progress-page__picker"
              role="dialog"
              aria-label="Select report period"
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

              <label className="daily-progress-report__field">
                <span>{rangeMode ? "From" : "Day"}</span>
                <input
                  type="date"
                  value={draftFrom}
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

        <div className="daily-progress-page__toolbar">
          <div
            className="daily-progress-page__users"
            role="group"
            aria-label={`Filter report by users (currently ${usersSummary})`}
            data-testid="daily-progress-report-users"
          >
            <span className="daily-progress-page__users-label">Users</span>
            <div
              className="daily-progress-page__user-bubbles"
              role="listbox"
              aria-multiselectable="true"
              aria-label="Select users for progress report"
            >
              <button
                type="button"
                role="option"
                aria-selected={selectedPeople.length === 0}
                className="qa-tester-bubble"
                data-active={selectedPeople.length === 0 ? "true" : "false"}
                data-testid="daily-progress-users-all"
                onClick={() => setSelectedPeople([])}
              >
                All
              </button>
              {PROGRESS_REPORT_PEOPLE.map((person) => {
                const active = selectedPeople.includes(person);
                const accent = PERSON_ACCENT[person];
                return (
                  <button
                    key={person}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className="qa-tester-bubble"
                    data-active={active ? "true" : "false"}
                    data-testid={`daily-progress-users-${person.toLowerCase()}`}
                    onClick={() => setSelectedPeople((prev) => togglePerson(prev, person))}
                    style={{
                      borderColor: active ? accent : undefined,
                      boxShadow: active ? `0 0 0 1px ${accent}` : undefined,
                    }}
                  >
                    <span className="qa-tester-dot" style={{ background: accent }} />
                    {person}
                  </button>
                );
              })}
            </div>
            <p className="daily-progress-report__users-hint">Multi-select · All = everyone</p>
          </div>

          <div
            className="daily-progress-page__filters"
            role="group"
            aria-label={`Filter report by sprint (currently ${sprintsSummary})`}
            data-testid="daily-progress-report-sprints"
          >
            <span className="daily-progress-page__users-label">Sprint</span>
            <div
              className="daily-progress-page__user-bubbles"
              role="listbox"
              aria-multiselectable="true"
              aria-label="Select sprints for progress report"
            >
              <button
                type="button"
                role="option"
                aria-selected={selectedSprints.length === 0}
                className="qa-tester-bubble"
                data-active={selectedSprints.length === 0 ? "true" : "false"}
                data-testid="daily-progress-sprints-all"
                onClick={() => setSelectedSprints([])}
              >
                All
              </button>
              {SPRINT_FILTER_OPTIONS.map((opt) => {
                const active = selectedSprints.includes(opt.key);
                const isCurrent = opt.key === activeSprintIndex;
                return (
                  <button
                    key={String(opt.key)}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className="qa-tester-bubble"
                    data-active={active ? "true" : "false"}
                    data-testid={`daily-progress-sprints-${opt.key}`}
                    title={isCurrent ? `${opt.label} · current` : opt.label}
                    onClick={() =>
                      setSelectedSprints((prev) => toggleSprintFilter(prev, opt.key))
                    }
                    style={
                      active && isCurrent
                        ? { borderColor: "#2e7d32", boxShadow: "0 0 0 1px #2e7d32" }
                        : undefined
                    }
                  >
                    {opt.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="daily-progress-page__filters"
            role="group"
            aria-label={`Filter report by status (currently ${statusesSummary})`}
            data-testid="daily-progress-report-statuses"
          >
            <span className="daily-progress-page__users-label">Status</span>
            <div
              className="daily-progress-page__user-bubbles"
              role="listbox"
              aria-multiselectable="true"
              aria-label="Select statuses for progress report"
            >
              <button
                type="button"
                role="option"
                aria-selected={selectedStatuses.length === 0}
                className="qa-tester-bubble"
                data-active={selectedStatuses.length === 0 ? "true" : "false"}
                data-testid="daily-progress-statuses-all"
                onClick={() => setSelectedStatuses([])}
              >
                All
              </button>
              {PROGRESS_STATUS_FILTERS.map((opt) => {
                const active = selectedStatuses.includes(opt.id);
                const accent = STATUS_ACCENT[opt.id];
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className="qa-tester-bubble"
                    data-active={active ? "true" : "false"}
                    data-testid={`daily-progress-statuses-${opt.id}`}
                    onClick={() =>
                      setSelectedStatuses((prev) => toggleStatusFilter(prev, opt.id))
                    }
                    style={{
                      borderColor: active ? accent : undefined,
                      boxShadow: active ? `0 0 0 1px ${accent}` : undefined,
                    }}
                  >
                    <span className="qa-tester-dot" style={{ background: accent }} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="daily-progress-page__filters"
            role="group"
            aria-label={`Sort report (currently ${sortSummary})`}
            data-testid="daily-progress-report-sort"
          >
            <span className="daily-progress-page__users-label">Sort</span>
            <div
              className="daily-progress-page__user-bubbles"
              role="listbox"
              aria-label="Sort progress report lists"
            >
              {PROGRESS_SORT_OPTIONS.map((opt) => {
                const active = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className="qa-tester-bubble"
                    data-active={active ? "true" : "false"}
                    data-testid={`daily-progress-sort-${opt.id}`}
                    onClick={() => setSortBy(opt.id)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {activityDays.length > 0 && (
          <div
            className="daily-progress-page__history"
            aria-label="Previous days with activity"
            data-testid="daily-progress-history-days"
          >
            <span className="daily-progress-page__users-label">Previous days</span>
            <div className="daily-progress-page__user-bubbles">
              {activityDays.map((day) => {
                const active = from === day && to === day;
                return (
                  <button
                    key={day}
                    type="button"
                    className="qa-tester-bubble"
                    data-active={active ? "true" : "false"}
                    data-testid={`daily-progress-history-${day}`}
                    onClick={() => loadDay(day)}
                    title={`Load report for ${formatRangeLabel(day, day)}`}
                  >
                    {formatRangeLabel(day, day)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {loading && <p className="daily-progress-report__muted">Loading…</p>}
        {error && <p className="daily-progress-report__error">{error}</p>}

        {!loading && !error && report && (
          <>
            <div className="daily-progress-page__meta">
              <h3 style={{ margin: 0, color: "var(--bronze)", fontSize: "1.15rem" }}>
                {report.label}
                {" · "}
                {exportUsersLabel}
              </h3>
              <p className="daily-progress-page__view-label">{report.viewLabel}</p>
            </div>

            <div className="daily-progress-report__summary">
              <div>
                <strong>Tasks touched</strong>
                <span>{report.tasks.length}</span>
                <ul>
                  {report.taskBuckets.map((b) => (
                    <li key={b.status}>
                      {b.label}: {b.count}
                    </li>
                  ))}
                  {report.taskBuckets.length === 0 && <li>None in this period</li>}
                </ul>
              </div>
              <div>
                <strong>Tests touched</strong>
                <span>{report.tests.length}</span>
                <ul>
                  {report.testBuckets.map((b) => (
                    <li key={b.status}>
                      {b.label}: {b.count}
                    </li>
                  ))}
                  {report.testBuckets.length === 0 && <li>None in this period</li>}
                </ul>
              </div>
              <div>
                <strong>Timesheet</strong>
                <span>{report.timeLabel}</span>
                <ul>
                  {report.timeByPerson.map((p) => (
                    <li key={p.name}>
                      {p.name}: {p.label}
                    </li>
                  ))}
                  {report.timeByPerson.length === 0 && <li>No logged time</li>}
                </ul>
              </div>
              <div>
                <strong>{openCountsLabel}</strong>
                <ul>
                  <li>
                    Tasks — in progress {report.openTasks.inProgress}, blocked{" "}
                    {report.openTasks.blocked}, not started {report.openTasks.notStarted}
                  </li>
                  <li>
                    Tests — in progress {report.openTests.inProgress}, blocked{" "}
                    {report.openTests.blocked}, fail {report.openTests.fail}
                  </li>
                </ul>
              </div>
            </div>

            {report.tasks.length > 0 && (
              <section className="daily-progress-report__section">
                <h4>Task activity</h4>
                <ul>
                  {report.tasks.map((t) => (
                    <li key={t.id}>
                      <span className="flat-label flat-label--id">{t.id}</span>
                      <span className="daily-progress-report__line-title">{t.title}</span>
                      <span className="daily-progress-report__line-meta">{t.sprintLabel}</span>
                      <span className="daily-progress-report__line-meta">{t.statusLabel}</span>
                      <span className="daily-progress-report__line-meta">{t.assignee}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {report.tests.length > 0 && (
              <section className="daily-progress-report__section">
                <h4>Test activity</h4>
                <ul>
                  {report.tests.map((t) => (
                    <li key={t.id}>
                      <span className="flat-label flat-label--id">{t.id}</span>
                      <span className="daily-progress-report__line-title">{t.title}</span>
                      <span className="daily-progress-report__line-meta">{t.sprintLabel}</span>
                      <span className="daily-progress-report__line-meta">{t.statusLabel}</span>
                      <span className="daily-progress-report__line-meta">{t.assignee}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {report.tasks.length === 0 && report.tests.length === 0 && (
              <p className="daily-progress-report__muted">
                No task or test updates recorded for this period
                {selectedPeople.length > 0 ||
                selectedSprints.length > 0 ||
                selectedStatuses.length > 0
                  ? " for the selected filters"
                  : ""}
                . Open counts and timesheet above still reflect current state / logged time.
              </p>
            )}
          </>
        )}

        <section className="daily-progress-page__audit" aria-label="Export audit log">
          <div className="daily-progress-page__audit-head">
            <h3>Audit log</h3>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => void refreshAudit()}
              data-testid="daily-progress-audit-refresh"
            >
              Refresh log
            </button>
          </div>
          {auditError && <p className="daily-progress-report__error">{auditError}</p>}
          {audit.length === 0 && !auditError ? (
            <p className="daily-progress-report__muted" style={{ marginTop: 8 }}>
              No exports yet. PDF, Excel, and Word downloads are recorded here with a link to the
              exact report snapshot.
            </p>
          ) : (
            <ul className="daily-progress-page__audit-list">
              {audit.map((entry) => (
                <li key={entry.id} className="daily-progress-page__audit-row">
                  <div className="daily-progress-page__audit-main">
                    <strong>{formatAuditWhen(entry.createdAt)}</strong>
                    <span className="daily-progress-page__audit-format">{entry.format.toUpperCase()}</span>
                    <span>
                      {entry.periodLabel} · {entry.usersFilter}
                    </span>
                    <span className="daily-progress-page__audit-who">
                      {entry.createdByName || entry.createdByEmail || "Unknown"}
                    </span>
                  </div>
                  <a
                    href={entry.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="daily-progress-page__audit-link"
                    data-testid={`daily-progress-audit-link-${entry.id}`}
                  >
                    Open report
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
