/**
 * Persist guide Active / Pending / Fixed/Re-Review / Reviewed by QA / Reviewed by Dev / Inactive flags.
 * D1 `published` column: 0 = inactive, 1 = active, 2 = pending, 3 = reviewed_by_qa, 4 = reviewed_by_dev, 5 = fixed_rereview.
 * Reviewed by QA / Dev also hold Active (published: true). Only Evelyn may set Reviewed by Dev.
 * Pending stays hidden (Reviewed + Inactive). Fixed/Re-Review stays hidden for QA re-review (Not Reviewed).
 * Every status / membership / soft-delete write appends to `guide_catalog_change_log`.
 * Pending requires a note (≥8 chars) that is copied onto the associated GUIDE-REV test as Fail
 * and onto the guide Notes tab.
 */
import { error, json, type DbUser, type Env, userRoles } from "./auth";
import { canAccessTestingPortal } from "./roles";
import { canSetGuideReviewedByDev } from "./roles";
import type { GuideChangeLogAction, GuideChangeLogEntry } from "../../src/lib/guide-change-log";
import { isGuideChangeLogAction } from "../../src/lib/guide-change-log";
import {
  defaultStatusForGuide,
  sanitizeGuideCatalogPatch,
} from "../../src/lib/guide-catalog-state";
import { mergeNoteEntries } from "./note-entries";
import {
  guideLibraryPendingFailNote,
  guideReviewCaseIdsForGuide,
} from "./guide-review-link";
import { insertPendingStatusGuideNote } from "./guide-notes";
import {
  normalizeSyncedGuideAssignee,
  syncGuideAssigneeToLinkedTests,
} from "./guide-assignee-sync";

type GuideVisibilityStatus =
  | "active"
  | "pending"
  | "fixed_rereview"
  | "reviewed_by_qa"
  | "reviewed_by_dev"
  | "inactive";

const GUIDE_STATUS_NOTE_MIN_LENGTH = 8;

function guideStatusRequiresNote(status: GuideVisibilityStatus): boolean {
  return status === "pending";
}

function guideStatusNoteMeetsRequirement(note: string | null | undefined): boolean {
  return String(note ?? "").trim().length >= GUIDE_STATUS_NOTE_MIN_LENGTH;
}

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
  /** Field overrides (name, kit body, membership floor, etc.). */
  patch?: Record<string, unknown>;
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
  const out: Record<string, unknown> = {};
  const minTier = normalizeMinTier(parsed.minTier);
  if (minTier) out.minTier = minTier;
  if (typeof parsed.name === "string" && parsed.name.trim()) out.name = parsed.name.trim();
  if (typeof parsed.description === "string") out.description = String(parsed.description);
  if (typeof parsed.peek === "string") out.peek = String(parsed.peek);
  if (typeof parsed.category === "string" && parsed.category.trim()) {
    out.category = String(parsed.category).trim();
  }
  if (Array.isArray(parsed.audiences)) out.audiences = parsed.audiences;
  if (Array.isArray(parsed.membershipTiers)) out.membershipTiers = parsed.membershipTiers;
  if (Array.isArray(parsed.prerequisites)) out.prerequisites = parsed.prerequisites;
  if (Array.isArray(parsed.tools)) out.tools = parsed.tools;
  if (Array.isArray(parsed.steps)) out.steps = parsed.steps;
  if (parsed.supplies && typeof parsed.supplies === "object" && !Array.isArray(parsed.supplies)) {
    out.supplies = parsed.supplies;
  }
  if (
    parsed.suggestedPricing &&
    typeof parsed.suggestedPricing === "object" &&
    !Array.isArray(parsed.suggestedPricing)
  ) {
    out.suggestedPricing = parsed.suggestedPricing;
  }
  if ("assignee" in parsed) {
    const assignee = normalizeSyncedGuideAssignee(parsed.assignee);
    out.assignee = assignee;
  }
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

