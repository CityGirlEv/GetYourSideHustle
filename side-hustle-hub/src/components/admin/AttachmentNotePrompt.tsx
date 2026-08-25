/**
 * Shared “what is this file?” prompt shown after picking attachments.
 */
export function AttachmentNotePrompt({
  open,
  fileNames,
  note,
  onNoteChange,
  onConfirm,
  onCancel,
  busy = false,
  testId,
}: {
  open: boolean;
  fileNames: string[];
  note: string;
  onNoteChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  testId?: string;
}) {
  if (!open || fileNames.length === 0) return null;
  return (
    <div
      className="attachment-note-prompt"
      role="dialog"
      aria-modal="true"
      aria-label="Attachment note"
      data-testid={testId ?? "attachment-note-prompt"}
      onClick={(e) => e.stopPropagation()}
    >
      <strong>Add a note for this upload</strong>
      <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--text-primary)" }}>
        Optional — describe what the image/video is (channel art, screenshot, trailer, etc.).
      </p>
      <ul className="attachment-note-prompt__files">
        {fileNames.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontWeight: 700, fontSize: "0.8125rem" }}>
        Note
        <input
          className="text-input"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="e.g. YouTube channel art 2560×1440"
          maxLength={500}
          disabled={busy}
          autoFocus
          data-testid={testId ? `${testId}-input` : "attachment-note-input"}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onConfirm();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
        />
      </label>
      <div className="attachment-note-prompt__actions">
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={onConfirm}
          data-testid={testId ? `${testId}-confirm` : "attachment-note-confirm"}
        >
          {busy ? "Uploading…" : "Upload"}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={busy}
          onClick={onCancel}
          data-testid={testId ? `${testId}-cancel` : "attachment-note-cancel"}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function normalizeAttachmentNote(raw: string | null | undefined): string {
  return String(raw || "").trim().slice(0, 500);
}
