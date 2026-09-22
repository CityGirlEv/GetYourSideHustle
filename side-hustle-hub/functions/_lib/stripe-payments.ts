/**
 * GYSH payments ledger + Stripe Checkout session reports for Financials.
 */
import { appendAudit, canonicalizeEmail, error, json, type DbUser, type Env } from "./auth";
import {
  resolvePaymentPeriodRange,
  ymdRangeToUnixInclusive,
  type PaymentPeriodPreset,
} from "./payment-periods";
import {
  requireStripeSecret,
  stripeRequest,
  type StripeCheckoutSession,
} from "./stripe";
import {
  mergeListedPayment,
  parsePaymentRowPatch,
  summarizeGyshPayments,
  type PaymentRowPatchInput,
} from "../../src/lib/gysh-payments";
import { formatAlaCartePurchaseLabel, formatCreditPackPurchaseLabel } from "../../src/lib/credit-pack-purchase";
import { membershipBillingCadenceLabel } from "../../src/lib/membership-commitment-billing";

export type GyshPaymentRow = {
  id: string;
  sessionId: string;
  paymentIntentId: string;
  email: string;
  userId: string | null;
  kind: string;
  tier: string;
  audience: string;
  interval: string;
  label: string;
  amountCents: number;
  currency: string;
  paidAt: string;
  source: string;
  memberName: string;
  refundCents: number;
  refundedAt: string | null;
  refundSource: string;
  refundNote: string;
  adminEdited: boolean;
};

/** True when a ledger row is owned by this member (user id or matching email). */
export function paymentBelongsToMember(
  payment: { userId?: string | null; email?: string | null },
  member: { userId: string; email: string },
): boolean {
  const memberId = String(member.userId || "").trim();
  const memberEmail = canonicalizeEmail(member.email || "");
  if (memberId && payment.userId && String(payment.userId) === memberId) return true;
  if (memberEmail.includes("@") && canonicalizeEmail(payment.email || "") === memberEmail) {
    return true;
  }
  return false;
}

export function filterPaymentsForMember<T extends { userId?: string | null; email?: string | null }>(
  payments: T[],
  member: { userId: string; email: string },
): T[] {
  return payments.filter((p) => paymentBelongsToMember(p, member));
}

async function ensurePaymentsTable(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS gysh_payments (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL UNIQUE,
      payment_intent_id TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      user_id TEXT,
      kind TEXT NOT NULL DEFAULT 'membership',
      tier TEXT NOT NULL DEFAULT '',
      audience TEXT NOT NULL DEFAULT '',
      interval TEXT NOT NULL DEFAULT '',
      label TEXT NOT NULL DEFAULT '',
      amount_cents INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'usd',
      paid_at TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'stripe',
      meta_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ).run();
  try {
    await env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS idx_gysh_payments_paid_at ON gysh_payments(paid_at)`,
    ).run();
  } catch {
    /* ignore */
  }
  try {
    await env.DB.prepare(
      `ALTER TABLE gysh_payments ADD COLUMN member_name TEXT NOT NULL DEFAULT ''`,
    ).run();
  } catch {
    /* already present */
  }
  for (const sql of [
    `ALTER TABLE gysh_payments ADD COLUMN refund_cents INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE gysh_payments ADD COLUMN refunded_at TEXT`,
    `ALTER TABLE gysh_payments ADD COLUMN refund_source TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE gysh_payments ADD COLUMN refund_note TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE gysh_payments ADD COLUMN admin_edited INTEGER NOT NULL DEFAULT 0`,
  ]) {
    try {
      await env.DB.prepare(sql).run();
    } catch {
      /* already present */
    }
  }
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS gysh_payment_exclusions (
      session_id TEXT PRIMARY KEY,
      payment_id TEXT NOT NULL DEFAULT '',
      reason TEXT NOT NULL DEFAULT 'admin_deleted',
      deleted_by TEXT NOT NULL DEFAULT '',
      deleted_at TEXT NOT NULL
    )`,
  ).run();
}

