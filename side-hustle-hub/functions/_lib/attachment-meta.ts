/**
 * List endpoints must not SELECT content_base64. Remote D1 would ship every
 * stored file on each /api/tasks or /api/agile-plan load (multi-second stalls).
 * Download bytes via /api/task-attachments?id=… / /api/plan-attachments?id=…
 */

export const TASK_ATTACHMENT_LIST_COLUMNS =
  "id, task_id, name, mime_type, size, stored_id, r2_key, added_at, note";

export const PLAN_ATTACHMENT_LIST_COLUMNS =
  "id, plan_item_id, name, mime_type, size, stored_id, r2_key, added_at";

export function attachmentMetaHasContent(row: {
  size?: number | null;
  stored_id?: string | null;
  content_base64?: string | null;
}): boolean {
  if (typeof row.content_base64 === "string" && row.content_base64.length > 0) return true;
  if (Number(row.size) > 0) return true;
  return Boolean(String(row.stored_id || "").trim());
}
