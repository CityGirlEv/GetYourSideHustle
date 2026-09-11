/**
 * Persist guide Active / Pending / Fixed/Re-Review / Reviewed by QA / Reviewed by Dev / Inactive flags.
 * D1 `published` column: 0 = inactive, 1 = active, 2 = pending, 3 = reviewed_by_qa, 4 = reviewed_by_dev, 5 = fixed_rereview.
 * Reviewed by QA / Dev also hold Active (published: true). Only Evelyn may set Reviewed by Dev.
 * Pending stays hidden (Reviewed + Inactive). Fixed/Re-Review stays hidden for QA re-review (Not Reviewed).
 * Every status / membership / soft-delete write appends to `guide_catalog_change_log`.
 */
import { error, json, type DbUser, type Env, userRoles } from "./auth";
import { canSetGuideReviewedByDev } from "./roles";
import type { GuideChangeLogAction, GuideChangeLogEntry } from "../../src/lib/guide-change-log";
import { isGuideChangeLogAction } from "../../src/lib/guide-change-log";

type GuideVisibilityStatus =
  | "active"
  | "pending"
  | "fixed_rereview"
  | "reviewed_by_qa"
  | "reviewed_by_dev"
  | "inactive";

type GuideRow = {
  guide_id: string;
  published: number;
  deleted: number;
  custom: number;
  patch_json: string;
  updated_at: string;
  updated_by: string;
};

export type GuideCatalogPublicState = {
  /** True when Active or a review status that also holds Active. */
  published: boolean;
  status: GuideVisibilityStatus;
  deleted: boolean;
  custom: boolean;
  /** Field overrides (e.g. Admin-set membership floor). */
  patch?: { minTier?: string; name?: string; description?: string; peek?: string };
  updatedAt?: string;
  updatedBy?: string;
};

const TIER_VALUES = new Set(["free", "starter", "pro", "elite"]);

function holdsActive(status: GuideVisibilityStatus): boolean {
  return status === "active" || status === "reviewed_by_qa" || status === "reviewed_by_dev";
}

function normalizeMinTier(value: unknown): string | null {
  const t = String(value || "")
    .trim()
    .toLowerCase();
  return TIER_VALUES.has(t) ? t : null;
}