export async function listGyshPaymentsForAudit(
  env: Env,
  opts?: { email?: string; userId?: string; limit?: number },
): Promise<
  Array<{
    paidAt: string;
    email: string;
    kind: string;
    label: string;
    amountCents: number;
    sessionId: string;
    tier: string;
    audience: string;
  }>
> {
  await ensurePaymentsTable(env);
  const limit = Math.min(Math.max(opts?.limit ?? 200, 1), 2000);
  const email = canonicalizeEmail(opts?.email || "");
  const userId = String(opts?.userId || "").trim();
  const mapRows = (
    results:
      | Array<{
          paid_at: string;
          email: string;
          kind: string;
          label: string;
          amount_cents: number;
          session_id: string;
          tier?: string | null;
          audience?: string | null;
        }>
      | null
      | undefined,
  ) =>
    (results || []).map((r) => ({
      paidAt: r.paid_at,
      email: r.email,
      kind: r.kind,
      label: r.label,
      amountCents: r.amount_cents,
      sessionId: r.session_id,
      tier: r.tier || "",
      audience: r.audience || "",
    }));
  const selectSql = `SELECT paid_at, email, kind, label, amount_cents, session_id, tier, audience
         FROM gysh_payments`;
  try {
    if (userId && email.includes("@")) {
      const { results } = await env.DB.prepare(
        `${selectSql}
         WHERE user_id = ? OR lower(email) = lower(?)
         ORDER BY paid_at DESC
         LIMIT ?`,
      )
        .bind(userId, email, limit)
        .all();
      return mapRows(results);
    }
    if (email.includes("@")) {
      const { results } = await env.DB.prepare(
        `${selectSql}
         WHERE lower(email) = lower(?)
         ORDER BY paid_at DESC
         LIMIT ?`,
      )
        .bind(email, limit)
        .all();
      return mapRows(results);
    }
    if (userId) {
      const { results } = await env.DB.prepare(
        `${selectSql}
         WHERE user_id = ?
         ORDER BY paid_at DESC
         LIMIT ?`,
      )
        .bind(userId, limit)
        .all();
      return mapRows(results);
    }
    const { results } = await env.DB.prepare(
      `${selectSql}
       ORDER BY paid_at DESC
       LIMIT ?`,
    )
      .bind(limit)
      .all();
    return mapRows(results);
  } catch {
    return [];
  }
}

function labelForPayment(input: {
  kind: string;
  tier: string;
  audience: string;
  interval: string;
  item: string;
}): string {
  if (input.kind === "membership") {
    const tier = input.tier ? input.tier[0]!.toUpperCase() + input.tier.slice(1) : "Membership";
    const lane = input.audience || "adult";
    const every = membershipBillingCadenceLabel(input.interval);
    return `${tier} · ${lane} · ${every}`;
  }
  if (input.kind === "alacarte") {
    return formatAlaCartePurchaseLabel({
      itemMeta: input.item,
      label: input.item ? `A-la-carte · ${input.item}` : "A-la-carte",
    });
  }
  if (input.kind === "credit_pack") {
    return formatCreditPackPurchaseLabel({
      itemMeta: input.item,
      label: input.item ? `Credit pack · ${input.item}` : "Credit pack",
      kind: "credit_pack",
    });
  }
  return input.kind || "Payment";
}

export async function gyshPaymentExistsForSession(env: Env, sessionId: string): Promise<boolean> {
  const id = String(sessionId || "").trim();
  if (!id) return false;
  await ensurePaymentsTable(env);
  const row = await env.DB.prepare(
    `SELECT session_id FROM gysh_payments WHERE session_id = ? LIMIT 1`,
  )
    .bind(id)
    .first<{ session_id: string }>();
  return Boolean(row?.session_id);
}

