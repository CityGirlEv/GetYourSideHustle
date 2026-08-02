/**
 * CRUD handlers for GYSH admin data (users, tasks, tests, content, audit).
 */
import {
  appendAudit,
  canonicalizeEmail,
  error,
  getUserByEmail,
  hashPassword,
  json,
  MIN_PASSWORD_LENGTH,
  publicUser,
  randomSaltHex,
  userRoles,
  type DbUser,
  type Env,
} from "./auth";
import { ensurePartnerAdmins } from "./partners";
import {
  canChangeTestStatus,
  canSetTestBlocked,
  canSetDevFixStatus,
  FAILED_TEST_ASSIGNEE,
  isHumanQaTesterId,
  qaOwnerFromCaseId,
  listDevAssigneeIds,
  hasRole,
  normalizeRolesInput,
  primaryRole,
  qaTesterIdForIdentity,
  serializeRoles,
  parseRoles,
} from "./roles";
import {
  canonicalizePartnerLabel,
  resolveTestAssignedMeta,
  todayMMDDYY,
  SYSTEM_ASSIGNED_BY,
} from "./assignment";
import { logTaskAssignmentChange, logTestAssignmentChange } from "./daily-digest";
import { decodeBase64ToBytes, scanTestEvidence } from "./test-evidence";
import { defaultsForNewTest } from "./new-test-defaults";
import {
  closedSprintBlocksActor,
  listClosedSprintIndexes,
  rejectIfSprintLocked,
  SPRINT_LOCKED_MESSAGE,
} from "./closed-sprints";
import { sprintLabel } from "./sprints";
import { mergeNoteEntries, noteEntriesPlainText } from "./note-entries";

/** D1 string values max ~2MB; base64 expands ~4/3 — keep decoded payload under that. */
const TASK_ATTACHMENT_MAX_BYTES = 1_500_000;
const TASK_ATTACHMENT_EXT =
  /\.(png|jpe?g|gif|webp|svg|bmp|heic|mp4|webm|mov|pdf|doc|docx|xls|xlsx|txt|csv)$/i;

function cleanBase64(raw: string): string {
  return String(raw || "")
    .replace(/^data:[^;]+;base64,/, "")
    .replace(/\s+/g, "");
}

function validateTaskAttachmentContent(input: {
  name: string;
  mimeType: string;
  contentBase64: string;
}): { ok: true; mime: string; cleaned: string; size: number } | { ok: false; error: string } {
  const name = String(input.name || "").trim();
  const mimeType = String(input.mimeType || "application/octet-stream").trim() || "application/octet-stream";
  if (!name || !TASK_ATTACHMENT_EXT.test(name)) {
    return {
      ok: false,
      error: "Unsupported file type. Use images, PDF, Word, Excel, video (mp4/webm/mov), txt, or csv.",
    };
  }
  const cleaned = cleanBase64(input.contentBase64);
  if (!cleaned) return { ok: false, error: "Missing file contents." };
  const bytes = decodeBase64ToBytes(cleaned);
  if (!bytes || bytes.length === 0) return { ok: false, error: "Could not read file contents." };
  if (bytes.length > TASK_ATTACHMENT_MAX_BYTES) {
    return {
      ok: false,
      error: `File too large (max ${Math.round(TASK_ATTACHMENT_MAX_BYTES / 1_000_000)}MB). Re-upload a smaller file.`,
    };
  }
  return { ok: true, mime: mimeType, cleaned, size: bytes.length };
}

async function ensureAttachmentContentColumns(env: Env): Promise<void> {
  await addColumnIfMissing(
    env,
    "task_attachments",
    "content_base64",
    `ALTER TABLE task_attachments ADD COLUMN content_base64 TEXT`,
  );
  await addColumnIfMissing(
    env,
    "plan_item_attachments",
    "content_base64",
    `ALTER TABLE plan_item_attachments ADD COLUMN content_base64 TEXT`,
  );
}

/** Keep in sync with src/lib/gysh-sprints.ts BACKLOG_SPRINT / UNASSIGNED_OWNER. */
const BACKLOG_SPRINT = -1;
const UNASSIGNED_OWNER = "Unassigned";

function isBacklogSprint(sprint: number): boolean {
  return sprint === BACKLOG_SPRINT;
}

function isGeneratedFailureCaseId(caseId: string): boolean {
  const id = caseId.toUpperCase();
  return id.startsWith("VT-FAIL-") || id.startsWith("PW-FAIL-");
}

/** Catalog VT-/PW- cases (not FAIL follow-ups) always belong to the suite runner. */
function suiteOwnerForAutomatedCase(caseId: string): "vitest" | "playwright" | null {
  const id = String(caseId || "").trim();
  if (!id || isGeneratedFailureCaseId(id)) return null;
  if (/^PW-/i.test(id)) return "playwright";
  if (/^VT-/i.test(id)) return "vitest";
  if (/^(KIDS|JR|ADULT|SENIOR)-FMSH-\d+$/i.test(id) || /^WIZARD-EDGE-\d+$/i.test(id)) {
    return "vitest";
  }
  return null;
}

type TaskRow = {
  id: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assign_by: string;
  assigned_to: string;
  date_assigned: string;
  due_date: string;
  date_completed: string;
  notes: string;
  sort_order: number;
  updated_at: string;
  updated_by?: string;
  sprint?: number;
  done_tina?: number;
  done_evelyn?: number;
  parent_id?: string;
};

function actorLabel(actor: DbUser): string {
  const name = (actor.name || "").trim();
  const email = (actor.email || "").trim();
  const raw = name || email;
  if (!raw) return SYSTEM_ASSIGNED_BY;
  // Keep Assigned By / notes as short partner labels (Tina, not Tina Marie Barham).
  return canonicalizePartnerLabel(raw) || raw;
}

type AttachmentRow = {
  id: string;
  task_id: string;
  name: string;
  mime_type: string;
  size: number;
  stored_id: string;
  r2_key: string | null;
  added_at: string;
  content_base64?: string | null;
};

type PlanAttachmentRow = {
  id: string;
  plan_item_id: string;
  name: string;
  mime_type: string;
  size: number;
  stored_id: string;
  r2_key: string | null;
  added_at: string;
  content_base64?: string | null;
};

function mapTask(row: TaskRow, attachments: AttachmentRow[]) {
  return {
    id: row.id,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    assignBy: row.assign_by,
    assignedTo: row.assigned_to,
    dateAssigned: row.date_assigned,
    dueDate: row.due_date,
    dateCompleted: row.date_completed,
    notes: row.notes,
    sprint: (() => {
      if (typeof row.sprint === "number" && Number.isFinite(row.sprint)) return row.sprint;
      const n = Number(row.sprint);
      return Number.isFinite(n) ? n : 0;
    })(),
    tinaDone: Number(row.done_tina ?? 0) === 1,
    evelynDone: Number(row.done_evelyn ?? 0) === 1,
    parentId: String(row.parent_id || "").trim(),
    updatedAt: row.updated_at || "",
    updatedBy: (row.updated_by || "").trim(),
    attachments: attachments
      .filter((a) => a.task_id === row.id)
      .map((a) => ({
        id: a.id,
        name: a.name,
        mimeType: a.mime_type,
        size: a.size,
        storedId: a.stored_id,
        r2Key: a.r2_key,
        addedAt: a.added_at,
        hasContent: Boolean(a.content_base64 && String(a.content_base64).length > 0),
      })),
  };
}

/** D1 / SQLite phrasing varies: "no such column" vs "has no column named". */
function isSchemaDriftError(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("no such column") ||
    m.includes("has no column named") ||
    m.includes("no column named") ||
    m.includes("no such table")
  );
}

async function addColumnIfMissing(
  env: Env,
  table: string,
  column: string,
  ddl: string,
): Promise<void> {
  const info = await env.DB.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  const cols = new Set((info.results ?? []).map((r) => r.name));
  if (cols.has(column)) return;
  try {
    await env.DB.prepare(ddl).run();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Concurrent repair / already applied
    if (msg.toLowerCase().includes("duplicate column")) return;
    throw e;
  }
}

/** Ensure sprint / partner-done columns exist (handles Pages binding env drift). */
async function ensureTaskColumns(env: Env): Promise<void> {
  await addColumnIfMissing(
    env,
    "tasks",
    "sprint",
    `ALTER TABLE tasks ADD COLUMN sprint INTEGER NOT NULL DEFAULT 0`,
  );
  await addColumnIfMissing(
    env,
    "tasks",
    "done_tina",
    `ALTER TABLE tasks ADD COLUMN done_tina INTEGER NOT NULL DEFAULT 0`,
  );
  await addColumnIfMissing(
    env,
    "tasks",
    "done_evelyn",
    `ALTER TABLE tasks ADD COLUMN done_evelyn INTEGER NOT NULL DEFAULT 0`,
  );
  await addColumnIfMissing(
    env,
    "tasks",
    "updated_by",
    `ALTER TABLE tasks ADD COLUMN updated_by TEXT NOT NULL DEFAULT ''`,
  );
  await addColumnIfMissing(
    env,
    "tasks",
    "parent_id",
    `ALTER TABLE tasks ADD COLUMN parent_id TEXT NOT NULL DEFAULT ''`,
  );
  await ensureAttachmentContentColumns(env);
}

