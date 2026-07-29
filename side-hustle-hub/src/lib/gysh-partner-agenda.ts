/** Client for interactive partner agenda + meeting time picks. */
import { api } from "./api";
import { qaTesterIdForUser } from "./gysh-roles";

export const MIN_AGENDA_TIME_PICKS = 3;
export const MAX_AGENDA_TIME_PICKS = 5;
export const MIN_AGENDA_DURATION_MINUTES = 60;

export type AgendaMeta = {
  id: string;
  title: string;
  active: boolean;
  createdByUserId: string;
  createdByName: string;
  inviteSentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AgendaItemSource = "user" | "task" | "test";

export type AgendaItem = {
  id: string;
  body: string;
  source: AgendaItemSource;
  sourceId?: string;
  authorUserId?: string;
  authorName: string;
  createdAt?: string;
  updatedAt?: string;
  canEdit: boolean;
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

export function mustPickAgendaTimes(user: { name?: string; email?: string } | null | undefined): boolean {
  if (!user) return false;
  const id = qaTesterIdForUser(user);
  return id === "tina" || id === "lyriq";
}

export async function fetchPartnerAgenda(): Promise<PartnerAgendaPayload> {
  return api<PartnerAgendaPayload>("partner-agenda");
}

export async function createPartnerAgenda(): Promise<PartnerAgendaPayload> {
  return api<PartnerAgendaPayload>("partner-agenda", { method: "POST" });
}

export async function saveAgendaItem(input: {
  id?: string;
  body: string;
  sourceKind?: AgendaItemSource;
  sourceId?: string;
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

export async function sendPartnerAgendaInvite(): Promise<PartnerAgendaPayload> {
  return api<PartnerAgendaPayload>("partner-agenda/invite", { method: "POST" });
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
