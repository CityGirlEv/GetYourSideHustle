/**
 * Auth / session helpers for GYSH D1 API.
 */
import {
  canonicalizeEmail,
  clearSessionCookie,
  error,
  hashPassword,
  json,
  parseCookies,
  randomSaltHex,
  randomToken,
  sessionCookie,
  sha256Hex,
  verifyPassword,
} from "./crypto";
import { canAccessAdminPortal, parseRoles, type GyshRole } from "./roles";
// GyshRole used by handleRegister role assignment

export type Env = {
  DB: D1Database;
  /** Cloudflare Pages secret / .dev.vars — never expose to client */
  RESEND_API_KEY?: string;
  /** Optional From override, e.g. `GYSH <noreply@notify.getyoursidehustle.com>` */
  EMAIL_FROM?: string;
  /** Optional contact inbox override (defaults to info@getyoursidehustle.com) */
  CONTACT_TO?: string;
};

export type DbUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  /** JSON array of roles, e.g. `["admin","qa"]`. Null = derive from `role`. */
  roles?: string | null;
  status: string;
  joined_at: string;
  notes: string;
  password_hash: string | null;
  password_salt: string | null;
};

const USER_SELECT =
  `id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt`;

/** Legacy select for DBs where migration 0004 (roles column) has not run yet. */
const USER_SELECT_LEGACY =
  `id, name, email, role, NULL AS roles, status, joined_at, notes, password_hash, password_salt`;

function isMissingRolesColumn(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("no such column") && msg.includes("roles");
}

const SESSION_DAYS = 14;
const MIN_PASSWORD_LENGTH = 5;

export function requireDb(env: Env): Response | null {
  if (!env?.DB) {
    return error("Database unavailable. D1 binding DB is not configured.", 503);
  }
  return null;
}

export function userRoles(u: Pick<DbUser, "role" | "roles">): GyshRole[] {
  return parseRoles(u.role, u.roles);
}

export function publicUser(u: DbUser) {
  const roles = userRoles(u);
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: roles[0] ?? u.role,
    roles,
    status: u.status,
    joinedAt: u.joined_at,
    notes: u.notes,
    canLogin: Boolean(u.password_hash && u.password_salt),
  };
}

export async function getUserByEmail(db: D1Database, email: string): Promise<DbUser | null> {
  const primary = canonicalizeEmail(email);
  try {
    return (
      (await db
        .prepare(`SELECT ${USER_SELECT} FROM users WHERE email = ?`)
        .bind(primary)
        .first<DbUser>()) ?? null
    );
  } catch (e) {
    if (!isMissingRolesColumn(e)) throw e;
    return (
      (await db
        .prepare(`SELECT ${USER_SELECT_LEGACY} FROM users WHERE email = ?`)
        .bind(primary)
        .first<DbUser>()) ?? null
    );
  }
}

export async function getUserById(db: D1Database, id: string): Promise<DbUser | null> {
  try {
    return (
      (await db
        .prepare(`SELECT ${USER_SELECT} FROM users WHERE id = ?`)
        .bind(id)
        .first<DbUser>()) ?? null
    );
  } catch (e) {
    if (!isMissingRolesColumn(e)) throw e;
    return (
      (await db
        .prepare(`SELECT ${USER_SELECT_LEGACY} FROM users WHERE id = ?`)
        .bind(id)
        .first<DbUser>()) ?? null
    );
  }
}

export async function appendAudit(
  db: D1Database,
  action: string,
  email: string,
  detail: string,
): Promise<void> {
  await db
    .prepare(`INSERT INTO audit_events (at, action, email, detail) VALUES (?, ?, ?, ?)`)
    .bind(new Date().toISOString(), action, canonicalizeEmail(email), detail)
    .run();
}

export async function createSession(db: D1Database, userId: string): Promise<{ token: string; cookie: string }> {
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const id = `s-${crypto.randomUUID()}`;
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(id, userId, tokenHash, expires.toISOString(), now.toISOString())
    .run();
  return { token, cookie: sessionCookie(token, SESSION_DAYS * 24 * 60 * 60) };
}

export async function destroySession(db: D1Database, request: Request): Promise<string> {
  const cookies = parseCookies(request.headers.get("cookie"));
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const token = bearer || cookies.gysh_session || "";
  if (token) {
    const tokenHash = await sha256Hex(token);
    await db.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(tokenHash).run();
  }
  return clearSessionCookie();
}

