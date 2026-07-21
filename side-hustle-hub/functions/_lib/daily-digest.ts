/**
 * Daily Admin/QA digest emails (America/Chicago calendar day).
 * Cron target: 12:01 America/Chicago — see docs/EMAIL.md.
 */
import { error, json, type DbUser, type Env } from "./auth";
import { EmailSendError, emailConfigured, sendResendEmail } from "./email";
import { escapeHtml, SITE_NAME, SITE_URL, wrapBrandedEmail } from "./email-brand";
import { PARTNER_ADMINS } from "./partners";
import { parseRoles } from "./roles";
import { BACKLOG_SPRINT, currentSprintIndex, getSprintWindow, sprintLabel } from "./sprints";

/** Product timezone for digest scheduling + date keys. */
export const DIGEST_TIMEZONE = "America/Chicago";
export const DIGEST_TEMPLATE_SLUG = "daily_admin_digest";
export const EVELYN_EMAIL = "evelyn3@cox.net";

export type PartnerName = "Tina" | "Evelyn" | "Lyriq";

type DigestItem = {
  id: string;
  title: string;
  kind: "task" | "test";
  sprint: number;
  status: string;
  dueDate: string;
  updatedAt: string;
};

type DigestPayload = {
  partner: PartnerName;
  name: string;
  email: string;
  chicagoDate: string;
  currentSprint: number;
  bySprint: Array<{
    sprint: number;
    label: string;
    rangeLabel: string;
    outstanding: DigestItem[];
    recentlyUpdated: DigestItem[];
  }>;
  newlyAssigned: DigestItem[];
  reassignedAway: Array<DigestItem & { toAssignee: string }>;
};

function chicagoParts(ref: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dateKey: string;
} {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: DIGEST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(ref).filter((p) => p.type !== "literal").map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  return {
    year,
    month,
    day,
    hour,
    minute,
    dateKey: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}

/** True when local Chicago time is in the 12:01 send window (12:00–12:14). */
export function isDigestSendWindow(ref: Date = new Date()): boolean {
  const { hour, minute } = chicagoParts(ref);
  return hour === 12 && minute < 15;
}

export function chicagoDateKey(ref: Date = new Date()): string {
  return chicagoParts(ref).dateKey;
}

function partnerFromUser(user: { email?: string; name?: string }): PartnerName | null {
  const email = String(user.email || "").toLowerCase();
  if (email.includes("tina")) return "Tina";
  if (email.includes("evelyn") || email.includes("evvelyn")) return "Evelyn";
  if (email.includes("lyriq") || email.includes("leegaulden")) return "Lyriq";
  const name = String(user.name || "").toLowerCase();
  if (name.includes("tina")) return "Tina";
  if (name.includes("evelyn")) return "Evelyn";
  if (name.includes("lyriq")) return "Lyriq";
  return null;
}

function taskMatchesPartner(assignedTo: string, me: PartnerName): boolean {
  if (assignedTo === me) return true;
  if (me === "Lyriq") return false;
  return assignedTo === "Both";
}

function testMatchesPartner(assignee: string, me: PartnerName): boolean {
  const id = me.toLowerCase();
  return String(assignee || "").toLowerCase() === id;
}

function isTaskOutstanding(status: string): boolean {
  return status !== "done";
}

function isTestOutstanding(status: string): boolean {
  return status === "not_run" || status === "in_progress" || status === "fixed_retest";
}

function parseMmddyyToTime(mmddyy: string): number | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(String(mmddyy || "").trim());
  if (!m) return null;
  let year = Number(m[3]);
  if (year < 100) year += 2000;
  const d = new Date(year, Number(m[1]) - 1, Number(m[2]));
  if (Number.isNaN(d.getTime())) return null;
  return d.getTime();
}

function recentCutoffIso(hours = 48): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function newAssignCutoffMs(hours = 48): number {
  return Date.now() - hours * 60 * 60 * 1000;
}