export async function upsertGyshPayment(
  env: Env,
  input: {
    sessionId: string;
    paymentIntentId?: string | null;
    email: string;
    userId?: string | null;
    kind: string;
    tier?: string;
    audience?: string;
    interval?: string;
    item?: string;
    amountCents: number;
    currency?: string;
    paidAt?: string;
    source?: string;
    memberName?: string | null;
  },
): Promise<void> {
  await ensurePaymentsTable(env);
  const now = new Date().toISOString();
  const paidAt = input.paidAt || now;
  const label = labelForPayment({
    kind: input.kind,
    tier: input.tier || "",
    audience: input.audience || "",
    interval: input.interval || "",
    item: input.item || "",
  });
  const memberName = String(input.memberName || "").trim();
  const id = `pay-${input.sessionId}`;
  await env.DB.prepare(
    `INSERT INTO gysh_payments (
       id, session_id, payment_intent_id, email, user_id, kind, tier, audience, interval,
       label, amount_cents, currency, paid_at, source, meta_json, created_at, updated_at, member_name
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(session_id) DO UPDATE SET
       payment_intent_id = excluded.payment_intent_id,
       user_id = COALESCE(excluded.user_id, gysh_payments.user_id),
       tier = CASE
         WHEN COALESCE(gysh_payments.admin_edited, 0) = 1 THEN gysh_payments.tier
         ELSE excluded.tier
       END,
       audience = CASE
         WHEN COALESCE(gysh_payments.admin_edited, 0) = 1 THEN gysh_payments.audience
         ELSE excluded.audience
       END,
       interval = CASE
         WHEN COALESCE(gysh_payments.admin_edited, 0) = 1 THEN gysh_payments.interval
         ELSE excluded.interval
       END,
       currency = excluded.currency,
       source = excluded.source,
       member_name = CASE
         WHEN COALESCE(gysh_payments.admin_edited, 0) = 1 THEN gysh_payments.member_name
         WHEN excluded.member_name != '' THEN excluded.member_name
         ELSE gysh_payments.member_name
       END,
       email = CASE
         WHEN COALESCE(gysh_payments.admin_edited, 0) = 1 THEN gysh_payments.email
         ELSE excluded.email
       END,
       kind = CASE
         WHEN COALESCE(gysh_payments.admin_edited, 0) = 1 THEN gysh_payments.kind
         ELSE excluded.kind
       END,
       label = CASE
         WHEN COALESCE(gysh_payments.admin_edited, 0) = 1 THEN gysh_payments.label
         ELSE excluded.label
       END,
       amount_cents = CASE
         WHEN COALESCE(gysh_payments.admin_edited, 0) = 1 THEN gysh_payments.amount_cents
         ELSE excluded.amount_cents
       END,
       paid_at = CASE
         WHEN COALESCE(gysh_payments.admin_edited, 0) = 1 THEN gysh_payments.paid_at
         ELSE excluded.paid_at
       END,
       updated_at = excluded.updated_at`,
  )
    .bind(
      id,
      input.sessionId,
      String(input.paymentIntentId || ""),
      input.email,
      input.userId || null,
      input.kind,
      input.tier || "",
      input.audience || "",
      input.interval || "",
      label,
      Math.max(0, Math.round(input.amountCents)),
      (input.currency || "usd").toLowerCase(),
      paidAt,
      input.source || "stripe",
      "{}",
      now,
      now,
      memberName,
    )
    .run();
}

type StripeList<T> = { data: T[]; has_more?: boolean };

async function listStripeCheckoutSessions(
  secret: string,
  gte: number,
  lte: number,
): Promise<StripeCheckoutSession[]> {
  const out: StripeCheckoutSession[] = [];
  let startingAfter: string | undefined;
  for (let page = 0; page < 20; page++) {
    const result = await stripeRequest<StripeList<StripeCheckoutSession>>(
      secret,
      "GET",
      "checkout/sessions",
      {
        limit: 100,
        "created[gte]": gte,
        "created[lte]": lte,
        starting_after: startingAfter,
      },
    );
    if (!result.ok) throw new Error(result.error);
    out.push(...(result.data.data || []));
    if (!result.data.has_more || !result.data.data?.length) break;
    startingAfter = result.data.data[result.data.data.length - 1]?.id;
    if (!startingAfter) break;
  }
  return out;
}