export async function listUsers(env: Env): Promise<Response> {
  await ensurePartnerAdmins(env);
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt,
              membership_tier, audience
       FROM users ORDER BY joined_at DESC, name ASC`,
    ).all<DbUser>();
    return json({ users: (results ?? []).map(publicUser) });
  } catch {
    const { results } = await env.DB.prepare(
      `SELECT id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt
       FROM users ORDER BY joined_at DESC, name ASC`,
    ).all<DbUser>();
    return json({ users: (results ?? []).map(publicUser) });
  }
}

export async function upsertUser(env: Env, request: Request, actor: DbUser): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const id = String(body.id || `u-${crypto.randomUUID()}`);
  const name = String(body.name || "").trim();
  const email = canonicalizeEmail(String(body.email || ""));
  const roles = normalizeRolesInput(body.role, body.roles);
  const status = String(body.status || "pending");
  const notes = String(body.notes || "");
  const password = body.password != null ? String(body.password) : "";
  const joinedAt = String(body.joinedAt || new Date().toISOString().slice(0, 10));
  const now = new Date().toISOString();

  if (!name || !email) return error("Name and email are required.");
  if (!roles) return error("Select at least one valid role.");
  if (!["active", "pending", "disabled"].includes(status)) return error("Invalid status.");
  if (password) {
    const { passwordPolicyError } = await import("./password-policy");
    const pwErr = passwordPolicyError(password);
    if (pwErr) return error(pwErr);
  }

  const role = primaryRole(roles);
  const rolesJson = serializeRoles(roles);

  const existing = await env.DB.prepare(
    `SELECT id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt, created_at
     FROM users WHERE id = ?`,
  )
    .bind(id)
    .first<DbUser & { created_at: string }>();
  const emailOwner = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first<{ id: string }>();
  if (emailOwner && emailOwner.id !== id) return error("Another user already has that email.");

  let passwordHash = existing?.password_hash ?? null;
  let passwordSalt = existing?.password_salt ?? null;
  if (password) {
    passwordSalt = randomSaltHex();
    passwordHash = await hashPassword(password, passwordSalt);
    await appendAudit(env.DB, "password_admin_set", email, `password set by ${actor.email}`);
  }

  if (existing && existing.email !== email) {
    await appendAudit(env.DB, "password_admin_set", email, `email migrated from ${existing.email}`);
  }

  await env.DB.prepare(
    `INSERT INTO users (id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       email = excluded.email,
       role = excluded.role,
       roles = excluded.roles,
       status = excluded.status,
       notes = excluded.notes,
       password_hash = excluded.password_hash,
       password_salt = excluded.password_salt,
       updated_at = excluded.updated_at`,
  )
    .bind(
      id,
      name,
      email,
      role,
      rolesJson,
      status,
      existing?.joined_at ?? joinedAt,
      notes,
      passwordHash,
      passwordSalt,
      existing?.created_at ?? now,
      now,
    )
    .run();

  const prevStatus = existing?.status ?? "";
  const becameActive = status === "active" && prevStatus !== "active";

  if (becameActive) {
    try {
      await env.DB.prepare(
        `UPDATE users SET activated_at = ?, activated_by = ? WHERE id = ?`,
      )
        .bind(now, actor.email, id)
        .run();
    } catch {
      /* columns from migration 0019 */
    }
    try {
      const { activateLinkedKidsForParent } = await import("./family");
      await activateLinkedKidsForParent(env, id);
    } catch {
      /* family tables optional */
    }
  }
  if (status === "disabled" && prevStatus !== "disabled") {
    try {
      await env.DB.prepare(
        `UPDATE users SET deactivated_at = ?, deactivated_by = ? WHERE id = ?`,
      )
        .bind(now, actor.email, id)
        .run();
    } catch {
      /* columns from migration 0019 */
    }
  }

  let user =
    (await env.DB.prepare(
      `SELECT id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt FROM users WHERE id = ?`,
    )
      .bind(id)
      .first<DbUser>()) ?? null;

  let membershipTier = "free";
  let audience = "adult";
  try {
    const extra = await env.DB.prepare(
      `SELECT membership_tier, audience FROM users WHERE id = ?`,
    )
      .bind(id)
      .first<{ membership_tier: string | null; audience: string | null }>();
    if (extra?.membership_tier) membershipTier = extra.membership_tier;
    if (extra?.audience) audience = extra.audience;
  } catch {
    /* older schema */
  }

  let welcomeEmailSent = false;
  if (becameActive && user) {
    try {
      const { sendAccountActivatedWelcome } = await import("./email");
      welcomeEmailSent = await sendAccountActivatedWelcome(env, {
        id: user.id,
        email: user.email,
        name: user.name,
        membership_tier: membershipTier,
        audience,
      });
      await appendAudit(
        env.DB,
        "user_activated",
        user.email,
        `activated by ${actor.email}${welcomeEmailSent ? " · welcome email sent" : " · welcome email skipped"}`,
      );
    } catch {
      welcomeEmailSent = false;
    }
  }

  return json({
    user: user ? publicUser(user) : null,
    welcomeEmailSent,
    activated: becameActive,
  });
}

export async function deleteUser(env: Env, id: string): Promise<Response> {
  if (id === "u-tina" || id === "u-ev") {
    return error("Cannot delete co-founder admin accounts.", 403);
  }
  await env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(id).run();
  await env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(id).run();
  return json({ ok: true });
}

export async function listTasks(env: Env): Promise<Response> {
  await ensureTaskColumns(env);
  const tasks = await env.DB.prepare(
    `SELECT * FROM tasks ORDER BY sort_order ASC, id ASC`,
  ).all<TaskRow>();
  const atts = await env.DB.prepare(`SELECT * FROM task_attachments`).all<AttachmentRow>();
  return json({
    tasks: (tasks.results ?? []).map((t) => mapTask(t, atts.results ?? [])),
    attachmentBlobsNote:
      "Attachment file bytes are stored in D1 (content_base64). Download via /api/task-attachments?id=…",
  });
}

export async function saveTasks(env: Env, request: Request, actor: DbUser): Promise<Response> {
  let body: { tasks?: unknown[]; removeIds?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  if (!Array.isArray(body.tasks)) return error("tasks array required.");

  await ensureTaskColumns(env);

  const now = new Date().toISOString();
  const byLabel = actorLabel(actor);
  const closedSprints = new Set(await listClosedSprintIndexes(env));

  // Preserve prior audit stamps when a task's content did not change.
  const prior = await env.DB.prepare(
    `SELECT id, description, category, priority, status, assign_by, assigned_to,
            date_assigned, due_date, date_completed, notes, sprint, done_tina, done_evelyn,
            parent_id, updated_at, updated_by, sort_order
     FROM tasks`,
  ).all<TaskRow>();
  const priorById = new Map((prior.results ?? []).map((r) => [r.id, r]));

  // Dedupe by id (last wins) — concurrent clients / double-submit must not insert the same PK twice.
  const byId = new Map<string, Record<string, unknown>>();
  for (const raw of body.tasks as Array<Record<string, unknown>>) {
    const id = String(raw.id || "").trim() || `T-${crypto.randomUUID().slice(0, 8)}`;
    byId.set(id, { ...raw, id });
  }
  const incoming = Array.from(byId.values());
  const removeIds = [
    ...new Set(
      (Array.isArray(body.removeIds) ? body.removeIds : [])
        .map((id) => String(id || "").trim())
        .filter(Boolean),
    ),
  ].filter((id) => !byId.has(id));

  for (const id of removeIds) {
    const prev = priorById.get(id);
    const prevSprint = Number(prev?.sprint ?? 0);
    if (closedSprintBlocksActor(closedSprints, prevSprint, actor)) {
      return error(`${SPRINT_LOCKED_MESSAGE} (${sprintLabel(prevSprint)})`, 403);
    }
  }

  // Safe merge: upsert only — never wipe the whole table. Missing ids stay in D1
  // so concurrent users cannot clobber each other's new tasks. Explicit deletes via removeIds.
  const statements: D1PreparedStatement[] = [];

  for (const id of removeIds) {
    statements.push(env.DB.prepare(`DELETE FROM task_attachments WHERE task_id = ?`).bind(id));
    statements.push(env.DB.prepare(`DELETE FROM tasks WHERE id = ?`).bind(id));
  }

  let order = 0;
  for (const t of incoming) {
    const id = String(t.id);
    const description = String(t.description || "");
    const category = String(t.category || "admin_ops");
    const priority = String(t.priority || "P2");
    const status = String(t.status || "not_started");
    const assignBy = String(t.assignBy || "");
    const dateAssigned = String(t.dateAssigned || "");
    const dueDate = String(t.dueDate || "");
    const dateCompleted = String(t.dateCompleted || "");
    const incomingNotes = String(t.notes || "");
    const prevRow = priorById.get(id);
    const prevNotesForMerge = String(prevRow?.notes ?? "");
    const notesMerged = mergeNoteEntries(prevNotesForMerge, incomingNotes, byLabel, now, {
      author: (prevRow?.updated_by || prevRow?.assign_by || "").trim() || undefined,
      at: (prevRow?.updated_at || "").trim() || undefined,
    });
    if (!notesMerged.ok) return error(notesMerged.error, 400);
    const notes = notesMerged.notes;
    // Never invent Sprint 0 when the client omits sprint — keep the stored value.
    // (Missing/undefined used to become 0 and looked like sprints "reverting to zero" in local.)
    const hasSprintField = t.sprint !== undefined && t.sprint !== null && t.sprint !== "";
    const sprintRaw = hasSprintField ? Number(t.sprint) : Number(prevRow?.sprint ?? 0);
    const sprint = Number.isFinite(sprintRaw) ? sprintRaw : Number(prevRow?.sprint ?? 0) || 0;
    // Backlog tasks are always Unassigned (do not invent an owner when leaving backlog).
    const assignedTo = isBacklogSprint(sprint)
      ? UNASSIGNED_OWNER
      : String(t.assignedTo || "Both");
    const doneTina = t.tinaDone === true || t.tinaDone === 1 || t.done_tina === 1 ? 1 : 0;
    const doneEvelyn = t.evelynDone === true || t.evelynDone === 1 || t.done_evelyn === 1 ? 1 : 0;
    const parentId =
      t.parentId !== undefined && t.parentId !== null
        ? String(t.parentId || "").trim()
        : String(prevRow?.parent_id || "").trim();

    const prev = priorById.get(id);
    const sortOrder =
      typeof t.sortOrder === "number" && Number.isFinite(t.sortOrder)
        ? Number(t.sortOrder)
        : prev?.sort_order != null
          ? Number(prev.sort_order)
          : order;
    order += 1;

    const unchanged =
      prev &&
      prev.description === description &&
      prev.category === category &&
      prev.priority === priority &&
      prev.status === status &&
      prev.assign_by === assignBy &&
      prev.assigned_to === assignedTo &&
      prev.date_assigned === dateAssigned &&
      prev.due_date === dueDate &&
      prev.date_completed === dateCompleted &&
      prev.notes === notes &&
      Number(prev.sprint ?? 0) === sprint &&
      Number(prev.done_tina ?? 0) === doneTina &&
      Number(prev.done_evelyn ?? 0) === doneEvelyn &&
      String(prev.parent_id || "").trim() === parentId;

    const prevSprint = prev ? Number(prev.sprint ?? 0) : null;
    // Locked sprint: reject real edits; leave unchanged rows alone so bulk saves of other tasks still work.
    // Evelyn may bypass (closedSprintBlocksActor).
    if (prevSprint !== null && closedSprintBlocksActor(closedSprints, prevSprint, actor)) {
      if (!unchanged) {
        return error(`${SPRINT_LOCKED_MESSAGE} (${sprintLabel(prevSprint)})`, 403);
      }
      continue;
    }
    if (closedSprintBlocksActor(closedSprints, sprint, actor)) {
      return error(`${SPRINT_LOCKED_MESSAGE} (${sprintLabel(sprint)})`, 403);
    }

    const updatedAt = unchanged && prev?.updated_at ? prev.updated_at : now;
    const updatedBy =
      unchanged && (prev?.updated_by || "").trim()
        ? String(prev!.updated_by)
        : byLabel;

    if (prev && prev.assigned_to !== assignedTo) {
      await logTaskAssignmentChange(env, {
        taskId: id,
        fromAssignee: prev.assigned_to,
        toAssignee: assignedTo,
        changedBy: byLabel,
      });
    }

    statements.push(
      env.DB.prepare(
        `INSERT INTO tasks (
           id, description, category, priority, status, assign_by, assigned_to,
           date_assigned, due_date, date_completed, notes, sprint, done_tina, done_evelyn,
           parent_id, sort_order, updated_at, updated_by
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           description = excluded.description,
           category = excluded.category,
           priority = excluded.priority,
           status = excluded.status,
           assign_by = excluded.assign_by,
           assigned_to = excluded.assigned_to,
           date_assigned = excluded.date_assigned,
           due_date = excluded.due_date,
           date_completed = excluded.date_completed,
           notes = excluded.notes,
           sprint = excluded.sprint,
           done_tina = excluded.done_tina,
           done_evelyn = excluded.done_evelyn,
           parent_id = excluded.parent_id,
           sort_order = excluded.sort_order,
           updated_at = excluded.updated_at,
           updated_by = excluded.updated_by`,
      ).bind(
        id,
        description,
        category,
        priority,
        status,
        assignBy,
        assignedTo,
        dateAssigned,
        dueDate,
        dateCompleted,
        notes,
        sprint,
        doneTina,
        doneEvelyn,
        parentId,
        sortOrder,
        updatedAt,
        updatedBy,
      ),
    );

    // Replace attachments only for this task — never wipe all attachment rows globally.
    // Preserve content_base64 for ids that already have stored bytes (tasks PUT sends metadata only).
    const priorAtts = await env.DB.prepare(
      `SELECT id, content_base64 FROM task_attachments WHERE task_id = ?`,
    )
      .bind(id)
      .all<{ id: string; content_base64: string | null }>();
    const priorContent = new Map(
      (priorAtts.results ?? []).map((r) => [r.id, r.content_base64 ?? null]),
    );
    statements.push(env.DB.prepare(`DELETE FROM task_attachments WHERE task_id = ?`).bind(id));
    const attachments = Array.isArray(t.attachments) ? t.attachments : [];
    const seenAtt = new Set<string>();
    for (const a of attachments as Array<Record<string, unknown>>) {
      let attId = String(a.id || crypto.randomUUID());
      if (seenAtt.has(attId)) attId = crypto.randomUUID();
      seenAtt.add(attId);
      let content: string | null = priorContent.get(attId) ?? null;
      if (typeof a.contentBase64 === "string" && a.contentBase64.trim()) {
        const validated = validateTaskAttachmentContent({
          name: String(a.name || ""),
          mimeType: String(a.mimeType || "application/octet-stream"),
          contentBase64: a.contentBase64,
        });
        if (validated.ok) content = validated.cleaned;
      }
      statements.push(
        env.DB.prepare(
          `INSERT INTO task_attachments
             (id, task_id, name, mime_type, size, stored_id, r2_key, added_at, content_base64)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          attId,
          id,
          String(a.name || ""),
          String(a.mimeType || "application/octet-stream"),
          Number(a.size || 0),
          String(a.storedId || a.id || ""),
          a.r2Key ? String(a.r2Key) : null,
          String(a.addedAt || now),
          content,
        ),
      );
    }
  }

  try {
    const CHUNK = 40;
    for (let i = 0; i < statements.length; i += CHUNK) {
      await env.DB.batch(statements.slice(i, i + CHUNK));
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (isSchemaDriftError(msg)) {
      await ensureTaskColumns(env);
      const CHUNK = 40;
      for (let i = 0; i < statements.length; i += CHUNK) {
        await env.DB.batch(statements.slice(i, i + CHUNK));
      }
      // fall through to shared-notes sync + list
    } else {
      throw e;
    }
  }

  // Shared notes across parent + letter subtasks (T-041 / T-041T / T-041E).
  await syncTaskFamilyNotes(env, incoming, priorById);

  return listTasks(env);
}

/** Mirror notes to every sibling/parent in a task family when any member was saved. */
async function syncTaskFamilyNotes(
  env: Env,
  incoming: Array<Record<string, unknown>>,
  priorById: Map<string, TaskRow>,
): Promise<void> {
  if (incoming.length === 0) return;
  const all = await env.DB.prepare(
    `SELECT id, parent_id, notes FROM tasks`,
  ).all<{ id: string; parent_id: string | null; notes: string }>();
  const rows = all.results ?? [];
  const byId = new Map(rows.map((r) => [r.id, r]));
  const childrenByParent = new Map<string, string[]>();
  for (const r of rows) {
    const pid = String(r.parent_id || "").trim();
    if (!pid) continue;
    const list = childrenByParent.get(pid) ?? [];
    list.push(r.id);
    childrenByParent.set(pid, list);
  }

  const touchedRoots = new Set<string>();
  for (const t of incoming) {
    const id = String(t.id || "").trim();
    if (!id) continue;
    const row = byId.get(id);
    const parent = String(row?.parent_id || t.parentId || priorById.get(id)?.parent_id || "").trim();
    touchedRoots.add(parent || id);
  }

  const syncStatements: D1PreparedStatement[] = [];
  for (const rootId of touchedRoots) {
    const family = [rootId, ...(childrenByParent.get(rootId) ?? [])];
    if (family.length < 2) continue;
    // Prefer notes from an incoming member; else longest family notes string.
    let shared = "";
    for (const t of incoming) {
      const id = String(t.id || "").trim();
      if (!family.includes(id)) continue;
      const n = String(t.notes || "");
      if (n.length >= shared.length) shared = n;
    }
    if (!shared) {
      for (const id of family) {
        const n = String(byId.get(id)?.notes || "");
        if (n.length >= shared.length) shared = n;
      }
    }
    for (const id of family) {
      if (String(byId.get(id)?.notes || "") === shared) continue;
      syncStatements.push(
        env.DB.prepare(`UPDATE tasks SET notes = ? WHERE id = ?`).bind(shared, id),
      );
    }
  }
  if (syncStatements.length === 0) return;
  const CHUNK = 40;
  for (let i = 0; i < syncStatements.length; i += CHUNK) {
    await env.DB.batch(syncStatements.slice(i, i + CHUNK));
  }
}

