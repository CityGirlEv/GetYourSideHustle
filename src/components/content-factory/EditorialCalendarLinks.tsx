import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import {
  buildCalendarEventLinks,
  type CalendarDraftRef,
} from "@/lib/content-factory/editorial-calendar-links";
import type { EditorialCalendarEvent } from "@/lib/content-factory/weekly-editorial-schedule";

export function EditorialCalendarActionLinks({
  event,
  draft,
  batchId,
  draftBySlot,
  compact = false,
}: {
  event: EditorialCalendarEvent;
  draft?: CalendarDraftRef;
  batchId: string | null;
  draftBySlot: Map<string, CalendarDraftRef>;
  compact?: boolean;
}) {
  const links = buildCalendarEventLinks({ event, draft, batchId, draftBySlot });
  if (links.length === 0) return null;

  const className = compact
    ? "inline-flex items-center gap-0.5 text-[10px] text-primary font-medium hover:text-primary/80 underline-offset-2 hover:underline"
    : "inline-flex items-center gap-1 h-7 px-2 text-[11px] rounded-md border border-border/60 bg-background/40 hover:bg-background/70 text-primary font-medium hover:text-primary/80";

  return (
    <div className={`flex flex-wrap items-center ${compact ? "gap-1.5" : "gap-2"} pt-0.5`}>
      {links.map((link) => {
        if (!link.href) {
          return (
            <span
              key={link.label}
              className={`${className} cursor-default opacity-80 no-underline`}
              title={link.description ?? link.label}
            >
              {link.label}
            </span>
          );
        }

        return link.external ? (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            title={link.description ?? link.label}
          >
            {link.label}
            <ExternalLink className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
          </a>
        ) : link.href.startsWith("/admin/") && !link.href.includes("?") ? (
          <Link key={link.label} to={link.href as "/admin/articles"} className={className} title={link.description ?? link.label}>
            {link.label}
          </Link>
        ) : (
          <a
            key={link.label}
            href={link.href}
            className={className}
            title={link.description ?? link.label}
          >
            {link.label}
          </a>
        );
      })}
    </div>
  );
}
