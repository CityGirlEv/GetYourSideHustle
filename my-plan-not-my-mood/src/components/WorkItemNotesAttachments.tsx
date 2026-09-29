import React, { useRef, useState } from 'react';
import { Paperclip, Pencil, Plus, Trash2, Download } from 'lucide-react';
import { confirmDelete } from '../lib/confirmDelete';
import {
  addWorkNote,
  canModifyWorkNote,
  deleteWorkNote,
  formatWorkNoteWhen,
  parseWorkNotes,
  updateWorkNote,
  type WorkNoteActor,
} from '../lib/workNoteEntries';
import {
  WORK_ATTACHMENT_MAX_LABEL,
  canModifyWorkAttachment,
  fileToBase64,
  formatAttachmentSize,
  workAttachmentTooLarge,
  type WorkAttachmentKind,
  type WorkAttachmentMeta,
} from '../lib/workAttachments';
import {
  deleteWorkAttachment,
  uploadWorkAttachment,
  workAttachmentDownloadUrl,
} from '../lib/workAttachmentsApi';

export function WorkItemNotesAttachments({
  itemKind,
  itemId,
  itemTitle,
  notesRaw,
  attachments,
  actor,
  onNotesChange,
  onAttachmentsChange,
  testId,
}: {
  itemKind: WorkAttachmentKind;
  itemId: string;
  itemTitle: string;
  notesRaw: string;
  attachments: WorkAttachmentMeta[];
  actor: WorkNoteActor;
  onNotesChange: (next: string) => void;
  onAttachmentsChange: (next: WorkAttachmentMeta[]) => void;
  testId: string;
}) {
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const entries = parseWorkNotes(notesRaw);

  const addNote = () => {
    setError('');
    if (!draft.trim()) return;
    onNotesChange(addWorkNote(notesRaw, actor, draft));
    setDraft('');
  };

  const saveEdit = (noteId: string) => {
    setError('');
    const result = updateWorkNote(notesRaw, noteId, editText, actor);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onNotesChange(result.notes);
    setEditingId(null);
    setEditText('');
  };

  const removeNote = (noteId: string) => {
    setError('');
    const result = deleteWorkNote(notesRaw, noteId, actor);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onNotesChange(result.notes);
  };

  const onPickFile = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    setError('');
    const tooBig = workAttachmentTooLarge(file.size);
    if (tooBig) {
      setError(tooBig);
      return;
    }
    setBusy(true);
    try {
      const contentBase64 = await fileToBase64(file);
      const uploaded = await uploadWorkAttachment({
        itemKind,
        itemId,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        byteSize: file.size,
        uploadedBy: actor.name,
        uploadedByEmail: actor.email || undefined,
        contentBase64,
      });
      if (!uploaded.ok) {
        setError(uploaded.error);
        return;
      }
      onAttachmentsChange([...(attachments || []), uploaded.attachment]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeAttachment = async (attachment: WorkAttachmentMeta) => {
    if (!canModifyWorkAttachment(attachment, actor)) {
      setError('You can only remove your own attachments.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await deleteWorkAttachment(attachment.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onAttachmentsChange((attachments || []).filter((row) => row.id !== attachment.id));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3" data-testid={testId}>
      <div className="space-y-2">
        <p className="text-[10px] font-mono font-black uppercase tracking-wider text-[#6B5344]">
          Notes · author & timestamp
        </p>
        {entries.length === 0 ? (
          <p className="text-xs text-[#6B5344]">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => {
              const canEdit = canModifyWorkNote(entry, actor);
              const editing = editingId === entry.id;
              return (
                <li
                  key={entry.id}
                  className="rounded-xl border border-[#E8DFD2] bg-[#FFFCF7] p-3 space-y-2"
                  data-testid={`${testId}-note-${entry.id}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] font-bold text-[#1F1917]">
                      {entry.author}
                      <span className="font-medium text-[#6B5344]">
                        {' '}
                        · {formatWorkNoteWhen(entry.updatedAt || entry.createdAt)}
                        {entry.updatedAt && entry.updatedAt !== entry.createdAt ? ' (edited)' : ''}
                      </span>
                    </p>
                    {canEdit ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-[#E8DFD2] cursor-pointer"
                          aria-label={`Edit note by ${entry.author}`}
                          onClick={() => {
                            setEditingId(entry.id);
                            setEditText(entry.text);
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-[#E8DFD2] text-red-700 cursor-pointer"
                          aria-label={`Delete note by ${entry.author}`}
                          onClick={() => {
                            if (!confirmDelete()) return;
                            removeNote(entry.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {editing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full min-h-[6rem] rounded-xl border-2 border-[#E5DFD3] bg-white px-3 py-2 text-sm"
                        aria-label="Edit note"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(entry.id)}
                          className="min-h-[44px] px-3 rounded-xl bg-[#C2410C] text-white text-[10px] font-black uppercase border-2 border-[#1F1917] cursor-pointer"
                        >
                          Save note
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditText('');
                          }}
                          className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] text-[10px] font-black uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#1F1917] whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Add a note as ${actor.name}…`}
            className="w-full min-h-[6rem] rounded-xl border-2 border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-sm"
            aria-label={`Add note for ${itemTitle}`}
            data-testid={`${testId}-add`}
          />
          <button
            type="button"
            onClick={addNote}
            className="min-h-[44px] px-3 rounded-xl bg-[#1F1917] text-white text-[10px] font-black uppercase inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add note
          </button>
        </div>
      </div>

      <div className="space-y-2 border-t border-[#E8DFD2] pt-3">
        <p className="text-[10px] font-mono font-black uppercase tracking-wider text-[#6B5344]">
          Attachments · up to {WORK_ATTACHMENT_MAX_LABEL}
        </p>
        {(attachments || []).length === 0 ? (
          <p className="text-xs text-[#6B5344]">No attachments yet.</p>
        ) : (
          <ul className="space-y-2">
            {(attachments || []).map((file) => (
              <li
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E8DFD2] bg-white px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1F1917] truncate">{file.name}</p>
                  <p className="text-[10px] text-[#6B5344]">
                    {formatAttachmentSize(file.byteSize)} · {file.uploadedBy} ·{' '}
                    {formatWorkNoteWhen(file.uploadedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={workAttachmentDownloadUrl(file.id)}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-[#E8DFD2] cursor-pointer"
                    aria-label={`Download ${file.name}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  {canModifyWorkAttachment(file, actor) ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (!confirmDelete()) return;
                        void removeAttachment(file);
                      }}
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-[#E8DFD2] text-red-700 cursor-pointer disabled:opacity-50"
                      aria-label={`Remove ${file.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          data-testid={`${testId}-file`}
          onChange={(e) => void onPickFile(e.target.files)}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] text-[10px] font-black uppercase inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Paperclip className="w-3.5 h-3.5" /> {busy ? 'Attaching…' : 'Attach file'}
        </button>
      </div>

      {error ? (
        <p className="text-xs font-bold text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