export async function uploadTaskAttachment(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureTaskColumns(env);
  let body: {
    taskId?: string;
    id?: string;
    name?: string;
    mimeType?: string;
    contentBase64?: string;
    addedAt?: string;
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const taskId = String(body.taskId || "").trim();
  const name = String(body.name || "").trim();
  const mimeType = String(body.mimeType || "application/octet-stream").trim();
  const contentBase64 = String(body.contentBase64 || "").trim();
  if (!taskId || !name || !contentBase64) {
    return error("taskId, name, and contentBase64 are required.");
  }
  const task = await env.DB.prepare(`SELECT id, sprint FROM tasks WHERE id = ?`)
    .bind(taskId)
    .first<{ id: string; sprint: number }>();
  if (!task) return error("Task not found.", 404);
  const locked = await rejectIfSprintLocked(env, Number(task.sprint), actor);
  if (locked) return locked;

  const validated = validateTaskAttachmentContent({ name, mimeType, contentBase64 });
  if (!validated.ok) return error(validated.error, 400);

  const id = String(body.id || "").trim() || crypto.randomUUID();
  const addedAt = String(body.addedAt || "").trim() || todayMMDDYY();
  const existing = await env.DB.prepare(`SELECT id FROM task_attachments WHERE id = ?`)
    .bind(id)
    .first<{ id: string }>();
  if (existing) {
    await env.DB.prepare(
      `UPDATE task_attachments
       SET task_id = ?, name = ?, mime_type = ?, size = ?, stored_id = ?, content_base64 = ?, added_at = ?
       WHERE id = ?`,
    )
      .bind(taskId, name, validated.mime, validated.size, id, validated.cleaned, addedAt, id)
      .run();
  } else {
    await env.DB.prepare(
      `INSERT INTO task_attachments
         (id, task_id, name, mime_type, size, stored_id, r2_key, added_at, content_base64)
       VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
    )
      .bind(id, taskId, name, validated.mime, validated.size, id, addedAt, validated.cleaned)
      .run();
  }
  await appendAudit(env.DB, "task_attachment_upload", actor.email, `${taskId}:${id}`);
  return json({
    ok: true,
    attachment: {
      id,
      name,
      mimeType: validated.mime,
      size: validated.size,
      storedId: id,
      r2Key: null,
      addedAt,
      hasContent: true,
    },
  });
}

export async function getTaskAttachmentContent(env: Env, id: string): Promise<Response> {
  await ensureTaskColumns(env);
  const row = await env.DB.prepare(
    `SELECT id, name, mime_type, content_base64 FROM task_attachments WHERE id = ?`,
  )
    .bind(id)
    .first<{
      id: string;
      name: string;
      mime_type: string;
      content_base64: string | null;
    }>();
  if (!row) return error("Attachment not found.", 404);
  if (!row.content_base64) {
    return error(
      "File bytes were never stored on the server (legacy IndexedDB-only upload). Please re-upload the file.",
      404,
    );
  }
  return json({
    id: row.id,
    name: row.name,
    mimeType: row.mime_type,
    contentBase64: row.content_base64,
  });
}

export async function deleteTaskAttachmentRow(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureTaskColumns(env);
  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const id = String(body.id || "").trim();
  if (!id) return error("id is required.");
  const att = await env.DB.prepare(
    `SELECT a.id, t.sprint FROM task_attachments a
     JOIN tasks t ON t.id = a.task_id WHERE a.id = ?`,
  )
    .bind(id)
    .first<{ id: string; sprint: number }>();
  if (att) {
    const locked = await rejectIfSprintLocked(env, Number(att.sprint), actor);
    if (locked) return locked;
  }
  await env.DB.prepare(`DELETE FROM task_attachments WHERE id = ?`).bind(id).run();
  await appendAudit(env.DB, "task_attachment_delete", actor.email, id);
  return json({ ok: true });
}

export async function handleTaskAttachments(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  const method = request.method.toUpperCase();
  if (method === "GET") {
    const id = (new URL(request.url).searchParams.get("id") || "").trim();
    if (!id) return error("id is required.");
    return getTaskAttachmentContent(env, id);
  }
  if (method === "POST") return uploadTaskAttachment(env, request, actor);
  if (method === "DELETE") return deleteTaskAttachmentRow(env, request, actor);
  return error("Method not allowed.", 405);
}

export async function uploadPlanAttachment(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureAgilePlanTables(env);
  await ensureAttachmentContentColumns(env);
  let body: {
    planItemId?: string;
    id?: string;
    name?: string;
    mimeType?: string;
    contentBase64?: string;
    addedAt?: string;
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const planItemId = String(body.planItemId || "").trim();
  const name = String(body.name || "").trim();
  const mimeType = String(body.mimeType || "application/octet-stream").trim();
  const contentBase64 = String(body.contentBase64 || "").trim();
  if (!planItemId || !name || !contentBase64) {
    return error("planItemId, name, and contentBase64 are required.");
  }
  const item = await env.DB.prepare(`SELECT id, sprint FROM plan_items WHERE id = ?`)
    .bind(planItemId)
    .first<{ id: string; sprint: number }>();
  if (!item) return error("Plan item not found.", 404);
  const planLocked = await rejectIfSprintLocked(env, Number(item.sprint), actor);
  if (planLocked) return planLocked;

  const validated = validateTaskAttachmentContent({ name, mimeType, contentBase64 });
  if (!validated.ok) return error(validated.error, 400);

  const id = String(body.id || "").trim() || crypto.randomUUID();
  const addedAt = String(body.addedAt || "").trim() || todayMMDDYY();
  const existing = await env.DB.prepare(`SELECT id FROM plan_item_attachments WHERE id = ?`)
    .bind(id)
    .first<{ id: string }>();
  if (existing) {
    await env.DB.prepare(
      `UPDATE plan_item_attachments
       SET plan_item_id = ?, name = ?, mime_type = ?, size = ?, stored_id = ?, content_base64 = ?, added_at = ?
       WHERE id = ?`,
    )
      .bind(planItemId, name, validated.mime, validated.size, id, validated.cleaned, addedAt, id)
      .run();
  } else {
    await env.DB.prepare(
      `INSERT INTO plan_item_attachments
         (id, plan_item_id, name, mime_type, size, stored_id, r2_key, added_at, content_base64)
       VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
    )
      .bind(id, planItemId, name, validated.mime, validated.size, id, addedAt, validated.cleaned)
      .run();
  }
  await appendAudit(env.DB, "plan_attachment_upload", actor.email, `${planItemId}:${id}`);
  return json({
    ok: true,
    attachment: {
      id,
      name,
      mimeType: validated.mime,
      size: validated.size,
      storedId: id,
      r2Key: null,
      addedAt,
      hasContent: true,
    },
  });
}

export async function getPlanAttachmentContent(env: Env, id: string): Promise<Response> {
  await ensureAgilePlanTables(env);
  await ensureAttachmentContentColumns(env);
  const row = await env.DB.prepare(
    `SELECT id, name, mime_type, content_base64 FROM plan_item_attachments WHERE id = ?`,
  )
    .bind(id)
    .first<{
      id: string;
      name: string;
      mime_type: string;
      content_base64: string | null;
    }>();
  if (!row) return error("Attachment not found.", 404);
  if (!row.content_base64) {
    return error(
      "File bytes were never stored on the server (legacy IndexedDB-only upload). Please re-upload the file.",
      404,
    );
  }
  return json({
    id: row.id,
    name: row.name,
    mimeType: row.mime_type,
    contentBase64: row.content_base64,
  });
}

export async function deletePlanAttachmentRow(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureAgilePlanTables(env);
  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const id = String(body.id || "").trim();
  if (!id) return error("id is required.");
  const att = await env.DB.prepare(
    `SELECT a.id, p.sprint FROM plan_item_attachments a
     JOIN plan_items p ON p.id = a.plan_item_id WHERE a.id = ?`,
  )
    .bind(id)
    .first<{ id: string; sprint: number }>();
  if (att) {
    const locked = await rejectIfSprintLocked(env, Number(att.sprint), actor);
    if (locked) return locked;
  }
  await env.DB.prepare(`DELETE FROM plan_item_attachments WHERE id = ?`).bind(id).run();
  await appendAudit(env.DB, "plan_attachment_delete", actor.email, id);
  return json({ ok: true });
}

export async function handlePlanAttachments(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  const method = request.method.toUpperCase();
  if (method === "GET") {
    const id = (new URL(request.url).searchParams.get("id") || "").trim();
    if (!id) return error("id is required.");
    return getPlanAttachmentContent(env, id);
  }
  if (method === "POST") return uploadPlanAttachment(env, request, actor);
  if (method === "DELETE") return deletePlanAttachmentRow(env, request, actor);
  return error("Method not allowed.", 405);
}

/** One-shot per isolate — repeated CREATE/ALTER on every request stalls local D1 under load. */
let testCaseSchemaReady = false;

/** Ensure test_case_status columns exist (handles Pages env / partial migration drift). */
async function ensureTestCaseStatusColumns(env: Env): Promise<void> {
  if (testCaseSchemaReady) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS test_case_status (
      case_id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT
    )`,
  ).run();
  await addColumnIfMissing(
    env,
    "test_case_status",
    "note",
    `ALTER TABLE test_case_status ADD COLUMN note TEXT NOT NULL DEFAULT ''`,
  );
  await addColumnIfMissing(
    env,
    "test_case_status",
    "assignee",
    `ALTER TABLE test_case_status ADD COLUMN assignee TEXT NOT NULL DEFAULT ''`,
  );
  await addColumnIfMissing(
    env,
    "test_case_status",
    "sprint",
    `ALTER TABLE test_case_status ADD COLUMN sprint INTEGER NOT NULL DEFAULT 0`,
  );
  await addColumnIfMissing(
    env,
    "test_case_status",
    "due_date",
    `ALTER TABLE test_case_status ADD COLUMN due_date TEXT NOT NULL DEFAULT ''`,
  );
  await addColumnIfMissing(
    env,
    "test_case_status",
    "checked_steps_json",
    `ALTER TABLE test_case_status ADD COLUMN checked_steps_json TEXT NOT NULL DEFAULT '[]'`,
  );
  await addColumnIfMissing(
    env,
    "test_case_status",
    "failed_step_index",
    `ALTER TABLE test_case_status ADD COLUMN failed_step_index INTEGER`,
  );
  await addColumnIfMissing(
    env,
    "test_case_status",
    "assigned_by",
    `ALTER TABLE test_case_status ADD COLUMN assigned_by TEXT NOT NULL DEFAULT '${SYSTEM_ASSIGNED_BY}'`,
  );
  await addColumnIfMissing(
    env,
    "test_case_status",
    "date_assigned",
    `ALTER TABLE test_case_status ADD COLUMN date_assigned TEXT NOT NULL DEFAULT ''`,
  );
  await addColumnIfMissing(
    env,
    "test_case_status",
    "original_assignee",
    `ALTER TABLE test_case_status ADD COLUMN original_assignee TEXT NOT NULL DEFAULT ''`,
  );
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS test_case_attachments (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL DEFAULT 0,
      content_base64 TEXT NOT NULL,
      scan_status TEXT NOT NULL DEFAULT 'clean',
      scan_detail TEXT NOT NULL DEFAULT '',
      added_at TEXT NOT NULL,
      added_by TEXT NOT NULL DEFAULT ''
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS test_case_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      assignee TEXT NOT NULL DEFAULT '',
      sprint INTEGER NOT NULL DEFAULT 0,
      due_date TEXT NOT NULL DEFAULT '',
      checked_steps_json TEXT NOT NULL DEFAULT '[]',
      failed_step_index INTEGER,
      changed_at TEXT NOT NULL,
      changed_by TEXT NOT NULL DEFAULT '',
      reason TEXT NOT NULL DEFAULT 'upsert'
    )`,
  ).run();
  try {
    await env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS idx_test_case_status_history_case
       ON test_case_status_history(case_id, changed_at DESC)`,
    ).run();
  } catch {
    /* index may already exist */
  }
  testCaseSchemaReady = true;
}

function parseCheckedSteps(raw: unknown, stepCount: number): boolean[] {
  const n = Math.max(0, stepCount);
  const empty = () => Array.from({ length: n }, () => false);
  if (n === 0) return [];
  if (Array.isArray(raw)) {
    if (raw.every((v) => typeof v === "boolean")) {
      const arr = raw as boolean[];
      if (arr.length === n) return arr;
      return Array.from({ length: n }, (_, i) => Boolean(arr[i]));
    }
    if (raw.every((v) => typeof v === "number")) {
      const set = new Set(raw as number[]);
      return Array.from({ length: n }, (_, i) => set.has(i));
    }
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      return parseCheckedSteps(JSON.parse(raw), n);
    } catch {
      return empty();
    }
  }
  return empty();
}

function allStepsChecked(checked: boolean[], stepCount: number): boolean {
  if (stepCount <= 0) return true;
  return checked.length >= stepCount && checked.slice(0, stepCount).every(Boolean);
}

async function listGeneratedTestCases(env: Env): Promise<
  Array<{
    id: string;
    area: string;
    title: string;
    priority: string;
    suite: string;
    steps: string[];
    expected: string;
    failureDetail: string;
    fixSteps: string[];
    severity: string;
    sourceFile: string;
  }>
> {
  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS generated_test_cases (
        id TEXT PRIMARY KEY,
        area TEXT NOT NULL,
        title TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'P1',
        suite TEXT NOT NULL DEFAULT 'vitest',
        steps_json TEXT NOT NULL DEFAULT '[]',
        expected TEXT NOT NULL DEFAULT '',
        failure_detail TEXT NOT NULL DEFAULT '',
        fix_steps_json TEXT NOT NULL DEFAULT '[]',
        severity TEXT NOT NULL DEFAULT 'P1',
        source_file TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        created_from_run TEXT NOT NULL DEFAULT ''
      )`,
    ).run();
    const { results } = await env.DB.prepare(
      `SELECT id, area, title, priority, suite, steps_json, expected, failure_detail, fix_steps_json, severity, source_file
       FROM generated_test_cases ORDER BY created_at DESC LIMIT 200`,
    ).all<{
      id: string;
      area: string;
      title: string;
      priority: string;
      suite: string;
      steps_json: string;
      expected: string;
      failure_detail: string;
      fix_steps_json: string;
      severity: string;
      source_file: string;
    }>();
    return (results ?? []).map((r) => {
      let steps: string[] = [];
      let fixSteps: string[] = [];
      try {
        steps = JSON.parse(r.steps_json) as string[];
      } catch {
        steps = [];
      }
      try {
        fixSteps = JSON.parse(r.fix_steps_json) as string[];
      } catch {
        fixSteps = [];
      }
      return {
        id: r.id,
        area: r.area,
        title: r.title,
        priority: r.priority,
        suite: r.suite,
        steps,
        expected: r.expected,
        failureDetail: r.failure_detail,
        fixSteps,
        severity: r.severity,
        sourceFile: r.source_file,
      };
    });
  } catch {
    return [];
  }
}

