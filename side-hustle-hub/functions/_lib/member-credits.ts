/**
 * Member Kid Credit wallet + ledger (D1).
 */
import { error, json, type DbUser, type Env } from "./auth";

export type CreditLedgerRow = {
  id: string;
  delta: number;
  reason: string;
  balance_after: number;
  created_at: string;
};

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function ensureWallet(env: Env, userId: string): Promise<{ balance: number; updated_at: string }> {
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

export async function getMemberCredits(env: Env, user: DbUser): Promise<Response> {
  try {
    const wallet = await ensureWallet(env, user.id);
    const { results } = await env.DB.prepare(
      `SELECT id, delta, reason, balance_after, created_at
       FROM member_credit_ledger
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
    )
      .bind(user.id)
      .all<CreditLedgerRow>();

    const membership = await membershipContext(env, user.id);

    return json({
      balance: wallet.balance ?? 0,
      membershipTier: membership.membershipTier,
      audience: membership.audience,
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
