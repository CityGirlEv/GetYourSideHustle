import { useEffect, useState } from "react";
import { Pause, Play, Square, Timer } from "lucide-react";
import {
  endTimeEntry,
  formatDuration,
  liveElapsedMs,
  pauseTimeEntry,
  startTimeEntry,
  type TimeEntry,
  type TimeSource,
} from "../../lib/gysh-time-entries";
import { ApiError } from "../../lib/api";

type WorkTimerProps = {
  source: TimeSource;
  sourceId: string;
  sourceLabel: string;
  /** Active entry for this source (from parent refresh), if any */
  entry?: TimeEntry | null;
  onChanged?: (entry: TimeEntry | null) => void;
  compact?: boolean;
  disabled?: boolean;
};

export function WorkTimer({
  source,
  sourceId,
  sourceLabel,
  entry = null,
  onChanged,
  compact = false,
  disabled = false,
}: WorkTimerProps) {
  const [local, setLocal] = useState<TimeEntry | null>(entry);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLocal(entry ?? null);
  }, [entry?.id, entry?.status, entry?.accumulatedMs, entry?.runningSince, entry?.updatedAt]);

  useEffect(() => {
    if (local?.status !== "running") return;
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [local?.status, local?.id]);

  void tick;

  const elapsed = local ? liveElapsedMs(local) : 0;
  const running = local?.status === "running";
  const paused = local?.status === "paused";

  const apply = (next: TimeEntry | null) => {
    setLocal(next);
    onChanged?.(next);
  };

  const run = async (fn: () => Promise<TimeEntry>) => {
    setBusy(true);
    setError("");
    try {
      apply(await fn());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Timer failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`work-timer${compact ? " work-timer--compact" : ""}${running ? " is-running" : ""}${paused ? " is-paused" : ""}`}
      data-testid={`work-timer-${source}-${sourceId}`}
    >
      <div className="work-timer__display" title={sourceLabel}>
        <Timer size={14} aria-hidden />
        <span className="work-timer__clock">{formatDuration(elapsed)}</span>
        {running && <span className="work-timer__badge">Running</span>}
        {paused && <span className="work-timer__badge work-timer__badge--paused">Paused</span>}
      </div>
      <div className="work-timer__actions">
        {!running && (
          <button
            type="button"
            className="btn btn-primary work-timer__btn"
            disabled={disabled || busy}
            onClick={() =>
              void run(() => startTimeEntry({ source, sourceId, sourceLabel }))
            }
            title={paused ? "Resume timer" : "Start timer"}
          >
            <Play size={14} /> {paused ? "Resume" : "Start"}
          </button>
        )}
        {running && (
          <button
            type="button"
            className="btn btn-outline work-timer__btn"
            disabled={disabled || busy}
            onClick={() => void run(() => pauseTimeEntry({ source, sourceId }))}
            title="Pause timer"
          >
            <Pause size={14} /> Pause
          </button>
        )}
        {(running || paused) && (
          <button
            type="button"
            className="btn btn-outline work-timer__btn"
            disabled={disabled || busy}
            onClick={() => void run(() => endTimeEntry({ source, sourceId }))}
            title="End timer"
          >
            <Square size={14} /> End
          </button>
        )}
      </div>
      {error && <div className="work-timer__error">{error}</div>}
    </div>
  );
}
