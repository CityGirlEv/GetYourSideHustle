import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
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
import { toast } from "sonner";
import { LeadMagnetPdfPanel } from "@/components/content-factory/LeadMagnetPdfPanel";

export function ContentFactoryDraftDialog({
  draft,
  mode,
  open,
  onOpenChange,
  onSave,
  busy,
  batchId,
  onPdfSaved,
}: {
  draft: ContentDraft | null;
  mode: "view" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (values: Pick<ContentDraft, "title" | "excerpt" | "body">) => void;
  busy?: boolean;
  batchId?: string | null;
  onPdfSaved?: () => void;
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

  const isImagePrompt = draft.type === "image_prompt";
  const isLeadMagnet = draft.type === "lead_magnet";
  const promptText = isImagePrompt ? (mode === "view" ? draft.body : body).trim() : "";

  const copyPrompt = async () => {
    if (!promptText) {
      toast.error("No prompt text to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(promptText);
      toast.success("Image prompt copied");
    } catch {
      toast.error("Could not copy prompt");
    }
  };

  const dialogTitle =
    isImagePrompt && mode === "view"
      ? "Image prompt"
      : mode === "view"
        ? "View draft"
        : "Edit draft";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <ContentTypeBadge type={draft.type} />
            <ContentStatusBadge status={draft.status} />
            {isImagePrompt && promptText && mode === "view" ? (
              <button
                type="button"
                onClick={() => void copyPrompt()}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline ml-auto"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy prompt
              </button>
            ) : null}
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-muted-foreground">
                {isImagePrompt ? "Prompt text" : "Body"}
              </label>
              {isImagePrompt && promptText && mode === "edit" ? (
                <button
                  type="button"
                  onClick={() => void copyPrompt()}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy prompt
                </button>
              ) : null}
            </div>
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

          {isLeadMagnet ? (
            <LeadMagnetPdfPanel
              draft={draft}
              batchId={batchId}
              liveSource={
                mode === "edit"
                  ? { title, excerpt, body }
                  : undefined
              }
              onSaved={onPdfSaved}
            />
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
