import { MAX_UPLOAD_BYTES, folderFileTooLargeReason } from './uploadLimits';

export const LOCAL_FOLDER_IMPORT_PATH = '/__local__/folder-import';
export const MAX_LOCAL_FOLDER_PATH_CHARS = 512;
export const MAX_FOLDER_IMPORT_DEPTH = 4;

export const LOGO_EXT_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

const SKIP_DIR_NAMES = new Set([
  '.git',
  '.svn',
  '.ssh',
  '.cache',
  'node_modules',
  'appdata',
  'application data',
]);

const BLOCKED_WIN_PREFIXES = [
  'c:\\windows',
  'c:\\program files',
  'c:\\program files (x86)',
  'c:\\programdata',
];

const BLOCKED_POSIX_PREFIXES = ['/etc', '/usr', '/bin', '/sbin', '/system', '/private', '/proc', '/dev'];

export function normalizeLocalFolderPath(raw: string): string {
  let value = String(raw ?? '').trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1).trim();
  }
  value = value.replace(/^file:\/\//i, '');
  if (/^\/[A-Za-z]:/.test(value)) value = value.slice(1);
  value = value.replace(/[\\/]+$/, '');
  return value;
}

export function isWindowsAbsolutePath(value: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(value);
}

export function isPosixAbsolutePath(value: string): boolean {
  return value.startsWith('/') && !isWindowsAbsolutePath(value.slice(1));
}

