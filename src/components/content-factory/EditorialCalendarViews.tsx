import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, PenLine, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  checklistItemsForDate,
  type DailyChecklistItem,
} from "@/lib/content-factory/editorial-daily-checklist";
import { facebookPageUrl, facebookPostAdminSearch } from "@/lib/content-factory/facebook-post-copy";
import type { EditorialCalendarEvent } from "@/lib/content-factory/weekly-editorial-schedule";
import { parseIsoDate } from "@/lib/content-factory/weekly-editorial-schedule";
import {
  contentTypeIcon,
  ContentStatusBadge,
} from "@/components/content-factory/content-factory-ui";
import type { ContentAssetType, ContentDraftStatus } from "@/lib/content-factory/types";

export type CalendarViewMode = "weekly" | "daily";

const TYPE_SURFACE: Record<ContentAssetType, string> = {
  article: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  facebook_post: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  newsletter: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  lead_magnet: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  faq: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  image_prompt: "bg-amber-500/10 text-foreground/90 border-amber-500/20",
};

export function CalendarViewToggle({
  view,
  onViewChange,
}: {
  view: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
}) {
  return (
    <Tabs
      value={view}
      onValueChange={(value) => onViewChange(value as CalendarViewMode)}
    >
      <TabsList className="h-8">
        <TabsTrigger value="weekly" className="text-xs px-3">
          Week
        </TabsTrigger>
        <TabsTrigger value="daily" className="text-xs px-3">
          Day
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function EditorialWeekGrid({
  weekDates,
  eventsByDate,
  today,
  selectedDay,
  onSelectDay,
  renderEventChip,
}: {
  weekDates: string[];
  eventsByDate: Map<string, EditorialCalendarEvent[]>;
  today: string;
  selectedDay: string;
  onSelectDay: (isoDate: string) => void;
  renderEventChip: (event: EditorialCalendarEvent) => ReactNode;
}) {
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekdayLabels.map((label) => (
        <div
          key={label}
          className="text-center font-semibold text-[10px] uppercase text-muted-foreground py-1"
        >
          {label}
        </div>
      ))}

      {weekDates.map((isoDate) => {
        const dayEvents = eventsByDate.get(isoDate) ?? [];
        const produceCount = dayEvents.filter((e) => e.milestone === "produce").length;
        const launchCount = dayEvents.filter((e) => e.milestone === "launch").length;
        const dayNum = parseIsoDayNumber(isoDate);
        const isToday = isoDate === today;
        const isSelected = isoDate === selectedDay;

        return (
          <button
            key={isoDate}
            type="button"
            onClick={() => onSelectDay(isoDate)}
            className={`min-h-[10rem] text-left border rounded-lg p-2 flex flex-col transition-all ${
              isSelected
                ? "border-indigo-500/50 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                : isToday
                  ? "border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/40"
                  : "border-border/60 bg-background/30 hover:border-primary/20"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span
                className={`text-[11px] font-bold tabular-nums ${
                  isToday ? "text-indigo-300" : "text-muted-foreground"
                }`}
              >
                {dayNum}
              </span>
              {(produceCount > 0 || launchCount > 0) && (
                <span className="text-[8px] text-muted-foreground tabular-nums">
                  {produceCount > 0 && `${produceCount}P`}
                  {produceCount > 0 && launchCount > 0 && "·"}
                  {launchCount > 0 && `${launchCount}L`}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 max-h-40">
              {dayEvents.length > 0 ? (
                dayEvents.map(renderEventChip)
              ) : (
                <span className="text-[9px] text-muted-foreground/70">No tasks</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function EditorialDayAgenda({
  isoDate,
  events,
  draftBySlot,
  batchId,
  today,
  mapDraftStatus,
  completedEvents = {},
  onToggleCompleted,
}: {
  isoDate: string;
  events: EditorialCalendarEvent[];
  draftBySlot: Map<string, { status: ContentDraftStatus; title: string }>;
  batchId: string | null;
  today: string;
  mapDraftStatus: (status: ContentDraftStatus) => string;
  completedEvents?: Record<string, boolean>;
  onToggleCompleted?: (eventId: string) => void;
}) {
  const items = checklistItemsForDate(events, isoDate);
  const isToday = isoDate === today;

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-background/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">No editorial tasks scheduled for this day.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{items.length} scheduled action{items.length === 1 ? "" : "s"}</span>
        {isToday && (
          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-indigo-300 font-semibold">
            Today
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <DayAgendaRow
            key={item.event.id}
            item={item}
            draft={draftBySlot.get(`${item.event.type}:${item.event.slotIndex}`)}
            batchId={batchId}
            mapDraftStatus={mapDraftStatus}
            isCompleted={!!completedEvents[item.event.id]}
            onToggleCompleted={onToggleCompleted}
          />
        ))}
      </ul>
    </div>
  );
}

function DayAgendaRow({
  item,
  draft,
  batchId,
  mapDraftStatus,
  isCompleted,
  onToggleCompleted,
}: {
  item: DailyChecklistItem;
  draft?: { status: ContentDraftStatus; title: string };
  batchId: string | null;
  mapDraftStatus: (status: ContentDraftStatus) => string;
  isCompleted: boolean;
  onToggleCompleted?: (eventId: string) => void;
}) {
  const Icon = contentTypeIcon(item.event.type);
  const isProduce = item.event.milestone === "produce";
  const surface = TYPE_SURFACE[item.event.type];
  const pageUrl = facebookPageUrl();

  return (
    <li
      className={`rounded-lg border px-3 py-2.5 transition-opacity ${surface} ${
        isProduce ? "border-dashed" : "border-solid"
      } ${isCompleted ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 mt-1">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => onToggleCompleted?.(item.event.id)}
            className="h-4 w-4 rounded border-input bg-background text-indigo-500 focus:ring-indigo-500/50 cursor-pointer"
            title={isCompleted ? "Mark active" : "Mark done"}
          />
        </div>
        <div className="shrink-0 min-w-[5rem]">
          <div className={`text-sm font-bold tabular-nums text-indigo-200 ${isCompleted ? "line-through opacity-70" : ""}`}>
            {item.timeLabel}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {isProduce ? "Produce" : "Launch"}
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            {isProduce ? (
              <PenLine className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <Rocket className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className={`font-semibold text-sm ${isCompleted ? "line-through opacity-70" : ""}`}>
              {item.event.title}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{item.event.detail}</p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {item.event.slotIndex === 99 && (
              <>
                {pageUrl ? (
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" asChild>
                    <a href={pageUrl} target="_blank" rel="noopener noreferrer">
                      Open Facebook Page
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                ) : (
                  <span className="text-[10px] text-muted-foreground">
                    Set PUBLIC_FACEBOOK_PAGE_URL in env to link
                  </span>
                )}
              </>
            )}
            {draft && <ContentStatusBadge status={draft.status} />}
            {item.event.type === "facebook_post" && item.event.slotIndex !== 99 && (
              <Link
                to="/admin/facebook-posts"
                search={facebookPostAdminSearch(batchId, item.event.slotIndex)}
              >
                <Button size="sm" variant="outline" className="h-7 text-[11px]">
                  Copy post
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
            {draft && (
              <span className="text-[10px] text-muted-foreground">{mapDraftStatus(draft.status)}</span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export function WeekDayPicker({
  weekDates,
  selectedDay,
  today,
  onSelectDay,
}: {
  weekDates: string[];
  selectedDay: string;
  today: string;
  onSelectDay: (isoDate: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {weekDates.map((isoDate) => {
        const isToday = isoDate === today;
        const isSelected = isoDate === selectedDay;
        return (
          <Button
            key={isoDate}
            size="sm"
            variant={isSelected ? "default" : "outline"}
            className={`h-7 text-[10px] px-2 ${isToday && !isSelected ? "border-indigo-500/40" : ""}`}
            onClick={() => onSelectDay(isoDate)}
          >
            {parseIsoDate(isoDate).toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
            })}
          </Button>
        );
      })}
    </div>
  );
}

function parseIsoDayNumber(isoDate: string): number {
  return Number(isoDate.split("-")[2]);
}
