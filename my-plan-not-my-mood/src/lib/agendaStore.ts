import type { AgendaAttendee, AgendaStage, AgendaStateMap } from './sprintAgenda';
import { loadAgendaState, parseAgendaStage } from './sprintAgenda';

export const AGENDA_API_PATH = '/api/agenda';
export const AGENDA_STORE_ID = 'v1';
export const AGENDA_META_STORAGE_KEY = 'myplan_agenda_meta_v1';

export interface AgendaStoreMeta {
  title: string;
  topic: string;
  attendees: AgendaAttendee[];
  stage?: AgendaStage;
}

export interface AgendaStorePayload {
  meetings: AgendaStateMap;
  meta: AgendaStoreMeta | null;
  updatedAt: string;
  updatedBy: string | null;
}

export interface AgendaStoreResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function parseAttendee(value: unknown): AgendaAttendee | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === 'string' ? value.id.trim() : '';
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const email = typeof value.email === 'string' ? value.email.trim() : '';
  const role = typeof value.role === 'string' ? value.role.trim() : '';
  if (!id || !name) return null;
  return { id, name, email, role };
}

export function parseAgendaStoreMeta(value: unknown): AgendaStoreMeta | null {
  if (!isRecord(value)) return null;
  const title = typeof value.title === 'string' ? value.title : '';
  const topic = typeof value.topic === 'string' ? value.topic : '';
  const attendees = Array.isArray(value.attendees)
    ? value.attendees.map(parseAttendee).filter((item): item is AgendaAttendee => Boolean(item))
    : [];
  return { title, topic, attendees, stage: parseAgendaStage(value.stage) };
}

export function loadAgendaStoreMetaFromStorage(): AgendaStoreMeta | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseAgendaStoreMeta(JSON.parse(localStorage.getItem(AGENDA_META_STORAGE_KEY) || 'null'));
  } catch {
    return null;
  }
}

export function parseAgendaStorePayload(value: unknown): AgendaStorePayload | null {
  if (!isRecord(value)) return null;
  const meetings = isRecord(value.meetings)
    ? loadAgendaState(JSON.stringify(value.meetings))
    : null;
  if (!meetings) return null;
  return {
    meetings,
    meta: parseAgendaStoreMeta(value.meta),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
    updatedBy: typeof value.updatedBy === 'string' && value.updatedBy.trim() ? value.updatedBy.trim() : null,
  };
}

export function buildAgendaStorePayload(
  meetings: AgendaStateMap,
  meta: AgendaStoreMeta | null,
  updatedBy: string | null,
  now = new Date(),
): AgendaStorePayload {
  return {
    meetings,
    meta,
    updatedAt: now.toISOString(),
    updatedBy: updatedBy?.trim() || null,
  };
}

export async function fetchAgendaStore(): Promise<AgendaStorePayload | null> {
  try {
    const response = await fetch(AGENDA_API_PATH, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { empty?: boolean } & Record<string, unknown>;
    if (data.empty) return null;
    return parseAgendaStorePayload(data);
  } catch {
    return null;
  }
}

export async function saveAgendaStore(payload: AgendaStorePayload): Promise<AgendaStoreResult> {
  try {
    const response = await fetch(AGENDA_API_PATH, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.status === 503) {
      return { ok: true, skipped: true, error: 'Agenda database is not configured' };
    }
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error || `Agenda API failed (${response.status})` };
    }
    return { ok: true };
  } catch {
    return { ok: true, skipped: true };
  }
}
