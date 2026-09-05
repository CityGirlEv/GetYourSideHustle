/**
 * Mirror attachments between linked Content Factory items and Task List rows.
 * Correlation uses deterministic peer ids (xref-sla-… / xref-task-…) so deletes can follow.
 */
import type { Env } from "./auth";
import {
  deleteAttachmentChunks,
  ensureAttachmentContentChunksTable,
  persistAttachmentBase64,
} from "./attachment-limits";
import { softLaunchItemIdFromTaskId, softLaunchTaskId } from "./soft-launch-link";

/** Lazy import avoids a cycle with soft-launch-attachments upload/delete handlers. */
async function softLaunchAttLib() {
  return import("./soft-launch-attachments");
}

const XREF_SLA_PREFIX = "xref-sla-";
const XREF_TASK_PREFIX = "xref-task-";

export function taskMirrorIdForSoftLaunchAtt(softLaunchAttId: string): string {
  return `${XREF_SLA_PREFIX}${String(softLaunchAttId || "").trim()}`;
}

export function softLaunchMirrorIdForTaskAtt(taskAttId: string): string {
  return `${XREF_TASK_PREFIX}${String(taskAttId || "").trim()}`;
}

/** Source soft-launch att id if this task att is a mirror (or null). */
export function sourceSoftLaunchAttIdFromTaskMirror(taskAttId: string): string | null {
  const id = String(taskAttId || "").trim();
  if (!id.startsWith(XREF_SLA_PREFIX)) return null;
  return id.slice(XREF_SLA_PREFIX.length) || null;
}

/** Source task att id if this soft-launch att is a mirror (or null). */
export function sourceTaskAttIdFromSoftLaunchMirror(softLaunchAttId: string): string | null {
  const id = String(softLaunchAttId || "").trim();
  if (!id.startsWith(XREF_TASK_PREFIX)) return null;
  return id.slice(XREF_TASK_PREFIX.length) || null;
}

export type CrossRefUploadInput = {
  sourceId: string;
  name: string;
  mimeType: string;
  size: number;
  /** Already cleaned/validated base64 (no data: prefix). */
  contentBase64: string;
  addedAt: string;
  addedBy?: string;
};

async function peerHasSameFile(
  env: Env,
  table: "task_attachments" | "soft_launch_item_attachments",
  ownerCol: "task_id" | "item_id",
  ownerId: string,
  name: string,
  size: number,
): Promise<boolean> {
  const row = await env.DB.prepare(
    `SELECT id FROM ${table} WHERE ${ownerCol} = ? AND name = ? AND size = ? LIMIT 1`,
  )
    .bind(ownerId, name, size)
    .first<{ id: string }>();
  return Boolean(row?.id);
}

/** After a Content Factory upload, copy onto the linked Task List row when it exists. */
export async function mirrorSoftLaunchUploadToTask(
  env: Env,
  itemId: string,
  input: CrossRefUploadInput,
): Promise<void> {
  const taskId = softLaunchTaskId(itemId);
  if (!taskId) return;

  const task = await env.DB.prepare(`SELECT id FROM tasks WHERE id = ?`)
    .bind(taskId)
    .first<{ id: string }>();
  if (!task) return;

  const mirrorId = taskMirrorIdForSoftLaunchAtt(input.sourceId);
  if (!mirrorId || mirrorId === XREF_SLA_PREFIX) return;

  const existing = await env.DB.prepare(`SELECT id FROM task_attachments WHERE id = ?`)
    .bind(mirrorId)
    .first<{ id: string }>();
  if (existing) return;

  if (await peerHasSameFile(env, "task_attachments", "task_id", taskId, input.name, input.size)) {
    return;
  }

  await ensureAttachmentContentChunksTable(env.DB);
  const storedContent = await persistAttachmentBase64(env.DB, mirrorId, input.contentBase64);
  const note = `Linked Content Factory file (${itemId})`;

  await env.DB.prepare(
    `INSERT INTO task_attachments
       (id, task_id, name, mime_type, size, stored_id, r2_key, added_at, content_base64, note)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)`,
  )
    .bind(
      mirrorId,
      taskId,
      input.name,
      input.mimeType,
      input.size,
      mirrorId,
      input.addedAt,
      storedContent,
      note,
    )
    .run();
}

