/**
 * Side Hustle Blueprint pending-claim + saved results API (D1).
 */
import {
  appendAudit,
  type DbUser,
  type Env,
  publicUser,
  requireDb,
} from "./auth";
import { error, json, randomToken } from "./crypto";

export type BlueprintAgeGroup = "kids" | "junior" | "adult" | "senior";

const PENDING_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type PendingRow = {
  claim_token: string;
  age_group: string;
  answers_json: string;
  result_ids_json: string;
  result_pcts_json: string;
  return_view: string;
  return_tab: string | null;
  expires_at: string;
  claimed_by_user_id: string | null;
  claimed_at: string | null;
  created_at: string;
};

type BlueprintRow = {
  id: string;
  user_id: string;
  child_profile_id: string | null;
  age_group: string;
  answers_json: string;
  result_ids_json: string;
  result_pcts_json: string;
  /** hustleId → child_profile id, or "self" for parent */
  match_assignees_json?: string | null;
  top_result_id: string | null;
  unlocked: number;
  source: string;
  claim_token: string | null;
  completed_at: string;
  unlocked_at: string | null;
  created_at: string;
  updated_at: string;
};

function parseMatchAssignees(raw: string | null | undefined): Record<string, string> {
  const obj = parseJsonObject(raw || "{}");
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const id = String(k || "").trim();
    const assignee = String(v ?? "").trim();
    if (!id || !assignee) continue;
    out[id] = assignee;
  }
  return out;
}

function parseJsonArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function parseJsonObject(raw: string): Record<string, unknown> {
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function publicBlueprint(row: BlueprintRow) {
  const resultIds = parseJsonArray(row.result_ids_json);
  return {
    id: row.id,
    userId: row.user_id,
    childProfileId: row.child_profile_id,
    ageGroup: row.age_group as BlueprintAgeGroup,
    answers: parseJsonObject(row.answers_json),
    resultIds,
    resultPcts: parseJsonObject(row.result_pcts_json) as Record<string, number>,
    matchAssignees: parseMatchAssignees(row.match_assignees_json),
    topResultId: row.top_result_id ?? resultIds[0] ?? null,
    unlocked: Boolean(row.unlocked),
    source: row.source,
    completedAt: row.completed_at,
    unlockedAt: row.unlocked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureBlueprintTables(env: Env): Promise<void> {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS pending_blueprints (
      claim_token TEXT PRIMARY KEY,
      age_group TEXT NOT NULL,
      answers_json TEXT NOT NULL DEFAULT '{}',
      result_ids_json TEXT NOT NULL DEFAULT '[]',
      result_pcts_json TEXT NOT NULL DEFAULT '{}',
      return_view TEXT NOT NULL DEFAULT 'quiz',
      return_tab TEXT,
      expires_at TEXT NOT NULL,
      claimed_by_user_id TEXT,
      claimed_at TEXT,
      created_at TEXT NOT NULL
    )`),
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
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS side_hustle_blueprints (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      child_profile_id TEXT,
      age_group TEXT NOT NULL,
      answers_json TEXT NOT NULL DEFAULT '{}',
      result_ids_json TEXT NOT NULL DEFAULT '[]',
      result_pcts_json TEXT NOT NULL DEFAULT '{}',
      top_result_id TEXT,
      unlocked INTEGER NOT NULL DEFAULT 1,
      source TEXT NOT NULL DEFAULT 'wizard',
      claim_token TEXT,
      completed_at TEXT NOT NULL,
      unlocked_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS blueprint_favorites (
      user_id TEXT NOT NULL,
      blueprint_id TEXT NOT NULL,
      hustle_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, blueprint_id, hustle_id)
    )`),
  ]);
  try {
    await env.DB.prepare(
      `ALTER TABLE side_hustle_blueprints ADD COLUMN match_assignees_json TEXT NOT NULL DEFAULT '{}'`,
    ).run();
  } catch {
    /* column already exists */
  }
}

function isAgeGroup(v: unknown): v is BlueprintAgeGroup {
  return v === "kids" || v === "junior" || v === "adult" || v === "senior";
}

