import { getStoredSessionToken } from './usersApi';
import type { WorkAttachmentKind, WorkAttachmentMeta } from './workAttachments';

function authHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  const token = getStoredSessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function uploadWorkAttachment(input: {
  itemKind: WorkAttachmentKind;
  itemId: string;
  name: string;
  mimeType: string;
  byteSize: number;
  uploadedBy: string;
  uploadedByEmail?: string;
  contentBase64: string;
}): Promise<{ ok: true; attachment: WorkAttachmentMeta } | { ok: false; error: string }> {
  const res = await fetch('/api/work-attachments', {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    attachment?: WorkAttachmentMeta;
    error?: string;
  };
  if (!res.ok || !data.attachment) {
    return { ok: false, error: data.error || 'Upload failed.' };
  }
  return { ok: true, attachment: data.attachment };
}

export async function deleteWorkAttachment(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch('/api/work-attachments', {
    method: 'DELETE',
    headers: authHeaders(true),
    body: JSON.stringify({ id }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok) return { ok: false, error: data.error || 'Delete failed.' };
  return { ok: true };
}

export function workAttachmentDownloadUrl(id: string): string {
  return `/api/work-attachments?id=${encodeURIComponent(id)}&download=1`;
}