/** After a Task List upload, copy onto the linked Content Factory item when media is allowed. */
export async function mirrorTaskUploadToSoftLaunch(
  env: Env,
  taskId: string,
  input: CrossRefUploadInput,
): Promise<void> {
  const itemId = softLaunchItemIdFromTaskId(taskId);
  if (!itemId) return;

  const sla = await softLaunchAttLib();
  if (!sla.isSoftLaunchMediaAttachment(input.name, input.mimeType)) return;
  const validated = sla.validateSoftLaunchMediaAttachment({
    name: input.name,
    mimeType: input.mimeType,
    contentBase64: input.contentBase64,
  });
  if (!validated.ok) return;

  await sla.ensureSoftLaunchAttachmentsTable(env);

  const mirrorId = softLaunchMirrorIdForTaskAtt(input.sourceId);
  if (!mirrorId || mirrorId === XREF_TASK_PREFIX) return;

  const existing = await env.DB.prepare(
    `SELECT id FROM soft_launch_item_attachments WHERE id = ?`,
  )
    .bind(mirrorId)
    .first<{ id: string }>();
  if (existing) return;

  if (
    await peerHasSameFile(
      env,
      "soft_launch_item_attachments",
      "item_id",
      itemId,
      input.name,
      validated.size,
    )
  ) {
    return;
  }

  await ensureAttachmentContentChunksTable(env.DB);
  const storedContent = await persistAttachmentBase64(env.DB, mirrorId, validated.cleaned);
  const addedBy = String(input.addedBy || "").trim();

  await env.DB.prepare(
    `INSERT INTO soft_launch_item_attachments
       (id, item_id, name, mime_type, size, content_base64, added_at, added_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      mirrorId,
      itemId,
      input.name,
      validated.mime,
      validated.size,
      storedContent,
      input.addedAt,
      addedBy,
    )
    .run();
}

/** When deleting a soft-launch attachment, remove its Task List mirror (and reverse peer). */
export async function deleteTaskMirrorsForSoftLaunchAtt(
  env: Env,
  softLaunchAttId: string,
): Promise<void> {
  const id = String(softLaunchAttId || "").trim();
  if (!id) return;

  const peerIds = new Set<string>();
  peerIds.add(taskMirrorIdForSoftLaunchAtt(id));
  const sourceTaskId = sourceTaskAttIdFromSoftLaunchMirror(id);
  if (sourceTaskId) peerIds.add(sourceTaskId);

  await ensureAttachmentContentChunksTable(env.DB);
  for (const peerId of peerIds) {
    if (!peerId) continue;
    await deleteAttachmentChunks(env.DB, peerId);
    await env.DB.prepare(`DELETE FROM task_attachments WHERE id = ?`).bind(peerId).run();
  }
}

/** When deleting a task attachment, remove its Content Factory mirror (and reverse peer). */
export async function deleteSoftLaunchMirrorsForTaskAtt(
  env: Env,
  taskAttId: string,
): Promise<void> {
  const id = String(taskAttId || "").trim();
  if (!id) return;

  const sla = await softLaunchAttLib();
  await sla.ensureSoftLaunchAttachmentsTable(env);
  await ensureAttachmentContentChunksTable(env.DB);

  const peerIds = new Set<string>();
  peerIds.add(softLaunchMirrorIdForTaskAtt(id));
  const sourceSlaId = sourceSoftLaunchAttIdFromTaskMirror(id);
  if (sourceSlaId) peerIds.add(sourceSlaId);

  for (const peerId of peerIds) {
    if (!peerId) continue;
    await deleteAttachmentChunks(env.DB, peerId);
    await env.DB.prepare(`DELETE FROM soft_launch_item_attachments WHERE id = ?`)
      .bind(peerId)
      .run();
  }
}
