/**
 * Member cancels paid plan (→ Free) or deactivates account (soft-delete + linked kids).
 */
import {
  appendAudit,
  error,
  getUserById,
  json,
  publicUser,
  type DbUser,
  type Env,
} from "./auth";
import { softDeleteUserRecord } from "./data";
import { requireStripeSecret, stripeRequest } from "./stripe";
import {
  formatMembershipBillingDay,
  membershipDowngradeChargeLabel,
  membershipDowngradeNotice,
  membershipCancelActionForTier,
  normalizeMembershipTierId,
  type MembershipCancelAction,
} from "../../src/lib/membership-cancel";
import { MEMBERSHIP_TIERS, TIER_LADDER, type TierId } from "../../src/lib/membership";
import { STRIPE_CATALOG } from "./stripe-catalog.generated";
import { ensureMembershipBillingColumns } from "./membership-lifecycle";

async function ensureStripeSubscriptionColumn(env: Env): Promise<void> {
  try {
    await env.DB.prepare(
      `ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT NOT NULL DEFAULT ''`,
    ).run();
  } catch {
    /* already present */
  }
}

export async function setUserStripeSubscriptionId(
  env: Env,
  userId: string,
  subscriptionId: string,
): Promise<void> {
  await ensureStripeSubscriptionColumn(env);
  const id = String(subscriptionId || "").trim();
  await env.DB.prepare(
    `UPDATE users SET stripe_subscription_id = ?, updated_at = ? WHERE id = ?`,
  )
    .bind(id, new Date().toISOString(), userId)
    .run();
}

async function readStripeSubscriptionId(env: Env, user: DbUser): Promise<string> {
  await ensureStripeSubscriptionColumn(env);
  try {
    const row = await env.DB.prepare(
      `SELECT stripe_subscription_id FROM users WHERE id = ?`,
    )
      .bind(user.id)
      .first<{ stripe_subscription_id?: string | null }>();
    return String(row?.stripe_subscription_id || "").trim();
  } catch {
    return "";
  }
}

export async function cancelStripeSubscriptionBestEffort(
  env: Env,
  subscriptionId: string,
): Promise<{ ok: boolean; error?: string }> {
  const id = String(subscriptionId || "").trim();
  if (!id.startsWith("sub_")) return { ok: true };
  const secret = requireStripeSecret(env);
  if (secret instanceof Response) {
    return { ok: false, error: "Stripe is not configured." };
  }
  const result = await stripeRequest<{ id?: string; status?: string }>(
    secret,
    "DELETE",
    `subscriptions/${encodeURIComponent(id)}`,
  );
  if (!result.ok) {
    if (/No such subscription|already been canceled|resource_missing/i.test(result.error)) {
      return { ok: true };
    }
    return { ok: false, error: result.error };
  }
  return { ok: true };
}

/** Linked kid/teen login user ids for a parent (users.parent_user_id + child_profiles.linked_user_id). */
export async function listLinkedKidUserIds(env: Env, parentUserId: string): Promise<string[]> {
  const parentId = String(parentUserId || "").trim();
  if (!parentId) return [];
  const seen = new Set<string>();
  try {
    const { results } = await env.DB.prepare(
      `SELECT id FROM users WHERE parent_user_id = ?`,
    )
      .bind(parentId)
      .all<{ id: string }>();
    for (const row of results ?? []) {
      const id = String(row.id || "").trim();
      if (id) seen.add(id);
    }
  } catch {
    /* older schema */
  }
  try {
    const { results } = await env.DB.prepare(
      `SELECT linked_user_id AS id FROM child_profiles
       WHERE parent_user_id = ? AND linked_user_id IS NOT NULL AND TRIM(linked_user_id) != ''`,
    )
      .bind(parentId)
      .all<{ id: string }>();
    for (const row of results ?? []) {
      const id = String(row.id || "").trim();
      if (id) seen.add(id);
    }
  } catch {
    /* older schema */
  }
  return [...seen];
}

async function readMemberAudience(env: Env, userId: string): Promise<string> {
  try {
    const row = await env.DB.prepare(`SELECT audience FROM users WHERE id = ?`)
      .bind(userId)
      .first<{ audience?: string | null }>();
    return String(row?.audience || "adult").toLowerCase();
  } catch {
    return "adult";
  }
}

type StripeSubItem = {
  id?: string;
  current_period_end?: number;
  price?: { recurring?: { interval?: string } };
};

