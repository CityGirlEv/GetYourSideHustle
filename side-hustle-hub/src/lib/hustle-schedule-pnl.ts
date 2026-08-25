/**
 * Schedule Suite Profit & Loss — dated sales/expense line items with
 * daily / weekly / monthly rollups. Unlocks with Pro+ Schedule Suite.
 */

export type PnLLineKind = "sale" | "expense";

export type PnLExpenseCategory =
  | "admin"
  | "overhead"
  | "advertising"
  | "supplies"
  | "travel"
  | "contractors"
  | "software"
  | "other";

export const PNL_EXPENSE_CATEGORIES: {
  id: PnLExpenseCategory;
  label: string;
}[] = [
  { id: "admin", label: "Admin" },
  { id: "overhead", label: "Overhead" },
  { id: "advertising", label: "Advertising" },
  { id: "supplies", label: "Supplies" },
  { id: "travel", label: "Travel" },
  { id: "contractors", label: "Contractors" },
  { id: "software", label: "Software" },
  { id: "other", label: "Other" },
];

export type SchedulePnLLine = {
  id: string;
  kind: PnLLineKind;
  /** YYYY-MM-DD */
  date: string;
  label: string;
  amountUsd: number;
  /** Required for expenses; null for sales. */
  category: PnLExpenseCategory | null;
};

export type SchedulePnLLedger = {
  lines: SchedulePnLLine[];
};

export type PnLRollupPeriod = "day" | "week" | "month";

export type PnLRollupBucket = {
  key: string;
  label: string;
  salesUsd: number;
  expensesUsd: number;
  profitUsd: number;
  byCategory: Partial<Record<PnLExpenseCategory, number>>;
  lineCount: number;
};

function parseYmd(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const d = new Date(`${ymd}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function weekStartMonday(ref: Date): string {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function emptyPnLLedger(): SchedulePnLLedger {
  return { lines: [] };
}

export function pnlExpenseCategoryLabel(id: PnLExpenseCategory | null | undefined): string {
  if (!id) return "—";
  return PNL_EXPENSE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function newPnLLineId(ref: Date = new Date()): string {
  return `pnl_${ref.getTime().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function money(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.round(v * 100) / 100);
}

export function normalizeExpenseCategory(raw: unknown): PnLExpenseCategory {
  const v = String(raw || "")
    .trim()
    .toLowerCase();
  if (PNL_EXPENSE_CATEGORIES.some((c) => c.id === v)) return v as PnLExpenseCategory;
  return "other";
}

export function normalizePnLLine(raw: unknown): SchedulePnLLine | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const kind = o.kind === "expense" ? "expense" : o.kind === "sale" ? "sale" : null;
  if (!kind) return null;
  const date =
    typeof o.date === "string" && parseYmd(o.date) ? o.date : new Date().toISOString().slice(0, 10);
  return {
    id: typeof o.id === "string" && o.id ? o.id : newPnLLineId(),
    kind,
    date,
    label: typeof o.label === "string" ? o.label : "",
    amountUsd: money(o.amountUsd),
    category: kind === "expense" ? normalizeExpenseCategory(o.category) : null,
  };
}

export function normalizePnLLedger(raw: unknown): SchedulePnLLedger {
  if (!raw || typeof raw !== "object") return emptyPnLLedger();
  const o = raw as Record<string, unknown>;
  const lines = Array.isArray(o.lines)
    ? o.lines.map(normalizePnLLine).filter((l): l is SchedulePnLLine => Boolean(l))
    : [];
  return { lines };
}

export function sumPnLSales(lines: SchedulePnLLine[]): number {
  return money(lines.filter((l) => l.kind === "sale").reduce((s, l) => s + l.amountUsd, 0));
}

export function sumPnLExpenses(lines: SchedulePnLLine[]): number {
  return money(lines.filter((l) => l.kind === "expense").reduce((s, l) => s + l.amountUsd, 0));
}

export function pnlProfitUsd(lines: SchedulePnLLine[]): number {
  return Math.round((sumPnLSales(lines) - sumPnLExpenses(lines)) * 100) / 100;
}

export function upsertPnLLine(
  ledger: SchedulePnLLedger,
  line: SchedulePnLLine,
): SchedulePnLLedger {
  const normalized: SchedulePnLLine = {
    ...line,
    amountUsd: money(line.amountUsd),
    category: line.kind === "expense" ? normalizeExpenseCategory(line.category) : null,
    label: line.label.trim(),
  };
  const others = ledger.lines.filter((l) => l.id !== normalized.id);
  return { lines: [...others, normalized].sort(comparePnLLines) };
}

export function removePnLLine(ledger: SchedulePnLLedger, lineId: string): SchedulePnLLedger {
  return { lines: ledger.lines.filter((l) => l.id !== lineId) };
}

function comparePnLLines(a: SchedulePnLLine, b: SchedulePnLLine): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.id < b.id ? 1 : -1;
}

function monthKey(ymd: string): string {
  return ymd.slice(0, 7);
}

