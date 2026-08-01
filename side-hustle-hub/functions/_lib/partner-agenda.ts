/**
 * Partner meeting agenda — shared interactive items + preferred meeting times.
 * Users may edit/delete only their own items (including linked task/test picks).
 * Tasks/tests whose text contains "Agenda" also appear as read-only suggestions.
 */
import { error, json, type DbUser, type Env } from "./auth";
import { EmailSendError, emailConfigured, sendResendEmail } from "./email";
import { escapeHtml, SITE_NAME, SITE_URL, wrapBrandedEmail } from "./email-brand";
import { noteEntriesPlainText } from "./note-entries";
import { PARTNER_ADMINS } from "./partners";

export const DEFAULT_AGENDA_ID = "partner-agenda-main";
export const MIN_TIME_PICKS = 3;
export const MAX_TIME_PICKS = 5;
export const MIN_DURATION_MINUTES = 60;
/** Default / clamp bounds for partner meeting length (timed agenda). */
export const DEFAULT_MEETING_MINUTES = 90;
export const MIN_MEETING_MINUTES = 20;
export const MAX_MEETING_MINUTES = 180;

function clampMeetingMinutes(value: unknown): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_MEETING_MINUTES;
  return Math.min(MAX_MEETING_MINUTES, Math.max(MIN_MEETING_MINUTES, n));
}

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
  meeting_timezone?: string | null;
  meeting_minutes?: number | null;
  invited_json?: string | null;
  attended_json?: string | null;
  meeting_notes?: string | null;
  /** External URL to formal meeting minutes (Google Doc, Notion, etc.). */
  meeting_minutes_url?: string | null;
  meeting_action_items_json?: string | null;
  finalized_at?: string | null;
  updated_by_name?: string | null;
  invite_subject?: string | null;
  invite_body?: string | null;
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
  sort_order?: number | null;
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
  backlogTaskId?: string;
}> {
  try {
    const parsed = JSON.parse(String(raw || "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((a) => {
        const backlogTaskId = String(
          (a as { backlogTaskId?: string; backlog_task_id?: string }).backlogTaskId ||
            (a as { backlog_task_id?: string }).backlog_task_id ||
            "",
        ).trim();
        return {
          id: String((a as { id?: string }).id || newId("act")),
          text: String((a as { text?: string }).text || "").trim(),
          owner: String((a as { owner?: string }).owner || "").trim(),
          done: Boolean((a as { done?: boolean }).done),
          ...(backlogTaskId ? { backlogTaskId } : {}),
        };
      })
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
    `ALTER TABLE partner_agenda ADD COLUMN meeting_timezone TEXT NOT NULL DEFAULT 'America/Chicago'`,
    `ALTER TABLE partner_agenda ADD COLUMN invited_json TEXT NOT NULL DEFAULT '[]'`,
    `ALTER TABLE partner_agenda ADD COLUMN attended_json TEXT NOT NULL DEFAULT '[]'`,
    `ALTER TABLE partner_agenda_items ADD COLUMN category TEXT NOT NULL DEFAULT 'other'`,
    `ALTER TABLE partner_agenda_items ADD COLUMN importance INTEGER NOT NULL DEFAULT 3`,
    `ALTER TABLE partner_agenda_items ADD COLUMN discussion_notes TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda_items ADD COLUMN action_items_json TEXT NOT NULL DEFAULT '[]'`,
    `ALTER TABLE partner_agenda_items ADD COLUMN questions_json TEXT NOT NULL DEFAULT '[]'`,
    `ALTER TABLE partner_agenda_items ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE partner_agenda ADD COLUMN meeting_notes TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda ADD COLUMN meeting_minutes_url TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda ADD COLUMN meeting_action_items_json TEXT NOT NULL DEFAULT '[]'`,
    `ALTER TABLE partner_agenda ADD COLUMN finalized_at TEXT`,
    `ALTER TABLE partner_agenda ADD COLUMN updated_by_name TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda ADD COLUMN invite_subject TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda ADD COLUMN invite_body TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE partner_agenda ADD COLUMN meeting_minutes INTEGER NOT NULL DEFAULT 60`,
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
         source_kind, source_id, category, importance, discussion_notes, action_items_json, questions_json, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'user', ?, ?, ?, '', '[]', '[]', ?)`,
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
        seed.importance,
      )
      .run();
  }
}

function displayName(user: DbUser): string {
  return String(user.name || user.email || "Partner").trim() || "Partner";
}

/** Bump agenda updated_at + who changed it (PDF footer). */
async function touchAgenda(env: Env, agendaId: string, user: DbUser, at?: string): Promise<void> {
  const now = at || nowIso();
  await env.DB.prepare(
    `UPDATE partner_agenda SET updated_at = ?, updated_by_name = ? WHERE id = ?`,
  )
    .bind(now, displayName(user), agendaId)
    .run();
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
      const desc = String(t.description || "").trim();
      // Task notes may be JSON note threads — show plain text only in the Agenda UI.
      const notes = noteEntriesPlainText(t.notes || "").trim();
      if (!AGENDA_WORD_RE.test(desc) && !AGENDA_WORD_RE.test(notes)) continue;
      const id = String(t.id || "").trim();
      if (!id) continue;
      let body = desc;
      if (notes && notes !== desc) {
        if (notes.includes(desc) && desc.length >= 12) body = notes;
        else if (desc.includes(notes) && notes.length >= 12) body = desc;
        else if (AGENDA_WORD_RE.test(notes)) body = desc ? `${desc}\n${notes}` : notes;
        else body = `${desc}\n${notes}`;
      } else if (!desc) {
        body = notes;
      }
      out.push({
        id: `suggest-task:${id}`,
        body: body || desc || notes || id,
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
    sortOrder: Number.isFinite(Number(it.sort_order)) ? Number(it.sort_order) : 0,
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

/** Ensure the shared agenda row exists (auto-create for forced time-pick flow). */
async function ensureActiveAgenda(env: Env, user: DbUser): Promise<AgendaRow> {
  const existing = await getOrNullAgenda(env);
  const now = nowIso();
  const invitedJson = JSON.stringify(
    PARTNER_ADMINS.map((p) => p.name.split(" ")[0] || p.name),
  );
  if (existing) {
    if (existing.active !== 1) {
      const by = displayName(user);
      await env.DB.prepare(
        `UPDATE partner_agenda SET active = 1, updated_at = ?, updated_by_name = ? WHERE id = ?`,
      )
        .bind(now, by, existing.id)
        .run();
      existing.active = 1;
      existing.updated_at = now;
      existing.updated_by_name = by;
    }
    // Backfill default 1:30 PM Central (11:30 AM Vegas) when meeting time was never set.
    if (!String(existing.meeting_time || "").trim()) {
      await env.DB.prepare(
        `UPDATE partner_agenda SET
           meeting_time = '13:30',
           meeting_timezone = CASE
             WHEN meeting_timezone IS NULL OR TRIM(meeting_timezone) = '' THEN 'America/Chicago'
             ELSE meeting_timezone
           END,
           updated_at = ?
         WHERE id = ?`,
      )
        .bind(now, existing.id)
        .run();
      existing.meeting_time = "13:30";
      if (!String(existing.meeting_timezone || "").trim()) {
        existing.meeting_timezone = "America/Chicago";
      }
    }
    await ensureSeedDiscussionItems(env, existing.id, user);
    return existing;
  }
  const by = displayName(user);
  await env.DB.prepare(
    `INSERT INTO partner_agenda
      (id, title, active, created_by_user_id, created_by_name, invite_sent_at,
       meeting_date, meeting_time, meeting_timezone, invited_json, attended_json, created_at, updated_at, updated_by_name)
     VALUES (?, ?, 1, ?, ?, NULL, '', '13:30', 'America/Chicago', ?, '[]', ?, ?, ?)`,
  )
    .bind(
      DEFAULT_AGENDA_ID,
      "Partner Meeting Agenda",
      user.id,
      by,
      invitedJson,
      now,
      now,
      by,
    )
    .run();
  await ensureSeedDiscussionItems(env, DEFAULT_AGENDA_ID, user);
  const created = await getOrNullAgenda(env);
  if (!created) throw new Error("Failed to create partner agenda");
  return created;
}

async function buildPayload(env: Env, user: DbUser) {
  let agenda = await getOrNullAgenda(env);
  // Tina / Lyriq must always be able to submit times — create agenda if missing.
  if ((!agenda || agenda.active !== 1) && isTinaOrLyriq(user)) {
    agenda = await ensureActiveAgenda(env, user);
  }
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
      needsTimePicks: isTinaOrLyriq(user),
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
       ORDER BY sort_order ASC, importance ASC, created_at ASC`,
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
      updatedByName:
        String(agenda.updated_by_name || "").trim() || agenda.created_by_name || "",
      meetingDate: String(agenda.meeting_date || ""),
      meetingTime: String(agenda.meeting_time || "").trim() || "13:30",
      meetingTimezone: String(agenda.meeting_timezone || "America/Chicago") || "America/Chicago",
      meetingMinutes: clampMeetingMinutes(agenda.meeting_minutes ?? DEFAULT_MEETING_MINUTES),
      invited: invited.length ? invited : defaultInvited,
      attended,
      meetingNotes: String(agenda.meeting_notes || ""),
      meetingMinutesUrl: String(agenda.meeting_minutes_url || ""),
      meetingActionItems: parseActionItems(agenda.meeting_action_items_json),
      finalizedAt: agenda.finalized_at ? String(agenda.finalized_at) : null,
      finalized: Boolean(agenda.finalized_at),
      inviteSubject: String(agenda.invite_subject || ""),
      inviteBody: String(agenda.invite_body || ""),
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
    await ensureActiveAgenda(env, user);
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
    meetingTimezone?: string;
    meetingMinutes?: number;
    invited?: string[];
    attended?: string[];
    finalized?: boolean;
    inviteSubject?: string;
    inviteBody?: string;
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const title = String(body.title ?? agenda.title).trim() || agenda.title;
  const meetingDate = String(body.meetingDate ?? agenda.meeting_date ?? "").trim();
  const meetingTime = String(body.meetingTime ?? agenda.meeting_time ?? "").trim();
  const meetingTimezone =
    String(body.meetingTimezone ?? agenda.meeting_timezone ?? "America/Chicago").trim() ||
    "America/Chicago";
  const meetingMinutes = clampMeetingMinutes(
    body.meetingMinutes !== undefined
      ? body.meetingMinutes
      : agenda.meeting_minutes ?? DEFAULT_MEETING_MINUTES,
  );
  const invited = Array.isArray(body.invited)
    ? body.invited.map((n) => String(n || "").trim()).filter(Boolean)
    : parseNameList(agenda.invited_json);
  const attended = Array.isArray(body.attended)
    ? body.attended.map((n) => String(n || "").trim()).filter(Boolean)
    : parseNameList(agenda.attended_json);
  const inviteSubject =
    body.inviteSubject !== undefined
      ? String(body.inviteSubject || "").trim()
      : String(agenda.invite_subject || "");
  const inviteBody =
    body.inviteBody !== undefined
      ? String(body.inviteBody || "")
      : String(agenda.invite_body || "");
  if (body.inviteSubject !== undefined && !inviteSubject) {
    return error("Email subject is required.");
  }
  if (body.inviteBody !== undefined) {
    const plain = inviteBody
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim();
    if (!plain) return error("Email message is required.");
  }
  if (inviteSubject.length > 300) return error("Email subject is too long (max 300 characters).");
  if (inviteBody.length > 50000) return error("Email message is too long (max 50000 characters).");
  const now = nowIso();
  let finalizedAt = agenda.finalized_at ? String(agenda.finalized_at) : null;
  if (body.finalized === true) finalizedAt = now;
  if (body.finalized === false) finalizedAt = null;

  await env.DB.prepare(
    `UPDATE partner_agenda SET
       title = ?, meeting_date = ?, meeting_time = ?, meeting_timezone = ?,
       meeting_minutes = ?,
       invited_json = ?, attended_json = ?, finalized_at = ?,
       invite_subject = ?, invite_body = ?,
       updated_at = ?, updated_by_name = ?
     WHERE id = ?`,
  )
    .bind(
      title,
      meetingDate,
      meetingTime,
      meetingTimezone,
      meetingMinutes,
      JSON.stringify(invited),
      JSON.stringify(attended),
      finalizedAt,
      inviteSubject,
      inviteBody,
      now,
      displayName(user),
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

  let body: {
    id?: string;
    body?: string;
    sourceKind?: string;
    sourceId?: string;
    category?: string;
    importance?: number;
    discussionNotes?: string;
    actionItems?: Array<{ id?: string; text?: string; owner?: string; done?: boolean }>;
    questions?: Array<{ id?: string; text?: string }>;
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const now = nowIso();
  const id = String(body.id || "").trim();
  const sourceKindRaw = String(body.sourceKind || "user").toLowerCase();
  const sourceKind =
    sourceKindRaw === "task" || sourceKindRaw === "test" ? sourceKindRaw : "user";
  const sourceId = sourceKind === "user" ? "" : String(body.sourceId || "").trim();
  const hasMeetingFields =
    body.category !== undefined ||
    body.importance !== undefined ||
    body.discussionNotes !== undefined ||
    body.actionItems !== undefined ||
    body.questions !== undefined;

  if (id) {
    const existing = await env.DB.prepare(
      `SELECT * FROM partner_agenda_items WHERE id = ? AND agenda_id = ?`,
    )
      .bind(id, agenda.id)
      .first<ItemRow>();
    if (!existing) return error("Agenda item not found.", 404);

    const isAuthor = existing.author_user_id === user.id;
    const textProvided = body.body !== undefined;
    const text = textProvided ? String(body.body || "").trim() : String(existing.body || "").trim();
    if (textProvided) {
      if (!isAuthor) return error("You can only edit your own agenda items.", 403);
      if (!text) return error("Agenda item text is required.");
      if (text.length > 2000) return error("Agenda item is too long (max 2000 characters).");
    }
    if (!isAuthor && !hasMeetingFields) {
      return error("You can only edit your own agenda items.", 403);
    }

    const category = normalizeCategory(
      body.category !== undefined ? body.category : existing.category,
    );
    const importance = normalizeImportance(
      body.importance !== undefined ? body.importance : existing.importance,
    );
    const discussionNotes =
      body.discussionNotes !== undefined
        ? String(body.discussionNotes || "")
        : String(existing.discussion_notes || "");
    const actionItemsJson =
      body.actionItems !== undefined
        ? JSON.stringify(parseActionItems(JSON.stringify(body.actionItems)))
        : String(existing.action_items_json || "[]");
    const questionsJson =
      body.questions !== undefined
        ? JSON.stringify(parseQuestions(JSON.stringify(body.questions)))
        : String(existing.questions_json || "[]");

    await env.DB.prepare(
      `UPDATE partner_agenda_items SET
         body = ?, category = ?, importance = ?, discussion_notes = ?,
         action_items_json = ?, questions_json = ?, updated_at = ?
       WHERE id = ?`,
    )
      .bind(
        text,
        category,
        importance,
        discussionNotes,
        actionItemsJson,
        questionsJson,
        now,
        id,
      )
      .run();
  } else {
    const text = String(body.body || "").trim();
    if (!text) return error("Agenda item text is required.");
    if (text.length > 2000) return error("Agenda item is too long (max 2000 characters).");
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
    const category = normalizeCategory(body.category);
    const importance = normalizeImportance(body.importance);
    await env.DB.prepare(
      `INSERT INTO partner_agenda_items
        (id, agenda_id, body, author_user_id, author_name, created_at, updated_at,
         source_kind, source_id, category, importance, discussion_notes, action_items_json, questions_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', '[]')`,
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
        category,
        importance,
        String(body.discussionNotes || ""),
      )
      .run();
  }

  await touchAgenda(env, agenda.id, user, now);

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

  await touchAgenda(env, agenda.id, user, now);

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
  await touchAgenda(env, existing.agenda_id, user);

  return json({ ok: true, ...(await buildPayload(env, user)) });
}

export async function saveAgendaTimePicks(
  env: Env,
  request: Request,
  user: DbUser,
): Promise<Response> {
  await ensureAgendaTables(env);
  const agenda = await ensureActiveAgenda(env, user);

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

  await touchAgenda(env, agenda.id, user, now);

  return json({ ok: true, ...(await buildPayload(env, user)) });
}

/** Save meeting header + all preview item fields / order in one request. */
export async function saveAgendaPreview(
  env: Env,
  request: Request,
  user: DbUser,
): Promise<Response> {
  await ensureAgendaTables(env);
  const agenda = await ensureActiveAgenda(env, user);

  let body: {
    meetingDate?: string;
    meetingTime?: string;
    meetingTimezone?: string;
    meetingMinutes?: number;
    invited?: string[];
    attended?: string[];
    meetingNotes?: string;
    meetingMinutesUrl?: string;
    meetingActionItems?: Array<{
      id?: string;
      text?: string;
      owner?: string;
      done?: boolean;
      backlogTaskId?: string;
    }>;
    items?: Array<{
      id?: string;
      category?: string;
      importance?: number;
      discussionNotes?: string;
      actionItems?: Array<{
        id?: string;
        text?: string;
        owner?: string;
        done?: boolean;
        backlogTaskId?: string;
      }>;
      questions?: Array<{ id?: string; text?: string }>;
      sortOrder?: number;
    }>;
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const now = nowIso();
  const meetingDate = String(body.meetingDate ?? agenda.meeting_date ?? "").trim();
  const meetingTime = String(body.meetingTime ?? agenda.meeting_time ?? "").trim();
  const meetingTimezone =
    String(body.meetingTimezone ?? agenda.meeting_timezone ?? "America/Chicago").trim() ||
    "America/Chicago";
  const meetingMinutes = clampMeetingMinutes(
    body.meetingMinutes !== undefined
      ? body.meetingMinutes
      : agenda.meeting_minutes ?? DEFAULT_MEETING_MINUTES,
  );
  const invited = Array.isArray(body.invited)
    ? body.invited.map((n) => String(n || "").trim()).filter(Boolean)
    : parseNameList(agenda.invited_json);
  const attended = Array.isArray(body.attended)
    ? body.attended.map((n) => String(n || "").trim()).filter(Boolean)
    : parseNameList(agenda.attended_json);
  const meetingNotes =
    body.meetingNotes !== undefined
      ? String(body.meetingNotes || "")
      : String(agenda.meeting_notes || "");
  const meetingMinutesUrl =
    body.meetingMinutesUrl !== undefined
      ? String(body.meetingMinutesUrl || "").trim()
      : String(agenda.meeting_minutes_url || "").trim();
  if (meetingMinutesUrl && !/^https?:\/\//i.test(meetingMinutesUrl)) {
    return error("Meeting minutes link must start with http:// or https://");
  }
  if (meetingMinutesUrl.length > 2000) {
    return error("Meeting minutes link is too long (max 2000 characters).");
  }
  const meetingActionItemsJson =
    body.meetingActionItems !== undefined
      ? JSON.stringify(parseActionItems(JSON.stringify(body.meetingActionItems)))
      : String(agenda.meeting_action_items_json || "[]");

  await env.DB.prepare(
    `UPDATE partner_agenda SET
       meeting_date = ?, meeting_time = ?, meeting_timezone = ?,
       meeting_minutes = ?,
       invited_json = ?, attended_json = ?,
       meeting_notes = ?, meeting_minutes_url = ?, meeting_action_items_json = ?,
       updated_at = ?, updated_by_name = ?
     WHERE id = ?`,
  )
    .bind(
      meetingDate,
      meetingTime,
      meetingTimezone,
      meetingMinutes,
      JSON.stringify(invited),
      JSON.stringify(attended),
      meetingNotes,
      meetingMinutesUrl,
      meetingActionItemsJson,
      now,
      displayName(user),
      agenda.id,
    )
    .run();

  for (const raw of body.items || []) {
    const id = String(raw.id || "").trim();
    if (!id) continue;
    const existing = await env.DB.prepare(
      `SELECT * FROM partner_agenda_items WHERE id = ? AND agenda_id = ?`,
    )
      .bind(id, agenda.id)
      .first<ItemRow>();
    if (!existing) continue;

    const category = normalizeCategory(raw.category ?? existing.category);
    const importance = normalizeImportance(raw.importance ?? existing.importance);
    const discussionNotes =
      raw.discussionNotes !== undefined
        ? String(raw.discussionNotes || "")
        : String(existing.discussion_notes || "");
    const actionItemsJson =
      raw.actionItems !== undefined
        ? JSON.stringify(parseActionItems(JSON.stringify(raw.actionItems)))
        : String(existing.action_items_json || "[]");
    const questionsJson =
      raw.questions !== undefined
        ? JSON.stringify(parseQuestions(JSON.stringify(raw.questions)))
        : String(existing.questions_json || "[]");
    const sortOrder = Number.isFinite(Number(raw.sortOrder))
      ? Math.max(0, Math.round(Number(raw.sortOrder)))
      : Number(existing.sort_order || 0);

    await env.DB.prepare(
      `UPDATE partner_agenda_items SET
         category = ?, importance = ?, discussion_notes = ?,
         action_items_json = ?, questions_json = ?, sort_order = ?, updated_at = ?
       WHERE id = ?`,
    )
      .bind(
        category,
        importance,
        discussionNotes,
        actionItemsJson,
        questionsJson,
        sortOrder,
        now,
        id,
      )
      .run();
  }

  return json({ ok: true, ...(await buildPayload(env, user)) });
}

function unescapeBasicHtmlEntities(s: string): string {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

/** Turn bare http(s) URLs into clickable anchors (text may already be HTML-escaped). */
function linkifyBareUrls(text: string): string {
  return String(text || "").replace(/(https?:\/\/[^\s<]+)/gi, (raw) => {
    let url = raw;
    let trailing = "";
    // Peel common trailing punctuation that is not part of the URL.
    while (url.length > 0) {
      const last = url.slice(-1);
      if (/[.,;:!?]$/.test(last)) {
        trailing = last + trailing;
        url = url.slice(0, -1);
        continue;
      }
      if (last === ")") {
        const opens = (url.match(/\(/g) || []).length;
        const closes = (url.match(/\)/g) || []).length;
        if (closes > opens) {
          trailing = ")" + trailing;
          url = url.slice(0, -1);
          continue;
        }
      }
      break;
    }
    if (!/^https?:\/\//i.test(url)) return raw;
    const href = escapeHtml(unescapeBasicHtmlEntities(url));
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#9B2F28;font-weight:700;text-decoration:underline;word-break:break-all;">${url}</a>${trailing}`;
  });
}

/** Linkify URLs in HTML without touching existing <a>…</a> blocks. */
function linkifyBareUrlsInHtml(html: string): string {
  const parts = String(html || "").split(/(<a\b[^>]*>[\s\S]*?<\/a>)/gi);
  return parts
    .map((part) => (/^<a\b/i.test(part) ? part : linkifyBareUrls(part)))
    .join("");
}

function plainTextToHtmlParagraphs(text: string): string {
  const blocks = String(text || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length === 0) return "<p></p>";
  return blocks
    .map((block) => {
      const withBreaks = linkifyBareUrls(escapeHtml(block).replace(/\n/g, "<br/>"));
      return `<p>${withBreaks}</p>`;
    })
    .join("\n");
}

function looksLikeHtml(raw: string): boolean {
  return /<\/?(?:p|div|br|b|strong|i|em|u|span|font|ul|ol|li|a|h[1-6])\b/i.test(String(raw || ""));
}

/** Allowlist-ish cleanup for admin-authored rich email HTML (no scripts / handlers). */
function sanitizeEmailHtml(html: string): string {
  let s = String(html || "");
  s = s.replace(/<\/?(script|style|iframe|object|embed|form|input|button|link|meta|svg|math|video|audio)[^>]*>/gi, "");
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  s = s.replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, ' $1="#"');
  s = s.replace(/\s(href|src)\s*=\s*javascript:[^\s>]*/gi, ' $1="#"');
  // Drop tags outside a safe allowlist (keep their text).
  s = s.replace(
    /<\/?(?!\/?(?:p|div|br|b|strong|i|em|u|span|font|ul|ol|li|a|h[1-6]|blockquote|hr)\b)[a-zA-Z][^>]*>/gi,
    "",
  );
  return s;
}

function customBodyToHtml(customBody: string): string {
  const raw = String(customBody || "").trim();
  if (!raw) return "";
  // Never escape existing markup — that turns real <a href> links into plain text in Resend.
  if (looksLikeHtml(raw) || /<a\b/i.test(raw)) {
    return linkifyBareUrlsInHtml(sanitizeEmailHtml(raw));
  }
  return plainTextToHtmlParagraphs(raw);
}

export async function sendAgendaInviteEmail(
  env: Env,
  request: Request,
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

  let body: {
    subject?: string;
    bodyText?: string;
    headline?: string;
    subhead?: string;
    pdfBase64?: string;
    pdfFilename?: string;
    testOnly?: boolean;
    testTo?: string;
  } = {};
  try {
    const raw = await request.text();
    if (raw.trim()) body = JSON.parse(raw);
  } catch {
    return error("Invalid JSON body.");
  }

  const agendaUrl = `${SITE_URL.replace(/\/$/, "")}/admin?tab=agenda`;
  const testOnly = Boolean(body.testOnly);
  // Test sends always go only to the signed-in admin — ignore client-supplied addresses.
  const testTo = String(user.email || "")
    .trim()
    .toLowerCase();
  const recipients = testOnly
    ? testTo
      ? [{ name: displayName(user), email: testTo }]
      : []
    : PARTNER_ADMINS.filter((p) => {
        const email = p.email.toLowerCase();
        return (
          email.includes("tina") ||
          email.includes("lyriq") ||
          email.includes("leegaulden") ||
          email.includes("evelyn")
        );
      });

  if (recipients.length === 0) {
    return error(
      testOnly
        ? "No test recipient email on your signed-in account."
        : "Admin partner emails were not found.",
      testOnly ? 400 : 500,
    );
  }

  const fromName = displayName(user);
  const baseSubject =
    String(body.subject || "").trim() ||
    `${SITE_NAME}: Partner Agenda — it's about time we meet`;
  const subject = testOnly
    ? baseSubject.startsWith("[TEST]")
      ? baseSubject
      : `[TEST] ${baseSubject}`
    : baseSubject;
  const customBody = String(body.bodyText || "").trim();
  const headline = String(body.headline || "").trim() || "It's about time we meet";
  const subhead =
    String(body.subhead || "").trim() ||
    "Tentative agenda attached — add your items before we sync.";

  const pdfRaw = String(body.pdfBase64 || "").replace(/^data:application\/pdf;base64,/i, "").trim();
  const pdfFilename =
    String(body.pdfFilename || "").trim() ||
    `tentative-agenda-${String(agenda.meeting_date || "draft").replace(/\W+/g, "-")}.pdf`;
  if (pdfRaw.length < 40) {
    return error("Tentative agenda PDF attachment is required.", 400);
  }
  const attachments = [
    {
      filename: pdfFilename.endsWith(".pdf") ? pdfFilename : `${pdfFilename}.pdf`,
      content: pdfRaw,
      contentType: "application/pdf",
    },
  ];

  const results: Array<{ email: string; ok: boolean; error?: string }> = [];

  for (const partner of recipients) {
    const first = partner.name.split(" ")[0] || partner.name;
    // Custom body already includes the team greeting — don't prepend "Hi First,".
    // Rich HTML from the editor is preserved; plain-text drafts still convert to paragraphs.
    const htmlBody = customBody
      ? customBodyToHtml(customBody)
      : `
      <p>Hi ${escapeHtml(first)},</p>
      <p><strong>${escapeHtml(fromName)}</strong> set up our shared online partner agenda.</p>
      <p>Please open the Agenda, add any items you want on the meeting, and pick
      <strong>${MIN_TIME_PICKS}–${MAX_TIME_PICKS}</strong> meeting times that work for you
      (each meeting block is at least <strong>${MIN_DURATION_MINUTES} minutes</strong>).</p>
    `;
    const branded = wrapBrandedEmail({
      preheader: subject.slice(0, 90),
      eyebrow: testOnly ? "Partner sync (test)" : "Partner sync",
      headline: testOnly ? `[TEST] ${headline}` : headline,
      subhead,
      bodyHtml: htmlBody,
      ctaLabel: "Open Partner Agenda",
      ctaUrl: agendaUrl,
    });

    try {
      await sendResendEmail(env, {
        to: partner.email,
        subject,
        html: branded.html,
        text: branded.text,
        templateSlug: "partner_agenda_invite",
        userId: user.id,
        meta: {
          agendaId: agenda.id,
          toPartner: partner.email,
          hasPdf: true,
          testOnly,
        },
        attachments,
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
  if (allOk && !testOnly) {
    const sentAt = nowIso();
    await env.DB.prepare(
      `UPDATE partner_agenda SET invite_sent_at = ?, updated_at = ?, updated_by_name = ? WHERE id = ?`,
    )
      .bind(sentAt, sentAt, displayName(user), agenda.id)
      .run();
  }

  if (!allOk) {
    const detail =
      results
        .filter((r) => !r.ok)
        .map((r) => `${r.email}: ${r.error || "failed"}`)
        .join(" · ") || "Email send failed.";
    return error(detail, 502);
  }

  return json({
    ok: true,
    testOnly,
    results,
    agendaUrl,
    ...(await buildPayload(env, user)),
  });
}
