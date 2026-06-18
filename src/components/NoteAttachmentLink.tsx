import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { getTestEvidenceUrl } from "@/lib/test-evidence";

/** Opens a note-linked attachment in a new tab. */
export function NoteAttachmentLink({
  path,
  name,
  className = "text-[11px]",
}: {
  path: string;
  name: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTestEvidenceUrl(path).then((signed) => {
      if (!cancelled) setUrl(signed);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return (
    <div className={`flex items-center gap-1.5 mt-1.5 ${className}`}>
      <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline truncate"
          title={name}
        >
          {name}
        </a>
      ) : (
        <span className="text-muted-foreground truncate" title={name}>
          {name}
        </span>
      )}
    </div>
  );
}
