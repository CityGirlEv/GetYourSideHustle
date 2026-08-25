/**
 * Partner work timers — start / pause / resume / end for tasks & tests.
 */
import { error, json, type DbUser, type Env } from "./auth";
import { withD1Retry } from "./d1-retry";

export type TimeSource = "task" | "test";
export type TimeEntryStatus = "running" | "paused" | "stopped";

export type TimeEntryRow = {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  source: string;
  source_id: string;
  source_label: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  accumulated_ms: number;
  running_since: string | null;
  work_date: string;
  created_at: string;
  updated_at: string;
};

export type TimeEntryDto = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  source: TimeSource;
  sourceId: string;
  sourceLabel: string;
  status: TimeEntryStatus;
  startedAt: string;
  endedAt: string | null;
  accumulatedMs: number;
  runningSince: string | null;
  workDate: string;
  /** Live elapsed including current run segment */
  elapsedMs: number;
  createdAt: string;
  updatedAt: string;
};

let timeEntriesSchemaReady = false;

async function ensureTimeEntriesTable(env: Env): Promise<void> {
  if (timeEntriesSchemaReady) return;
  try {
    // Table + indexes come from migration 0018. A cheap probe avoids
    // CREATE INDEX writes on every wrangler isolate recycle (those can
    // timeout remote D1 and reset the storage object).
    await env.DB.prepare(`SELECT 1 FROM time_entries LIMIT 0`).all();
    timeEntriesSchemaReady = true;
    return;
  } catch {
    /* first local sandbox — create below */
  }
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_name TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL,
      source_id TEXT NOT NULL,
      source_label TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      accumulated_ms INTEGER NOT NULL DEFAULT 0,
      running_since TEXT,
      work_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ).run();
  try {
    await env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, work_date)`,
    ).run();
  } catch {
    /* exists */
  }
  timeEntriesSchemaReady = true;
}

/** Partner timesheet calendar day (America/Chicago), not UTC. */
function workDateFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
}

function mapEntry(row: TimeEntryRow, nowMs = Date.now()): TimeEntryDto {
  let elapsed = row.accumulated_ms || 0;
  if (row.status === "running" && row.running_since) {
    const start = Date.parse(row.running_since);
    if (!Number.isNaN(start)) elapsed += Math.max(0, nowMs - start);
  }
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    userName: row.user_name,
    source: row.source as TimeSource,
    sourceId: row.source_id,
    sourceLabel: row.source_label,
    status: row.status as TimeEntryStatus,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    accumulatedMs: row.accumulated_ms || 0,
    runningSince: row.running_since,
    workDate: row.work_date,
    elapsedMs: elapsed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getOpenEntries(env: Env, userId: string): Promise<TimeEntryRow[]> {
  const { results } = await withD1Retry(() =>
    env.DB.prepare(
      `SELECT * FROM time_entries WHERE user_id = ? AND status IN ('running', 'paused') ORDER BY updated_at DESC`,
    )
      .bind(userId)
      .all<TimeEntryRow>(),
  );
  return results ?? [];
}

async function getEntryById(env: Env, id: string): Promise<TimeEntryRow | null> {
  return (
    (await env.DB.prepare(`SELECT * FROM time_entries WHERE id = ?`).bind(id).first<TimeEntryRow>()) ??
    null
  );
}

async function finalizeEntry(
  env: Env,
  row: TimeEntryRow,
  nowIso: string,
  _actor: DbUser,
  ensureMinMs = 0,
): Promise<TimeEntryRow> {
  let accumulated = row.accumulated_ms || 0;
  if (row.status === "running" && row.running_since) {
    const start = Date.parse(row.running_since);
    if (!Number.isNaN(start)) accumulated += Math.max(0, Date.parse(nowIso) - start);
  }
  if (ensureMinMs > 0 && accumulated < ensureMinMs) {
    accumulated = ensureMinMs;
  }
  await env.DB.prepare(
    `UPDATE time_entries
     SET status = 'stopped', ended_at = ?, accumulated_ms = ?, running_since = NULL, updated_at = ?
     WHERE id = ?`,
  )
    .bind(nowIso, accumulated, nowIso, row.id)
    .run();
  return (await getEntryById(env, row.id))!;
}

async function stopOpenForUser(env: Env, userId: string, actor: DbUser, exceptId?: string) {
  const open = await getOpenEntries(env, userId);
  const nowIso = new Date().toISOString();
  for (const row of open) {
    if (exceptId && row.id === exceptId) continue;
    await finalizeEntry(env, row, nowIso, actor);
  }
}

export async function listTimeEntries(env: Env, request: Request, actor: DbUser): Promise<Response> {
  await ensureTimeEntriesTable(env);
  const url = new URL(request.url);
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  const userIdParam = (url.searchParams.get("userId") || "").trim();
  const activeOnly = url.searchParams.get("active") === "1";

  // Admin Studio can pass userId=all (or team) to load every partner timesheet.
  const wantAll =
    userIdParam === "all" || userIdParam === "team" || userIdParam === "*";
  const scopedUserId = wantAll ? "" : userIdParam || actor.id;

  if (activeOnly) {
    if (wantAll) {
      const { results } = await withD1Retry(() =>
        env.DB.prepare(
          `SELECT * FROM time_entries WHERE status IN ('running', 'paused') ORDER BY updated_at DESC`,
        ).all<TimeEntryRow>(),
      );
      return json({ entries: (results ?? []).map((r) => mapEntry(r)) });
    }
    const open = await getOpenEntries(env, scopedUserId);
    return json({ entries: open.map((r) => mapEntry(r)) });
  }

  let sql = wantAll
    ? `SELECT * FROM time_entries WHERE 1=1`
    : `SELECT * FROM time_entries WHERE user_id = ?`;
  const binds: (string | number)[] = wantAll ? [] : [scopedUserId];
  if (from) {
    sql += ` AND work_date >= ?`;
    binds.push(from);
  }
  if (to) {
    sql += ` AND work_date <= ?`;
    binds.push(to);
  }
  sql += ` ORDER BY work_date DESC, started_at DESC`;

  const { results } = await withD1Retry(() =>
    env.DB.prepare(sql)
      .bind(...binds)
      .all<TimeEntryRow>(),
  );
  return json({ entries: (results ?? []).map((r) => mapEntry(r)) });
}

export async function startTimeEntry(env: Env, request: Request, actor: DbUser): Promise<Response> {
  await ensureTimeEntriesTable(env);
  const body = (await request.json()) as {
    source?: string;
    sourceId?: string;
    sourceLabel?: string;
  };
  const source = body.source === "test" ? "test" : body.source === "task" ? "task" : "";
  const sourceId = String(body.sourceId || "").trim();
  const sourceLabel = String(body.sourceLabel || sourceId).trim();
  if (!source || !sourceId) return error("source and sourceId are required.", 400);

  const nowIso = new Date().toISOString();
  const open = await getOpenEntries(env, actor.id);

  // Resume if same source is paused
  const same = open.find((r) => r.source === source && r.source_id === sourceId);
  if (same?.status === "running") {
    return json({ entry: mapEntry(same), resumed: false, alreadyRunning: true });
  }
  if (same?.status === "paused") {
    await env.DB.prepare(
      `UPDATE time_entries SET status = 'running', running_since = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(nowIso, nowIso, same.id)
      .run();
    const updated = await getEntryById(env, same.id);
    return json({ entry: mapEntry(updated!), resumed: true });
  }

  // Stop any other open timers for this user
  await stopOpenForUser(env, actor.id, actor);

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO time_entries (
      id, user_id, user_email, user_name, source, source_id, source_label,
      status, started_at, ended_at, accumulated_ms, running_since, work_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'running', ?, NULL, 0, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      actor.id,
      actor.email,
      actor.name || "",
      source,
      sourceId,
      sourceLabel,
      nowIso,
      nowIso,
      workDateFromIso(nowIso),
      nowIso,
      nowIso,
    )
    .run();

  const created = await getEntryById(env, id);
  return json({ entry: mapEntry(created!), resumed: false });
}