export async function requireSession(
  env: Env,
  request: Request,
): Promise<{ user: DbUser } | Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;

  const cookies = parseCookies(request.headers.get("cookie"));
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const token = bearer || cookies.gysh_session || "";
  if (!token) return error("Not authenticated.", 401);

  const tokenHash = await sha256Hex(token);
  const sessionQuery = (rolesExpr: string) =>
    `SELECT s.user_id, s.expires_at,
            u.id, u.name, u.email, u.role, ${rolesExpr}, u.status, u.joined_at, u.notes, u.password_hash, u.password_salt
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?`;
  let row: (DbUser & { user_id: string; expires_at: string }) | null;
  try {
    row = await env.DB.prepare(sessionQuery("u.roles"))
      .bind(tokenHash)
      .first<DbUser & { user_id: string; expires_at: string }>();
  } catch (e) {
    if (!isMissingRolesColumn(e)) throw e;
    row = await env.DB.prepare(sessionQuery("NULL AS roles"))
      .bind(tokenHash)
      .first<DbUser & { user_id: string; expires_at: string }>();
  }

  if (!row) return error("Session invalid or expired.", 401);
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await env.DB.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(tokenHash).run();
    return error("Session expired.", 401);
  }
  if (row.status !== "active") return error("Account is not active.", 403);

  return {
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      roles: row.roles,
      status: row.status,
      joined_at: row.joined_at,
      notes: row.notes,
      password_hash: row.password_hash,
      password_salt: row.password_salt,
    },
  };
}

/** Admin Studio + partner tooling — admin or QA only. */
export async function requireAdminSession(
  env: Env,
  request: Request,
): Promise<{ user: DbUser } | Response> {
  const auth = await requireSession(env, request);
  if (auth instanceof Response) return auth;
  if (!canAccessAdminPortal(userRoles(auth.user))) {
    return error("Admin access required.", 403);
  }
  return auth;
}

export async function handleLogin(env: Env, request: Request): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;

  // Ensure partner admins exist before auth lookup (idempotent).
  try {
    const { ensurePartnerAdmins } = await import("./partners");
    await ensurePartnerAdmins(env);
  } catch {
    /* table may not exist yet — migrate first */
  }

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return error("Invalid JSON body.");
  }

  const email = canonicalizeEmail(body.email || "");
  const password = String(body.password || "");
  if (!email || !password) {
    await appendAudit(env.DB, "login_failed", email || "(empty)", "missing credentials");
    return error("Email and password are required.", 400);
  }

  const user = await getUserByEmail(env.DB, email);
  if (!user || !user.password_hash || !user.password_salt) {
    await appendAudit(env.DB, "login_failed", email, "unknown account");
    return error("Invalid email or password.", 401);
  }
  if (user.status !== "active") {
    await appendAudit(env.DB, "login_failed", email, "inactive account");
    return error("Invalid email or password.", 401);
  }

  const ok = await verifyPassword(password, user.password_salt, user.password_hash);
  if (!ok) {
    await appendAudit(env.DB, "login_failed", email, "bad password");
    return error("Invalid email or password.", 401);
  }

  const roles = userRoles(user);
  const isAdmin = canAccessAdminPortal(roles);
  const { token, cookie } = await createSession(env.DB, user.id);
  await appendAudit(env.DB, "login_ok", email, isAdmin ? "admin login success" : "member login success");
  return json(
    { ok: true, user: publicUser(user), token, isAdmin },
    200,
    { "set-cookie": cookie },
  );
}

type RegisterAgeGroup = "kids" | "junior" | "adult" | "senior";

/**
 * Public free-account registration for Side Hustle Blueprint unlock.
 * Kids (4–12): parent/guardian email only — creates parent account + child profile (no child email).
 */
