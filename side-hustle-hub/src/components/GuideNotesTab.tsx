import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Download, Paperclip, Pencil, Trash2, Upload } from "lucide-react";
import { ApiError } from "../lib/api";
import { formatAuditUpdatedAt } from "../lib/gysh-audit";
import {
  canViewAttachmentInline,
  openAttachmentBlob,
} from "../lib/gysh-attachments";
import { base64ToBlob, fileToBase64, formatFileSize } from "../lib/gysh-tasks";
import {
  GUIDE_NOTE_ATTACHMENT_ACCEPT,
  GUIDE_NOTE_ATTACHMENT_MAX_BYTES,
  guideNoteAttachmentMaxMbLabel,
} from "../lib/guide-note-limits";
import {
  createGuideNote,
  deleteGuideNote,
  deleteGuideNoteAttachment,
  fetchGuideNoteAttachmentContent,
  fetchGuideNotes,
  updateGuideNote,
  uploadGuideNoteAttachment,
  type GuideNote,
  type GuideNoteAttachment,
} from "../lib/guide-notes-api";

function noteStamp(note: GuideNote): string {
  const when = formatAuditUpdatedAt(note.updatedAt || note.createdAt);
  const who = note.authorName.trim() || "Member";
  return when ? `${who} · ${when}` : who;
}

function attachmentStamp(att: GuideNoteAttachment): string {
  const when = formatAuditUpdatedAt(att.createdAt);
  const who = att.uploadedByName.trim() || "Member";
  return when ? `${who} · ${when}` : who;
}

