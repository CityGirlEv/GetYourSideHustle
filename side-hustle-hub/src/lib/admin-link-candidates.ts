import type { AdminEntityKind, AdminEntityTitleMap } from "./admin-entity-links";
import { SOFT_LAUNCH_ROLLOUT, softLaunchItemRef } from "./gysh-soft-launch-rollout";
import type { SoftLaunchItem } from "./gysh-soft-launch-rollout";

export type AdminLinkCandidate = {
  kind: AdminEntityKind;
  id: string;
  label: string;
};

export function buildAdminEntityTitleMap(opts: {
  tasks?: { id: string; title?: string; description?: string }[];
  tests?: { id: string; title?: string }[];
  cfItems?: SoftLaunchItem[];
}): AdminEntityTitleMap {
  const task: Record<string, string> = {};
  const test: Record<string, string> = {};
  const cf: Record<string, string> = {};
  for (const t of opts.tasks ?? []) {
    const id = String(t.id || "").trim();
    const title = String(t.title || t.description || "").trim();
    if (id && title) task[id] = title;
  }
  for (const t of opts.tests ?? []) {
    const id = String(t.id || "").trim();
    const title = String(t.title || "").trim();
    if (id && title) test[id] = title;
  }
  for (const item of opts.cfItems ?? []) {
    if (item?.id && item.title) cf[item.id] = item.title;
  }
  return { task, test, cf };
}

export function buildAdminLinkCandidates(opts: {
  tasks?: { id: string; title?: string; description?: string }[];
  tests?: { id: string; title?: string }[];
  cfItems?: SoftLaunchItem[];
}): AdminLinkCandidate[] {
  const out: AdminLinkCandidate[] = [];
  for (const t of opts.tasks ?? []) {
    const id = String(t.id || "").trim();
    if (!id) continue;
    const title = String(t.title || t.description || "").trim();
    out.push({
      kind: "task",
      id,
      label: title ? `${id} · ${title}` : id,
    });
  }
  for (const t of opts.tests ?? []) {
    const id = String(t.id || "").trim();
    if (!id) continue;
    out.push({
      kind: "test",
      id,
      label: t.title ? `${id} · ${t.title}` : id,
    });
  }
  const cf = opts.cfItems ?? SOFT_LAUNCH_ROLLOUT;
  for (const item of cf) {
    out.push({
      kind: "cf",
      id: item.id,
      label: `${softLaunchItemRef(item.id)} · ${item.title}`,
    });
  }
  return out;
}
