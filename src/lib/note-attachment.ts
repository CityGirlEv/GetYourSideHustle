import { uploadTestEvidence } from "@/lib/test-evidence";

/** Stored attachment metadata saved on a note entry. */
export interface NoteAttachmentMeta {
  attachment_path: string;
  attachment_name: string;
}

/** Upload a file and register it so it stays linked to the note entry. */
export async function saveNoteAttachment(
  userId: string,
  testId: string,
  file: File,
): Promise<NoteAttachmentMeta> {
  const uploaded = await uploadTestEvidence(userId, testId, file);
  const { cloudRegisterEvidence } = await import("@/lib/cloud-sync");
  await cloudRegisterEvidence({
    test_id: testId,
    storage_path: uploaded.path,
    file_name: uploaded.name,
    size: uploaded.size,
  });
  return {
    attachment_path: uploaded.path,
    attachment_name: uploaded.name,
  };
}

export function noteTextForSave(text: string, attachmentName?: string | null): string {
  const trimmed = text.trim();
  if (trimmed) return trimmed;
  if (attachmentName?.trim()) return `Attachment: ${attachmentName.trim()}`;
  return "";
}