/** Public: store logged-out wizard completion; returns opaque claim token (no PII in URL). */
export async function createPendingBlueprint(env: Env, request: Request): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;
  await ensureBlueprintTables(env);

  let body: {
    ageGroup?: BlueprintAgeGroup;
    answers?: Record<string, unknown>;
    resultIds?: string[];
    resultPcts?: Record<string, number>;
    returnView?: string;
    returnTab?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }

  if (!isAgeGroup(body.ageGroup)) return error("Invalid age group.");
  const resultIds = Array.isArray(body.resultIds) ? body.resultIds.map(String).filter(Boolean) : [];
  if (resultIds.length === 0) return error("resultIds are required.");

  const claimToken = randomToken();
  const now = new Date();
  const expires = new Date(now.getTime() + PENDING_TTL_MS);

  await env.DB.prepare(
    `INSERT INTO pending_blueprints
      (claim_token, age_group, answers_json, result_ids_json, result_pcts_json, return_view, return_tab, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      claimToken,
      body.ageGroup,
      JSON.stringify(body.answers ?? {}),
      JSON.stringify(resultIds),
      JSON.stringify(body.resultPcts ?? {}),
      String(body.returnView || "quiz"),
      body.returnTab ? String(body.returnTab) : null,
      expires.toISOString(),
      now.toISOString(),
    )
    .run();

  return json({
    ok: true,
    claimToken,
    expiresAt: expires.toISOString(),
    ageGroup: body.ageGroup,
  });
}

/** Public: peek a pending claim (no answers free-text dump beyond stored wizard answers). */
export async function getPendingBlueprint(env: Env, claimToken: string): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;
  await ensureBlueprintTables(env);

  const row = await env.DB.prepare(`SELECT * FROM pending_blueprints WHERE claim_token = ?`)
    .bind(claimToken)
    .first<PendingRow>();
  if (!row) return error("Pending Side Hustle Blueprint not found or expired.", 404);
  if (row.claimed_by_user_id) return error("This Blueprint was already claimed.", 409);
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await env.DB.prepare(`DELETE FROM pending_blueprints WHERE claim_token = ?`).bind(claimToken).run();
    return error("Pending Side Hustle Blueprint expired.", 410);
  }

  return json({
    ok: true,
    claimToken: row.claim_token,
    ageGroup: row.age_group,
    answers: parseJsonObject(row.answers_json),
    resultIds: parseJsonArray(row.result_ids_json),
    resultPcts: parseJsonObject(row.result_pcts_json),
    returnView: row.return_view,
    returnTab: row.return_tab,
    expiresAt: row.expires_at,
  });
}

export async function claimPendingBlueprintForUser(
  env: Env,
  userId: string,
  claimToken: string,
  opts?: { childProfileId?: string | null; ageGroup?: BlueprintAgeGroup },
): Promise<{ id: string } | null> {
  await ensureBlueprintTables(env);
  const row = await env.DB.prepare(`SELECT * FROM pending_blueprints WHERE claim_token = ?`)
    .bind(claimToken)
    .first<PendingRow>();
  if (!row || row.claimed_by_user_id) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await env.DB.prepare(`DELETE FROM pending_blueprints WHERE claim_token = ?`).bind(claimToken).run();
    return null;
  }

  const now = new Date().toISOString();
  const id = `bp-${crypto.randomUUID()}`;
  const resultIds = parseJsonArray(row.result_ids_json);
  const ageGroup = opts?.ageGroup || (row.age_group as BlueprintAgeGroup);

  await env.DB.prepare(
    `INSERT INTO side_hustle_blueprints
      (id, user_id, child_profile_id, age_group, answers_json, result_ids_json, result_pcts_json,
       top_result_id, unlocked, source, claim_token, completed_at, unlocked_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'wizard', ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      userId,
      opts?.childProfileId ?? null,
      ageGroup,
      row.answers_json,
      row.result_ids_json,
      row.result_pcts_json,
      resultIds[0] ?? null,
      claimToken,
      row.created_at,
      now,
      now,
      now,
    )
    .run();

  await env.DB.prepare(
    `UPDATE pending_blueprints SET claimed_by_user_id = ?, claimed_at = ? WHERE claim_token = ?`,
  )
    .bind(userId, now, claimToken)
    .run();

  return { id };
}

