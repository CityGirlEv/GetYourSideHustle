/**
 * Member Kid Credit wallet + ledger (D1).
 */
import { appendAudit, error, getUserByEmail, getUserById, json, type DbUser, type Env } from "./auth";
import {
  internalCreditDelta,
  internalCreditReason,
  parseInternalCreditGrant,
} from "../../src/lib/internal-credits";
import {
  checkoutIdempotencyToken,
  ledgerOccurredAt,
  SQL_TEXT_CONTAINS,
  SQL_TEXT_STARTS_WITH,
} from "../../src/lib/d1-sql";
import { ledgerNetBalance, roundCreditAmount } from "../../src/lib/member-credits";

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
  starter: { youthMonthly: 2.5, adultPoolMonthly: 2.5 },
  pro: { youthMonthly: 5, adultPoolMonthly: 5 },
  elite: { youthMonthly: 10, adultPoolMonthly: 10 },
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
            balance REAL NOT NULL DEFAULT 0 CHECK (balance >= 0),
            updated_at TEXT NOT NULL
          )
        `),
        env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS member_credit_ledger (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            delta REAL NOT NULL,
            reason TEXT NOT NULL,
            balance_after REAL NOT NULL,
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

export async function ensureWallet(env: Env, userId: string): Promise<{ balance: number; updated_at: string }> {
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

/** Current spendable credits = ledger earned − spent. Syncs the wallet cache when it lags. */
export async function reconcileWalletToLedger(
  env: Env,
  userId: string,
): Promise<{ balance: number; earned: number; spent: number; updated_at: string }> {
  const wallet = await ensureWallet(env, userId);
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
      .bind(userId)
      .first<{ earned: number; spent: number }>();
    earned = Math.max(0, roundCreditAmount(Number(totals?.earned) || 0));
    spent = Math.max(0, roundCreditAmount(Number(totals?.spent) || 0));
  } catch {
    /* empty ledger */
  }
  const ledgerBalance = ledgerNetBalance(earned, spent);
  if (wallet.balance !== ledgerBalance) {
    const now = new Date().toISOString();
    try {
      await env.DB.prepare(
        `UPDATE member_credit_wallets SET balance = ?, updated_at = ? WHERE user_id = ?`,
      )
        .bind(ledgerBalance, now, userId)
        .run();
      wallet.balance = ledgerBalance;
      wallet.updated_at = now;
    } catch {
      /* wallet table optional — still return the ledger total */
    }
  }
  return {
    balance: ledgerBalance,
    earned,
    spent,
    updated_at: wallet.updated_at,
  };
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
       WHERE user_id = ? AND delta > 0 AND ${SQL_TEXT_STARTS_WITH}`,
    )
      .bind(userId, PLAN_CREDIT_REASON_PREFIX)
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
    const fresh = (await getUserById(env.DB, user.id)) ?? user;
    const synced = await syncMemberEntitlementsFromPurchases(env, fresh);
    const wallet = await reconcileWalletToLedger(env, user.id);
    const { results } = await env.DB.prepare(
      `SELECT id, delta, reason, balance_after, created_at
       FROM member_credit_ledger
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 100`,
    )
      .bind(user.id)
      .all<CreditLedgerRow>();

    const membershipTier = synced.membershipTier;
    const audience = synced.audience;
    const monthlyAllowance = planKidCreditAllowance(membershipTier, audience);
    const earned = wallet.earned;
    const spent = wallet.spent;
    const ledgerBalance = wallet.balance;

    let creditPacks: Array<{
      sessionId: string;
      label: string;
      credits: number;
      amountCents: number;
      paidAt: string;
    }> = [];
    let paymentDates: Array<{ sessionId: string; paidAt: string }> = [];
    try {
      const { listGyshPaymentsForAudit } = await import("./stripe-payments");
      const { kidCreditsFromPurchase } = await import("../../src/lib/credit-pack-purchase");
      const rows = await listGyshPaymentsForAudit(env, {
        email: user.email,
        userId: user.id,
        limit: 100,
      });
      paymentDates = rows.map((row) => ({ sessionId: row.sessionId, paidAt: row.paidAt }));
      creditPacks = rows
        .map((row) => ({
          sessionId: row.sessionId,
          label: row.label,
          credits: kidCreditsFromPurchase(row),
          amountCents: row.amountCents,
          paidAt: row.paidAt,
        }))
        .filter((row) => row.credits > 0);
    } catch {
      creditPacks = [];
      paymentDates = [];
    }

    return json({
      balance: ledgerBalance,
      membershipTier,
      audience,
      monthlyAllowance,
      totals: {
        earned,
        spent,
        balance: ledgerBalance,
      },
      creditPacks,
      updatedAt: wallet.updated_at,
      recent: (results ?? []).map((r) => {
        const createdAt = r.created_at;
        return {
          id: r.id,
          delta: r.delta,
          reason: r.reason,
          balanceAfter: r.balance_after,
          createdAt,
          occurredAt: ledgerOccurredAt({ createdAt, reason: r.reason }, paymentDates),
        };
      }),
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
  occurredAt?: string | null,
): Promise<{ balance: number }> {
  if (!Number.isFinite(delta) || roundCreditAmount(delta) === 0) {
    throw new Error("delta must be a non-zero number");
  }
  const cleanReason = String(reason || "adjustment").trim().slice(0, 200) || "adjustment";
  const wallet = await ensureWallet(env, userId);
  const amount = roundCreditAmount(delta);
  const next = roundCreditAmount(Number(wallet.balance) + amount);
  if (next < 0) throw new Error("Insufficient credits");

  const now = new Date().toISOString();
  const paidRaw = String(occurredAt || "").trim();
  const ledgerAt =
    paidRaw && !Number.isNaN(new Date(paidRaw).getTime()) ? new Date(paidRaw).toISOString() : now;
  const id = newId("mcl");

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE member_credit_wallets SET balance = ?, updated_at = ? WHERE user_id = ?`,
    ).bind(next, now, userId),
    env.DB.prepare(
      `INSERT INTO member_credit_ledger (id, user_id, delta, reason, balance_after, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(id, userId, amount, cleanReason, next, ledgerAt),
  ]);

  return { balance: next };
}

