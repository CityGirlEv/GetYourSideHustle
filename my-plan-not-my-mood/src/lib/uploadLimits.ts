/** Product mockups are often well over 2 MB. Keep a generous browser-local cap. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = '20 MB';

export function fileTooLargeMessage(noun = 'Files'): string {
  return `${noun} must be ${MAX_UPLOAD_LABEL} or smaller.`;
}

export function folderFileTooLargeReason(name: string): string {
  return `${name} is larger than ${MAX_UPLOAD_LABEL}.`;
}
