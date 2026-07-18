/**
 * CRUD handlers for GYSH admin data (users, tasks, tests, content, audit).
 */
import {
  appendAudit,
  canonicalizeEmail,
  error,
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
  hasRole,
  normalizeRolesInput,
  primaryRole,
  serializeRoles,
} from "./roles";

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
  sprint?: number;
  done_tina?: number;
  done_evelyn?: number;
};

type AttachmentRow = {
  id: string;
  task_id: string;
  name: string;
  mime_type: string;
  size: number;
  stored_id: string;
  r2_key: string | null;
  added_at: string;
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
    sprint: typeof row.sprint === "number" ? row.sprint : Number(row.sprint ?? 0) || 0,
    tinaDone: Number(row.done_tina ?? 0) === 1,
    evelynDone: Number(row.done_evelyn ?? 0) === 1,
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
}

export async function listUsers(env: Env): Promise<Response> {
  await ensurePartnerAdmins(env);
  const { results } = await env.DB.prepare(
    `SELECT id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt
     FROM users ORDER BY joined_at DESC, name ASC`,
  ).all<DbUser>();
  return json({ users: (results ?? []).map(publicUser) });
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
  if (password && password.length < MIN_PASSWORD_LENGTH) {
    return error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
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

  const user = await env.DB.prepare(
    `SELECT id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt FROM users WHERE id = ?`,
  )
    .bind(id)
    .first<DbUser>();

  return json({ user: user ? publicUser(user) : null });
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
      "File blobs remain in the browser IndexedDB until R2 is wired (phase 2). Metadata is in D1.",
  });
}