export async function listTestStatuses(env: Env): Promise<Response> {
  try {
    await ensureTestCaseStatusColumns(env);
    const { results } = await env.DB.prepare(
      `SELECT case_id, status, note, assignee, sprint, due_date, checked_steps_json, failed_step_index,
              assigned_by, date_assigned, original_assignee, updated_at, updated_by
       FROM test_case_status`,
    ).all<{
      case_id: string;
      status: string;
      note: string;
      assignee: string;
      sprint: number;
      due_date: string | null;
      checked_steps_json: string | null;
      failed_step_index: number | null;
      assigned_by: string | null;
      date_assigned: string | null;
      original_assignee: string | null;
      updated_at: string | null;
      updated_by: string | null;
    }>();
    const statuses: Record<string, string> = {};
    const notes: Record<string, string> = {};
    const assignees: Record<string, string> = {};
    const sprints: Record<string, number> = {};
    const dueDates: Record<string, string> = {};
    const checkedSteps: Record<string, boolean[]> = {};
    const failedStepIndex: Record<string, number | null> = {};
    const assignedBy: Record<string, string> = {};
    const dateAssigned: Record<string, string> = {};
    const originalAssignees: Record<string, string> = {};
    const updatedAt: Record<string, string> = {};
    const updatedBy: Record<string, string> = {};
    const validStatuses = new Set([
      "not_run",
      "in_progress",
      "rolled_over",
      "pass",
      "conditional_approval",
      "fail",
      "blocked",
      "fixed_retest",
      "failed_retest",
      "fixed_cursor",
      "fixed_lighthouse",
      "fixed_foresight",
    ]);
    for (const row of results ?? []) {
      statuses[row.case_id] = validStatuses.has(row.status) ? row.status : "not_run";
      if (row.note) notes[row.case_id] = row.note;
      if (row.assignee) assignees[row.case_id] = row.assignee;
      // D1 may return INTEGER as number or string — preserve Backlog (-1) and Sprint 0.
      const sprintNum = Number(row.sprint);
      sprints[row.case_id] = Number.isFinite(sprintNum) ? sprintNum : 0;
      if (row.due_date) dueDates[row.case_id] = row.due_date;
      try {
        const parsed = JSON.parse(row.checked_steps_json || "[]");
        if (Array.isArray(parsed)) checkedSteps[row.case_id] = parsed.map(Boolean);
      } catch {
        /* ignore */
      }
      failedStepIndex[row.case_id] =
        typeof row.failed_step_index === "number" ? row.failed_step_index : null;
      assignedBy[row.case_id] = (row.assigned_by || "").trim() || SYSTEM_ASSIGNED_BY;
      if (row.date_assigned) dateAssigned[row.case_id] = row.date_assigned;
      if (row.original_assignee) originalAssignees[row.case_id] = row.original_assignee;
      if (row.updated_at) updatedAt[row.case_id] = row.updated_at;
      if (row.updated_by) updatedBy[row.case_id] = row.updated_by;
    }

    const { results: attRows } = await env.DB.prepare(
      `SELECT id, case_id, name, mime_type, size, scan_status, scan_detail, added_at, added_by
       FROM test_case_attachments ORDER BY added_at DESC`,
    ).all<{
      id: string;
      case_id: string;
      name: string;
      mime_type: string;
      size: number;
      scan_status: string;
      scan_detail: string;
      added_at: string;
      added_by: string;
    }>();
    const attachments: Record<
      string,
      Array<{
        id: string;
        name: string;
        mimeType: string;
        size: number;
        scanStatus: string;
        scanDetail: string;
        addedAt: string;
        addedBy: string;
      }>
    > = {};
    for (const a of attRows ?? []) {
      if (!attachments[a.case_id]) attachments[a.case_id] = [];
      attachments[a.case_id].push({
        id: a.id,
        name: a.name,
        mimeType: a.mime_type,
        size: a.size,
        scanStatus: a.scan_status,
        scanDetail: a.scan_detail,
        addedAt: a.added_at,
        addedBy: a.added_by,
      });
    }

    const generatedCases = await listGeneratedTestCases(env);
    return json({
      statuses,
      notes,
      assignees,
      sprints,
      dueDates,
      checkedSteps,
      failedStepIndex,
      assignedBy,
      dateAssigned,
      originalAssignees,
      updatedAt,
      updatedBy,
      attachments,
      generatedCases,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (isSchemaDriftError(msg)) {
      await ensureTestCaseStatusColumns(env);
      return listTestStatuses(env);
    }
    throw e;
  }
}

export async function setTestStatus(env: Env, request: Request, actor: DbUser): Promise<Response> {
  // Admin Studio actors (admin / QA / Dev) may change status; Blocked is Evelyn-only.
  if (!canChangeTestStatus(userRoles(actor))) {
    return error("QA or Admin access is required to change test status.", 403);
  }

  type Item = {
    caseId?: string;
    status?: string;
    note?: string;
    assignee?: string;
    sprint?: number;
    dueDate?: string;
    assignedBy?: string;
    dateAssigned?: string;
    checkedSteps?: boolean[] | number[];
    failedStepIndex?: number | null;
    stepCount?: number;
  };
  let body: Item & { items?: Item[] };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  await ensureTestCaseStatusColumns(env);

  const items = Array.isArray(body.items)
    ? body.items
    : body.caseId
      ? [
          {
            caseId: body.caseId,
            status: body.status,
            note: body.note,
            assignee: body.assignee,
            sprint: body.sprint,
            dueDate: body.dueDate,
            assignedBy: body.assignedBy,
            dateAssigned: body.dateAssigned,
            checkedSteps: body.checkedSteps,
            failedStepIndex: body.failedStepIndex,
            stepCount: body.stepCount,
          },
        ]
      : [];

  if (items.length === 0) return error("caseId and status required (or items[]).");

  const closedSprints = new Set(await listClosedSprintIndexes(env));
  const devAssigneeIds = await listDevAssigneeIds(env);

  // Load existing rows so omitted fields (and concurrent partial updates) do not wipe data.
  const caseIds = [
    ...new Set(items.map((raw) => String(raw.caseId || "")).filter(Boolean)),
  ];
  type ExistingRow = {
    case_id: string;
    status: string;
    note: string;
    assignee: string;
    sprint: number | string | null;
    due_date: string | null;
    checked_steps_json: string | null;
    failed_step_index: number | null;
    assigned_by: string | null;
    date_assigned: string | null;
    original_assignee: string | null;
  };
  const existingByCase: Record<string, ExistingRow> = {};
  if (caseIds.length > 0) {
    const CHUNK = 80;
    for (let i = 0; i < caseIds.length; i += CHUNK) {
      const slice = caseIds.slice(i, i + CHUNK);
      const placeholders = slice.map(() => "?").join(",");
      const { results } = await env.DB.prepare(
        `SELECT case_id, status, note, assignee, sprint, due_date, checked_steps_json, failed_step_index,
                assigned_by, date_assigned, original_assignee
         FROM test_case_status WHERE case_id IN (${placeholders})`,
      )
        .bind(...slice)
        .all<ExistingRow>();
      for (const row of results ?? []) existingByCase[row.case_id] = row;
    }
  }

  const upsertSql = `INSERT INTO test_case_status
         (case_id, status, note, assignee, sprint, due_date, checked_steps_json, failed_step_index,
          assigned_by, date_assigned, original_assignee, updated_at, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(case_id) DO UPDATE SET
           status = excluded.status,
           note = excluded.note,
           assignee = excluded.assignee,
           sprint = excluded.sprint,
           due_date = excluded.due_date,
           checked_steps_json = excluded.checked_steps_json,
           failed_step_index = excluded.failed_step_index,
           assigned_by = excluded.assigned_by,
           date_assigned = excluded.date_assigned,
           original_assignee = excluded.original_assignee,
           updated_at = excluded.updated_at,
           updated_by = excluded.updated_by`;

  const now = new Date().toISOString();
  const assignedToday = todayMMDDYY();
  const statements: D1PreparedStatement[] = [];
  const historySql = `INSERT INTO test_case_status_history
    (case_id, status, note, assignee, sprint, due_date, checked_steps_json, failed_step_index, changed_at, changed_by, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  for (const raw of items) {
    const caseId = String(raw.caseId || "");
    const prev = existingByCase[caseId];
    const isNewRow = !prev;
    const prevSprintNum = Number(prev?.sprint);
    const prevSprint = Number.isFinite(prevSprintNum) ? prevSprintNum : BACKLOG_SPRINT;

    let status = String(raw.status ?? prev?.status ?? "");
    const whoForNotes = actorLabel(actor);
    const prevNoteRaw = String(prev?.note ?? "");
    let note =
      raw.note !== undefined ? String(raw.note ?? "").trim() : prevNoteRaw.trim();
    if (raw.note !== undefined) {
      const mergedNote = mergeNoteEntries(
        prevNoteRaw,
        String(raw.note ?? ""),
        whoForNotes,
        now,
        {
          author: (prev?.updated_by || prev?.assigned_by || "").trim() || undefined,
          at: (prev?.updated_at || "").trim() || undefined,
        },
      );
      if (!mergedNote.ok) return error(mergedNote.error, 400);
      note = mergedNote.notes;
    }
    let assignee =
      raw.assignee !== undefined
        ? String(raw.assignee ?? "").trim()
        : String(prev?.assignee ?? "").trim();
    // Catalog automated cases never belong to human QA — suite runner only.
    const lockedSuiteOwner = suiteOwnerForAutomatedCase(caseId);
    if (lockedSuiteOwner) {
      assignee = lockedSuiteOwner;
      // Suite runners are pass/fail/not_run — never human "In Progress".
      if (status === "in_progress") status = "not_run";
    }

    let sprint = prevSprint;
    if (raw.sprint !== undefined && raw.sprint !== null) {
      const nextSprint = Number(raw.sprint);
      if (Number.isFinite(nextSprint)) sprint = nextSprint;
    }

    let dueDate =
      raw.dueDate !== undefined
        ? String(raw.dueDate ?? "").trim()
        : String(prev?.due_date ?? "").trim();

    // New generated failures (and brand-new rows with no sprint) get create defaults:
    // general → Backlog + Unassigned; Kevina/Kids/Youth → Tina + current/next sprint + due+1.
    let createDefaultsAssignee = "";
    if (isNewRow && (isGeneratedFailureCaseId(caseId) || raw.sprint === undefined || raw.sprint === null)) {
      const notePlain = noteEntriesPlainText(note);
      const defaults = defaultsForNewTest({
        id: caseId,
        title: notePlain.slice(0, 180),
        tags: notePlain,
      });
      sprint = defaults.sprint;
      createDefaultsAssignee = defaults.assignee;
      if (raw.assignee === undefined) assignee = defaults.assignee;
      if (raw.dueDate === undefined) dueDate = defaults.dueDate;
    }

    const stepCount = Math.max(0, Number(raw.stepCount ?? 0) || 0);
    let checked: boolean[];
    if (raw.checkedSteps !== undefined) {
      checked = parseCheckedSteps(raw.checkedSteps, stepCount);
    } else if (prev?.checked_steps_json) {
      try {
        const parsed = JSON.parse(prev.checked_steps_json);
        checked = Array.isArray(parsed) ? parsed.map(Boolean) : parseCheckedSteps([], stepCount);
      } catch {
        checked = parseCheckedSteps([], stepCount);
      }
    } else {
      checked = parseCheckedSteps([], stepCount);
    }

    let failedIdx: number | null;
    if (raw.failedStepIndex !== undefined) {
      failedIdx =
        raw.failedStepIndex === null || raw.failedStepIndex === undefined
          ? null
          : Number(raw.failedStepIndex);
    } else {
      failedIdx =
        typeof prev?.failed_step_index === "number" ? prev.failed_step_index : null;
    }

    if (!caseId || !status) return error("Each item needs caseId and status.");
    if (
      ![
        "not_run",
        "in_progress",
        "rolled_over",
        "pass",
        "conditional_approval",
        "fail",
        "blocked",
        "fixed_retest",
        "failed_retest",
        "fixed_cursor",
        "fixed_lighthouse",
        "fixed_foresight",
      ].includes(status)
    ) {
      return error(`Invalid status for ${caseId}.`);
    }

    const prevStatus = String(prev?.status ?? "");
    if (status === "fixed_lighthouse" || status === "fixed_foresight") {
      return error(
        "Lighthouse and Foresight are audit counts under Test Suites → Automated, not settable statuses. Use Pass when an audit case is verified.",
      );
    }

    const isDevRetest =
      status === "fixed_retest" ||
      status === "failed_retest" ||
      status === "fixed_cursor";
    let originalAssignee = String(prev?.original_assignee ?? "").trim();

    if (status === "blocked" && prevStatus !== "blocked" && !canSetTestBlocked(actor)) {
      return error("Only Evelyn may set a test to Blocked.", 403);
    }
    if (isDevRetest && prevStatus !== status && !canSetDevFixStatus(actor)) {
      return error(
        "Only Evelyn (Lead Developer) may set Fixed/Re-Test, Failed/Re-Test, or Fixed/Cursor.",
        403,
      );
    }
    if (
      (status === "fail" ||
        status === "blocked" ||
        status === "conditional_approval" ||
        isDevRetest) &&
      noteEntriesPlainText(note).length < 8
    ) {
      return error(
        status === "conditional_approval"
          ? `A note is required for Conditional Pass on ${caseId}. Describe the conditions (at least a short sentence).`
          : status === "fixed_retest"
            ? `A note is required for Fixed/Re-Test on ${caseId}. Describe what was fixed (at least a short sentence).`
            : status === "failed_retest"
              ? `A note is required for Failed/Re-Test on ${caseId}. Describe why this was not a real failure (misunderstood/unclear test).`
              : status === "fixed_cursor"
                ? `A note is required for Fixed/Cursor on ${caseId}. Describe what Cursor fixed (at least a short sentence).`
              : `A note is required for ${status} on ${caseId}. Describe what failed or what is blocking (at least a short sentence).`,
      );
    }
    if (status === "pass" && stepCount > 0 && !allStepsChecked(checked, stepCount)) {
      return error(
        `All ${stepCount} steps must be checked before marking ${caseId} as Pass.`,
      );
    }
    if (status === "fail") {
      if (
        stepCount > 0 &&
        (failedIdx === null ||
          !Number.isInteger(failedIdx) ||
          failedIdx < 0 ||
          failedIdx >= stepCount)
      ) {
        return error(`Select which step failed before marking ${caseId} as Fail.`);
      }
      // Remember the QA tester so Dev can assign back after Fixed/Failed Re-Test.
      const testerBefore = String(prev?.assignee ?? "").trim().toLowerCase();
      const requestedDev = String(assignee || "").trim().toLowerCase();
      const fromCaseId = qaOwnerFromCaseId(caseId);
      if (prevStatus !== "fail") {
        if (isHumanQaTesterId(testerBefore) && !devAssigneeIds.has(testerBefore)) {
          originalAssignee = testerBefore;
        } else if (!originalAssignee && isHumanQaTesterId(testerBefore)) {
          originalAssignee = testerBefore;
        } else if (!originalAssignee && isHumanQaTesterId(fromCaseId)) {
          // PROOF-*-TINA/LYRIQ often have empty assignee before Fail — keep the encoded owner.
          originalAssignee = fromCaseId;
        }
      }
      // Kids/Youth auto-generated failures keep Tina unless a human was explicitly chosen.
      // Fail defaults to Lead Dev, but partners may reassign to any QA tester (Tina/Evelyn/Lyriq).
      if (createDefaultsAssignee === "tina" && !isHumanQaTesterId(requestedDev)) {
        assignee = "tina";
        originalAssignee = "tina";
      } else if (isHumanQaTesterId(requestedDev)) {
        assignee = requestedDev;
      } else if (prevStatus === "fail" && isHumanQaTesterId(testerBefore)) {
        assignee = testerBefore;
      } else {
        assignee = FAILED_TEST_ASSIGNEE;
      }
    } else if (isDevRetest) {
      failedIdx = null;
      // QA will re-run from scratch — clear every step checkbox.
      checked = Array.from({ length: stepCount }, () => false);
      // Hand back to the original tester ONLY when entering Fixed/Failed Re-Test.
      // Later Assign-to edits (Evelyn → Tina) must stick; due-date heals must not yank them.
      if (prevStatus !== status) {
        let handBack = originalAssignee;
        if (!isHumanQaTesterId(handBack)) {
          handBack = qaOwnerFromCaseId(caseId);
        }
        if (isHumanQaTesterId(handBack)) {
          assignee = handBack;
          originalAssignee = handBack;
        }
      }
    } else {
      failedIdx = null;
    }

    // Backlog tests may keep a person assignee (QA parks work before committing a sprint).
    // Catalog automated cases always stay on the suite runner (wins over Fail→Dev).
    if (lockedSuiteOwner) assignee = lockedSuiteOwner;

    const checkedJson = JSON.stringify(checked);

    // Closed sprint lock — after field normalization, reject material changes on locked sprints.
    const prevNote = String(prev?.note ?? "").trim();
    const prevAssigneeVal = String(prev?.assignee ?? "").trim();
    const prevDue = String(prev?.due_date ?? "").trim();
    const prevChecked = String(prev?.checked_steps_json ?? "[]");
    const prevFailed =
      typeof prev?.failed_step_index === "number" ? prev.failed_step_index : null;
    const materialChange =
      isNewRow ||
      status !== prevStatus ||
      note !== prevNote ||
      assignee !== prevAssigneeVal ||
      sprint !== prevSprint ||
      dueDate !== prevDue ||
      checkedJson !== prevChecked ||
      failedIdx !== prevFailed;
    if (!isNewRow && closedSprintBlocksActor(closedSprints, prevSprint, actor)) {
      if (materialChange) {
        return error(`${SPRINT_LOCKED_MESSAGE} (${sprintLabel(prevSprint)})`, 403);
      }
      continue; // no-op on locked sprint
    }
    if (closedSprintBlocksActor(closedSprints, sprint, actor) && materialChange) {
      return error(`${SPRINT_LOCKED_MESSAGE} (${sprintLabel(sprint)})`, 403);
    }

    // Always upsert — never auto-delete. Deleting not_run rows wiped Backlog/Sprint 0
    // assignments (sprint <= 0 was treated as "empty") and dropped concurrent tester work.
    const who = actorLabel(actor);
    const prevAssignee = String(prev?.assignee ?? "").trim();
    const { assignedBy, dateAssigned } = resolveTestAssignedMeta({
      prevAssignee,
      nextAssignee: assignee,
      isNewRow,
      prevAssignedBy: String(prev?.assigned_by ?? "").trim(),
      prevDateAssigned: String(prev?.date_assigned ?? "").trim(),
      actorLabel: who,
      today: assignedToday,
      ...(raw.assignedBy !== undefined ? { explicitAssignedBy: String(raw.assignedBy ?? "") } : {}),
      ...(raw.dateAssigned !== undefined
        ? { explicitDateAssigned: String(raw.dateAssigned ?? "") }
        : {}),
    });

    if (prevAssignee !== assignee) {
      await logTestAssignmentChange(env, {
        caseId,
        fromAssignee: prevAssignee,
        toAssignee: assignee,
        changedBy: who,
      });
    }

    statements.push(
      env.DB.prepare(upsertSql).bind(
        caseId,
        status,
        note,
        assignee,
        sprint,
        dueDate,
        checkedJson,
        failedIdx,
        assignedBy,
        dateAssigned,
        originalAssignee,
        now,
        who,
      ),
    );
    statements.push(
      env.DB.prepare(historySql).bind(
        caseId,
        status,
        note,
        assignee,
        sprint,
        dueDate,
        checkedJson,
        failedIdx,
        now,
        who,
        "upsert",
      ),
    );
  }

  if (statements.length > 0) {
    try {
      const CHUNK = 50;
      for (let i = 0; i < statements.length; i += CHUNK) {
        await env.DB.batch(statements.slice(i, i + CHUNK));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (isSchemaDriftError(msg)) {
        await ensureTestCaseStatusColumns(env);
        const CHUNK = 50;
        for (let i = 0; i < statements.length; i += CHUNK) {
          await env.DB.batch(statements.slice(i, i + CHUNK));
        }
      } else {
        throw e;
      }
    }
  }
  return listTestStatuses(env);
}

export async function listTestAttachments(
  env: Env,
  request: Request,
): Promise<Response> {
  await ensureTestCaseStatusColumns(env);
  const url = new URL(request.url);
  const caseId = (url.searchParams.get("caseId") || "").trim();
  const id = (url.searchParams.get("id") || "").trim();
  const includeContent = url.searchParams.get("content") === "1";
  if (!caseId && !id) return error("caseId or id is required.");

  if (id) {
    return getTestAttachmentContent(env, id);
  }

  const { results } = await env.DB.prepare(
    includeContent
      ? `SELECT id, case_id, name, mime_type, size, content_base64, scan_status, scan_detail, added_at, added_by
         FROM test_case_attachments WHERE case_id = ? ORDER BY added_at DESC`
      : `SELECT id, case_id, name, mime_type, size, scan_status, scan_detail, added_at, added_by
         FROM test_case_attachments WHERE case_id = ? ORDER BY added_at DESC`,
  )
    .bind(caseId)
    .all<Record<string, unknown>>();

  return json({
    attachments: (results ?? []).map((a) => ({
      id: a.id,
      caseId: a.case_id,
      name: a.name,
      mimeType: a.mime_type,
      size: a.size,
      scanStatus: a.scan_status,
      scanDetail: a.scan_detail,
      addedAt: a.added_at,
      addedBy: a.added_by,
      ...(includeContent && typeof a.content_base64 === "string"
        ? { contentBase64: a.content_base64 }
        : {}),
    })),
  });
}

export async function uploadTestAttachment(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureTestCaseStatusColumns(env);
  let body: { caseId?: string; name?: string; mimeType?: string; contentBase64?: string };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const caseId = String(body.caseId || "").trim();
  const name = String(body.name || "").trim();
  const mimeType = String(body.mimeType || "").trim();
  const contentBase64 = String(body.contentBase64 || "").trim();
  if (!caseId || !name || !contentBase64) {
    return error("caseId, name, and contentBase64 are required.");
  }

  const testRow = await env.DB.prepare(
    `SELECT sprint FROM test_case_status WHERE case_id = ?`,
  )
    .bind(caseId)
    .first<{ sprint: number }>();
  if (testRow) {
    const locked = await rejectIfSprintLocked(env, Number(testRow.sprint), actor);
    if (locked) return locked;
  }

  const scan = scanTestEvidence({ name, mimeType, contentBase64 });
  if (!scan.ok) {
    return error(scan.error, 400);
  }

  const cleaned = contentBase64.replace(/^data:[^;]+;base64,/, "").replace(/\s+/g, "");
  const size = Math.floor((cleaned.length * 3) / 4);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO test_case_attachments
     (id, case_id, name, mime_type, size, content_base64, scan_status, scan_detail, added_at, added_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, caseId, name, scan.mime, size, cleaned, scan.scanStatus, scan.scanDetail, now, actor.email)
    .run();

  return json({
    ok: true,
    attachment: {
      id,
      caseId,
      name,
      mimeType: scan.mime,
      size,
      scanStatus: scan.scanStatus,
      scanDetail: scan.scanDetail,
      addedAt: now,
      addedBy: actor.email,
    },
  });
}

export async function deleteTestAttachment(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureTestCaseStatusColumns(env);
  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const id = String(body.id || "").trim();
  if (!id) return error("id is required.");
  const att = await env.DB.prepare(
    `SELECT a.id, s.sprint FROM test_case_attachments a
     LEFT JOIN test_case_status s ON s.case_id = a.case_id
     WHERE a.id = ?`,
  )
    .bind(id)
    .first<{ id: string; sprint: number | null }>();
  if (att && att.sprint !== null && att.sprint !== undefined) {
    const locked = await rejectIfSprintLocked(env, Number(att.sprint), actor);
    if (locked) return locked;
  }
  await env.DB.prepare(`DELETE FROM test_case_attachments WHERE id = ?`).bind(id).run();
  await appendAudit(env.DB, "test_attachment_delete", actor.email, id);
  return json({ ok: true });
}

export async function getTestAttachmentContent(
  env: Env,
  id: string,
): Promise<Response> {
  await ensureTestCaseStatusColumns(env);
  const row = await env.DB.prepare(
    `SELECT id, name, mime_type, content_base64, scan_status FROM test_case_attachments WHERE id = ?`,
  )
    .bind(id)
    .first<{
      id: string;
      name: string;
      mime_type: string;
      content_base64: string;
      scan_status: string;
    }>();
  if (!row) return error("Attachment not found.", 404);
  if (row.scan_status !== "clean") return error("Attachment failed safety scan.", 403);
  return json({
    id: row.id,
    name: row.name,
    mimeType: row.mime_type,
    contentBase64: row.content_base64,
  });
}

export async function listContent(env: Env, user: DbUser): Promise<Response> {
  const denied = requireAdminUser(user, "Content Factory / Marketing Launch Plan");
  if (denied) return denied;

  const batches = await env.DB.prepare(`SELECT * FROM content_batches ORDER BY created_at DESC`).all<{
    id: string;
    name: string;
    topic: string;
    created_at: string;
  }>();
  const drafts = await env.DB.prepare(`SELECT * FROM content_drafts ORDER BY created_at DESC`).all<{
    id: string;
    batch_id: string;
    type: string;
    title: string;
    excerpt: string;
    body: string;
    audience: string;
    status: string;
    owner: string;
    created_at: string;
  }>();

  const draftIdsByBatch = new Map<string, string[]>();
  for (const d of drafts.results ?? []) {
    const list = draftIdsByBatch.get(d.batch_id) ?? [];
    list.push(d.id);
    draftIdsByBatch.set(d.batch_id, list);
  }

  return json({
    batches: (batches.results ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      topic: b.topic,
      createdAt: b.created_at,
      draftIds: draftIdsByBatch.get(b.id) ?? [],
    })),
    drafts: (drafts.results ?? []).map((d) => ({
      id: d.id,
      batchId: d.batch_id,
      type: d.type,
      title: d.title,
      excerpt: d.excerpt,
      body: d.body,
      audience: d.audience,
      status: d.status,
      owner: d.owner,
      createdAt: d.created_at,
    })),
  });
}

export async function saveContent(env: Env, request: Request, user: DbUser): Promise<Response> {
  const denied = requireAdminUser(user, "Content Factory / Marketing Launch Plan");
  if (denied) return denied;

  let body: { batches?: unknown[]; drafts?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  if (!Array.isArray(body.batches) || !Array.isArray(body.drafts)) {
    return error("batches and drafts arrays required.");
  }

  await env.DB.prepare(`DELETE FROM content_drafts`).run();
  await env.DB.prepare(`DELETE FROM content_batches`).run();

  for (const b of body.batches as Array<Record<string, unknown>>) {
    await env.DB.prepare(
      `INSERT INTO content_batches (id, name, topic, created_at) VALUES (?, ?, ?, ?)`,
    )
      .bind(String(b.id), String(b.name || ""), String(b.topic || ""), String(b.createdAt || new Date().toISOString()))
      .run();
  }
  for (const d of body.drafts as Array<Record<string, unknown>>) {
    await env.DB.prepare(
      `INSERT INTO content_drafts (id, batch_id, type, title, excerpt, body, audience, status, owner, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        String(d.id),
        String(d.batchId),
        String(d.type),
        String(d.title || ""),
        String(d.excerpt || ""),
        String(d.body || ""),
        String(d.audience || "all"),
        String(d.status || "draft"),
        String(d.owner || "Both"),
        String(d.createdAt || new Date().toISOString()),
      )
      .run();
  }

  return listContent(env);
}

type SpeakerRow = {
  id: string;
  name: string;
  title: string;
  bio: string;
  topics_json: string;
  accent: string;
  initials: string;
  sort_order: number;
  updated_at: string;
};

type WorkshopRow = {
  id: string;
  title: string;
  blurb: string;
  date: string;
  time: string;
  format: string;
  audience: string;
  status: string;
  registration_open?: number;
  capacity?: number;
  registration_note?: string;
  speaker_ids_json: string;
  tags_json: string;
  sort_order: number;
  updated_at: string;
};

function parseJsonArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw || "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function mapSpeaker(row: SpeakerRow) {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    bio: row.bio,
    topics: parseJsonArray(row.topics_json),
    accent: row.accent,
    initials: row.initials,
  };
}

