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
  membershipCancelActionForTier,
  type MembershipCancelAction,
} from "../../src/lib/membership-cancel";

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

export async function handleMembershipCancel(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  const dbFail = !env.DB ? error("Database unavailable.", 503) : null;
  if (dbFail) return dbFail;

  let body: { action?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const user = (await getUserById(env.DB, actor.id)) ?? actor;
  const tier = String(user.membership_tier || "free").toLowerCase();
  const inferred = membershipCancelActionForTier(tier);
  const requested = String(body.action || "").trim();
  // Map legacy unsubscribe_disable → deactivate_account
  const normalizedRequested =
    requested === "unsubscribe_disable" ? "deactivate_account" : requested;
  const action: MembershipCancelAction =
    normalizedRequested === "cancel_to_free" || normalizedRequested === "deactivate_account"
      ? (normalizedRequested as MembershipCancelAction)
      : inferred;

  if (action === "cancel_to_free" && !["starter", "pro", "elite"].includes(tier)) {
    return error("You are already on the Free plan.", 400);
  }

  const now = new Date().toISOString();

  if (action === "cancel_to_free") {
    const subId = await readStripeSubscriptionId(env, user);
    if (subId) {
      const canceled = await cancelStripeSubscriptionBestEffort(env, subId);
      if (!canceled.ok) {
        return error(canceled.error || "Could not cancel Stripe subscription.", 502);
      }
    }
    const stamp = `Membership canceled → free ${now}`;
    const prev = String(user.notes || "");
    const notes = `${prev}${prev ? " · " : ""}${stamp}`.slice(0, 1900);
    await ensureStripeSubscriptionColumn(env);
    try {
      await env.DB.prepare(
        `UPDATE users SET membership_tier = ?, stripe_subscription_id = '', notes = ?, updated_at = ? WHERE id = ?`,
      )
        .bind("free", notes, now, user.id)
        .run();
    } catch {
      await env.DB.prepare(
        `UPDATE users SET membership_tier = ?, notes = ?, updated_at = ? WHERE id = ?`,
      )
        .bind("free", notes, now, user.id)
        .run();
    }
    await appendAudit(env.DB, "membership_cancel_to_free", user.email, subId || "no-sub");
    const updated = (await getUserById(env.DB, user.id)) ?? {
      ...user,
      membership_tier: "free",
      notes,
    };
    return json({
      ok: true,
      action: "cancel_to_free",
      message: "Your paid membership is canceled. Your account is now a Free account.",
      user: publicUser(updated),
    });
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
