/** Client helpers for partner work timers + timesheet weeks (ending Friday). */

import { api } from "./api";

export type TimeSource = "task" | "test";
export type TimeEntryStatus = "running" | "paused" | "stopped";

export type TimeEntry = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  source: TimeSource;
  sourceId: string;
  sourceLabel: string;
  status: TimeEntryStatus;
  startedAt: string;
  endedAt: string | null;
  accumulatedMs: number;
  runningSince: string | null;
  workDate: string;
  elapsedMs: number;
  createdAt: string;
  updatedAt: string;
};

export type TimeEntryUser = { id: string; email: string; name: string };

/** Friday that ends the week containing `date` (local calendar). */
export function weekEndingFriday(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 Sun … 5 Fri 6 Sat
  const add = (5 - day + 7) % 7;
  d.setDate(d.getDate() + add);
  return toIsoDate(d);
}

/** Saturday that starts the week ending on the given Friday (YYYY-MM-DD). */
export function weekStartingSaturday(weekEndingFri: string): string {
  const fri = parseIsoDate(weekEndingFri);
  fri.setDate(fri.getDate() - 6);
  return toIsoDate(fri);
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** List of week-ending Fridays (most recent first). */
export function recentWeekEndings(count = 12): string[] {
  const out: string[] = [];
  let fri = parseIsoDate(weekEndingFriday());
  for (let i = 0; i < count; i++) {
    out.push(toIsoDate(fri));
    fri = new Date(fri);
    fri.setDate(fri.getDate() - 7);
  }
  return out;
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDurationHours(ms: number): string {
  const hours = ms / 3_600_000;
  return `${hours.toFixed(2)}h`;
}

/** Live elapsed from a server DTO, using client clock for the running segment. */
export function liveElapsedMs(entry: TimeEntry, nowMs = Date.now()): number {
  let ms = entry.accumulatedMs || 0;
  if (entry.status === "running" && entry.runningSince) {
    const start = Date.parse(entry.runningSince);
    if (!Number.isNaN(start)) ms += Math.max(0, nowMs - start);
  }
  if (entry.status === "stopped") return entry.elapsedMs || entry.accumulatedMs || ms;
  return ms;
}

export async function fetchActiveTimeEntries(): Promise<TimeEntry[]> {
  const data = await api<{ entries: TimeEntry[] }>("time-entries?active=1");
  return data.entries ?? [];
}

export async function fetchTimeEntries(opts: {
  userId?: string;
  from: string;
  to: string;
}): Promise<TimeEntry[]> {
  const q = new URLSearchParams();
  q.set("from", opts.from);
  q.set("to", opts.to);
  if (opts.userId) q.set("userId", opts.userId);
  const data = await api<{ entries: TimeEntry[] }>(`time-entries?${q.toString()}`);
  return data.entries ?? [];
}

export async function fetchTimeEntryUsers(): Promise<TimeEntryUser[]> {
  const data = await api<{ users: TimeEntryUser[] }>("time-entries/users");
  return data.users ?? [];
}

export async function startTimeEntry(input: {
  source: TimeSource;
  sourceId: string;
  sourceLabel: string;
}): Promise<TimeEntry> {
  const data = await api<{ entry: TimeEntry }>("time-entries/start", {
    method: "POST",
    body: input,
  });
  return data.entry;
}

/** Start or resume a work timer; returns null on failure (offline / unauthorized). */
export async function ensureWorkTimerStarted(input: {
  source: TimeSource;
  sourceId: string;
  sourceLabel: string;
}): Promise<TimeEntry | null> {
  try {
    return await startTimeEntry(input);
  } catch {
    return null;
  }
}

export async function pauseTimeEntry(input?: {
  id?: string;
  source?: TimeSource;
  sourceId?: string;
}): Promise<TimeEntry> {
  const data = await api<{ entry: TimeEntry }>("time-entries/pause", {
    method: "POST",
    body: input ?? {},
  });
  return data.entry;
}

export async function endTimeEntry(input?: {
  id?: string;
  source?: TimeSource;
  sourceId?: string;
}): Promise<TimeEntry> {
  const data = await api<{ entry: TimeEntry }>("time-entries/end", {
    method: "POST",
    body: input ?? {},
  });
  return data.entry;
}

/** Stop timer for a source after a status change (ignores 404). */
export async function stopTimerOnStatusChange(
  source: TimeSource,
  sourceId: string,
): Promise<void> {
  try {
    await endTimeEntry({ source, sourceId });
  } catch {
    /* no open timer */
  }
}

export type DayBucket = {
  date: string;
  entries: TimeEntry[];
  totalMs: number;
};

export function bucketByDay(entries: TimeEntry[]): DayBucket[] {
  const map = new Map<string, TimeEntry[]>();
  for (const e of entries) {
    const list = map.get(e.workDate) ?? [];
    list.push(e);
    map.set(e.workDate, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, list]) => ({
      date,
      entries: list,
      totalMs: list.reduce((sum, e) => sum + liveElapsedMs(e), 0),
    }));
}

/** Sat→Fri day list for a week ending Friday (for empty-day rows). */
export function daysInWeekEndingFriday(weekEndingFri: string): string[] {
  const start = parseIsoDate(weekStartingSaturday(weekEndingFri));
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(toIsoDate(d));
  }
  return days;
}