function parsePatchJson(raw: string | null | undefined): Record<string, unknown> {
  try {
    const parsed = JSON.parse(String(raw || "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function publicPatchFromJson(raw: string | null | undefined): GuideCatalogPublicState["patch"] {
  const parsed = parsePatchJson(raw);
  const out: NonNullable<GuideCatalogPublicState["patch"]> = {};
  const minTier = normalizeMinTier(parsed.minTier);
  if (minTier) out.minTier = minTier;
  if (typeof parsed.name === "string" && parsed.name.trim()) out.name = parsed.name.trim();
  if (typeof parsed.description === "string") out.description = String(parsed.description);
  if (typeof parsed.peek === "string") out.peek = String(parsed.peek);
  return Object.keys(out).length ? out : undefined;
}

function statusFromCode(code: number): GuideVisibilityStatus {
  if (code === 1) return "active";
  if (code === 2) return "pending";
  if (code === 3) return "reviewed_by_qa";
  if (code === 4) return "reviewed_by_dev";
  if (code === 5) return "fixed_rereview";
  return "inactive";
}

function codeFromStatus(status: GuideVisibilityStatus): number {
  if (status === "active") return 1;
  if (status === "pending") return 2;
  if (status === "reviewed_by_qa") return 3;
  if (status === "reviewed_by_dev") return 4;
  if (status === "fixed_rereview") return 5;
  return 0;
}

function normalizeIncomingStatus(value: unknown): GuideVisibilityStatus | null {
  if (value === "in_review") return "reviewed_by_qa";
  if (
    value === "active" ||
    value === "pending" ||
    value === "fixed_rereview" ||
    value === "reviewed_by_qa" ||
    value === "reviewed_by_dev" ||
    value === "inactive"
  ) {
    return value;
  }
  return null;
}

function actorIsAdmin(actor: DbUser): boolean {
  return userRoles(actor).includes("admin");
}

export async function ensureGuideCatalogTable(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS guide_catalog_state (
      guide_id TEXT PRIMARY KEY,
      published INTEGER NOT NULL DEFAULT 1,
      deleted INTEGER NOT NULL DEFAULT 0,
      custom INTEGER NOT NULL DEFAULT 0,
      patch_json TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL DEFAULT ''
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS guide_catalog_change_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guide_id TEXT NOT NULL,
      changed_at TEXT NOT NULL,
      changed_by TEXT NOT NULL DEFAULT '',
      action TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT,
      detail_json TEXT NOT NULL DEFAULT '{}'
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_guide_catalog_change_log_guide
     ON guide_catalog_change_log (guide_id, changed_at DESC)`,
  ).run();
}

async function appendGuideChangeLog(
  env: Env,
  entry: {
    guideId: string;
    changedAt: string;
    changedBy: string;
    action: GuideChangeLogAction;
    fromStatus?: GuideVisibilityStatus | null;
    toStatus?: GuideVisibilityStatus | null;
    detail?: Record<string, unknown>;
  },
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO guide_catalog_change_log
      (guide_id, changed_at, changed_by, action, from_status, to_status, detail_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      entry.guideId,
      entry.changedAt,
      entry.changedBy,
      entry.action,
      entry.fromStatus ?? null,
      entry.toStatus ?? null,
      JSON.stringify(entry.detail ?? {}),
    )
    .run();
}

function rowToPublic(row: GuideRow): GuideCatalogPublicState {
  const status = statusFromCode(Number(row.published) || 0);
  return {
    published: holdsActive(status),
    status,
    deleted: Number(row.deleted) !== 0,
    custom: Number(row.custom) !== 0,
    patch: publicPatchFromJson(row.patch_json),
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

/**
 * When Lyriq (or QA) Passes a GUIDE-REV-* Testing Portal case, mark that guide
 * Reviewed by QA / No Changes (also holds Active — live for members).
 */
export async function markGuideReviewedByQa(
  env: Env,
  guideId: string,
  updatedBy: string,
): Promise<void> {
  const id = String(guideId || "").trim();
  if (!id) return;
  await ensureGuideCatalogTable(env);
  const now = new Date().toISOString();
  const by = String(updatedBy || "QA").trim() || "QA";
  const existing = await env.DB.prepare(
    `SELECT guide_id, published, deleted, custom, patch_json FROM guide_catalog_state WHERE guide_id = ?`,
  )
    .bind(id)
    .first<GuideRow>();
  const prev = existing ? statusFromCode(Number(existing.published) || 0) : null;
  /** Already QA- or Dev-reviewed — keep the stronger Dev badge; no-op for QA. */
  if (prev === "reviewed_by_qa" || prev === "reviewed_by_dev") {
    return;
  }
  const custom = existing ? Number(existing.custom) !== 0 : false;
  const patchJson = existing?.patch_json || "{}";
  const nextStatus: GuideVisibilityStatus = "reviewed_by_qa";
  await env.DB.prepare(
    `INSERT INTO guide_catalog_state
      (guide_id, published, deleted, custom, patch_json, updated_at, updated_by)
     VALUES (?, ?, 0, ?, ?, ?, ?)
     ON CONFLICT(guide_id) DO UPDATE SET
       published = excluded.published,
       deleted = 0,
       updated_at = excluded.updated_at,
       updated_by = excluded.updated_by`,
  )
    .bind(id, codeFromStatus(nextStatus), custom ? 1 : 0, patchJson, now, by)
    .run();
  await appendGuideChangeLog(env, {
    guideId: id,
    changedAt: now,
    changedBy: by,
    action: "qa_pass",
    fromStatus: prev,
    toStatus: nextStatus,
  });
}

export async function listGuideCatalogStates(env: Env): Promise<Response> {
  await ensureGuideCatalogTable(env);
  const { results } = await env.DB.prepare(
    `SELECT guide_id, published, deleted, custom, patch_json, updated_at, updated_by
     FROM guide_catalog_state`,
  ).all<GuideRow>();

  const states: Record<string, GuideCatalogPublicState> = {};
  for (const row of results ?? []) {
    states[row.guide_id] = rowToPublic(row);
  }
  return json({ states });
}

export async function upsertGuideCatalogState(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureGuideCatalogTable(env);
  let body: {
    guideId?: string;
    status?: unknown;
    published?: boolean;
    deleted?: boolean;
    minTier?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const guideId = String(body.guideId || "").trim();
  if (!guideId) return error("guideId is required.");

  const normalizedStatus = normalizeIncomingStatus(body.status);
  const hasStatus = normalizedStatus !== null;
  const hasPublished = typeof body.published === "boolean";
  const hasDeleted = typeof body.deleted === "boolean";
  const minTier = normalizeMinTier(body.minTier);
  const hasMinTier = minTier !== null;
  if (!hasStatus && !hasPublished && !hasDeleted && !hasMinTier) {
    return error("status, published, deleted, or minTier is required.");
  }

  if (!actorIsAdmin(actor)) {
    return error("Admin access required.", 403);
  }

  if (normalizedStatus === "reviewed_by_dev" && !canSetGuideReviewedByDev(actor)) {
    return error("Only Evelyn may set Reviewed by Dev.", 403);
  }

  const result = await writeGuideCatalogStatus(env, {
    guideId,
    status: hasStatus ? normalizedStatus! : undefined,
    published: hasPublished ? body.published : undefined,
    deleted: hasDeleted ? body.deleted === true : undefined,
    minTier: hasMinTier ? minTier! : undefined,
    actor,
  });

  return json({
    ok: true,
    guideId,
    state: result,
  });
}

async function writeGuideCatalogStatus(
  env: Env,
  input: {
    guideId: string;
    status?: GuideVisibilityStatus;
    published?: boolean;
    deleted?: boolean;
    minTier?: string;
    actor: DbUser;
  },
): Promise<GuideCatalogPublicState> {
  const guideId = input.guideId;
  const existing = await env.DB.prepare(
    `SELECT guide_id, published, deleted, custom, patch_json, updated_at, updated_by
     FROM guide_catalog_state WHERE guide_id = ?`,
  )
    .bind(guideId)
    .first<GuideRow>();

  const prevStatus = existing
    ? statusFromCode(Number(existing.published) || 0)
    : ("inactive" as GuideVisibilityStatus);
  const prevDeleted = existing ? Number(existing.deleted) !== 0 : false;
  const prevPatch = parsePatchJson(existing?.patch_json);
  const prevMinTier = normalizeMinTier(prevPatch.minTier);

  let status = prevStatus;
  let deleted = prevDeleted;
  const custom = existing ? Number(existing.custom) !== 0 : false;
  const patch = { ...prevPatch };

  if (input.status) {
    status = input.status;
    if (holdsActive(status)) deleted = false;
  } else if (typeof input.published === "boolean") {
    status = input.published ? "active" : "inactive";
    if (input.published) deleted = false;
  }
  if (typeof input.deleted === "boolean") {
    deleted = input.deleted === true;
    if (deleted) status = "inactive";
  }
  if (input.minTier) {
    patch.minTier = input.minTier;
  }

  const now = new Date().toISOString();
  const by = String(input.actor.name || input.actor.email || input.actor.id || "").trim();
  const publishedCode = codeFromStatus(status);
  const patchJson = JSON.stringify(patch);

  await env.DB.prepare(
    `INSERT INTO guide_catalog_state
      (guide_id, published, deleted, custom, patch_json, updated_at, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(guide_id) DO UPDATE SET
       published = excluded.published,
       deleted = excluded.deleted,
       patch_json = excluded.patch_json,
       updated_at = excluded.updated_at,
       updated_by = excluded.updated_by`,
  )
    .bind(guideId, publishedCode, deleted ? 1 : 0, custom ? 1 : 0, patchJson, now, by)
    .run();

  const nextMinTier = normalizeMinTier(patch.minTier);
  if (!prevDeleted && deleted) {
    await appendGuideChangeLog(env, {
      guideId,
      changedAt: now,
      changedBy: by,
      action: "delete",
      fromStatus: prevStatus,
      toStatus: status,
    });
  } else if (prevDeleted && !deleted) {
    await appendGuideChangeLog(env, {
      guideId,
      changedAt: now,
      changedBy: by,
      action: "restore",
      fromStatus: prevStatus,
      toStatus: status,
    });
  } else if (prevStatus !== status) {
    await appendGuideChangeLog(env, {
      guideId,
      changedAt: now,
      changedBy: by,
      action: "status",
      fromStatus: prevStatus,
      toStatus: status,
    });
  }
  if (input.minTier && nextMinTier && nextMinTier !== prevMinTier) {
    await appendGuideChangeLog(env, {
      guideId,
      changedAt: now,
      changedBy: by,
      action: "min_tier",
      fromStatus: prevStatus,
      toStatus: status,
      detail: { minTier: nextMinTier },
    });
  }

  return {
    published: holdsActive(status),
    status,
    deleted,
    custom,
    patch: publicPatchFromJson(patchJson),
    updatedAt: now,
    updatedBy: by,
  };
}

/** Bulk set Active / Pending / Reviewed by QA / Reviewed by Dev / Inactive for many guides. */
export async function bulkUpsertGuideCatalogStates(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureGuideCatalogTable(env);
  let body: { guideIds?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  if (!actorIsAdmin(actor)) {
    return error("Admin access required.", 403);
  }

  const status = normalizeIncomingStatus(body.status);
  if (!status) {
    return error(
      "status must be active, pending, fixed_rereview, reviewed_by_qa, reviewed_by_dev, or inactive.",
    );
  }

  if (status === "reviewed_by_dev" && !canSetGuideReviewedByDev(actor)) {
    return error("Only Evelyn may set Reviewed by Dev.", 403);
  }

  const guideIds = Array.isArray(body.guideIds)
    ? [...new Set(body.guideIds.map((id) => String(id || "").trim()).filter(Boolean))]
    : [];
  if (!guideIds.length) return error("guideIds is required.");
  if (guideIds.length > 200) return error("Too many guideIds (max 200).");

  const now = new Date().toISOString();
  const by = String(actor.name || actor.email || actor.id || "").trim();
  const publishedCode = codeFromStatus(status);

  const placeholders = guideIds.map(() => "?").join(",");
  const existingRows = placeholders
    ? (
        await env.DB.prepare(
          `SELECT guide_id, published FROM guide_catalog_state WHERE guide_id IN (${placeholders})`,
        )
          .bind(...guideIds)
          .all<{ guide_id: string; published: number }>()
      ).results ?? []
    : [];
  const prevById = new Map(
    existingRows.map((r) => [r.guide_id, statusFromCode(Number(r.published) || 0)] as const),
  );

  const statements = guideIds.map((guideId) =>
    env.DB.prepare(
      `INSERT INTO guide_catalog_state
        (guide_id, published, deleted, custom, patch_json, updated_at, updated_by)
       VALUES (?, ?, 0, 0, '{}', ?, ?)
       ON CONFLICT(guide_id) DO UPDATE SET
         published = excluded.published,
         deleted = excluded.deleted,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    ).bind(guideId, publishedCode, now, by),
  );

  const logStatements = guideIds.map((guideId) =>
    env.DB.prepare(
      `INSERT INTO guide_catalog_change_log
        (guide_id, changed_at, changed_by, action, from_status, to_status, detail_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      guideId,
      now,
      by,
      "bulk_status",
      prevById.get(guideId) ?? null,
      status,
      "{}",
    ),
  );

  await env.DB.batch([...statements, ...logStatements]);

  const states: Record<string, GuideCatalogPublicState> = {};
  for (const guideId of guideIds) {
    states[guideId] = {
      published: holdsActive(status),
      status,
      deleted: false,
      custom: false,
      updatedAt: now,
      updatedBy: by,
    };
  }

  return json({ ok: true, status, count: guideIds.length, states });
}

export async function listGuideChangeLog(
  env: Env,
  request: Request,
): Promise<Response> {
  await ensureGuideCatalogTable(env);
  const url = new URL(request.url);
  const guideId = String(url.searchParams.get("guideId") || "").trim();
  if (!guideId) return error("guideId is required.");
  const limitRaw = Number(url.searchParams.get("limit") || 50);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.floor(limitRaw), 1), 200) : 50;

  const { results } = await env.DB.prepare(
    `SELECT id, guide_id, changed_at, changed_by, action, from_status, to_status, detail_json
     FROM guide_catalog_change_log
     WHERE guide_id = ?
     ORDER BY changed_at DESC, id DESC
     LIMIT ?`,
  )
    .bind(guideId, limit)
    .all<{
      id: number;
      guide_id: string;
      changed_at: string;
      changed_by: string;
      action: string;
      from_status: string | null;
      to_status: string | null;
      detail_json: string;
    }>();

  const entries: GuideChangeLogEntry[] = (results ?? []).map((row) => {
    let detail: GuideChangeLogEntry["detail"];
    try {
      const parsed = JSON.parse(row.detail_json || "{}") as Record<string, unknown>;
      if (parsed && typeof parsed === "object") {
        detail = {
          minTier: typeof parsed.minTier === "string" ? parsed.minTier : undefined,
          note: typeof parsed.note === "string" ? parsed.note : undefined,
        };
      }
    } catch {
      detail = undefined;
    }
    return {
      id: row.id,
      guideId: row.guide_id,
      changedAt: row.changed_at,
      changedBy: row.changed_by || "",
      action: isGuideChangeLogAction(row.action) ? row.action : "status",
      fromStatus: normalizeIncomingStatus(row.from_status),
      toStatus: normalizeIncomingStatus(row.to_status),
      detail,
    };
  });

  return json({ guideId, entries });
}

export async function handleGuideCatalog(
  env: Env,
  request: Request,
  actor?: DbUser | null,
): Promise<Response> {
  const method = request.method.toUpperCase();
  if (method === "GET") return listGuideCatalogStates(env);
  if (method === "PUT" || method === "POST") {
    if (!actor) return error("Admin session required.", 401);
    return upsertGuideCatalogState(env, request, actor);
  }
  return error("Method not allowed.", 405);
}

export async function handleGuideCatalogBulk(
  env: Env,
  request: Request,
  actor?: DbUser | null,
): Promise<Response> {
  const method = request.method.toUpperCase();
  if (method !== "POST" && method !== "PUT") {
    return error("Method not allowed.", 405);
  }
  if (!actor) return error("Admin session required.", 401);
  return bulkUpsertGuideCatalogStates(env, request, actor);
}