async function ensureDigestTables(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS digest_sends (
      id TEXT PRIMARY KEY,
      chicago_date TEXT NOT NULL,
      to_email TEXT NOT NULL,
      user_id TEXT,
      status TEXT NOT NULL,
      provider_id TEXT,
      created_at TEXT NOT NULL,
      UNIQUE (chicago_date, to_email)
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS assignment_events (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      from_assignee TEXT NOT NULL DEFAULT '',
      to_assignee TEXT NOT NULL DEFAULT '',
      changed_by TEXT NOT NULL DEFAULT '',
      changed_at TEXT NOT NULL
    )`,
  ).run();
}

export async function listDigestRecipients(env: Env): Promise<
  Array<{ id: string; name: string; email: string; partner: PartnerName }>
> {
  const { results } = await env.DB.prepare(
    `SELECT id, name, email, role, roles, status FROM users WHERE status = 'active'`,
  ).all<{
    id: string;
    name: string;
    email: string;
    role: string;
    roles: string | null;
    status: string;
  }>();

  const out: Array<{ id: string; name: string; email: string; partner: PartnerName }> = [];
  const seen = new Set<string>();

  for (const row of results ?? []) {
    const roles = parseRoles(row.role, row.roles);
    if (!roles.includes("admin") && !roles.includes("qa")) continue;
    const partner = partnerFromUser(row);
    if (!partner) continue;
    const email = row.email.toLowerCase();
    if (seen.has(email)) continue;
    seen.add(email);
    out.push({ id: row.id, name: row.name, email, partner });
  }

  // Ensure partner admins are always included even if D1 row is briefly missing.
  for (const p of PARTNER_ADMINS) {
    const email = p.email.toLowerCase();
    if (seen.has(email)) continue;
    const partner = partnerFromUser(p);
    if (!partner) continue;
    seen.add(email);
    out.push({ id: p.id, name: p.name, email, partner });
  }

  return out.sort((a, b) => a.name.localeCompare(b.name));
}

async function loadDigestPayload(
  env: Env,
  recipient: { id: string; name: string; email: string; partner: PartnerName },
  ref: Date = new Date(),
): Promise<DigestPayload> {
  const me = recipient.partner;
  const chicagoDate = chicagoDateKey(ref);
  const currentSprint = currentSprintIndex(ref);
  const recentIso = recentCutoffIso(48);
  const newCutoff = newAssignCutoffMs(48);

  const tasks = await env.DB.prepare(
    `SELECT id, description, status, assigned_to, date_assigned, due_date, sprint, updated_at
     FROM tasks ORDER BY sprint ASC, id ASC`,
  ).all<{
    id: string;
    description: string;
    status: string;
    assigned_to: string;
    date_assigned: string;
    due_date: string;
    sprint: number;
    updated_at: string;
  }>();

  const tests = await env.DB.prepare(
    `SELECT case_id, status, assignee, sprint, due_date, date_assigned, updated_at
     FROM test_case_status`,
  ).all<{
    case_id: string;
    status: string;
    assignee: string | null;
    sprint: number | null;
    due_date: string | null;
    date_assigned: string | null;
    updated_at: string;
  }>();

  let titleMap = new Map<string, string>();
  try {
    const genTitles = await env.DB.prepare(
      `SELECT id, title FROM generated_test_cases`,
    ).all<{ id: string; title: string }>();
    titleMap = new Map((genTitles.results ?? []).map((r) => [r.id, r.title]));
  } catch {
    titleMap = new Map();
  }

  const items: DigestItem[] = [];

  for (const t of tasks.results ?? []) {
    if (!taskMatchesPartner(t.assigned_to, me)) continue;
    if (Number(t.sprint) === BACKLOG_SPRINT) continue;
    items.push({
      id: t.id,
      title: t.description,
      kind: "task",
      sprint: Number(t.sprint ?? 0) || 0,
      status: t.status,
      dueDate: t.due_date || "",
      updatedAt: t.updated_at || "",
    });
  }

  for (const t of tests.results ?? []) {
    const assignee = String(t.assignee || "").trim();
    if (!testMatchesPartner(assignee, me)) continue;
    const sprint = t.sprint == null ? 0 : Number(t.sprint);
    if (sprint === BACKLOG_SPRINT) continue;
    items.push({
      id: t.case_id,
      title: titleMap.get(t.case_id) || t.case_id,
      kind: "test",
      sprint: Number.isFinite(sprint) ? sprint : 0,
      status: t.status,
      dueDate: t.due_date || "",
      updatedAt: t.updated_at || "",
    });
  }

  const sprintSet = new Set<number>();
  for (const it of items) sprintSet.add(it.sprint);
  sprintSet.add(currentSprint);
  const sprintIndexes = [...sprintSet].filter((n) => n >= 0).sort((a, b) => a - b);

  const bySprint = sprintIndexes.map((sprint) => {
    const sw = getSprintWindow(sprint);
    const inSprint = items.filter((i) => i.sprint === sprint);
    const outstanding = inSprint.filter((i) =>
      i.kind === "task" ? isTaskOutstanding(i.status) : isTestOutstanding(i.status),
    );
    const recentlyUpdated = inSprint.filter(
      (i) => i.updatedAt && i.updatedAt >= recentIso,
    );
    return {
      sprint,
      label: sprintLabel(sprint),
      rangeLabel: sw.rangeLabel,
      outstanding,
      recentlyUpdated,
    };
  });

  const newlyAssigned: DigestItem[] = [];
  for (const t of tasks.results ?? []) {
    if (!taskMatchesPartner(t.assigned_to, me)) continue;
    const assignedMs = parseMmddyyToTime(t.date_assigned);
    const updatedRecent = t.updated_at && t.updated_at >= recentIso;
    if ((assignedMs != null && assignedMs >= newCutoff) || updatedRecent) {
      // Prefer true new assigns (date_assigned recent); include recent updates tagged as new only if date matches.
      if (assignedMs != null && assignedMs >= newCutoff) {
        newlyAssigned.push({
          id: t.id,
          title: t.description,
          kind: "task",
          sprint: Number(t.sprint ?? 0) || 0,
          status: t.status,
          dueDate: t.due_date || "",
          updatedAt: t.updated_at || "",
        });
      }
    }
  }
  for (const t of tests.results ?? []) {
    const assignee = String(t.assignee || "").trim();
    if (!testMatchesPartner(assignee, me)) continue;
    const assignedMs = parseMmddyyToTime(String(t.date_assigned || ""));
    if (assignedMs != null && assignedMs >= newCutoff) {
      newlyAssigned.push({
        id: t.case_id,
        title: titleMap.get(t.case_id) || t.case_id,
        kind: "test",
        sprint: Number(t.sprint ?? 0) || 0,
        status: t.status,
        dueDate: t.due_date || "",
        updatedAt: t.updated_at || "",
      });
    }
  }

  // Reassigned away — assignment_events + test history approx
  const reassignedAway: Array<DigestItem & { toAssignee: string }> = [];
  const events = await env.DB.prepare(
    `SELECT entity_type, entity_id, from_assignee, to_assignee, changed_at
     FROM assignment_events
     WHERE changed_at >= ?
     ORDER BY changed_at DESC
     LIMIT 200`,
  )
    .bind(recentIso)
    .all<{
      entity_type: string;
      entity_id: string;
      from_assignee: string;
      to_assignee: string;
      changed_at: string;
    }>();

  const meId = me.toLowerCase();
  for (const ev of events.results ?? []) {
    const from = String(ev.from_assignee || "").trim();
    const to = String(ev.to_assignee || "").trim();
    const fromMatch =
      from === me ||
      from.toLowerCase() === meId ||
      (me !== "Lyriq" && from === "Both" && to !== "Both" && to !== me);
    const stillMine =
      to === me || to.toLowerCase() === meId || (me !== "Lyriq" && to === "Both");
    if (!fromMatch || stillMine) continue;

    const kind = ev.entity_type === "test" ? "test" : "task";
    let title = ev.entity_id;
    let sprint = 0;
    let status = "";
    let dueDate = "";
    if (kind === "task") {
      const row = (tasks.results ?? []).find((t) => t.id === ev.entity_id);
      if (row) {
        title = row.description;
        sprint = Number(row.sprint ?? 0) || 0;
        status = row.status;
        dueDate = row.due_date || "";
      }
    } else {
      title = titleMap.get(ev.entity_id) || ev.entity_id;
      const row = (tests.results ?? []).find((t) => t.case_id === ev.entity_id);
      if (row) {
        sprint = Number(row.sprint ?? 0) || 0;
        status = row.status;
        dueDate = row.due_date || "";
      }
    }
    reassignedAway.push({
      id: ev.entity_id,
      title,
      kind,
      sprint,
      status,
      dueDate,
      updatedAt: ev.changed_at,
      toAssignee: to || "someone else",
    });
  }

  // Fallback: test_case_status_history assignee flips
  try {
    const hist = await env.DB.prepare(
      `SELECT case_id, assignee, changed_at FROM test_case_status_history
       WHERE changed_at >= ? ORDER BY changed_at DESC LIMIT 300`,
    )
      .bind(recentIso)
      .all<{ case_id: string; assignee: string; changed_at: string }>();

    const byCase = new Map<string, Array<{ assignee: string; changed_at: string }>>();
    for (const h of hist.results ?? []) {
      const list = byCase.get(h.case_id) ?? [];
      list.push({ assignee: h.assignee || "", changed_at: h.changed_at });
      byCase.set(h.case_id, list);
    }
    for (const [caseId, list] of byCase) {
      if (list.length < 2) continue;
      // history is DESC — newest first
      const newest = list[0]!;
      const olderMine = list.find(
        (x) => x.assignee.toLowerCase() === meId || x.assignee === me,
      );
      if (!olderMine) continue;
      if (newest.assignee.toLowerCase() === meId || newest.assignee === me) continue;
      if (reassignedAway.some((r) => r.id === caseId && r.kind === "test")) continue;
      const row = (tests.results ?? []).find((t) => t.case_id === caseId);
      reassignedAway.push({
        id: caseId,
        title: titleMap.get(caseId) || caseId,
        kind: "test",
        sprint: Number(row?.sprint ?? 0) || 0,
        status: row?.status || "",
        dueDate: row?.due_date || "",
        updatedAt: newest.changed_at,
        toAssignee: newest.assignee || "someone else",
      });
    }
  } catch {
    /* history table may be missing on older DBs */
  }

  return {
    partner: me,
    name: recipient.name,
    email: recipient.email,
    chicagoDate,
    currentSprint,
    bySprint,
    newlyAssigned,
    reassignedAway,
  };
}

function formatStatusLabel(status: string): string {
  return String(status || "")
    .replace(/_/g, " ")
    .trim();
}

function typeLabel(kind: "task" | "test"): string {
  return kind === "task" ? "Task" : "Test";
}

type DigestTableRow = {
  sprint: number;
  kind: "task" | "test";
  id: string;
  title: string;
  status: string;
  dueDate: string;
  notes: string;
};

/** Email-safe HTML table with column headings for digest item summaries. */
function digestItemsTableHtml(
  items: Array<DigestItem | (DigestItem & { toAssignee?: string })>,
  notes: string | ((item: DigestItem & { toAssignee?: string }) => string),
  empty: string,
): string {
  if (!items.length) {
    return `<p style="margin:0 0 12px;color:#8a7a68;">${escapeHtml(empty)}</p>`;
  }

  const rows: DigestTableRow[] = items.slice(0, 40).map((i) => ({
    sprint: i.sprint,
    kind: i.kind,
    id: i.id,
    title: i.title,
    status: i.status,
    dueDate: i.dueDate,
    notes: typeof notes === "function" ? notes(i) : notes,
  }));

  const th =
    "padding:8px 10px;text-align:left;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#9B2F28;background:#fff8e8;border-bottom:2px solid #e2d5bc;";
  const td =
    "padding:8px 10px;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.4;color:#3a342e;border-bottom:1px solid #e2d5bc;vertical-align:top;";
  const tdMuted = `${td}color:#8a7a68;`;

  const body = rows
    .map(
      (r, idx) => `<tr style="background:${idx % 2 === 0 ? "#fffdf8" : "#f7f0df"};">
        <td style="${tdMuted}">${escapeHtml(sprintLabel(r.sprint))}</td>
        <td style="${td}">${escapeHtml(typeLabel(r.kind))}</td>
        <td style="${td}"><strong style="color:#2d2a26;">${escapeHtml(r.id)}</strong></td>
        <td style="${td}">${escapeHtml(r.title)}</td>
        <td style="${tdMuted}">${escapeHtml(formatStatusLabel(r.status) || "—")}</td>
        <td style="${tdMuted}">${escapeHtml(r.dueDate || "—")}</td>
        <td style="${td}"><strong style="color:#9B2F28;">${escapeHtml(r.notes)}</strong></td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;width:100%;border-collapse:collapse;border:1px solid #e2d5bc;border-radius:10px;overflow:hidden;">
    <thead>
      <tr>
        <th style="${th}">Sprint</th>
        <th style="${th}">Type</th>
        <th style="${th}">ID</th>
        <th style="${th}">Title / Description</th>
        <th style="${th}">Status</th>
        <th style="${th}">Due</th>
        <th style="${th}">Notes</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`;
}

export function buildDigestEmail(payload: DigestPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const first = payload.name.split(/\s+/)[0] || payload.partner;
  const outstandingTotal = payload.bySprint.reduce((n, s) => n + s.outstanding.length, 0);
  const updatedTotal = payload.bySprint.reduce((n, s) => n + s.recentlyUpdated.length, 0);

  const sprintBlocks = payload.bySprint
    .map((s) => {
      if (!s.outstanding.length && !s.recentlyUpdated.length) return "";
      return `<div style="margin:0 0 18px;padding:14px 16px;border-radius:12px;background:#f7f0df;border:1px solid #e2d5bc;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#9B2F28;">
          ${escapeHtml(s.label)} · ${escapeHtml(s.rangeLabel)}
        </p>
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#2d2a26;">Outstanding</p>
        ${digestItemsTableHtml(s.outstanding, "Outstanding", "Nothing outstanding — nice.")}
        <p style="margin:10px 0 6px;font-size:13px;font-weight:700;color:#2d2a26;">Updated recently (48h)</p>
        ${digestItemsTableHtml(s.recentlyUpdated, "Updated", "No recent updates in this sprint.")}
      </div>`;
    })
    .filter(Boolean)
    .join("");

  const newBlock = `<p style="margin:16px 0 6px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#9B2F28;">New for you</p>
    ${digestItemsTableHtml(payload.newlyAssigned, "New", "No brand-new assignments in the last 48 hours.")}`;

  const awayBlock = `<p style="margin:16px 0 6px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#947d64;">Reassigned away</p>
    ${digestItemsTableHtml(
      payload.reassignedAway,
      (i) => `Reassigned away → ${i.toAssignee || "someone else"}`,
      "Nothing moved off your plate recently.",
    )}`;

  const bodyHtml = `
    <p style="margin:0 0 12px;">Here's your personal GYSH rundown for <strong>${escapeHtml(payload.chicagoDate)}</strong>
    (${escapeHtml(DIGEST_TIMEZONE)}). Current sprint: <strong>${escapeHtml(sprintLabel(payload.currentSprint))}</strong>.</p>
    <p style="margin:0 0 16px;padding:12px 14px;border-radius:12px;background:#fff8e8;border:1px solid #e2d5bc;">
      <strong>${outstandingTotal}</strong> outstanding · <strong>${updatedTotal}</strong> updated recently ·
      <strong>${payload.newlyAssigned.length}</strong> new · <strong>${payload.reassignedAway.length}</strong> reassigned away
    </p>
    ${sprintBlocks || `<p style="margin:0 0 12px;color:#8a7a68;">No sprint items on your board right now — enjoy the calm.</p>`}
    ${newBlock}
    ${awayBlock}
  `;

  const branded = wrapBrandedEmail({
    preheader: `${first}: ${outstandingTotal} outstanding · ${payload.newlyAssigned.length} new assignments`,
    eyebrow: "Daily digest · Admin & QA",
    headline: `${first}, your Side Hustle board called.`,
    subhead: "A warm, honest snapshot of your tasks and tests — by sprint.",
    bodyHtml,
    ctaLabel: "Open Admin · Schedule & Plan",
    ctaUrl: `${SITE_URL}/?next=admin&tab=schedule`,
    footerNote: `Sent at ~12:01 ${DIGEST_TIMEZONE}. You're getting this because you have Admin or QA access.`,
  });

  return {
    subject: `${SITE_NAME} — daily digest for ${first} (${payload.chicagoDate})`,
    html: branded.html,
    text: branded.text,
  };
}

/** Sample digest for Email Templates preview. */
export function buildSampleDigestPreview(): { subject: string; html: string; text: string } {
  const sample: DigestPayload = {
    partner: "Evelyn",
    name: "Evelyn Irving",
    email: EVELYN_EMAIL,
    chicagoDate: chicagoDateKey(),
    currentSprint: currentSprintIndex(),
    bySprint: [
      {
        sprint: currentSprintIndex(),
        label: sprintLabel(currentSprintIndex()),
        rangeLabel: getSprintWindow(currentSprintIndex()).rangeLabel,
        outstanding: [
          {
            id: "T-101",
            title: "Polish Contact page CTA copy",
            kind: "task",
            sprint: currentSprintIndex(),
            status: "in_progress",
            dueDate: "07/21/26",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "AUTH-003",
            title: "Password reset delivers Resend email",
            kind: "test",
            sprint: currentSprintIndex(),
            status: "not_run",
            dueDate: "07/21/26",
            updatedAt: new Date().toISOString(),
          },
        ],
        recentlyUpdated: [
          {
            id: "T-088",
            title: "Wire email templates admin preview",
            kind: "task",
            sprint: currentSprintIndex(),
            status: "done",
            dueDate: "07/20/26",
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    ],
    newlyAssigned: [
      {
        id: "EMAIL-010",
        title: "Daily digest preview on Email Templates page",
        kind: "test",
        sprint: currentSprintIndex(),
        status: "not_run",
        dueDate: "07/22/26",
        updatedAt: new Date().toISOString(),
      },
    ],
    reassignedAway: [
      {
        id: "T-055",
        title: "Kids Corner storyboard pass",
        kind: "task",
        sprint: currentSprintIndex(),
        status: "in_progress",
        dueDate: "07/23/26",
        updatedAt: new Date().toISOString(),
        toAssignee: "Tina",
      },
    ],
  };
  return buildDigestEmail(sample);
}

export async function buildLiveDigestForEmail(
  env: Env,
  email: string,
): Promise<{ subject: string; html: string; text: string; payload: DigestPayload } | null> {
  const recipients = await listDigestRecipients(env);
  const recipient = recipients.find((r) => r.email.toLowerCase() === email.toLowerCase());
  if (!recipient) return null;
  const payload = await loadDigestPayload(env, recipient);
  const built = buildDigestEmail(payload);
  return { ...built, payload };
}

async function recordDigestSend(
  env: Env,
  chicagoDate: string,
  toEmail: string,
  userId: string | null,
  status: string,
  providerId: string | null,
): Promise<boolean> {
  await ensureDigestTables(env);
  try {
    await env.DB.prepare(
      `INSERT INTO digest_sends (id, chicago_date, to_email, user_id, status, provider_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        chicagoDate,
        toEmail.toLowerCase(),
        userId,
        status,
        providerId,
        new Date().toISOString(),
      )
      .run();
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes("unique")) return false;
    throw e;
  }
}

export type SendDigestOptions = {
  /** Limit to one email (e.g. Evelyn test). */
  onlyEmail?: string;
  /** Skip Chicago 12:01 window check. */
  force?: boolean;
  /** Allow re-send same Chicago day (admin manual). */
  allowResend?: boolean;
};

export async function sendDailyDigests(
  env: Env,
  opts: SendDigestOptions = {},
): Promise<{
  ok: boolean;
  chicagoDate: string;
  timezone: string;
  sent: Array<{ email: string; id?: string; skipped?: string }>;
  errors: Array<{ email: string; error: string }>;
}> {
  if (!emailConfigured(env)) {
    return {
      ok: false,
      chicagoDate: chicagoDateKey(),
      timezone: DIGEST_TIMEZONE,
      sent: [],
      errors: [{ email: "*", error: "RESEND_API_KEY is not configured." }],
    };
  }

  if (!opts.force && !isDigestSendWindow()) {
    return {
      ok: true,
      chicagoDate: chicagoDateKey(),
      timezone: DIGEST_TIMEZONE,
      sent: [{ email: "*", skipped: "Outside 12:01 America/Chicago send window." }],
      errors: [],
    };
  }

  await ensureDigestTables(env);
  const chicagoDate = chicagoDateKey();
  let recipients = await listDigestRecipients(env);
  if (opts.onlyEmail) {
    recipients = recipients.filter(
      (r) => r.email.toLowerCase() === opts.onlyEmail!.toLowerCase(),
    );
  }

  const sent: Array<{ email: string; id?: string; skipped?: string }> = [];
  const errors: Array<{ email: string; error: string }> = [];

  for (const recipient of recipients) {
    if (!opts.allowResend) {
      const existing = await env.DB.prepare(
        `SELECT id FROM digest_sends WHERE chicago_date = ? AND to_email = ?`,
      )
        .bind(chicagoDate, recipient.email.toLowerCase())
        .first<{ id: string }>();
      if (existing) {
        sent.push({ email: recipient.email, skipped: "Already sent today (Chicago date)." });
        continue;
      }
    }

    try {
      const payload = await loadDigestPayload(env, recipient);
      const built = buildDigestEmail(payload);
      const result = await sendResendEmail(env, {
        to: recipient.email,
        subject: built.subject,
        html: built.html,
        text: built.text,
        templateSlug: DIGEST_TEMPLATE_SLUG,
        userId: recipient.id,
        meta: {
          chicagoDate,
          partner: recipient.partner,
          timezone: DIGEST_TIMEZONE,
        },
      });
      if (!opts.allowResend) {
        await recordDigestSend(
          env,
          chicagoDate,
          recipient.email,
          recipient.id,
          "sent",
          result.id ?? null,
        );
      }
      sent.push({ email: recipient.email, id: result.id });
    } catch (e) {
      const message =
        e instanceof EmailSendError
          ? e.message
          : e instanceof Error
            ? e.message
            : String(e);
      errors.push({ email: recipient.email, error: message });
      try {
        await recordDigestSend(env, chicagoDate, recipient.email, recipient.id, "failed", null);
      } catch {
        /* ignore */
      }
    }
  }

  return {
    ok: errors.length === 0,
    chicagoDate,
    timezone: DIGEST_TIMEZONE,
    sent,
    errors,
  };
}

export async function handleCronDailyDigest(env: Env, request: Request): Promise<Response> {
  const secret = env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization") || "";
  const headerSecret = request.headers.get("x-cron-secret") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const provided = headerSecret || bearer;
  if (!secret || provided !== secret) {
    return error("Unauthorized cron request.", 401);
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";
  const only = (url.searchParams.get("only") || "").trim().toLowerCase();
  const allowResend =
    url.searchParams.get("resend") === "1" || url.searchParams.get("allowResend") === "1";
  const result = await sendDailyDigests(env, {
    force,
    onlyEmail: only || undefined,
    allowResend,
  });
  return json(result);
}

export async function handleAdminSendDigests(
  env: Env,
  request: Request,
  _actor: DbUser,
): Promise<Response> {
  let body: { onlyEmail?: string; force?: boolean; allowResend?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }
  const result = await sendDailyDigests(env, {
    onlyEmail: body.onlyEmail?.trim() || undefined,
    force: body.force !== false,
    allowResend: body.allowResend === true,
  });
  return json(result);
}

export async function handleAdminPreviewDigest(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  const url = new URL(request.url);
  const email = (url.searchParams.get("email") || actor.email || "").trim().toLowerCase();
  const live = await buildLiveDigestForEmail(env, email);
  if (!live) {
    const sample = buildSampleDigestPreview();
    return json({ ...sample, sample: true, email, timezone: DIGEST_TIMEZONE });
  }
  return json({
    subject: live.subject,
    html: live.html,
    text: live.text,
    sample: false,
    email,
    timezone: DIGEST_TIMEZONE,
    chicagoDate: live.payload.chicagoDate,
  });
}

export async function handleSendEvelynTestDigest(env: Env): Promise<Response> {
  const result = await sendDailyDigests(env, {
    onlyEmail: EVELYN_EMAIL,
    force: true,
    allowResend: true,
  });
  return json({
    ...result,
    note: `Test digest targeted at ${EVELYN_EMAIL} only.`,
  });
}

/** Log task assignee changes for digest "reassigned away". */
export async function logTaskAssignmentChange(
  env: Env,
  opts: {
    taskId: string;
    fromAssignee: string;
    toAssignee: string;
    changedBy: string;
  },
): Promise<void> {
  if (opts.fromAssignee === opts.toAssignee) return;
  if (!opts.fromAssignee && !opts.toAssignee) return;
  try {
    await ensureDigestTables(env);
    await env.DB.prepare(
      `INSERT INTO assignment_events (id, entity_type, entity_id, from_assignee, to_assignee, changed_by, changed_at)
       VALUES (?, 'task', ?, ?, ?, ?, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        opts.taskId,
        opts.fromAssignee,
        opts.toAssignee,
        opts.changedBy,
        new Date().toISOString(),
      )
      .run();
  } catch {
    /* never block saves */
  }
}

export async function logTestAssignmentChange(
  env: Env,
  opts: {
    caseId: string;
    fromAssignee: string;
    toAssignee: string;
    changedBy: string;
  },
): Promise<void> {
  if (opts.fromAssignee === opts.toAssignee) return;
  try {
    await ensureDigestTables(env);
    await env.DB.prepare(
      `INSERT INTO assignment_events (id, entity_type, entity_id, from_assignee, to_assignee, changed_by, changed_at)
       VALUES (?, 'test', ?, ?, ?, ?, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        opts.caseId,
        opts.fromAssignee,
        opts.toAssignee,
        opts.changedBy,
        new Date().toISOString(),
      )
      .run();
  } catch {
    /* never block saves */
  }
}
