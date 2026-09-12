/**
 * Bidirectional Guide Library ↔ GUIDE-REV test assignee sync (D1).
 * Guide writes update test_case_status; test assignee writes update guide patch_json.
 * Neither path calls the other handler — avoids loops.
 */
import type { Env } from "./auth";
import { guideIdFromGuideReviewCaseId, guideReviewCaseIdsForGuide } from "./guide-review-link";
import { isHumanQaTesterId, normalizeQaAssigneeId } from "../../src/lib/gysh-roles";

/** Primary human QA id from a single or multi (`tina+evelyn`) assignee string. */
export function normalizeSyncedGuideAssignee(raw: unknown): string {
  const text = String(raw ?? "").trim();
  if (!text || /^unassigned$/i.test(text)) return "";
  for (const part of text.split(/[+,&|/]/)) {
    const id = normalizeQaAssigneeId(part);
    if (!id || id === "unassigned" || !isHumanQaTesterId(id)) continue;
    return id;
  }
  return "";
}

async function ensureTestCaseStatusTable(env: Env): Promise<void> {
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
}

async function ensureGuideCatalogTableLite(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS guide_catalog_state (
       guide_id TEXT PRIMARY KEY,
       published INTEGER NOT NULL DEFAULT 0,
       deleted INTEGER NOT NULL DEFAULT 0,
       custom INTEGER NOT NULL DEFAULT 0,
       patch_json TEXT NOT NULL DEFAULT '{}',
       updated_at TEXT,
       updated_by TEXT
     )`,
  ).run();
}

/**
 * Mirror guide assignee onto linked GUIDE-REV test row(s).
 * Upserts the primary case; updates other kind rows only when they already exist.
 */
export async function syncGuideAssigneeToLinkedTests(
  env: Env,
  guideId: string,
  assigneeRaw: unknown,
  actorLabel: string,
  now: string,
): Promise<void> {
  const id = String(guideId || "").trim();
  if (!id) return;
  const assignee = normalizeSyncedGuideAssignee(assigneeRaw);
  const caseIds = guideReviewCaseIdsForGuide(id);
  const primary = caseIds[0];
  if (!primary) return;

  await ensureTestCaseStatusTable(env);
  const by = String(actorLabel || "").trim() || "Admin";

  const prev = await env.DB.prepare(
    `SELECT status, note, sprint, due_date, checked_steps_json, failed_step_index,
            assigned_by, date_assigned, original_assignee, assignee
     FROM test_case_status WHERE case_id = ?`,
  )
    .bind(primary)
    .first<{
      status: string;
      note: string;
      sprint: number | string | null;
      due_date: string | null;
      checked_steps_json: string | null;
      failed_step_index: number | null;
      assigned_by: string | null;
      date_assigned: string | null;
      original_assignee: string | null;
      assignee: string | null;
    }>();

  if (String(prev?.assignee ?? "").trim() === assignee) {
    // Still refresh sibling rows that exist with a different assignee.
  } else {
    const sprintNum = Number(prev?.sprint);
    const sprint = Number.isFinite(sprintNum) ? sprintNum : 6;
    await env.DB.prepare(
      `INSERT INTO test_case_status
         (case_id, status, note, assignee, sprint, due_date, checked_steps_json, failed_step_index,
          assigned_by, date_assigned, original_assignee, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(case_id) DO UPDATE SET
         assignee = excluded.assignee,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
      .bind(
        primary,
        String(prev?.status ?? "not_run") || "not_run",
        String(prev?.note ?? ""),
        assignee,
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

  for (const caseId of caseIds.slice(1)) {
    const row = await env.DB.prepare(
      `SELECT assignee FROM test_case_status WHERE case_id = ?`,
    )
      .bind(caseId)
      .first<{ assignee: string | null }>();
    if (!row) continue;
    if (String(row.assignee ?? "").trim() === assignee) continue;
    await env.DB.prepare(
      `UPDATE test_case_status SET assignee = ?, updated_at = ?, updated_by = ? WHERE case_id = ?`,
    )
      .bind(assignee, now, by, caseId)
      .run();
  }
}

/**
 * When a GUIDE-REV test assignee changes, mirror onto the guide's patch_json.assignee.
 */
export async function syncLinkedTestAssigneeToGuide(
  env: Env,
  caseId: string,
  assigneeRaw: unknown,
  actorLabel: string,
  now: string,
): Promise<void> {
  const guideId = guideIdFromGuideReviewCaseId(caseId);
  if (!guideId) return;
  const assignee = normalizeSyncedGuideAssignee(assigneeRaw);
  const by = String(actorLabel || "").trim() || "Admin";

  await ensureGuideCatalogTableLite(env);

  const existing = await env.DB.prepare(
    `SELECT published, deleted, custom, patch_json FROM guide_catalog_state WHERE guide_id = ?`,
  )
    .bind(guideId)
    .first<{
      published: number;
      deleted: number;
      custom: number;
      patch_json: string;
    }>();

  let patch: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(String(existing?.patch_json || "{}"));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      patch = { ...(parsed as Record<string, unknown>) };
    }
  } catch {
    patch = {};
  }

  const prevAssignee = normalizeSyncedGuideAssignee(patch.assignee);
  if (prevAssignee === assignee && existing) return;

  if (assignee) patch.assignee = assignee;
  else delete patch.assignee;

  const patchJson = JSON.stringify(patch);
  const published = existing ? Number(existing.published) || 0 : 0;
  const deleted = existing ? Number(existing.deleted) || 0 : 0;
  const custom = existing ? Number(existing.custom) || 0 : 0;

  await env.DB.prepare(
    `INSERT INTO guide_catalog_state
      (guide_id, published, deleted, custom, patch_json, updated_at, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(guide_id) DO UPDATE SET
       patch_json = excluded.patch_json,
       updated_at = excluded.updated_at,
       updated_by = excluded.updated_by`,
  )
    .bind(guideId, published, deleted, custom, patchJson, now, by)
    .run();

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS guide_catalog_change_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guide_id TEXT NOT NULL,
      changed_at TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      action TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT,
      detail_json TEXT NOT NULL DEFAULT '{}'
    )`,
  ).run();

  const statusCode = published;
  const statusLabel =
    statusCode === 1
      ? "active"
      : statusCode === 2
        ? "pending"
        : statusCode === 3
          ? "reviewed_by_qa"
          : statusCode === 4
            ? "reviewed_by_dev"
            : statusCode === 5
              ? "fixed_rereview"
              : "inactive";

  await env.DB.prepare(
    `INSERT INTO guide_catalog_change_log
      (guide_id, changed_at, changed_by, action, from_status, to_status, detail_json)
     VALUES (?, ?, ?, 'content', ?, ?, ?)`,
  )
    .bind(
      guideId,
      now,
      by,
      statusLabel,
      statusLabel,
      JSON.stringify({
        fields: ["assignee"],
        note: `Assignee synced from linked GUIDE-REV test → ${assignee || "unassigned"}`,
      }),
    )
    .run();
}
