/**
 * Per-guide change log — status / membership / soft-delete history.
 * Entries are persisted in D1 `guide_catalog_change_log` and shown to Admin/QA.
 */

import {
  guideVisibilityStatusLabel,
  type GuideVisibilityStatus,
} from "./guide-catalog-state";

export type GuideChangeLogAction =
  | "status"
  | "min_tier"
  | "delete"
  | "restore"
  | "bulk_status"
  | "bulk_assignee"
  | "qa_pass"
  | "content";

export type GuideChangeLogEntry = {
  id: number | string;
  guideId: string;
  changedAt: string;
  changedBy: string;
  action: GuideChangeLogAction;
  fromStatus?: GuideVisibilityStatus | null;
  toStatus?: GuideVisibilityStatus | null;
  detail?: {
    minTier?: string;
    note?: string;
    fields?: string[];
    assignee?: string;
  };
};

export function isGuideChangeLogAction(value: unknown): value is GuideChangeLogAction {
  return (
    value === "status" ||
    value === "min_tier" ||
    value === "delete" ||
    value === "restore" ||
    value === "bulk_status" ||
    value === "bulk_assignee" ||
    value === "qa_pass" ||
    value === "content"
  );
}

/** One-line summary for the change-history UI. */
export function formatGuideChangeLogSummary(entry: GuideChangeLogEntry): string {
  const from = entry.fromStatus ? guideVisibilityStatusLabel(entry.fromStatus) : null;
  const to = entry.toStatus ? guideVisibilityStatusLabel(entry.toStatus) : null;

  if (entry.action === "min_tier") {
    const tier = entry.detail?.minTier?.trim();
    return tier ? `Membership floor → ${tier}` : "Membership floor updated";
  }
  if (entry.action === "content") {
    const fields = entry.detail?.fields?.filter(Boolean) ?? [];
    if (fields.length) return `Content updated (${fields.join(", ")})`;
    return "Content updated";
  }
  if (entry.action === "delete") {
    return from && to ? `Soft-deleted (${from} → ${to})` : "Soft-deleted";
  }
  if (entry.action === "restore") {
    return "Restored from soft-delete";
  }
  if (entry.action === "qa_pass") {
    if (from && to) return `QA Pass: ${from} → ${to}`;
    return to ? `QA Pass → ${to}` : "QA Pass";
  }
  if (entry.action === "bulk_status") {
    if (from && to) return `Bulk status: ${from} → ${to}`;
    return to ? `Bulk status → ${to}` : "Bulk status update";
  }
  if (entry.action === "bulk_assignee") {
    const assignee = entry.detail?.assignee?.trim();
    return assignee ? `Bulk assignee → ${assignee}` : "Bulk assignee → Unassigned";
  }
  if (from && to) return `Status: ${from} → ${to}`;
  if (to) return `Status → ${to}`;
  return entry.detail?.note?.trim() || "Guide updated";
}

export function formatGuideChangeLogWhen(iso: string): string {
  const raw = String(iso || "").trim();
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
