/**
 * Partner meeting agenda — shared interactive items + preferred meeting times.
 * Users may edit/delete only their own items (including linked task/test picks).
 * Tasks/tests whose text contains "Agenda" also appear as read-only suggestions.
 */
import { error, json, type DbUser, type Env } from "./auth";
import { EmailSendError, emailConfigured, sendResendEmail } from "./email";
import { escapeHtml, SITE_NAME, SITE_URL, wrapBrandedEmail } from "./email-brand";
import { PARTNER_ADMINS } from "./partners";

export const DEFAULT_AGENDA_ID = "partner-agenda-main";
export const MIN_TIME_PICKS = 3;
export const MAX_TIME_PICKS = 5;
export const MIN_DURATION_MINUTES = 60;

const AGENDA_WORD_RE = /\bagenda\b/i;

type AgendaRow = {
  id: string;
  title: string;
  active: number;
  created_by_user_id: string;
  created_by_name: string;
  invite_sent_at: string | null;
  created_at: string;
  updated_at: string;
  meeting_date?: string | null;
  meeting_time?: string | null;
  invited_json?: string | null;
  attended_json?: string | null;
};

type ItemRow = {
  id: string;
  agenda_id: string;
  body: string;
  author_user_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  source_kind?: string | null;
  source_id?: string | null;
  category?: string | null;
  importance?: number | null;
  discussion_notes?: string | null;
  action_items_json?: string | null;
  questions_json?: string | null;
};

export type AgendaCategory = "website" | "financial" | "process" | "other";

const VALID_CATEGORIES = new Set(["website", "financial", "process", "other"]);

const DEFAULT_DISCUSSION_SEEDS: Array<{
  sourceId: string;
  body: string;
  category: AgendaCategory;
  importance: number;
}> = [
  {
    sourceId: "seed:sprint-process",
    body: "Discuss Sprint Process",
    category: "process",
    importance: 1,
  },
  {
    sourceId: "seed:testing-process",
    body: "Discuss Testing Process",
    category: "process",
    importance: 2,
  },
  {
    sourceId: "seed:adult-coach-kid-signup",
    body: "Discuss Adult Coach / Kid signup process and walk through it",
    category: "process",
    importance: 3,
  },
  {
    sourceId: "seed:monies-spent",
    body: "Monies spent — review what has been spent and capture amounts / receipts",
    category: "financial",
    importance: 1,
  },
  {
    sourceId: "seed:percentage-split",
    body: "Discussion on percentage split and allocation of some back toward dev and expenses",
    category: "financial",
    importance: 2,
  },
];

function parseNameList(raw: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(String(raw || "[]"));
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.map((n) => String(n || "").trim()).filter(Boolean))];
  } catch {
    return [];
  }
}

function parseActionItems(raw: string | null | undefined): Array<{
  id: string;
  text: string;
  owner: string;
  done: boolean;
}> {
  try {
    const parsed = JSON.parse(String(raw || "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((a) => ({
        id: String((a as { id?: string }).id || newId("act")),
        text: String((a as { text?: string }).text || "").trim(),
        owner: String((a as { owner?: string }).owner || "").trim(),
        done: Boolean((a as { done?: boolean }).done),
      }))
      .filter((a) => a.text);
  } catch {
    return [];
  }
}

function parseQuestions(raw: string | null | undefined): Array<{ id: string; text: string }> {
  try {
    const parsed = JSON.parse(String(raw || "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((q) => ({
        id: String((q as { id?: string }).id || newId("q")),
        text: String((q as { text?: string }).text || "").trim(),
      }))
      .filter((q) => q.text);
  } catch {
    return [];
  }
}

function normalizeCategory(raw: unknown): AgendaCategory {
  const c = String(raw || "other").toLowerCase();
  return VALID_CATEGORIES.has(c) ? (c as AgendaCategory) : "other";
}

function normalizeImportance(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 3;
  return Math.min(5, Math.max(1, Math.round(n)));
}

