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
import {
  canAccessAdminPortal,
  canAccessTestingPortal,
  parseRoles,
  primaryRole,
  rolesForPublicRegister,
  serializeRoles,
  type GyshRole,
} from "./roles";
import { BETA_NDA_VERSION, betaNdaRegisterError, formatBetaNdaAcceptanceNote } from "./beta-tester-nda";
import { acceptBetaNdaForUser } from "./beta-nda-store";
import { ensureUsersRoleCheckAllowsAllRoles } from "./ensure-users-role-check";
import { LOGIN_D1_ATTEMPTS, TRANSIENT_DB_USER_MESSAGE, D1_QUOTA_USER_MESSAGE, isD1QuotaExceededError, isTransientD1Error, withD1Retry } from "./d1-retry";
import {
  merchChoicesError,
  merchItemCount,
  mergeMerchNote,
  parseMerchChoices,
  parseMerchTshirtSizes,
  type TierId,
} from "../../src/lib/membership";
import { heardAboutFromNotes, mergeHeardAboutNote, parseHeardAboutInput } from "../../src/lib/heard-about";
import {
  ACCOUNT_ACTIVATION_REQUIRED_ERROR,
  accountNeedsEmailActivation,
  registerUserStatus,
} from "../../src/lib/register-activation";
import { parseRequiredPhone } from "../../src/lib/member-profile";

export type Env = {
  DB: D1Database;
  /** Cloudflare Pages secret / .dev.vars — never expose to client */
  RESEND_API_KEY?: string;
  /** Optional From override, e.g. `GYSH <info@getyoursidehustle.com>` */
  EMAIL_FROM?: string;
  /** Optional contact inbox override (defaults to info@getyoursidehustle.com) */
  CONTACT_TO?: string;
  /** Shared secret for cron Worker → /api/cron/daily-digest */
  CRON_SECRET?: string;
  /** Stripe secret key (sk_test_… or sk_live_…) for Checkout */
  STRIPE_SECRET_KEY?: string;
};

export type DbUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  /** JSON array of roles, e.g. `["admin","qa"]`. Null = derive from `role`. */
  roles?: string | null;
  status: string;
  joined_at: string;
  notes: string;
  password_hash: string | null;
  password_salt: string | null;
  membership_tier?: string | null;
  audience?: string | null;
  parent_user_id?: string | null;
  membership_expires_at?: string | null;
  membership_last_paid_at?: string | null;
  membership_renewal_reminded_for?: string | null;
};

const USER_SELECT =
  `id, name, email, phone, role, roles, status, joined_at, notes, password_hash, password_salt, membership_tier, audience, parent_user_id`;

const USER_SELECT_NO_PHONE =
  `id, name, email, '' AS phone, role, roles, status, joined_at, notes, password_hash, password_salt, membership_tier, audience, parent_user_id`;

/** Legacy select for DBs where migration 0004 (roles column) has not run yet. */
const USER_SELECT_LEGACY =
  `id, name, email, '' AS phone, role, NULL AS roles, status, joined_at, notes, password_hash, password_salt, NULL AS membership_tier, NULL AS audience, NULL AS parent_user_id`;

function isMissingRolesColumn(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("no such column") && msg.includes("roles");
}

function isMissingMembershipColumns(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes("no such column") &&
    (msg.includes("membership_tier") || msg.includes("audience"))
  );
}

function isMissingPhoneColumn(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("no such column") && msg.includes("phone");
}

const USER_SELECT_NO_MEMBERSHIP =
  `id, name, email, '' AS phone, role, roles, status, joined_at, notes, password_hash, password_salt, NULL AS parent_user_id`;

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

export function publicUser(u: DbUser & { last_login_at?: string | null }) {
  const roles = userRoles(u);
  const lastLoginAt = u.last_login_at ? String(u.last_login_at).trim() : "";
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: String(u.phone || "").trim(),
    role: roles[0] ?? u.role,
    roles,
    status: u.status,
    joinedAt: u.joined_at,
    notes: u.notes,
    canLogin: Boolean(u.password_hash && u.password_salt),
    membershipTier: (u.membership_tier || "free").toLowerCase(),
    audience: (u.audience || "adult").toLowerCase(),
    heardAbout: heardAboutFromNotes(u.notes),
    lastLoginAt: lastLoginAt || null,
    membershipExpiresAt: String(u.membership_expires_at || "").trim().slice(0, 10),
    membershipLastPaidAt: String(u.membership_last_paid_at || "").trim(),
  };
}

