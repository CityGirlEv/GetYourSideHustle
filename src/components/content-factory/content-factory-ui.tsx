import {
  BookOpen,
  Facebook,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CONTENT_STATUS_LABELS,
  CONTENT_TYPE_LABELS,
  type ContentAssetType,
  type ContentDraftStatus,
} from "@/lib/content-factory/types";

export function contentTypeIcon(type: ContentAssetType) {
  switch (type) {
    case "article":
      return FileText;
    case "facebook_post":
      return Facebook;
    case "newsletter":
      return Mail;
    case "faq":
      return HelpCircle;
    case "lead_magnet":
      return BookOpen;
    case "image_prompt":
      return ImageIcon;
  }
}

export function ContentTypeBadge({ type }: { type: ContentAssetType }) {
  const Icon = contentTypeIcon(type);
  return (
    <Badge variant="secondary" className="gap-1 text-[10px] uppercase tracking-wide">
      <Icon className="h-3 w-3" />
      {CONTENT_TYPE_LABELS[type]}
    </Badge>
  );
}

export function ContentStatusBadge({ status }: { status: ContentDraftStatus }) {
  const className =
    status === "published"
      ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
      : status === "approved"
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
        : status === "scheduled"
          ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
          : status === "pending_review"
            ? "bg-amber-100 text-amber-900 border-amber-400/50 dark:bg-amber-500/15 dark:text-amber-100 dark:border-amber-500/30"
            : status === "rejected"
              ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
              : "bg-muted text-muted-foreground border-border";

  return (
    <Badge variant="outline" className={className}>
      {CONTENT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function formatContentTimestamp(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
