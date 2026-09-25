/**
 * Member Kid Credit wallet + ledger (D1).
 */
import { appendAudit, error, getUserByEmail, json, type DbUser, type Env } from "./auth";
import {
  internalCreditDelta,
  internalCreditReason,
  parseInternalCreditGrant,
} from "../../src/lib/internal-credits";

export type CreditLedgerRow = {
  id: string;
  delta: number;
  reason: string;
  balance_after: number;
  created_at: string;
};

/** Mirrors src/lib/membership MEMBERSHIP_TIERS credit fields. */
const PLAN_KID_CREDITS: Record<
  string,
  { youthMonthly: number; adultPoolMonthly: number }
> = {
  free: { youthMonthly: 0, adultPoolMonthly: 0 },
  starter: { youthMonthly: 60, adultPoolMonthly: 30 },
  pro: { youthMonthly: 140, adultPoolMonthly: 60 },
  elite: { youthMonthly: 280, adultPoolMonthly: 120 },
};

const PLAN_CREDIT_REASON_PREFIX = "Membership plan credits";

let creditTablesReady: Promise<void> | null = null;

/** Self-heal if migration 0026 was skipped on an environment. */
export async function ensureMemberCreditTables(env: Env): Promise<void> {
  if (!env.DB) return;
  if (!creditTablesReady) {
    creditTablesReady = (async () => {
      await env.DB.batch([
        env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS member_credit_wallets (
            user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
            updated_at TEXT NOT NULL
          )
        `),
        env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS member_credit_ledger (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            delta INTEGER NOT NULL,
            reason TEXT NOT NULL,
            balance_after INTEGER NOT NULL,
            created_at TEXT NOT NULL
          )
        `),
        env.DB.prepare(`
          CREATE INDEX IF NOT EXISTS idx_member_credit_ledger_user
            ON member_credit_ledger(user_id, created_at DESC)
        `),
      ]);
    })().catch((err) => {
      creditTablesReady = null;
      throw err;
    });
  }
  await creditTablesReady;
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function ensureWallet(env: Env, userId: string): Promise<{ balance: number; updated_at: string }> {
  await ensureMemberCreditTables(env);

  const existing = await env.DB.prepare(
    `SELECT balance, updated_at FROM member_credit_wallets WHERE user_id = ?`,
  )
    .bind(userId)
    .first<{ balance: number; updated_at: string }>();
  if (existing) return existing;

  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO member_credit_wallets (user_id, balance, updated_at) VALUES (?, 0, ?)
     ON CONFLICT(user_id) DO NOTHING`,
  )
    .bind(userId, now)
    .run();

  const row = await env.DB.prepare(
    `SELECT balance, updated_at FROM member_credit_wallets WHERE user_id = ?`,
  )
    .bind(userId)
    .first<{ balance: number; updated_at: string }>();
  return row ?? { balance: 0, updated_at: now };
}

async function membershipContext(
  env: Env,
  userId: string,
): Promise<{ membershipTier: string; audience: string }> {
  try {
    const row = await env.DB.prepare(
      `SELECT membership_tier, audience FROM users WHERE id = ?`,
    )
      .bind(userId)
      .first<{ membership_tier: string; audience: string }>();
    return {
      membershipTier: row?.membership_tier || "free",
      audience: row?.audience || "adult",
    };
  } catch {
    return { membershipTier: "free", audience: "adult" };
  }
}

/** Monthly Kid Credits included with a plan (youth lane vs Adult/Senior family pool). */
export function planKidCreditAllowance(
  membershipTier: string | null | undefined,
  audience: string | null | undefined,
): number {
  const tier = String(membershipTier || "free").toLowerCase();
  const lane = String(audience || "adult").toLowerCase();
  const row = PLAN_KID_CREDITS[tier] ?? PLAN_KID_CREDITS.free!;
  if (lane === "kids" || lane === "junior" || lane === "parent" || lane === "teen" || lane === "teens") {
    return row.youthMonthly;
  }
  return row.adultPoolMonthly;
}

async function sumPlanCreditGrants(env: Env, userId: string): Promise<number> {
  await ensureMemberCreditTables(env);
  try {
    const row = await env.DB.prepare(
      `SELECT COALESCE(SUM(delta), 0) AS total
       FROM member_credit_ledger
       WHERE user_id = ? AND delta > 0 AND reason LIKE ?`,
    )
      .bind(userId, `${PLAN_CREDIT_REASON_PREFIX}%`)
      .first<{ total: number }>();
    return Math.max(0, Math.floor(Number(row?.total) || 0));
  } catch {
    return 0;
  }
}

/**
 * Grant (or top up) Kid Credits included with the membership plan.
 * Idempotent across upgrades: only grants the difference vs prior plan credit grants.
 */
export async function grantMembershipPlanCredits(
  env: Env,
  userId: string,
  membershipTier: string,
  audience: string,
): Promise<{ granted: number; balance: number; allowance: number }> {
  const allowance = planKidCreditAllowance(membershipTier, audience);
  if (allowance <= 0) {
    const wallet = await ensureWallet(env, userId);
    return { granted: 0, balance: wallet.balance, allowance: 0 };
  }
  const prior = await sumPlanCreditGrants(env, userId);
  const need = allowance - prior;
  if (need <= 0) {
    const wallet = await ensureWallet(env, userId);
    return { granted: 0, balance: wallet.balance, allowance };
  }
  const tierName = String(membershipTier || "free");
  const result = await applyMemberCreditDelta(
    env,
    userId,
    need,
    `${PLAN_CREDIT_REASON_PREFIX}: ${tierName}`,
  );
  return { granted: need, balance: result.balance, allowance };
}

export async function getMemberCredits(env: Env, user: DbUser): Promise<Response> {
  try {
    const wallet = await ensureWallet(env, user.id);
    const { results } = await env.DB.prepare(
      `SELECT id, delta, reason, balance_after, created_at
       FROM member_credit_ledger
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 25`,
    )
      .bind(user.id)
      .all<CreditLedgerRow>();

    const membership = await membershipContext(env, user.id);
    const monthlyAllowance = planKidCreditAllowance(
      membership.membershipTier,
      membership.audience,
    );

    let earned = 0;
    let spent = 0;
    try {
      const totals = await env.DB.prepare(
        `SELECT
           COALESCE(SUM(CASE WHEN delta > 0 THEN delta ELSE 0 END), 0) AS earned,
           COALESCE(SUM(CASE WHEN delta < 0 THEN -delta ELSE 0 END), 0) AS spent
         FROM member_credit_ledger
         WHERE user_id = ?`,
      )
        .bind(user.id)
        .first<{ earned: number; spent: number }>();
      earned = Math.max(0, Math.floor(Number(totals?.earned) || 0));
      spent = Math.max(0, Math.floor(Number(totals?.spent) || 0));
    } catch {
      /* empty ledger */
    }

    return json({
      balance: wallet.balance ?? 0,
      membershipTier: membership.membershipTier,
      audience: membership.audience,
      monthlyAllowance,
      totals: {
        earned,
        spent,
        balance: wallet.balance ?? 0,
      },
      updatedAt: wallet.updated_at,
      recent: (results ?? []).map((r) => ({
        id: r.id,
        delta: r.delta,
        reason: r.reason,
        balanceAfter: r.balance_after,
        createdAt: r.created_at,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("no such table")) {
      return error("member_credit_wallets missing. Run: npm run db:migrate", 503);
    }
    throw e;
  }
}

/**
 * Append a ledger entry and update wallet balance.
 * Used by admin tools / future earn flows — not exposed publicly yet.
 */
export async function applyMemberCreditDelta(
  env: Env,
  userId: string,
  delta: number,
  reason: string,
): Promise<{ balance: number }> {
  if (!Number.isFinite(delta) || delta === 0) {
    throw new Error("delta must be a non-zero number");
  }
  const cleanReason = String(reason || "adjustment").trim().slice(0, 200) || "adjustment";
  const wallet = await ensureWallet(env, userId);
  const next = wallet.balance + Math.trunc(delta);
  if (next < 0) throw new Error("Insufficient credits");

  const now = new Date().toISOString();
  const id = newId("mcl");

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE member_credit_wallets SET balance = ?, updated_at = ? WHERE user_id = ?`,
    ).bind(next, now, userId),
    env.DB.prepare(
      `INSERT INTO member_credit_ledger (id, user_id, delta, reason, balance_after, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(id, userId, Math.trunc(delta), cleanReason, next, now),
  ]);

  return { balance: next };
}

/** Admin-only: add or remove credits on any member wallet. */
export async function handleAdminGrantInternalCredits(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("Email and credit amount are required.", 400);
  }
  const parsed = parseInternalCreditGrant(body);
  if (!parsed.ok) return error(parsed.error, 400);

  const target = await getUserByEmail(env.DB, parsed.email);
  if (!target) return error("No GYSH account found for that email.", 404);

  const delta = internalCreditDelta(parsed.credits, parsed.action);
  const reason = internalCreditReason(parsed.action);
  let result: { balance: number };
  try {
    result = await applyMemberCreditDelta(env, target.id, delta, reason);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not update credits.";
    if (/insufficient/i.test(msg)) {
      return error("Not enough credits on that account to remove that amount.", 400);
    }
    return error(msg, 500);
  }
  try {
    await appendAudit(
      env.DB,
      parsed.action === "remove" ? "credits_removed" : "credits_granted",
      target.email,
      `${reason} · ${parsed.credits} by ${actor.email}`,
    );
  } catch {
    /* audit optional */
  }
  return json({
    ok: true,
    email: target.email,
    name: target.name,
    granted: parsed.action === "add" ? parsed.credits : 0,
    removed: parsed.action === "remove" ? parsed.credits : 0,
    action: parsed.action,
    balance: result.balance,
    reason,
  });
}
