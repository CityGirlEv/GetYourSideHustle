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
  /** Optional From override, e.g. `GYSH <noreply@getyoursidehustle.com>` */
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
import { MIN_PASSWORD_LENGTH, passwordPolicyError } from "./password-policy";

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
    await appendAudit(env.DB, "login_failed", email, `inactive account · ${user.status}`);
    if (user.status === "pending") {
      return error(
        "Your account is awaiting admin activation. Check your email for confirmation — you'll get a welcome message when you're cleared to sign in.",
        403,
      );
    }
    if (user.status === "disabled") {
      return error("This account has been deactivated. Contact info@getyoursidehustle.com if you need help.", 403);
    }
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
    membershipTier?: string;
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
  const requestedTier = String(body.membershipTier || "free").toLowerCase();
  const membershipTier = ["free", "starter", "pro", "elite"].includes(requestedTier)
    ? requestedTier
    : "free";

  if (!email || !email.includes("@")) return error("A valid email is required.");
  {
    const pwErr = passwordPolicyError(password);
    if (pwErr) return error(pwErr);
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

  const notes =
    membershipTier === "free"
      ? isParent
        ? "Parent family account (Kids Side Hustle Blueprint)"
        : "Free GYSH member"
      : `Requested ${membershipTier} plan · demo checkout pending real Stripe · ${ageGroup}`;

  // New members start pending — admins must activate before login.
  // Store requested tier; paid activation still happens after admin review (demo checkout is client-side).
  try {
    await env.DB.prepare(
      `INSERT INTO users (id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt, membership_tier, audience, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        userId,
        displayName,
        email,
        primaryRole,
        rolesJson,
        now.slice(0, 10),
        notes,
        hash,
        salt,
        membershipTier,
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
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          userId,
          displayName,
          email,
          primaryRole,
          rolesJson,
          now.slice(0, 10),
          notes,
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

  await appendAudit(
    env.DB,
    "register_ok",
    email,
    `${membershipTier} register pending · ${ageGroup}`,
  );

  // Keep pending Blueprint claimable after admin activation
  if (claimToken) {
    try {
      const { claimPendingBlueprintForUser } = await import("./blueprints");
      await claimPendingBlueprintForUser(env, userId, claimToken, {
        childProfileId,
        ageGroup,
      });
    } catch {
      /* claim is best-effort; client can retry after activation */
    }
  }

  let emailSent = false;
  try {
    const { sendRegistrationConfirmation } = await import("./email");
    emailSent = await sendRegistrationConfirmation(env, {
      id: user.id,
      email: user.email,
      name: user.name,
      audience: String(audience),
      membership_tier: membershipTier,
    });
  } catch {
    emailSent = false;
  }

  return json(
    {
      ok: true,
      pendingActivation: true,
      emailSent,
      membershipTier,
      user: publicUser(user),
      token: null,
      isAdmin: false,
      childProfileId,
      claimedBlueprintId: null,
      message:
        membershipTier === "free"
          ? "Account created and awaiting admin activation. Check your email for confirmation — we'll send a welcome with your perks once you're activated."
          : `Account created for the ${membershipTier} plan and awaiting admin activation. Demo checkout may follow — real billing will replace it later.`,
    },
    201,
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

const RESET_TOKEN_HOURS = 1;

async function ensurePasswordResetTable(db: D1Database): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        used_at TEXT,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
}

function publicBaseUrl(request: Request): string {
  const origin = (request.headers.get("origin") || "").replace(/\/$/, "");
  if (
    origin &&
    (origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin.includes("getyoursidehustle.com") ||
      origin.includes("pages.dev"))
  ) {
    return origin;
  }
  return "https://getyoursidehustle.com";
}

/** Forgot password: email → check account → send Resend reset link. */
export async function handleForgotPassword(env: Env, request: Request): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;

  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return error("Invalid JSON body.");
  }

  const email = canonicalizeEmail(body.email || "");
  if (!email || !email.includes("@")) {
    return error("Enter the email address for your GYSH account.");
  }

  const { emailConfigured, sendPasswordResetEmail, EmailSendError } = await import("./email");
  if (!emailConfigured(env)) {
    return error(
      "Password reset email is not available right now (Resend is not configured on the server). Contact info@getyoursidehustle.com.",
      503,
    );
  }

  const user = await getUserByEmail(env.DB, email);
  if (!user) {
    await appendAudit(env.DB, "password_forgot", email, "no account");
    return error("No GYSH account found for that email.");
  }
  if (!user.password_hash || !user.password_salt) {
    await appendAudit(env.DB, "password_forgot", email, "no login password on account");
    return error(
      "This account does not have a login password yet. Contact info@getyoursidehustle.com for help.",
    );
  }
  if (user.status === "pending") {
    return error(
      "Your account is still awaiting admin activation. You can reset your password after you're activated.",
      403,
    );
  }
  if (user.status === "disabled") {
    return error(
      "This account has been deactivated. Contact info@getyoursidehustle.com if you need help.",
      403,
    );
  }
  if (user.status !== "active") {
    return error("No active GYSH account found for that email.");
  }

  await ensurePasswordResetTable(env.DB);
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const now = new Date();
  const expires = new Date(now.getTime() + RESET_TOKEN_HOURS * 60 * 60 * 1000);
  const id = `prt-${crypto.randomUUID()}`;

  // Invalidate prior unused tokens for this user
  await env.DB.prepare(
    `UPDATE password_reset_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL`,
  )
    .bind(now.toISOString(), user.id)
    .run();

  await env.DB.prepare(
    `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at)
     VALUES (?, ?, ?, ?, NULL, ?)`,
  )
    .bind(id, user.id, tokenHash, expires.toISOString(), now.toISOString())
    .run();

  const resetUrl = `${publicBaseUrl(request)}/?reset=${encodeURIComponent(token)}`;

  try {
    await sendPasswordResetEmail(env, {
      to: email,
      name: user.name,
      resetUrl,
      userId: user.id,
    });
  } catch (e) {
    const msg = e instanceof EmailSendError ? e.message : e instanceof Error ? e.message : String(e);
    await appendAudit(env.DB, "password_forgot_email_failed", email, msg);
    return error(`Could not send the reset email: ${msg}`, 502);
  }

  await appendAudit(env.DB, "password_forgot", email, "reset link emailed");
  return json({
    ok: true,
    message:
      "We found your account and emailed a password reset link. Check your inbox (and spam) — the link expires in 1 hour.",
  });
}

/** Complete forgot-password flow with emailed token + new password. */
export async function handleConfirmPasswordReset(env: Env, request: Request): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;

  let body: { token?: string; newPassword?: string; confirmPassword?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }

  const token = String(body.token || "").trim();
  const newPassword = String(body.newPassword || "");
  const confirmPassword = String(body.confirmPassword || "");

  if (!token) return error("Reset link is missing or invalid.");
  if (!newPassword || !confirmPassword) return error("Enter and confirm your new password.");
  if (newPassword !== confirmPassword) return error("New passwords do not match.");
  {
    const pwErr = passwordPolicyError(newPassword);
    if (pwErr) return error(pwErr);
  }

  await ensurePasswordResetTable(env.DB);
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ?`,
  )
    .bind(tokenHash)
    .first<{ id: string; user_id: string; expires_at: string; used_at: string | null }>();

  if (!row) return error("This reset link is invalid or has already been used.");
  if (row.used_at) return error("This reset link was already used. Request a new one.");
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return error("This reset link has expired. Request a new one.");
  }

  const user = await getUserById(env.DB, row.user_id);
  if (!user || user.status !== "active") {
    return error("This account is not available for password reset.");
  }

  const salt = randomSaltHex();
  const hash = await hashPassword(newPassword, salt);
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?`,
  )
    .bind(hash, salt, now, user.id)
    .run();
  await env.DB.prepare(`UPDATE password_reset_tokens SET used_at = ? WHERE id = ?`)
    .bind(now, row.id)
    .run();
  await env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(user.id).run();
  await appendAudit(env.DB, "password_reset", user.email, "password updated via email link");

  let emailSent = false;
  try {
    const { sendPasswordChangedNotice } = await import("./email");
    emailSent = await sendPasswordChangedNotice(env, user.email, user.name, user.id);
  } catch (e) {
    await appendAudit(
      env.DB,
      "password_reset_email_failed",
      user.email,
      e instanceof Error ? e.message : String(e),
    );
  }

  return json({
    ok: true,
    email: user.email,
    message: emailSent
      ? "Password updated. A confirmation email was sent. Sign in with your new password."
      : "Password updated. Sign in with your new password.",
  });
}

/** Change password when you know the current password (optional path). */
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
  if (newPassword !== confirmPassword) {
    return error("New passwords do not match.");
  }
  {
    const pwErr = passwordPolicyError(newPassword);
    if (pwErr) return error(pwErr);
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
    emailSent = await sendPasswordChangedNotice(env, email, user.name, user.id);
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
