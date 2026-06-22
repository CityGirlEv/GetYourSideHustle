import { PenLine, Rocket } from "lucide-react";
import {
  buildDailyChecklistItems,
  groupDailyChecklistByDate,
} from "@/lib/content-factory/editorial-daily-checklist";
import type { EditorialCalendarEvent } from "@/lib/content-factory/weekly-editorial-schedule";
import {
  contentTypeIcon,
  ContentStatusBadge,
} from "@/components/content-factory/content-factory-ui";
import type { ContentDraftStatus } from "@/lib/content-factory/types";
import { EditorialCalendarActionLinks } from "@/components/content-factory/EditorialCalendarLinks";
import { ImagePromptCalendarPanel } from "@/components/content-factory/ImagePromptCalendarPanel";
import { LeadMagnetPdfPanel } from "@/components/content-factory/LeadMagnetPdfPanel";
import { FacebookInviteDaySteps } from "@/components/content-factory/FacebookInviteDaySteps";
import type { CalendarDraftRef } from "@/lib/content-factory/editorial-calendar-links";

export function EditorialDailyChecklist({
  events,
  draftBySlot,
  batchId,
  today = formatToday(),
  completedEvents = {},
  onToggleCompleted,
  onHeroUploaded,
  onPdfSaved,
}: {
  events: EditorialCalendarEvent[];
  draftBySlot: Map<string, CalendarDraftRef>;
  batchId: string | null;
  today?: string;
  completedEvents?: Record<string, boolean>;
  onToggleCompleted?: (eventId: string) => void;
  onHeroUploaded?: () => void;
  onPdfSaved?: () => void;
}) {
  const days = groupDailyChecklistByDate(buildDailyChecklistItems(events));

  return (
    <div className="space-y-4">
      {days.map(({ date, label, items }) => (
        <div key={date}>
          <h3
            className={`text-[10px] font-bold uppercase tracking-wide mb-2 ${
              date === today ? "text-primary font-bold" : "text-muted-foreground"
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
                        <span className={`shrink-0 tabular-nums text-[10px] font-bold text-primary min-w-[4.5rem] ${
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
                      <div className="pl-[5rem] space-y-1">
                        {item.event.slotIndex === 99 && (
                          <FacebookInviteDaySteps
                            compact
                            completedEvents={completedEvents}
                            onToggleCompleted={onToggleCompleted}
                          />
                        )}
                        {draft && (
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <ContentStatusBadge status={draft.status} />
                          </div>
                        )}
                        {item.event.slotIndex !== 99 && (
                          <EditorialCalendarActionLinks
                            event={item.event}
                            draft={draft}
                            batchId={batchId}
                            draftBySlot={draftBySlot}
                            compact
                          />
                        )}
                        {item.event.type === "image_prompt" && (
                          <ImagePromptCalendarPanel
                            event={item.event}
                            draft={draft}
                            draftBySlot={draftBySlot}
                            batchId={batchId}
                            compact
                            onHeroUploaded={onHeroUploaded}
                          />
                        )}
                        {item.event.type === "lead_magnet" && (
                          <LeadMagnetPdfPanel
                            draft={draft}
                            batchId={batchId}
                            compact
                            onSaved={onPdfSaved}
                          />
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
