/**
 * Task / QA test file attachments (metadata on the work item; bytes in D1).
 */

import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL, fileTooLargeMessage } from './uploadLimits';

export const WORK_ATTACHMENT_MAX_BYTES = Math.max(MAX_UPLOAD_BYTES, 25 * 1024 * 1024);
export const WORK_ATTACHMENT_MAX_LABEL =
  WORK_ATTACHMENT_MAX_BYTES >= 25 * 1024 * 1024 ? '25 MB' : MAX_UPLOAD_LABEL;

export type WorkAttachmentKind = 'task' | 'test' | 'factory';

export const WORK_ATTACHMENT_KINDS: readonly WorkAttachmentKind[] = ['task', 'test', 'factory'];

/** Content Factory uploads: Word, PDF, Excel only. */
export const OFFICE_ATTACHMENT_EXTS = ['pdf', 'doc', 'docx', 'xls', 'xlsx'] as const;
export const OFFICE_ATTACHMENT_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export const OFFICE_ATTACHMENT_HINT = 'Word, PDF, or Excel only';
export const OFFICE_ATTACHMENT_REJECT =
  'Only Word (.doc, .docx), PDF, and Excel (.xls, .xlsx) files are allowed. Executable, script, HTML, SVG, and macro-enabled files are blocked.';

const OFFICE_ATTACHMENT_EXT_SET = new Set<string>(OFFICE_ATTACHMENT_EXTS);
const OFFICE_ATTACHMENT_MIME_SET = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-office',
  'application/octet-stream',
]);
const HARMFUL_ATTACHMENT_EXTS = new Set([
  'exe', 'bat', 'cmd', 'com', 'cpl', 'msi', 'msp', 'pif', 'scr', 'js', 'jse', 'mjs', 'vbs', 'vbe',
  'ws', 'wsf', 'wsh', 'ps1', 'psd1', 'psm1', 'sh', 'bash', 'zsh', 'php', 'html', 'htm', 'xhtml',
  'svg', 'xml', 'jar', 'war', 'apk', 'dmg', 'iso', 'dll', 'sys', 'drv', 'lnk', 'url', 'hta', 'inf',
  'reg', 'app', 'command', 'csh', 'ksh', 'py', 'rb', 'pl', 'cgi', 'asp', 'aspx', 'jsp', 'wasm',
  'swf', 'docm', 'dotm', 'xlsm', 'xltm', 'xlsb', 'pptm', 'potm', 'ppam', 'zip', '7z', 'rar', 'gz',
]);
const HARMFUL_ATTACHMENT_MIMES = new Set([
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/javascript',
  'text/javascript',
  'text/html',
  'image/svg+xml',
  'application/xhtml+xml',
  'application/x-sh',
  'application/x-bat',
  'application/vnd.ms-excel.sheet.macroenabled.12',
  'application/vnd.ms-word.document.macroenabled.12',
]);

export function attachmentFileExtension(name: string): string {
  const base = String(name ?? '')
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .pop() ?? '';
  const match = base.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() ?? '';
}

export function isHarmfulAttachmentName(name: string): boolean {
  const raw = String(name ?? '').trim().toLowerCase();
  if (!raw || raw.includes('..') || raw.includes('/') || raw.includes('\\') || raw.includes('\0')) {
    return true;
  }
  const parts = raw.split('.').filter(Boolean);
  if (parts.length < 2) return true;
  return parts.slice(1).some((part) => HARMFUL_ATTACHMENT_EXTS.has(part));
}

/** Null when the file is a safe Word / PDF / Excel attachment. */
export function rejectOfficeAttachment(name: string, mimeType?: string): string | null {
  const file = String(name ?? '').trim();
  if (!file) return OFFICE_ATTACHMENT_REJECT;
  if (isHarmfulAttachmentName(file)) return OFFICE_ATTACHMENT_REJECT;
  const ext = attachmentFileExtension(file);
  if (!OFFICE_ATTACHMENT_EXT_SET.has(ext)) return OFFICE_ATTACHMENT_REJECT;
  const mime = String(mimeType ?? '').trim().toLowerCase().split(';')[0]?.trim() ?? '';
  if (mime && HARMFUL_ATTACHMENT_MIMES.has(mime)) return OFFICE_ATTACHMENT_REJECT;
  if (mime && !OFFICE_ATTACHMENT_MIME_SET.has(mime)) return OFFICE_ATTACHMENT_REJECT;
  return null;
}

export type WorkAttachmentMeta = {
  id: string;
  name: string;
  mimeType: string;
  byteSize: number;
  uploadedBy: string;
  uploadedByEmail?: string;
  uploadedAt: string;
};

export function workAttachmentTooLarge(size: number): string | null {
  if (size <= WORK_ATTACHMENT_MAX_BYTES) return null;
  return fileTooLargeMessage('Attachments').replace(MAX_UPLOAD_LABEL, WORK_ATTACHMENT_MAX_LABEL);
}

export function normalizeWorkAttachments(raw: unknown): WorkAttachmentMeta[] {
  if (!Array.isArray(raw)) return [];
  const out: WorkAttachmentMeta[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const id = String(row.id ?? '').trim();
    const name = String(row.name ?? '').trim();
    if (!id || !name) continue;
    out.push({
      id,
      name,
      mimeType: String(row.mimeType ?? 'application/octet-stream'),
      byteSize: Number(row.byteSize) || 0,
      uploadedBy: String(row.uploadedBy ?? 'Unknown'),
      uploadedByEmail: typeof row.uploadedByEmail === 'string' ? row.uploadedByEmail : undefined,
      uploadedAt: String(row.uploadedAt ?? new Date().toISOString()),
    });
  }
  return out;
}

export function formatAttachmentSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function canModifyWorkAttachment(
  attachment: WorkAttachmentMeta,
  actor: { name: string; email?: string | null; isSuperAdmin?: boolean } | null | undefined,
): boolean {
  if (!actor?.name?.trim()) return false;
  if (actor.isSuperAdmin) return true;
  const email = String(actor.email ?? '').trim().toLowerCase();
  if (email && attachment.uploadedByEmail && email === attachment.uploadedByEmail.toLowerCase()) {
    return true;
  }
  const left = String(attachment.uploadedBy).trim().toLowerCase();
  const right = String(actor.name).trim().toLowerCase();
  if (left === right) return true;
  const first = (raw: string) => raw.split(/\s+/)[0] || '';
  return first(left) === first(right) && first(left) !== '';
}

export async function fileToBase64(file: Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType || 'application/octet-stream' });
}
