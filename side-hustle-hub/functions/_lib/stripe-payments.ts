/**
 * GYSH payments ledger + Stripe Checkout session reports for Financials.
 */
import { canonicalizeEmail, error, json, type DbUser, type Env } from "./auth";
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
    const every = input.interval === "year" ? "yearly" : "monthly";
    return `${tier} · ${lane} · ${every}`;
  }
  if (input.kind === "alacarte") return input.item ? `A-la-carte · ${input.item}` : "A-la-carte";
  if (input.kind === "credit_pack") return input.item ? `Credit pack · ${input.item}` : "Credit pack";
  return input.kind || "Payment";
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
  const id = `pay-${input.sessionId}`;
  await env.DB.prepare(
    `INSERT INTO gysh_payments (
       id, session_id, payment_intent_id, email, user_id, kind, tier, audience, interval,
       label, amount_cents, currency, paid_at, source, meta_json, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(session_id) DO UPDATE SET
       payment_intent_id = excluded.payment_intent_id,
       email = excluded.email,
       user_id = COALESCE(excluded.user_id, gysh_payments.user_id),
       kind = excluded.kind,
       tier = excluded.tier,
       audience = excluded.audience,
       interval = excluded.interval,
       label = excluded.label,
       amount_cents = excluded.amount_cents,
       currency = excluded.currency,
       paid_at = excluded.paid_at,
       source = excluded.source,
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
  const email = String(meta.gysh_email || session.customer_email || "").toLowerCase();
  const amountCents = Number(session.amount_total || 0);
  const paidAt = session.created
    ? new Date(session.created * 1000).toISOString()
    : new Date().toISOString();
  return {
    id: `pay-${session.id}`,
    sessionId: session.id,
    paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
    email,
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
  };
}

function summarize(payments: GyshPaymentRow[]) {
  const byKind: Record<string, { count: number; amountCents: number }> = {};
  let amountCents = 0;
  for (const p of payments) {
    amountCents += p.amountCents;
    const bucket = byKind[p.kind] || { count: 0, amountCents: 0 };
    bucket.count += 1;
    bucket.amountCents += p.amountCents;
    byKind[p.kind] = bucket;
  }
  return {
    count: payments.length,
    amountCents,
    amountUsd: Math.round(amountCents) / 100,
    byKind: Object.fromEntries(
      Object.entries(byKind).map(([k, v]) => [
        k,
        { count: v.count, amountCents: v.amountCents, amountUsd: Math.round(v.amountCents) / 100 },
      ]),
    ),
  };
}

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
      `SELECT id, session_id, payment_intent_id, email, user_id, kind, tier, audience, interval,
              label, amount_cents, currency, paid_at, source
       FROM gysh_payments
       WHERE paid_at >= ? AND paid_at <= ?
       ORDER BY paid_at DESC`,
    )
      .bind(fromIso, toIso)
      .all<{
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
      }>();
    d1Payments = (rows.results || []).map((r) => ({
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
    }));
  } catch {
    /* table may be missing until migrate */
  }

  const bySession = new Map<string, GyshPaymentRow>();
  for (const p of d1Payments) bySession.set(p.sessionId, p);
  for (const p of stripePayments) bySession.set(p.sessionId, p);
  const payments = [...bySession.values()].sort((a, b) =>
    a.paidAt < b.paidAt ? 1 : a.paidAt > b.paidAt ? -1 : 0,
  );

  if (stripeError && payments.length === 0) {
    return error(stripeError, 502);
  }

  return json({
    ok: true,
    period: range,
    totals: summarize(payments),
    payments,
    stripeError,
    mode: secret.startsWith("sk_live_") ? "live" : "test",
  });
}

/** Logged-in member: their own Stripe / D1 purchase history (no admin totals). */
export async function handleMyPurchases(env: Env, user: DbUser): Promise<Response> {
  await ensurePaymentsTable(env);
  const email = canonicalizeEmail(user.email || "");
  let rows: GyshPaymentRow[] = [];
  try {
    const result = await env.DB.prepare(
      `SELECT id, session_id, payment_intent_id, email, user_id, kind, tier, audience, interval,
              label, amount_cents, currency, paid_at, source
       FROM gysh_payments
       WHERE user_id = ? OR lower(email) = lower(?)
       ORDER BY paid_at DESC
       LIMIT 100`,
    )
      .bind(user.id, email)
      .all<{
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
      }>();
    rows = (result.results || []).map((r) => ({
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
    }));
  } catch {
    rows = [];
  }

  // Defense in depth: never return another member's rows even if the SQL filter drifts.
  rows = filterPaymentsForMember(rows, { userId: user.id, email });

  return json({
    ok: true,
    membershipTier: String(user.membership_tier || "free").toLowerCase(),
    audience: String(user.audience || "adult").toLowerCase(),
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