/** Deduct Kid Credits for mixed Stripe/credit checkout. Idempotent when reason includes a session id. */
export async function spendCheckoutCredits(
  env: Env,
  userId: string,
  credits: number,
  reason: string,
  occurredAt?: string | null,
): Promise<{ spent: number; balance: number }> {
  const n = Math.max(0, roundCreditAmount(Number(credits) || 0));
  const wallet = await reconcileWalletToLedger(env, userId);
  if (n <= 0) return { spent: 0, balance: wallet.balance };
  const token = checkoutIdempotencyToken(reason);
  if (token) {
    const already = await env.DB.prepare(
      `SELECT id FROM member_credit_ledger WHERE user_id = ? AND ${SQL_TEXT_CONTAINS} LIMIT 1`,
    )
      .bind(userId, token)
      .first<{ id: string }>();
    if (already?.id) return { spent: 0, balance: wallet.balance };
  }
  if (wallet.balance + 1e-9 < n) {
    throw new Error(`Not enough Kid Credits (have ${wallet.balance}, need ${n}).`);
  }
  const result = await applyMemberCreditDelta(
    env,
    userId,
    -n,
    String(reason || "checkout").slice(0, 200),
    occurredAt,
  );
  return { spent: n, balance: result.balance };
}

/** Grant Kid Credits from a paid credit-pack checkout. Idempotent per Stripe session. */
export async function grantCreditPackPurchase(
  env: Env,
  input: {
    userId: string;
    sessionId: string;
    itemMeta?: string | null;
    label?: string | null;
    kind?: string | null;
    amountCents?: number | null;
    paidAt?: string | null;
  },
): Promise<{ granted: number; balance: number }> {
  const { kidCreditsFromPurchase, itemMetaFromPaymentLabel, formatCreditPackPurchaseLabel } = await import(
    "../../src/lib/credit-pack-purchase"
  );
  const sessionId = String(input.sessionId || "").trim();
  const userId = String(input.userId || "").trim();
  const itemMeta =
    String(input.itemMeta || "").trim() || itemMetaFromPaymentLabel(input.label);
  const credits = kidCreditsFromPurchase({
    itemMeta,
    label: input.label,
    kind: input.kind,
    amountCents: input.amountCents,
  });
  if (!userId || !sessionId || credits <= 0) {
    const wallet = userId ? await ensureWallet(env, userId) : { balance: 0 };
    return { granted: 0, balance: wallet.balance };
  }

  await ensureMemberCreditTables(env);
  const already = await env.DB.prepare(
    `SELECT id FROM member_credit_ledger WHERE user_id = ? AND ${SQL_TEXT_CONTAINS} LIMIT 1`,
  )
    .bind(userId, sessionId)
    .first<{ id: string }>();
  if (already?.id) {
    const wallet = await ensureWallet(env, userId);
    return { granted: 0, balance: wallet.balance };
  }

  const packLabel = formatCreditPackPurchaseLabel({
    itemMeta,
    label: input.label,
    kind: input.kind,
    amountCents: input.amountCents,
    credits,
  });
  const result = await applyMemberCreditDelta(
    env,
    userId,
    credits,
    `${sessionId} · ${packLabel}`.slice(0, 200),
    input.paidAt,
  );
  return { granted: credits, balance: result.balance };
}

