import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import {
  listContentFactoryBatchesAdmin,
  listContentFactoryDraftsAdmin,
} from "@/lib/content-factory.functions";
import {
  CONTENT_STATUS_LABELS,
  CONTENT_TYPE_LABELS,
  type ContentAssetType,
  type ContentDraftStatus,
} from "@/lib/content-factory/types";
import { contentTypeIcon } from "@/components/content-factory/content-factory-ui";
import { EditorialDailyChecklist } from "@/components/content-factory/EditorialDailyChecklist";
import {
  CalendarViewToggle,
  EditorialDayAgenda,
  EditorialWeekGrid,
  WeekDayPicker,
  type CalendarViewMode,
} from "@/components/content-factory/EditorialCalendarViews";
import {
  formatChecklistDayLabel,
  formatIsoDate,
  isoDateInWeek,
  shiftIsoDate,
  weekIsoDates,
} from "@/lib/content-factory/editorial-daily-checklist";
import { facebookPostAdminSearch, facebookPageUrl } from "@/lib/content-factory/facebook-post-copy";
import {
  buildEditorialCalendar,
  CATCH_UP_WEEK_NOTE,
  editorialWeekLabel,
  FB_PAGE_INVITE_GUIDANCE,
  isCatchUpWeek,
  LEAD_MAGNET_PURPOSE,
  shiftWeekStart,
  startOfWeekMonday,
  parseIsoDate,
  type EditorialCalendarEvent,
} from "@/lib/content-factory/weekly-editorial-schedule";
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Rocket,
  PenLine,
  ExternalLink,
  Facebook,
} from "lucide-react";

