import {
  LOCAL_FOLDER_IMPORT_PATH,
  isLoopbackHost,
  localFolderPathError,
  normalizeLocalFolderPath,
  parseLocalFolderImportResponse,
  type LocalFolderImportFile,
} from './localFolder';

export function canImportTypedLocalFolder(hostname = typeof window === 'undefined' ? '' : window.location.hostname): boolean {
  return isLoopbackHost(hostname);
}

export async function requestLocalFolderImport(
  rawPath: string,
  hostname = typeof window === 'undefined' ? '' : window.location.hostname,
): Promise<{ path?: string; files: LocalFolderImportFile[]; error?: string }> {
  const path = normalizeLocalFolderPath(rawPath);
  const pathError = localFolderPathError(path);
  if (pathError) return { files: [], error: pathError };
  if (!canImportTypedLocalFolder(hostname)) {
    return {
      files: [],
      error: 'Path import runs on local Admin Studio (localhost). Choose a folder instead.',
    };
  }
  try {
    const res = await fetch(LOCAL_FOLDER_IMPORT_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    const body = await res.json().catch(() => null);
    return parseLocalFolderImportResponse(res.ok, body);
  } catch {
    return {
      files: [],
      error: 'Could not read that folder from this computer. Choose a folder instead.',
    };
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}