export async function saveTasks(env: Env, request: Request): Promise<Response> {
  let body: { tasks?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  if (!Array.isArray(body.tasks)) return error("tasks array required.");

  await ensureTaskColumns(env);

  const now = new Date().toISOString();
  // Dedupe by id (last wins) — concurrent clients / double-submit must not insert the same PK twice.
  const byId = new Map<string, Record<string, unknown>>();
  for (const raw of body.tasks as Array<Record<string, unknown>>) {
    const id = String(raw.id || "").trim() || `T-${crypto.randomUUID().slice(0, 8)}`;
    byId.set(id, { ...raw, id });
  }
  const incoming = Array.from(byId.values());

  const statements = [
    env.DB.prepare(`DELETE FROM task_attachments`),
    env.DB.prepare(`DELETE FROM tasks`),
  ];

  let order = 0;
  for (const t of incoming) {
    const id = String(t.id);
    statements.push(
      env.DB.prepare(
        `INSERT INTO tasks (
           id, description, category, priority, status, assign_by, assigned_to,
           date_assigned, due_date, date_completed, notes, sprint, done_tina, done_evelyn,
           sort_order, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        id,
        String(t.description || ""),
        String(t.category || "admin_ops"),
        String(t.priority || "P2"),
        String(t.status || "not_started"),
        String(t.assignBy || ""),
        String(t.assignedTo || "Both"),
        String(t.dateAssigned || ""),
        String(t.dueDate || ""),
        String(t.dateCompleted || ""),
        String(t.notes || ""),
        Number(t.sprint ?? 0),
        t.tinaDone === true || t.tinaDone === 1 || t.done_tina === 1 ? 1 : 0,
        t.evelynDone === true || t.evelynDone === 1 || t.done_evelyn === 1 ? 1 : 0,
        order++,
        now,
      ),
    );

    const attachments = Array.isArray(t.attachments) ? t.attachments : [];
    const seenAtt = new Set<string>();
    for (const a of attachments as Array<Record<string, unknown>>) {
      let attId = String(a.id || crypto.randomUUID());
      if (seenAtt.has(attId)) attId = crypto.randomUUID();
      seenAtt.add(attId);
      statements.push(
        env.DB.prepare(
          `INSERT INTO task_attachments (id, task_id, name, mime_type, size, stored_id, r2_key, added_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          attId,
          id,
          String(a.name || ""),
          String(a.mimeType || "application/octet-stream"),
          Number(a.size || 0),
          String(a.storedId || a.id || ""),
          a.r2Key ? String(a.r2Key) : null,
          String(a.addedAt || now),
        ),
      );
    }
  }

  try {
    await env.DB.batch(statements);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (isSchemaDriftError(msg)) {
      // One more repair pass, then retry once.
      await ensureTaskColumns(env);
      await env.DB.batch(statements);
      return listTasks(env);
    }
    throw e;
  }

  return listTasks(env);
}

/** Ensure test_case_status columns exist (handles Pages env / partial migration drift). */
async function ensureTestCaseStatusColumns(env: Env): Promise<void> {
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
}

export async function listTestStatuses(env: Env): Promise<Response> {
  try {
    await ensureTestCaseStatusColumns(env);
    const { results } = await env.DB.prepare(
      `SELECT case_id, status, note, assignee, sprint FROM test_case_status`,
    ).all<{ case_id: string; status: string; note: string; assignee: string; sprint: number }>();
    const statuses: Record<string, string> = {};
    const notes: Record<string, string> = {};
    const assignees: Record<string, string> = {};
    const sprints: Record<string, number> = {};
    for (const row of results ?? []) {
      statuses[row.case_id] = row.status;
      if (row.note) notes[row.case_id] = row.note;
      if (row.assignee) assignees[row.case_id] = row.assignee;
      sprints[row.case_id] = typeof row.sprint === "number" ? row.sprint : 0;
    }
    return json({ statuses, notes, assignees, sprints });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (isSchemaDriftError(msg)) {
      try {
        await ensureTestCaseStatusColumns(env);
        const { results } = await env.DB.prepare(
          `SELECT case_id, status, note, assignee, sprint FROM test_case_status`,
        ).all<{ case_id: string; status: string; note: string; assignee: string; sprint: number }>();
        const statuses: Record<string, string> = {};
        const notes: Record<string, string> = {};
        const assignees: Record<string, string> = {};
        const sprints: Record<string, number> = {};
        for (const row of results ?? []) {
          statuses[row.case_id] = row.status;
          if (row.note) notes[row.case_id] = row.note;
          if (row.assignee) assignees[row.case_id] = row.assignee;
          sprints[row.case_id] = typeof row.sprint === "number" ? row.sprint : 0;
        }
        return json({ statuses, notes, assignees, sprints });
      } catch {
        /* fall through to legacy */
      }
      const { results } = await env.DB.prepare(
        `SELECT case_id, status FROM test_case_status`,
      ).all<{ case_id: string; status: string }>();
      const statuses: Record<string, string> = {};
      for (const row of results ?? []) statuses[row.case_id] = row.status;
      return json({ statuses, notes: {}, assignees: {}, sprints: {} });
    }
    throw e;
  }
}

export async function setTestStatus(env: Env, request: Request, actor: DbUser): Promise<Response> {
  let body: {
    caseId?: string;
    status?: string;
    note?: string;
    assignee?: string;
    sprint?: number;
    items?: Array<{
      caseId?: string;
      status?: string;
      note?: string;
      assignee?: string;
      sprint?: number;
    }>;
  };
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
          },
        ]
      : [];

  if (items.length === 0) return error("caseId and status required (or items[]).");

  const upsertSql = `INSERT INTO test_case_status (case_id, status, note, assignee, sprint, updated_at, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(case_id) DO UPDATE SET
           status = excluded.status,
           note = excluded.note,
           assignee = excluded.assignee,
           sprint = excluded.sprint,
           updated_at = excluded.updated_at,
           updated_by = excluded.updated_by`;

  const now = new Date().toISOString();
  const statements = [];

  for (const raw of items) {
    const caseId = String(raw.caseId || "");
    const status = String(raw.status || "");
    const note = String(raw.note ?? "").trim();
    const assignee = String(raw.assignee ?? "").trim();
    const sprint = Number(raw.sprint ?? 0);
    if (!caseId || !status) return error("Each item needs caseId and status.");
    if (!["not_run", "in_progress", "pass", "fail", "blocked"].includes(status)) {
      return error(`Invalid status for ${caseId}.`);
    }
    if ((status === "fail" || status === "blocked") && note.length < 8) {
      return error(
        `A note is required for ${status} on ${caseId}. Describe what failed or what is blocking (at least a short sentence).`,
      );
    }

    if (status === "not_run" && !assignee && !note && !(sprint > 0)) {
      // Never wipe a completed/in-progress row via accidental empty PUT (e.g. notes blur race).
      // Also keep rows that only store a sprint assignment (common for Lyriq's large wizard matrix).
      const existing = await env.DB.prepare(`SELECT status FROM test_case_status WHERE case_id = ?`)
        .bind(caseId)
        .first<{ status: string }>();
      if (existing && existing.status !== "not_run") {
        continue;
      }
      statements.push(env.DB.prepare(`DELETE FROM test_case_status WHERE case_id = ?`).bind(caseId));
    } else {
      statements.push(
        env.DB.prepare(upsertSql).bind(caseId, status, note, assignee, Number.isFinite(sprint) ? sprint : 0, now, actor.email),
      );
    }
  }

  if (statements.length > 0) {
    try {
      // D1 batch max is typically 100–1000; chunk to stay safe.
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

export async function resetTestStatuses(env: Env): Promise<Response> {
  await env.DB.prepare(`DELETE FROM test_case_status`).run();
  return json({ statuses: {} });
}

export async function listContent(env: Env): Promise<Response> {
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

export async function saveContent(env: Env, request: Request): Promise<Response> {
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

  return json({ ok: true, message: `You're registered for ${workshop.title}.` });
}

/* ————————————————————————————————————————————————————————————
 * Junior / Kids team signups with parental consent
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
  return team === "kids" ? "Kids Corner GYSH Team" : "Junior Side Hustle Team";
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

  if (!childName) return error("Your first name is required.");
  if (!childEmail || !childEmail.includes("@")) return error("A valid email is required.");
  if (!parentEmail || !parentEmail.includes("@")) return error("A valid parent/guardian email is required.");
  if (childEmail === parentEmail) return error("The child and parent emails must be different.");

  const token = newConsentToken();
  const now = new Date().toISOString();
  const id = `js-${crypto.randomUUID()}`;

  await env.DB.prepare(
    `INSERT INTO junior_signups (id, team, child_name, child_email, parent_email, status, consent_token, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'pending_parent', ?, ?, ?)`,
  )
    .bind(id, team, childName, childEmail, parentEmail, token, now, now)
    .run();

  await appendAudit(env, "junior_signup_created", parentEmail, `${teamLabel(team)} · child ${childName}`);

  // Email the parent a consent link. Non-fatal if email is not configured.
  let emailSent = false;
  try {
    const { emailConfigured, sendResendEmail, ROOT_DOMAIN, SITE_NAME } = await import("./email");
    if (emailConfigured(env)) {
      const consentUrl = `https://${ROOT_DOMAIN}/?consent=${token}`;
      const safeChild = childName.replace(/[<>&"]/g, "");
      await sendResendEmail(env, {
        to: parentEmail,
        subject: `${SITE_NAME} — Parental consent needed for ${safeChild}`,
        html: `<p>Hi,</p>
<p><strong>${safeChild}</strong> would like to join the <strong>${teamLabel(team)}</strong> on ${SITE_NAME}.</p>
<p>Because ${safeChild} is under 18, we need a parent or guardian to approve and complete registration before the account is activated. We never collect a child's address or phone number — that information comes only from you, the parent.</p>
<p><a href="${consentUrl}" style="display:inline-block;padding:12px 20px;background:#9B2F28;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">Review &amp; grant permission</a></p>
<p>Or paste this link into your browser:<br/><a href="${consentUrl}">${consentUrl}</a></p>
<p>If you did not expect this, you can ignore this email and the account will stay inactive.</p>
<p>— ${SITE_NAME}</p>`,
        text: `${safeChild} wants to join the ${teamLabel(team)} on ${SITE_NAME}. As a parent/guardian, please review and grant permission: ${consentUrl}`,
      });
      emailSent = true;
    }
  } catch {
    // Swallow email errors — signup is recorded; parent can be re-notified later.
  }

  return json({
    ok: true,
    emailSent,
    message: emailSent
      ? "Almost there! We emailed your parent/guardian a permission link. Your account activates once they approve."
      : "Your request was saved. Ask your parent/guardian to check their email for a permission link (or contact us if it doesn't arrive).",
  });
}

export async function getJuniorConsent(env: Env, token: string): Promise<Response> {
  await ensureJuniorSignupSchema(env);
  const row = await env.DB.prepare(
    `SELECT * FROM junior_signups WHERE consent_token = ?`,
  )
    .bind(token)
    .first<JuniorSignupRow>();
  if (!row) return error("This consent link is invalid or has expired.", 404);

  return json({
    signup: {
      childName: row.child_name,
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

  const row = await env.DB.prepare(
    `SELECT * FROM junior_signups WHERE consent_token = ?`,
  )
    .bind(token)
    .first<JuniorSignupRow>();
  if (!row) return error("This consent link is invalid or has expired.", 404);

  const decision = String(body.decision || "approve");
  const now = new Date().toISOString();

  if (decision === "decline") {
    await env.DB.prepare(
      `UPDATE junior_signups SET status = 'declined', declined_at = ?, updated_at = ? WHERE consent_token = ?`,
    )
      .bind(now, now, token)
      .run();
    await appendAudit(env, "junior_signup_declined", row.parent_email, `Child ${row.child_name}`);
    return json({ ok: true, status: "declined", message: "You declined this request. The account will not be activated." });
  }

  const parentName = String(body.parentName || "").trim();
  const parentPhone = String(body.parentPhone || "").trim();
  const parentAddress = String(body.parentAddress || "").trim();
  const parentRelationship = String(body.parentRelationship || "").trim();
  const approved = body.approved === true;

  if (!parentName) return error("Parent/guardian name is required.");
  if (!parentPhone) return error("A contact phone number is required.");
  if (!approved) return error("You must grant permission to activate the account.");

  await env.DB.prepare(
    `UPDATE junior_signups
       SET status = 'active', parent_name = ?, parent_phone = ?, parent_address = ?, parent_relationship = ?,
           consent_granted_at = ?, updated_at = ?
     WHERE consent_token = ?`,
  )
    .bind(parentName, parentPhone, parentAddress, parentRelationship, now, now, token)
    .run();

  await appendAudit(env, "junior_signup_activated", row.parent_email, `${teamLabel(row.team)} · child ${row.child_name}`);

  return json({
    ok: true,
    status: "active",
    message: `Thank you, ${parentName}. ${row.child_name}'s ${teamLabel(row.team)} account is now active.`,
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

/** Public contact form → Resend to admin inbox. */
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
  if (!emailConfigured(env)) {
    return error("Email is not configured on the server yet.", 503);
  }

  try {
    const result = await sendContactMessage(env, { name, email, message });
    try {
      await env.DB.prepare(
        `INSERT INTO audit_events (at, action, email, detail) VALUES (?, ?, ?, ?)`,
      )
        .bind(
          new Date().toISOString(),
          "contact_form",
          canonicalizeEmail(email),
          `contact from ${name}${result.id ? ` resend:${result.id}` : ""}`,
        )
        .run();
    } catch {
      /* audit optional if DB missing columns */
    }
    return json({ ok: true, message: "Thanks — your message was sent." });
  } catch (e) {
    if (e instanceof EmailSendError) {
      return error(
        e.status === 403 || e.message.toLowerCase().includes("domain")
          ? "Email could not be sent (sending domain not verified in Resend yet). Please email info@getyoursidehustle.com directly."
          : `Email could not be sent: ${e.message}`,
        502,
      );
    }
    return error(`Email could not be sent: ${e instanceof Error ? e.message : String(e)}`, 502);
  }
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

function requireAdminUser(user: DbUser): Response | null {
  if (!hasRole(userRoles(user), "admin")) {
    return error("Financials are restricted to Admin accounts.", 403);
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
  const denied = requireAdminUser(user);
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
  const denied = requireAdminUser(user);
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
      env,
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
      `SELECT id, plan_item_id, name, mime_type, size, stored_id, r2_key, added_at
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

export async function saveAgilePlan(env: Env, request: Request): Promise<Response> {
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
          String(raw.owner || "Both"),
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
        await env.DB.prepare(
          `INSERT INTO plan_item_attachments
             (id, plan_item_id, name, mime_type, size, stored_id, r2_key, added_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