/** After signup/activation: apply any credit-pack payments already on this email. */
export async function grantPendingCreditPackPurchases(
  env: Env,
  user: { id: string; email: string },
): Promise<number> {
  const email = String(user.email || "").trim().toLowerCase();
  if (!email.includes("@") || !user.id) return 0;
  let granted = 0;
  try {
    const { listGyshPaymentsForAudit } = await import("./stripe-payments");
    const rows = await listGyshPaymentsForAudit(env, { email, userId: user.id, limit: 50 });
    for (const row of rows) {
      const result = await grantCreditPackPurchase(env, {
        userId: user.id,
        sessionId: row.sessionId,
        label: row.label,
        kind: row.kind,
        amountCents: row.amountCents,
        paidAt: row.paidAt,
      });
      granted += result.granted;
    }
  } catch {
    /* payments table optional */
  }
  return granted;
}

/**
 * Attach Stripe ledger rows to this member, grant missing pack/plan credits, and
 * raise membership_tier when a paid membership checkout is higher than the account row.
 */
export async function syncMemberEntitlementsFromPurchases(
  env: Env,
  user: DbUser,
): Promise<{
  membershipTier: string;
  audience: string;
  packCreditsGranted: number;
  planCreditsGranted: number;
}> {
  const email = String(user.email || "").trim().toLowerCase();
  const fresh = (await getUserById(env.DB, user.id)) ?? user;
  let membershipTier = String(fresh.membership_tier || "free").toLowerCase();
  let audience = String(fresh.audience || "adult").toLowerCase();
  let packCreditsGranted = 0;
  let planCreditsGranted = 0;

  try {
    const { listGyshPaymentsForAudit } = await import("./stripe-payments");
    if (email.includes("@")) {
      await env.DB.prepare(
        `UPDATE gysh_payments SET user_id = COALESCE(user_id, ?) WHERE lower(email) = lower(?)`,
      )
        .bind(user.id, email)
        .run();
    }
    const rows = await listGyshPaymentsForAudit(env, { email, userId: user.id, limit: 100 });
    const { effectiveMembershipTier } = await import("../../src/lib/member-purchases");
    const { higherMembershipTier } = await import("../../src/lib/member-credits");
    // Always re-read the account row above so a stale session cannot write Starter over Elite.
    const paidTier = higherMembershipTier(
      membershipTier,
      effectiveMembershipTier(membershipTier, rows),
    );
    if (paidTier !== "free" && paidTier !== membershipTier) {
      const now = new Date().toISOString();
      const paidAudience = rows
        .map((r) => String(r.audience || "").toLowerCase())
        .find((a) => a === "kids" || a === "junior" || a === "adult" || a === "senior");
      if (paidAudience) audience = paidAudience;
      await env.DB.prepare(
        `UPDATE users SET membership_tier = ?, audience = ?, updated_at = ? WHERE id = ?`,
      )
        .bind(paidTier, audience, now, user.id)
        .run();
      membershipTier = paidTier;
      try {
        const { appendAudit } = await import("./auth");
        await appendAudit(
          env.DB,
          "membership_plan_update",
          user.email,
          `${paidTier}:${audience} from paid checkout`,
        );
      } catch {
        /* audit optional */
      }
    }
    packCreditsGranted = await grantPendingCreditPackPurchases(env, {
      id: user.id,
      email: user.email,
    });
    const { audiencePaysMembershipWithCredits } = await import("../../src/lib/credit-checkout");
    if (membershipTier !== "free" && !audiencePaysMembershipWithCredits(audience)) {
      const plan = await grantMembershipPlanCredits(env, user.id, membershipTier, audience);
      planCreditsGranted = plan.granted;
    }
  } catch {
    /* payments / credits optional */
  }

  return { membershipTier, audience, packCreditsGranted, planCreditsGranted };
}