type PickRow = {
  id: string;
  agenda_id: string;
  user_id: string;
  user_name: string;
  starts_at: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureAgendaTables(env: Env): Promise<void> {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS partner_agenda (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Partner Meeting Agenda',
      active INTEGER NOT NULL DEFAULT 1,
      created_by_user_id TEXT NOT NULL DEFAULT '',
      created_by_name TEXT NOT NULL DEFAULT '',
      invite_sent_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS partner_agenda_items (
      id TEXT PRIMARY KEY,
      agenda_id TEXT NOT NULL,
      body TEXT NOT NULL,
      author_user_id TEXT NOT NULL,
      author_name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      source_kind TEXT NOT NULL DEFAULT 'user',
      source_id TEXT NOT NULL DEFAULT ''
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS partner_agenda_time_picks (
      id TEXT PRIMARY KEY,
      agenda_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL DEFAULT '',
      starts_at TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
  ]);
  // Older DBs — add columns if missing.
  for (const sql of [
    `ALTER TABLE partner_agenda_items ADD COLUMN source_kind TEXT NOT NULL DEFAULT 'user'`,
    `ALTER TABLE partner_agenda_items ADD COLUMN source_id TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda ADD COLUMN meeting_date TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda ADD COLUMN meeting_time TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda ADD COLUMN invited_json TEXT NOT NULL DEFAULT '[]'`,
    `ALTER TABLE partner_agenda ADD COLUMN attended_json TEXT NOT NULL DEFAULT '[]'`,
    `ALTER TABLE partner_agenda_items ADD COLUMN category TEXT NOT NULL DEFAULT 'other'`,
    `ALTER TABLE partner_agenda_items ADD COLUMN importance INTEGER NOT NULL DEFAULT 3`,
    `ALTER TABLE partner_agenda_items ADD COLUMN discussion_notes TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda_items ADD COLUMN action_items_json TEXT NOT NULL DEFAULT '[]'`,
    `ALTER TABLE partner_agenda_items ADD COLUMN questions_json TEXT NOT NULL DEFAULT '[]'`,
  ]) {
    try {
      await env.DB.prepare(sql).run();
    } catch {
      /* column already exists */
    }
  }
}

async function ensureSeedDiscussionItems(env: Env, agendaId: string, user: DbUser): Promise<void> {
  const now = nowIso();
  const name = displayName(user);
  for (const seed of DEFAULT_DISCUSSION_SEEDS) {
    const existing = await env.DB.prepare(
      `SELECT id FROM partner_agenda_items
       WHERE agenda_id = ? AND source_kind = 'user' AND source_id = ? LIMIT 1`,
    )
      .bind(agendaId, seed.sourceId)
      .first<{ id: string }>();
    if (existing) continue;
    await env.DB.prepare(
      `INSERT INTO partner_agenda_items
        (id, agenda_id, body, author_user_id, author_name, created_at, updated_at,
         source_kind, source_id, category, importance, discussion_notes, action_items_json, questions_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'user', ?, ?, ?, '', '[]', '[]')`,
    )
      .bind(
        newId("ai"),
        agendaId,
        seed.body,
        user.id,
        name,
        now,
        now,
        seed.sourceId,
        seed.category,
        seed.importance,
      )
      .run();
  }
}

function displayName(user: DbUser): string {
  return String(user.name || user.email || "Partner").trim() || "Partner";
}

function isTinaOrLyriq(user: { email?: string; name?: string }): boolean {
  const email = String(user.email || "").toLowerCase();
  const name = String(user.name || "").toLowerCase();
  if (email.includes("tina") || name.includes("tina")) return true;
  if (email.includes("lyriq") || email.includes("leegaulden") || name.includes("lyriq")) return true;
  return false;
}

async function loadSuggestedTaskItems(env: Env): Promise<
  Array<{
    id: string;
    body: string;
    source: "task";
    sourceId: string;
    authorName: string;
    canEdit: false;
    suggested: true;
  }>
> {
  try {
    const rows = await env.DB.prepare(
      `SELECT id, description, notes, assigned_to, updated_by, status
       FROM tasks
       WHERE lower(description) LIKE '%agenda%'
          OR lower(IFNULL(notes, '')) LIKE '%agenda%'
       ORDER BY sort_order ASC, id ASC`,
    ).all<{
      id: string;
      description: string;
      notes: string | null;
      assigned_to: string | null;
      updated_by: string | null;
      status: string | null;
    }>();
    const out: Array<{
      id: string;
      body: string;
      source: "task";
      sourceId: string;
      authorName: string;
      canEdit: false;
      suggested: true;
    }> = [];
    for (const t of rows.results ?? []) {
      const desc = String(t.description || "");
      const notes = String(t.notes || "");
      if (!AGENDA_WORD_RE.test(desc) && !AGENDA_WORD_RE.test(notes)) continue;
      const id = String(t.id || "").trim();
      if (!id) continue;
      const body = AGENDA_WORD_RE.test(notes)
        ? `${desc.trim()}${desc.trim() && notes.trim() ? "\n" : ""}${notes.trim()}`.trim()
        : desc.trim();
      out.push({
        id: `suggest-task:${id}`,
        body: body || desc.trim() || notes.trim(),
        source: "task",
        sourceId: id,
        authorName: String(t.assigned_to || t.updated_by || "Task List").trim() || "Task List",
        canEdit: false,
        suggested: true,
      });
    }
    return out;
  } catch {
    return [];
  }
}

function mapItem(it: ItemRow, userId: string) {
  const sourceKindRaw = String(it.source_kind || "user").toLowerCase();
  const sourceKind =
    sourceKindRaw === "task" || sourceKindRaw === "test" ? sourceKindRaw : ("user" as const);
  const sourceId = String(it.source_id || "").trim();
  return {
    id: it.id,
    body: it.body,
    source: sourceKind,
    sourceId: sourceId || undefined,
    authorUserId: it.author_user_id,
    authorName: it.author_name,
    createdAt: it.created_at,
    updatedAt: it.updated_at,
    category: normalizeCategory(it.category),
    importance: normalizeImportance(it.importance),
    discussionNotes: String(it.discussion_notes || ""),
    actionItems: parseActionItems(it.action_items_json),
    questions: parseQuestions(it.questions_json),
    canEdit: it.author_user_id === userId,
    canEditMeetingFields: true,
    suggested: false as const,
  };
}

async function getOrNullAgenda(env: Env): Promise<AgendaRow | null> {
  return env.DB.prepare(`SELECT * FROM partner_agenda WHERE id = ?`)
    .bind(DEFAULT_AGENDA_ID)
    .first<AgendaRow>();
}

async function buildPayload(env: Env, user: DbUser) {
  const agenda = await getOrNullAgenda(env);
  const suggested = await loadSuggestedTaskItems(env);
  if (!agenda) {
    return {
      agenda: null,
      items: [] as unknown[],
      suggestedItems: suggested,
      /** @deprecated use suggestedItems */
      taskItems: suggested,
      timePicks: [] as unknown[],
      myPickCount: 0,
      needsTimePicks: false,
      minPicks: MIN_TIME_PICKS,
      maxPicks: MAX_TIME_PICKS,
      minDurationMinutes: MIN_DURATION_MINUTES,
    };
  }

  await ensureSeedDiscussionItems(env, agenda.id, user);

  const items = (
    await env.DB.prepare(
      `SELECT * FROM partner_agenda_items
       WHERE agenda_id = ?
       ORDER BY importance ASC, created_at ASC`,
    )
      .bind(agenda.id)
      .all<ItemRow>()
  ).results;

  const mappedItems = (items ?? []).map((it) => mapItem(it, user.id));
  const linkedKeys = new Set(
    mappedItems
      .filter((it) => (it.source === "task" || it.source === "test") && it.sourceId)
      .map((it) => `${it.source}:${it.sourceId}`),
  );
  const suggestedItems = suggested.filter((s) => !linkedKeys.has(`${s.source}:${s.sourceId}`));

  const picks = (
    await env.DB.prepare(
      `SELECT * FROM partner_agenda_time_picks WHERE agenda_id = ? ORDER BY starts_at ASC`,
    )
      .bind(agenda.id)
      .all<PickRow>()
  ).results;

  const myPicks = picks.filter((p) => p.user_id === user.id);
  const forcePicker = isTinaOrLyriq(user);
  const needsTimePicks = forcePicker && myPicks.length < MIN_TIME_PICKS;
  const defaultInvited = PARTNER_ADMINS.map((p) => p.name.split(" ")[0] || p.name);
  const invited = parseNameList(agenda.invited_json);
  const attended = parseNameList(agenda.attended_json);

  return {
    agenda: {
      id: agenda.id,
      title: agenda.title,
      active: agenda.active === 1,
      createdByUserId: agenda.created_by_user_id,
      createdByName: agenda.created_by_name,
      inviteSentAt: agenda.invite_sent_at,
      createdAt: agenda.created_at,
      updatedAt: agenda.updated_at,
      meetingDate: String(agenda.meeting_date || ""),
      meetingTime: String(agenda.meeting_time || ""),
      invited: invited.length ? invited : defaultInvited,
      attended,
    },
    categories: [
      { id: "website", label: "Website Stuff" },
      { id: "financial", label: "Financial Stuff" },
      { id: "process", label: "Process / Ops" },
      { id: "other", label: "Other" },
    ],
    items: mappedItems,
    suggestedItems,
    /** @deprecated use suggestedItems */
    taskItems: suggestedItems,
    timePicks: picks.map((p) => ({
      id: p.id,
      userId: p.user_id,
      userName: p.user_name,
      startsAt: p.starts_at,
      durationMinutes: p.duration_minutes,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      isMine: p.user_id === user.id,
    })),
    myPickCount: myPicks.length,
    needsTimePicks,
    minPicks: MIN_TIME_PICKS,
    maxPicks: MAX_TIME_PICKS,
    minDurationMinutes: MIN_DURATION_MINUTES,
  };
}

export async function getPartnerAgenda(env: Env, user: DbUser): Promise<Response> {
  try {
    await ensureAgendaTables(env);
    return json({ ok: true, ...(await buildPayload(env, user)) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("no such table")) {
      return error("partner_agenda missing. Run: npm run db:migrate", 503);
    }
    throw e;
  }
}

export async function createPartnerAgenda(env: Env, user: DbUser): Promise<Response> {
  try {
    await ensureAgendaTables(env);
    const existing = await getOrNullAgenda(env);
    const now = nowIso();
    const invitedJson = JSON.stringify(
      PARTNER_ADMINS.map((p) => p.name.split(" ")[0] || p.name),
    );
    if (existing) {
      await env.DB.prepare(
        `UPDATE partner_agenda SET active = 1, updated_at = ? WHERE id = ?`,
      )
        .bind(now, existing.id)
        .run();
      await ensureSeedDiscussionItems(env, existing.id, user);
    } else {
      await env.DB.prepare(
        `INSERT INTO partner_agenda
          (id, title, active, created_by_user_id, created_by_name, invite_sent_at,
           meeting_date, meeting_time, invited_json, attended_json, created_at, updated_at)
         VALUES (?, ?, 1, ?, ?, NULL, '', '', ?, '[]', ?, ?)`,
      )
        .bind(
          DEFAULT_AGENDA_ID,
          "Partner Meeting Agenda",
          user.id,
          displayName(user),
          invitedJson,
          now,
          now,
        )
        .run();
      await ensureSeedDiscussionItems(env, DEFAULT_AGENDA_ID, user);
    }
    return json({ ok: true, created: !existing, ...(await buildPayload(env, user)) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("no such table")) {
      return error("partner_agenda missing. Run: npm run db:migrate", 503);
    }
    throw e;
  }
}

export async function updateAgendaMeta(
  env: Env,
  request: Request,
  user: DbUser,
): Promise<Response> {
  await ensureAgendaTables(env);
  const agenda = await getOrNullAgenda(env);
  if (!agenda || agenda.active !== 1) {
    return error("Create the agenda from Schedule & Plan first.", 400);
  }

  let body: {
    title?: string;
    meetingDate?: string;
    meetingTime?: string;
    invited?: string[];
    attended?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const title = String(body.title ?? agenda.title).trim() || agenda.title;
  const meetingDate = String(body.meetingDate ?? agenda.meeting_date ?? "").trim();
  const meetingTime = String(body.meetingTime ?? agenda.meeting_time ?? "").trim();
  const invited = Array.isArray(body.invited)
    ? body.invited.map((n) => String(n || "").trim()).filter(Boolean)
    : parseNameList(agenda.invited_json);
  const attended = Array.isArray(body.attended)
    ? body.attended.map((n) => String(n || "").trim()).filter(Boolean)
    : parseNameList(agenda.attended_json);
  const now = nowIso();

  await env.DB.prepare(
    `UPDATE partner_agenda SET
       title = ?, meeting_date = ?, meeting_time = ?,
       invited_json = ?, attended_json = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(
      title,
      meetingDate,
      meetingTime,
      JSON.stringify(invited),
      JSON.stringify(attended),
      now,
      agenda.id,
    )
    .run();

  return json({ ok: true, ...(await buildPayload(env, user)) });
}

export async function upsertAgendaItem(
  env: Env,
  request: Request,
  user: DbUser,
): Promise<Response> {
  await ensureAgendaTables(env);
  const agenda = await getOrNullAgenda(env);
  if (!agenda || agenda.active !== 1) {
    return error("Create the agenda from Schedule & Plan first.", 400);
  }

  let body: { id?: string; body?: string; sourceKind?: string; sourceId?: string };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const text = String(body.body || "").trim();
  if (!text) return error("Agenda item text is required.");
  if (text.length > 2000) return error("Agenda item is too long (max 2000 characters).");

  const now = nowIso();
  const id = String(body.id || "").trim();
  const sourceKindRaw = String(body.sourceKind || "user").toLowerCase();
  const sourceKind =
    sourceKindRaw === "task" || sourceKindRaw === "test" ? sourceKindRaw : "user";
  const sourceId = sourceKind === "user" ? "" : String(body.sourceId || "").trim();

  if (id) {
    const existing = await env.DB.prepare(
      `SELECT * FROM partner_agenda_items WHERE id = ? AND agenda_id = ?`,
    )
      .bind(id, agenda.id)
      .first<ItemRow>();
    if (!existing) return error("Agenda item not found.", 404);
    if (existing.author_user_id !== user.id) {
      return error("You can only edit your own agenda items.", 403);
    }
    await env.DB.prepare(
      `UPDATE partner_agenda_items SET body = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(text, now, id)
      .run();
  } else {
    if (sourceKind !== "user" && sourceId) {
      const dup = await env.DB.prepare(
        `SELECT id FROM partner_agenda_items
         WHERE agenda_id = ? AND source_kind = ? AND source_id = ? LIMIT 1`,
      )
        .bind(agenda.id, sourceKind, sourceId)
        .first<{ id: string }>();
      if (dup) {
        return json({ ok: true, ...(await buildPayload(env, user)) });
      }
    }
    const newItemId = newId("ai");
    await env.DB.prepare(
      `INSERT INTO partner_agenda_items
        (id, agenda_id, body, author_user_id, author_name, created_at, updated_at, source_kind, source_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        newItemId,
        agenda.id,
        text,
        user.id,
        displayName(user),
        now,
        now,
        sourceKind,
        sourceId,
      )
      .run();
  }

  await env.DB.prepare(`UPDATE partner_agenda SET updated_at = ? WHERE id = ?`)
    .bind(now, agenda.id)
    .run();

  return json({ ok: true, ...(await buildPayload(env, user)) });
}

/** Add selected Task List / Testing Portal rows onto the agenda. */
export async function linkAgendaItems(
  env: Env,
  request: Request,
  user: DbUser,
): Promise<Response> {
  await ensureAgendaTables(env);
  const agenda = await getOrNullAgenda(env);
  if (!agenda || agenda.active !== 1) {
    return error("Create the agenda from Schedule & Plan first.", 400);
  }

  let body: {
    items?: Array<{ sourceKind?: string; sourceId?: string; body?: string }>;
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const incoming = Array.isArray(body.items) ? body.items : [];
  if (incoming.length === 0) return error("Select at least one task or test.");
  if (incoming.length > 50) return error("Add at most 50 items at a time.");

  const now = nowIso();
  const name = displayName(user);
  let added = 0;

  for (const raw of incoming) {
    const sourceKindRaw = String(raw.sourceKind || "").toLowerCase();
    if (sourceKindRaw !== "task" && sourceKindRaw !== "test") continue;
    const sourceId = String(raw.sourceId || "").trim();
    const text = String(raw.body || "").trim();
    if (!sourceId || !text) continue;
    if (text.length > 2000) continue;

    const dup = await env.DB.prepare(
      `SELECT id FROM partner_agenda_items
       WHERE agenda_id = ? AND source_kind = ? AND source_id = ? LIMIT 1`,
    )
      .bind(agenda.id, sourceKindRaw, sourceId)
      .first<{ id: string }>();
    if (dup) continue;

    await env.DB.prepare(
      `INSERT INTO partner_agenda_items
        (id, agenda_id, body, author_user_id, author_name, created_at, updated_at, source_kind, source_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(newId("ai"), agenda.id, text, user.id, name, now, now, sourceKindRaw, sourceId)
      .run();
    added += 1;
  }

  await env.DB.prepare(`UPDATE partner_agenda SET updated_at = ? WHERE id = ?`)
    .bind(now, agenda.id)
    .run();

  return json({ ok: true, added, ...(await buildPayload(env, user)) });
}

export async function deleteAgendaItem(
  env: Env,
  user: DbUser,
  itemId: string,
): Promise<Response> {
  await ensureAgendaTables(env);
  const id = String(itemId || "").trim();
  if (!id) return error("Missing agenda item id.");
  if (id.startsWith("task:")) {
    return error("Task List agenda items are managed on the Task List.", 400);
  }

  const existing = await env.DB.prepare(`SELECT * FROM partner_agenda_items WHERE id = ?`)
    .bind(id)
    .first<ItemRow>();
  if (!existing) return error("Agenda item not found.", 404);
  if (existing.author_user_id !== user.id) {
    return error("You can only delete your own agenda items.", 403);
  }

  await env.DB.prepare(`DELETE FROM partner_agenda_items WHERE id = ?`).bind(id).run();
  await env.DB.prepare(`UPDATE partner_agenda SET updated_at = ? WHERE id = ?`)
    .bind(nowIso(), existing.agenda_id)
    .run();

  return json({ ok: true, ...(await buildPayload(env, user)) });
}

export async function saveAgendaTimePicks(
  env: Env,
  request: Request,
  user: DbUser,
): Promise<Response> {
  await ensureAgendaTables(env);
  const agenda = await getOrNullAgenda(env);
  if (!agenda || agenda.active !== 1) {
    return error("Create the agenda from Schedule & Plan first.", 400);
  }

  let body: { startsAt?: string[]; durationMinutes?: number };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const raw = Array.isArray(body.startsAt) ? body.startsAt : [];
  const starts = [
    ...new Set(
      raw
        .map((s) => String(s || "").trim())
        .filter(Boolean)
        .map((s) => {
          const d = new Date(s);
          return Number.isNaN(d.getTime()) ? "" : d.toISOString();
        })
        .filter(Boolean),
    ),
  ].sort();

  if (starts.length < MIN_TIME_PICKS || starts.length > MAX_TIME_PICKS) {
    return error(`Pick between ${MIN_TIME_PICKS} and ${MAX_TIME_PICKS} meeting times.`, 400);
  }

  const duration = Math.max(
    MIN_DURATION_MINUTES,
    Number(body.durationMinutes) || MIN_DURATION_MINUTES,
  );
  const now = nowIso();
  const name = displayName(user);

  await env.DB.prepare(
    `DELETE FROM partner_agenda_time_picks WHERE agenda_id = ? AND user_id = ?`,
  )
    .bind(agenda.id, user.id)
    .run();

  for (const startsAt of starts) {
    await env.DB.prepare(
      `INSERT INTO partner_agenda_time_picks
        (id, agenda_id, user_id, user_name, starts_at, duration_minutes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(newId("ap"), agenda.id, user.id, name, startsAt, duration, now, now)
      .run();
  }

  await env.DB.prepare(`UPDATE partner_agenda SET updated_at = ? WHERE id = ?`)
    .bind(now, agenda.id)
    .run();

  return json({ ok: true, ...(await buildPayload(env, user)) });
}

export async function sendAgendaInviteEmail(
  env: Env,
  user: DbUser,
): Promise<Response> {
  await ensureAgendaTables(env);
  if (!emailConfigured(env)) {
    return error("Email is not configured (RESEND_API_KEY).", 503);
  }

  const agenda = await getOrNullAgenda(env);
  if (!agenda || agenda.active !== 1) {
    return error("Create the agenda from Schedule & Plan first.", 400);
  }

  const agendaUrl = `${SITE_URL.replace(/\/$/, "")}/admin?tab=agenda`;
  const recipients = PARTNER_ADMINS.filter((p) => {
    const email = p.email.toLowerCase();
    return email.includes("tina") || email.includes("lyriq") || email.includes("leegaulden");
  });

  if (recipients.length === 0) {
    return error("Tina and Lyriq partner emails were not found.", 500);
  }

  const fromName = displayName(user);
  const results: Array<{ email: string; ok: boolean; error?: string }> = [];

  for (const partner of recipients) {
    const htmlBody = `
      <p>Hi ${escapeHtml(partner.name.split(" ")[0] || partner.name)},</p>
      <p><strong>${escapeHtml(fromName)}</strong> set up our shared online partner agenda.</p>
      <p>Please open the Agenda, add any items you want on the meeting, and pick
      <strong>${MIN_TIME_PICKS}–${MAX_TIME_PICKS}</strong> meeting times that work for you
      (each meeting block is at least <strong>${MIN_DURATION_MINUTES} minutes</strong>).</p>
    `;
    const branded = wrapBrandedEmail({
      preheader: "Pick 3–5 meeting times and add your agenda items",
      eyebrow: "Partner sync",
      headline: "Partner Agenda is ready",
      subhead: "Add items and choose meeting times that work for you.",
      bodyHtml: htmlBody,
      ctaLabel: "Open Partner Agenda",
      ctaUrl: agendaUrl,
    });

    try {
      await sendResendEmail(env, {
        to: partner.email,
        subject: `${SITE_NAME}: Partner Agenda — pick meeting times`,
        html: branded.html,
        text: branded.text,
        templateSlug: "partner_agenda_invite",
        userId: user.id,
        meta: { agendaId: agenda.id, toPartner: partner.email },
      });
      results.push({ email: partner.email, ok: true });
    } catch (e) {
      const msg =
        e instanceof EmailSendError
          ? e.message
          : e instanceof Error
            ? e.message
            : String(e);
      results.push({ email: partner.email, ok: false, error: msg });
    }
  }

  const allOk = results.every((r) => r.ok);
  if (allOk) {
    await env.DB.prepare(
      `UPDATE partner_agenda SET invite_sent_at = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(nowIso(), nowIso(), agenda.id)
      .run();
  }

  return json({
    ok: allOk,
    results,
    agendaUrl,
    ...(await buildPayload(env, user)),
  });
}