function mapWorkshop(row: WorkshopRow) {
  return {
    id: row.id,
    title: row.title,
    blurb: row.blurb,
    date: row.date || "TBD",
    time: row.time || "TBD",
    format: row.format,
    audience: row.audience,
    status: row.status,
    registrationOpen: Number(row.registration_open ?? 0) === 1,
    capacity: Number(row.capacity ?? 25) || 0,
    registrationNote:
      row.registration_note ||
      "Registration is not open yet. Check back after the schedule is confirmed.",
    speakerIds: parseJsonArray(row.speaker_ids_json),
    tags: parseJsonArray(row.tags_json),
  };
}

async function ensureWorkshopRegistrationSchema(env: Env): Promise<void> {
  await addColumnIfMissing(
    env,
    "workshops",
    "registration_open",
    `ALTER TABLE workshops ADD COLUMN registration_open INTEGER NOT NULL DEFAULT 0`,
  );
  await addColumnIfMissing(
    env,
    "workshops",
    "capacity",
    `ALTER TABLE workshops ADD COLUMN capacity INTEGER NOT NULL DEFAULT 25`,
  );
  await addColumnIfMissing(
    env,
    "workshops",
    "registration_note",
    `ALTER TABLE workshops ADD COLUMN registration_note TEXT NOT NULL DEFAULT 'Registration is not open yet. Check back after the schedule is confirmed.'`,
  );
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS workshop_registrations (
      id TEXT PRIMARY KEY,
      workshop_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      attendee_count INTEGER NOT NULL DEFAULT 1,
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'registered',
      created_at TEXT NOT NULL,
      FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE
    )`,
  ).run();
}

export async function listWorkshops(env: Env): Promise<Response> {
  await ensureWorkshopRegistrationSchema(env);
  const speakers = await env.DB.prepare(
    `SELECT * FROM guest_speakers ORDER BY sort_order ASC, id ASC`,
  ).all<SpeakerRow>();
  const workshops = await env.DB.prepare(
    `SELECT * FROM workshops ORDER BY sort_order ASC, id ASC`,
  ).all<WorkshopRow>();
  return json({
    speakers: (speakers.results ?? []).map(mapSpeaker),
    workshops: (workshops.results ?? []).map(mapWorkshop),
  });
}

export async function saveWorkshops(env: Env, request: Request): Promise<Response> {
  await ensureWorkshopRegistrationSchema(env);
  let body: { workshops?: unknown[]; speakers?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  if (!Array.isArray(body.workshops) || !Array.isArray(body.speakers)) {
    return error("workshops and speakers arrays required.");
  }

  const now = new Date().toISOString();
  await env.DB.prepare(`DELETE FROM workshops`).run();
  await env.DB.prepare(`DELETE FROM guest_speakers`).run();

  let speakerOrder = 0;
  for (const s of body.speakers as Array<Record<string, unknown>>) {
    await env.DB.prepare(
      `INSERT INTO guest_speakers (id, name, title, bio, topics_json, accent, initials, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        String(s.id || `sp-${crypto.randomUUID()}`),
        String(s.name || ""),
        String(s.title || ""),
        String(s.bio || ""),
        JSON.stringify(Array.isArray(s.topics) ? s.topics : []),
        String(s.accent || "#9B2F28"),
        String(s.initials || ""),
        speakerOrder++,
        now,
      )
      .run();
  }

  let workshopOrder = 0;
  for (const w of body.workshops as Array<Record<string, unknown>>) {
    await env.DB.prepare(
      `INSERT INTO workshops (id, title, blurb, date, time, format, audience, status, registration_open, capacity, registration_note, speaker_ids_json, tags_json, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        String(w.id || `ws-${crypto.randomUUID()}`),
        String(w.title || ""),
        String(w.blurb || ""),
        String(w.date || "TBD"),
        String(w.time || "TBD"),
        String(w.format || "Live Zoom"),
        String(w.audience || "all"),
        String(w.status || "upcoming"),
        w.registrationOpen === true ? 1 : 0,
        Math.max(0, Number(w.capacity ?? 25) || 0),
        String(w.registrationNote || "Registration is not open yet. Check back after the schedule is confirmed."),
        JSON.stringify(Array.isArray(w.speakerIds) ? w.speakerIds : []),
        JSON.stringify(Array.isArray(w.tags) ? w.tags : []),
        workshopOrder++,
        now,
      )
      .run();
  }

  return listWorkshops(env);
}

export async function createWorkshopRegistration(env: Env, request: Request): Promise<Response> {
  await ensureWorkshopRegistrationSchema(env);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const workshopId = String(body.workshopId || "").trim();
  const name = String(body.name || "").trim();
  const email = canonicalizeEmail(String(body.email || ""));
  const phone = String(body.phone || "").trim();
  const notes = String(body.notes || "").trim();
  const attendeeCount = Math.max(1, Math.min(10, Number(body.attendeeCount ?? 1) || 1));

  if (!workshopId) return error("Workshop is required.");
  if (!name) return error("Name is required.");
  if (!email || !email.includes("@")) return error("Valid email is required.");

  const workshop = await env.DB.prepare(
    `SELECT id, title, registration_open, capacity FROM workshops WHERE id = ?`,
  )
    .bind(workshopId)
    .first<{ id: string; title: string; registration_open: number; capacity: number }>();
  if (!workshop) return error("Workshop not found.", 404);
  if (Number(workshop.registration_open ?? 0) !== 1) {
    return error("Registration is not open for this workshop yet.", 403);
  }

  const current = await env.DB.prepare(
    `SELECT COALESCE(SUM(attendee_count), 0) AS taken FROM workshop_registrations WHERE workshop_id = ? AND status = 'registered'`,
  )
    .bind(workshopId)
    .first<{ taken: number }>();
  const capacity = Number(workshop.capacity ?? 0) || 0;
  const taken = Number(current?.taken ?? 0) || 0;
  if (capacity > 0 && taken + attendeeCount > capacity) {
    return error("This workshop is full. Please check back for the waitlist.", 409);
  }

  await env.DB.prepare(
    `INSERT INTO workshop_registrations (id, workshop_id, name, email, phone, attendee_count, notes, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'registered', ?)`,
  )
    .bind(`wr-${crypto.randomUUID()}`, workshopId, name, email, phone, attendeeCount, notes, new Date().toISOString())
    .run();

  try {
    const { sendAdminFormNotify } = await import("./email");
    const { escapeHtml: esc } = await import("./email-brand");
    await sendAdminFormNotify(env, {
      formName: "Workshop registration",
      summary: `${name} registered for ${workshop.title}`,
      detailsHtml: `<p style="margin:0 0 8px;"><strong>Workshop:</strong> ${esc(workshop.title)}</p>
        <p style="margin:0 0 8px;"><strong>Name:</strong> ${esc(name)}</p>
        <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${esc(email)}" style="color:#9B2F28;">${esc(email)}</a></p>
        <p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(phone || "—")}</p>
        <p style="margin:0 0 8px;"><strong>Attendees:</strong> ${attendeeCount}</p>
        ${notes ? `<p style="margin:0;"><strong>Notes:</strong> ${esc(notes)}</p>` : ""}`,
      replyTo: email,
      meta: { workshopId, email },
    });
  } catch {
    /* non-fatal */
  }

  return json({ ok: true, message: `You're registered for ${workshop.title}.` });
}