export async function pauseTimeEntry(env: Env, request: Request, actor: DbUser): Promise<Response> {
  await ensureTimeEntriesTable(env);
  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    source?: string;
    sourceId?: string;
  };
  const open = await getOpenEntries(env, actor.id);
  let row =
    (body.id && open.find((r) => r.id === body.id)) ||
    (body.source && body.sourceId
      ? open.find((r) => r.source === body.source && r.source_id === body.sourceId)
      : undefined) ||
    open.find((r) => r.status === "running") ||
    open[0];

  if (!row) return error("No open timer to pause.", 404);
  if (row.user_id !== actor.id) return error("Forbidden.", 403);
  if (row.status === "paused") return json({ entry: mapEntry(row), alreadyPaused: true });

  const nowIso = new Date().toISOString();
  let accumulated = row.accumulated_ms || 0;
  if (row.running_since) {
    const start = Date.parse(row.running_since);
    if (!Number.isNaN(start)) accumulated += Math.max(0, Date.parse(nowIso) - start);
  }
  await env.DB.prepare(
    `UPDATE time_entries
     SET status = 'paused', accumulated_ms = ?, running_since = NULL, updated_at = ?
     WHERE id = ?`,
  )
    .bind(accumulated, nowIso, row.id)
    .run();

  return json({ entry: mapEntry((await getEntryById(env, row.id))!) });
}

