import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Trash2, X } from "lucide-react";
import {
  canEditNoteEntry,
  formatNoteEntryStamp,
  parseNoteEntries,
  type NoteEntry,
  type PriorNoteAttribution,
} from "../../lib/gysh-note-entries";
import { MarkdownLinkText } from "./MarkdownLinkText";

type NotesThreadProps = {
  rawNotes: string;
  actor: string;
  /** Author + date for older plain-text notes (usually last updated by / at). */
  priorAttribution?: PriorNoteAttribution;
  /** noteId → draft text for own editable notes */
  editDrafts?: Record<string, string>;
  newDraft?: string;
  onEditDraft?: (noteId: string, text: string) => void;
  onNewDraft?: (text: string) => void;
  /** Delete own note (clears text; persists on Save). */
  onDeleteNote?: (noteId: string) => void;
  disabled?: boolean;
  newPlaceholder?: string;
  label?: string;
  requiredHint?: string;
  textareaId?: string;
  invalid?: boolean;
};

export function NotesThread({
  rawNotes,
  actor,
  priorAttribution,
  editDrafts = {},
  newDraft = "",
  onEditDraft,
  onNewDraft,
  onDeleteNote,
  disabled = false,
  newPlaceholder = "Add a note… (Save to persist)",
  label = "Notes",
  requiredHint,
  textareaId,
  invalid = false,
}: NotesThreadProps) {
  const entries = parseNoteEntries(rawNotes, priorAttribution);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  const openEntry =
    openNoteId == null ? null : entries.find((e) => e.id === openNoteId) ?? null;

  return (
    <div className="notes-thread">
      <div className="notes-thread__label">
        {label}
        {requiredHint ? <span className="notes-thread__hint">{requiredHint}</span> : null}
      </div>

      {entries.length > 0 && (
        <ul className="notes-thread__list" aria-label="Saved notes">
          {entries.map((entry) => (
            <NoteEntryRow
              key={entry.id}
              entry={entry}
              actor={actor}
              draft={editDrafts[entry.id]}
              disabled={disabled}
              onEditDraft={onEditDraft}
              onDeleteNote={onDeleteNote}
              onOpen={() => setOpenNoteId(entry.id)}
            />
          ))}
        </ul>
      )}

      <label className="notes-thread__composer">
        <span className="notes-thread__composer-label">
          Add note as <strong>{actor || "you"}</strong>
          <span className="notes-thread__composer-hint"> — name + date saved with the note</span>
        </span>
        <textarea
          id={textareaId}
          className="text-input"
          rows={2}
          value={newDraft}
          disabled={disabled || !onNewDraft}
          placeholder={newPlaceholder}
          aria-label="Add a new note"
          onChange={(e) => onNewDraft?.(e.target.value)}
          style={
            invalid
              ? { borderColor: "rgba(155,47,40,0.55)", resize: "vertical", width: "100%" }
              : { resize: "vertical", width: "100%" }
          }
        />
      </label>

      {openEntry && (
        <NotePopup
          entry={openEntry}
          actor={actor}
          draft={editDrafts[openEntry.id]}
          disabled={disabled}
          onEditDraft={onEditDraft}
          onDeleteNote={onDeleteNote}
          onClose={() => setOpenNoteId(null)}
        />
      )}
    </div>
  );
}

function NoteEntryRow({
  entry,
  actor,
  draft,
  disabled,
  onEditDraft,
  onDeleteNote,
  onOpen,
}: {
  entry: NoteEntry;
  actor: string;
  draft?: string;
  disabled: boolean;
  onEditDraft?: (noteId: string, text: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onOpen: () => void;
}) {
  const editable = canEditNoteEntry(entry, actor) && !!onEditDraft;
  const value = draft !== undefined ? draft : entry.text;
  const stamp = formatNoteEntryStamp(entry);
  const whenIso = entry.updatedAt || entry.createdAt;
  const canDelete = editable && !!onDeleteNote;
  const preview = value.trim() || "(empty note)";

  return (
    <li className={`notes-thread__item${editable ? " notes-thread__item--mine" : ""}`}>
      <div className="notes-thread__meta">
        <time className="notes-thread__stamp" dateTime={whenIso} title={stamp}>
          {stamp}
        </time>
        <div className="notes-thread__meta-actions">
          <button
            type="button"
            className="btn btn-outline notes-thread__open"
            onClick={onOpen}
            title="Open full note"
            aria-label={`Open full note by ${stamp}`}
          >
            <Maximize2 size={12} /> Open
          </button>
          {canDelete && (
            <button
              type="button"
              className="btn btn-outline notes-thread__delete"
              disabled={disabled}
              onClick={() => onDeleteNote?.(entry.id)}
              title="Delete your note (Save to persist)"
              aria-label={`Delete note by ${stamp}`}
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      </div>
      <div
        className="notes-thread__preview"
        role="button"
        tabIndex={0}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) return;
          onOpen();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        title="Click to read full note"
        aria-label={`Open full note by ${stamp}`}
      >
        {editable ? (
          <span className="notes-thread__body">{preview}</span>
        ) : (
          <span className="notes-thread__body">
            <MarkdownLinkText text={entry.text || "(empty note)"} />
          </span>
        )}
      </div>
    </li>
  );
}

function NotePopup({
  entry,
  actor,
  draft,
  disabled,
  onEditDraft,
  onDeleteNote,
  onClose,
}: {
  entry: NoteEntry;
  actor: string;
  draft?: string;
  disabled: boolean;
  onEditDraft?: (noteId: string, text: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const editable = canEditNoteEntry(entry, actor) && !!onEditDraft;
  const value = draft !== undefined ? draft : entry.text;
  const stamp = formatNoteEntryStamp(entry);
  const canDelete = editable && !!onDeleteNote;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const node = (
    <div
      className="notes-thread-popup"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="notes-thread-popup__panel glass"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notes-thread-popup__header">
          <h3 id={titleId} className="notes-thread-popup__title">
            Note — {stamp}
          </h3>
          <button
            type="button"
            className="btn btn-outline notes-thread-popup__close"
            onClick={onClose}
            aria-label="Close note"
          >
            <X size={16} />
          </button>
        </div>

        {editable ? (
          <textarea
            className="text-input notes-thread-popup__editor"
            value={value}
            disabled={disabled}
            aria-label={`Edit note by ${stamp}`}
            onChange={(e) => onEditDraft?.(entry.id, e.target.value)}
            autoFocus
          />
        ) : (
          <div className="notes-thread-popup__body">
            <MarkdownLinkText text={entry.text || "(empty note)"} />
          </div>
        )}

        <div className="notes-thread-popup__footer">
          {canDelete && (
            <button
              type="button"
              className="btn btn-outline"
              disabled={disabled}
              onClick={() => {
                onDeleteNote?.(entry.id);
                onClose();
              }}
              title="Delete your note (Save to persist)"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