/* ————————————————————————————————————————————————————————————
 * Teens / Kids team signups with parental consent (API ids keep junior_*)
 * ———————————————————————————————————————————————————————————— */

type JuniorSignupRow = {
  id: string;
  team: string;
  child_name: string;
  child_email: string;
  parent_email: string;
  status: string;
  consent_token: string;
  parent_name: string;
  parent_phone: string;
  parent_address: string;
  parent_relationship: string;
  consent_granted_at: string | null;
  declined_at: string | null;
  created_at: string;
  updated_at: string;
};

async function ensureJuniorSignupSchema(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS junior_signups (
      id TEXT PRIMARY KEY,
      team TEXT NOT NULL DEFAULT 'junior',
      child_name TEXT NOT NULL,
      child_email TEXT NOT NULL,
      parent_email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_parent',
      consent_token TEXT NOT NULL UNIQUE,
      parent_name TEXT NOT NULL DEFAULT '',
      parent_phone TEXT NOT NULL DEFAULT '',
      parent_address TEXT NOT NULL DEFAULT '',
      parent_relationship TEXT NOT NULL DEFAULT '',
      consent_granted_at TEXT,
      declined_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ).run();
}

function newConsentToken(): string {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
}

function teamLabel(team: string): string {
  return team === "kids" ? "Kids Corner GYSH Team" : "Teens Side Hustle Team";
}

export async function createJuniorSignup(env: Env, request: Request): Promise<Response> {
  await ensureJuniorSignupSchema(env);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const team = String(body.team || "junior") === "kids" ? "kids" : "junior";
  const childName = String(body.childName || "").trim();
  const childEmail = canonicalizeEmail(String(body.childEmail || ""));
  const parentEmail = canonicalizeEmail(String(body.parentEmail || ""));
  /** Parental consent required through age 12 (Kids). Ages 13+ (Teens) join without consent. */
  const requiresParentConsent = team === "kids";

  if (!childName) return error("Your first name is required.");
  if (!childEmail || !childEmail.includes("@")) return error("A valid email is required.");
  if (requiresParentConsent) {
    if (!parentEmail || !parentEmail.includes("@")) {
      return error("A valid parent/guardian email is required.");
    }
    if (childEmail === parentEmail) {
      return error("The child and parent emails must be different.");
    }
  }

  const token = newConsentToken();
  const now = new Date().toISOString();
  const id = `js-${crypto.randomUUID()}`;
  const status = requiresParentConsent ? "pending_parent" : "active";
  const storedParentEmail = requiresParentConsent ? parentEmail : "";

  await env.DB.prepare(
    `INSERT INTO junior_signups (id, team, child_name, child_email, parent_email, status, consent_token, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, team, childName, childEmail, storedParentEmail, status, token, now, now)
    .run();

  let emailSent = false;
  try {
    const { emailConfigured, sendParentConsentEmail, sendAdminFormNotify, ROOT_DOMAIN } =
      await import("./email");
    const { escapeHtml: esc } = await import("./email-brand");
    if (emailConfigured(env)) {
      if (requiresParentConsent) {
        // Path-based link survives email client redirects better than ?consent=
        const consentUrl = `https://${ROOT_DOMAIN}/consent/${token}`;
        await sendParentConsentEmail(env, {
          parentEmail,
          childName,
          consentUrl,
          audience: "kids",
        });
        emailSent = true;
      }
      await sendAdminFormNotify(env, {
        formName: requiresParentConsent ? "Kids team signup" : "Teens team signup",
        summary: requiresParentConsent
          ? `${childName} · ${teamLabel(team)} · parent ${parentEmail}`
          : `${childName} · ${teamLabel(team)} · ${childEmail}`,
        detailsHtml: `<p style="margin:0 0 8px;"><strong>Team:</strong> ${esc(teamLabel(team))}</p>
          <p style="margin:0 0 8px;"><strong>Member:</strong> ${esc(childName)} (${esc(childEmail)})</p>
          ${
            requiresParentConsent
              ? `<p style="margin:0 0 8px;"><strong>Parent email:</strong> ${esc(parentEmail)}</p>
          <p style="margin:0;">Status: pending parent consent${emailSent ? " · consent email sent" : ""}.</p>`
              : `<p style="margin:0;">Status: <strong>active</strong> (parental consent not required for ages 13+).</p>`
          }`,
        replyTo: requiresParentConsent ? parentEmail : childEmail,
        meta: { team, childEmail, parentEmail: storedParentEmail, consentToken: token, status },
      });
    }
  } catch {
    // Swallow email errors — signup is recorded; parent can be re-notified later.
  }

  try {
    await appendAudit(
      env.DB,
      "junior_signup_created",
      requiresParentConsent ? parentEmail : childEmail,
      `${teamLabel(team)} · ${childName} · ${status}`,
    );
  } catch {
    /* audit must never block signup / consent email */
  }

  if (requiresParentConsent) {
    return json({
      ok: true,
      emailSent,
      status,
      message: emailSent
        ? "Almost there! We emailed your parent/guardian a permission link. Your account activates once they approve."
        : "Your request was saved. Ask your parent/guardian to check their email for a permission link (or contact us if it doesn't arrive).",
    });
  }

  return json({
    ok: true,
    emailSent: false,
    status,
    message: `You're in! Welcome to the ${teamLabel(team)}. Parental consent is not required for ages 13+ — your team access is active.`,
  });
}

function cleanConsentToken(token: string): string {
  return String(token || "")
    .trim()
    .replace(/[^a-fA-F0-9]/g, "");
}

export async function getJuniorConsent(env: Env, token: string): Promise<Response> {
  await ensureJuniorSignupSchema(env);
  const cleaned = cleanConsentToken(token);
  if (cleaned.length < 32) {
    return error("This consent link is invalid or has expired.", 404);
  }
  const row = await env.DB.prepare(
    `SELECT * FROM junior_signups WHERE consent_token = ?`,
  )
    .bind(cleaned)
    .first<JuniorSignupRow>();
  if (!row) return error("This consent link is invalid or has expired.", 404);

  return json({
    signup: {
      childName: row.child_name,
      childEmail: row.child_email,
      team: row.team,
      teamLabel: teamLabel(row.team),
      status: row.status,
      parentEmail: row.parent_email,
      consentGrantedAt: row.consent_granted_at,
    },
  });
}

