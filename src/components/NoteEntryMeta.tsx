import { displayNoteAuthor, displayNoteTimestamp } from "@/lib/note-format";
import { cn } from "@/lib/utils";

/** Author name + timestamp line shown above each note entry. */
export function NoteEntryMeta({
  authorName,
  authorId,
  at,
  isYou,
  className,
}: {
  authorName?: string | null;
  /** Used to infer "Unknown author" when name is missing but id is present */
  authorId?: string | null;
  at?: string | null;
  isYou?: boolean;
  className?: string;
}) {
  const name = displayNoteAuthor(authorName, authorId);
  const when = displayNoteTimestamp(at);
  return (
    <div className={cn("text-[11px] text-muted-foreground", className)}>
      <span className="font-semibold text-foreground">{name}</span>
      {" · "}
      <span>{when}</span>
      {isYou && <span className="ml-1 text-emerald-600">(you)</span>}
    </div>
  );
}
