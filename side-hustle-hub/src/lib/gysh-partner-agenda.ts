/** Client for interactive partner agenda + meeting time picks. */
import { api } from "./api";
import { canAccessAdminPortal, qaTesterIdForUser } from "./gysh-roles";

export const MIN_AGENDA_TIME_PICKS = 3;
export const MAX_AGENDA_TIME_PICKS = 5;
export const MIN_AGENDA_DURATION_MINUTES = 60;

export type AgendaCategory = "website" | "financial" | "process" | "other";

export const AGENDA_CATEGORY_ORDER: AgendaCategory[] = [
  "website",
  "financial",
  "process",
  "other",
];

export const AGENDA_CATEGORY_LABELS: Record<AgendaCategory, string> = {
  website: "Website Stuff",
  financial: "Financial Stuff",
  process: "Process / Ops",
  other: "Other",
};

export type AgendaMeta = {
  id: string;
  title: string;
  active: boolean;
  createdByUserId: string;
  createdByName: string;
  inviteSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Display name of last editor (PDF footer). */
  updatedByName?: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingTimezone?: string;
  /** Total meeting length in minutes (timed slots / PDF / live timer). */
  meetingMinutes?: number;
  invited?: string[];
  attended?: string[];
  /** Free-form notes taken during the meeting. */
  meetingNotes?: string;
  /** Link to formal meeting minutes (Google Doc, etc.). */
  meetingMinutesUrl?: string;
  /** Action items derived from meeting notes (assignable; can push to backlog). */
  meetingActionItems?: AgendaActionItem[];
  /** When set, PDF prints without DRAFT watermark. */
  finalizedAt?: string | null;
  finalized?: boolean;
  /** Saved Email Admins Agenda subject (editable draft). */
  inviteSubject?: string;
  /** Saved Email Admins Agenda message body (editable draft). */
  inviteBody?: string;
};

/** Common zones for partner meeting schedule (IANA ids). */
export const AGENDA_TIMEZONES: Array<{ id: string; label: string }> = [
  { id: "America/New_York", label: "Eastern (ET)" },
  { id: "America/Chicago", label: "Central (CT)" },
  { id: "America/Denver", label: "Mountain (MT)" },
  { id: "America/Phoenix", label: "Arizona (MST)" },
  { id: "America/Los_Angeles", label: "Pacific (PT)" },
  { id: "America/Anchorage", label: "Alaska (AKT)" },
  { id: "Pacific/Honolulu", label: "Hawaii (HT)" },
  { id: "UTC", label: "UTC" },
];

export const DEFAULT_AGENDA_TIMEZONE = "America/Chicago";
/** Default partner meeting start (1:30 PM Central / 11:30 AM Vegas–Pacific). */
export const DEFAULT_AGENDA_MEETING_TIME = "13:30";

export type AgendaItemSource = "user" | "task" | "test";

/** Task/test number for agenda display (e.g. T-024, VT-012). Null for freeform / seed items. */
export function agendaItemSourceRef(
  item: Pick<AgendaItem, "source" | "sourceId"> | { source?: string; sourceId?: string },
): string | null {
  const id = String(item.sourceId || "").trim();
  if (!id || /^seed:/i.test(id)) return null;
  if (item.source === "task") {
    const m = /^(T-)?(\d+)$/i.exec(id);
    if (m) return `T-${m[2]}`;
    if (/^T-/i.test(id)) return id.toUpperCase();
    return id;
  }
  if (item.source === "test") return id;
  return null;
}

export function agendaItemSourceLabel(
  item: Pick<AgendaItem, "source" | "sourceId"> | { source?: string; sourceId?: string },
): string | null {
  const ref = agendaItemSourceRef(item);
  if (!ref) return null;
  if (item.source === "task") return `Task ${ref}`;
  if (item.source === "test") return `Test ${ref}`;
  return ref;
}

