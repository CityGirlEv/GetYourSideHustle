import type { WorkAssignee } from './workBoard';
import { ASSIGNEE_LABELS } from './workBoard';

export interface SprintDeliverable {
  id: string;
  label: string;
  completed: boolean;
  assignee: WorkAssignee;
}

export type DeliverableInput = string | SprintDeliverable;

export function deliverableStableId(sprintId: string, index: number): string {
  return `${sprintId}-d-${index}`;
}

export function normalizeDeliverables(
  sprintId: string,
  raw: DeliverableInput[] | undefined,
): SprintDeliverable[] {
  if (!raw?.length) return [];
  return raw.map((entry, idx) => {
    if (typeof entry === 'string') {
      return {
        id: deliverableStableId(sprintId, idx),
        label: entry,
        completed: false,
        assignee: 'unassigned',
      };
    }
    return {
      id: entry.id || deliverableStableId(sprintId, idx),
      label: entry.label ?? '',
      completed: !!entry.completed,
      assignee: entry.assignee ?? 'unassigned',
    };
  });
}

export function mergeDeliverables(
  sprintId: string,
  defaultRaw: DeliverableInput[] | undefined,
  savedRaw: DeliverableInput[] | undefined,
): SprintDeliverable[] {
  const defaults = normalizeDeliverables(sprintId, defaultRaw);
  if (!savedRaw?.length) return defaults;

  const saved = normalizeDeliverables(sprintId, savedRaw);
  const savedById = new Map(saved.map((s) => [s.id, s]));
  const merged: SprintDeliverable[] = [];

  for (const d of defaults) {
    const match = savedById.get(d.id);
    if (match) {
      merged.push({
        ...d,
        label: match.label,
        completed: match.completed,
        assignee: match.assignee,
      });
      savedById.delete(d.id);
    } else {
      merged.push(d);
    }
  }

  for (const custom of saved) {
    if (!defaults.some((d) => d.id === custom.id)) {
      merged.push(custom);
    }
  }

  return merged;
}

export function deliverableLabelList(items: SprintDeliverable[]): string[] {
  return items.map((d) => d.label);
}

export interface DeliverableProgress {
  total: number;
  completed: number;
  percent: number;
}

export function computeDeliverableProgress(items: SprintDeliverable[]): DeliverableProgress {
  const total = items.length;
  const completed = items.filter((d) => d.completed).length;
  return {
    total,
    completed,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export type AssigneeProgress = DeliverableProgress & { assignee: WorkAssignee; label: string };

export function computeProgressByAssignee(
  allDeliverables: SprintDeliverable[],
): AssigneeProgress[] {
  const byAssignee = new Map<WorkAssignee, SprintDeliverable[]>();
  for (const d of allDeliverables) {
    const list = byAssignee.get(d.assignee) ?? [];
    list.push(d);
    byAssignee.set(d.assignee, list);
  }

  return Array.from(byAssignee.entries())
    .map(([assignee, items]) => ({
      assignee,
      label: ASSIGNEE_LABELS[assignee],
      ...computeDeliverableProgress(items),
    }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.percent - a.percent);
}

export function collectVisibleDeliverables(
  lineItems: { visible?: boolean; deliverables?: DeliverableInput[]; id: string }[],
): SprintDeliverable[] {
  return lineItems
    .filter((item) => item.visible !== false)
    .flatMap((item) => normalizeDeliverables(item.id, item.deliverables));
}
