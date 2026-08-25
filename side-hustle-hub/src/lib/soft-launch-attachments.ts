/**
 * Client API for Content Factory calendar item attachments (images, short videos, PDFs).
 */
import { api } from "./api";

export type SoftLaunchItemAttachment = {
  id: string;
  itemId: string;
  name: string;
  mimeType: string;
  size: number;
  addedAt: string;
  addedBy?: string;
  hasContent?: boolean;
};

const MEDIA_EXT = /\.(png|jpe?g|gif|webp|svg|bmp|heic|mp4|webm|mov|pdf)$/i;

export const SOFT_LAUNCH_MEDIA_ACCEPT =
  "image/*,video/mp4,video/webm,video/quicktime,application/pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp,.heic,.mp4,.webm,.mov,.pdf";

export function isSoftLaunchMediaFile(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  if (type.startsWith("image/") || type.startsWith("video/")) return true;
  if (type === "application/pdf") return true;
  return MEDIA_EXT.test(file.name);
}

/** @deprecated Use isSoftLaunchMediaFile */
export const isSoftLaunchImageFile = isSoftLaunchMediaFile;

export function isSoftLaunchVideoAttachment(
  mimeType: string | null | undefined,
  fileName: string | null | undefined,
): boolean {
  const mime = String(mimeType || "").toLowerCase();
  const name = String(fileName || "").toLowerCase();
  return mime.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(name);
}

export function isSoftLaunchPdfAttachment(
  mimeType: string | null | undefined,
  fileName: string | null | undefined,
): boolean {
  const mime = String(mimeType || "").toLowerCase();
  const name = String(fileName || "").toLowerCase();
  return mime === "application/pdf" || name.endsWith(".pdf");
}

export function groupSoftLaunchAttachmentsByItem(
  attachments: SoftLaunchItemAttachment[],
): Record<string, SoftLaunchItemAttachment[]> {
  const out: Record<string, SoftLaunchItemAttachment[]> = {};
  for (const att of attachments) {
    const itemId = String(att.itemId || "").trim();
    if (!itemId) continue;
    if (!out[itemId]) out[itemId] = [];
    out[itemId].push(att);
  }
  return out;
}

export async function fetchSoftLaunchAttachments(
  itemId?: string,
): Promise<SoftLaunchItemAttachment[]> {
  const path = itemId
    ? `soft-launch-attachments?itemId=${encodeURIComponent(itemId)}`
    : "soft-launch-attachments";
  const data = await api<{ attachments: SoftLaunchItemAttachment[] }>(path);
  return Array.isArray(data.attachments) ? data.attachments : [];
}

export async function uploadSoftLaunchAttachment(input: {
  itemId: string;
  id?: string;
  name: string;
  mimeType: string;
  contentBase64: string;
  addedAt?: string;
}): Promise<SoftLaunchItemAttachment> {
  const data = await api<{ attachment: SoftLaunchItemAttachment }>("soft-launch-attachments", {
    method: "POST",
    body: input,
    timeoutMs: 180_000,
  });
  return data.attachment;
}

export async function fetchSoftLaunchAttachmentContent(id: string): Promise<{
  name: string;
  mimeType: string;
  contentBase64: string;
}> {
  return api(`soft-launch-attachments?id=${encodeURIComponent(id)}`, { timeoutMs: 180_000 });
}

export async function deleteSoftLaunchAttachmentRemote(id: string): Promise<void> {
  await api("soft-launch-attachments", { method: "DELETE", body: { id } });
}
