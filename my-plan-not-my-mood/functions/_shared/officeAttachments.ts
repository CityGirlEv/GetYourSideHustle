/** Keep in sync with src/lib/workAttachments.ts office-doc gate. */

const OFFICE_EXTS = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx']);
const OFFICE_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-office',
  'application/octet-stream',
]);
const HARMFUL_EXTS = new Set([
  'exe', 'bat', 'cmd', 'com', 'cpl', 'msi', 'msp', 'pif', 'scr', 'js', 'jse', 'mjs', 'vbs', 'vbe',
  'ws', 'wsf', 'wsh', 'ps1', 'psd1', 'psm1', 'sh', 'bash', 'zsh', 'php', 'html', 'htm', 'xhtml',
  'svg', 'xml', 'jar', 'war', 'apk', 'dmg', 'iso', 'dll', 'sys', 'drv', 'lnk', 'url', 'hta', 'inf',
  'reg', 'app', 'command', 'csh', 'ksh', 'py', 'rb', 'pl', 'cgi', 'asp', 'aspx', 'jsp', 'wasm',
  'swf', 'docm', 'dotm', 'xlsm', 'xltm', 'xlsb', 'pptm', 'potm', 'ppam', 'zip', '7z', 'rar', 'gz',
]);
const HARMFUL_MIMES = new Set([
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

export const OFFICE_ATTACHMENT_REJECT =
  'Only Word (.doc, .docx), PDF, and Excel (.xls, .xlsx) files are allowed. Executable, script, HTML, SVG, and macro-enabled files are blocked.';

export function rejectOfficeAttachment(name: string, mimeType?: string): string | null {
  const file = String(name ?? '').trim();
  if (!file) return OFFICE_ATTACHMENT_REJECT;
  const lower = file.toLowerCase();
  if (lower.includes('..') || lower.includes('/') || lower.includes('\\') || lower.includes('\0')) {
    return OFFICE_ATTACHMENT_REJECT;
  }
  const parts = lower.split('.').filter(Boolean);
  if (parts.length < 2) return OFFICE_ATTACHMENT_REJECT;
  if (parts.slice(1).some((part) => HARMFUL_EXTS.has(part))) return OFFICE_ATTACHMENT_REJECT;
  const ext = parts[parts.length - 1] ?? '';
  if (!OFFICE_EXTS.has(ext)) return OFFICE_ATTACHMENT_REJECT;
  const mime = String(mimeType ?? '').trim().toLowerCase().split(';')[0]?.trim() ?? '';
  if (mime && HARMFUL_MIMES.has(mime)) return OFFICE_ATTACHMENT_REJECT;
  if (mime && !OFFICE_MIMES.has(mime)) return OFFICE_ATTACHMENT_REJECT;
  return null;
}
