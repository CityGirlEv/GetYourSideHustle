import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  ClipboardCopy,
  Download,
  ExternalLink,
  FileWarning,
  FlaskConical,
  Play,
  Trash2,
  Undo2,
  Wrench,
} from "lucide-react";
import { BusyOverlay, WaitIndicator } from "../WaitFeedback";
import { healCursorNoteAuthor } from "../../lib/gysh-note-entries";
import {
  fetchTestStatuses,
  saveTestStatusesBatch,
  STATUS_LABELS,
  type TestStatusesPayload,
} from "../../lib/gysh-test-plan";
import {
  buildFailureReportSnapshot,
  buildPostFixReport,
  copyTextToClipboard,
  createArchivedFailureReport,
  deleteArchivedReport,
  downloadTextFile,
  failureReportToMarkdown,
  migrateLegacySnapshotIntoArchive,
  parseProposedFixSteps,
  planApproveFixesForTester,
  CURSOR_NOTE_AUTHOR,
  planExecuteFixesFromMarkdown,
  planExecuteFixesFromReport,
  planFailureReportRollback,
  postFixReportToMarkdown,
  rollbackReportToMarkdown,
  stampFilename,
  updateArchivedReport,
  type ApproveFixesItem,
  type FailureReportCaseRow,
  type PostFixOutcome,
  type StoredQaReport,
} from "../../lib/gysh-failure-report";
import { navigateAdminDeepLink } from "../../lib/admin-deep-links";
import {
  downloadFailureReportPdf,
  downloadPostFixReportPdf,
  openFailureReportPdf,
  openPostFixReportPdf,
} from "../../lib/gysh-failure-report-pdf";

type FailureReportPageProps = {
  onBack?: () => void;
  /** Open a catalog case in Testing Portal (preferred over URL-only deep link). */
  onOpenTest?: (testId: string) => void;
};

type ViewMode = "failure" | "postfix";

