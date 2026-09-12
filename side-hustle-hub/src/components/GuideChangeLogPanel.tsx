import { useEffect, useState } from "react";
import { fetchGuideChangeLog } from "../lib/guide-catalog-client";
import {
  formatGuideChangeLogSummary,
  formatGuideChangeLogWhen,
  type GuideChangeLogEntry,
} from "../lib/guide-change-log";

/**
 * Admin / QA — audit trail for a Side Hustle Library guide
 * (status, content, assignee, soft-delete, QA pass, …).
 */
export function GuideChangeLogPanel({
  guideId,
  refreshKey = 0,
}: {
  guideId: string;
  /** Bump after a save so history reloads. */
  refreshKey?: number;
}) {
  const [entries, setEntries] = useState<GuideChangeLogEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError(null);
    void (async () => {
      try {
        const rows = await fetchGuideChangeLog(guideId, 40);
        if (!cancelled) setEntries(rows);
      } catch (e) {
        if (!cancelled) {
          setEntries([]);
          setError(e instanceof Error ? e.message : "Could not load change history.");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [guideId, refreshKey]);

  return (
    <section
      className="guide-change-log"
      data-testid={`guide-change-log-${guideId}`}
    >
      <button
        type="button"
        className="guide-change-log__toggle"
        aria-expanded={open}
        data-testid={`guide-change-log-toggle-${guideId}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{open ? "▾" : "▸"} Audit trail</span>
        <span className="guide-change-log__count">
          {busy ? "Loading…" : `${entries.length} change${entries.length === 1 ? "" : "s"}`}
        </span>
      </button>
      {open ? (
        <div className="guide-change-log__body">
          {error ? (
            <p className="guide-change-log__error" role="alert">
              {error}
            </p>
          ) : null}
          {!busy && !error && entries.length === 0 ? (
            <p className="guide-change-log__empty">No catalog changes recorded yet.</p>
          ) : null}
          {entries.length > 0 ? (
            <ol className="guide-change-log__list">
              {entries.map((entry) => (
                <li
                  key={`${entry.id}-${entry.changedAt}`}
                  className="guide-change-log__item"
                  data-testid={`guide-change-log-entry-${entry.id}`}
                >
                  <div className="guide-change-log__summary">
                    {formatGuideChangeLogSummary(entry)}
                  </div>
                  <div className="guide-change-log__meta">
                    {entry.changedBy.trim() || "Unknown"}
                    {entry.changedAt
                      ? ` · ${formatGuideChangeLogWhen(entry.changedAt)}`
                      : ""}
                  </div>
                  {entry.detail?.note?.trim() ? (
                    <p className="guide-change-log__note">{entry.detail.note.trim()}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
