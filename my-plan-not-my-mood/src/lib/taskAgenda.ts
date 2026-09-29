import {
  AGENDA_META_STORAGE_KEY,
  buildAgendaStorePayload,
  fetchAgendaStore,
  loadAgendaStoreMetaFromStorage,
  saveAgendaStore,
} from './agendaStore';
import {
  AGENDA_STORAGE_KEY,
  DEFAULT_TOPIC_MINUTES,
  itemsForMeeting,
  listAgendaMeetings,
  loadAgendaState,
  mergeAgendaStateMaps,
  normalizeAgendaItem,
  upcomingAgendaMeeting,
  WORKING_AGENDA_TITLE,
  writeMeetingItems,
  type AgendaActor,
  type AgendaStateMap,
} from './sprintAgenda';
import type { TaskItem } from './workBoard';

export const ADD_TO_AGENDA_LABEL = 'Add to Agenda';
export const ON_AGENDA_LABEL = 'On Agenda';
export const TASK_AGENDA_ITEM_PREFIX = 'task-agenda-';

export function agendaItemIdForTask(taskId: string): string {
  return `${TASK_AGENDA_ITEM_PREFIX}${String(taskId || '').trim()}`;
}

export function isTaskAgendaItemId(id: string): boolean {
  return String(id || '').startsWith(TASK_AGENDA_ITEM_PREFIX);
}

type AgendaTaskInput = Pick<TaskItem, 'id' | 'title'> & {
  description?: string;
  notes?: string;
};

function taskAgendaNotes(task: AgendaTaskInput): string {
  const description = String(task.description ?? '').trim();
  const notes = String(task.notes ?? '').trim();
  if (description && notes && description !== notes) return `${description}\n${notes}`;
  return description || notes || `From Task List`;
}

export function removeTaskFromAgendaState(state: AgendaStateMap, taskId: string): AgendaStateMap {
  const itemId = agendaItemIdForTask(taskId);
  let next = state;
  for (const [meetingId, items] of Object.entries(state)) {
    if (!Array.isArray(items) || !items.some((item) => item.id === itemId)) continue;
    next = writeMeetingItems(
      next,
      meetingId,
      items
        .filter((item) => item.id !== itemId)
        .map((item) => normalizeAgendaItem({ ...item, id: item.id, label: item.label || 'Untitled topic' })),
    );
  }
  return next;
}

export function addTaskToUpcomingAgenda(
  state: AgendaStateMap,
  task: AgendaTaskInput,
  actor?: AgendaActor | null,
  now = new Date(),
): AgendaStateMap {
  const meetings = listAgendaMeetings(undefined, now);
  const meeting = upcomingAgendaMeeting(meetings, now);
  const without = removeTaskFromAgendaState(state, task.id);
  const items = itemsForMeeting(without, meeting);
  const itemId = agendaItemIdForTask(task.id);
  const topic = normalizeAgendaItem({
    id: itemId,
    label: String(task.title ?? '').trim() || 'Untitled task',
    custom: true,
    minutes: DEFAULT_TOPIC_MINUTES,
    notes: taskAgendaNotes(task),
    createdBy: actor?.email?.trim() || undefined,
    createdByName: actor?.name?.trim() || undefined,
  });
  return writeMeetingItems(without, meeting.id, [topic, ...items.filter((item) => item.id !== itemId)]);
}

export function setTaskOnUpcomingAgenda(
  state: AgendaStateMap,
  task: AgendaTaskInput,
  onAgenda: boolean,
  actor?: AgendaActor | null,
  now = new Date(),
): AgendaStateMap {
  return onAgenda
    ? addTaskToUpcomingAgenda(state, task, actor, now)
    : removeTaskFromAgendaState(state, task.id);
}

export function taskIsOnAgenda(state: AgendaStateMap, taskId: string): boolean {
  const itemId = agendaItemIdForTask(taskId);
  return Object.values(state).some((items) => Array.isArray(items) && items.some((item) => item.id === itemId));
}

export function loadLocalAgendaState(): AgendaStateMap {
  if (typeof window === 'undefined') return {};
  return loadAgendaState(localStorage.getItem(AGENDA_STORAGE_KEY));
}

export function persistLocalAgendaState(state: AgendaStateMap): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(state));
}

export async function syncTaskToUpcomingAgenda(
  task: AgendaTaskInput,
  onAgenda: boolean,
  actor?: AgendaActor | null,
  now = new Date(),
): Promise<void> {
  const local = loadLocalAgendaState();
  const optimistic = setTaskOnUpcomingAgenda(local, task, onAgenda, actor, now);
  persistLocalAgendaState(optimistic);

  const remote = await fetchAgendaStore();
  const merged = mergeAgendaStateMaps(remote?.meetings ?? {}, optimistic);
  const next = setTaskOnUpcomingAgenda(merged, task, onAgenda, actor, now);
  persistLocalAgendaState(next);
  const meta = loadAgendaStoreMetaFromStorage() ?? remote?.meta ?? {
    title: WORKING_AGENDA_TITLE,
    topic: '',
    attendees: [],
  };
  await saveAgendaStore(buildAgendaStorePayload(next, meta, actor?.email ?? null));
}

export { AGENDA_META_STORAGE_KEY };