export async function endTimeEntry(env: Env, request: Request, actor: DbUser): Promise<Response> {
  await ensureTimeEntriesTable(env);
  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    source?: string;
    sourceId?: string;
    sourceLabel?: string;
    /** When true, create a stopped entry if none is open (QA Pass/Fail without In Progress). */
    createIfMissing?: boolean;
    /** Optional floor on elapsed ms when ending (default 0 — no floor). */
    ensureMinMs?: number;
  };
  const source = body.source === "test" ? "test" : body.source === "task" ? "task" : "";
  const sourceId = String(body.sourceId || "").trim();
  const sourceLabel = String(body.sourceLabel || sourceId).trim();
  const ensureMinMs = Math.max(0, Number(body.ensureMinMs) || 0);
  const createIfMissing = Boolean(body.createIfMissing);

  const open = await getOpenEntries(env, actor.id);
  let row =
    (body.id && (await getEntryById(env, body.id))) ||
    (source && sourceId
      ? open.find((r) => r.source === source && r.source_id === sourceId)
      : undefined) ||
    (!createIfMissing ? open[0] : undefined);

  const nowIso = new Date().toISOString();

  if (!row && createIfMissing && source && sourceId) {
    // Only invent an entry when a positive floor was requested; otherwise require a real timer.
    if (ensureMinMs <= 0) return error("No timer to end.", 404);
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO time_entries (
        id, user_id, user_email, user_name, source, source_id, source_label,
        status, started_at, ended_at, accumulated_ms, running_since, work_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'stopped', ?, ?, ?, NULL, ?, ?, ?)`,
    )
      .bind(
        id,
        actor.id,
        actor.email,
        actor.name || "",
        source,
        sourceId,
        sourceLabel || sourceId,
        nowIso,
        nowIso,
        ensureMinMs,
        workDateFromIso(nowIso),
        nowIso,
        nowIso,
      )
      .run();
    const created = await getEntryById(env, id);
    return json({ entry: mapEntry(created!), created: true });
  }

  if (!row) return error("No timer to end.", 404);
  if (row.user_id !== actor.id) return error("Forbidden.", 403);
  if (row.status === "stopped") return json({ entry: mapEntry(row), alreadyStopped: true });

  const finalized = await finalizeEntry(env, row, nowIso, actor, ensureMinMs);
  return json({ entry: mapEntry(finalized) });
}

/** Stop open timer for a source when task/test status changes (any user). */
export async function stopTimeForSource(
  env: Env,
  actor: DbUser,
  source: TimeSource,
  sourceId: string,
  opts?: { sourceLabel?: string; ensureMinMs?: number; createIfMissing?: boolean },
): Promise<TimeEntryDto | null> {
  await ensureTimeEntriesTable(env);
  const open = await getOpenEntries(env, actor.id);
  const row = open.find((r) => r.source === source && r.source_id === sourceId);
  const nowIso = new Date().toISOString();
  const ensureMinMs = Math.max(0, opts?.ensureMinMs ?? 0);
  if (!row) {
    if (!opts?.createIfMissing || ensureMinMs <= 0) return null;
    const id = crypto.randomUUID();
    const label = String(opts.sourceLabel || sourceId).trim() || sourceId;
    await env.DB.prepare(
      `INSERT INTO time_entries (
        id, user_id, user_email, user_name, source, source_id, source_label,
        status, started_at, ended_at, accumulated_ms, running_since, work_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'stopped', ?, ?, ?, NULL, ?, ?, ?)`,
    )
      .bind(
        id,
        actor.id,
        actor.email,
        actor.name || "",
        source,
        sourceId,
        label,
        nowIso,
        nowIso,
        ensureMinMs,
        workDateFromIso(nowIso),
        nowIso,
        nowIso,
      )
      .run();
    return mapEntry((await getEntryById(env, id))!);
  }
  const finalized = await finalizeEntry(env, row, nowIso, actor, ensureMinMs);
  return mapEntry(finalized);
}

export async function listTimeEntryUsers(env: Env, actor: DbUser): Promise<Response> {
  await ensureTimeEntriesTable(env);
  const { results } = await env.DB.prepare(
    `SELECT DISTINCT user_id as id, user_email as email, user_name as name
     FROM time_entries
     ORDER BY user_name, user_email`,
  ).all<{ id: string; email: string; name: string }>();

  const users = [...(results ?? [])];
  const ensure = (id: string, email: string, name: string) => {
    if (!users.some((u) => u.id === id || u.email.toLowerCase() === email.toLowerCase())) {
      users.push({ id, email, name });
    }
  };
  ensure(actor.id, actor.email, actor.name || "");
  ensure("u-lyriq", "leegaulden1222@icloud.com", "Lyriq");
  ensure("u-tina", "tinamariebarham@gmail.com", "Tina Marie Barham");
  ensure("u-ev", "evelyn3@cox.net", "Evelyn Irving");
  // Prefer known partner emails from seed if present in users table
  try {
    const partners = await env.DB.prepare(
      `SELECT id, email, name FROM users WHERE id IN ('u-lyriq','u-tina','u-ev') OR lower(name) LIKE '%lyriq%' OR lower(name) LIKE '%tina%' OR lower(name) LIKE '%evelyn%'`,
    ).all<{ id: string; email: string; name: string }>();
    for (const p of partners.results ?? []) {
      const idx = users.findIndex((u) => u.id === p.id || u.email.toLowerCase() === p.email.toLowerCase());
      if (idx >= 0) users[idx] = { id: p.id, email: p.email, name: p.name };
      else users.push(p);
    }
  } catch {
    /* ignore */
  }
  // Collapse duplicate partner logins (e.g. two Evelyn user_ids) to one roster row.
  const partnerRank = (email: string, name: string, id: string): string => {
    const hay = `${name} ${email} ${id}`.toLowerCase();
    if (hay.includes("tina") || email.includes("tinamariebarham") || id === "u-tina") return "tina";
    if (
      hay.includes("evelyn") ||
      hay.includes("evvelyn") ||
      hay.includes("irving") ||
      hay.includes("muntie") ||
      email.includes("evelyn3") ||
      id === "u-ev"
    ) {
      return "evelyn";
    }
    if (hay.includes("lyriq") || hay.includes("gaulden") || id === "u-lyriq") return "lyriq";
    return `other:${email.toLowerCase() || id}`;
  };
  const preferredId = (rank: string) =>
    rank === "tina" ? "u-tina" : rank === "evelyn" ? "u-ev" : rank === "lyriq" ? "u-lyriq" : "";
  const preferredName = (rank: string, fallback: string) =>
    rank === "tina"
      ? "Tina"
      : rank === "evelyn"
        ? "Evelyn"
        : rank === "lyriq"
          ? "Lyriq"
          : fallback;

  const merged = new Map<string, { id: string; email: string; name: string }>();
  for (const u of users) {
    const rank = partnerRank(u.email || "", u.name || "", u.id || "");
    const prev = merged.get(rank);
    if (!prev) {
      merged.set(rank, {
        id: preferredId(rank) || u.id,
        email: u.email,
        name: preferredName(rank, u.name || u.email),
      });
      continue;
    }
    // Prefer canonical partner ids / cleaner emails when merging.
    const prefer =
      u.id === preferredId(rank) ||
      (!prev.id.startsWith("u-") && Boolean(preferredId(rank)));
    if (prefer) {
      prev.id = preferredId(rank) || u.id;
      prev.email = u.email || prev.email;
    }
    prev.name = preferredName(rank, prev.name);
  }

  const deduped = [...merged.values()].sort((a, b) =>
    (a.name || a.email).localeCompare(b.name || b.email),
  );
  return json({ users: deduped });
}
