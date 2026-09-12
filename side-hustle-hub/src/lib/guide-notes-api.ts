/**
 * Client API for per-guide notes + attachments.
 */
import { api } from "./api";
import { GUIDE_NOTE_ATTACHMENT_MAX_BYTES } from "./guide-note-limits";

export type GuideNote = {
  id: string;
  guideId: string;
  authorUserId: string;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type GuideNoteAttachment = {
  id: string;
  guideId: string;
  noteId: string | null;
  uploadedByUserId: string;
  uploadedByName: string;
  name: string;
  mimeType: string;
  size: number;
  description: string;
  createdAt: string;
  hasContent?: boolean;
};

export { GUIDE_NOTE_ATTACHMENT_MAX_BYTES };

export async function fetchGuideNotes(guideId: string): Promise<{
  notes: GuideNote[];
  attachments: GuideNoteAttachment[];
}> {
  const data = await api<{
    notes?: GuideNote[];
    attachments?: GuideNoteAttachment[];
  }>(`guide-notes?guideId=${encodeURIComponent(guideId)}`);
  return {
    notes: data.notes ?? [],
    attachments: data.attachments ?? [],
  };
}

export async function createGuideNote(guideId: string, text: string): Promise<GuideNote> {
  const data = await api<{ note: GuideNote }>("guide-notes", {
    method: "POST",
    body: { guideId, text },
  });
  return data.note;
}

export async function updateGuideNote(id: string, text: string): Promise<GuideNote> {
  const data = await api<{ note: GuideNote }>("guide-notes", {
    method: "PUT",
    body: { id, text },
  });
  return data.note;
}

export async function deleteGuideNote(id: string): Promise<void> {
  await api("guide-notes", { method: "DELETE", body: { id } });
}

export async function uploadGuideNoteAttachment(input: {
  guideId: string;
  noteId?: string;
  id?: string;
  name: string;
  mimeType: string;
  contentBase64: string;
  description?: string;
}): Promise<GuideNoteAttachment> {
  const data = await api<{ attachment: GuideNoteAttachment }>("guide-note-attachments", {
    method: "POST",
    body: input,
    timeoutMs: 180_000,
  });
  return data.attachment;
}

export async function fetchGuideNoteAttachmentContent(id: string): Promise<{
  name: string;
  mimeType: string;
  contentBase64: string;
}> {
  return api(`guide-note-attachments?id=${encodeURIComponent(id)}`, { timeoutMs: 180_000 });
}

export async function updateGuideNoteAttachmentDescription(
  id: string,
  description: string,
): Promise<GuideNoteAttachment> {
  const data = await api<{ attachment: GuideNoteAttachment }>("guide-note-attachments", {
    method: "PUT",
    body: { id, description },
  });
  return data.attachment;
}

export async function deleteGuideNoteAttachment(id: string): Promise<void> {
  await api("guide-note-attachments", { method: "DELETE", body: { id } });
}
