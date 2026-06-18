import { Link } from "@tanstack/react-router";
import { PenLine, Rocket, ExternalLink } from "lucide-react";
import {
  buildDailyChecklistItems,
  groupDailyChecklistByDate,
} from "@/lib/content-factory/editorial-daily-checklist";
import { facebookPostAdminSearch, facebookPageUrl } from "@/lib/content-factory/facebook-post-copy";
import type { EditorialCalendarEvent } from "@/lib/content-factory/weekly-editorial-schedule";
import {
  contentTypeIcon,
  ContentStatusBadge,
} from "@/components/content-factory/content-factory-ui";
import type { ContentDraftStatus } from "@/lib/content-factory/types";

export function EditorialDailyChecklist({
  events,
  draftBySlot,
  batchId,
  today = formatToday(),
  completedEvents = {},
  onToggleCompleted,
}: {
  events: EditorialCalendarEvent[];
  draftBySlot: Map<string, { status: ContentDraftStatus; title: string }>;
  batchId: string | null;
  today?: string;
  completedEvents?: Record<string, boolean>;
  onToggleCompleted?: (eventId: string) => void;
}) {
  const days = groupDailyChecklistByDate(buildDailyChecklistItems(events));
  const pageUrl = facebookPageUrl();

  return (
    <div className="space-y-4">
      {days.map(({ date, label, items }) => (
        <div key={date}>
          <h3
            className={`text-[10px] font-bold uppercase tracking-wide mb-2 ${
              date === today ? "text-indigo-300" : "text-muted-foreground"
            }`}
          >
            {label}
            {date === today ? " · Today" : ""}
          </h3>
          <ul className="space-y-1.5">
            {items.map((item) => {
              const draft = draftBySlot.get(
                `${item.event.type}:${item.event.slotIndex}`,
              );
              const Icon = contentTypeIcon(item.event.type);
              const isProduce = item.event.milestone === "produce";
              const isCompleted = !!completedEvents[item.event.id];

              return (
                <li
                  key={item.event.id}
                  className={`rounded-md border border-border/60 bg-background/40 px-2 py-1.5 text-[11px] transition-opacity ${
                    isCompleted ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => onToggleCompleted?.(item.event.id)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-input bg-background text-indigo-500 focus:ring-indigo-500/50 cursor-pointer"
                      title={isCompleted ? "Mark active" : "Mark done"}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`shrink-0 tabular-nums text-[10px] font-bold text-indigo-300/90 min-w-[4.5rem] ${
                          isCompleted ? "line-through opacity-70" : ""
                        }`}>
                          {item.timeLabel}
                        </span>
                        <div className="flex items-center gap-1 min-w-0">
                          {isProduce ? (
                            <PenLine className="h-3 w-3 shrink-0 text-muted-foreground" />
                          ) : (
                            <Rocket className="h-3 w-3 shrink-0 text-muted-foreground" />
                          )}
                          <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className={`font-semibold truncate ${
                            isCompleted ? "line-through opacity-70" : ""
                          }`}>{item.event.title}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 pl-[5rem]">
                        {isProduce ? "Produce" : "Launch"} · {item.event.detail}
                      </div>
                      <div className="pl-[5rem]">
                        {item.event.slotIndex === 99 && (
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {pageUrl ? (
                              <a
                                href={pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-[10px] text-sky-300 hover:text-sky-200 underline-offset-2 hover:underline"
                              >
                                Open Facebook Page
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">
                                Set PUBLIC_FACEBOOK_PAGE_URL in env to link
                              </span>
                            )}
                          </div>
                        )}
                        {draft && (
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <ContentStatusBadge status={draft.status} />
                            {item.event.type === "facebook_post" && item.event.slotIndex !== 99 && (
                              <Link
                                to="/admin/facebook-posts"
                                search={facebookPostAdminSearch(batchId, item.event.slotIndex)}
                                className="inline-flex items-center gap-0.5 text-[10px] text-sky-300 hover:text-sky-200 underline-offset-2 hover:underline"
                              >
                                Copy post
                                <ExternalLink className="h-2.5 w-2.5" />
                              </Link>
                            )}
                          </div>
                        )}
                        {!draft && item.event.type === "facebook_post" && item.event.slotIndex !== 99 && (
                          <Link
                            to="/admin/facebook-posts"
                            search={facebookPostAdminSearch(batchId, item.event.slotIndex)}
                            className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-sky-300 hover:text-sky-200 underline-offset-2 hover:underline"
                          >
                            Open post copy
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function formatToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