/** Keep the current plan until period end, then Stripe bills the lower price (or stops). */
async function scheduleDowngrade(env: Env, user: DbUser, nextTier: TierId): Promise<Response> {
  await ensureMembershipBillingColumns(env);
  const now = new Date().toISOString();
  const current = normalizeMembershipTierId(user.membership_tier);
  const audience = await readMemberAudience(env, user.id);
  const subId = await readStripeSubscriptionId(env, user);
  let effectiveOn: string | null = null;
  let interval: "month" | "year" = "month";

  if (subId.startsWith("sub_")) {
    const secret = requireStripeSecret(env);
    if (secret instanceof Response) return error("Stripe is not configured.", 503);
    const loaded = await stripeRequest<{
      current_period_end?: number;
      items?: { data?: StripeSubItem[] };
    }>(secret, "GET", `subscriptions/${encodeURIComponent(subId)}`, {
      "expand[0]": "items.data.price",
    });
    if (!loaded.ok) {
      return error(loaded.error || "Could not load your Stripe subscription.", 502);
    }
    const item = loaded.data.items?.data?.[0];
    interval = item?.price?.recurring?.interval === "year" ? "year" : "month";
    const endUnix = Number(item?.current_period_end || loaded.data.current_period_end || 0);
    if (Number.isFinite(endUnix) && endUnix > 0) {
      effectiveOn = new Date(endUnix * 1000).toISOString().slice(0, 10);
    }
    if (nextTier === "free") {
      const canceled = await stripeRequest(secret, "POST", `subscriptions/${encodeURIComponent(subId)}`, {
        cancel_at_period_end: "true",
      });
      if (!canceled.ok) {
        return error(canceled.error || "Could not schedule the Stripe cancellation.", 502);
      }
    } else if (audience === "adult" || audience === "senior") {
      const audienceKey = audience === "senior" ? "senior" : "adult";
      const price = STRIPE_CATALOG.memberships[nextTier]?.[audienceKey]?.[interval];
      if (!price?.priceId || !item?.id) {
        return error("Stripe price for that plan is not configured.", 400);
      }
      const swapped = await stripeRequest(secret, "POST", `subscriptions/${encodeURIComponent(subId)}`, {
        "items[0][id]": item.id,
        "items[0][price]": price.priceId,
        proration_behavior: "none",
        cancel_at_period_end: "false",
      });
      if (!swapped.ok) {
        return error(swapped.error || "Could not schedule the new Stripe price.", 502);
      }
    }
  } else {
    try {
      const row = await env.DB.prepare(`SELECT membership_expires_at FROM users WHERE id = ?`)
        .bind(user.id)
        .first<{ membership_expires_at?: string | null }>();
      const day = String(row?.membership_expires_at || "").slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(day)) effectiveOn = day;
    } catch {
      /* no expiry column yet */
    }
  }

  const currentName = MEMBERSHIP_TIERS.find((row) => row.id === current)?.name || "your current plan";
  const nextName = MEMBERSHIP_TIERS.find((row) => row.id === nextTier)?.name || nextTier;
  const message = membershipDowngradeNotice({
    currentName,
    nextName,
    nextTier,
    chargeLabel: membershipDowngradeChargeLabel({ nextTier, audience, interval }),
    effectiveOn: formatMembershipBillingDay(effectiveOn),
  });
  const stamp = `Downgrade scheduled → ${nextTier} on ${effectiveOn || "next cycle"} ${now}`;
  const prev = String(user.notes || "");
  const notes = `${prev}${prev ? " · " : ""}${stamp}`.slice(0, 1900);
  await env.DB.prepare(
    `UPDATE users
     SET notes = ?, membership_pending_tier = ?, membership_pending_effective_at = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(notes, nextTier, effectiveOn || "", now, user.id)
    .run();
  await appendAudit(env.DB, "membership_downgrade_scheduled", user.email, `${current}→${nextTier} ${effectiveOn || "next-cycle"}`);
  const updated = (await getUserById(env.DB, user.id)) ?? user;
  return json({
    ok: true,
    action: nextTier === "free" ? "cancel_to_free" : "schedule_downgrade",
    message,
    effectiveOn,
    scheduledTier: nextTier,
    user: publicUser(updated),
  });
}

export async function handleMembershipCancel(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  const dbFail = !env.DB ? error("Database unavailable.", 503) : null;
  if (dbFail) return dbFail;

  let body: { action?: string; tier?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const user = (await getUserById(env.DB, actor.id)) ?? actor;
  const tier = String(user.membership_tier || "free").toLowerCase();
  const inferred = membershipCancelActionForTier(tier);
  const requested = String(body.action || "").trim();
  const normalizedRequested =
    requested === "unsubscribe_disable" ? "deactivate_account" : requested;
  const action: MembershipCancelAction | "schedule_downgrade" =
    normalizedRequested === "cancel_to_free" ||
    normalizedRequested === "deactivate_account" ||
    normalizedRequested === "schedule_downgrade"
      ? (normalizedRequested as MembershipCancelAction | "schedule_downgrade")
      : inferred;

  const requestedTier = normalizeMembershipTierId(body.tier);
  const nextTier =
    action === "schedule_downgrade" ? requestedTier : action === "cancel_to_free" ? "free" : null;

  if (nextTier) {
    const currentIdx = TIER_LADDER.indexOf(normalizeMembershipTierId(tier));
    const nextIdx = TIER_LADDER.indexOf(nextTier);
    if (currentIdx <= 0) return error("You are already on the Free plan.", 400);
    if (nextIdx < 0 || nextIdx >= currentIdx) {
      return error("Choose a lower plan to schedule a downgrade.", 400);
    }
    return scheduleDowngrade(env, user, nextTier);
  }

  // deactivate_account — soft-delete self + linked kids
  const subId = await readStripeSubscriptionId(env, user);
  if (subId) {
    await cancelStripeSubscriptionBestEffort(env, subId);
  }

  const kidIds = await listLinkedKidUserIds(env, user.id);
  const deletedKids: string[] = [];
  for (const kidId of kidIds) {
    if (kidId === user.id) continue;
    const kid = await getUserById(env.DB, kidId);
    if (!kid) continue;
    const kidResult = await softDeleteUserRecord(env, kid, user);
    if (kidResult.ok) deletedKids.push(kidId);
  }

  const selfResult = await softDeleteUserRecord(env, user, user);
  if (!selfResult.ok) {
    return error(selfResult.message, 500);
  }

  await appendAudit(
    env.DB,
    "membership_deactivate_soft_delete",
    user.email,
    `self-service soft-delete · kids=${deletedKids.length}`,
  );

  return json({
    ok: true,
    action: "deactivate_account",
    message:
      deletedKids.length > 0
        ? `Your account was soft-deleted, along with ${deletedKids.length} linked kid account${deletedKids.length === 1 ? "" : "s"}. You are signed out.`
        : "Your account was soft-deleted. You are signed out.",
    loggedOut: true,
    deletedKidCount: deletedKids.length,
  });
}
