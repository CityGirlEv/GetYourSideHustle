/**
 * Client helpers for manual admin entity links (task ↔ test ↔ Content Factory).
 */
import { api } from "./api";
import type { AdminDeepLinkOpts } from "./admin-deep-links";
import {
  softLaunchItemById,
  softLaunchItemRef,
} from "./gysh-soft-launch-rollout";

export type AdminEntityKind = "task" | "test" | "cf";

export type AdminEntityRef = {
  kind: AdminEntityKind;
  id: string;
};

export type AdminEntityLinkRow = {
  id: string;
  aKind: AdminEntityKind;
  aId: string;
  bKind: AdminEntityKind;
  bId: string;
  suppressed: boolean;
  createdAt?: string;
  createdBy?: string;
};

export type AdminCrossLinkBase = {
  label: string;
  opts: AdminDeepLinkOpts;
};

export type MergedAdminCrossLink = AdminCrossLinkBase & {
  target: AdminEntityRef;
  source: "catalog" | "manual";
};

/** Live titles so link chips refresh when a task/test/CF item is renamed. */
export type AdminEntityTitleMap = {
  task?: Record<string, string>;
  test?: Record<string, string>;
  /** Optional CF titles; falls back to softLaunchItemById when omitted. */
  cf?: Record<string, string>;
};

const KIND_RANK: Record<AdminEntityKind, number> = { cf: 0, task: 1, test: 2 };

export function normalizeEntityEdge(
  a: AdminEntityRef,
  b: AdminEntityRef,
): [AdminEntityRef, AdminEntityRef] {
  if (KIND_RANK[a.kind] < KIND_RANK[b.kind]) return [a, b];
  if (KIND_RANK[a.kind] > KIND_RANK[b.kind]) return [b, a];
  return a.id <= b.id ? [a, b] : [b, a];
}

export function entityEdgeKey(a: AdminEntityRef, b: AdminEntityRef): string {
  const [x, y] = normalizeEntityEdge(a, b);
  return `${x.kind}:${x.id}|${y.kind}:${y.id}`;
}

export function sameEntityRef(a: AdminEntityRef, b: AdminEntityRef): boolean {
  return a.kind === b.kind && a.id === b.id;
}

export function crossLinkTarget(link: AdminCrossLinkBase): AdminEntityRef | null {
  if (link.opts.taskId) return { kind: "task", id: String(link.opts.taskId).trim() };
  if (link.opts.testId) return { kind: "test", id: String(link.opts.testId).trim() };
  if (link.opts.itemId) return { kind: "cf", id: String(link.opts.itemId).trim() };
  return null;
}

function titleFromMap(
  titles: AdminEntityTitleMap | undefined,
  kind: AdminEntityKind,
  id: string,
): string {
  const raw = titles?.[kind]?.[id];
  return String(raw || "").trim();
}

/** Build a deep-link label using the latest known title when available. */
export function labelAndOptsForEntity(
  target: AdminEntityRef,
  titles?: AdminEntityTitleMap,
): AdminCrossLinkBase {
  if (target.kind === "task") {
    const title = titleFromMap(titles, "task", target.id);
    return {
      label: title ? `Task ${target.id} · ${title}` : `Task ${target.id}`,
      opts: { tab: "tasks", taskId: target.id },
    };
  }
  if (target.kind === "test") {
    const title = titleFromMap(titles, "test", target.id);
    return {
      label: title ? `Test ${target.id} · ${title}` : `Test ${target.id}`,
      opts: { tab: "testing", testId: target.id },
    };
  }
  const mapped = titleFromMap(titles, "cf", target.id);
  const item = softLaunchItemById(target.id);
  const ref = softLaunchItemRef(target.id);
  const title = mapped || item?.title || "";
  return {
    label: title ? `${ref} · ${title}` : ref,
    opts: { tab: "factory", panel: "launch-plan", itemId: target.id },
  };
}

/** Re-resolve a link label from live titles (keeps opts). */
export function withLiveEntityTitle(
  link: AdminCrossLinkBase,
  titles?: AdminEntityTitleMap,
): AdminCrossLinkBase {
  const target = crossLinkTarget(link);
  if (!target) return link;
  const resolved = labelAndOptsForEntity(target, titles);
  return { label: resolved.label, opts: link.opts };
}

function otherEnd(self: AdminEntityRef, row: AdminEntityLinkRow): AdminEntityRef | null {
  const a: AdminEntityRef = { kind: row.aKind, id: row.aId };
  const b: AdminEntityRef = { kind: row.bKind, id: row.bId };
  if (sameEntityRef(self, a)) return b;
  if (sameEntityRef(self, b)) return a;
  return null;
}

/** Merge compile-time catalog links with D1 manual links / suppressions. */
export function mergeEntityCrossLinks(
  self: AdminEntityRef,
  catalog: AdminCrossLinkBase[],
  rows: AdminEntityLinkRow[],
  titles?: AdminEntityTitleMap,
): MergedAdminCrossLink[] {
  const suppressed = new Set<string>();
  const manuals: AdminEntityRef[] = [];

  for (const row of rows) {
    const other = otherEnd(self, row);
    if (!other) continue;
    const key = entityEdgeKey(self, other);
    if (row.suppressed) suppressed.add(key);
    else manuals.push(other);
  }

  const out: MergedAdminCrossLink[] = [];
  const seen = new Set<string>();

  for (const link of catalog) {
    const target = crossLinkTarget(link);
    if (!target || !target.id) continue;
    const key = entityEdgeKey(self, target);
    if (suppressed.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push({ ...withLiveEntityTitle(link, titles), target, source: "catalog" });
  }

  for (const target of manuals) {
    if (!target.id) continue;
    const key = entityEdgeKey(self, target);
    if (suppressed.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push({ ...labelAndOptsForEntity(target, titles), target, source: "manual" });
  }

  return out;
}

export async function fetchAdminEntityLinks(): Promise<AdminEntityLinkRow[]> {
  const data = await api<{ links: AdminEntityLinkRow[] }>("admin-entity-links");
  return Array.isArray(data.links) ? data.links : [];
}

export async function createAdminEntityLinkApi(
  a: AdminEntityRef,
  b: AdminEntityRef,
): Promise<AdminEntityLinkRow> {
  const [x, y] = normalizeEntityEdge(a, b);
  const data = await api<{ ok: boolean; link: AdminEntityLinkRow }>("admin-entity-links", {
    method: "POST",
    body: { aKind: x.kind, aId: x.id, bKind: y.kind, bId: y.id },
  });
  return data.link;
}

export async function unlinkAdminEntityLinkApi(
  a: AdminEntityRef,
  b: AdminEntityRef,
): Promise<void> {
  const [x, y] = normalizeEntityEdge(a, b);
  await api("admin-entity-links", {
    method: "DELETE",
    body: { aKind: x.kind, aId: x.id, bKind: y.kind, bId: y.id },
  });
}