function rejectIfSoftDeletedUser(user: DbUser | null): DbUser | null {
  if (!user) return null;
  const status = String(user.status || "").trim().toLowerCase();
  if (status === "deleted") return null;
  const email = String(user.email || "").trim().toLowerCase();
  if (email.endsWith("@users.deleted.local")) return null;
  return user;
}

export async function getUserByEmail(db: D1Database, email: string): Promise<DbUser | null> {
  const primary = canonicalizeEmail(email);
  try {
    return rejectIfSoftDeletedUser(
      (await db
        .prepare(`SELECT ${USER_SELECT} FROM users WHERE email = ?`)
        .bind(primary)
        .first<DbUser>()) ?? null,
    );
  } catch (e) {
    if (isMissingPhoneColumn(e)) {
      return rejectIfSoftDeletedUser(
        (await db
          .prepare(`SELECT ${USER_SELECT_NO_PHONE} FROM users WHERE email = ?`)
          .bind(primary)
          .first<DbUser>()) ?? null,
      );
    }
    if (isMissingMembershipColumns(e)) {
      return rejectIfSoftDeletedUser(
        (await db
          .prepare(`SELECT ${USER_SELECT_NO_MEMBERSHIP} FROM users WHERE email = ?`)
          .bind(primary)
          .first<DbUser>()) ?? null,
      );
    }
    if (!isMissingRolesColumn(e)) throw e;
    return rejectIfSoftDeletedUser(
      (await db
        .prepare(`SELECT ${USER_SELECT_LEGACY} FROM users WHERE email = ?`)
        .bind(primary)
        .first<DbUser>()) ?? null,
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
    if (isMissingPhoneColumn(e)) {
      return (
        (await db
          .prepare(`SELECT ${USER_SELECT_NO_PHONE} FROM users WHERE id = ?`)
          .bind(id)
          .first<DbUser>()) ?? null
      );
    }
    if (isMissingMembershipColumns(e)) {
      return (
        (await db
          .prepare(`SELECT ${USER_SELECT_NO_MEMBERSHIP} FROM users WHERE id = ?`)
          .bind(id)
          .first<DbUser>()) ?? null
      );
    }
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

/** Audit writes must never turn a sign-in into a 500. */
async function safeAppendAudit(
  db: D1Database,
  action: string,
  email: string,
  detail: string,
): Promise<void> {
  try {
    await withD1Retry(() => appendAudit(db, action, email, detail), 2);
  } catch {
    /* ignore */
  }
}

function requestWantsSecureCookie(request: Request): boolean {
  const proto = (request.headers.get("x-forwarded-proto") || "").split(",")[0]?.trim();
  if (proto === "https") return true;
  if (proto === "http") return false;
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return true;
  }
}

export async function createSession(
  db: D1Database,
  userId: string,
  opts?: { secureCookie?: boolean },
): Promise<{ token: string; cookie: string }> {
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
  // Production: session cookie (no Max-Age) — browser close clears it; tab close is
  // enforced client-side. Localhost (secureCookie=false): durable Max-Age so Dev
  // stays signed in across restarts.
  const secureCookie = opts?.secureCookie !== false;
  const maxAgeSec = secureCookie ? undefined : SESSION_DAYS * 24 * 60 * 60;
  return { token, cookie: sessionCookie(token, maxAgeSec, secureCookie) };
}

export async function destroySession(db: D1Database, request: Request): Promise<string> {
  const cookies = parseCookies(request.headers.get("cookie"));
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const cookieToken = cookies.gysh_session || "";
  const tokens = [bearer, cookieToken].filter(Boolean);
  const seen = new Set<string>();
  for (const token of tokens) {
    if (seen.has(token)) continue;
    seen.add(token);
    const tokenHash = await sha256Hex(token);
    await db.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(tokenHash).run();
  }
  return clearSessionCookie(requestWantsSecureCookie(request));
}

async function loadSessionRow(
  env: Env,
  token: string,
): Promise<(DbUser & { user_id: string; expires_at: string }) | null> {
  const tokenHash = await sha256Hex(token);
  const sessionQuery = (rolesExpr: string) =>
    `SELECT s.user_id, s.expires_at,
            u.id, u.name, u.email, u.role, ${rolesExpr}, u.status, u.joined_at, u.notes, u.password_hash, u.password_salt
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?`;
  try {
    return await env.DB.prepare(sessionQuery("u.roles"))
      .bind(tokenHash)
      .first<DbUser & { user_id: string; expires_at: string }>();
  } catch (e) {
    if (!isMissingRolesColumn(e)) throw e;
    return await env.DB.prepare(sessionQuery("NULL AS roles"))
      .bind(tokenHash)
      .first<DbUser & { user_id: string; expires_at: string }>();
  }
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
  const cookieToken = cookies.gysh_session || "";
  // Prefer bearer, but fall back to cookie when bearer is stale (common after tab churn).
  const candidates = [bearer, cookieToken].filter(Boolean);
  if (candidates.length === 0) return error("Not authenticated.", 401);

  let sawExpired = false;
  const tried = new Set<string>();
  for (const token of candidates) {
    if (tried.has(token)) continue;
    tried.add(token);
    const row = await loadSessionRow(env, token);
    if (!row) continue;
    if (new Date(row.expires_at).getTime() < Date.now()) {
      sawExpired = true;
      const tokenHash = await sha256Hex(token);
      await env.DB.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(tokenHash).run();
      continue;
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

  return error(sawExpired ? "Session expired." : "Session invalid or expired.", 401);
}

/** Admin Studio + Admin menu — admin role only. */
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

/** Testing Portal APIs — Admin or QA. */
export async function requireTestingPortalSession(
  env: Env,
  request: Request,
): Promise<{ user: DbUser } | Response> {
  const auth = await requireSession(env, request);
  if (auth instanceof Response) return auth;
  if (!canAccessTestingPortal(userRoles(auth.user))) {
    return error("Testing Portal access required.", 403);
  }
  return auth;
}

export async function handleLogin(env: Env, request: Request): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return error("Invalid JSON body.");
  }

  const email = canonicalizeEmail(body.email || "");
  const password = String(body.password || "");
  if (!email || !password) {
    await safeAppendAudit(env.DB, "login_failed", email || "(empty)", "missing credentials");
    return error("Email and password are required.", 400);
  }

  try {
    let user = await withD1Retry(() => getUserByEmail(env.DB, email), LOGIN_D1_ATTEMPTS);
    if (!user || !user.password_hash || !user.password_salt) {
      await safeAppendAudit(env.DB, "login_failed", email, "unknown account");
      return error("Invalid email or password.", 401);
    }
    const ok = await verifyPassword(password, user.password_salt, user.password_hash);
    if (!ok) {
      await safeAppendAudit(env.DB, "login_failed", email, "bad password");
      return error("Invalid email or password.", 401);
    }

    if (user.status === "pending") {
      try {
        await emailPendingMembershipVerification(env, request, user);
      } catch {
        /* still tell them to open the link already sent */
      }
      await safeAppendAudit(env.DB, "login_failed", email, "pending email verification");
      return error(
        "Confirm your email to activate your membership. Check your inbox for the verification link, then sign in.",
        403,
      );
    }
    if (user.status !== "active") {
      await safeAppendAudit(env.DB, "login_failed", email, `inactive account · ${user.status}`);
      if (user.status === "disabled") {
        return error("This account has been deactivated. Contact info@getyoursidehustle.com if you need help.", 403);
      }
      return error("Invalid email or password.", 401);
    }

    const roles = userRoles(user);
    const isAdmin = canAccessAdminPortal(roles);
    const { token, cookie } = await withD1Retry(
      () =>
        createSession(env.DB, user.id, {
          secureCookie: requestWantsSecureCookie(request),
        }),
      LOGIN_D1_ATTEMPTS,
    );
    await safeAppendAudit(
      env.DB,
      "login_ok",
      email,
      isAdmin ? "admin login success" : "member login success",
    );

    // Parent coach alert whenever a linked kid/teen account signs in.
    try {
      const audience = String(user.audience || "").toLowerCase();
      const isYouth =
        roles.includes("kid") ||
        roles.includes("junior") ||
        audience === "kids" ||
        audience === "junior";
      if (isYouth) {
        const { notifyParentOfKidLogin } = await import("./family");
        await notifyParentOfKidLogin(env, user);
      }
    } catch {
      /* never block login */
    }

    return json(
      { ok: true, user: publicUser(user), token, isAdmin },
      200,
      { "set-cookie": cookie },
    );
  } catch (e) {
    if (isD1QuotaExceededError(e)) {
      return error(D1_QUOTA_USER_MESSAGE, 503);
    }
    if (isTransientD1Error(e)) {
      return error(TRANSIENT_DB_USER_MESSAGE, 503);
    }
    throw e;
  }
}

type RegisterAgeGroup = "kids" | "junior" | "adult" | "senior";

/**
 * Public free-account registration for Side Hustle Blueprint unlock.
 * Kids (4–12): parent/guardian email only — creates parent account + child profile (no child email).
 *
 * @param waitUntil — Cloudflare Pages `context.waitUntil` to finish email/credits after the 201.
 */
export async function handleRegister(
  env: Env,
  request: Request,
  waitUntil?: (promise: Promise<unknown>) => void,
): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;

  try {
    await ensureUsersRoleCheckAllowsAllRoles(env.DB);
  } catch {
    /* best-effort — insert may still succeed if already migrated */
  }

  let body: {
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
    ageGroup?: RegisterAgeGroup;
    childDisplayName?: string;
    claimToken?: string;
    pendingBlueprint?: {
      ageGroup?: string;
      answers?: Record<string, unknown>;
      resultIds?: string[];
      resultPcts?: Record<string, number>;
    };
    claimedExtraGuideId?: string;
    membershipTier?: string;
    merchChoices?: unknown;
    merchTshirtSizes?: unknown;
    phone?: string;
    /** Public applicants may add the Beta Tester role; admin/QA/Dev stay admin-assigned. */
    applyBetaTester?: boolean;
    betaNda?: {
      agreed?: boolean;
      legalName?: string;
      email?: string;
      signature?: string;
      acceptedAt?: string;
      ndaVersion?: string;
    };
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }

  const email = canonicalizeEmail(body.email || "");
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  const phoneParsed = parseRequiredPhone(body.phone);
  if (!phoneParsed.ok) return error(phoneParsed.error);
  const phone = phoneParsed.phone;
  const ageGroup = (body.ageGroup || "adult") as RegisterAgeGroup;
  const childDisplayName = String(body.childDisplayName || "").trim();
  const claimToken = String(body.claimToken || "").trim();
  const pendingBlueprint = body.pendingBlueprint;
  const requestedTier = String(body.membershipTier || "free").toLowerCase();
  const membershipTier = ["free", "starter", "pro", "elite"].includes(requestedTier)
    ? (requestedTier as TierId)
    : "free";
  const merchErr = merchChoicesError(membershipTier, body.merchChoices, body.merchTshirtSizes);
  if (merchErr) return error(merchErr);
  const merchChoices =
    parseMerchChoices(body.merchChoices, merchItemCount(membershipTier)) ?? [];
  const merchTshirtSizes = parseMerchTshirtSizes(merchChoices, body.merchTshirtSizes);
  const heardAbout = parseHeardAboutInput(body);
  if (!heardAbout.ok) return error(heardAbout.error);
  const applyBetaTester = body.applyBetaTester === true;
  const ndaErr = betaNdaRegisterError(applyBetaTester, body.betaNda, email);
  if (ndaErr) return error(ndaErr);

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
  if (existing) {
    if (accountNeedsEmailActivation(existing.status)) {
      try {
        await emailPendingMembershipVerification(env, request, existing);
      } catch {
        /* the original activation email still stands */
      }
      return error(ACCOUNT_ACTIVATION_REQUIRED_ERROR, 403);
    }
    return error("An account with that email already exists. Sign in instead.", 409);
  }

  const now = new Date().toISOString();
  const userId = `u-${crypto.randomUUID()}`;
  const salt = randomSaltHex();
  const hash = await hashPassword(password, salt);

  const isParent = ageGroup === "kids";
  const assignedRoles = rolesForPublicRegister(ageGroup, applyBetaTester);
  const assignedPrimary = primaryRole(assignedRoles);
  const rolesJson = serializeRoles(assignedRoles);
  const audience = isParent ? "parent" : ageGroup === "senior" ? "senior" : ageGroup;
  const displayName =
    name ||
    (isParent
      ? "GYSH Parent"
      : ageGroup === "junior"
        ? "GYSH Teens"
        : ageGroup === "senior"
          ? "GYSH Senior"
          : "GYSH Member");

  const notesBase =
    membershipTier === "free"
      ? isParent
        ? "Parent family account (Kids Side Hustle Blueprint)"
        : "Free GYSH member"
      : `Requested ${membershipTier} plan · Stripe checkout for Adult/Senior · ${ageGroup}`;
  const notes = mergeHeardAboutNote(
    mergeMerchNote(
      applyBetaTester ? `${notesBase} · Applied as Beta Tester · ${BETA_NDA_VERSION}` : notesBase,
      merchChoices,
      merchTshirtSizes,
    ),
    heardAbout.stamp,
  );

  // Memberships stay pending until the person clicks the verification email.
  const accountStatus = registerUserStatus(membershipTier);
  try {
    await env.DB.prepare(`ALTER TABLE users ADD COLUMN phone TEXT NOT NULL DEFAULT ''`).run();
  } catch {
    /* phone column already present */
  }
  try {
    await env.DB.prepare(
      `INSERT INTO users (id, name, email, phone, role, roles, status, joined_at, notes, password_hash, password_salt, membership_tier, audience, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        userId,
        displayName,
        email,
        phone,
        assignedPrimary,
        rolesJson,
        accountStatus,
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
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          userId,
          displayName,
          email,
          assignedPrimary,
          rolesJson,
          accountStatus,
          now.slice(0, 10),
          notes,
          hash,
          salt,
          now,
          now,
        )
        .run();
      try {
        await env.DB.prepare(`UPDATE users SET phone = ? WHERE id = ?`).bind(phone, userId).run();
      } catch {
        /* phone column still missing on this database */
      }
    } else if (msg.includes("UNIQUE")) {
      return error("An account with that email already exists. Sign in instead.", 409);
    } else {
      throw e;
    }
  }

  let childProfileId: string | null = null;
  let kidUserId: string | null = null;
  let kidLoginEmail: string | null = null;
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

      // Create kid login user linked to this parent (parent_user_id + child_profiles.linked_user_id).
      try {
        const { provisionLinkedKidOnParentRegister } = await import("./family");
        const linked = await provisionLinkedKidOnParentRegister(env, {
          parentUserId: userId,
          familyId,
          childProfileId,
          childDisplayName,
          parentEmail: email,
          parentPassword: password,
        });
        if (linked) {
          kidUserId = linked.kidUserId;
          kidLoginEmail = linked.kidLoginEmail;
        }
      } catch (linkErr) {
        /* Parent + profile still created; Dashboard Register My Kid can finish linking. */
        await appendAudit(
          env.DB,
          "register_ok",
          email,
          `kid link deferred: ${linkErr instanceof Error ? linkErr.message : String(linkErr)}`,
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("no such table")) throw e;
      /* migration 0016 not applied yet — account still usable */
      childProfileId = null;
      kidUserId = null;
      kidLoginEmail = null;
    }
  }

  const user = await getUserByEmail(env.DB, email);
  if (!user) return error("Registration failed.", 500);

  let betaNdaReceipt: {
    version: string;
    acceptedAt: string;
    legalName: string;
    userId: string;
  } | null = null;
  if (applyBetaTester && body.betaNda) {
    const accepted = await acceptBetaNdaForUser(env.DB, request, user, {
      ...body.betaNda,
      ndaVersion: BETA_NDA_VERSION,
    });
    if ("error" in accepted) return error(accepted.error);
    betaNdaReceipt = {
      version: accepted.record.ndaVersion,
      acceptedAt: accepted.record.acceptedAt,
      legalName: accepted.record.legalName,
      userId: accepted.record.userId,
    };
    const ndaNote = formatBetaNdaAcceptanceNote({
      legalName: accepted.record.legalName,
      email: accepted.record.email,
      acceptedAt: accepted.record.acceptedAt,
    });
    try {
      await env.DB.prepare(`UPDATE users SET notes = ?, updated_at = ? WHERE id = ?`)
        .bind(`${notes} · ${ndaNote}`, now, userId)
        .run();
    } catch {
      /* notes already include NDA version */
    }
  }

  await appendAudit(
    env.DB,
    "register_ok",
    email,
    `${membershipTier} membership pending email verification · ${ageGroup} · ${heardAbout.stamp}${applyBetaTester ? ` · beta · NDA ${BETA_NDA_VERSION}` : ""}`,
  );

  // Attach the Match Wizard they just finished — keep on the critical path so the UI can deep-link.
  let claimedBlueprintId: string | null = null;
  try {
    const { claimPendingBlueprintForUser, saveWizardBlueprintForNewUser, grantComplimentaryWizardExtra } =
      await import("./blueprints");
    if (claimToken) {
      const claimed = await claimPendingBlueprintForUser(env, userId, claimToken, {
        childProfileId,
      });
      claimedBlueprintId = claimed?.id ?? null;
    }
    if (!claimedBlueprintId && pendingBlueprint) {
      const saved = await saveWizardBlueprintForNewUser(env, userId, pendingBlueprint, {
        childProfileId,
        claimToken: claimToken || null,
      });
      claimedBlueprintId = saved?.id ?? null;
    }
    const claimedExtraGuideId = String(body.claimedExtraGuideId || "").trim() || null;
    if (
      claimedBlueprintId ||
      (Array.isArray(pendingBlueprint?.resultIds) && pendingBlueprint.resultIds.length) ||
      claimedExtraGuideId
    ) {
      await grantComplimentaryWizardExtra(env, userId, {
        resultIds: pendingBlueprint?.resultIds,
        resultPcts: pendingBlueprint?.resultPcts,
        blueprintId: claimedBlueprintId,
        claimedGuideId: claimedExtraGuideId,
      });
    }
  } catch {
    /* client can retry after activation / login */
  }

  let confirmUrl = "";
  try {
    confirmUrl = await issueEmailVerification(env, request, user);
  } catch {
    /* login can send a fresh link */
  }

  // Email (no cert PDF) + credit sync run after the response so signup feels fast.
  const postRegisterWork = (async () => {
    try {
      const { syncMemberEntitlementsFromPurchases } = await import("./member-credits");
      const synced = await syncMemberEntitlementsFromPurchases(env, user);
      if (synced.packCreditsGranted > 0 || synced.planCreditsGranted > 0) {
        await appendAudit(
          env.DB,
          "credits_granted",
          email,
          `+${synced.packCreditsGranted + synced.planCreditsGranted} Kid Credits from checkout / plan`,
        );
      }
    } catch {
      /* credit packs purchased before the account existed */
    }
    try {
      const { sendRegistrationConfirmation } = await import("./email");
      await sendRegistrationConfirmation(
        env,
        {
          id: user.id,
          email: user.email,
          name: user.name,
          audience: String(audience),
          membership_tier: membershipTier,
        },
        { includeCertificate: false, heardAbout: heardAbout.label, confirmUrl },
      );
    } catch {
      /* non-fatal — admin can resend on activation */
    }
  })();

  if (typeof waitUntil === "function") {
    waitUntil(postRegisterWork);
  } else {
    // Local/tests without waitUntil — still skip certificate; don't block longer than needed.
    void postRegisterWork;
  }

  const kidsLinkedMsg =
    isParent && kidUserId
      ? ` Child account for ${childDisplayName} was created and linked to your parent account.`
      : "";

  let token: string | null = null;
  const extraHeaders: Record<string, string> = {};
  if (accountStatus === "active") {
    const session = await createSession(env.DB, userId, {
      secureCookie: requestWantsSecureCookie(request),
    });
    token = session.token;
    extraHeaders["set-cookie"] = session.cookie;
  }

  return json(
    {
      ok: true,
      pendingActivation: accountStatus !== "active",
      emailSent: true,
      emailQueued: true,
      membershipTier,
      user: publicUser({ ...user, status: accountStatus }),
      betaNda: betaNdaReceipt,
      testingUnlocked: Boolean(betaNdaReceipt),
      token,
      isAdmin: false,
      childProfileId,
      kidUserId,
      kidLoginEmail,
      claimedBlueprintId,
      message:
        accountStatus === "active"
          ? `Your Free account is ready.${kidsLinkedMsg} You can save your profile and open My Dashboard now.`
          : `Check your email and click Verify to activate your ${membershipTier} membership.${kidsLinkedMsg} Then sign in. No admin approval is required.`,
    },
    201,
    extraHeaders,
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
  let user = auth.user;
  try {
    const { syncMemberEntitlementsFromPurchases } = await import("./member-credits");
    const synced = await syncMemberEntitlementsFromPurchases(env, user);
    if (
      synced.membershipTier !== String(user.membership_tier || "free").toLowerCase() ||
      synced.audience !== String(user.audience || "adult").toLowerCase()
    ) {
      const refreshed = await getUserById(env.DB, user.id);
      if (refreshed) user = refreshed;
      else {
        user = {
          ...user,
          membership_tier: synced.membershipTier,
          audience: synced.audience,
        };
      }
    }
  } catch {
    /* entitlements optional */
  }
  return json({ user: publicUser(user) });
}

const MEMBERSHIP_TIERS = ["free", "starter", "pro", "elite"] as const;
const MEMBERSHIP_AUDIENCES = ["kids", "junior", "adult", "senior"] as const;

export function parseMembershipPlanUpdate(body: {
  membershipTier?: string;
  audience?: string;
}):
  | { ok: true; membershipTier: string; audience: string }
  | { ok: false; error: string } {
  const membershipTier = String(body.membershipTier || "").toLowerCase().trim();
  const audience = String(body.audience || "").toLowerCase().trim();
  if (!(MEMBERSHIP_TIERS as readonly string[]).includes(membershipTier)) {
    return { ok: false, error: "Choose Free, Starter, Pro, or Elite." };
  }
  if (!(MEMBERSHIP_AUDIENCES as readonly string[]).includes(audience)) {
    return { ok: false, error: "Choose Kids, Teens, Adults, or Seniors." };
  }
  return { ok: true, membershipTier, audience };
}

/** Logged-in member adds / changes membership plan on their profile. */
export async function handleUpdateMembershipPlan(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;

  let body: {
    membershipTier?: string;
    audience?: string;
    merchChoices?: unknown;
    merchTshirtSizes?: unknown;
    adminSimulatePayment?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const parsed = parseMembershipPlanUpdate(body);
  if (!parsed.ok) return error(parsed.error, 400);

  const adminSimulateRequested = body.adminSimulatePayment === true;
  const actorIsAdmin = canAccessAdminPortal(userRoles(actor));
  if (adminSimulateRequested && !actorIsAdmin) {
    return error("Only admins can simulate membership payment.", 403);
  }
  const adminSimulatePayment = adminSimulateRequested && actorIsAdmin;

  const merchErr = merchChoicesError(parsed.membershipTier as TierId, body.merchChoices, body.merchTshirtSizes);
  if (merchErr) return error(merchErr, 400);
  const merchChoices =
    parseMerchChoices(body.merchChoices, merchItemCount(parsed.membershipTier as TierId)) ?? [];
  const merchTshirtSizes = parseMerchTshirtSizes(merchChoices, body.merchTshirtSizes);

  const before = (await getUserById(env.DB, actor.id)) ?? actor;
  const previousTier = String(before.membership_tier || "free").toLowerCase();
  const previousAudience = String(before.audience || "adult").toLowerCase();
  const samePlan =
    previousTier === parsed.membershipTier && previousAudience === parsed.audience;

  const { membershipPlanRequiresCreditCheckout } = await import("../../src/lib/credit-checkout");
  if (
    !adminSimulatePayment &&
    !samePlan &&
    membershipPlanRequiresCreditCheckout(parsed.audience, parsed.membershipTier)
  ) {
    return error(
      "Kids and Teens paid plans use Kid Credit checkout. Pay with credits from Join or My Dashboard.",
      402,
    );
  }

  const stamp = adminSimulatePayment
    ? `Admin simulated payment → ${parsed.membershipTier} (${parsed.audience}) ${new Date().toISOString()}`
    : `Membership set to ${parsed.membershipTier} (${parsed.audience}) ${new Date().toISOString()}`;
  const prev = String(before.notes || "");
  const notes = mergeMerchNote(`${prev}${prev ? " · " : ""}${stamp}`, merchChoices, merchTshirtSizes);
  const now = new Date().toISOString();

  try {
    await env.DB.prepare(
      `UPDATE users SET membership_tier = ?, audience = ?, notes = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(parsed.membershipTier, parsed.audience, notes, now, actor.id)
      .run();
  } catch (e) {
    if (isMissingMembershipColumns(e)) {
      return error("Membership columns are not available on this database yet.", 503);
    }
    throw e;
  }

  await appendAudit(
    env.DB,
    adminSimulatePayment ? "membership_plan_admin_simulate" : "membership_plan_update",
    actor.email,
    `${parsed.membershipTier}:${parsed.audience}`,
  );

  const updated = await getUserById(env.DB, actor.id);
  const publicUpdated = publicUser(
    updated ?? {
      ...before,
      membership_tier: parsed.membershipTier,
      audience: parsed.audience,
      notes,
    },
  );

  // Adult/Senior paid plans email + credits after Stripe; Kids/Teens credit plans here.
  // Admin simulate applies the paid plan immediately (no Stripe wait).
  const planChanged =
    previousTier !== parsed.membershipTier || previousAudience !== parsed.audience;
  if (planChanged && parsed.membershipTier !== "free") {
    try {
      const {
        defersMembershipEmailUntilStripe,
        sendMembershipSubscriptionEmails,
      } = await import("./email");
      const waitForStripe =
        !adminSimulatePayment &&
        defersMembershipEmailUntilStripe(parsed.membershipTier, parsed.audience);
      if (!waitForStripe) {
        try {
          const { grantMembershipPlanCredits } = await import("./member-credits");
          await grantMembershipPlanCredits(
            env,
            actor.id,
            parsed.membershipTier,
            parsed.audience,
          );
        } catch {
          /* credits best-effort */
        }
        await sendMembershipSubscriptionEmails(env, {
          user: {
            id: publicUpdated.id,
            email: publicUpdated.email,
            name: publicUpdated.name,
            membership_tier: publicUpdated.membershipTier,
            audience: publicUpdated.audience,
          },
          previousTier,
          source: "profile",
        });
      }
    } catch {
      /* email is best-effort */
    }
  }

  return json({
    ok: true,
    user: publicUpdated,
    message: adminSimulatePayment
      ? `Admin simulated payment — your profile is now on the ${parsed.membershipTier} plan.`
      : `Your profile is now on the ${parsed.membershipTier} plan.`,
  });
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

const CONFIRM_TOKEN_HOURS = 72;

async function ensureEmailConfirmTable(db: D1Database): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS email_confirm_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        used_at TEXT,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
}

/** Email a one-time link that sets a pending membership to Active. */
async function issueEmailVerification(
  env: Env,
  request: Request,
  user: { id: string },
): Promise<string> {
  await ensureEmailConfirmTable(env.DB);
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const now = new Date();
  const expires = new Date(now.getTime() + CONFIRM_TOKEN_HOURS * 60 * 60 * 1000);
  const id = `ect-${crypto.randomUUID()}`;
  await env.DB.prepare(
    `UPDATE email_confirm_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL`,
  )
    .bind(now.toISOString(), user.id)
    .run();
  await env.DB.prepare(
    `INSERT INTO email_confirm_tokens (id, user_id, token_hash, expires_at, used_at, created_at)
     VALUES (?, ?, ?, ?, NULL, ?)`,
  )
    .bind(id, user.id, tokenHash, expires.toISOString(), now.toISOString())
    .run();
  const { membershipActivationUrl } = await import("../../src/lib/email-verify-url");
  void request;
  return membershipActivationUrl(token);
}

/** Correct password on a pending membership: send a fresh verification link. */
async function emailPendingMembershipVerification(
  env: Env,
  request: Request,
  user: DbUser,
): Promise<void> {
  const confirmUrl = await issueEmailVerification(env, request, user);
  const { sendRegistrationConfirmation } = await import("./email");
  await sendRegistrationConfirmation(
    env,
    {
      id: user.id,
      email: user.email,
      name: user.name,
      audience: user.audience,
      membership_tier: user.membership_tier,
    },
    { includeCertificate: false, confirmUrl },
  );
}

/** Click the membership verification link: Pending becomes Active and they are signed in. */
export async function handleConfirmEmail(
  env: Env,
  request: Request,
  waitUntil?: (promise: Promise<unknown>) => void,
): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;

  let body: { token?: string };
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return error("Invalid JSON body.");
  }

  const token = String(body.token || "").trim();
  if (!token) return error("Verification link is missing or invalid.");

  await ensureEmailConfirmTable(env.DB);
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT id, user_id, expires_at, used_at FROM email_confirm_tokens WHERE token_hash = ?`,
  )
    .bind(tokenHash)
    .first<{ id: string; user_id: string; expires_at: string; used_at: string | null }>();

  if (!row) return error("This verification link is invalid or has already been used.");
  if (row.used_at) {
    return error("This verification link was already used. Sign in with your password.");
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return error("This verification link has expired. Sign in with your password and we will email a new one.");
  }

  const user = await getUserById(env.DB, row.user_id);
  if (!user) return error("This verification link is invalid.");
  if (user.status === "disabled") {
    return error("This account has been deactivated. Contact info@getyoursidehustle.com if you need help.", 403);
  }

  const now = new Date().toISOString();
  if (user.status !== "active") {
    try {
      await env.DB.prepare(
        `UPDATE users SET status = 'active', activated_at = ?, activated_by = 'email', updated_at = ? WHERE id = ?`,
      )
        .bind(now, now, user.id)
        .run();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("no such column")) throw e;
      await env.DB.prepare(`UPDATE users SET status = 'active', updated_at = ? WHERE id = ?`)
        .bind(now, user.id)
        .run();
    }
  }

  await env.DB.prepare(`UPDATE email_confirm_tokens SET used_at = ? WHERE id = ?`).bind(now, row.id).run();
  await appendAudit(env.DB, "email_verified", user.email, "membership set active from verification link");

  const active = (await getUserById(env.DB, user.id)) || { ...user, status: "active" };
  const session = await createSession(env.DB, active.id, {
    secureCookie: requestWantsSecureCookie(request),
  });

  const welcome = (async () => {
    try {
      const { sendAccountActivatedWelcome } = await import("./email");
      await sendAccountActivatedWelcome(env, active);
    } catch {
      /* activation already succeeded */
    }
  })();
  if (typeof waitUntil === "function") waitUntil(welcome);
  else void welcome;

  return json(
    {
      ok: true,
      user: publicUser({ ...active, status: "active" }),
      token: session.token,
      message: "Your membership is active. You are signed in.",
    },
    200,
    { "set-cookie": session.cookie },
  );
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
      "Confirm your email to activate your membership before you reset the password. Check your inbox for the verification link.",
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
