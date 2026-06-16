import type { NoteMeta } from "@/lib/test-plan";
import { NoteEntryMeta } from "@/components/NoteEntryMeta";

/** Inline QA/dev note field with author + timestamp on every displayed note. */
export function InlineTestNote({
  label,
  labelClassName,
  headerExtra,
  middle,
  savedText,
  draftText,
  meta,
  currentUserId,
  onOpenHistory,
  onChange,
  placeholder,
  textareaClassName,
  rows = 2,
  historyKind = "qa",
}: {
  label: React.ReactNode;
  labelClassName?: string;
  headerExtra?: React.ReactNode;
  middle?: React.ReactNode;
  savedText: string;
  draftText: string;
  meta?: NoteMeta | null;
  currentUserId: string | null;
  onOpenHistory: () => void;
  onChange: (value: string) => void;
  placeholder: string;
  textareaClassName: string;
  rows?: number;
  historyKind?: "qa" | "dev";
}) {
  const saved = savedText.trim();
  const hasSaved = saved.length > 0;
  const displayMeta =
    meta ?? (hasSaved ? { author_id: "", author_name: "Legacy note", at: "" } : null);
  const mine = !!displayMeta && currentUserId != null && displayMeta.author_id === currentUserId;
  const draftDiffersFromSaved = hasSaved && draftText !== savedText;
  const showReadOnlySaved = hasSaved && (!mine || draftDiffersFromSaved);
  const showMetaOnTextarea = hasSaved && mine && !draftDiffersFromSaved;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <label className={labelClassName}>{label}</label>
        <button
          type="button"
          onClick={onOpenHistory}
          className="text-[10px] underline text-primary hover:text-primary/80"
          title="View full note history (with author + timestamp)"
        >
          View full history
        </button>
        {headerExtra}
      </div>

      {middle}

      {showReadOnlySaved && displayMeta && (
        <div className="rounded-md border border-border bg-muted/30 p-2 mb-1.5">
          <NoteEntryMeta
            authorName={displayMeta.author_name}
            authorId={displayMeta.author_id}
            at={displayMeta.at}
            isYou={mine}
            className="mb-1"
          />
          <p className="text-xs whitespace-pre-wrap text-foreground">{saved}</p>
        </div>
      )}

      {showReadOnlySaved && (
        <p className="text-[10px] text-muted-foreground mb-1">
          Add a {historyKind === "qa" ? "QA" : "dev"} note
        </p>
      )}

      {showMetaOnTextarea && displayMeta && (
        <NoteEntryMeta
          authorName={displayMeta.author_name}
          authorId={displayMeta.author_id}
          at={displayMeta.at}
          isYou
          className="mb-1"
        />
      )}

      <textarea
        value={draftText}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={textareaClassName}
      />
    </div>
  );
}