function sessionToPayment(session: StripeCheckoutSession): GyshPaymentRow | null {
  const paid =
    session.payment_status === "paid" ||
    session.status === "complete" ||
    session.payment_status === "no_payment_required";
  if (!paid) return null;
  const meta = session.metadata || {};
  const kind = String(meta.gysh_kind || "membership");
  const tier = String(meta.gysh_tier || "");
  const audience = String(meta.gysh_audience || "");
  const interval = String(meta.gysh_interval || "");
  const item = String(meta.gysh_item || "");
  const email = String(meta.gysh_email || session.customer_email || session.customer_details?.email || "").toLowerCase();
  const memberName = String(meta.gysh_name || session.customer_details?.name || "").trim();
  const amountCents = Number(session.amount_total || 0);
  const paidAt = session.created
    ? new Date(session.created * 1000).toISOString()
    : new Date().toISOString();
  return {
    id: `pay-${session.id}`,
    sessionId: session.id,
    paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
    email,
    memberName,
    userId: null,
    kind,
    tier,
    audience,
    interval,
    label: labelForPayment({ kind, tier, audience, interval, item }),
    amountCents,
    currency: String(session.currency || "usd").toLowerCase(),
    paidAt,
    source: "stripe",
    refundCents: 0,
    refundedAt: null,
    refundSource: "",
    refundNote: "",
    adminEdited: false,
  };
}

type GyshPaymentDbRow = {
  id: string;
  session_id: string;
  payment_intent_id: string;
  email: string;
  user_id: string | null;
  kind: string;
  tier: string;
  audience: string;
  interval: string;
  label: string;
  amount_cents: number;
  currency: string;
  paid_at: string;
  source: string;
  member_name?: string | null;
  refund_cents?: number | null;
  refunded_at?: string | null;
  refund_source?: string | null;
  refund_note?: string | null;
  admin_edited?: number | null;
};

function mapDbPayment(r: GyshPaymentDbRow): GyshPaymentRow {
  return {
    id: r.id,
    sessionId: r.session_id,
    paymentIntentId: r.payment_intent_id || "",
    email: r.email,
    userId: r.user_id,
    kind: r.kind,
    tier: r.tier,
    audience: r.audience,
    interval: r.interval,
    label: r.label,
    amountCents: r.amount_cents,
    currency: r.currency,
    paidAt: r.paid_at,
    source: r.source,
    memberName: r.member_name || "",
    refundCents: Number(r.refund_cents) || 0,
    refundedAt: r.refunded_at || null,
    refundSource: r.refund_source || "",
    refundNote: r.refund_note || "",
    adminEdited: Number(r.admin_edited) === 1,
  };
}

const PAYMENT_SELECT = `id, session_id, payment_intent_id, email, user_id, kind, tier, audience, interval,
              label, amount_cents, currency, paid_at, source, member_name,
              refund_cents, refunded_at, refund_source, refund_note, admin_edited`;

