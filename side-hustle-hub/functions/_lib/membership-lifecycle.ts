/**
 * Daily membership lifecycle: Stripe charge check, founding Free revert,
 * and week-before renewal reminder emails.
 */
import { appendAudit, type Env } from "./auth";
import { emailConfigured, sendResendEmail } from "./email";
import { stripeSecret, stripeRequest } from "./stripe";
import { membershipTierDisplayName } from "../../src/lib/membership-email-copy";
import {
  addMembershipTerm,
  foundingComplimentaryExpiresOn,
  isoDay,
  isFoundingComplimentaryMember,
  membershipChargeStatus,
  shouldRevertExpiredMembership,
  shouldSendMembershipRenewalReminder,
  stripeSubscriptionLooksPaid,
  stripeSubscriptionShouldDrop,
} from "../../src/lib/membership-expiry";
import { MEMBERSHIP_COMMITMENT_MONTHS } from "../../src/lib/membership-commitment-billing";
import { SITE_URL } from "./email-brand";

type LifecycleRow = {
  id: string;
  name: string;
  email: string;
  notes: string;
  membership_tier: string | null;
  stripe_subscription_id?: string | null;
  membership_expires_at?: string | null;
  membership_last_paid_at?: string | null;
  membership_renewal_reminded_for?: string | null;
};

type StripeSubscription = {
  id?: string;
  status?: string;
  current_period_end?: number;
  items?: { data?: Array<{ current_period_end?: number }> };
};

function unixToIsoDay(unix: number | undefined): string | null {
  const n = Number(unix || 0);
  if (!Number.isFinite(n) || n <= 0) return null;
  return isoDay(n > 1e12 ? n : n * 1000);
}

function periodEndDay(sub: StripeSubscription): string | null {
  return unixToIsoDay(sub.items?.data?.[0]?.current_period_end) ?? unixToIsoDay(sub.current_period_end);
}

export async function ensureMembershipBillingColumns(env: Env): Promise<void> {
  const info = await env.DB.prepare(`PRAGMA table_info(users)`).all<{ name: string }>();
  const cols = new Set((info.results ?? []).map((r) => r.name));
  const add = async (name: string, ddl: string) => {
    if (cols.has(name)) return;
    try {
      await env.DB.prepare(ddl).run();
      cols.add(name);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes("duplicate column")) return;
      throw e;
    }
  };
  await add(
    "membership_expires_at",
    `ALTER TABLE users ADD COLUMN membership_expires_at TEXT NOT NULL DEFAULT ''`,
  );
  await add(
    "membership_last_paid_at",
    `ALTER TABLE users ADD COLUMN membership_last_paid_at TEXT NOT NULL DEFAULT ''`,
  );
  await add(
    "membership_renewal_reminded_for",
    `ALTER TABLE users ADD COLUMN membership_renewal_reminded_for TEXT NOT NULL DEFAULT ''`,
  );
}

export async function stampPaidMembershipTerm(
  env: Env,
  userId: string,
  opts: { interval?: "month" | "year"; paidAt?: string },
): Promise<void> {
  await ensureMembershipBillingColumns(env);
  const paidAt = opts.paidAt || new Date().toISOString();
  const interval = opts.interval === "year" ? "year" : "month";
  const expires = addMembershipTerm(isoDay(paidAt) || paidAt, interval);
  try {
    await env.DB.prepare(
      `UPDATE users
       SET membership_expires_at = ?, membership_last_paid_at = ?, membership_renewal_reminded_for = '', updated_at = ?
       WHERE id = ?`,
    )
      .bind(expires, paidAt, new Date().toISOString(), userId)
      .run();
  } catch {
    /* column missing on a replica — ensure already ran */
  }
}

async function fetchStripeSubscription(
  secret: string,
  subscriptionId: string,
): Promise<StripeSubscription | null> {
  const result = await stripeRequest<StripeSubscription>(
    secret,
    "GET",
    `subscriptions/${encodeURIComponent(subscriptionId)}`,
    { "expand[0]": "items.data" },
  );
  if (!result.ok) return null;
  return result.data;
}

async function revertMemberToFree(
  env: Env,
  row: LifecycleRow,
  reason: string,
): Promise<void> {
  const now = new Date().toISOString();
  const prev = String(row.notes || "").trim();
  const stamp = `${reason} ${now}`;
  const notes = `${prev}${prev ? " · " : ""}${stamp}`.slice(0, 1900);
  await env.DB.prepare(
    `UPDATE users
     SET membership_tier = 'free',
         notes = ?,
         membership_expires_at = '',
         membership_renewal_reminded_for = '',
         updated_at = ?
     WHERE id = ?`,
  )
    .bind(notes, now, row.id)
    .run();
  await appendAudit(env.DB, "membership_expired", row.email, reason);
}

