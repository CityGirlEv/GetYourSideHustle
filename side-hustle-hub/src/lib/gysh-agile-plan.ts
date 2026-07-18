/** GYSH Agile plan + retrospective board — D1 API client. */

import { api } from "./api";
import {
  BACKLOG_SPRINT,
  type PlanItem,
  type PlanItemStatus,
  type PlanOwner,
  type PlanItemKind,
  type RetroCard,
  type RetroColumn,
} from "./gysh-sprints";

function mapPlanItem(raw: Record<string, unknown>): PlanItem {
  const sprintRaw = Number(raw.sprint);
  return {
    id: String(raw.id || ""),
    title: String(raw.title || ""),
    notes: String(raw.notes || ""),
    owner: (String(raw.owner || "Both") as PlanOwner),
    kind: (String(raw.kind || "rollout") as PlanItemKind),
    sprint: Number.isFinite(sprintRaw) ? sprintRaw : BACKLOG_SPRINT,
    status: (String(raw.status || "todo") as PlanItemStatus),
    date: String(raw.date || ""),
    dateLabel: String(raw.dateLabel || raw.date_label || ""),
    tinaDone: raw.tinaDone === true || raw.done_tina === 1 || raw.done_tina === true,
    evelynDone: raw.evelynDone === true || raw.done_evelyn === 1 || raw.done_evelyn === true,
    attachments: Array.isArray(raw.attachments)
      ? raw.attachments.map((a) => {
          const att = a as Record<string, unknown>;
          return {
            id: String(att.id || ""),
            name: String(att.name || ""),
            mimeType: String(att.mimeType || att.mime_type || ""),
            size: Number(att.size ?? 0),
            storedId: String(att.storedId || att.stored_id || att.id || ""),
            r2Key: att.r2Key == null && att.r2_key == null ? null : String(att.r2Key ?? att.r2_key),
            addedAt: String(att.addedAt || att.added_at || ""),
          };
        })
      : [],
  };
}

function mapRetro(raw: Record<string, unknown>): RetroCard {
  return {
    id: String(raw.id || ""),
    sprint: Number(raw.sprint ?? 0),
    column: (String(raw.column || raw.column_key || "went_well") as RetroColumn),
    text: String(raw.text || ""),
    owner: (String(raw.owner || "Both") as PlanOwner),
  };
}

export async function fetchAgilePlan(): Promise<{ items: PlanItem[]; retro: RetroCard[] }> {
  const data = await api<{ items?: unknown[]; retro?: unknown[]; seeded?: boolean }>("agile-plan");
  const items = (data.items ?? []).map((r) => mapPlanItem(r as Record<string, unknown>));
  const retro = (data.retro ?? []).map((r) => mapRetro(r as Record<string, unknown>));
  return { items, retro };
}

export async function persistAgilePlan(
  items: PlanItem[],
  retro: RetroCard[],
): Promise<{ items: PlanItem[]; retro: RetroCard[] }> {
  const data = await api<{ items?: unknown[]; retro?: unknown[] }>("agile-plan", {
    method: "PUT",
    body: { items, retro },
  });
  return {
    items: (data.items ?? []).map((r) => mapPlanItem(r as Record<string, unknown>)),
    retro: (data.retro ?? []).map((r) => mapRetro(r as Record<string, unknown>)),
  };
}