/** Admin: list / total Stripe + D1 payments for a period. */
export async function handleListPayments(env: Env, request: Request): Promise<Response> {
  const secret = requireStripeSecret(env);
  if (secret instanceof Response) return secret;

  const url = new URL(request.url);
  const preset = (url.searchParams.get("period") || "month") as PaymentPeriodPreset;
  const allowed: PaymentPeriodPreset[] = ["day", "week", "month", "quarter", "year", "custom"];
  const safePreset = allowed.includes(preset) ? preset : "month";
  const range = resolvePaymentPeriodRange(safePreset, {
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
  });
  const { gte, lte } = ymdRangeToUnixInclusive(range.from, range.to);

  let stripePayments: GyshPaymentRow[] = [];
  let stripeError: string | null = null;
  try {
    const sessions = await listStripeCheckoutSessions(secret, gte, lte);
    stripePayments = sessions
      .map(sessionToPayment)
      .filter((p): p is GyshPaymentRow => Boolean(p));
    // Best-effort mirror into D1 for Memberships cross-links / offline history.
    for (const p of stripePayments) {
      try {
        await upsertGyshPayment(env, {
          sessionId: p.sessionId,
          paymentIntentId: p.paymentIntentId,
          email: p.email,
          kind: p.kind,
          tier: p.tier,
          audience: p.audience,
          interval: p.interval,
          amountCents: p.amountCents,
          currency: p.currency,
          paidAt: p.paidAt,
          source: "stripe",
          memberName: p.memberName,
        });
      } catch {
        /* ignore single-row failures */
      }
    }
  } catch (e) {
    stripeError = e instanceof Error ? e.message : "Could not load Stripe payments.";
  }

  // Also include any D1 rows in range (in case Stripe pagination missed older mirrored rows).
  let d1Payments: GyshPaymentRow[] = [];
  try {
    await ensurePaymentsTable(env);
    const fromIso = new Date(gte * 1000).toISOString();
    const toIso = new Date(lte * 1000).toISOString();
    const rows = await env.DB.prepare(
      `SELECT ${PAYMENT_SELECT}
       FROM gysh_payments
       WHERE paid_at >= ? AND paid_at <= ?
       ORDER BY paid_at DESC`,
    )
      .bind(fromIso, toIso)
      .all<GyshPaymentDbRow>();
    d1Payments = (rows.results || []).map(mapDbPayment);
  } catch {
    /* table may be missing until migrate */
  }

  const bySession = new Map<string, GyshPaymentRow>();
  for (const p of d1Payments) bySession.set(p.sessionId, p);
  for (const p of stripePayments) {
    const merged = mergeListedPayment(bySession.get(p.sessionId), p);
    if (merged) bySession.set(p.sessionId, merged);
  }
  const payments = [...bySession.values()].sort((a, b) =>
    a.paidAt < b.paidAt ? 1 : a.paidAt > b.paidAt ? -1 : 0,
  );

  if (stripeError && payments.length === 0) {
    return error(stripeError, 502);
  }

  return json({
    ok: true,
    period: range,
    totals: summarizeGyshPayments(payments),
    payments,
    stripeError,
    mode: secret.startsWith("sk_live_") ? "live" : "test",
  });
}