function pathKey(value: string): string {
  const normalized = normalizeLocalFolderPath(value);
  if (isWindowsAbsolutePath(normalized) || /^[A-Za-z]:$/.test(normalized)) {
    return normalized.replace(/\//g, '\\').toLowerCase();
  }
  return normalized;
}

function hasTraversalSegment(value: string): boolean {
  return value.split(/[\\/]/).some((segment) => segment === '..');
}

function isDriveRoot(value: string): boolean {
  const key = pathKey(value);
  return /^[a-z]:$/.test(key) || key === '/' || key === '\\';
}

/** Happy path returns null. Each reject path returns a reason. */
export function localFolderPathError(raw: string): string | null {
  const value = normalizeLocalFolderPath(raw);
  if (!value) return 'Paste a folder path from this computer.';
  if (value.length > MAX_LOCAL_FOLDER_PATH_CHARS) return 'That path is too long.';
  if (value.includes('\0')) return 'That path is not a usable folder.';
  if (hasTraversalSegment(value)) return 'Folder paths cannot include .. segments.';
  if (value.startsWith('\\\\') || value.startsWith('//')) return 'Use a folder on this computer, not a network share.';
  if (!isWindowsAbsolutePath(value) && !isPosixAbsolutePath(value) && !/^[A-Za-z]:$/.test(value)) {
    return 'Use a full folder path, like C:\\Users\\evely\\Documents\\logos.';
  }
  if (isDriveRoot(value)) return 'Point to a project folder, not the drive root.';
  const key = pathKey(value);
  if (BLOCKED_WIN_PREFIXES.some((prefix) => key === prefix || key.startsWith(`${prefix}\\`))) {
    return 'That system folder cannot be imported.';
  }
  if (BLOCKED_POSIX_PREFIXES.some((prefix) => key === prefix || key.startsWith(`${prefix}/`))) {
    return 'That system folder cannot be imported.';
  }
  return null;
}

export function isLoopbackHost(hostname: string): boolean {
  const host = hostname.split(':')[0].toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

export function fileNameFromRelativePath(relativePath: string): string {
  const parts = String(relativePath ?? '')
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

export function fileExtension(name: string): string {
  const base = fileNameFromRelativePath(name);
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return '';
  return base.slice(dot + 1).toLowerCase();
}

export function logoMimeFromName(name: string, type?: string): string {
  const given = String(type ?? '')
    .trim()
    .toLowerCase();
  if (
    given === 'image/jpeg' ||
    given === 'image/png' ||
    given === 'image/webp' ||
    given === 'image/gif' ||
    given === 'image/svg+xml'
  ) {
    return given;
  }
  return LOGO_EXT_MIME[fileExtension(name)] ?? given;
}

export function isImportableLogoFileName(name: string): boolean {
  return Boolean(LOGO_EXT_MIME[fileExtension(name)]);
}

export function isImportableMockupFileName(name: string): boolean {
  const ext = fileExtension(name);
  return Boolean(LOGO_EXT_MIME[ext] && ext !== 'svg');
}

export function shouldSkipImportDirName(name: string): boolean {
  const key = name.trim().toLowerCase();
  if (!key || key === '.' || key === '..') return true;
  if (key.startsWith('.')) return true;
  return SKIP_DIR_NAMES.has(key);
}

export function shouldSkipImportFileName(name: string, allowSvg = true): boolean {
  const base = fileNameFromRelativePath(name);
  if (!base || base.startsWith('.') || base === 'Thumbs.db') return true;
  return allowSvg ? !isImportableLogoFileName(base) : !isImportableMockupFileName(base);
}

export function folderImportDepth(relativePath: string): number {
  return String(relativePath ?? '')
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean).length;
}

export type FolderImportEntry = {
  name: string;
  relativePath: string;
  type?: string;
  size: number;
};

export function planFolderImport(
  entries: FolderImportEntry[],
  options: { maxFiles?: number; maxBytes?: number; allowSvg?: boolean } = {},
): { take: FolderImportEntry[]; skipped: number; reasons: string[] } {
  const maxFiles = options.maxFiles;
  const maxBytes = options.maxBytes ?? MAX_UPLOAD_BYTES;
  const allowSvg = options.allowSvg !== false;
  const take: FolderImportEntry[] = [];
  let skipped = 0;
  const reasons: string[] = [];
  for (const entry of entries) {
    const name = fileNameFromRelativePath(entry.relativePath || entry.name);
    if (shouldSkipImportFileName(name, allowSvg)) {
      skipped += 1;
      continue;
    }
    if (folderImportDepth(entry.relativePath) > MAX_FOLDER_IMPORT_DEPTH) {
      skipped += 1;
      continue;
    }
    if (!Number.isFinite(entry.size) || entry.size <= 0) {
      skipped += 1;
      reasons.push(`${name} is empty.`);
      continue;
    }
    if (entry.size > maxBytes) {
      skipped += 1;
      reasons.push(folderFileTooLargeReason(name));
      continue;
    }
    if (typeof maxFiles === 'number' && take.length >= maxFiles) {
      skipped += 1;
      continue;
    }
    take.push({
      ...entry,
      name,
      type: logoMimeFromName(name, entry.type),
    });
  }
  return { take, skipped, reasons };
}

export function describeFolderImport(added: number, skipped: number, noun = 'file'): string {
  const one = noun;
  const many = `${noun}s`;
  if (added === 0 && skipped === 0) return `No ${many} were in that folder.`;
  if (added === 0) return `No ${many} imported. Skipped ${skipped}.`;
  if (skipped === 0) return `Imported ${added} ${added === 1 ? one : many}.`;
  return `Imported ${added} ${added === 1 ? one : many}. Skipped ${skipped}.`;
}

export type LocalFolderImportFile = {
  name: string;
  relativePath: string;
  dataUrl: string;
  kind?: string | null;
  category?: string | null;
};

export function parseLocalFolderImportResponse(
  ok: boolean,
  body: unknown,
): { path?: string; files: LocalFolderImportFile[]; error?: string } {
  if (!ok || !body || typeof body !== 'object') {
    return {
      files: [],
      error: 'Path import runs on local Admin Studio (localhost). Upload files or a folder instead.',
    };
  }
  const data = body as { ok?: unknown; error?: unknown; path?: unknown; files?: unknown };
  if (typeof data.error === 'string' && data.ok !== true) {
    return { files: [], error: data.error };
  }
  if (data.ok !== true || !Array.isArray(data.files)) {
    return {
      files: [],
      error: 'Path import runs on local Admin Studio (localhost). Upload files or a folder instead.',
    };
  }
  const files = data.files.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Partial<LocalFolderImportFile>;
    if (!row.name || !row.dataUrl) return [];
    return [
      {
        name: String(row.name),
        relativePath: String(row.relativePath ?? row.name),
        dataUrl: String(row.dataUrl),
        kind: typeof row.kind === 'string' ? row.kind : null,
        category: typeof (row as { category?: unknown }).category === 'string'
          ? String((row as { category: string }).category)
          : null,
      },
    ];
  });
  return {
    path: typeof data.path === 'string' ? data.path : undefined,
    files,
  };
}
