/**
 * Schedule Suite reminder emails — cron scan of hustle_schedule member_progress.
 */
import type { Env } from "./auth";
import { emailConfigured, sendScheduleReminderEmail } from "./email";

type ScheduleBlock = {
  id: string;
  dayLabel: string;
  focus: string;
  done?: boolean;
  status?: string;
  hoursLogged?: number;
  dueDate?: string;
};

type SchedulePlan = {
  id: string;
  ownerLabel?: string;
  hustleLabel?: string;
  dueDate?: string;
  weekStart?: string;
  blocks?: ScheduleBlock[];
  reminderCadence?: string;
  emailReminders?: boolean;
};

type ScheduleStore = {
  schedules?: SchedulePlan[];
};

function normalizeCadence(raw: unknown, emailReminders?: unknown): string {
  const v = String(raw || "").toLowerCase();
  if (v === "daily" || v === "weekly" || v === "biweekly" || v === "monthly") return v;
  if (v === "bi-weekly" || v === "bi_weekly") return "biweekly";
  if (emailReminders) return "weekly";
  return "none";
}

function isoWeekKey(ref: Date): string {
  const dailyKey = ref.toISOString().slice(0, 10);
  const d = new Date(`${dailyKey}T12:00:00Z`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function periodKeyFor(cadence: string, ref: Date): string | null {
  if (cadence === "none") return null;
  const dailyKey = ref.toISOString().slice(0, 10);
  if (cadence === "daily") return dailyKey;
  if (cadence === "monthly") return dailyKey.slice(0, 7);
  const weekKey = isoWeekKey(ref);
  if (cadence === "weekly") return weekKey;
  const m = /^(\d{4})-W(\d{2})$/.exec(weekKey);
  if (!m) return weekKey;
  return `${m[1]}-F${String(Math.ceil(Number(m[2]) / 2)).padStart(2, "0")}`;
}

function shouldSendToday(cadence: string, ref: Date): boolean {
  if (cadence === "none") return false;
  if (cadence === "daily") return true;
  const utcDay = new Date(`${ref.toISOString().slice(0, 10)}T12:00:00Z`).getUTCDay();
  if (cadence === "weekly") return utcDay === 1;
  if (cadence === "biweekly") {
    if (utcDay !== 1) return false;
    const m = /^(\d{4})-W(\d{2})$/.exec(isoWeekKey(ref));
    return m ? Number(m[2]) % 2 === 1 : false;
  }
  if (cadence === "monthly") return ref.toISOString().slice(8, 10) === "01";
  return false;
}

async function ensureReminderSendTable(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS schedule_reminder_sends (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      schedule_id TEXT NOT NULL,
      cadence TEXT NOT NULL,
      period_key TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'sent',
      created_at TEXT NOT NULL,
      UNIQUE(user_id, schedule_id, cadence, period_key)
    )`,
  ).run();
}

async function kidCreditBalance(env: Env, userId: string): Promise<number> {
  try {
    const row = await env.DB.prepare(
      `SELECT balance FROM member_credit_wallets WHERE user_id = ?`,
    )
      .bind(userId)
      .first<{ balance: number }>();
    return Number(row?.balance ?? 0) || 0;
  } catch {
    return 0;
  }
}

function parseStore(payload: string | null | undefined): ScheduleStore {
  if (!payload) return { schedules: [] };
  try {
    const o = JSON.parse(payload) as ScheduleStore;
    return o && typeof o === "object" ? o : { schedules: [] };
  } catch {
    return { schedules: [] };
  }
}

/**
 * Scan hustle_schedule progress rows and send due reminder emails
 * (daily / weekly / bi-weekly / monthly) with plan + Kid Credits.
 */
export async function sendDueScheduleReminders(env: Env): Promise<{ sent: number }> {
  if (!emailConfigured(env)) return { sent: 0 };
  await ensureReminderSendTable(env);

  const now = new Date();
  const iso = now.toISOString();

  const { results } = await env.DB.prepare(
    `SELECT mp.user_id, mp.payload, u.email, u.name, u.membership_tier
     FROM member_progress mp
     INNER JOIN users u ON u.id = mp.user_id
     WHERE mp.kind = 'hustle_schedule'
       AND u.status = 'active'
       AND LOWER(COALESCE(u.membership_tier, 'free')) IN ('pro', 'elite')`,
  ).all<{
    user_id: string;
    payload: string;
    email: string;
    name: string;
    membership_tier: string;
  }>();

  let sent = 0;
  for (const row of results ?? []) {
    const store = parseStore(row.payload);
    const schedules = Array.isArray(store.schedules) ? store.schedules : [];
    if (schedules.length === 0) continue;

    const credits = await kidCreditBalance(env, row.user_id);

    for (const plan of schedules) {
      const cadence = normalizeCadence(plan.reminderCadence, plan.emailReminders);
      if (!shouldSendToday(cadence, now)) continue;
      const periodKey = periodKeyFor(cadence, now);
      if (!periodKey || !plan.id) continue;

      const already = await env.DB.prepare(
        `SELECT id FROM schedule_reminder_sends
         WHERE user_id = ? AND schedule_id = ? AND cadence = ? AND period_key = ?`,
      )
        .bind(row.user_id, plan.id, cadence, periodKey)
        .first<{ id: string }>();
      if (already) continue;

      try {
        await sendScheduleReminderEmail(env, {
          to: row.email,
          memberName: row.name || "there",
          cadence: cadence as "daily" | "weekly" | "biweekly" | "monthly",
          periodKey,
          plan: {
            id: plan.id,
            ownerLabel: plan.ownerLabel || "Me",
            hustleLabel: plan.hustleLabel || "Side hustle",
            dueDate: plan.dueDate || "",
            weekStart: plan.weekStart || "",
            blocks: (plan.blocks ?? []).map((b) => ({
              dayLabel: b.dayLabel || b.id,
              focus: b.focus || "",
              done: Boolean(b.done) || String(b.status ?? "").toLowerCase() === "done",
              status: String(b.status ?? (b.done ? "done" : "not_started")),
              hoursLogged: Number(b.hoursLogged) || 0,
              dueDate: b.dueDate || "",
            })),
          },
          kidCredits: credits,
          membershipTier: row.membership_tier || "pro",
        });
        await env.DB.prepare(
          `INSERT INTO schedule_reminder_sends
           (id, user_id, schedule_id, cadence, period_key, status, created_at)
           VALUES (?, ?, ?, ?, ?, 'sent', ?)`,
        )
          .bind(`srs-${crypto.randomUUID()}`, row.user_id, plan.id, cadence, periodKey, iso)
          .run();
        sent += 1;
      } catch {
        /* continue other plans */
      }
    }
  }
  return { sent };
}

/** Admin list of all hustle_schedule stores (Pro+ members + any with data). */
export async function listAllHustleSchedules(env: Env): Promise<Response> {
  const { json, error } = await import("./crypto");
  try {
    const { results } = await env.DB.prepare(
      `SELECT mp.user_id, mp.payload, mp.updated_at, u.email, u.name, u.membership_tier
       FROM member_progress mp
       INNER JOIN users u ON u.id = mp.user_id
       WHERE mp.kind = 'hustle_schedule'
       ORDER BY mp.updated_at DESC`,
    ).all<{
      user_id: string;
      payload: string;
      updated_at: string;
      email: string;
      name: string;
      membership_tier: string;
    }>();

    const rows = (results ?? []).map((r) => {
      const store = parseStore(r.payload);
      const schedules = Array.isArray(store.schedules) ? store.schedules : [];
      return {
        userId: r.user_id,
        email: r.email,
        name: r.name,
        membershipTier: (r.membership_tier || "free").toLowerCase(),
        updatedAt: r.updated_at,
        scheduleCount: schedules.length,
        schedules: schedules.map((s) => ({
          id: s.id,
          ownerLabel: s.ownerLabel || "Me",
          hustleLabel: s.hustleLabel || "",
          dueDate: s.dueDate || "",
          weekStart: s.weekStart || "",
          reminderCadence: normalizeCadence(s.reminderCadence, s.emailReminders),
          progressPct: (() => {
            const blocks = s.blocks ?? [];
            if (!blocks.length) return 0;
            return Math.round(
              (blocks.filter((b) => b.done).length / blocks.length) * 100,
            );
          })(),
          blockCount: (s.blocks ?? []).length,
        })),
      };
    });

    return json({ rows });
  } catch (e) {
    return error(e instanceof Error ? e.message : "Could not list schedule suites.", 500);
  }
}