/** Admin: edit a ledger row (name, email, item, kind, amount, refund, date). Does not create a Stripe refund. */
export async function handleUpdatePayment(
  env: Env,
  request: Request,
  actor: DbUser,
  paymentKey: string,
): Promise<Response> {
  const key = decodeURIComponent(String(paymentKey || "").trim());
  if (!key) return error("Payment id is required.", 400);

  let body: PaymentRowPatchInput;
  try {
    body = (await request.json()) as PaymentRowPatchInput;
  } catch {
    return error("Invalid JSON body.", 400);
  }

  await ensurePaymentsTable(env);
  const existing = await env.DB.prepare(
    `SELECT ${PAYMENT_SELECT} FROM gysh_payments WHERE id = ? OR session_id = ? LIMIT 1`,
  )
    .bind(key, key)
    .first<GyshPaymentDbRow>();
  if (!existing) return error("Payment not found. Refresh the list, then try again.", 404);

  const current = mapDbPayment(existing);
  const parsed = parsePaymentRowPatch(body, {
    amountCents: current.amountCents,
    refundCents: current.refundCents,
    paidAt: current.paidAt,
  });
  if (!parsed.ok) return error(parsed.error, 400);

  const now = new Date().toISOString();
  const refundedAt = parsed.values.refundCents > 0 ? current.refundedAt || now : null;
  const refundSource =
    parsed.values.refundCents > 0 ? (current.refundSource === "stripe" ? "stripe" : "manual") : "";

  await env.DB.prepare(
    `UPDATE gysh_payments
     SET member_name = ?,
         email = ?,
         label = ?,
         kind = ?,
         amount_cents = ?,
         paid_at = ?,
         refund_cents = ?,
         refunded_at = ?,
         refund_source = ?,
         refund_note = ?,
         admin_edited = 1,
         updated_at = ?
     WHERE id = ?`,
  )
    .bind(
      parsed.values.memberName,
      parsed.values.email,
      parsed.values.label,
      parsed.values.kind,
      parsed.values.amountCents,
      parsed.values.paidAt,
      parsed.values.refundCents,
      refundedAt,
      refundSource,
      parsed.values.refundNote,
      now,
      current.id,
    )
    .run();

  try {
    await appendAudit(
      env.DB,
      "payment_updated",
      parsed.values.email || actor.email,
      `${current.sessionId} ${parsed.values.kind} $${(parsed.values.amountCents / 100).toFixed(2)} refund $${(parsed.values.refundCents / 100).toFixed(2)} by ${actor.email}`,
    );
  } catch {
    /* audit is best-effort */
  }

  const updated = await env.DB.prepare(
    `SELECT ${PAYMENT_SELECT} FROM gysh_payments WHERE id = ? LIMIT 1`,
  )
    .bind(current.id)
    .first<GyshPaymentDbRow>();

  return json({
    ok: true,
    payment: mapDbPayment(
      updated || {
        ...existing,
        member_name: parsed.values.memberName,
        email: parsed.values.email,
        label: parsed.values.label,
        kind: parsed.values.kind,
        amount_cents: parsed.values.amountCents,
        paid_at: parsed.values.paidAt,
        refund_cents: parsed.values.refundCents,
        refunded_at: refundedAt,
        refund_source: refundSource,
        refund_note: parsed.values.refundNote,
        admin_edited: 1,
      },
    ),
  });
}

/** Logged-in member: their own Stripe / D1 purchase history (no admin totals). */
export async function handleMyPurchases(env: Env, user: DbUser): Promise<Response> {
  await ensurePaymentsTable(env);
  let membershipTier = String(user.membership_tier || "free").toLowerCase();
  let audience = String(user.audience || "adult").toLowerCase();
  try {
    const { syncMemberEntitlementsFromPurchases } = await import("./member-credits");
    const synced = await syncMemberEntitlementsFromPurchases(env, user);
    membershipTier = synced.membershipTier;
    audience = synced.audience;
  } catch {
    /* entitlements optional */
  }
  const email = canonicalizeEmail(user.email || "");
  let rows: GyshPaymentRow[] = [];
  try {
    const result = await env.DB.prepare(
      `SELECT ${PAYMENT_SELECT}
       FROM gysh_payments
       WHERE user_id = ? OR lower(email) = lower(?)
       ORDER BY paid_at DESC
       LIMIT 100`,
    )
      .bind(user.id, email)
      .all<GyshPaymentDbRow>();
    rows = (result.results || []).map(mapDbPayment);
  } catch {
    rows = [];
  }

  // Defense in depth: never return another member's rows even if the SQL filter drifts.
  rows = filterPaymentsForMember(rows, { userId: user.id, email });

  return json({
    ok: true,
    membershipTier,
    audience,
    purchases: rows.map((p) => ({
      id: p.id,
      sessionId: p.sessionId,
      kind: p.kind,
      tier: p.tier,
      audience: p.audience,
      interval: p.interval,
      label: p.label,
      amountCents: p.amountCents,
      amountUsd: Math.round(p.amountCents) / 100,
      currency: p.currency || "usd",
      paidAt: p.paidAt,
      source: p.source,
    })),
  });
}

