import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Loader2, Save, X, MessageSquarePlus } from "lucide-react";
import {
  cloudFetchNotes, cloudAddNoteEntry, cloudUpdateNoteEntry,
  type NoteEntry, type NoteKind,
} from "@/lib/cloud-sync";
import { toast } from "sonner";

function fmt(at: string): string {
  try {
    return new Date(at).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  } catch { return at; }
}

/** Modal that shows the full chronological note thread for a test.
 *  Any signed-in user can append a new note. Only the author of an
 *  entry can edit its text. Each entry is timestamped + attributed. */
export function NoteThreadDialog({
  open, onOpenChange, testId, testTitle, currentUserId, initialKind = "qa",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  testId: string;
  testTitle?: string;
  currentUserId: string | null;
  initialKind?: NoteKind;
}) {
  const [kind, setKind] = useState<NoteKind>(initialKind);
  const [qa, setQa] = useState<NoteEntry[]>([]);
  const [dev, setDev] = useState<NoteEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingAt, setEditingAt] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) setKind(initialKind); }, [open, initialKind]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [q, d] = await Promise.all([
        cloudFetchNotes(testId, "qa"),
        cloudFetchNotes(testId, "dev"),
      ]);
      if (cancelled) return;
      setQa(q); setDev(d); setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, testId]);

  const list = kind === "qa" ? qa : dev;
  const setList = kind === "qa" ? setQa : setDev;

  async function addNote() {
    if (!draft.trim() || busy) return;
    setBusy(true);
    const next = await cloudAddNoteEntry(testId, kind, draft);
    setBusy(false);
    if (next) {
      setList(next);
      setDraft("");
      toast.success("Note added");
    }
  }

  async function saveEdit(at: string) {
    if (!editingText.trim() || busy) return;
    setBusy(true);
    const next = await cloudUpdateNoteEntry(testId, kind, at, editingText);
    setBusy(false);
    if (next) {
      setList(next);
      setEditingAt(null);
      setEditingText("");
      toast.success("Note updated");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setEditingAt(null); setDraft(""); } onOpenChange(v); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notes — {testTitle || testId}</DialogTitle>
          <DialogDescription>
            Anyone signed in can add a note. You can only edit notes you authored.
            All entries are timestamped and attributed.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={kind} onValueChange={(v) => { setEditingAt(null); setDraft(""); setKind(v as NoteKind); }}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="qa">QA notes ({qa.length})</TabsTrigger>
            <TabsTrigger value="dev">Dev notes ({dev.length})</TabsTrigger>
          </TabsList>

          {(["qa", "dev"] as NoteKind[]).map((k) => (
            <TabsContent key={k} value={k} className="space-y-3">
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading notes…
                  </div>
                )}
                {!loading && list.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No notes yet — be the first to add one.</p>
                )}
                {!loading && list.map((e) => {
                  const mine = currentUserId != null && e.author_id === currentUserId;
                  const isEditing = editingAt === e.at;
                  return (
                    <div key={e.at + e.author_id} className="rounded-md border border-border bg-muted/30 p-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1 text-[11px] text-muted-foreground">
                        <span>
                          <span className="font-semibold text-foreground">{e.author_name || "Unknown"}</span>
                          {" · "}
                          <span>{fmt(e.at)}</span>
                          {mine && <span className="ml-1 text-emerald-600">(you)</span>}
                        </span>
                        {mine && !isEditing && (
                          <Button
                            size="sm" variant="ghost" className="h-6 px-1.5 text-[11px]"
                            onClick={() => { setEditingAt(e.at); setEditingText(e.text); }}
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
                            <Button size="sm" variant="outline" onClick={() => { setEditingAt(null); setEditingText(""); }}>
                              <X className="h-3.5 w-3.5 mr-1" /> Cancel
                            </Button>
                            <Button size="sm" disabled={busy || !editingText.trim()} onClick={() => saveEdit(e.at)}>
                              <Save className="h-3.5 w-3.5 mr-1" /> Save edit
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{e.text}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <label className="text-xs font-semibold">Add a {k === "qa" ? "QA" : "Dev"} note</label>
                <Textarea
                  rows={3}
                  value={kind === k ? draft : ""}
                  onChange={(ev) => setDraft(ev.target.value)}
                  placeholder={k === "qa" ? "Observations, repro details, env…" : "What changed, what to retest, PR/commit…"}
                  className="text-sm"
                />
                <div className="flex justify-end">
                  <Button size="sm" disabled={busy || !draft.trim() || !currentUserId} onClick={addNote}>
                    <MessageSquarePlus className="h-3.5 w-3.5 mr-1" /> Add note
                  </Button>
                </div>
                {!currentUserId && (
                  <p className="text-[11px] text-destructive">Sign in to add notes.</p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}