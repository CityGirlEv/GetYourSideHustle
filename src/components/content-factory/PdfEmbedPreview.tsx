import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FileWarning } from "lucide-react";

function pdfViewerSrc(url: string): string {
  if (url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  const base = url.split("#")[0]!;
  return `${base}#view=FitH&toolbar=0&navpanes=0`;
}

/** Inline PDF preview — iframe with open-in-tab fallback. */
export function PdfEmbedPreview({
  url,
  title,
  compact = false,
  className = "",
}: {
  url: string;
  title: string;
  compact?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const heightPx = compact ? 208 : 288;
  const src = useMemo(() => pdfViewerSrc(url), [url]);
  const textSize = compact ? "text-[10px]" : "text-xs";

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div
        className="w-full rounded-md border border-border/60 bg-white overflow-hidden"
        style={{ height: heightPx, minHeight: heightPx }}
      >
        {!failed ? (
          <iframe
            src={src}
            title={title}
            className="w-full h-full border-0 block bg-white"
            style={{ height: heightPx, minHeight: heightPx }}
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            className={`flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground ${textSize}`}
          >
            <FileWarning className="h-8 w-8 opacity-60" />
            <p>Inline preview is not available in this browser.</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline"
            >
              Open PDF in new tab
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline ${textSize}`}
      >
        Open PDF in new tab
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
