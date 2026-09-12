/** Shared limits for guide note attachments (client + copy). */
export const GUIDE_NOTE_ATTACHMENT_MAX_BYTES = 25_000_000;

export function guideNoteAttachmentMaxMbLabel(
  maxBytes: number = GUIDE_NOTE_ATTACHMENT_MAX_BYTES,
): string {
  return String(Math.round(maxBytes / 1_000_000));
}

export const GUIDE_NOTE_ATTACHMENT_ACCEPT =
  ".png,.jpg,.jpeg,.gif,.webp,.svg,.bmp,.heic,.mp4,.webm,.mov,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv";
