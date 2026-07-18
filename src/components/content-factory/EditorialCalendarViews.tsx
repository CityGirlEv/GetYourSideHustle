import type { ReactNode } from "react";
import { ExternalLink, PenLine, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  checklistItemsForDate,
  monthGridCells,
  type DailyChecklistItem,
} from "@/lib/content-factory/editorial-daily-checklist";
import type { EditorialCalendarEvent } from "@/lib/content-factory/weekly-editorial-schedule";
import { parseIsoDate } from "@/lib/content-factory/weekly-editorial-schedule";
import {
  contentTypeIcon,
  ContentStatusBadge,
} from "@/components/content-factory/content-factory-ui";
import type { ContentAssetType, ContentDraftStatus } from "@/lib/content-factory/types";
import { EditorialCalendarActionLinks } from "@/components/content-factory/EditorialCalendarLinks";
import { FacebookInviteDaySteps } from "@/components/content-factory/FacebookInviteDaySteps";
import { FacebookAdLaunchPanel } from "@/components/content-factory/FacebookAdLaunchPanel";
import { FacebookPostCalendarPanel } from "@/components/content-factory/FacebookPostCalendarPanel";
import { ImagePromptCalendarPanel } from "@/components/content-factory/ImagePromptCalendarPanel";
import { LeadMagnetPdfPanel } from "@/components/content-factory/LeadMagnetPdfPanel";
import { WorkbookFacebookPostsPanel } from "@/components/content-factory/WorkbookFacebookPostsPanel";
import {
  hideStandaloneWorkbookPersonalPost,
  shouldShowWorkbookFacebookPostsPanel,
} from "@/lib/content-factory/workbook-facebook-posts";
import {
  calendarTaskStorageId,
  isCalendarTaskDone,
} from "@/lib/content-factory/editorial-calendar-progress";
import { articleImagePromptSlot } from "@/lib/content-factory/facebook-post-calendar";
import { getDraftFromMap } from "@/lib/content-factory/editorial-calendar-links";
import { editorialMilestoneLabel } from "@/lib/content-factory/weekly-editorial-schedule";
import { isFacebookAdLaunchEvent } from "@/lib/content-factory/facebook-ad-launch";

export type CalendarViewMode = "weekly" | "daily" | "monthly";

const TYPE_SURFACE: Record<ContentAssetType, string> = {
  article: "bg-indigo-100 text-indigo-950 border-indigo-300/50 dark:bg-indigo-500/15 dark:text-indigo-50 dark:border-indigo-500/25",
  facebook_post: "bg-sky-100 text-sky-950 border-sky-300/50 dark:bg-sky-500/15 dark:text-sky-50 dark:border-sky-500/25",
  newsletter: "bg-emerald-100 text-emerald-950 border-emerald-300/50 dark:bg-emerald-500/15 dark:text-emerald-50 dark:border-emerald-500/25",
  lead_magnet: "bg-pink-100 text-pink-950 border-pink-300/50 dark:bg-pink-500/15 dark:text-pink-50 dark:border-pink-500/25",
  faq: "bg-violet-100 text-violet-950 border-violet-300/50 dark:bg-violet-500/15 dark:text-violet-50 dark:border-violet-500/25",
  image_prompt: "bg-amber-100 text-amber-950 border-amber-300/50 dark:bg-amber-500/15 dark:text-amber-50 dark:border-amber-500/25",
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
        <TabsTrigger value="monthly" className="text-xs px-3">
          Month
        </TabsTrigger>
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
  const weekdayLabels = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

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
                  isToday ? "text-primary font-bold" : "text-muted-foreground"
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
  onHeroUploaded,
  onPdfSaved,
}: {
  isoDate: string;
  events: EditorialCalendarEvent[];
  draftBySlot: Map<string, CalendarDraftRef>;
  batchId: string | null;
  today: string;
  mapDraftStatus: (status: ContentDraftStatus) => string;
  completedEvents?: Record<string, boolean>;
  onToggleCompleted?: (storageId: string, legacyId?: string) => void;
  onHeroUploaded?: () => void;
  onPdfSaved?: () => void;
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
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-semibold">
            Today
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {items.map((item) => {
          if (hideStandaloneWorkbookPersonalPost(item.event)) {
            return null;
          }
          return (
          <DayAgendaRow
            key={item.event.id}
            item={item}
            draft={draftBySlot.get(`${item.event.type}:${item.event.slotIndex}`)}
            draftBySlot={draftBySlot}
            batchId={batchId}
            mapDraftStatus={mapDraftStatus}
            isCompleted={isCalendarTaskDone(completedEvents, item.event)}
            onToggleCompleted={onToggleCompleted}
            completedEvents={completedEvents}
            onHeroUploaded={onHeroUploaded}
            onPdfSaved={onPdfSaved}
          />
          );
        })}
      </ul>
    </div>
  );
}