/** Authed: claim a pending Blueprint into the current user account. */
export async function claimPendingBlueprint(
  env: Env,
  request: Request,
  user: DbUser,
): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;
  await ensureBlueprintTables(env);

  let body: { claimToken?: string; childProfileId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }
  const claimToken = String(body.claimToken || "").trim();
  if (!claimToken) return error("claimToken is required.");

  const claimed = await claimPendingBlueprintForUser(env, user.id, claimToken, {
    childProfileId: body.childProfileId ? String(body.childProfileId) : null,
  });
  if (!claimed) {
    return error("Pending Side Hustle Blueprint not found, expired, or already claimed.", 404);
  }

  await appendAudit(env.DB, "blueprint_claimed", user.email, claimed.id);
  const row = await env.DB.prepare(`SELECT * FROM side_hustle_blueprints WHERE id = ?`)
    .bind(claimed.id)
    .first<BlueprintRow>();
  return json({ ok: true, blueprint: row ? publicBlueprint(row) : { id: claimed.id } });
}

/** Authed: save / upsert a completed Blueprint for the current user. */
export async function saveBlueprint(env: Env, request: Request, user: DbUser): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;
  await ensureBlueprintTables(env);

  let body: {
    id?: string;
    ageGroup?: BlueprintAgeGroup;
    answers?: Record<string, unknown>;
    resultIds?: string[];
    resultPcts?: Record<string, number>;
    childProfileId?: string | null;
    claimToken?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }

  if (!isAgeGroup(body.ageGroup)) return error("Invalid age group.");
  const resultIds = Array.isArray(body.resultIds) ? body.resultIds.map(String).filter(Boolean) : [];
  if (resultIds.length === 0) return error("resultIds are required.");

  // Do not trust client scores as authoritative — store for display; IDs come from client ranking.
  const resultPcts = body.resultPcts && typeof body.resultPcts === "object" ? body.resultPcts : {};
  const now = new Date().toISOString();
  const id = body.id && String(body.id).startsWith("bp-") ? String(body.id) : `bp-${crypto.randomUUID()}`;

  const existing = await env.DB.prepare(
    `SELECT id, user_id, unlocked_at FROM side_hustle_blueprints WHERE id = ?`,
  )
    .bind(id)
    .first<{ id: string; user_id: string; unlocked_at: string | null }>();

  if (existing) {
    if (existing.user_id !== user.id) {
      return error("You cannot update another member's Side Hustle Blueprint.", 403);
    }
    await env.DB.prepare(
      `UPDATE side_hustle_blueprints SET
         child_profile_id = ?, age_group = ?, answers_json = ?, result_ids_json = ?,
         result_pcts_json = ?, top_result_id = ?, unlocked = 1,
         unlocked_at = COALESCE(unlocked_at, ?), claim_token = COALESCE(?, claim_token),
         updated_at = ?
       WHERE id = ? AND user_id = ?`,
    )
      .bind(
        body.childProfileId ? String(body.childProfileId) : null,
        body.ageGroup,
        JSON.stringify(body.answers ?? {}),
        JSON.stringify(resultIds),
        JSON.stringify(resultPcts),
        resultIds[0] ?? null,
        now,
        body.claimToken ? String(body.claimToken) : null,
        now,
        id,
        user.id,
      )
      .run();
  } else {
    await env.DB.prepare(
      `INSERT INTO side_hustle_blueprints
        (id, user_id, child_profile_id, age_group, answers_json, result_ids_json, result_pcts_json,
         top_result_id, unlocked, source, claim_token, completed_at, unlocked_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'wizard', ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        user.id,
        body.childProfileId ? String(body.childProfileId) : null,
        body.ageGroup,
        JSON.stringify(body.answers ?? {}),
        JSON.stringify(resultIds),
        JSON.stringify(resultPcts),
        resultIds[0] ?? null,
        body.claimToken ? String(body.claimToken) : null,
        now,
        now,
        now,
        now,
      )
      .run();
  }

  if (body.claimToken) {
    await env.DB.prepare(
      `UPDATE pending_blueprints SET claimed_by_user_id = ?, claimed_at = ? WHERE claim_token = ? AND claimed_by_user_id IS NULL`,
    )
      .bind(user.id, now, String(body.claimToken))
      .run();
  }

  await appendAudit(env.DB, "blueprint_saved", user.email, `${body.ageGroup} · ${id}`);
  const row = await env.DB.prepare(`SELECT * FROM side_hustle_blueprints WHERE id = ? AND user_id = ?`)
    .bind(id, user.id)
    .first<BlueprintRow>();
  return json({ ok: true, blueprint: row ? publicBlueprint(row) : { id } });
}

export async function listBlueprints(env: Env, user: DbUser): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;
  await ensureBlueprintTables(env);

  const { results: owned } = await env.DB.prepare(
    `SELECT * FROM side_hustle_blueprints WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50`,
  )
    .bind(user.id)
    .all<BlueprintRow>();

  let assigned: BlueprintRow[] = [];
  try {
    // Prefer linked login id; also match contact_email so assignments show before link is set.
    const { results } = await env.DB.prepare(
      `SELECT b.* FROM side_hustle_blueprints b
       INNER JOIN child_profiles c ON c.id = b.child_profile_id
       WHERE c.linked_user_id = ?
          OR lower(trim(coalesce(c.contact_email, ''))) = lower(trim(?))
       ORDER BY b.updated_at DESC LIMIT 50`,
    )
      .bind(user.id, user.email)
      .all<BlueprintRow>();
    assigned = results ?? [];
  } catch {
    try {
      const { results } = await env.DB.prepare(
        `SELECT b.* FROM side_hustle_blueprints b
         INNER JOIN child_profiles c ON c.id = b.child_profile_id
         WHERE c.linked_user_id = ?
         ORDER BY b.updated_at DESC LIMIT 50`,
      )
        .bind(user.id)
        .all<BlueprintRow>();
      assigned = results ?? [];
    } catch {
      assigned = [];
    }
  }

  // If email matched a profile without linked_user_id, attach the login for next time.
  try {
    await env.DB.prepare(
      `UPDATE child_profiles
       SET linked_user_id = ?, updated_at = ?
       WHERE linked_user_id IS NULL
         AND lower(trim(coalesce(contact_email, ''))) = lower(trim(?))`,
    )
      .bind(user.id, new Date().toISOString(), user.email)
      .run();
  } catch {
    /* non-fatal */
  }

  const byId = new Map<string, BlueprintRow>();
  for (const row of [...(owned ?? []), ...assigned]) {
    byId.set(row.id, row);
  }

  return json({
    ok: true,
    blueprints: [...byId.values()].map(publicBlueprint),
    user: publicUser(user),
  });
}

export async function getBlueprint(env: Env, user: DbUser, id: string): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;
  await ensureBlueprintTables(env);

  let row = await env.DB.prepare(
    `SELECT * FROM side_hustle_blueprints WHERE id = ? AND user_id = ?`,
  )
    .bind(id, user.id)
    .first<BlueprintRow>();

  if (!row) {
    try {
      row =
        (await env.DB.prepare(
          `SELECT b.* FROM side_hustle_blueprints b
           INNER JOIN child_profiles c ON c.id = b.child_profile_id
           WHERE b.id = ? AND c.linked_user_id = ?`,
        )
          .bind(id, user.id)
          .first<BlueprintRow>()) ?? null;
    } catch {
      row = null;
    }
  }

  if (!row) return error("Side Hustle Blueprint not found.", 404);
  return json({ ok: true, blueprint: publicBlueprint(row) });
}

export async function saveBlueprintFavorite(
  env: Env,
  request: Request,
  user: DbUser,
): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;
  await ensureBlueprintTables(env);

  let body: { blueprintId?: string; hustleId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }
  const blueprintId = String(body.blueprintId || "");
  const hustleId = String(body.hustleId || "");
  if (!blueprintId || !hustleId) return error("blueprintId and hustleId are required.");

  const owned = await env.DB.prepare(
    `SELECT id FROM side_hustle_blueprints WHERE id = ? AND user_id = ?`,
  )
    .bind(blueprintId, user.id)
    .first<{ id: string }>();
  if (!owned) return error("Side Hustle Blueprint not found.", 404);

  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO blueprint_favorites (user_id, blueprint_id, hustle_id, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, blueprint_id, hustle_id) DO NOTHING`,
  )
    .bind(user.id, blueprintId, hustleId, now)
    .run();

  return json({ ok: true });
}