export async function grantJuniorConsent(env: Env, token: string, request: Request): Promise<Response> {
  await ensureJuniorSignupSchema(env);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const cleaned = cleanConsentToken(token);
  if (cleaned.length < 32) {
    return error("This consent link is invalid or has expired.", 404);
  }

  const row = await env.DB.prepare(
    `SELECT * FROM junior_signups WHERE consent_token = ?`,
  )
    .bind(cleaned)
    .first<JuniorSignupRow>();
  if (!row) return error("This consent link is invalid or has expired.", 404);

  const decision = String(body.decision || "approve");
  const now = new Date().toISOString();

  if (decision === "decline") {
    await env.DB.prepare(
      `UPDATE junior_signups SET status = 'declined', declined_at = ?, updated_at = ? WHERE consent_token = ?`,
    )
      .bind(now, now, cleaned)
      .run();
    try {
      await appendAudit(env.DB, "junior_signup_declined", row.parent_email, `Child ${row.child_name}`);
    } catch {
      /* non-fatal */
    }
    return json({ ok: true, status: "declined", message: "You declined this request. The account will not be activated." });
  }

  const parentName = String(body.parentName || "").trim();
  const parentPhone = String(body.parentPhone || "").trim();
  const parentAddress = String(body.parentAddress || "").trim();
  const parentRelationship = String(body.parentRelationship || "").trim();
  const parentPassword = String(body.parentPassword || "");
  const kidPassword = String(body.kidPassword || "");
  const approved = body.approved === true;

  if (!parentName) return error("Parent/guardian name is required.");
  if (!parentPhone) return error("A contact phone number is required.");
  if (!approved) return error("You must grant permission to activate the account.");

  // If the parent has no GYSH login yet, consent must create username/password.
  const existingParent = await getUserByEmail(env.DB, canonicalizeEmail(row.parent_email));
  if (!existingParent) {
    const { passwordPolicyError } = await import("./password-policy");
    const pwErr = passwordPolicyError(parentPassword);
    if (pwErr) {
      return error(
        "Create a parent username/password to finish approval: " + pwErr,
      );
    }
  }
  if (kidPassword.length < 8) {
    return error("Create a kid login password (at least 8 characters) so they can sign in.");
  }

  let provision: {
    parentUserId: string;
    childProfileId: string;
    parentCreated: boolean;
    kidLoginCreated: boolean;
  } | null = null;
  try {
    const { provisionFamilyFromJuniorConsent } = await import("./family");
    provision = await provisionFamilyFromJuniorConsent(env, {
      parentEmail: row.parent_email,
      parentName,
      childName: row.child_name,
      childEmail: row.child_email,
      team: row.team,
      juniorSignupId: row.id,
      parentPassword: existingParent ? undefined : parentPassword,
      kidPassword,
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : "Could not link the kid profile to a parent account.");
  }

  await env.DB.prepare(
    `UPDATE junior_signups
       SET status = 'active', parent_name = ?, parent_phone = ?, parent_address = ?, parent_relationship = ?,
           consent_granted_at = ?, updated_at = ?
     WHERE consent_token = ?`,
  )
    .bind(parentName, parentPhone, parentAddress, parentRelationship, now, now, cleaned)
    .run();

  try {
    await appendAudit(env.DB, "junior_signup_activated", row.parent_email, `${teamLabel(row.team)} · child ${row.child_name}`);
  } catch {
    /* non-fatal */
  }

  try {
    const {
      sendAdminFormNotify,
      sendParentAccountReadyEmail,
      sendKidLoginReadyEmails,
    } = await import("./email");
    const { escapeHtml: esc } = await import("./email-brand");
    await sendAdminFormNotify(env, {
      formName: "Parent consent granted",
      summary: `${parentName} approved ${row.child_name} · ${teamLabel(row.team)}`,
      detailsHtml: `<p style="margin:0 0 8px;"><strong>Child:</strong> ${esc(row.child_name)} (${esc(row.child_email)})</p>
        <p style="margin:0 0 8px;"><strong>Parent:</strong> ${esc(parentName)} · ${esc(row.parent_email)}</p>
        <p style="margin:0 0 8px;"><strong>Phone:</strong> ${esc(parentPhone)}</p>
        <p style="margin:0;"><strong>Relationship:</strong> ${esc(parentRelationship || "—")}</p>`,
      replyTo: row.parent_email,
      meta: { team: row.team, childEmail: row.child_email },
    });
    if (provision?.parentCreated) {
      await sendParentAccountReadyEmail(env, {
        parentEmail: row.parent_email,
        parentName,
        childName: row.child_name,
      });
    }
    if (provision?.kidLoginCreated) {
      await sendKidLoginReadyEmails(env, {
        childName: row.child_name,
        childEmail: row.child_email,
        parentEmail: row.parent_email,
        parentName,
      });
    }
  } catch {
    /* non-fatal */
  }

  const loginHint = provision?.parentCreated
    ? ` Your parent login is ready — sign in at getyoursidehustle.com with ${row.parent_email}.`
    : "";
  const kidHint = provision?.kidLoginCreated
    ? ` ${row.child_name} can sign in with ${row.child_email} — we emailed both of you.`
    : "";

  return json({
    ok: true,
    status: "active",
    parentCreated: Boolean(provision?.parentCreated),
    kidLoginCreated: Boolean(provision?.kidLoginCreated),
    childProfileId: provision?.childProfileId ?? null,
    message: `Thank you, ${parentName}. ${row.child_name}'s ${teamLabel(row.team)} account is now active and linked to your parent coach profile.${loginHint}${kidHint}`,
  });
}

export async function listJuniorSignups(env: Env): Promise<Response> {
  await ensureJuniorSignupSchema(env);
  const { results } = await env.DB.prepare(
    `SELECT * FROM junior_signups ORDER BY created_at DESC LIMIT 500`,
  ).all<JuniorSignupRow>();
  return json({
    signups: (results ?? []).map((r) => ({
      id: r.id,
      team: r.team,
      teamLabel: teamLabel(r.team),
      childName: r.child_name,
      childEmail: r.child_email,
      parentEmail: r.parent_email,
      parentName: r.parent_name,
      parentPhone: r.parent_phone,
      parentAddress: r.parent_address,
      parentRelationship: r.parent_relationship,
      status: r.status,
      consentGrantedAt: r.consent_granted_at,
      createdAt: r.created_at,
    })),
  });
}

/** Parent Coach: children linked to the logged-in parent only. */
export async function listFamilyChildren(
  env: Env,
  user: { id: string; email: string },
): Promise<Response> {
  type ChildOut = {
    id: string;
    displayName: string;
    ageBand: "kids" | "junior";
    status: string;
    source: "profile" | "signup";
    hasLogin?: boolean;
    /** True when the kid joined (junior_signups) but has no child_profiles row yet. */
    needsRegistration?: boolean;
    childEmail?: string | null;
    juniorSignupId?: string | null;
  };
  const children: ChildOut[] = [];
  const seen = new Set<string>();

  try {
    const profiles = await env.DB.prepare(
      `SELECT id, display_name, age_band, COALESCE(status, 'active') AS status, linked_user_id, contact_email
       FROM child_profiles
       WHERE parent_user_id = ?
       ORDER BY created_at ASC`,
    )
      .bind(user.id)
      .all<{
        id: string;
        display_name: string;
        age_band: string;
        status: string;
        linked_user_id: string | null;
        contact_email: string | null;
      }>();
    for (const row of profiles.results ?? []) {
      const status = String(row.status || "active").toLowerCase();
      if (status === "deactivated" || status === "inactive") continue;
      const ageBand = row.age_band === "junior" ? "junior" : "kids";
      const key = `${ageBand}:${row.display_name.trim().toLowerCase()}`;
      seen.add(key);
      seen.add(row.id);
      children.push({
        id: row.id,
        displayName: row.display_name,
        ageBand,
        status,
        source: "profile",
        hasLogin: Boolean(row.linked_user_id),
        needsRegistration: false,
        childEmail: row.contact_email || null,
        juniorSignupId: null,
      });
    }
  } catch {
    /* child_profiles / status column may be missing pre-migration */
  }

  try {
    await ensureJuniorSignupSchema(env);
    const parentEmail = canonicalizeEmail(user.email);
    const signups = await env.DB.prepare(
      `SELECT id, team, child_name, child_email, status, child_profile_id
       FROM junior_signups
       WHERE parent_email = ?
         AND status IN ('active', 'pending_parent')
       ORDER BY created_at ASC`,
    )
      .bind(parentEmail)
      .all<{
        id: string;
        team: string;
        child_name: string;
        child_email: string;
        status: string;
        child_profile_id: string | null;
      }>();
    for (const row of signups.results ?? []) {
      if (row.child_profile_id && seen.has(row.child_profile_id)) continue;
      const ageBand = row.team === "junior" ? "junior" : "kids";
      const key = `${ageBand}:${row.child_name.trim().toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      children.push({
        id: row.id,
        displayName: row.child_name,
        ageBand,
        status: row.status,
        source: "signup",
        needsRegistration: true,
        childEmail: row.child_email || null,
        juniorSignupId: row.id,
      });
    }
  } catch {
    /* junior_signups may be missing */
  }

  return json({ children });
}

export async function listAudit(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT at, action, email, detail FROM audit_events ORDER BY id DESC LIMIT 100`,
  ).all<{ at: string; action: string; email: string; detail: string }>();
  return json({ events: results ?? [] });
}

export async function health(env: Env): Promise<Response> {
  if (!env?.DB) return error("Database unavailable.", 503);
  try {
    await ensurePartnerAdmins(env);
    const row = await env.DB.prepare(`SELECT COUNT(*) AS c FROM users`).first<{ c: number }>();
    const { emailConfigured } = await import("./email");
    return json({
      ok: true,
      db: "d1",
      users: row?.c ?? 0,
      email: emailConfigured(env) ? "configured" : "missing",
    });
  } catch (e) {
    return error(`Database error: ${e instanceof Error ? e.message : String(e)}`, 503);
  }
}

async function ensureContactSubmissionsTable(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS contact_submissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      email_status TEXT NOT NULL DEFAULT 'pending',
      provider_id TEXT,
      error TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    )`,
  ).run();
}

/** Public contact form → persist + Resend to admin inbox (DB win even if email blips). */
export async function handleContact(env: Env, request: Request): Promise<Response> {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = (await request.json()) as { name?: string; email?: string; message?: string };
  } catch {
    return error("Invalid JSON body.");
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  if (!name || !email || !message) {
    return error("Name, email, and message are required.");
  }
  if (name.length > 200 || email.length > 320 || message.length > 5000) {
    return error("Message is too long.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return error("Please provide a valid email address.");
  }

  const { emailConfigured, sendContactMessage, EmailSendError } = await import("./email");
  const submissionId = crypto.randomUUID();
  const now = new Date().toISOString();
  let saved = false;
  try {
    await ensureContactSubmissionsTable(env);
    await env.DB.prepare(
      `INSERT INTO contact_submissions (id, name, email, message, email_status, created_at)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
    )
      .bind(submissionId, name, canonicalizeEmail(email), message, now)
      .run();
    saved = true;
  } catch {
    /* fall through — still try email if D1 write fails */
  }

  if (!emailConfigured(env)) {
    if (saved) {
      return json({
        ok: true,
        message:
          "Thanks — we received your message. Email delivery is temporarily unavailable; we will follow up from the GYSH inbox.",
      });
    }
    return error("Email is not configured on the server yet.", 503);
  }

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await sendContactMessage(env, { name, email, message });
      if (saved) {
        try {
          await env.DB.prepare(
            `UPDATE contact_submissions
             SET email_status = 'sent', provider_id = ?, error = ''
             WHERE id = ?`,
          )
            .bind(result.id ?? "", submissionId)
            .run();
        } catch {
          /* ignore */
        }
      }
      try {
        await env.DB.prepare(
          `INSERT INTO audit_events (at, action, email, detail) VALUES (?, ?, ?, ?)`,
        )
          .bind(
            new Date().toISOString(),
            "contact_form",
            canonicalizeEmail(email),
            `contact from ${name}${result.id ? ` resend:${result.id}` : ""}${saved ? ` saved:${submissionId}` : ""}`,
          )
          .run();
      } catch {
        /* audit optional */
      }
      return json({ ok: true, message: "Thanks — your message was sent." });
    } catch (e) {
      lastError =
        e instanceof EmailSendError
          ? e.message
          : e instanceof Error
            ? e.message
            : String(e);
      if (attempt === 0) continue;
    }
  }

  if (saved) {
    try {
      await env.DB.prepare(
        `UPDATE contact_submissions
         SET email_status = 'failed', error = ?
         WHERE id = ?`,
      )
        .bind(lastError.slice(0, 500), submissionId)
        .run();
    } catch {
      /* ignore */
    }
    try {
      await env.DB.prepare(
        `INSERT INTO audit_events (at, action, email, detail) VALUES (?, ?, ?, ?)`,
      )
        .bind(
          new Date().toISOString(),
          "contact_form",
          canonicalizeEmail(email),
          `contact saved:${submissionId} email_failed: ${lastError.slice(0, 180)}`,
        )
        .run();
    } catch {
      /* ignore */
    }
    // Do not 502 when the message is safely stored — UI stays green; ops can follow up from D1.
    return json({
      ok: true,
      message:
        "Thanks — we received your message. If you don't hear back within 2–3 business days, email info@getyoursidehustle.com.",
    });
  }

  const domainIssue =
    lastError.toLowerCase().includes("domain") || lastError.toLowerCase().includes("403");
  return error(
    domainIssue
      ? "Email could not be sent (sending domain not verified in Resend yet). Please email info@getyoursidehustle.com directly."
      : `Email could not be sent: ${lastError || "unknown error"}`,
    502,
  );
}

/* ─── Admin Financials (admin role only) ─── */

type FinancialItemRow = {
  id: string;
  type: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type FinancialFileRow = {
  id: string;
  item_id: string | null;
  scope: string;
  title: string;
  name: string;
  mime_type: string;
  size: number;
  stored_id: string;
  notes: string;
  added_at: string;
};

function requireAdminUser(user: DbUser, feature = "This area"): Response | null {
  if (!hasRole(userRoles(user), "admin")) {
    return error(`${feature} is restricted to Admin accounts.`, 403);
  }
  return null;
}

function mapFinancialFile(f: FinancialFileRow) {
  return {
    id: f.id,
    itemId: f.item_id,
    scope: f.scope,
    title: f.title || "",
    name: f.name,
    mimeType: f.mime_type,
    size: f.size,
    storedId: f.stored_id,
    notes: f.notes || "",
    addedAt: f.added_at,
  };
}

function mapFinancialItem(item: FinancialItemRow, files: FinancialFileRow[]) {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    category: item.category || "",
    amount: Number(item.amount) || 0,
    date: item.date || "",
    notes: item.notes || "",
    sortOrder: item.sort_order ?? 0,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    receipts: files
      .filter((f) => f.item_id === item.id && f.scope === "receipt")
      .map(mapFinancialFile),
  };
}

