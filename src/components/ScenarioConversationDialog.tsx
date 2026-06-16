import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquarePlus, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  addScenarioConversationNote,
  fetchScenarioConversationNotes,
  updateScenarioConversationNote,
  type ScenarioConversationNote,
} from "@/lib/scenario-conversation-notes";

import { formatNoteTimestamp } from "@/lib/note-format";
import { NoteEntryMeta } from "@/components/NoteEntryMeta";

export function ScenarioConversationDialog({
  open,
  onOpenChange,
  scenarioId,
  scenarioCode,
  currentUserId,
  canAddNotes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarioId: string;
  scenarioCode: string;
  currentUserId: string | null;
  /** Admin and assigned agents can add notes; others read-only. */
  canAddNotes: boolean;
}) {
  const [notes, setNotes] = useState<ScenarioConversationNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !scenarioId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const rows = await fetchScenarioConversationNotes(scenarioId);
      if (!cancelled) {
        setNotes(rows);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, scenarioId]);

  async function reloadNotes() {
    const rows = await fetchScenarioConversationNotes(scenarioId);
    setNotes(rows);
  }

  async function addNote() {
    if (!draft.trim() || busy || !canAddNotes) return;
    setBusy(true);
    const created = await addScenarioConversationNote(scenarioId, draft);
    setBusy(false);
    if (created) {
      await reloadNotes();
      setDraft("");
      toast.success("Note added");
    }
  }

  async function saveEdit(noteId: string) {
    if (!editingText.trim() || busy) return;
    setBusy(true);
    const ok = await updateScenarioConversationNote(scenarioId, noteId, editingText);
    setBusy(false);
    if (ok) {
      await reloadNotes();
      setEditingId(null);
      setEditingText("");
      toast.success("Note updated");
    }
  }

  function closeDialog(next: boolean) {
    if (!next) {
      setEditingId(null);
      setEditingText("");
      setDraft("");
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agent conversation — {scenarioCode}</DialogTitle>
          <DialogDescription>
            Internal notes about outreach and conversations with the person who created this
            scenario. Visible to administrators and assigned agents only. You can only edit notes
            you wrote.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading notes…
            </div>
          )}
          {!loading && notes.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No conversation notes yet.
              {canAddNotes ? " Add the first note below." : ""}
            </p>
          )}
          {!loading &&
            notes.map((note) => {
              const mine = currentUserId != null && note.author_id === currentUserId;
              const isEditing = editingId === note.id;
              const edited = note.updated_at !== note.created_at;
              return (
                <div key={note.id} className="rounded-md border border-border bg-muted/30 p-2.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <NoteEntryMeta
                      authorName={note.author_name}
                      authorId={note.author_id}
                      at={note.created_at}
                      isYou={mine}
                    />
                    {edited && (
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        edited {formatNoteTimestamp(note.updated_at)}
                      </span>
                    )}
                    {mine && !isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1.5 text-[11px]"
                        onClick={() => {
                          setEditingId(note.id);
                          setEditingText(note.body);
                        }}
                      >
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        rows={3}
                        value={editingText}
                        onChange={(ev) => setEditingText(ev.target.value)}
                        className="text-sm"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setEditingText("");
                          }}
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={busy || !editingText.trim()}
                          onClick={() => saveEdit(note.id)}
                        >
                          <Save className="h-3.5 w-3.5 mr-1" /> Save edit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{note.body}</p>
                  )}
                </div>
              );
            })}
        </div>

        {canAddNotes && (
          <div className="space-y-2 border-t border-border pt-3">
            <label className="text-xs font-semibold">Add a conversation note</label>
            <Textarea
              rows={3}
              value={draft}
              onChange={(ev) => setDraft(ev.target.value)}
              placeholder="Call summary, follow-up plan, questions for the consumer…"
              className="text-sm"
              maxLength={10000}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={busy || !draft.trim() || !currentUserId}
                onClick={addNote}
              >
                <MessageSquarePlus className="h-3.5 w-3.5 mr-1" /> Add note
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => closeDialog(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