export const Route = createFileRoute("/admin_/calendar")({
  validateSearch: (search: Record<string, unknown>) => ({
    view: search.view === "daily" ? ("daily" as const) : ("weekly" as const),
    date:
      typeof search.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.date)
        ? search.date
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Content Calendar — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ContentCalendarPage,
});

const TYPE_SURFACE: Record<ContentAssetType, string> = {
  article: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  facebook_post: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  newsletter: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  lead_magnet: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  faq: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  image_prompt: "bg-amber-500/10 text-foreground/90 border-amber-500/20",
};

const TYPE_SWATCH: Record<ContentAssetType, string> = {
  article: "bg-indigo-500/40",
  facebook_post: "bg-sky-500/40",
  newsletter: "bg-emerald-500/40",
  lead_magnet: "bg-pink-500/40",
  faq: "bg-violet-500/40",
  image_prompt: "bg-amber-500/40",
};

function mapDraftStatus(status: ContentDraftStatus): string {
  return CONTENT_STATUS_LABELS[status];
}

function ContentCalendarPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const { view: searchView, date: searchDate } = Route.useSearch();
  const listBatches = useServerFn(listContentFactoryBatchesAdmin);
  const listDrafts = useServerFn(listContentFactoryDraftsAdmin);

  const today = formatToday();
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()));
  const [view, setView] = useState<CalendarViewMode>(searchView);
  const [selectedDay, setSelectedDay] = useState(
    () => searchDate ?? today,
  );
  const [selectedBatchId, setSelectedBatchId] = useState<string>("latest");

  const [completedEvents, setCompletedEvents] = useState<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    if (typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || "";
        if (key.startsWith("calendar-task-done:")) {
          const val = localStorage.getItem(key);
          if (val === "true") {
            out[key.replace("calendar-task-done:", "")] = true;
          }
        }
      }
    }
    return out;
  });

  const toggleEventCompleted = useCallback((eventId: string) => {
    setCompletedEvents((prev) => {
      const next = { ...prev, [eventId]: !prev[eventId] };
      localStorage.setItem(`calendar-task-done:${eventId}`, String(next[eventId]));
      return next;
    });
  }, []);

  const syncSearch = useCallback(
    (nextView: CalendarViewMode, nextDate: string) => {
      void router.navigate({
        to: "/admin/calendar",
        search: { view: nextView, date: nextDate },
        replace: true,
      });
    },
    [router],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.navigate({ to: "/auth" });
      return;
    }
    if (!userHasAdminRole(user)) {
      router.navigate({ to: "/" });
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    setView(searchView);
    if (searchDate) setSelectedDay(searchDate);
  }, [searchView, searchDate]);

  useEffect(() => {
    if (!isoDateInWeek(selectedDay, weekStart)) {
      setWeekStart(startOfWeekMonday(parseIsoDate(selectedDay)));
    }
  }, [selectedDay, weekStart]);

  const batchesQuery = useQuery({
    queryKey: ["content-factory-batches", "calendar"],
    queryFn: () => listBatches({ data: { limit: 12 } }),
    enabled: Boolean(user && userHasAdminRole(user)),
  });

  const batches = batchesQuery.data ?? [];
  const activeBatchId =
    selectedBatchId === "latest" ? (batches[0]?.id ?? null) : selectedBatchId;

  const draftsQuery = useQuery({
    queryKey: ["content-factory-drafts", "calendar", activeBatchId],
    queryFn: () => listDrafts({ data: { batchId: activeBatchId ?? undefined } }),
    enabled: Boolean(user && userHasAdminRole(user) && activeBatchId),
  });

  const draftBySlot = useMemo(() => {
    const map = new Map<string, (typeof draftsQuery.data)[number]>();
    for (const draft of draftsQuery.data ?? []) {
      map.set(`${draft.type}:${draft.slotIndex}`, draft);
    }
    return map;
  }, [draftsQuery.data]);

  const titleOverrides = useMemo(() => {
    const titles: Record<string, string> = {};
    for (const [key, draft] of draftBySlot) {
      titles[key] = draft.title;
    }
    return titles;
  }, [draftBySlot]);

  const catchUp = isCatchUpWeek(weekStart);
  const weekDates = useMemo(() => weekIsoDates(weekStart), [weekStart]);

  const events = useMemo(
    () => buildEditorialCalendar({ weekStart, titles: titleOverrides }),
    [weekStart, titleOverrides],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EditorialCalendarEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [events]);

  const changeView = (nextView: CalendarViewMode) => {
    setView(nextView);
    const date =
      nextView === "daily" && !isoDateInWeek(selectedDay, weekStart)
        ? weekDates.includes(today)
          ? today
          : weekDates[0]!
        : selectedDay;
    setSelectedDay(date);
    syncSearch(nextView, date);
  };

  const selectDay = (isoDate: string) => {
    setSelectedDay(isoDate);
    if (!isoDateInWeek(isoDate, weekStart)) {
      setWeekStart(startOfWeekMonday(parseIsoDate(isoDate)));
    }
    setView("daily");
    syncSearch("daily", isoDate);
  };

  const goToPrevious = () => {
    if (view === "weekly") {
      setWeekStart((w) => shiftWeekStart(w, -1));
      return;
    }
    const next = shiftIsoDate(selectedDay, -1);
    setSelectedDay(next);
    if (!isoDateInWeek(next, weekStart)) {
      setWeekStart(startOfWeekMonday(parseIsoDate(next)));
    }
    syncSearch("daily", next);
  };

  const goToNext = () => {
    if (view === "weekly") {
      setWeekStart((w) => shiftWeekStart(w, 1));
      return;
    }
    const next = shiftIsoDate(selectedDay, 1);
    setSelectedDay(next);
    if (!isoDateInWeek(next, weekStart)) {
      setWeekStart(startOfWeekMonday(parseIsoDate(next)));
    }
    syncSearch("daily", next);
  };

  const goToToday = () => {
    const monday = startOfWeekMonday(new Date());
    setWeekStart(monday);
    setSelectedDay(today);
    setView("daily");
    syncSearch("daily", today);
  };

  if (authLoading || !user || !userHasAdminRole(user)) return null;

  const renderEventChip = (event: EditorialCalendarEvent) => {
    const Icon = contentTypeIcon(event.type);
    const draft = draftBySlot.get(`${event.type}:${event.slotIndex}`);
    const isProduce = event.milestone === "produce";
    const isCompleted = !!completedEvents[event.id];
    
    const chipClass = `w-full text-left border rounded text-[9px] px-1 py-0.5 font-medium leading-normal truncate transition-all ${TYPE_SURFACE[event.type]} ${
      isProduce ? "border-dashed" : "border-solid"
    } ${isCompleted ? "opacity-45 line-through" : "hover:brightness-110"}`;

    const chipContent = (
      <>
        {isProduce ? (
          <PenLine className="h-2.5 w-2.5 inline mr-0.5 shrink-0" />
        ) : (
          <Rocket className="h-2.5 w-2.5 inline mr-0.5 shrink-0" />
        )}
        <Icon className="h-2.5 w-2.5 inline mr-0.5 shrink-0" />
        {event.title}
        {(event.type === "facebook_post" || event.slotIndex === 99) && (
          <ExternalLink className="h-2 w-2 inline ml-0.5 shrink-0 opacity-70" />
        )}
      </>
    );

    if (event.slotIndex === 99) {
      const pageUrl = facebookPageUrl();
      if (pageUrl) {
        return (
          <a
            key={event.id}
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`${event.title}\nOpen Facebook Page`}
            className={`${chipClass} block`}
            onClick={(e) => e.stopPropagation()}
          >
            {chipContent}
          </a>
        );
      }
      return (
        <button
          key={event.id}
          type="button"
          title={event.title}
          className={chipClass}
          onClick={(e) => {
            e.stopPropagation();
            toast.info(event.title, {
              description: event.detail,
              action: {
                label: isCompleted ? "Mark active" : "Mark done",
                onClick: () => toggleEventCompleted(event.id),
              },
            });
          }}
        >
          {chipContent}
        </button>
      );
    }

    if (event.type === "facebook_post") {
      return (
        <Link
          key={event.id}
          to="/admin/facebook-posts"
          search={facebookPostAdminSearch(activeBatchId, event.slotIndex)}
          title={`${event.title}\n${isProduce ? "Produce" : "Launch"}: ${event.detail}${draft ? `\nStatus: ${mapDraftStatus(draft.status)}` : ""}\nOpen copy page`}
          className={`${chipClass} block`}
          onClick={(e) => e.stopPropagation()}
        >
          {chipContent}
        </Link>
      );
    }

    return (
      <button
        key={event.id}
        type="button"
        title={`${event.title}\n${isProduce ? "Produce" : "Launch"}: ${event.detail}${draft ? `\nStatus: ${mapDraftStatus(draft.status)}` : ""}`}
        className={chipClass}
        onClick={(e) => {
          e.stopPropagation();
          toast.info(event.title, {
            description: `${isProduce ? "Produce" : "Launch"} · ${event.detail}${draft ? ` · ${mapDraftStatus(draft.status)}` : ""}`,
            action: {
              label: isCompleted ? "Mark active" : "Mark done",
              onClick: () => toggleEventCompleted(event.id),
            },
          });
        }}
      >
        {chipContent}
      </button>
    );
  };

  const upcomingProduce = events.filter(
    (e) => e.milestone === "produce" && e.date >= today,
  ).length;
  const upcomingLaunch = events.filter(
    (e) => e.milestone === "launch" && e.date >= today,
  ).length;

  const navTitle =
    view === "weekly" ? editorialWeekLabel(weekStart) : formatChecklistDayLabel(selectedDay);

  return (
    <AppShell
      title="Content Calendar"
      subtitle="Weekly editorial schedule — produce dates and launch dates for every Content Factory asset."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4 text-indigo-400" />
            {editorialWeekLabel(weekStart)}
            {catchUp && (
              <Badge variant="outline" className="text-[10px] border-indigo-500/40 text-foreground">
                Catch-up (Wed start)
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/facebook-posts" search={facebookPostAdminSearch(activeBatchId, 0)}>
              <Button size="sm" variant="outline">
                <Facebook className="h-4 w-4 mr-1.5" />
                Facebook Posts
              </Button>
            </Link>
            <Link to="/admin/content-factory">
              <Button size="sm" variant="outline">
                <Sparkles className="h-4 w-4 mr-1.5" />
                Content Factory
              </Button>
            </Link>
            <Link to="/admin">
              <Button size="sm" variant="outline">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Admin dashboard
              </Button>
            </Link>
          </div>
        </div>

        {catchUp ? (
          <Card className="glass p-4 border-indigo-500/25 space-y-3 bg-indigo-500/5">
            <h3 className="font-display text-sm font-bold text-foreground">
              This week: catch-up from Wednesday
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{CATCH_UP_WEEK_NOTE}</p>
            <p className="text-xs text-foreground/90 leading-relaxed">{FB_PAGE_INVITE_GUIDANCE}</p>
            <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
              <li>
                <strong className="text-foreground">Today (Wed):</strong> Publish Article 1 + rollout
                Facebook post (skip Mon/Tue posts).
              </li>
              <li>
                <strong className="text-foreground">Thu:</strong> Article 2, lead magnet live, then invite
                people to follow the page.
              </li>
              <li>
                <strong className="text-foreground">Fri–Sun:</strong> Article 3, FAQ, remaining posts,
                newsletter Sunday.
              </li>
            </ol>
          </Card>
        ) : (
          <Card className="glass p-4 border-primary/15 space-y-2">
            <h3 className="font-display text-sm font-bold">Standard weekly schedule</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Full Monday–Sunday editorial plan — produce and launch dates for every Content Factory
              asset. Facebook posts run daily; articles publish Wed–Fri.
            </p>
          </Card>
        )}

        <Card className="glass p-4 border-primary/15 space-y-2">
          <h3 className="font-display text-sm font-bold">What the lead magnet does</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{LEAD_MAGNET_PURPOSE}</p>
          <p className="text-[11px] text-muted-foreground">
            {catchUp
              ? "Catch-up: finalize the PDF today (Wed), launch landing page Thursday."
              : "Each weekly batch includes one lead magnet (PDF workbook). Produce Tuesday, launch Thursday."}
          </p>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          <Card className="glass p-5 border-primary/10 lg:col-span-3 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={goToPrevious}
                  aria-label={view === "weekly" ? "Previous week" : "Previous day"}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="font-display text-base font-bold min-w-[12rem] text-center">
                  {navTitle}
                </h2>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={goToNext}
                  aria-label={view === "weekly" ? "Next week" : "Next day"}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={goToToday}>
                  Today
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <CalendarViewToggle view={view} onViewChange={changeView} />
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
                  {(Object.keys(TYPE_SWATCH) as ContentAssetType[]).map((type) => (
                    <span key={type} className="flex items-center gap-1">
                      <span className={`h-2.5 w-2.5 rounded ${TYPE_SWATCH[type]}`} />
                      {CONTENT_TYPE_LABELS[type].replace("Learning Center ", "")}
                    </span>
                  ))}
                  <span className="flex items-center gap-1 border-l pl-3 ml-1">
                    <PenLine className="h-3 w-3" /> Produce
                  </span>
                  <span className="flex items-center gap-1">
                    <Rocket className="h-3 w-3" /> Launch
                  </span>
                </div>
              </div>
            </div>

            {view === "weekly" ? (
              <>
                <p className="text-[11px] text-muted-foreground">
                  Click a day to open the daily view with timed tasks.
                </p>
                <EditorialWeekGrid
                  weekDates={weekDates}
                  eventsByDate={eventsByDate}
                  today={today}
                  selectedDay={selectedDay}
                  onSelectDay={selectDay}
                  renderEventChip={renderEventChip}
                />
              </>
            ) : (
              <>
                <WeekDayPicker
                  weekDates={weekDates}
                  selectedDay={selectedDay}
                  today={today}
                  onSelectDay={selectDay}
                />
                <EditorialDayAgenda
                  isoDate={selectedDay}
                  events={events}
                  draftBySlot={draftBySlot}
                  batchId={activeBatchId}
                  today={today}
                  mapDraftStatus={mapDraftStatus}
                  completedEvents={completedEvents}
                  onToggleCompleted={toggleEventCompleted}
                />
              </>
            )}
          </Card>

          <div className="space-y-4">
            <Card className="glass p-5 border-border/40 space-y-3">
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Batch overlay
              </h2>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
              >
                <option value="latest">Latest batch (titles)</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {catchUp
                  ? "Catch-up mode: only Wed–Sun tasks show. Next week uses the standard Mon–Sun template."
                  : "Calendar dates follow the weekly editorial template. Selecting a batch replaces placeholder labels with real draft titles."}
              </p>
            </Card>

            <Card className="glass p-5 border-border/40 space-y-3">
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                This week
              </h2>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg border bg-background/50 p-2">
                  <div className="text-lg font-bold tabular-nums">{upcomingProduce}</div>
                  <div className="text-[10px] text-muted-foreground">Produce days left</div>
                </div>
                <div className="rounded-lg border bg-background/50 p-2">
                  <div className="text-lg font-bold tabular-nums">{upcomingLaunch}</div>
                  <div className="text-[10px] text-muted-foreground">Launch days left</div>
                </div>
              </div>
            </Card>

            {view === "weekly" && (
              <Card className="glass p-5 border-border/40 space-y-2 max-h-[520px] overflow-y-auto">
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground sticky top-0 bg-card/95 pb-2">
                  Daily checklist
                </h2>
                <p className="text-[10px] text-muted-foreground pb-2">
                  Times are suggested local hours — produce in the morning, launch by early afternoon
                  (Facebook posts at 10:30 AM).
                </p>
                <EditorialDailyChecklist
                  events={events}
                  draftBySlot={draftBySlot}
                  batchId={activeBatchId}
                  completedEvents={completedEvents}
                  onToggleCompleted={toggleEventCompleted}
                />
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function formatToday(): string {
  return formatIsoDate(new Date());
}
