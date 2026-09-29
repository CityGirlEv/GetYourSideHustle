export function clampListIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(0, index), count - 1);
}

/** Move one item to a new index. Same list when the move is a no-op. */
export function reorderListByIndex<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const count = items.length;
  if (count < 2) return items;
  const from = clampListIndex(fromIndex, count);
  const to = clampListIndex(toIndex, count);
  if (from === to) return items;
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return items;
  next.splice(to, 0, moved);
  return next;
}

export function reorderKeyedGroups<T extends { id: string }>(
  items: T[],
  groupId: string,
  groupOf: (item: T) => string,
  fromIndex: number,
  toIndex: number,
): T[] {
  const group = items.filter((item) => groupOf(item) === groupId);
  const reordered = reorderListByIndex(group, fromIndex, toIndex);
  if (reordered === group) return items;
  let cursor = 0;
  return items.map((item) => (groupOf(item) === groupId ? reordered[cursor++]! : item));
}
