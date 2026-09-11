/** My Dashboard → Ways to Earn: Share a win (2 per calendar month). */

export const SHARE_WIN_MONTHLY_CAP = 2;
const SHARE_WIN_STORAGE_KEY = "gysh_share_wins_v1";

export type ShareWinEntry = {
  at: string;
  text: string;
};

export function calendarMonthKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function shareWinsInMonth(
  entries: readonly ShareWinEntry[],
  now: Date = new Date(),
): ShareWinEntry[] {
  const prefix = calendarMonthKey(now);
  return entries.filter((entry) => String(entry.at || "").startsWith(prefix));
}

export function remainingShareWinsThisMonth(
  entries: readonly ShareWinEntry[],
  now: Date = new Date(),
  cap = SHARE_WIN_MONTHLY_CAP,
): number {
  return Math.max(0, cap - shareWinsInMonth(entries, now).length);
}

export function readShareWins(): ShareWinEntry[] {
  try {
    const raw = localStorage.getItem(SHARE_WIN_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ShareWinEntry[]) : [];
    return Array.isArray(parsed) ? parsed.filter((row) => row && typeof row.text === "string") : [];
  } catch {
    return [];
  }
}

export function recordShareWin(text: string, now: Date = new Date()): ShareWinEntry[] {
  const clean = String(text || "").trim().slice(0, 500);
  const current = readShareWins();
  if (!clean) return current;
  if (remainingShareWinsThisMonth(current, now) <= 0) return current;
  const next = [...current, { at: now.toISOString(), text: clean }];
  try {
    localStorage.setItem(SHARE_WIN_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}