export async function handleRegister(env: Env, request: Request): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;

  let body: {
    email?: string;
    password?: string;
    name?: string;
    ageGroup?: RegisterAgeGroup;
    childDisplayName?: string;
    claimToken?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }

  const email = canonicalizeEmail(body.email || "");
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  const ageGroup = (body.ageGroup || "adult") as RegisterAgeGroup;
  const childDisplayName = String(body.childDisplayName || "").trim();
  const claimToken = String(body.claimToken || "").trim();

  if (!email || !email.includes("@")) return error("A valid email is required.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    return error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (!["kids", "junior", "adult", "senior"].includes(ageGroup)) {
    return error("Invalid age group.");
  }
  if (ageGroup === "kids" && !childDisplayName) {
    return error("Enter a first name or nickname for the child (no email needed).");
  }

  const existing = await getUserByEmail(env.DB, email);
  if (existing) return error("An account with that email already exists. Sign in instead.", 409);

  const now = new Date().toISOString();
  const userId = `u-${crypto.randomUUID()}`;
  const salt = randomSaltHex();
  const hash = await hashPassword(password, salt);

  const isParent = ageGroup === "kids";
  const primaryRole: GyshRole =
    ageGroup === "junior" ? "junior" : ageGroup === "senior" ? "senior" : "adult";
  const rolesJson = JSON.stringify([primaryRole]);
  const audience = isParent ? "parent" : ageGroup === "senior" ? "senior" : ageGroup;
  const displayName =
    name ||
    (isParent
      ? "GYSH Parent"
      : ageGroup === "junior"
        ? "GYSH Junior"
        : ageGroup === "senior"
          ? "GYSH Senior"
          : "GYSH Member");

  try {
    await env.DB.prepare(
      `INSERT INTO users (id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt, membership_tier, audience, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, 'free', ?, ?, ?)`,
    )
      .bind(
        userId,
        displayName,
        email,
        primaryRole,
        rolesJson,
        now.slice(0, 10),
        isParent ? "Parent family account (Kids Side Hustle Blueprint)" : "Free GYSH member",
        hash,
        salt,
        audience,
        now,
        now,
      )
      .run();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("no such column")) {
      await env.DB.prepare(
        `INSERT INTO users (id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          userId,
          displayName,
          email,
          primaryRole,
          rolesJson,
          now.slice(0, 10),
          isParent ? "Parent family account (Kids Side Hustle Blueprint)" : "Free GYSH member",
          hash,
          salt,
          now,
          now,
        )
        .run();
    } else if (msg.includes("UNIQUE")) {
      return error("An account with that email already exists. Sign in instead.", 409);
    } else {
      throw e;
    }
  }

  let childProfileId: string | null = null;
  if (isParent) {
    try {
      const familyId = `fam-${crypto.randomUUID()}`;
      childProfileId = `child-${crypto.randomUUID()}`;
      await env.DB.prepare(
        `INSERT INTO family_accounts (id, parent_user_id, display_name, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
        .bind(familyId, userId, `${displayName} Family`, now, now)
        .run();
      await env.DB.prepare(
        `INSERT INTO child_profiles (id, family_id, parent_user_id, display_name, age_band, contact_email, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'kids', NULL, ?, ?)`,
      )
        .bind(childProfileId, familyId, userId, childDisplayName, now, now)
        .run();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("no such table")) throw e;
      /* migration 0016 not applied yet — account still usable */
      childProfileId = null;
    }
  }

  const user = await getUserByEmail(env.DB, email);
  if (!user) return error("Registration failed.", 500);

  const { token, cookie } = await createSession(env.DB, userId);
  await appendAudit(env.DB, "register_ok", email, `free register · ${ageGroup}`);

  let claimedBlueprintId: string | null = null;
  if (claimToken) {
    try {
      const { claimPendingBlueprintForUser } = await import("./blueprints");
      const claimed = await claimPendingBlueprintForUser(env, userId, claimToken, {
        childProfileId,
        ageGroup,
      });
      claimedBlueprintId = claimed?.id ?? null;
    } catch {
      /* claim is best-effort; client can retry */
    }
  }

  return json(
    {
      ok: true,
      user: publicUser(user),
      token,
      isAdmin: false,
      childProfileId,
      claimedBlueprintId,
    },
    201,
    { "set-cookie": cookie },
  );
}

export async function handleLogout(env: Env, request: Request): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;
  const cookie = await destroySession(env.DB, request);
  return json({ ok: true }, 200, { "set-cookie": cookie });
}

export async function handleMe(env: Env, request: Request): Promise<Response> {
  const auth = await requireSession(env, request);
  if (auth instanceof Response) return auth;
  return json({ user: publicUser(auth.user) });
}

export async function handleResetPassword(env: Env, request: Request): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;

  let body: {
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const email = canonicalizeEmail(body.email || "");
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  const confirmPassword = String(body.confirmPassword || "");

  if (!email || !currentPassword || !newPassword || !confirmPassword) {
    return error("All fields are required.");
  }

  const user = await getUserByEmail(env.DB, email);
  if (!user || !user.password_hash || !user.password_salt) {
    return error("No account found for that email.");
  }

  const ok = await verifyPassword(currentPassword, user.password_salt, user.password_hash);
  if (!ok) {
    await appendAudit(env.DB, "password_reset", email, "failed: current password incorrect");
    return error("Current password is incorrect.");
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return error(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (newPassword !== confirmPassword) {
    return error("New passwords do not match.");
  }
  if (newPassword === currentPassword) {
    return error("New password must be different from the current password.");
  }

  const salt = randomSaltHex();
  const hash = await hashPassword(newPassword, salt);
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?`,
  )
    .bind(hash, salt, now, user.id)
    .run();
  await env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(user.id).run();
  await appendAudit(env.DB, "password_reset", email, "password updated on screen");

  let emailSent = false;
  try {
    const { sendPasswordChangedNotice } = await import("./email");
    emailSent = await sendPasswordChangedNotice(env, email, user.name);
  } catch (e) {
    await appendAudit(
      env.DB,
      "password_reset_email_failed",
      email,
      e instanceof Error ? e.message : String(e),
    );
  }

  return json({
    ok: true,
    message: emailSent
      ? "Password updated. A confirmation email was sent. Sign in with your new password."
      : "Password updated. Sign in with your new password.",
    emailSent,
  });
}

export { json, error, MIN_PASSWORD_LENGTH, hashPassword, randomSaltHex, canonicalizeEmail };