export type AgendaActionItem = {
  id: string;
  text: string;
  owner: string;
  done: boolean;
  /** Set when this action was created as a backlog task. */
  backlogTaskId?: string;
};

export type AgendaQuestion = {
  id: string;
  text: string;
};

export type AgendaItem = {
  id: string;
  body: string;
  source: AgendaItemSource;
  sourceId?: string;
  authorUserId?: string;
  authorName: string;
  createdAt?: string;
  updatedAt?: string;
  category?: AgendaCategory;
  importance?: number;
  discussionNotes?: string;
  actionItems?: AgendaActionItem[];
  questions?: AgendaQuestion[];
  sortOrder?: number;
  canEdit: boolean;
  canEditMeetingFields?: boolean;
  suggested?: boolean;
};

/** @deprecated use AgendaItem */
export type AgendaUserItem = AgendaItem;
/** @deprecated use AgendaItem */
export type AgendaTaskItem = AgendaItem;

export type AgendaTimePick = {
  id: string;
  userId: string;
  userName: string;
  startsAt: string;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
  isMine: boolean;
};

export type PartnerAgendaPayload = {
  ok: boolean;
  agenda: AgendaMeta | null;
  categories?: Array<{ id: AgendaCategory; label: string }>;
  items: AgendaItem[];
  suggestedItems?: AgendaItem[];
  /** @deprecated use suggestedItems */
  taskItems?: AgendaItem[];
  timePicks: AgendaTimePick[];
  myPickCount: number;
  needsTimePicks: boolean;
  minPicks: number;
  maxPicks: number;
  minDurationMinutes: number;
  created?: boolean;
  added?: number;
  agendaUrl?: string;
  results?: Array<{ email: string; ok: boolean; error?: string }>;
};

/**
 * Tina / Lyriq must pick ≥3 agenda times before leaving Agenda.
 * Only real Admin Studio accounts — never parent/member logins whose name/email
 * merely contains "tina" (that used to force /admin ↔ /login and freeze the tab).
 */
export function mustPickAgendaTimes(
  user:
    | { name?: string; email?: string; role?: string; roles?: string[] }
    | null
    | undefined,
): boolean {
  if (!user) return false;
  if (!canAccessAdminPortal(user)) return false;
  const id = qaTesterIdForUser(user);
  return id === "tina" || id === "lyriq";
}

export async function fetchPartnerAgenda(): Promise<PartnerAgendaPayload> {
  return api<PartnerAgendaPayload>("partner-agenda");
}

export async function createPartnerAgenda(): Promise<PartnerAgendaPayload> {
  return api<PartnerAgendaPayload>("partner-agenda", { method: "POST" });
}

export async function saveAgendaMeta(input: {
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
}): Promise<PartnerAgendaPayload> {
  return api<PartnerAgendaPayload>("partner-agenda/meta", {
    method: "PUT",
    body: input,
  });
}

export async function saveAgendaPreview(input: {
  meetingDate?: string;
  meetingTime?: string;
  meetingTimezone?: string;
  meetingMinutes?: number;
  invited?: string[];
  attended?: string[];
  meetingNotes?: string;
  meetingMinutesUrl?: string;
  meetingActionItems?: AgendaActionItem[];
  items?: Array<{
    id: string;
    category?: AgendaCategory;
    importance?: number;
    discussionNotes?: string;
    actionItems?: AgendaActionItem[];
    questions?: AgendaQuestion[];
    sortOrder?: number;
  }>;
}): Promise<PartnerAgendaPayload> {
  return api<PartnerAgendaPayload>("partner-agenda/preview", {
    method: "PUT",
    body: input,
  });
}

