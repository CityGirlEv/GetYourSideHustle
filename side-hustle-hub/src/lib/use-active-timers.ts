import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchActiveTimeEntries,
  type TimeEntry,
  type TimeSource,
} from "./gysh-time-entries";

/** Polls / refreshes the current user's open timers (running + paused). */
export function useActiveTimers(enabled = true) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const inflight = useRef(false);

  const refresh = useCallback(async () => {
    if (!enabled || inflight.current) return;
    inflight.current = true;
    try {
      setEntries(await fetchActiveTimeEntries());
    } catch {
      /* ignore offline / transient D1 */
    } finally {
      inflight.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
    if (!enabled) return;
    const id = window.setInterval(() => void refresh(), 30_000);
    return () => window.clearInterval(id);
  }, [enabled, refresh]);

  const entryFor = (source: TimeSource, sourceId: string): TimeEntry | null =>
    entries.find((e) => e.source === source && e.sourceId === sourceId) ?? null;

  const onChanged = (_entry: TimeEntry | null) => {
    void refresh();
  };

  return { entries, entryFor, refresh, onChanged };
}