function bucketKeyForLine(line: SchedulePnLLine, period: PnLRollupPeriod): string {
  if (period === "day") return line.date;
  if (period === "month") return monthKey(line.date);
  const d = parseYmd(line.date) ?? new Date(`${line.date}T12:00:00`);
  return weekStartMonday(d);
}

function bucketLabel(key: string, period: PnLRollupPeriod): string {
  if (period === "day") return key;
  if (period === "month") {
    const [y, m] = key.split("-");
    const d = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
    return d.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  }
  return `Week of ${key}`;
}

export function filterPnLLinesForPeriod(
  lines: SchedulePnLLine[],
  period: PnLRollupPeriod,
  focusYmd: string,
): SchedulePnLLine[] {
  const focus = focusYmd && parseYmd(focusYmd) ? focusYmd : new Date().toISOString().slice(0, 10);
  const focusKey =
    period === "day"
      ? focus
      : period === "month"
        ? monthKey(focus)
        : weekStartMonday(parseYmd(focus) ?? new Date(`${focus}T12:00:00`));
  return lines.filter((l) => bucketKeyForLine(l, period) === focusKey);
}

export function rollupPnLByPeriod(
  lines: SchedulePnLLine[],
  period: PnLRollupPeriod,
): PnLRollupBucket[] {
  const map = new Map<string, PnLRollupBucket>();
  for (const line of lines) {
    const key = bucketKeyForLine(line, period);
    let bucket = map.get(key);
    if (!bucket) {
      bucket = {
        key,
        label: bucketLabel(key, period),
        salesUsd: 0,
        expensesUsd: 0,
        profitUsd: 0,
        byCategory: {},
        lineCount: 0,
      };
      map.set(key, bucket);
    }
    bucket.lineCount += 1;
    if (line.kind === "sale") {
      bucket.salesUsd = money(bucket.salesUsd + line.amountUsd);
    } else {
      bucket.expensesUsd = money(bucket.expensesUsd + line.amountUsd);
      const cat = line.category ?? "other";
      bucket.byCategory[cat] = money((bucket.byCategory[cat] ?? 0) + line.amountUsd);
    }
    bucket.profitUsd = Math.round((bucket.salesUsd - bucket.expensesUsd) * 100) / 100;
  }
  return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1));
}

export function summarizePnLLines(lines: SchedulePnLLine[]): {
  salesUsd: number;
  expensesUsd: number;
  profitUsd: number;
  byCategory: Partial<Record<PnLExpenseCategory, number>>;
} {
  const byCategory: Partial<Record<PnLExpenseCategory, number>> = {};
  for (const line of lines) {
    if (line.kind !== "expense") continue;
    const cat = line.category ?? "other";
    byCategory[cat] = money((byCategory[cat] ?? 0) + line.amountUsd);
  }
  const salesUsd = sumPnLSales(lines);
  const expensesUsd = sumPnLExpenses(lines);
  return {
    salesUsd,
    expensesUsd,
    profitUsd: Math.round((salesUsd - expensesUsd) * 100) / 100,
    byCategory,
  };
}

/** Keep blueprint sprint short — target ≤ 10 calendar days. */
export const BLUEPRINT_MAX_DAYS = 10;

export function blueprintWindowStats(
  weekStart: string,
  dueDate: string,
): {
  start: string;
  end: string;
  days: number;
  weeks: number;
  withinTenDays: boolean;
} {
  const start = parseYmd(weekStart) ? weekStart : new Date().toISOString().slice(0, 10);
  const end = parseYmd(dueDate) ? dueDate : start;
  const a = parseYmd(start)!;
  const b = parseYmd(end)!;
  const ms = Math.abs(b.getTime() - a.getTime());
  const days = Math.max(1, Math.round(ms / 86400000) + 1);
  const weeks = Math.max(1, Math.ceil(days / 7));
  return {
    start: start <= end ? start : end,
    end: start <= end ? end : start,
    days,
    weeks,
    withinTenDays: days <= BLUEPRINT_MAX_DAYS,
  };
}

/** Weekly outcomes for the blueprint window (empty weeks included when span ≤ 10 days). */
export function weeklyOutcomesForBlueprint(
  lines: SchedulePnLLine[],
  weekStart: string,
  dueDate: string,
): PnLRollupBucket[] {
  const win = blueprintWindowStats(weekStart, dueDate);
  const rollups = rollupPnLByPeriod(lines, "week");
  const byKey = new Map(rollups.map((r) => [r.key, r]));
  const startMon = weekStartMonday(parseYmd(win.start) ?? new Date());
  const out: PnLRollupBucket[] = [];
  let cursor = parseYmd(startMon)!;
  const end = parseYmd(win.end)!;
  let guard = 0;
  while (cursor <= end && guard < 6) {
    const key = weekStartMonday(cursor);
    const existing = byKey.get(key);
    out.push(
      existing ?? {
        key,
        label: `Week of ${key}`,
        salesUsd: 0,
        expensesUsd: 0,
        profitUsd: 0,
        byCategory: {},
        lineCount: 0,
      },
    );
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 7);
    guard += 1;
  }
  return out;
}
