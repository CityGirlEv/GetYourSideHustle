import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContentStatusBadge, ContentTypeBadge } from "@/components/content-factory/content-factory-ui";
import type { ContentDraft } from "@/lib/content-factory/types";

export function ContentFactoryDraftDialog({
  draft,
  mode,
  open,
  onOpenChange,
  onSave,
  busy,
}: {
  draft: ContentDraft | null;
  mode: "view" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (values: Pick<ContentDraft, "title" | "excerpt" | "body">) => void;
  busy?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!draft || !open) return;
    setTitle(draft.title);
    setExcerpt(draft.excerpt);
    setBody(draft.body);
  }, [draft, open]);

  if (!draft) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "view" ? "View draft" : "Edit draft"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-2">
            <ContentTypeBadge type={draft.type} />
            <ContentStatusBadge status={draft.status} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Title</label>
            {mode === "view" ? (
              <p className="text-sm font-medium">{draft.title}</p>
            ) : (
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Excerpt</label>
            {mode === "view" ? (
              <p className="text-sm text-muted-foreground">{draft.excerpt}</p>
            ) : (
              <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Body</label>
            {mode === "view" ? (
              <pre className="text-xs whitespace-pre-wrap rounded-md border border-border bg-muted/20 p-3 max-h-80 overflow-y-auto">
                {draft.body}
              </pre>
            ) : (
              <Textarea
                rows={12}
                className="font-mono text-xs"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            )}
          </div>

          {draft.rejectionReason ? (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
              Rejection reason: {draft.rejectionReason}
            </div>
          ) : null}
        </div>

        {mode === "edit" ? (
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="grad-indigo"
              disabled={busy}
              onClick={() => onSave?.({ title, excerpt, body })}
            >
              Save changes
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
