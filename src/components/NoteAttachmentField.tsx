import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  EVIDENCE_ACCEPT_ATTR,
  EVIDENCE_HELP_TEXT,
  uploadTestEvidence,
} from "@/lib/test-evidence";
import { toast } from "sonner";

/** Optional file attachment for QA/dev notes and status dialogs. */
export function NoteAttachmentField({
  file,
  onFileChange,
  userId,
  disabled,
  label = "Attachment (optional)",
  immediateUpload,
  testId,
  onUploaded,
}: {
  file?: File | null;
  onFileChange?: (file: File | null) => void;
  userId: string | null;
  disabled?: boolean;
  label?: string;
  /** When set, uploads to test evidence as soon as a file is chosen. */
  immediateUpload?: boolean;
  testId?: string;
  onUploaded?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const controlled = onFileChange != null;
  const blocked = disabled || busy || !userId;

  async function handleChange(next: File | null) {
    if (immediateUpload && next) {
      if (!userId || !testId) {
        toast.error("Sign in to attach a file.");
        return;
      }
      setBusy(true);
      try {
        await uploadTestEvidence(userId, testId, next);
        toast.success(`Uploaded ${next.name}`);
        onUploaded?.();
      } catch (err) {
        toast.error(`Upload failed: ${(err as Error).message}`);
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
      return;
    }
    onFileChange?.(next);
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept={EVIDENCE_ACCEPT_ATTR}
        disabled={blocked}
        onChange={(e) => {
          void handleChange(e.target.files?.[0] ?? null);
          if (!immediateUpload) return;
          e.target.value = "";
        }}
        className="block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground disabled:opacity-60"
      />
      {controlled && file && (
        <p className="text-[11px] text-muted-foreground">
          Will upload: <span className="font-mono">{file.name}</span>
        </p>
      )}
      {busy && (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
        </p>
      )}
      {!userId && (
        <p className="text-[11px] text-amber-700">Sign in to attach a file.</p>
      )}
      <p className="text-[10px] text-muted-foreground leading-snug">{EVIDENCE_HELP_TEXT}</p>
    </div>
  );
}
