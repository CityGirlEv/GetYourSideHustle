export type IpItemPhase = 'phase1_build' | 'phase2_addons' | 'phase3_future';

export type BudgetItemStatus = 'not_started' | 'in_progress' | 'done' | 'blocked';
export type BudgetItemSprint = 'Sprint 0' | 'Sprint 1' | 'Sprint 2' | 'Sprint 3' | 'Sprint 4';
export type BudgetItemAssignee = 'angela' | 'evelyn' | 'dev' | 'qa' | 'unassigned';

export const BUDGET_STATUSES: BudgetItemStatus[] = ['not_started', 'in_progress', 'done', 'blocked'];
export const BUDGET_STATUS_LABELS: Record<BudgetItemStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  done: 'Done',
  blocked: 'Blocked',
};

export function sprintFromBudgetItemId(id: string): BudgetItemSprint {
  if (id.startsWith('sprint1')) return 'Sprint 1';
  if (id.startsWith('sprint2')) return 'Sprint 2';
  if (id.startsWith('sprint3')) return 'Sprint 3';
  if (id.startsWith('sprint4')) return 'Sprint 4';
  return 'Sprint 0';
}

export function isBudgetItemStatus(value: unknown): value is BudgetItemStatus {
  return typeof value === 'string' && (BUDGET_STATUSES as readonly string[]).includes(value);
}

export interface BlankIpLineItem {
  id: string;
  name: string;
  phase: IpItemPhase;
  duration: string;
  dates: string;
  summary: string;
  description: string;
  notes: string;
  sprint: BudgetItemSprint;
  status: BudgetItemStatus;
  assignee: BudgetItemAssignee;
  deliverables: string[];
  hours: number;
  rate: number;
  baseAmount: number;
  visible: boolean;
}

export function createBlankIpLineItem(phase: IpItemPhase, now = Date.now()): BlankIpLineItem {
  const labels: Record<IpItemPhase, { name: string; duration: string }> = {
    phase1_build: { name: 'New Phase 1 item', duration: '1 Week' },
    phase2_addons: { name: 'New Phase 2 item', duration: 'Phase 2 — future discussion' },
    phase3_future: { name: 'New Phase 3 item', duration: 'Phase 3 — not scoped' },
  };
  const meta = labels[phase];
  return {
    id: `custom-${now}`,
    name: meta.name,
    phase,
    duration: meta.duration,
    dates: 'Date TBD',
    summary: 'Add a short summary.',
    description: 'Describe this work item.',
    notes: '',
    sprint: sprintFromBudgetItemId(`custom-${now}`),
    status: 'not_started',
    assignee: 'unassigned',
    deliverables: [],
    hours: 0,
    rate: 0,
    baseAmount: 0,
    visible: true,
  };
}

export function addIpLineItem<T extends { id: string }>(items: T[], item: T): T[] {
  if (items.some((existing) => existing.id === item.id)) return items;
  return [...items, item];
}

export function removeIpLineItem<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id);
}

/** Saved title, description, notes, sprint, status, and assignee win over seed copy. */
export function keepSavedLineItemCopy<T extends {
  name?: string;
  summary?: string;
  description?: string;
  notes?: string;
  sprint?: string;
  status?: string;
  assignee?: string;
}>(defaultsItem: T | undefined, savedItem: T): T {
  if (!defaultsItem) return savedItem;
  return {
    ...defaultsItem,
    ...savedItem,
    name: String(savedItem.name ?? '').trim() || defaultsItem.name,
    summary: savedItem.summary ?? defaultsItem.summary,
    description: String(savedItem.description ?? '').trim() || defaultsItem.description,
    notes: String(savedItem.notes ?? ''),
    sprint: savedItem.sprint ?? defaultsItem.sprint,
    status: savedItem.status ?? defaultsItem.status,
    assignee: savedItem.assignee ?? defaultsItem.assignee,
  };
}
export function mergeSavedIpLineItems<T extends { id: string }>(
  saved: T[] | null | undefined,
  defaults: T[],
  mergeExisting: (defaultsItem: T | undefined, savedItem: T) => T,
): T[] {
  if (saved == null) return defaults;
  return saved.map((savedItem) => {
    const defaultsItem = defaults.find((item) => item.id === savedItem.id);
    return mergeExisting(defaultsItem, savedItem);
  });
}

/** Append new default seed items that are missing from a saved plan. */
export function mergeMissingDefaultLineItems<T extends { id: string }>(
  existing: T[],
  defaults: T[],
): T[] {
  const ids = new Set(existing.map((item) => item.id));
  const missing = defaults.filter((item) => !ids.has(item.id));
  return missing.length > 0 ? [...existing, ...missing] : existing;
}