function CaseCard({
  row,
  onOpenTest,
}: {
  row: FailureReportCaseRow;
  onOpenTest?: (testId: string) => void;
}) {
  const openInPortal = () => {
    if (onOpenTest) {
      onOpenTest(row.id);
      return;
    }
    navigateAdminDeepLink({ tab: "testing", testId: row.id });
  };

  return (
    <article className="failure-report-case" data-testid={`failure-report-case-${row.id}`}>
      <header className="failure-report-case__head">
        <button
          type="button"
          className="failure-report-case__id-link"
          onClick={openInPortal}
          title={`Open ${row.id} in Testing Portal`}
          data-testid={`failure-report-open-test-${row.id}`}
        >
          <strong className="failure-report-case__id">{row.id}</strong>
          <ExternalLink size={14} aria-hidden />
          <span className="failure-report-case__open-label">Testing Portal</span>
        </button>
        <span className={`failure-report-case__status failure-report-case__status--${row.status}`}>
          {row.statusLabel}
        </span>
        <span className="failure-report-case__priority">{row.priority}</span>
      </header>
      <h3 className="failure-report-case__title">{row.title}</h3>
      <dl className="failure-report-case__meta">
        <div>
          <dt>Area / path</dt>
          <dd>
            {row.area}
            {row.path ? ` · ${row.path}` : ""}
          </dd>
        </div>
        <div>
          <dt>Suite / facing / category</dt>
          <dd>
            {row.suite} · {row.facing} · {row.category}
          </dd>
        </div>
        <div>
          <dt>Assignee</dt>
          <dd>
            {row.assignees}
            {row.originalAssignee ? ` (original: ${row.originalAssignee})` : ""}
          </dd>
        </div>
        <div>
          <dt>Sprint / due</dt>
          <dd>
            {row.sprint}
            {row.dueDate ? ` · due ${row.dueDate}` : ""}
          </dd>
        </div>
        {row.failedStepIndex != null ? (
          <div>
            <dt>Failed step</dt>
            <dd>#{row.failedStepIndex + 1}</dd>
          </div>
        ) : null}
        {row.relatedTaskIds?.length ? (
          <div>
            <dt>Related tasks</dt>
            <dd>{row.relatedTaskIds.join(", ")}</dd>
          </div>
        ) : null}
        {row.sourceFile ? (
          <div>
            <dt>Source file</dt>
            <dd>
              <code>{row.sourceFile}</code>
            </dd>
          </div>
        ) : null}
      </dl>
      <div className="failure-report-case__block">
        <h4>Tester notes</h4>
        {(row.noteEntries ?? []).length === 0 ? (
          <pre className="failure-report-case__notes">(none)</pre>
        ) : (
          <ul className="failure-report-case__note-list">
            {(row.noteEntries ?? []).map((e, i) => (
              <li key={`${row.id}-note-${i}`}>
                <div className="failure-report-case__note-meta">
                  {healCursorNoteAuthor({ author: e.author || "tester", text: e.text }).author} ·{" "}
                  {e.updatedAt || e.createdAt || "—"}
                </div>
                <pre className="failure-report-case__notes">{e.text.trim() || "(empty)"}</pre>
              </li>
            ))}
          </ul>
        )}
      </div>
      {(row.attachments ?? []).length > 0 ? (
        <div className="failure-report-case__block">
          <h4>Attachments / evidence</h4>
          <ul>
            {(row.attachments ?? []).map((a) => (
              <li key={a.id}>
                {a.name}{" "}
                <span className="failure-report-case__mime">
                  ({a.mimeType}
                  {a.size ? ` · ${Math.round(a.size / 1024)} KB` : ""}
                  {a.addedBy ? ` · by ${a.addedBy}` : ""}
                  {a.addedAt ? ` · ${a.addedAt}` : ""})
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="failure-report-case__block">
          <h4>Attachments / evidence</h4>
          <p>(none)</p>
        </div>
      )}
      {row.failureDetail ? (
        <div className="failure-report-case__block">
          <h4>Failure detail</h4>
          <pre>{row.failureDetail}</pre>
        </div>
      ) : null}
      <div className="failure-report-case__block">
        <h4>Steps</h4>
        <ol>
          {(row.steps ?? []).map((step, i) => (
            <li key={`${row.id}-step-${i}`}>
              {(row.checkedSteps ?? [])[i] ? "☑ " : "☐ "}
              {step}
            </li>
          ))}
        </ol>
      </div>
      <div className="failure-report-case__block">
        <h4>Expected</h4>
        <p>{row.expected || "—"}</p>
      </div>
      {(row.updatedAt || row.updatedBy) && (
        <p className="failure-report-case__foot">
          Updated {row.updatedAt || "—"} by {row.updatedBy || "—"}
        </p>
      )}
    </article>
  );
}

function Section({
  title,
  rows,
  testId,
  onOpenTest,
}: {
  title: string;
  rows: FailureReportCaseRow[];
  testId: string;
  onOpenTest?: (testId: string) => void;
}) {
  return (
    <section className="failure-report-section" data-testid={testId}>
      <h2>
        {title} <span className="failure-report-section__count">({rows.length})</span>
      </h2>
      {rows.length === 0 ? (
        <p className="failure-report-empty">None.</p>
      ) : (
        <div className="failure-report-section__list">
          {rows.map((row) => (
            <CaseCard key={row.id} row={row} onOpenTest={onOpenTest} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProposedFixSticker({
  steps,
  note,
}: {
  steps?: string[] | null;
  note?: string;
}) {
  const resolved = (steps?.length ?? 0) > 0 ? steps! : parseProposedFixSteps(note || "");
  const plainNote = String(note || "")
    .replace(/\[Proposed Fix\][\s\S]*?\[\/Proposed Fix\]/gi, "")
    .trim();
  if (resolved.length === 0 && !plainNote) return null;
  return (
    <aside className="proposed-fix-sticker" data-testid="proposed-fix-sticker">
      <div className="proposed-fix-sticker__badge">Proposed Fix</div>
      {resolved.length > 0 ? (
        <>
          <p className="proposed-fix-sticker__lead">Steps taken to fix:</p>
          <ol className="proposed-fix-sticker__steps">
            {resolved.map((s, i) => (
              <li key={`pf-${i}`}>{s}</li>
            ))}
          </ol>
        </>
      ) : null}
      {plainNote ? (
        <div className="proposed-fix-sticker__body">
          <p className="proposed-fix-sticker__lead">Full fix note</p>
          <pre className="proposed-fix-sticker__note">{plainNote}</pre>
        </div>
      ) : null}
    </aside>
  );
}

function PostFixFixedCard({
  item,
  prior,
  canApprove,
  busy,
  onApprove,
  onOpenTest,
}: {
  item: PostFixOutcome;
  prior: FailureReportCaseRow | null;
  canApprove: boolean;
  busy: boolean;
  onApprove: () => void;
  onOpenTest?: (testId: string) => void;
}) {
  return (
    <article className="failure-report-postfix__card" data-testid={`postfix-fixed-${item.id}`}>
      <header className="failure-report-postfix__card-head">
        <button
          type="button"
          className="failure-report-case__id-link"
          onClick={() => {
            if (onOpenTest) onOpenTest(item.id);
            else navigateAdminDeepLink({ tab: "testing", testId: item.id });
          }}
          title={`Open ${item.id} in Testing Portal`}
        >
          <code>{item.id}</code>
          <ExternalLink size={14} aria-hidden />
          <span className="failure-report-case__open-label">Testing Portal</span>
        </button>
        <span>
          {STATUS_LABELS[item.priorStatus]} → {STATUS_LABELS[item.currentStatus]}
        </span>
        <button
          type="button"
          className="btn btn-primary failure-report-postfix__approve-one"
          onClick={onApprove}
          disabled={busy || !canApprove}
          title={
            canApprove
              ? "Approve → Fixed/Re-Test and assign back to original tester"
              : "Already approved or not ready for Fixed/Re-Test"
          }
          data-testid={`failure-report-approve-${item.id}`}
        >
          <BadgeCheck size={14} aria-hidden /> Approve
        </button>
      </header>
      <h3 className="failure-report-postfix__card-title">{item.title}</h3>
      <ProposedFixSticker steps={item.proposedFixSteps} note={item.note} />
      {prior ? (
        <div className="failure-report-postfix__prior" data-testid={`postfix-prior-${item.id}`}>
          <p className="failure-report-postfix__prior-label">From Failure Report</p>
          <CaseCard row={prior} onOpenTest={onOpenTest} />
        </div>
      ) : null}
    </article>
  );
}

export function FailureReportPage({ onBack, onOpenTest }: FailureReportPageProps) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [payload, setPayload] = useState<TestStatusesPayload | null>(null);
  const [archive, setArchive] = useState<StoredQaReport[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("failure");
  const mdFileRef = useRef<HTMLInputElement | null>(null);

  const active = useMemo(
    () => archive.find((r) => r.id === activeId) ?? archive[0] ?? null,
    [archive, activeId],
  );

  // Keep selection id in sync when falling back to the newest report.
  useEffect(() => {
    if (!active) return;
    if (activeId !== active.id) setActiveId(active.id);
  }, [active, activeId]);

  const report = active?.failure ?? null;
  const postFix = active?.postFix ?? null;

  const refreshLive = useCallback(async () => {
    const data = await fetchTestStatuses();
    setPayload(data);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchTestStatuses();
        if (cancelled) return;
        setPayload(data);
        const archived = migrateLegacySnapshotIntoArchive();
        setArchive(archived);
        if (archived[0]) setActiveId(archived[0].id);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load test statuses.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openCount = useMemo(
    () => (report ? report.summary.failed + report.summary.conditional : 0),
    [report],
  );

  const rollbackCandidates = useMemo(() => {
    if (!report || !payload) return [];
    return planFailureReportRollback(report, payload);
  }, [report, payload, postFix]);

  const approveCandidates = useMemo(() => {
    if (!report || !payload) return [];
    return planApproveFixesForTester(report, payload);
  }, [report, payload, postFix]);

  const priorById = useMemo(() => {
    const map = new Map<string, FailureReportCaseRow>();
    if (!report) return map;
    for (const row of [...report.failed, ...report.conditional, ...report.approved]) {
      map.set(row.id, row);
    }
    return map;
  }, [report]);

  const onRunNewReport = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await refreshLive();
      const failure = buildFailureReportSnapshot(data);
      const entry = createArchivedFailureReport(failure, null);
      setArchive((prev) => [entry, ...prev.filter((r) => r.id !== entry.id)]);
      setActiveId(entry.id);
      setView("failure");
      setFlash(`New report created — ${entry.label}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not run report.");
    } finally {
      setBusy(false);
    }
  };

  const onDeleteReport = () => {
    if (!active) return;
    const ok = window.confirm(
      `Delete report from ${active.label}?\n\nThis only removes the saved report history in this browser — it does not change test statuses.`,
    );
    if (!ok) return;
    const next = deleteArchivedReport(active.id);
    setArchive(next);
    setActiveId(next[0]?.id ?? null);
    setView("failure");
    setFlash(next.length ? `Deleted. Showing ${next[0].label}.` : "Report deleted. Archive is empty.");
  };

  const onDownloadMd = () => {
    if (!report) return;
    downloadTextFile(failureReportToMarkdown(report), stampFilename("GYSH_Failure_Report"));
    setFlash("Failure report .md downloaded.");
  };

  const onOpenPdf = async () => {
    if (!report) return;
    setBusy(true);
    try {
      if (view === "postfix" && postFix) {
        await openPostFixReportPdf(postFix);
        setFlash("Post-Fix Report PDF opened.");
      } else {
        await openFailureReportPdf(report);
        setFlash("Failure Report PDF opened.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open PDF.");
    } finally {
      setBusy(false);
    }
  };

  const onDownloadPdf = async () => {
    if (!report) return;
    setBusy(true);
    try {
      const name =
        view === "postfix" && postFix
          ? await downloadPostFixReportPdf(postFix)
          : await downloadFailureReportPdf(report);
      setFlash(`Downloaded ${name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not download PDF.");
    } finally {
      setBusy(false);
    }
  };

  const onExecuteFixes = async (mdText?: string) => {
    if (!active || !report) return;
    const open = report.summary.failed + report.summary.conditional;
    if (open === 0) {
      setFlash("Nothing to execute — this report has no Failed or Conditional items.");
      return;
    }
    const sourceLabel = mdText?.trim() ? "imported markdown" : "this Failure Report";
    const ok = window.confirm(
      `Execute Fixes from ${sourceLabel}?\n\n` +
        `Open items on report: ${open}\n\n` +
        `Only cases with a real code fix become Fixed/Cursor (notes authored as Cursor). ` +
        `Everything else stays Fail/Conditional with a Cursor note explaining why.` +
        (mdText?.trim() ? " MD Fixed lists still require a matching code fix." : "") +
        `\nThen the Post-Fix Report will open for Approve / Approve All.`,
    );
    if (!ok) return;

    setBusy(true);
    setError("");
    try {
      const live = payload ?? (await refreshLive());
      const plan = mdText?.trim()
        ? planExecuteFixesFromMarkdown(report, live, mdText)
        : planExecuteFixesFromReport(report, live);

      const batch = [
        ...plan.fixed.map((it) => ({
          caseId: it.caseId,
          status: it.toStatus,
          note: it.note,
          noteAuthor: CURSOR_NOTE_AUTHOR,
          assignee: it.assignee,
          sprint: it.sprint,
          dueDate: it.dueDate,
          checkedSteps: Array.from({ length: it.stepCount }, () => false),
          failedStepIndex: null as number | null,
          stepCount: it.stepCount,
        })),
        ...plan.unfixed.map((it) => ({
          caseId: it.caseId,
          status: it.toStatus,
          note: it.note,
          noteAuthor: CURSOR_NOTE_AUTHOR,
          assignee: it.assignee,
          sprint: it.sprint,
          dueDate: it.dueDate,
          checkedSteps: Array.from({ length: it.stepCount }, () => false),
          failedStepIndex: null as number | null,
          stepCount: it.stepCount,
        })),
      ];

      const data = batch.length > 0 ? await saveTestStatusesBatch(batch) : await refreshLive();
      setPayload(data);
      const pf = buildPostFixReport(report, data);
      const updated = updateArchivedReport(active.id, { postFix: pf });
      if (updated) {
        setArchive((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      }
      setView("postfix");
      setFlash(
        `Execute Fixes (${plan.source}): ${plan.fixed.length} Fixed/Cursor · ${plan.unfixed.length} could not fix · ` +
          `Post-Fix shows ${pf.fixed.length} fixed / ${pf.unfixed.length} open. Approve individually or Approve All.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Execute Fixes failed.");
    } finally {
      setBusy(false);
    }
  };

  const onImportMdForExecute = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      await onExecuteFixes(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read markdown file.");
    } finally {
      if (mdFileRef.current) mdFileRef.current.value = "";
    }
  };

  const onGeneratePostFix = async () => {
    if (!active || !report) return;
    setBusy(true);
    setError("");
    try {
      const data = await refreshLive();
      const pf = buildPostFixReport(report, data);
      const updated = updateArchivedReport(active.id, { postFix: pf });
      if (updated) {
        setArchive((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      }
      setView("postfix");
      setFlash(
        `Post-fix for ${active.label}: ${pf.fixed.length} fixed · ${pf.unfixed.length} open · ${pf.regressed.length} regressed.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not build post-fix report.");
    } finally {
      setBusy(false);
    }
  };

  const applyApprovals = async (items: ApproveFixesItem[], label: string) => {
    if (!active || !report || items.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const data = await saveTestStatusesBatch(
        items.map((it) => ({
          caseId: it.caseId,
          status: it.toStatus,
          note: it.note,
          assignee: it.testerId,
          sprint: it.sprint,
          dueDate: it.dueDate,
          checkedSteps: Array.from({ length: it.stepCount }, () => false),
          failedStepIndex: null,
          stepCount: it.stepCount,
        })),
      );
      setPayload(data);
      const pf = buildPostFixReport(report, data);
      const updated = updateArchivedReport(active.id, { postFix: pf });
      if (updated) {
        setArchive((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      }
      setView("postfix");
      setFlash(`${label}: ${items.length} → Fixed/Re-Test + assigned to tester(s).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve fixes failed.");
    } finally {
      setBusy(false);
    }
  };

  const onApproveAll = async () => {
    if (!active || !report) return;
    const items = approveCandidates;
    if (items.length === 0) {
      setFlash("Nothing to approve — no fixed items ready to assign back to a tester.");
      return;
    }
    const preview = items
      .slice(0, 12)
      .map((it) => `• ${it.caseId} → Fixed/Re-Test · ${it.testerLabel}`)
      .join("\n");
    const extra = items.length > 12 ? `\n…and ${items.length - 12} more` : "";
    const ok = window.confirm(
      `Approve All — ${items.length} fix(es) back to original tester?\n\n${preview}${extra}`,
    );
    if (!ok) return;
    await applyApprovals(items, "Approved all");
  };

  const onApproveOne = async (caseId: string) => {
    if (!active || !report || !payload) return;
    const items = planApproveFixesForTester(report, payload, [caseId]);
    if (items.length === 0) {
      setFlash(
        `Cannot approve ${caseId} — needs Fixed/Cursor (or Pass) plus an original tester assignee.`,
      );
      return;
    }
    const it = items[0]!;
    const ok = window.confirm(
      `Approve ${it.caseId}?\n\n→ Fixed/Re-Test · assigned to ${it.testerLabel}`,
    );
    if (!ok) return;
    await applyApprovals(items, `Approved ${caseId}`);
  };

  const onRollbackFixes = async () => {
    if (!active || !report) return;
    setBusy(true);
    setError("");
    try {
      const live = await refreshLive();
      const items = planFailureReportRollback(report, live);
      if (items.length === 0) {
        setFlash("Nothing to roll back — statuses already match this report.");
        return;
      }
      const preview = items
        .slice(0, 12)
        .map(
          (it) =>
            `• ${it.caseId}: ${STATUS_LABELS[it.fromStatus]} → ${STATUS_LABELS[it.toStatus]}`,
        )
        .join("\n");
      const extra = items.length > 12 ? `\n…and ${items.length - 12} more` : "";
      const ok = window.confirm(
        `Roll back ${items.length} status(es) using report ${active.label}?\n\n${preview}${extra}`,
      );
      if (!ok) return;

      const data = await saveTestStatusesBatch(
        items.map((it) => ({
          caseId: it.caseId,
          status: it.toStatus,
          note: it.note,
          assignee: it.assignee,
          sprint: it.sprint,
          dueDate: it.dueDate,
          checkedSteps: it.checkedSteps,
          failedStepIndex: it.failedStepIndex,
          stepCount: it.stepCount,
        })),
      );
      setPayload(data);
      const pf = buildPostFixReport(report, data);
      const updated = updateArchivedReport(active.id, { postFix: pf });
      if (updated) {
        setArchive((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      }
      downloadTextFile(rollbackReportToMarkdown(items), stampFilename("GYSH_Fix_Rollback"));
      setFlash(`Rolled back ${items.length} case(s) from report ${active.label}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rollback failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass failure-report" data-testid="failure-report-page">
      <BusyOverlay active={busy || loading} message={loading ? "Loading…" : "Working…"} />

      <div className="failure-report__hero">
        <div className="failure-report__hero-top">
          {onBack ? (
            <button type="button" className="failure-report__back" onClick={onBack} data-testid="failure-report-back">
              <ArrowLeft size={16} aria-hidden /> Back to Testing Portal
            </button>
          ) : null}
          <h1 className="failure-report__title">
            <FileWarning size={22} aria-hidden /> Failure Report
          </h1>
          <p className="failure-report__lede">
            Each <strong>Run report</strong> creates a dated tab kept in this browser. Re-run makes a{" "}
            <em>new</em> report (history is kept). Select a tab to view, open/download PDF, execute
            fixes, generate post-fix, approve, roll back, or delete.
          </p>
        </div>

        <div className="failure-report__archive-bar">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void onRunNewReport()}
            disabled={busy}
            data-testid="failure-report-run-new"
          >
            <Play size={16} aria-hidden /> Run report
          </button>
          {active ? (
            <button
              type="button"
              className="btn btn-secondary failure-report__delete-btn"
              onClick={onDeleteReport}
              disabled={busy}
              data-testid="failure-report-delete"
            >
              <Trash2 size={16} aria-hidden /> Delete this report
            </button>
          ) : null}
          <span className="failure-report__archive-count">
            {archive.length === 0
              ? "No saved reports yet"
              : `${archive.length} saved report${archive.length === 1 ? "" : "s"}`}
          </span>
        </div>

        {archive.length > 0 ? (
          <div className="failure-report__history" data-testid="failure-report-history">
            <p className="failure-report__history-label">Previous reports</p>
            <div
              className="failure-report__tabs failure-report__tabs--archive"
              role="tablist"
              aria-label="Saved reports by date"
              data-testid="failure-report-archive-tabs"
            >
              {archive.map((r) => {
                const selected = active?.id === r.id;
                return (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  className={`failure-report__tab${selected ? " is-active" : ""}`}
                  onClick={() => {
                    setActiveId(r.id);
                    setView(r.postFix ? view : "failure");
                  }}
                  title={`Report ${r.label} · Failed ${r.failure.summary.failed} · Conditional ${r.failure.summary.conditional}`}
                  data-testid={`failure-report-tab-${r.id}`}
                >
                  <span className="failure-report__tab-date">{r.label}</span>
                  <span className="failure-report__tab-meta">
                    {r.failure.summary.failed + r.failure.summary.conditional} open
                    {r.postFix ? ` · ${r.postFix.fixed.length} fixed` : ""}
                  </span>
                </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {active ? (
          <>
            <div className="failure-report__selected-banner" data-testid="failure-report-selected">
              <strong>See report:</strong> {active.label}
              <span>
                Failed {report?.summary.failed ?? 0} · Conditional {report?.summary.conditional ?? 0}
                {postFix
                  ? ` · Post-fix: ${postFix.fixed.length} fixed / ${postFix.unfixed.length} open`
                  : ""}
              </span>
            </div>

            <div className="failure-report__tabs" role="tablist" aria-label="Report sections">
              <button
                type="button"
                role="tab"
                aria-selected={view === "failure"}
                className={`failure-report__tab${view === "failure" ? " is-active" : ""}`}
                onClick={() => setView("failure")}
              >
                View Failure Report
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === "postfix"}
                className={`failure-report__tab${view === "postfix" ? " is-active" : ""}`}
                onClick={() => setView("postfix")}
                disabled={!postFix}
              >
                View Post-Fix Report
                {postFix ? ` (${postFix.fixed.length} fixed)` : ""}
              </button>
            </div>

            <div className="failure-report__actions" data-testid="failure-report-actions">
              <button type="button" className="btn btn-secondary" onClick={onDownloadMd} disabled={busy || !report}>
                <Download size={16} aria-hidden /> Download .md
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void onOpenPdf()}
                disabled={busy || !report || (view === "postfix" && !postFix)}
                data-testid="failure-report-open-pdf"
              >
                <ExternalLink size={16} aria-hidden /> Open PDF
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void onDownloadPdf()}
                disabled={busy || !report || (view === "postfix" && !postFix)}
                data-testid="failure-report-download-pdf"
              >
                <Download size={16} aria-hidden /> Download PDF
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void onExecuteFixes()}
                disabled={busy || !report || openCount === 0}
                data-testid="failure-report-execute-fixes"
              >
                <Wrench size={16} aria-hidden /> Execute Fixes
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => mdFileRef.current?.click()}
                disabled={busy || !report || openCount === 0}
                data-testid="failure-report-execute-md"
                title="Import a Post-Fix / Cursor markdown and execute Fixed vs Could not fix lists"
              >
                Execute from MD…
              </button>
              <input
                ref={mdFileRef}
                type="file"
                accept=".md,text/markdown,text/plain"
                className="failure-report__file-input"
                onChange={(e) => void onImportMdForExecute(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void onGeneratePostFix()}
                disabled={busy || !report}
                data-testid="failure-report-post-fix"
              >
                <FlaskConical size={16} aria-hidden /> Generate Post-Fix
              </button>
              {postFix ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => void copyTextToClipboard(postFixReportToMarkdown(postFix)).then((ok) =>
                    setFlash(ok ? "Post-fix copied." : "Copy failed."),
                  )}
                  disabled={busy}
                >
                  <ClipboardCopy size={16} aria-hidden /> Copy post-fix
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void onApproveAll()}
                disabled={busy || approveCandidates.length === 0}
                data-testid="failure-report-approve-fixes"
              >
                <BadgeCheck size={16} aria-hidden /> Approve All
                {approveCandidates.length > 0 ? ` (${approveCandidates.length})` : ""}
              </button>
              <button
                type="button"
                className="btn btn-secondary failure-report__rollback-btn"
                onClick={() => void onRollbackFixes()}
                disabled={busy || !report}
                data-testid="failure-report-rollback"
              >
                <Undo2 size={16} aria-hidden /> Roll back
                {rollbackCandidates.length > 0 ? ` (${rollbackCandidates.length})` : ""}
              </button>
            </div>
          </>
        ) : null}

        {error ? <p className="failure-report__error">{error}</p> : null}
        {flash ? <p className="failure-report__flash">{flash}</p> : null}
        {loading ? <WaitIndicator message="Loading…" /> : null}
      </div>

      {active && view === "failure" && report ? (
        <>
          <Section title="1. Failed tests" rows={report.failed} testId="failure-report-failed" onOpenTest={onOpenTest} />
          <Section
            title="2. Conditionally approved"
            rows={report.conditional}
            testId="failure-report-conditional"
            onOpenTest={onOpenTest}
          />
          <Section
            title="3. Approved tests (Pass)"
            rows={report.approved}
            testId="failure-report-approved"
            onOpenTest={onOpenTest}
          />
        </>
      ) : null}

      {active && view === "postfix" && postFix ? (
        <section className="failure-report-section failure-report-postfix" data-testid="failure-report-postfix-preview">
          <div className="failure-report-postfix__title-row">
            <h2>Post-Fix Report — {active.label}</h2>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void onApproveAll()}
              disabled={busy || approveCandidates.length === 0}
              data-testid="failure-report-approve-all-inline"
            >
              <BadgeCheck size={16} aria-hidden /> Approve All
              {approveCandidates.length > 0 ? ` (${approveCandidates.length})` : ""}
            </button>
          </div>
          <div className="failure-report__summary failure-report__summary--postfix">
            <span>
              Fixed <strong>{postFix.fixed.length}</strong>
            </span>
            <span>
              Still open <strong>{postFix.unfixed.length}</strong>
            </span>
            <span>
              Regressed <strong>{postFix.regressed.length}</strong>
            </span>
            <span>
              Ready to approve <strong>{approveCandidates.length}</strong>
            </span>
          </div>
          {postFix.fixed.length > 0 ? (
            <div className="failure-report-postfix__group">
              <h3>Fixed ({postFix.fixed.length})</h3>
              <div className="failure-report-postfix__cards">
                {postFix.fixed.map((f) => (
                  <PostFixFixedCard
                    key={`fx-${f.id}`}
                    item={f}
                    prior={priorById.get(f.id) ?? null}
                    canApprove={approveCandidates.some((c) => c.caseId === f.id)}
                    busy={busy}
                    onApprove={() => void onApproveOne(f.id)}
                    onOpenTest={onOpenTest}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="failure-report-empty">No fixed items yet.</p>
          )}
          {postFix.unfixed.length > 0 ? (
            <div className="failure-report-postfix__group">
              <h3>Still open ({postFix.unfixed.length})</h3>
              <div className="failure-report-postfix__cards">
                {postFix.unfixed.map((f) => {
                  const prior = priorById.get(f.id) ?? null;
                  return (
                    <article
                      key={`uf-${f.id}`}
                      className="failure-report-postfix__card"
                      data-testid={`postfix-unfixed-${f.id}`}
                    >
                      <header className="failure-report-postfix__card-head">
                        <button
                          type="button"
                          className="failure-report-case__id-link"
                          onClick={() => {
                            if (onOpenTest) onOpenTest(f.id);
                            else navigateAdminDeepLink({ tab: "testing", testId: f.id });
                          }}
                          title={`Open ${f.id} in Testing Portal`}
                        >
                          <code>{f.id}</code>
                          <ExternalLink size={14} aria-hidden />
                          <span className="failure-report-case__open-label">Testing Portal</span>
                        </button>
                        <span>
                          {STATUS_LABELS[f.priorStatus]} → {STATUS_LABELS[f.currentStatus]}
                        </span>
                      </header>
                      <h3 className="failure-report-postfix__card-title">{f.title}</h3>
                      <pre className="proposed-fix-sticker__note">{f.note}</pre>
                      {prior ? (
                        <div className="failure-report-postfix__prior">
                          <p className="failure-report-postfix__prior-label">From Failure Report</p>
                          <CaseCard row={prior} onOpenTest={onOpenTest} />
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
          {postFix.regressed.length > 0 ? (
            <div className="failure-report-postfix__group">
              <h3>Regressed ({postFix.regressed.length})</h3>
              <ul>
                {postFix.regressed.map((f) => (
                  <li key={`rg-${f.id}`}>
                    <code>{f.id}</code> — {STATUS_LABELS[f.currentStatus]}: {f.note}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {!loading && archive.length === 0 ? (
        <p className="failure-report-empty" style={{ padding: "0 4px 24px" }}>
          No reports yet. Click <strong>Run report</strong> to create the first dated Failure Report.
        </p>
      ) : null}
    </div>
  );
}
