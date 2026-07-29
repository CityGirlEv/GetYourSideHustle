/**
 * Parent coach family APIs — register kids, settings, blueprint assignment helpers.
 */
import {
  appendAudit,
  getUserByEmail,
  getUserById,
  hashPassword,
  randomSaltHex,
  type DbUser,
  type Env,
} from "./auth";
import { canonicalizeEmail, error, json } from "./crypto";
import { ensureBlueprintTables } from "./blueprints";

export type ProgressReportCadence = "none" | "daily" | "weekly";

type ChildProfileRow = {
  id: string;
  family_id: string;
  parent_user_id: string;
  display_name: string;
  age_band: string;
  contact_email: string | null;
  linked_user_id: string | null;
  status?: string | null;
};

async function ensureFamilyTables(env: Env): Promise<void> {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS family_accounts (
      id TEXT PRIMARY KEY,
      parent_user_id TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS child_profiles (
      id TEXT PRIMARY KEY,
      family_id TEXT NOT NULL,
      parent_user_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      age_band TEXT NOT NULL,
      contact_email TEXT,
      linked_user_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS parent_family_settings (
      parent_user_id TEXT PRIMARY KEY,
      progress_report_cadence TEXT NOT NULL DEFAULT 'none',
      updated_at TEXT NOT NULL
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS child_login_events (
      id TEXT PRIMARY KEY,
      child_user_id TEXT NOT NULL,
      parent_user_id TEXT NOT NULL,
      child_profile_id TEXT,
      child_display_name TEXT NOT NULL DEFAULT '',
      logged_in_at TEXT NOT NULL
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS parent_progress_report_sends (
      id TEXT PRIMARY KEY,
      parent_user_id TEXT NOT NULL,
      cadence TEXT NOT NULL,
      period_key TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'sent',
      created_at TEXT NOT NULL,
      UNIQUE (parent_user_id, cadence, period_key)
    )`),
  ]);
}

export async function ensureFamilyForParent(
  env: Env,
  parent: Pick<DbUser, "id" | "name">,
): Promise<string> {
  await ensureFamilyTables(env);
  const existing = await env.DB.prepare(
    `SELECT id FROM family_accounts WHERE parent_user_id = ?`,
  )
    .bind(parent.id)
    .first<{ id: string }>();
  if (existing?.id) return existing.id;

  const now = new Date().toISOString();
  const familyId = `fam-${crypto.randomUUID()}`;
  await env.DB.prepare(
    `INSERT INTO family_accounts (id, parent_user_id, display_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(familyId, parent.id, `${parent.name || "GYSH"} Family`, now, now)
    .run();
  return familyId;
}

async function createLinkedKidUser(
  env: Env,
  opts: {
    parentUserId: string;
    displayName: string;
    ageBand: "kids" | "junior";
    email: string;
    password: string;
  },
): Promise<string> {
  const email = canonicalizeEmail(opts.email);
  const existing = await getUserByEmail(env.DB, email);
  if (existing) {
    throw new Error("That email already has a GYSH account. Use a different kid login email.");
  }
  const now = new Date().toISOString();
  const userId = `u-${crypto.randomUUID()}`;
  const salt = randomSaltHex();
  const hash = await hashPassword(opts.password, salt);
  const role = opts.ageBand === "junior" ? "junior" : "kid";
  const audience = opts.ageBand === "junior" ? "junior" : "kids";
  try {
    await env.DB.prepare(
      `INSERT INTO users (id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt, membership_tier, audience, parent_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, 'free', ?, ?, ?, ?)`,
    )
      .bind(
        userId,
        opts.displayName,
        email,
        role,
        JSON.stringify([role]),
        now.slice(0, 10),
        "Child profile login linked to parent coach",
        hash,
        salt,
        audience,
        opts.parentUserId,
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
          opts.displayName,
          email,
          role,
          JSON.stringify([role]),
          now.slice(0, 10),
          "Child profile login linked to parent coach",
          hash,
          salt,
          now,
          now,
        )
        .run();
    } else {
      throw e;
    }
  }
  return userId;
}

export async function createFamilyChild(
  env: Env,
  parent: DbUser,
  request: Request,
): Promise<Response> {
  await ensureFamilyTables(env);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return error("Invalid JSON body.");
  }

  const juniorSignupId = String(body.juniorSignupId || "").trim();
  let displayName = String(body.displayName || "").trim().replace(/\s+/g, " ").slice(0, 80);
  let ageBand: "kids" | "junior" =
    String(body.ageBand || "kids") === "junior" ? "junior" : "kids";
  let loginEmail = canonicalizeEmail(String(body.loginEmail || ""));
  const loginPassword = String(body.loginPassword || "");

  // Prefill / validate from the kid's prior team signup (info they entered).
  let linkedSignupId: string | null = null;
  if (juniorSignupId) {
    try {
      const parentEmail = canonicalizeEmail(parent.email);
      const signup = await env.DB.prepare(
        `SELECT id, team, child_name, child_email, parent_email, child_profile_id, status
         FROM junior_signups WHERE id = ?`,
      )
        .bind(juniorSignupId)
        .first<{
          id: string;
          team: string;
          child_name: string;
          child_email: string;
          parent_email: string;
          child_profile_id: string | null;
          status: string;
        }>();
      if (!signup) return error("That kid signup was not found.", 404);
      if (canonicalizeEmail(signup.parent_email) !== parentEmail) {
        return error("That kid signup is not linked to your parent email.", 403);
      }
      if (signup.child_profile_id) {
        return error("That kid is already registered on your family account.", 409);
      }
      linkedSignupId = signup.id;
      if (!displayName) displayName = String(signup.child_name || "").trim();
      if (!loginEmail && signup.child_email) {
        loginEmail = canonicalizeEmail(signup.child_email);
      }
      ageBand = signup.team === "junior" ? "junior" : "kids";
    } catch {
      /* junior_signups may be missing — continue with body fields */
    }
  }

  if (!displayName) return error("Enter a first name or nickname for your kid.");
  if ((loginEmail || loginPassword) && (!loginEmail.includes("@") || loginPassword.length < 8)) {
    return error("Kid login needs a valid email and a password of at least 8 characters.");
  }

  const familyId = await ensureFamilyForParent(env, parent);
  const now = new Date().toISOString();
  const childId = `child-${crypto.randomUUID()}`;
  let linkedUserId: string | null = null;

  // Store the kid email from signup even when login password is set later.
  const contactEmail = loginEmail || null;

  if (loginEmail && loginPassword) {
    try {
      linkedUserId = await createLinkedKidUser(env, {
        parentUserId: parent.id,
        displayName,
        ageBand,
        email: loginEmail,
        password: loginPassword,
      });
    } catch (e) {
      return error(e instanceof Error ? e.message : "Could not create kid login.", 409);
    }
  }

  await env.DB.prepare(
    `INSERT INTO child_profiles (id, family_id, parent_user_id, display_name, age_band, contact_email, linked_user_id, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
  )
    .bind(
      childId,
      familyId,
      parent.id,
      displayName,
      ageBand,
      contactEmail,
      linkedUserId,
      now,
      now,
    )
    .run();

  if (linkedSignupId) {
    try {
      await env.DB.prepare(
        `UPDATE junior_signups SET child_profile_id = ?, updated_at = ? WHERE id = ?`,
      )
        .bind(childId, now, linkedSignupId)
        .run();
    } catch {
      /* column may be missing */
    }
  }

  // Promote parent audience when they register a kid from an adult account.
  try {
    await env.DB.prepare(
      `UPDATE users SET audience = CASE WHEN audience IN ('parent','kids') THEN audience ELSE 'parent' END, updated_at = ? WHERE id = ?`,
    )
      .bind(now, parent.id)
      .run();
  } catch {
    /* column may be missing */
  }

  await appendAudit(
    env.DB,
    "family_child_registered",
    parent.email,
    `${displayName} · ${ageBand}${linkedSignupId ? ` · signup ${linkedSignupId}` : ""}`,
  );
  return json({
    ok: true,
    child: {
      id: childId,
      displayName,
      ageBand,
      status: "active",
      source: "profile",
      hasLogin: Boolean(linkedUserId),
      needsRegistration: false,
      childEmail: contactEmail,
      juniorSignupId: linkedSignupId,
    },
  });
}

export async function getFamilySettings(env: Env, parent: DbUser): Promise<Response> {
  await ensureFamilyTables(env);
  const row = await env.DB.prepare(
    `SELECT progress_report_cadence FROM parent_family_settings WHERE parent_user_id = ?`,
  )
    .bind(parent.id)
    .first<{ progress_report_cadence: string }>();
  const cadence = (row?.progress_report_cadence || "none") as ProgressReportCadence;
  return json({
    ok: true,
    settings: {
      progressReportCadence: ["none", "daily", "weekly"].includes(cadence) ? cadence : "none",
    },
  });
}

export async function updateFamilySettings(
  env: Env,
  parent: DbUser,
  request: Request,
): Promise<Response> {
  await ensureFamilyTables(env);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return error("Invalid JSON body.");
  }
  const cadence = String(body.progressReportCadence || "none");
  if (!["none", "daily", "weekly"].includes(cadence)) {
    return error("Choose none, daily, or weekly progress reports.");
  }
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO parent_family_settings (parent_user_id, progress_report_cadence, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(parent_user_id) DO UPDATE SET
       progress_report_cadence = excluded.progress_report_cadence,
       updated_at = excluded.updated_at`,
  )
    .bind(parent.id, cadence, now)
    .run();
  await appendAudit(env.DB, "family_settings_updated", parent.email, `reports=${cadence}`);
  return json({ ok: true, settings: { progressReportCadence: cadence } });
}

export async function assignBlueprintToChild(
  env: Env,
  parent: DbUser,
  request: Request,
): Promise<Response> {
  await ensureBlueprintTables(env);
  await ensureFamilyTables(env);
  let body: { blueprintId?: string; childProfileId?: string | null };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }
  const blueprintId = String(body.blueprintId || "").trim();
  if (!blueprintId) return error("blueprintId is required.");

  const rawAssignee = body.childProfileId;
  const assignSelf =
    rawAssignee == null ||
    String(rawAssignee).trim() === "" ||
    String(rawAssignee).trim().toLowerCase() === "self";
  let childProfileId: string | null = null;

  if (!assignSelf) {
    childProfileId = String(rawAssignee).trim();
    const child = await env.DB.prepare(
      `SELECT id FROM child_profiles WHERE id = ? AND parent_user_id = ?`,
    )
      .bind(childProfileId, parent.id)
      .first<{ id: string }>();
    if (!child) return error("That kid is not linked to your parent account.", 404);
  }

  const owned = await env.DB.prepare(
    `SELECT id FROM side_hustle_blueprints WHERE id = ? AND user_id = ?`,
  )
    .bind(blueprintId, parent.id)
    .first<{ id: string }>();
  if (!owned) return error("Blueprint not found on your account.", 404);

  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE side_hustle_blueprints SET child_profile_id = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
  )
    .bind(childProfileId, now, blueprintId, parent.id)
    .run();

  await appendAudit(
    env.DB,
    "blueprint_assigned",
    parent.email,
    `${blueprintId} → ${childProfileId ?? "self"}`,
  );
  return json({ ok: true, blueprintId, childProfileId });
}

/** After consent: create/link parent account + child profile (+ optional kid login). */
export async function provisionFamilyFromJuniorConsent(
  env: Env,
  opts: {
    parentEmail: string;
    parentName: string;
    childName: string;
    childEmail: string;
    team: string;
    juniorSignupId: string;
    parentPassword?: string;
    kidPassword?: string;
  },
): Promise<{ parentUserId: string; childProfileId: string; parentCreated: boolean }> {
  await ensureFamilyTables(env);
  const parentEmail = canonicalizeEmail(opts.parentEmail);
  let parent = await getUserByEmail(env.DB, parentEmail);
  let parentCreated = false;
  const now = new Date().toISOString();

  if (!parent) {
    const password = String(opts.parentPassword || "");
    const { passwordPolicyError } = await import("./password-policy");
    const pwErr = passwordPolicyError(password);
    if (pwErr) throw new Error(pwErr);

    const userId = `u-${crypto.randomUUID()}`;
    const salt = randomSaltHex();
    const hash = await hashPassword(password, salt);
    await env.DB.prepare(
      `INSERT INTO users (id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt, membership_tier, audience, created_at, updated_at)
       VALUES (?, ?, ?, 'adult', ?, 'active', ?, ?, ?, ?, 'free', 'parent', ?, ?)`,
    )
      .bind(
        userId,
        opts.parentName || "GYSH Parent",
        parentEmail,
        JSON.stringify(["adult"]),
        now.slice(0, 10),
        "Parent account created via Kids team consent",
        hash,
        salt,
        now,
        now,
      )
      .run();
    parent = await getUserByEmail(env.DB, parentEmail);
    parentCreated = true;
    if (!parent) throw new Error("Could not create parent account.");
  } else {
    try {
      await env.DB.prepare(
        `UPDATE users SET audience = 'parent', name = CASE WHEN name = '' OR name IS NULL THEN ? ELSE name END, updated_at = ? WHERE id = ?`,
      )
        .bind(opts.parentName || parent.name, now, parent.id)
        .run();
    } catch {
      /* non-fatal */
    }
  }

  const familyId = await ensureFamilyForParent(env, parent);
  const ageBand = opts.team === "junior" ? "junior" : "kids";
  let childProfileId = `child-${crypto.randomUUID()}`;
  let linkedUserId: string | null = null;

  const existingChild = await env.DB.prepare(
    `SELECT id, linked_user_id FROM child_profiles
     WHERE parent_user_id = ? AND lower(display_name) = lower(?) AND age_band = ?
     LIMIT 1`,
  )
    .bind(parent.id, opts.childName, ageBand)
    .first<{ id: string; linked_user_id: string | null }>();

  if (existingChild) {
    childProfileId = existingChild.id;
    linkedUserId = existingChild.linked_user_id;
  } else {
    const kidPassword = String(opts.kidPassword || "");
    if (opts.childEmail && kidPassword.length >= 8) {
      try {
        linkedUserId = await createLinkedKidUser(env, {
          parentUserId: parent.id,
          displayName: opts.childName,
          ageBand,
          email: opts.childEmail,
          password: kidPassword,
        });
      } catch {
        linkedUserId = null;
      }
    }
    await env.DB.prepare(
      `INSERT INTO child_profiles (id, family_id, parent_user_id, display_name, age_band, contact_email, linked_user_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
    )
      .bind(
        childProfileId,
        familyId,
        parent.id,
        opts.childName,
        ageBand,
        opts.childEmail || null,
        linkedUserId,
        now,
        now,
      )
      .run();
  }

  try {
    await env.DB.prepare(
      `UPDATE junior_signups SET child_profile_id = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(childProfileId, now, opts.juniorSignupId)
      .run();
  } catch {
    /* column may be missing */
  }

  return { parentUserId: parent.id, childProfileId, parentCreated };
}

export async function notifyParentOfKidLogin(env: Env, childUser: DbUser): Promise<void> {
  await ensureFamilyTables(env);
  let parentUserId: string | null = null;
  let childProfileId: string | null = null;
  let childDisplayName = childUser.name || "your kid";

  try {
    const row = await env.DB.prepare(`SELECT parent_user_id FROM users WHERE id = ?`)
      .bind(childUser.id)
      .first<{ parent_user_id: string | null }>();
    parentUserId = row?.parent_user_id || null;
  } catch {
    parentUserId = null;
  }

  if (!parentUserId) {
    const profile = await env.DB.prepare(
      `SELECT id, parent_user_id, display_name FROM child_profiles WHERE linked_user_id = ? LIMIT 1`,
    )
      .bind(childUser.id)
      .first<{ id: string; parent_user_id: string; display_name: string }>();
    if (profile) {
      parentUserId = profile.parent_user_id;
      childProfileId = profile.id;
      childDisplayName = profile.display_name || childDisplayName;
    }
  } else {
    const profile = await env.DB.prepare(
      `SELECT id, display_name FROM child_profiles WHERE linked_user_id = ? LIMIT 1`,
    )
      .bind(childUser.id)
      .first<{ id: string; display_name: string }>();
    if (profile) {
      childProfileId = profile.id;
      childDisplayName = profile.display_name || childDisplayName;
    }
  }

  if (!parentUserId) return;
  const parent = await getUserById(env.DB, parentUserId);
  if (!parent?.email) return;

  const now = new Date().toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO child_login_events (id, child_user_id, parent_user_id, child_profile_id, child_display_name, logged_in_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(`cle-${crypto.randomUUID()}`, childUser.id, parentUserId, childProfileId, childDisplayName, now)
      .run();
  } catch {
    /* non-fatal */
  }

  try {
    const { emailConfigured, sendKidLoginNotifyEmail } = await import("./email");
    if (emailConfigured(env)) {
      await sendKidLoginNotifyEmail(env, {
        parentEmail: parent.email,
        parentName: parent.name,
        childName: childDisplayName,
        loggedInAt: now,
      });
    }
  } catch {
    /* never block login */
  }
}

export async function listBlueprintsForMember(env: Env, user: DbUser) {
  await ensureBlueprintTables(env);
  await ensureFamilyTables(env);

  const owned = await env.DB.prepare(
    `SELECT * FROM side_hustle_blueprints WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50`,
  )
    .bind(user.id)
    .all();

  const assigned = await env.DB.prepare(
    `SELECT b.* FROM side_hustle_blueprints b
     INNER JOIN child_profiles c ON c.id = b.child_profile_id
     WHERE c.linked_user_id = ? AND b.user_id != ?
     ORDER BY b.updated_at DESC LIMIT 50`,
  )
    .bind(user.id, user.id)
    .all();

  const byId = new Map<string, Record<string, unknown>>();
  for (const row of [...(owned.results ?? []), ...(assigned.results ?? [])]) {
    const r = row as { id: string };
    byId.set(r.id, row as Record<string, unknown>);
  }
  return [...byId.values()];
}

export async function getChildProfileForUser(
  env: Env,
  userId: string,
): Promise<ChildProfileRow | null> {
  await ensureFamilyTables(env);
  return (
    (await env.DB.prepare(`SELECT * FROM child_profiles WHERE linked_user_id = ? LIMIT 1`)
      .bind(userId)
      .first<ChildProfileRow>()) ?? null
  );
}

export async function sendDueParentProgressReports(env: Env): Promise<{ sent: number }> {
  await ensureFamilyTables(env);
  const { emailConfigured, sendParentKidProgressReportEmail } = await import("./email");
  if (!emailConfigured(env)) return { sent: 0 };

  const now = new Date();
  const iso = now.toISOString();
  const dailyKey = iso.slice(0, 10);
  // ISO week
  const d = new Date(`${dailyKey}T12:00:00Z`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const weeklyKey = `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  const isMonday = new Date(`${dailyKey}T12:00:00Z`).getUTCDay() === 1;

  const { results } = await env.DB.prepare(
    `SELECT s.parent_user_id, s.progress_report_cadence, u.email, u.name
     FROM parent_family_settings s
     INNER JOIN users u ON u.id = s.parent_user_id
     WHERE s.progress_report_cadence IN ('daily', 'weekly')
       AND u.status = 'active'`,
  ).all<{
    parent_user_id: string;
    progress_report_cadence: string;
    email: string;
    name: string;
  }>();

  let sent = 0;
  for (const row of results ?? []) {
    const cadence = row.progress_report_cadence === "weekly" ? "weekly" : "daily";
    if (cadence === "weekly" && !isMonday) continue;
    const periodKey = cadence === "daily" ? dailyKey : weeklyKey;

    const already = await env.DB.prepare(
      `SELECT id FROM parent_progress_report_sends
       WHERE parent_user_id = ? AND cadence = ? AND period_key = ?`,
    )
      .bind(row.parent_user_id, cadence, periodKey)
      .first<{ id: string }>();
    if (already) continue;

    const children = await env.DB.prepare(
      `SELECT id, display_name, age_band FROM child_profiles
       WHERE parent_user_id = ? AND COALESCE(status, 'active') = 'active'
       ORDER BY display_name ASC`,
    )
      .bind(row.parent_user_id)
      .all<{ id: string; display_name: string; age_band: string }>();

    const kids = children.results ?? [];
    if (kids.length === 0) continue;

    const loginSince = cadence === "daily"
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const logins = await env.DB.prepare(
      `SELECT child_display_name, logged_in_at FROM child_login_events
       WHERE parent_user_id = ? AND logged_in_at >= ?
       ORDER BY logged_in_at DESC LIMIT 50`,
    )
      .bind(row.parent_user_id, loginSince)
      .all<{ child_display_name: string; logged_in_at: string }>();

    const blueprints = await env.DB.prepare(
      `SELECT b.child_profile_id, b.top_result_id, b.age_group, c.display_name
       FROM side_hustle_blueprints b
       LEFT JOIN child_profiles c ON c.id = b.child_profile_id
       WHERE b.user_id = ? AND b.child_profile_id IS NOT NULL`,
    )
      .bind(row.parent_user_id)
      .all<{
        child_profile_id: string;
        top_result_id: string | null;
        age_group: string;
        display_name: string | null;
      }>();

    try {
      await sendParentKidProgressReportEmail(env, {
        parentEmail: row.email,
        parentName: row.name,
        cadence,
        periodKey,
        children: kids.map((k) => ({
          name: k.display_name,
          ageBand: k.age_band,
          blueprintTop: blueprints.results?.find((b) => b.child_profile_id === k.id)?.top_result_id || null,
        })),
        recentLogins: (logins.results ?? []).map((l) => ({
          childName: l.child_display_name,
          at: l.logged_in_at,
        })),
      });
      await env.DB.prepare(
        `INSERT INTO parent_progress_report_sends (id, parent_user_id, cadence, period_key, status, created_at)
         VALUES (?, ?, ?, ?, 'sent', ?)`,
      )
        .bind(`prs-${crypto.randomUUID()}`, row.parent_user_id, cadence, periodKey, iso)
        .run();
      sent += 1;
    } catch {
      /* continue other parents */
    }
  }
  return { sent };
}