/** Spend Kid Credits on a Kids/Teens membership or credit-priced a-la-carte item. */
export async function handleSpendCredits(
  env: Env,
  request: Request,
  user: DbUser,
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.", 400);
  }

  const { parseCreditSpendRequest, quoteCreditPurchase, membershipUpgradeCreditCost, cartCreditCost, alacarteCreditPrice, ALA_CARTE_LOOKUP } =
    await import("../../src/lib/credit-checkout").then(async (mod) => ({
      ...mod,
      ALA_CARTE_LOOKUP: (await import("../../src/lib/membership")).ALA_CARTE_PRICE_LIST,
    }));
  const parsed = parseCreditSpendRequest(body);
  if (!parsed.ok) return error(parsed.error, 400);

  const wallet = await ensureWallet(env, user.id);
  const currentTier = String(user.membership_tier || "free").toLowerCase();
  const currentAudience = String(user.audience || "adult").toLowerCase();

  let cost = 0;
  let label = "Credit checkout";
  if (parsed.request.kind === "membership") {
    cost = membershipUpgradeCreditCost(currentTier, parsed.request.tier, parsed.request.audience);
    const plan = parsed.request.tier[0]!.toUpperCase() + parsed.request.tier.slice(1);
    label = `${plan} membership (${parsed.request.audience})`;
  } else if (parsed.request.kind === "alacarte") {
    cost = alacarteCreditPrice(parsed.request.itemId, parsed.request.quantity) ?? 0;
    const item = ALA_CARTE_LOOKUP.find((row) => row.id === parsed.request.itemId);
    label = item ? `${item.name}${parsed.request.quantity > 1 ? ` ×${parsed.request.quantity}` : ""}` : parsed.request.itemId;
  } else {
    const cart = cartCreditCost(parsed.request.items);
    cost = cart.costCredits;
    label = cart.spendable.map((row) => row.label).join(", ") || "A-la-carte cart";
  }

  const quote = quoteCreditPurchase({ label, costCredits: cost, balance: wallet.balance });
  if (cost > 0 && !quote.canAfford) {
    return error(
      `Not enough Kid Credits. ${label} costs ${quote.costCredits}; you have ${quote.balance}. Buy a credit pack (${quote.suggestedPack?.name ?? "Boost Pack"}) then try again.`,
      402,
    );
  }

  let balance = wallet.balance;
  if (cost > 0) {
    const spent = await applyMemberCreditDelta(
      env,
      user.id,
      -cost,
      `${label} · ${cost} Kid Credits`.slice(0, 200),
    );
    balance = spent.balance;
  }

  const { publicUser, appendAudit, getUserById } = await import("./auth");
  let updatedUser = publicUser(user);

  if (parsed.request.kind === "membership") {
    const now = new Date().toISOString();
    const stamp = `Credit checkout ${parsed.request.tier} (${parsed.request.audience}) ${now}`;
    const notes = `${String(user.notes || "")}${user.notes ? " · " : ""}${stamp}`.slice(0, 1900);
    await env.DB.prepare(
      `UPDATE users SET membership_tier = ?, audience = ?, notes = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(parsed.request.tier, parsed.request.audience, notes, now, user.id)
      .run();
    await appendAudit(
      env.DB,
      "membership_plan_update",
      user.email,
      `${parsed.request.tier}:${parsed.request.audience} paid with ${cost} Kid Credits`,
    );
    const refreshed = await getUserById(env.DB, user.id);
    if (refreshed) updatedUser = publicUser(refreshed);
    else {
      updatedUser = publicUser({
        ...user,
        membership_tier: parsed.request.tier,
        audience: parsed.request.audience,
        notes,
      });
    }
    try {
      const { sendMembershipSubscriptionEmails } = await import("./email");
      await sendMembershipSubscriptionEmails(env, {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          membership_tier: updatedUser.membershipTier,
          audience: updatedUser.audience,
        },
        previousTier: currentTier,
        source: "credits",
        amountLabel: `${cost} Kid Credits`,
        creditsApplied: cost,
        amountCents: 0,
      });
    } catch {
      /* email optional */
    }
    try {
      const { upsertGyshPayment } = await import("./stripe-payments");
      await upsertGyshPayment(env, {
        sessionId: `cred-membership-${user.id}-${Date.now()}`,
        email: user.email,
        userId: user.id,
        kind: "membership",
        tier: parsed.request.tier,
        audience: parsed.request.audience,
        interval: "month",
        amountCents: 0,
        paidAt: now,
        source: "credits",
        memberName: user.name,
      });
    } catch {
      /* ledger optional */
    }
  } else {
    const lines =
      parsed.request.kind === "alacarte"
        ? [{ itemId: parsed.request.itemId, quantity: parsed.request.quantity }]
        : parsed.request.items;
    try {
      const { upsertGyshPayment } = await import("./stripe-payments");
      const now = new Date().toISOString();
      for (const line of lines) {
        const item = ALA_CARTE_LOOKUP.find((row) => row.id === line.itemId);
        const credits = alacarteCreditPrice(line.itemId, line.quantity) ?? 0;
        await upsertGyshPayment(env, {
          sessionId: `cred-${user.id}-${line.itemId}-${Date.now()}`,
          email: user.email,
          userId: user.id,
          kind: "alacarte",
          item: `${line.itemId}x${line.quantity}`,
          amountCents: 0,
          paidAt: now,
          source: "credits",
          memberName: user.name,
        });
        await appendAudit(
          env.DB,
          "purchase_alacarte",
          user.email,
          `${item?.name || line.itemId} · ${credits} Kid Credits`,
        );
      }
    } catch {
      /* ledger optional */
    }
  }

  return json({
    ok: true,
    balance,
    quote,
    user: updatedUser,
    message: cost > 0 ? `Spent ${cost} Kid Credits on ${label}.` : `You're already on ${label}.`,
  });
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
