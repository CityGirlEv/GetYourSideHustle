/**
 * Payment report date ranges (America/Chicago calendar days).
 */

export type PaymentPeriodPreset =
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "custom";

export const PAYMENT_PERIOD_PRESETS: Array<{ id: PaymentPeriodPreset; label: string }> = [
  { id: "day", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "quarter", label: "This quarter" },
  { id: "year", label: "This year" },
  { id: "custom", label: "Custom dates" },
];

const TZ = "America/Chicago";

/** YYYY-MM-DD in America/Chicago. */
export function chicagoYmd(ref: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ref);
}

function parseYmd(ymd: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || "").trim());
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

/** Add calendar days to a YYYY-MM-DD. */
export function addDaysYmd(ymd: string, days: number): string {
  const p = parseYmd(ymd);
  if (!p) return ymd;
  const dt = new Date(Date.UTC(p.y, p.m - 1, p.d + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

/** Monday (ISO) of the week containing ymd. */
export function startOfWeekYmd(ymd: string): string {
  const p = parseYmd(ymd);
  if (!p) return ymd;
  const dt = new Date(Date.UTC(p.y, p.m - 1, p.d));
  const dow = dt.getUTCDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  return addDaysYmd(ymd, offset);
}

export function startOfMonthYmd(ymd: string): string {
  const p = parseYmd(ymd);
  if (!p) return ymd;
  return `${p.y}-${String(p.m).padStart(2, "0")}-01`;
}

export function startOfQuarterYmd(ymd: string): string {
  const p = parseYmd(ymd);
  if (!p) return ymd;
  const qStart = Math.floor((p.m - 1) / 3) * 3 + 1;
  return `${p.y}-${String(qStart).padStart(2, "0")}-01`;
}

export function startOfYearYmd(ymd: string): string {
  const p = parseYmd(ymd);
  if (!p) return ymd;
  return `${p.y}-01-01`;
}

export function endOfMonthYmd(ymd: string): string {
  const p = parseYmd(ymd);
  if (!p) return ymd;
  const last = new Date(Date.UTC(p.y, p.m, 0)).getUTCDate();
  return `${p.y}-${String(p.m).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
}

export function endOfQuarterYmd(ymd: string): string {
  const p = parseYmd(ymd);
  if (!p) return ymd;
  const qEndMonth = Math.floor((p.m - 1) / 3) * 3 + 3;
  const last = new Date(Date.UTC(p.y, qEndMonth, 0)).getUTCDate();
  return `${p.y}-${String(qEndMonth).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
}

export function endOfYearYmd(ymd: string): string {
  const p = parseYmd(ymd);
  if (!p) return ymd;
  return `${p.y}-12-31`;
}

export type PaymentPeriodRange = {
  preset: PaymentPeriodPreset;
  from: string;
  to: string;
  label: string;
};

export function resolvePaymentPeriodRange(
  preset: PaymentPeriodPreset,
  opts?: { from?: string; to?: string; now?: Date },
): PaymentPeriodRange {
  const today = chicagoYmd(opts?.now ?? new Date());
  if (preset === "custom") {
    const fromRaw = parseYmd(opts?.from || "") ? String(opts!.from).trim() : today;
    const toRaw = parseYmd(opts?.to || "") ? String(opts!.to).trim() : fromRaw;
    const [from, to] = fromRaw <= toRaw ? [fromRaw, toRaw] : [toRaw, fromRaw];
    return { preset, from, to, label: from === to ? from : `${from} → ${to}` };
  }
  if (preset === "day") {
    return { preset, from: today, to: today, label: `Today (${today})` };
  }
  if (preset === "week") {
    const from = startOfWeekYmd(today);
    const to = addDaysYmd(from, 6);
    return { preset, from, to, label: `This week (${from} → ${to})` };
  }
  if (preset === "month") {
    const from = startOfMonthYmd(today);
    const to = endOfMonthYmd(today);
    return { preset, from, to, label: `This month (${from} → ${to})` };
  }
  if (preset === "quarter") {
    const from = startOfQuarterYmd(today);
    const to = endOfQuarterYmd(today);
    return { preset, from, to, label: `This quarter (${from} → ${to})` };
  }
  const from = startOfYearYmd(today);
  const to = endOfYearYmd(today);
  return { preset, from, to, label: `This year (${from} → ${to})` };
}

function tzOffsetMs(timeZone: string, date: Date): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const bag: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") bag[part.type] = part.value;
  }
  const asUtc = Date.UTC(
    Number(bag.year),
    Number(bag.month) - 1,
    Number(bag.day),
    Number(bag.hour),
    Number(bag.minute),
    Number(bag.second),
  );
  return asUtc - date.getTime();
}

/** Local wall time in America/Chicago → UTC Date. */
export function chicagoWallTimeToUtc(
  ymd: string,
  hour: number,
  minute: number,
  second: number,
): Date {
  const guess = new Date(
    `${ymd}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}Z`,
  );
  const offset = tzOffsetMs(TZ, guess);
  return new Date(guess.getTime() - offset);
}

/** Inclusive Chicago-day bounds as unix seconds for Stripe `created` filters. */
export function ymdRangeToUnixInclusive(
  fromYmd: string,
  toYmd: string,
): { gte: number; lte: number } {
  const start = chicagoWallTimeToUtc(fromYmd, 0, 0, 0);
  const end = chicagoWallTimeToUtc(toYmd, 23, 59, 59);
  return {
    gte: Math.floor(start.getTime() / 1000),
    lte: Math.floor(end.getTime() / 1000),
  };
}