async function sendRenewalReminder(env: Env, row: LifecycleRow, expiresOn: string): Promise<boolean> {
  if (!emailConfigured(env)) return false;
  const complimentary = isFoundingComplimentaryMember(row.notes);
  const charge = membershipChargeStatus({
    membershipTier: row.membership_tier,
    notes: row.notes,
    lastPaidAt: row.membership_last_paid_at,
  });
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, "membership_renewal_reminder", {
    name: row.name || "Side Hustler",
    tier: membershipTierDisplayName(row.membership_tier),
    expiresOn,
    chargeLine: complimentary
      ? `Your complimentary Starter ends on ${expiresOn}. After that you’ll be on Free unless you subscribe.`
      : `Stripe will attempt your every-${MEMBERSHIP_COMMITMENT_MONTHS}-month membership charge around ${expiresOn}. ${charge.label}.`,
    ctaUrl: `${SITE_URL}/join`,
  });
  if (!rendered) return false;
  await sendResendEmail(env, {
    to: row.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    templateSlug: "membership_renewal_reminder",
    userId: row.id,
    meta: { expiresOn, complimentary },
  });
  await env.DB.prepare(
    `UPDATE users SET membership_renewal_reminded_for = ?, updated_at = ? WHERE id = ?`,
  )
    .bind(expiresOn, new Date().toISOString(), row.id)
    .run();
  return true;
}

export async function runMembershipLifecycle(env: Env, todayIso?: string): Promise<{
  reminders: number;
  reverted: number;
  stripeSynced: number;
}> {
  await ensureMembershipBillingColumns(env);
  const today = isoDay(todayIso) || new Date().toISOString().slice(0, 10);
  let reminders = 0;
  let reverted = 0;
  let stripeSynced = 0;

  let rows: LifecycleRow[] = [];
  try {
    const q = await env.DB.prepare(
      `SELECT id, name, email, notes, membership_tier,
              COALESCE(stripe_subscription_id, '') AS stripe_subscription_id,
              COALESCE(membership_expires_at, '') AS membership_expires_at,
              COALESCE(membership_last_paid_at, '') AS membership_last_paid_at,
              COALESCE(membership_renewal_reminded_for, '') AS membership_renewal_reminded_for
       FROM users
       WHERE LOWER(COALESCE(status, '')) != 'deleted'
         AND LOWER(COALESCE(membership_tier, 'free')) IN ('starter', 'pro', 'elite')`,
    ).all<LifecycleRow>();
    rows = q.results ?? [];
  } catch {
    return { reminders, reverted, stripeSynced };
  }

  const secret = stripeSecret(env);

  for (const row of rows) {
    const subId = String(row.stripe_subscription_id || "").trim();
    if (subId && secret) {
      const sub = await fetchStripeSubscription(secret, subId);
      if (sub) {
        stripeSynced += 1;
        if (stripeSubscriptionShouldDrop(sub.status)) {
          await revertMemberToFree(
            env,
            row,
            `Stripe subscription ${sub.status || "ended"} — membership reverted to Free`,
          );
          reverted += 1;
          continue;
        }
        if (stripeSubscriptionLooksPaid(sub.status)) {
          const expires = periodEndDay(sub);
          const paidAt = row.membership_last_paid_at || new Date().toISOString();
          if (expires) {
            await env.DB.prepare(
              `UPDATE users SET membership_expires_at = ?, membership_last_paid_at = ?, updated_at = ? WHERE id = ?`,
            )
              .bind(expires, paidAt, new Date().toISOString(), row.id)
              .run();
            row.membership_expires_at = expires;
          }
        }
      }
    }

    const complimentary = isFoundingComplimentaryMember(row.notes);
    if (!isoDay(row.membership_expires_at) && complimentary) {
      const exp = foundingComplimentaryExpiresOn(row.notes);
      if (exp) {
        await env.DB.prepare(
          `UPDATE users SET membership_expires_at = ?, updated_at = ? WHERE id = ?`,
        )
          .bind(exp, new Date().toISOString(), row.id)
          .run();
        row.membership_expires_at = exp;
      }
    }

    const expiresOn = isoDay(row.membership_expires_at);
    if (
      shouldSendMembershipRenewalReminder({
        expiresOn,
        today,
        alreadyRemindedFor: row.membership_renewal_reminded_for,
        membershipTier: row.membership_tier,
      })
    ) {
      try {
        if (await sendRenewalReminder(env, row, expiresOn!)) reminders += 1;
      } catch {
        /* keep scanning */
      }
    }

    const noStripe = !subId;
    if (
      (complimentary || noStripe) &&
      shouldRevertExpiredMembership({
        membershipTier: row.membership_tier,
        expiresOn,
        today,
      })
    ) {
      await revertMemberToFree(
        env,
        row,
        complimentary
          ? "Complimentary Starter window ended — reverted to Free"
          : "Membership expiration reached with no active Stripe subscription — reverted to Free",
      );
      reverted += 1;
    }
  }

  return { reminders, reverted, stripeSynced };
}