function DayAgendaRow({
  item,
  draft,
  draftBySlot,
  batchId,
  mapDraftStatus,
  isCompleted,
  onToggleCompleted,
  completedEvents = {},
  onHeroUploaded,
  onPdfSaved,
}: {
  item: DailyChecklistItem;
  draft?: CalendarDraftRef;
  draftBySlot: Map<string, CalendarDraftRef>;
  batchId: string | null;
  mapDraftStatus: (status: ContentDraftStatus) => string;
  isCompleted: boolean;
  onToggleCompleted?: (storageId: string, legacyId?: string) => void;
  completedEvents?: Record<string, boolean>;
  onHeroUploaded?: () => void;
  onPdfSaved?: () => void;
}) {
  const Icon = contentTypeIcon(item.event.type);
  const isProduce = item.event.milestone === "produce";
  const milestoneLabel = editorialMilestoneLabel(
    item.event.type,
    item.event.milestone,
    item.event.slotIndex,
  );
  const surface = TYPE_SURFACE[item.event.type];
  const articleImageSlot =
    item.event.type === "article" && isProduce
      ? articleImagePromptSlot(item.event.slotIndex)
      : null;
  const articleImageDraft =
    articleImageSlot !== null
      ? getDraftFromMap(draftBySlot, "image_prompt", articleImageSlot)
      : undefined;

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
            onChange={() =>
              onToggleCompleted?.(
                calendarTaskStorageId(item.event),
                item.event.id,
              )
            }
            className="h-4 w-4 rounded border-input bg-background text-indigo-500 focus:ring-indigo-500/50 cursor-pointer"
            title={isCompleted ? "Mark active" : "Mark done"}
          />
        </div>
        <div className="shrink-0 min-w-[5rem]">
          <div className={`text-sm font-bold tabular-nums text-primary ${isCompleted ? "line-through opacity-70" : ""}`}>
            {item.timeLabel}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {milestoneLabel}
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
              <FacebookInviteDaySteps
                eventDate={item.event.date}
                completedEvents={completedEvents}
                onToggleCompleted={onToggleCompleted}
              />
            )}
            {draft && <ContentStatusBadge status={draft.status} />}
            {draft && (
              <span className="text-[10px] text-muted-foreground">{mapDraftStatus(draft.status)}</span>
            )}
          </div>
          {isFacebookAdLaunchEvent(item.event) && (
            <FacebookAdLaunchPanel
              milestone={item.event.milestone}
              eventDate={item.event.date}
              completedEvents={completedEvents}
              onToggleCompleted={onToggleCompleted}
            />
          )}
          {item.event.slotIndex !== 99 && (
            <EditorialCalendarActionLinks
              event={item.event}
              draft={draft}
              batchId={batchId}
              draftBySlot={draftBySlot}
            />
          )}
          {item.event.type === "facebook_post" &&
            item.event.milestone === "launch" &&
            !isFacebookAdLaunchEvent(item.event) && (
            <FacebookPostCalendarPanel
              event={item.event}
              draft={draft}
              draftBySlot={draftBySlot}
              batchId={batchId}
              onHeroUploaded={onHeroUploaded}
            />
          )}
          {articleImageSlot !== null && articleImageDraft && (
            <ImagePromptCalendarPanel
              event={{
                ...item.event,
                type: "image_prompt",
                slotIndex: articleImageSlot,
              }}
              draft={articleImageDraft}
              draftBySlot={draftBySlot}
              batchId={batchId}
              onHeroUploaded={onHeroUploaded}
            />
          )}
          {item.event.type === "lead_magnet" && (
            <LeadMagnetPdfPanel
              draft={draft}
              batchId={batchId}
              onSaved={onPdfSaved}
            />
          )}
          {shouldShowWorkbookFacebookPostsPanel(item.event) && (
            <WorkbookFacebookPostsPanel
              draftBySlot={draftBySlot}
              batchId={batchId}
              onPostsSynced={onPdfSaved}
            />
          )}
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

export function EditorialMonthGrid({
  monthStart,
  eventsByDate,
  today,
  selectedDay,
  onSelectDay,
  renderEventChip,
}: {
  monthStart: Date;
  eventsByDate: Map<string, EditorialCalendarEvent[]>;
  today: string;
  selectedDay: string;
  onSelectDay: (isoDate: string) => void;
  renderEventChip: (event: EditorialCalendarEvent) => ReactNode;
}) {
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const cells = monthGridCells(monthStart);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-2">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="text-center font-semibold text-[10px] uppercase text-muted-foreground py-1"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map(({ isoDate, inMonth }) => {
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
              className={`min-h-[7.5rem] text-left border rounded-lg p-2 flex flex-col transition-all ${
                !inMonth
                  ? "border-border/30 bg-muted/20 opacity-50"
                  : isSelected
                    ? "border-indigo-500/50 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                    : isToday
                      ? "border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/40"
                      : "border-border/60 bg-background/30 hover:border-primary/20"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span
                  className={`text-[11px] font-bold tabular-nums ${
                    isToday ? "text-primary font-bold" : inMonth ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {dayNum}
                </span>
                {inMonth && (produceCount > 0 || launchCount > 0) && (
                  <span className="text-[8px] text-muted-foreground tabular-nums">
                    {produceCount > 0 && `${produceCount}P`}
                    {produceCount > 0 && launchCount > 0 && "·"}
                    {launchCount > 0 && `${launchCount}L`}
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 max-h-24">
                {inMonth && dayEvents.length > 0 ? (
                  dayEvents.slice(0, 3).map(renderEventChip)
                ) : inMonth ? (
                  <span className="text-[9px] text-muted-foreground/70">No tasks</span>
                ) : null}
                {inMonth && dayEvents.length > 3 && (
                  <span className="text-[9px] text-muted-foreground font-medium">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function parseIsoDayNumber(isoDate: string): number {
  return Number(isoDate.split("-")[2]);
}