/** Admin Studio or Testing Portal (QA) may edit guide catalog content / status. */
function actorCanEditGuideCatalog(actor: DbUser): boolean {
  return actorIsAdmin(actor) || canAccessTestingPortal(userRoles(actor));
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

/**
 * Copy Pending reason onto the guide Notes tab and the primary GUIDE-REV test as Fail.
 */
async function syncPendingNoteToGuideReviewTest(
  env: Env,
  guideId: string,
  reason: string,
  actor: DbUser,
  now: string,
): Promise<void> {
  await insertPendingStatusGuideNote(env, guideId, reason, actor, now);

  const caseIds = guideReviewCaseIdsForGuide(guideId);
  const caseId = caseIds[0];
  if (!caseId) return;

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS test_case_status (
       case_id TEXT PRIMARY KEY,
       status TEXT NOT NULL DEFAULT 'not_run',
       note TEXT NOT NULL DEFAULT '',
       assignee TEXT NOT NULL DEFAULT '',
       sprint INTEGER,
       due_date TEXT,
       checked_steps_json TEXT,
       failed_step_index INTEGER,
       assigned_by TEXT,
       date_assigned TEXT,
       original_assignee TEXT,
       updated_at TEXT,
       updated_by TEXT
     )`,
  ).run();

  const by = String(actor.name || actor.email || actor.id || "").trim() || "Admin";
  const noteBody = guideLibraryPendingFailNote({
    guideId,
    updatedBy: by,
    updatedAt: now,
    reason,
  });

  const prev = await env.DB.prepare(
    `SELECT note, assignee, sprint, due_date, checked_steps_json, failed_step_index,
            assigned_by, date_assigned, original_assignee
     FROM test_case_status WHERE case_id = ?`,
  )
    .bind(caseId)
    .first<{
      note: string;
      assignee: string | null;
      sprint: number | string | null;
      due_date: string | null;
      checked_steps_json: string | null;
      failed_step_index: number | null;
      assigned_by: string | null;
      date_assigned: string | null;
      original_assignee: string | null;
    }>();

  const incomingEntry = JSON.stringify([
    {
      id: `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      author: by,
      createdAt: now,
      updatedAt: now,
      text: noteBody,
    },
  ]);
  const merged = mergeNoteEntries(prev?.note ?? "", incomingEntry, by, now);
  if (!merged.ok) return;
  const sprintNum = Number(prev?.sprint);
  const sprint = Number.isFinite(sprintNum) ? sprintNum : 6;

  await env.DB.prepare(
    `INSERT INTO test_case_status
       (case_id, status, note, assignee, sprint, due_date, checked_steps_json, failed_step_index,
        assigned_by, date_assigned, original_assignee, updated_at, updated_by)
     VALUES (?, 'fail', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(case_id) DO UPDATE SET
       status = 'fail',
       note = excluded.note,
       updated_at = excluded.updated_at,
       updated_by = excluded.updated_by`,
  )
    .bind(
      caseId,
      merged.notes,
      String(prev?.assignee ?? "lyriq").trim() || "lyriq",
      sprint,
      prev?.due_date ?? null,
      prev?.checked_steps_json ?? null,
      prev?.failed_step_index ?? null,
      prev?.assigned_by ?? by,
      prev?.date_assigned ?? null,
      prev?.original_assignee ?? null,
      now,
      by,
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
 * When QA Passes a GUIDE-REV-* Testing Portal case, mark that guide
 * Reviewed by QA / No Changes (UI holds Active + Reviewed — not Fixed/Re-Review).
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

/**
 * When a GUIDE-REV test is Failed, set the linked guide Inactive (hidden).
 */
export async function markGuideInactiveFromQaFail(
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
  if (prev === "inactive") return;
  const custom = existing ? Number(existing.custom) !== 0 : false;
  const patchJson = existing?.patch_json || "{}";
  const nextStatus: GuideVisibilityStatus = "inactive";
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
    action: "status",
    fromStatus: prev,
    toStatus: nextStatus,
    detail: { reason: "GUIDE-REV test Failed" },
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
    note?: string;
    patch?: unknown;
    name?: unknown;
    description?: unknown;
    peek?: unknown;
    prerequisites?: unknown;
    tools?: unknown;
    steps?: unknown;
    supplies?: unknown;
    suggestedPricing?: unknown;
    assignee?: unknown;
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

  const contentBody: Record<string, unknown> = {};
  if (body.patch && typeof body.patch === "object" && !Array.isArray(body.patch)) {
    Object.assign(contentBody, body.patch as Record<string, unknown>);
  }
  if ("name" in body) contentBody.name = body.name;
  if ("description" in body) contentBody.description = body.description;
  if ("peek" in body) contentBody.peek = body.peek;
  if ("prerequisites" in body) contentBody.prerequisites = body.prerequisites;
  if ("tools" in body) contentBody.tools = body.tools;
  if ("steps" in body) contentBody.steps = body.steps;
  if ("supplies" in body) contentBody.supplies = body.supplies;
  if ("suggestedPricing" in body) contentBody.suggestedPricing = body.suggestedPricing;
  if ("assignee" in body) contentBody.assignee = body.assignee;
  const hasContent =
    "name" in contentBody ||
    "description" in contentBody ||
    "peek" in contentBody ||
    "prerequisites" in contentBody ||
    "tools" in contentBody ||
    "steps" in contentBody ||
    "supplies" in contentBody ||
    "suggestedPricing" in contentBody ||
    "category" in contentBody ||
    "audiences" in contentBody ||
    "membershipTiers" in contentBody ||
    "minTier" in contentBody ||
    "assignee" in contentBody;

  if (!hasStatus && !hasPublished && !hasDeleted && !hasMinTier && !hasContent) {
    return error("status, published, deleted, minTier, or content patch is required.");
  }

  if (!actorCanEditGuideCatalog(actor)) {
    return error("Admin or QA access required.", 403);
  }

  if (normalizedStatus === "reviewed_by_dev" && !canSetGuideReviewedByDev(actor)) {
    return error("Only Evelyn may set Reviewed by Dev.", 403);
  }

  const note = String(body.note ?? "").trim();
  if (normalizedStatus && guideStatusRequiresNote(normalizedStatus) && !guideStatusNoteMeetsRequirement(note)) {
    return error(
      `A note is required for Pending / Needs Further Review (at least ${GUIDE_STATUS_NOTE_MIN_LENGTH} characters).`,
      400,
    );
  }

  const result = await writeGuideCatalogStatus(env, {
    guideId,
    status: hasStatus ? normalizedStatus! : undefined,
    published: hasPublished ? body.published : undefined,
    deleted: hasDeleted ? body.deleted === true : undefined,
    minTier: hasMinTier ? minTier! : undefined,
    contentPatch: hasContent ? contentBody : undefined,
    note: note || undefined,
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
    /** Merged into patch_json (name, steps, tools, prerequisites, …). */
    contentPatch?: Record<string, unknown>;
    note?: string;
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
    : defaultStatusForGuide(guideId);
  const prevDeleted = existing ? Number(existing.deleted) !== 0 : false;
  const prevPatch = parsePatchJson(existing?.patch_json);
  const prevMinTier = normalizeMinTier(prevPatch.minTier);

  let status = prevStatus;
  let deleted = prevDeleted;
  const custom = existing ? Number(existing.custom) !== 0 : false;
  let patch = { ...prevPatch };
  const hasContentPatch = Boolean(
    input.contentPatch && Object.keys(input.contentPatch).length,
  );

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
  if (input.contentPatch) {
    const sanitized = sanitizeGuideCatalogPatch({ ...patch, ...input.contentPatch });
    if (sanitized) patch = { ...patch, ...sanitized };
    if ("assignee" in input.contentPatch) {
      patch.assignee = normalizeSyncedGuideAssignee(input.contentPatch.assignee);
    }
  }

  const now = new Date().toISOString();
  const by = String(input.actor.name || input.actor.email || input.actor.id || "").trim();
  const publishedCode = codeFromStatus(status);
  const patchJson = JSON.stringify(patch);
  const note = String(input.note || "").trim();

  await env.DB.prepare(
    `INSERT INTO guide_catalog_state
      (guide_id, published, deleted, custom, patch_json, updated_at, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(guide_id) DO UPDATE SET
       published = excluded.published,
       deleted = excluded.deleted,
       patch_json = CASE WHEN ? = 1 THEN excluded.patch_json ELSE guide_catalog_state.patch_json END,
       updated_at = excluded.updated_at,
       updated_by = excluded.updated_by`,
  )
    .bind(
      guideId,
      publishedCode,
      deleted ? 1 : 0,
      custom ? 1 : 0,
      patchJson,
      now,
      by,
      hasContentPatch || Boolean(input.minTier) ? 1 : 0,
    )
    .run();

  const nextMinTier = normalizeMinTier(patch.minTier);
  const statusDetail = note ? { note } : undefined;
  if (!prevDeleted && deleted) {
    await appendGuideChangeLog(env, {
      guideId,
      changedAt: now,
      changedBy: by,
      action: "delete",
      fromStatus: prevStatus,
      toStatus: status,
      detail: statusDetail,
    });
  } else if (prevDeleted && !deleted) {
    await appendGuideChangeLog(env, {
      guideId,
      changedAt: now,
      changedBy: by,
      action: "restore",
      fromStatus: prevStatus,
      toStatus: status,
      detail: statusDetail,
    });
  } else if (prevStatus !== status) {
    await appendGuideChangeLog(env, {
      guideId,
      changedAt: now,
      changedBy: by,
      action: "status",
      fromStatus: prevStatus,
      toStatus: status,
      detail: statusDetail,
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
  if (input.contentPatch) {
    const keys = Object.keys(input.contentPatch).filter((k) => k !== "minTier");
    if (keys.length) {
      await appendGuideChangeLog(env, {
        guideId,
        changedAt: now,
        changedBy: by,
        action: "content",
        fromStatus: prevStatus,
        toStatus: status,
        detail: { fields: keys },
      });
    }
  }

  if (status === "pending" && note && prevStatus !== "pending") {
    await syncPendingNoteToGuideReviewTest(env, guideId, note, input.actor, now);
  }

  if (input.contentPatch && "assignee" in input.contentPatch) {
    await syncGuideAssigneeToLinkedTests(
      env,
      guideId,
      normalizeSyncedGuideAssignee(patch.assignee),
      by,
      now,
    );
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
  let body: { guideIds?: unknown; status?: unknown; note?: string };
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

  const note = String(body.note ?? "").trim();
  if (guideStatusRequiresNote(status) && !guideStatusNoteMeetsRequirement(note)) {
    return error(
      `A note is required for Pending / Needs Further Review (at least ${GUIDE_STATUS_NOTE_MIN_LENGTH} characters).`,
      400,
    );
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
          `SELECT guide_id, published, deleted, custom, patch_json FROM guide_catalog_state WHERE guide_id IN (${placeholders})`,
        )
          .bind(...guideIds)
          .all<{
            guide_id: string;
            published: number;
            deleted: number;
            custom: number;
            patch_json: string;
          }>()
      ).results ?? []
    : [];
  const existingById = new Map(existingRows.map((r) => [r.guide_id, r] as const));
  const prevById = new Map(
    existingRows.map((r) => [r.guide_id, statusFromCode(Number(r.published) || 0)] as const),
  );

  const detailJson = note ? JSON.stringify({ note }) : "{}";

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
      detailJson,
    ),
  );

  await env.DB.batch([...statements, ...logStatements]);

  if (status === "pending" && note) {
    for (const guideId of guideIds) {
      if (prevById.get(guideId) === "pending") continue;
      await syncPendingNoteToGuideReviewTest(env, guideId, note, actor, now);
    }
  }

  const states: Record<string, GuideCatalogPublicState> = {};
  for (const guideId of guideIds) {
    const existing = existingById.get(guideId);
    states[guideId] = {
      published: holdsActive(status),
      status,
      deleted: false,
      custom: existing ? Number(existing.custom) !== 0 : false,
      patch: publicPatchFromJson(existing?.patch_json),
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
          fields: Array.isArray(parsed.fields)
            ? parsed.fields.map((f) => String(f)).filter(Boolean)
            : undefined,
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

/** Admin / QA: per-guide change history. */
export async function handleGuideCatalogHistory(
  env: Env,
  request: Request,
  actor?: DbUser | null,
): Promise<Response> {
  if (!actor) return error("QA or Admin session required.", 401);
  const method = request.method.toUpperCase();
  if (method !== "GET") return error("Method not allowed.", 405);
  return listGuideChangeLog(env, request);
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