export async function listFinancials(env: Env, user: DbUser): Promise<Response> {
  const denied = requireAdminUser(user, "Financials");
  if (denied) return denied;

  try {
    const items = await env.DB.prepare(
      `SELECT * FROM financial_items ORDER BY sort_order ASC, date DESC, id ASC`,
    ).all<FinancialItemRow>();
    const files = await env.DB.prepare(
      `SELECT * FROM financial_files ORDER BY added_at DESC`,
    ).all<FinancialFileRow>();
    const fileRows = files.results ?? [];
    return json({
      items: (items.results ?? []).map((i) => mapFinancialItem(i, fileRows)),
      contracts: fileRows.filter((f) => f.scope === "contract").map(mapFinancialFile),
      attachmentBlobsNote:
        "Receipt/contract file blobs remain in the browser IndexedDB until R2 is wired. Metadata is in D1.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("no such table")) {
      return error(
        "Financials tables are not installed yet. Run: npm run db:migrate",
        503,
      );
    }
    throw e;
  }
}

export async function saveFinancials(
  env: Env,
  request: Request,
  user: DbUser,
): Promise<Response> {
  const denied = requireAdminUser(user, "Financials");
  if (denied) return denied;

  let body: { items?: unknown[]; contracts?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  if (!Array.isArray(body.items) || !Array.isArray(body.contracts)) {
    return error("items and contracts arrays required.");
  }

  const now = new Date().toISOString();
  const items = body.items as Array<Record<string, unknown>>;
  const contracts = body.contracts as Array<Record<string, unknown>>;

  try {
    await env.DB.prepare(`DELETE FROM financial_files`).run();
    await env.DB.prepare(`DELETE FROM financial_items`).run();

    let order = 0;
    for (const raw of items) {
      const type = raw.type === "expense" ? "expense" : "budget";
      const id = String(raw.id || `fin-${Date.now()}-${order}`);
      await env.DB.prepare(
        `INSERT INTO financial_items
          (id, type, title, category, amount, date, notes, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          id,
          type,
          String(raw.title || "").trim() || "Untitled",
          String(raw.category || ""),
          Number(raw.amount) || 0,
          String(raw.date || ""),
          String(raw.notes || ""),
          order++,
          String(raw.createdAt || now),
          now,
        )
        .run();

      const receipts = Array.isArray(raw.receipts) ? raw.receipts : [];
      for (const r of receipts as Array<Record<string, unknown>>) {
        await env.DB.prepare(
          `INSERT INTO financial_files
            (id, item_id, scope, title, name, mime_type, size, stored_id, notes, added_at)
           VALUES (?, ?, 'receipt', ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            String(r.id || `rcpt-${Date.now()}`),
            id,
            String(r.title || ""),
            String(r.name || "receipt"),
            String(r.mimeType || "application/octet-stream"),
            Number(r.size) || 0,
            String(r.storedId || r.id || ""),
            String(r.notes || ""),
            String(r.addedAt || now),
          )
          .run();
      }
    }

    for (const c of contracts) {
      await env.DB.prepare(
        `INSERT INTO financial_files
          (id, item_id, scope, title, name, mime_type, size, stored_id, notes, added_at)
         VALUES (?, NULL, 'contract', ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          String(c.id || `ctr-${Date.now()}`),
          String(c.title || "Partnership contract"),
          String(c.name || "contract.pdf"),
          String(c.mimeType || "application/pdf"),
          Number(c.size) || 0,
          String(c.storedId || c.id || ""),
          String(c.notes || ""),
          String(c.addedAt || now),
        )
        .run();
    }

    await appendAudit(
      env.DB,
      "financials_save",
      user.email,
      `${items.length} items, ${contracts.length} contracts`,
    );

    return listFinancials(env, user);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("no such table")) {
      return error(
        "Financials tables are not installed yet. Run: npm run db:migrate",
        503,
      );
    }
    throw e;
  }
}

/** Self-heal: create plan tables if a deploy raced ahead of migrations. */
async function ensureAgilePlanTables(env: Env): Promise<void> {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS plan_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      owner TEXT NOT NULL DEFAULT 'Both',
      kind TEXT NOT NULL DEFAULT 'rollout',
      sprint INTEGER NOT NULL DEFAULT -1,
      status TEXT NOT NULL DEFAULT 'todo',
      date TEXT NOT NULL DEFAULT '',
      date_label TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      done_tina INTEGER NOT NULL DEFAULT 0,
      done_evelyn INTEGER NOT NULL DEFAULT 0
    )`),
    env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS idx_plan_items_sprint ON plan_items(sprint)`,
    ),
    env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS idx_plan_items_status ON plan_items(status)`,
    ),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS retro_cards (
      id TEXT PRIMARY KEY,
      sprint INTEGER NOT NULL,
      column_key TEXT NOT NULL CHECK (column_key IN ('went_well', 'improve', 'action')),
      text TEXT NOT NULL,
      owner TEXT NOT NULL DEFAULT 'Both',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )`),
    env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS idx_retro_cards_sprint ON retro_cards(sprint)`,
    ),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS plan_item_attachments (
      id TEXT PRIMARY KEY,
      plan_item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT '',
      size INTEGER NOT NULL DEFAULT 0,
      stored_id TEXT NOT NULL,
      r2_key TEXT,
      added_at TEXT NOT NULL,
      FOREIGN KEY(plan_item_id) REFERENCES plan_items(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS idx_plan_item_attachments_item ON plan_item_attachments(plan_item_id)`,
    ),
  ]);
  // Existing tables may predate the partner-done columns (migration 0012).
  const cols = await env.DB.prepare(`PRAGMA table_info(plan_items)`).all<{ name: string }>();
  const names = new Set((cols.results ?? []).map((c) => c.name));
  if (!names.has("done_tina")) {
    await env.DB.prepare(`ALTER TABLE plan_items ADD COLUMN done_tina INTEGER NOT NULL DEFAULT 0`).run();
  }
  if (!names.has("done_evelyn")) {
    await env.DB.prepare(`ALTER TABLE plan_items ADD COLUMN done_evelyn INTEGER NOT NULL DEFAULT 0`).run();
  }
  await ensureAttachmentContentColumns(env);
}

export async function listAgilePlan(env: Env): Promise<Response> {
  try {
    await ensureAgilePlanTables(env);
    const itemsRes = await env.DB.prepare(
      `SELECT id, title, notes, owner, kind, sprint, status, date, date_label, sort_order,
              done_tina, done_evelyn
       FROM plan_items ORDER BY sort_order ASC, id ASC`,
    ).all<{
      id: string;
      title: string;
      notes: string;
      owner: string;
      kind: string;
      sprint: number;
      status: string;
      date: string;
      date_label: string;
      sort_order: number;
      done_tina: number;
      done_evelyn: number;
    }>();

    const retroRes = await env.DB.prepare(
      `SELECT id, sprint, column_key, text, owner, sort_order, created_at
       FROM retro_cards ORDER BY sort_order ASC, created_at ASC`,
    ).all<{
      id: string;
      sprint: number;
      column_key: string;
      text: string;
      owner: string;
      sort_order: number;
      created_at: string;
    }>();

    const attachmentRes = await env.DB.prepare(
      `SELECT id, plan_item_id, name, mime_type, size, stored_id, r2_key, added_at, content_base64
       FROM plan_item_attachments ORDER BY added_at ASC, id ASC`,
    ).all<PlanAttachmentRow>();
    const attachments = attachmentRes.results ?? [];

    const items = (itemsRes.results ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      notes: r.notes,
      owner: r.owner,
      kind: r.kind,
      sprint: r.sprint,
      status: r.status,
      date: r.date,
      dateLabel: r.date_label,
      tinaDone: Number(r.done_tina ?? 0) === 1,
      evelynDone: Number(r.done_evelyn ?? 0) === 1,
      attachments: attachments
        .filter((a) => a.plan_item_id === r.id)
        .map((a) => ({
          id: a.id,
          name: a.name,
          mimeType: a.mime_type,
          size: a.size,
          storedId: a.stored_id,
          r2Key: a.r2_key,
          addedAt: a.added_at,
          hasContent: Boolean(a.content_base64 && String(a.content_base64).length > 0),
        })),
    }));

    const retro = (retroRes.results ?? []).map((r) => ({
      id: r.id,
      sprint: r.sprint,
      column: r.column_key,
      text: r.text,
      owner: r.owner,
    }));

    return json({ items, retro });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("no such table")) {
      return error("Agile plan tables missing. Run: npm run db:migrate", 503);
    }
    throw e;
  }
}

export async function saveAgilePlan(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  let body: { items?: unknown[]; retro?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  if (!Array.isArray(body.items) || !Array.isArray(body.retro)) {
    return error("items and retro arrays required.");
  }

  const now = new Date().toISOString();
  try {
    await ensureAgilePlanTables(env);
    const closedSprints = new Set(await listClosedSprintIndexes(env));

    const priorItemsRes = await env.DB.prepare(
      `SELECT id, title, notes, owner, kind, sprint, status, date, date_label, done_tina, done_evelyn
       FROM plan_items`,
    ).all<{
      id: string;
      title: string;
      notes: string;
      owner: string;
      kind: string;
      sprint: number;
      status: string;
      date: string;
      date_label: string;
      done_tina: number;
      done_evelyn: number;
    }>();
    const priorItems = new Map((priorItemsRes.results ?? []).map((r) => [r.id, r]));
    const priorRetroRes = await env.DB.prepare(
      `SELECT id, sprint, column_key, text, owner FROM retro_cards`,
    ).all<{
      id: string;
      sprint: number;
      column_key: string;
      text: string;
      owner: string;
    }>();
    const priorRetro = new Map((priorRetroRes.results ?? []).map((r) => [r.id, r]));

    const incomingItems = body.items as Array<Record<string, unknown>>;
    const incomingRetro = body.retro as Array<Record<string, unknown>>;
    const incomingItemIds = new Set(
      incomingItems.map((r) => String(r.id || "")).filter(Boolean),
    );
    const incomingRetroIds = new Set(
      incomingRetro.map((r) => String(r.id || "")).filter(Boolean),
    );

    for (const prev of priorItems.values()) {
      const prevSprint = Number(prev.sprint);
      if (!closedSprintBlocksActor(closedSprints, prevSprint, actor)) continue;
      if (!incomingItemIds.has(prev.id)) {
        return error(`${SPRINT_LOCKED_MESSAGE} (${sprintLabel(prevSprint)})`, 403);
      }
    }
    for (const raw of incomingItems) {
      const id = String(raw.id || "");
      const sprint = Number(raw.sprint ?? -1);
      const prev = id ? priorItems.get(id) : undefined;
      const title = String(raw.title || "");
      const notes = String(raw.notes || "");
      const owner = isBacklogSprint(sprint)
        ? UNASSIGNED_OWNER
        : String(raw.owner || "Both");
      const kind = String(raw.kind || "rollout");
      const status = String(raw.status || "todo");
      const date = String(raw.date || "");
      const dateLabel = String(raw.dateLabel || raw.date_label || "");
      const doneTina = raw.tinaDone === true || raw.tinaDone === 1 || raw.done_tina === 1 ? 1 : 0;
      const doneEvelyn =
        raw.evelynDone === true || raw.evelynDone === 1 || raw.done_evelyn === 1 ? 1 : 0;
      const unchanged =
        prev &&
        prev.title === title &&
        prev.notes === notes &&
        prev.owner === owner &&
        prev.kind === kind &&
        Number(prev.sprint) === sprint &&
        prev.status === status &&
        prev.date === date &&
        prev.date_label === dateLabel &&
        Number(prev.done_tina ?? 0) === doneTina &&
        Number(prev.done_evelyn ?? 0) === doneEvelyn;
      if (prev && closedSprintBlocksActor(closedSprints, Number(prev.sprint), actor) && !unchanged) {
        return error(`${SPRINT_LOCKED_MESSAGE} (${sprintLabel(Number(prev.sprint))})`, 403);
      }
      if (closedSprintBlocksActor(closedSprints, sprint, actor) && !unchanged) {
        return error(`${SPRINT_LOCKED_MESSAGE} (${sprintLabel(sprint)})`, 403);
      }
    }
    for (const prev of priorRetro.values()) {
      const prevSprint = Number(prev.sprint);
      if (!closedSprintBlocksActor(closedSprints, prevSprint, actor)) continue;
      if (!incomingRetroIds.has(prev.id)) {
        return error(`${SPRINT_LOCKED_MESSAGE} (${sprintLabel(prevSprint)})`, 403);
      }
    }
    for (const raw of incomingRetro) {
      const id = String(raw.id || "");
      const sprint = Number(raw.sprint ?? 0);
      const prev = id ? priorRetro.get(id) : undefined;
      const column = String(raw.column || raw.column_key || "went_well");
      const text = String(raw.text || "");
      const owner = String(raw.owner || "Both");
      const unchanged =
        prev &&
        Number(prev.sprint) === sprint &&
        prev.column_key === column &&
        prev.text === text &&
        prev.owner === owner;
      if (prev && closedSprintBlocksActor(closedSprints, Number(prev.sprint), actor) && !unchanged) {
        return error(`${SPRINT_LOCKED_MESSAGE} (${sprintLabel(Number(prev.sprint))})`, 403);
      }
      if (closedSprintBlocksActor(closedSprints, sprint, actor) && !unchanged) {
        return error(`${SPRINT_LOCKED_MESSAGE} (${sprintLabel(sprint)})`, 403);
      }
    }

    // Preserve file bytes across full plan rewrite (client sends metadata only).
    const priorPlanAtts = await env.DB.prepare(
      `SELECT id, content_base64 FROM plan_item_attachments`,
    ).all<{ id: string; content_base64: string | null }>();
    const priorPlanContent = new Map(
      (priorPlanAtts.results ?? []).map((r) => [r.id, r.content_base64 ?? null]),
    );
    await env.DB.prepare(`DELETE FROM plan_items`).run();
    await env.DB.prepare(`DELETE FROM plan_item_attachments`).run();
    await env.DB.prepare(`DELETE FROM retro_cards`).run();

    let order = 0;
    for (const raw of body.items as Array<Record<string, unknown>>) {
      const id = String(raw.id || `plan-${crypto.randomUUID()}`);
      await env.DB.prepare(
        `INSERT INTO plan_items
          (id, title, notes, owner, kind, sprint, status, date, date_label, sort_order, updated_at, done_tina, done_evelyn)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          id,
          String(raw.title || ""),
          String(raw.notes || ""),
          (() => {
            const sprintNum = Number(raw.sprint ?? -1);
            if (isBacklogSprint(sprintNum)) return UNASSIGNED_OWNER;
            return String(raw.owner || "Both");
          })(),
          String(raw.kind || "rollout"),
          Number(raw.sprint ?? -1),
          String(raw.status || "todo"),
          String(raw.date || ""),
          String(raw.dateLabel || raw.date_label || ""),
          order++,
          now,
          raw.tinaDone === true || raw.tinaDone === 1 || raw.done_tina === 1 ? 1 : 0,
          raw.evelynDone === true || raw.evelynDone === 1 || raw.done_evelyn === 1 ? 1 : 0,
        )
        .run();

      const attachments = Array.isArray(raw.attachments) ? raw.attachments : [];
      const seenAtt = new Set<string>();
      for (const att of attachments as Array<Record<string, unknown>>) {
        const attId = String(att.id || crypto.randomUUID());
        if (seenAtt.has(attId)) continue;
        seenAtt.add(attId);
        let content: string | null = priorPlanContent.get(attId) ?? null;
        if (typeof att.contentBase64 === "string" && String(att.contentBase64).trim()) {
          const validated = validateTaskAttachmentContent({
            name: String(att.name || ""),
            mimeType: String(att.mimeType || att.mime_type || "application/octet-stream"),
            contentBase64: String(att.contentBase64),
          });
          if (validated.ok) content = validated.cleaned;
        }
        await env.DB.prepare(
          `INSERT INTO plan_item_attachments
             (id, plan_item_id, name, mime_type, size, stored_id, r2_key, added_at, content_base64)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            attId,
            id,
            String(att.name || ""),
            String(att.mimeType || att.mime_type || ""),
            Number(att.size ?? 0),
            String(att.storedId || att.stored_id || attId),
            att.r2Key || att.r2_key ? String(att.r2Key || att.r2_key) : null,
            String(att.addedAt || att.added_at || now),
            content,
          )
          .run();
      }
    }

    order = 0;
    for (const raw of body.retro as Array<Record<string, unknown>>) {
      const id = String(raw.id || `retro-${crypto.randomUUID()}`);
      await env.DB.prepare(
        `INSERT INTO retro_cards
          (id, sprint, column_key, text, owner, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          id,
          Number(raw.sprint ?? 0),
          String(raw.column || raw.column_key || "went_well"),
          String(raw.text || ""),
          String(raw.owner || "Both"),
          order++,
          now,
        )
        .run();
    }

    return listAgilePlan(env);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("no such table")) {
      return error("Agile plan tables missing. Run: npm run db:migrate", 503);
    }
    throw e;
  }
}

const PROGRESS_KINDS = new Set([
  "launch_checklist",
  "launch_guide_steps",
  "kids_team",
  "junior_team",
  "senior_team",
]);

export async function getMemberProgress(env: Env, user: DbUser, kind: string): Promise<Response> {
  if (!PROGRESS_KINDS.has(kind)) return error("Unknown progress kind.");
  try {
    const row = await env.DB.prepare(
      `SELECT payload FROM member_progress WHERE user_id = ? AND kind = ?`,
    )
      .bind(user.id, kind)
      .first<{ payload: string }>();
    let payload: unknown = {};
    if (row?.payload) {
      try {
        payload = JSON.parse(row.payload);
      } catch {
        payload = {};
      }
    }
    return json({ kind, payload });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("no such table")) {
      return error("member_progress missing. Run: npm run db:migrate", 503);
    }
    throw e;
  }
}

export async function putMemberProgress(env: Env, request: Request, user: DbUser): Promise<Response> {
  let body: { kind?: string; payload?: unknown };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const kind = String(body.kind || "");
  if (!PROGRESS_KINDS.has(kind)) return error("Unknown progress kind.");
  const payload = body.payload ?? {};
  const now = new Date().toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO member_progress (user_id, kind, payload, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, kind) DO UPDATE SET
         payload = excluded.payload,
         updated_at = excluded.updated_at`,
    )
      .bind(user.id, kind, JSON.stringify(payload), now)
      .run();
    return json({ kind, payload, updatedAt: now });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("no such table")) {
      return error("member_progress missing. Run: npm run db:migrate", 503);
    }
    throw e;
  }
}
