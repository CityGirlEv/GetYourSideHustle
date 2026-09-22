/**
 * Logged-in member updates name, email, and phone on their own account.
 */
import {
  appendAudit,
  canonicalizeEmail,
  error,
  getUserByEmail,
  getUserById,
  json,
  publicUser,
  requireDb,
  type DbUser,
  type Env,
} from "./auth";
import {
  parseMemberProfileUpdate,
  profileEmailConflictError,
  PROFILE_EMAIL_TAKEN_ERROR,
} from "../../src/lib/member-profile";

/** Another account already using this email (case-insensitive), not the signed-in member. */
export async function findOtherUserIdByEmail(
  db: D1Database,
  email: string,
  actorId: string,
): Promise<string | null> {
  const canonical = canonicalizeEmail(email);
  const selfId = String(actorId || "").trim();
  if (!canonical || !selfId) return null;
  try {
    const row = await db
      .prepare(`SELECT id FROM users WHERE lower(email) = ? AND id != ? LIMIT 1`)
      .bind(canonical, selfId)
      .first<{ id: string }>();
    const id = String(row?.id || "").trim();
    return id || null;
  } catch {
    const byEmail = await getUserByEmail(db, canonical);
    if (byEmail && byEmail.id !== selfId) return byEmail.id;
    return null;
  }
}

export async function ensureUsersPhoneColumn(db: D1Database): Promise<void> {
  try {
    await db
      .prepare(`ALTER TABLE users ADD COLUMN phone TEXT NOT NULL DEFAULT ''`)
      .run();
  } catch {
    /* already present */
  }
}

export async function handleUpdateMemberProfile(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;

  let body: { name?: unknown; email?: unknown; phone?: unknown };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const parsed = parseMemberProfileUpdate(body);
  if (!parsed.ok) return error(parsed.error, 400);
  const { name, email, phone } = parsed.profile;

  await ensureUsersPhoneColumn(env.DB);

  const current = (await getUserById(env.DB, actor.id)) ?? actor;
  const currentEmail = canonicalizeEmail(current.email);
  if (email !== currentEmail) {
    const otherId = await findOtherUserIdByEmail(env.DB, email, actor.id);
    const conflict = profileEmailConflictError({
      actorId: actor.id,
      existingUser: otherId ? { id: otherId } : null,
    });
    if (conflict) return error(conflict, 409);
  }

  const now = new Date().toISOString();
  try {
    await env.DB.prepare(
      `UPDATE users SET name = ?, email = ?, phone = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(name, email, phone, now, actor.id)
      .run();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("UNIQUE") || msg.toLowerCase().includes("unique")) {
      return error(PROFILE_EMAIL_TAKEN_ERROR, 409);
    }
    throw e;
  }

  await appendAudit(env.DB, "profile_update", email, `${actor.id}:${currentEmail}->${email}`).catch(
    () => undefined,
  );

  const updated = await getUserById(env.DB, actor.id);
  const publicUpdated = publicUser(updated ?? { ...current, name, email, phone });

  return json({
    ok: true,
    user: publicUpdated,
    message: "Your profile is saved.",
  });
}