export function GuideNotesTab({
  guideId,
  actorUserId,
  actorName,
  isAdmin = false,
  isLoggedIn = false,
  onGoToLogin,
  refreshKey = 0,
}: {
  guideId: string;
  actorUserId?: string;
  actorName?: string;
  isAdmin?: boolean;
  isLoggedIn?: boolean;
  onGoToLogin?: () => void;
  /** Increment after external writes (e.g. Pending popup) so notes reload. */
  refreshKey?: number;
}) {
  const fileInputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState<GuideNote[]>([]);
  const [attachments, setAttachments] = useState<GuideNoteAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [attachDescription, setAttachDescription] = useState("");

  const canManage = useCallback(
    (ownerUserId: string) => {
      if (isAdmin) return true;
      const me = String(actorUserId || "").trim();
      return Boolean(me) && me === String(ownerUserId || "").trim();
    },
    [actorUserId, isAdmin],
  );

  const reload = useCallback(async () => {
    if (!isLoggedIn || !guideId) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchGuideNotes(guideId);
      setNotes(data.notes);
      setAttachments(data.attachments);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Could not load notes");
    } finally {
      setLoading(false);
    }
  }, [guideId, isLoggedIn]);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey]);

  if (!isLoggedIn) {
    return (
      <div className="guide-notes-tab" data-testid="launch-guide-notes">
        <p className="gysh-section-panel__lede">
          Sign in to add notes and attachments for this guide.
        </p>
        {onGoToLogin ? (
          <button type="button" className="btn btn-primary" onClick={onGoToLogin}>
            Log in
          </button>
        ) : null}
      </div>
    );
  }

  const addNote = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    setError("");
    try {
      const note = await createGuideNote(guideId, text);
      setNotes((prev) => [...prev, note]);
      setDraft("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Could not save note");
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    if (!editingId || busy) return;
    const text = editDraft.trim();
    if (!text) {
      setError("Note text is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const note = await updateGuideNote(editingId, text);
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
      setEditingId(null);
      setEditDraft("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Could not update note");
    } finally {
      setBusy(false);
    }
  };

  const removeNote = async (id: string) => {
    if (busy) return;
    if (!window.confirm("Delete this note?")) return;
    setBusy(true);
    setError("");
    try {
      await deleteGuideNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setAttachments((prev) => prev.filter((a) => a.noteId !== id));
      if (editingId === id) {
        setEditingId(null);
        setEditDraft("");
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Could not delete note");
    } finally {
      setBusy(false);
    }
  };

  const onPickFile = async (file: File | null) => {
    if (!file || busy) return;
    if (file.size > GUIDE_NOTE_ATTACHMENT_MAX_BYTES) {
      setError(`File too large (max ${guideNoteAttachmentMaxMbLabel()}MB).`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const contentBase64 = await fileToBase64(file);
      const attachment = await uploadGuideNoteAttachment({
        guideId,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        contentBase64,
        description: attachDescription.trim(),
      });
      setAttachments((prev) => [...prev, attachment]);
      setAttachDescription("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Could not upload attachment",
      );
    } finally {
      setBusy(false);
    }
  };

  const openAttachment = async (att: GuideNoteAttachment) => {
    setBusy(true);
    setError("");
    try {
      const remote = await fetchGuideNoteAttachmentContent(att.id);
      const blob = base64ToBlob(remote.contentBase64, remote.mimeType || att.mimeType);
      openAttachmentBlob(blob, {
        name: att.name,
        mimeType: att.mimeType,
        mode: canViewAttachmentInline(att.mimeType, att.name) ? "view" : "download",
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Could not open file");
    } finally {
      setBusy(false);
    }
  };

  const removeAttachment = async (id: string) => {
    if (busy) return;
    if (!window.confirm("Delete this attachment?")) return;
    setBusy(true);
    setError("");
    try {
      await deleteGuideNoteAttachment(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Could not delete file");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="guide-notes-tab" data-testid="launch-guide-notes">
      <p className="gysh-section-panel__lede">
        Capture ideas, follow-ups, and files for this side-hustle. Your notes show your name and date/time.
        {isAdmin ? " As admin, you can edit or delete anyone’s notes." : " You can edit or delete your own notes."}{" "}
        Attachments up to {guideNoteAttachmentMaxMbLabel()}MB.
      </p>

      {error ? (
        <p className="guide-notes-tab__error" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? <p className="guide-notes-tab__muted">Loading notes…</p> : null}

      <ul className="guide-notes-tab__list" aria-label="Guide notes">
        {notes.map((note) => {
          const mine = canManage(note.authorUserId);
          const editing = editingId === note.id;
          return (
            <li
              key={note.id}
              className={`guide-notes-tab__item${mine ? " is-mine" : ""}`}
              data-testid={`guide-note-${note.id}`}
            >
              <div className="guide-notes-tab__meta">
                <time dateTime={note.updatedAt || note.createdAt}>{noteStamp(note)}</time>
                {mine ? (
                  <div className="guide-notes-tab__actions">
                    {!editing ? (
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={busy}
                        onClick={() => {
                          setEditingId(note.id);
                          setEditDraft(note.body);
                        }}
                        aria-label={`Edit note by ${note.authorName}`}
                      >
                        <Pencil size={14} /> Edit
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={busy}
                      onClick={() => void removeNote(note.id)}
                      aria-label={`Delete note by ${note.authorName}`}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                ) : null}
              </div>
              {editing ? (
                <div className="guide-notes-tab__edit">
                  <textarea
                    className="text-input guide-notes-tab__textarea"
                    rows={6}
                    value={editDraft}
                    disabled={busy}
                    onChange={(e) => setEditDraft(e.target.value)}
                    aria-label="Edit note text"
                  />
                  <div className="guide-notes-tab__actions">
                    <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void saveEdit()}>
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={busy}
                      onClick={() => {
                        setEditingId(null);
                        setEditDraft("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="guide-notes-tab__body">{note.body}</p>
              )}
            </li>
          );
        })}
      </ul>

      {!loading && notes.length === 0 ? (
        <p className="guide-notes-tab__muted">No notes yet — add the first one below.</p>
      ) : null}

      <label className="guide-notes-tab__composer">
        <span>
          Add note as <strong>{actorName?.trim() || "you"}</strong>
          <span className="guide-notes-tab__muted"> — name + date/time saved with the note</span>
        </span>
        <textarea
          className="text-input guide-notes-tab__textarea"
          rows={6}
          value={draft}
          disabled={busy}
          placeholder="Write a note…"
          aria-label="Add a new guide note"
          onChange={(e) => setDraft(e.target.value)}
        />
      </label>
      <button
        type="button"
        className="btn btn-primary"
        disabled={busy || !draft.trim()}
        onClick={() => void addNote()}
        data-testid="guide-note-add"
      >
        Add note
      </button>

      <div className="guide-notes-tab__attachments" data-testid="guide-note-attachments">
        <h4 className="guide-notes-tab__attach-title">
          <Paperclip size={16} aria-hidden /> Attachments
        </h4>
        <ul className="guide-notes-tab__attach-list" aria-label="Guide note attachments">
          {attachments.map((att) => (
            <li key={att.id} className="guide-notes-tab__attach-row" data-testid={`guide-note-att-${att.id}`}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="guide-notes-tab__attach-name">{att.name}</div>
                <div className="guide-notes-tab__muted">
                  {attachmentStamp(att)} · {formatFileSize(att.size)}
                  {att.description ? ` — ${att.description}` : ""}
                </div>
              </div>
              <div className="guide-notes-tab__actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={busy}
                  onClick={() => void openAttachment(att)}
                  aria-label={`Download ${att.name}`}
                >
                  <Download size={14} /> Open
                </button>
                {canManage(att.uploadedByUserId) ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={busy}
                    onClick={() => void removeAttachment(att.id)}
                    aria-label={`Delete ${att.name}`}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        <label className="guide-notes-tab__composer">
          <span>Attachment description (optional)</span>
          <input
            className="text-input"
            value={attachDescription}
            disabled={busy}
            placeholder="What is this file?"
            onChange={(e) => setAttachDescription(e.target.value)}
          />
        </label>
        <input
          ref={fileRef}
          id={fileInputId}
          type="file"
          accept={GUIDE_NOTE_ATTACHMENT_ACCEPT}
          hidden
          onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          className="btn btn-outline"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          data-testid="guide-note-attach"
        >
          <Upload size={14} /> Attach file (max {guideNoteAttachmentMaxMbLabel()}MB)
        </button>
      </div>
    </div>
  );
}