export function newAgendaActionId(): string {
  return `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Turn free-form meeting notes into assignable action-item phrasing. */
export function notesToActionItems(
  notes: string,
  existing: AgendaActionItem[] = [],
): AgendaActionItem[] {
  const seen = new Set(existing.map((a) => a.text.trim().toLowerCase()).filter(Boolean));
  const out: AgendaActionItem[] = [...existing];

  const lines = String(notes || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    // Skip section headers / timestamps / very short scraps
    if (/^#{1,6}\s/.test(line)) continue;
    if (/^\d{1,2}:\d{2}\b/.test(line) && line.length < 12) continue;
    if (/^[A-Z][A-Za-z /&-]{2,40}:$/.test(line)) continue;
    if (line.length < 4) continue;

    let text = line
      .replace(/^[-*•▪◦]+\s+/, "")
      .replace(/^\d+[.)]\s+/, "")
      .replace(/^(action\s*item|todo|note|notes)\s*:\s*/i, "")
      .trim();

    text = text
      .replace(/^(we\s+)?(need to|should|will|gotta|have to|must|ought to)\s+/i, "")
      .replace(/^let'?s\s+/i, "")
      .replace(/^(please\s+)?(make sure to|be sure to)\s+/i, "")
      .trim();

    if (!text || text.length < 4) continue;
    text = text[0]!.toUpperCase() + text.slice(1);
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: newAgendaActionId(),
      text,
      owner: "",
      done: false,
    });
  }
  return out;
}

export async function saveAgendaItem(input: {
  id?: string;
  body: string;
  sourceKind?: AgendaItemSource;
  sourceId?: string;
  category?: AgendaCategory;
  importance?: number;
  discussionNotes?: string;
  actionItems?: AgendaActionItem[];
  questions?: AgendaQuestion[];
}): Promise<PartnerAgendaPayload> {
  return api<PartnerAgendaPayload>("partner-agenda/items", {
    method: "PUT",
    body: input,
  });
}

export async function linkAgendaItems(
  items: Array<{ sourceKind: "task" | "test"; sourceId: string; body: string }>,
): Promise<PartnerAgendaPayload> {
  return api<PartnerAgendaPayload>("partner-agenda/items/link", {
    method: "POST",
    body: { items },
  });
}

export async function deleteAgendaItem(id: string): Promise<PartnerAgendaPayload> {
  return api<PartnerAgendaPayload>(`partner-agenda/items/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function saveAgendaTimePicks(startsAt: string[]): Promise<PartnerAgendaPayload> {
  return api<PartnerAgendaPayload>("partner-agenda/time-picks", {
    method: "PUT",
    body: { startsAt, durationMinutes: MIN_AGENDA_DURATION_MINUTES },
  });
}

export async function sendPartnerAgendaInvite(input?: {
  subject?: string;
  bodyText?: string;
  headline?: string;
  subhead?: string;
  pdfBase64?: string;
  pdfFilename?: string;
  /** When true, send only to the signed-in admin (or testTo) — does not mark invite sent. */
  testOnly?: boolean;
  testTo?: string;
}): Promise<PartnerAgendaPayload> {
  return api<PartnerAgendaPayload>("partner-agenda/invite", {
    method: "POST",
    body: input || {},
    timeoutMs: 90_000,
  });
}

function formatClock12(totalMin: number): string {
  const normalized = ((totalMin % (24 * 60)) + 24 * 60) % (24 * 60);
  let h = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(minute).padStart(2, "0")}${ampm}`;
}

/** Fri, Jul 31, 1:30PM - 2:30PM CST/ 11:30AM - 12:30PM PST. (60m) */
export function formatAgendaMeetingWindow(opts: {
  meetingDate?: string;
  meetingTime?: string;
  durationMinutes?: number;
}): string {
  const duration = opts.durationMinutes ?? MIN_AGENDA_DURATION_MINUTES;
  const dateRaw = String(opts.meetingDate || "").trim();
  const timeRaw = String(opts.meetingTime || "").trim();
  const tm = /^(\d{1,2}):(\d{2})$/.exec(timeRaw);
  if (!dateRaw || !tm) {
    return `Date/time TBD (${duration}m)`;
  }
  const [y, mo, d] = dateRaw.split("-").map(Number);
  const weekday = new Date(y, (mo || 1) - 1, d || 1).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startMin = Number(tm[1]) * 60 + Number(tm[2]);
  const endMin = startMin + duration;
  // Meeting stored in Central; Pacific is -2 hours.
  const cst = `${formatClock12(startMin)} - ${formatClock12(endMin)} CST`;
  const pst = `${formatClock12(startMin - 120)} - ${formatClock12(endMin - 120)} PST`;
  return `${weekday}, ${cst}/ ${pst}. (${duration}m)`;
}

/** Partner Zoom meeting for agenda invites. */
export const PARTNER_AGENDA_ZOOM = {
  joinUrl:
    "https://us06web.zoom.us/j/89008763762?pwd=QaNHF6QEpAAbETJbbS8akjYKjqYyB7.1",
  meetingId: "890 0876 3762",
  passcode: "460977",
} as const;

export function buildPartnerAgendaEmailDraft(payload: PartnerAgendaPayload): {
  to: string[];
  subject: string;
  bodyText: string;
} {
  const to = [
    "tinamariebarham@gmail.com",
    "leegaulden1222@icloud.com",
    "evelyn3@cox.net",
  ];
  const windowLabel = formatAgendaMeetingWindow({
    meetingDate: payload.agenda?.meetingDate,
    meetingTime: payload.agenda?.meetingTime,
    durationMinutes: MIN_AGENDA_DURATION_MINUTES,
  });

  const bodyText = [
    "Hey there GYSH Team:",
    "",
    "It's about time we meet — thank you for helping lock this in.",
    "",
    `Tina, thank you for submitting your 3 meeting options.  As per our text, we have scheduled the meeting for ${windowLabel}.  The Zoom invite link is at the end of this email.`,
    "",
    "I have created an online interactive agenda that we can all add Agenda Items to.  I have already created the 1st draft and I have left two 2 minute placeholders for Tina to add items she may want to talk about, and a 4 minute Q & A placeholder at the end.",
    "",
    "A copy of the tentative Agenda is attached to this email.",
    "",
    "How to access the Partner Agenda and add items:",
    "1. Go to https://getyoursidehustle.com and sign in with your admin account.",
    "2. Open Admin → Agenda (or use this link: https://getyoursidehustle.com/admin?tab=agenda).",
    "3. Add your own agenda items in the agenda list (you can edit/delete only your own).",
    '4. Or use "Select tasks or tests" to pull items from the Task List / Testing Portal.',
    "",
    "Looking forward to syncing.",
    "",
    "Evelyn Irving",
    "GYSH Co-Founder",
    "AI Content & Marketing Director",
    "",
    "Zoom invite:",
    `Invite link: ${PARTNER_AGENDA_ZOOM.joinUrl}`,
    "",
    `Meeting ID: ${PARTNER_AGENDA_ZOOM.meetingId}`,
    "",
    `Passcode: ${PARTNER_AGENDA_ZOOM.passcode}`,
    "",
    PARTNER_AGENDA_ZOOM.joinUrl,
  ].join("\n");

  const savedSubject = String(payload.agenda?.inviteSubject || "").trim();
  const savedBody = String(payload.agenda?.inviteBody || "").trim();

  return {
    to,
    subject: savedSubject || "GYSH Partner Agenda — it's about time we meet",
    bodyText: savedBody || bodyText,
  };
}

/** Local datetime-local value → ISO for API. */
export function localInputToIso(local: string): string | null {
  const raw = String(local || "").trim();
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** ISO → value for datetime-local input. */
export function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatAgendaSlot(iso: string, durationMinutes = MIN_AGENDA_DURATION_MINUTES): string {
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return iso;
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  };
  return `${start.toLocaleString(undefined, opts)} → ${end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })} (${durationMinutes}m)`;
}
