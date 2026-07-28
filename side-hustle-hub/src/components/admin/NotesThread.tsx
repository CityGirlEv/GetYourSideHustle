import { Trash2 } from "lucide-react";
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
}: {
  entry: NoteEntry;
  actor: string;
  draft?: string;
  disabled: boolean;
  onEditDraft?: (noteId: string, text: string) => void;
  onDeleteNote?: (noteId: string) => void;
}) {
  const editable = canEditNoteEntry(entry, actor) && !!onEditDraft;
  const value = draft !== undefined ? draft : entry.text;
  const stamp = formatNoteEntryStamp(entry);
  const whenIso = entry.updatedAt || entry.createdAt;
  const canDelete = editable && !!onDeleteNote;

  return (
    <li className={`notes-thread__item${editable ? " notes-thread__item--mine" : ""}`}>
      <div className="notes-thread__meta">
        <time className="notes-thread__stamp" dateTime={whenIso} title={stamp}>
          {stamp}
        </time>
        {canDelete && (
          <button
            type="button"
            className="btn btn-outline notes-thread__delete"
            style={{ padding: "2px 8px", fontSize: "0.8125rem" }}
            disabled={disabled}
            onClick={() => onDeleteNote?.(entry.id)}
            title="Delete your note (Save to persist)"
            aria-label={`Delete note by ${stamp}`}
          >
            <Trash2 size={12} /> Delete
          </button>
        )}
      </div>
      {editable ? (
        <textarea
          className="text-input"
          rows={2}
          value={value}
          disabled={disabled}
          aria-label={`Edit note by ${stamp}`}
          onChange={(e) => onEditDraft?.(entry.id, e.target.value)}
          style={{ resize: "vertical", width: "100%" }}
        />
      ) : (
        <div className="notes-thread__body">
          <MarkdownLinkText text={entry.text} />
        </div>
      )}
    </li>
  );
}
