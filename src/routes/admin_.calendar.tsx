import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { AdminAccessGate } from "@/components/AdminAccessGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  primaryCalendarEventDestination,
  type CalendarDraftRef,
} from "@/lib/content-factory/editorial-calendar-links";
import {
  buildEditorialCalendar,
  EDITORIAL_EARLIEST_LAUNCH_FRIDAY,
  EDITORIAL_LAUNCH_WEEK_SATURDAY,
  FB_PAGE_INVITE_GUIDANCE,
  formatEarliestLaunchLabel,
  formatLaunchWeekLabel,
  editorialWeekLabel,
  isLaunchWeek,
  isPreLaunchWeek,
  LAUNCH_WEEK_NOTE,
  LEAD_MAGNET_PURPOSE,
  PRE_LAUNCH_GUIDANCE,
  PRE_LAUNCH_NOTE,
  shiftWeekStart,
  startOfWeekSaturday,
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
  Shield,
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
  article: "bg-indigo-100 text-indigo-950 border-indigo-300/50 dark:bg-indigo-500/15 dark:text-indigo-50 dark:border-indigo-500/25",
  facebook_post: "bg-sky-100 text-sky-950 border-sky-300/50 dark:bg-sky-500/15 dark:text-sky-50 dark:border-sky-500/25",
  newsletter: "bg-emerald-100 text-emerald-950 border-emerald-300/50 dark:bg-emerald-500/15 dark:text-emerald-50 dark:border-emerald-500/25",
  lead_magnet: "bg-pink-100 text-pink-950 border-pink-300/50 dark:bg-pink-500/15 dark:text-pink-50 dark:border-pink-500/25",
  faq: "bg-violet-100 text-violet-950 border-violet-300/50 dark:bg-violet-500/15 dark:text-violet-50 dark:border-violet-500/25",
  image_prompt: "bg-amber-100 text-amber-950 border-amber-300/50 dark:bg-amber-500/15 dark:text-amber-50 dark:border-amber-500/25",
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
  const [weekStart, setWeekStart] = useState(() => startOfWeekSaturday(new Date()));
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
      router.navigate({ to: "/auth", search: { tab: "sign-in" } });
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    setView(searchView);
    if (searchDate) setSelectedDay(searchDate);
  }, [searchView, searchDate]);

  useEffect(() => {
    if (!isoDateInWeek(selectedDay, weekStart)) {
      setWeekStart(startOfWeekSaturday(parseIsoDate(selectedDay)));
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
    const map = new Map<string, CalendarDraftRef>();
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

  const preLaunch = isPreLaunchWeek(weekStart);
  const launchWeek = isLaunchWeek(weekStart);
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
      setWeekStart(startOfWeekSaturday(parseIsoDate(isoDate)));
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
      setWeekStart(startOfWeekSaturday(parseIsoDate(next)));
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
      setWeekStart(startOfWeekSaturday(parseIsoDate(next)));
    }
    syncSearch("daily", next);
  };

  const goToToday = () => {
    const saturday = startOfWeekSaturday(new Date());
    setWeekStart(saturday);
    setSelectedDay(today);
    setView("daily");
    syncSearch("daily", today);
  };

  if (authLoading || !user) return null;

  const renderEventChip = (event: EditorialCalendarEvent) => {
    const Icon = contentTypeIcon(event.type);
    const draft = draftBySlot.get(`${event.type}:${event.slotIndex}`);
    const isPrelaunchTask = event.category === "prelaunch";
    const isProduce = event.milestone === "produce";
    const isCompleted = !!completedEvents[event.id];
    const destination = isPrelaunchTask
      ? null
      : primaryCalendarEventDestination({
          event,
          draft,
          batchId: activeBatchId,
        });

    const chipClass = `w-full text-left border rounded text-[9px] px-1 py-0.5 font-medium leading-normal truncate transition-all ${
      isPrelaunchTask
        ? "bg-slate-100 text-slate-900 border-slate-300/60 dark:bg-slate-500/15 dark:text-slate-50"
        : TYPE_SURFACE[event.type]
    } ${isProduce ? "border-dashed" : "border-solid"} ${
      isCompleted ? "opacity-45 line-through" : "hover:brightness-110"
    }`;

    const chipContent = (
      <>
        {isPrelaunchTask ? (
          <Shield className="h-2.5 w-2.5 inline mr-0.5 shrink-0" />
        ) : isProduce ? (
          <PenLine className="h-2.5 w-2.5 inline mr-0.5 shrink-0" />
        ) : (
          <Rocket className="h-2.5 w-2.5 inline mr-0.5 shrink-0" />
        )}
        {!isPrelaunchTask ? <Icon className="h-2.5 w-2.5 inline mr-0.5 shrink-0" /> : null}
        {event.title}
        {destination ? <ExternalLink className="h-2 w-2 inline ml-0.5 shrink-0 opacity-70" /> : null}
      </>
    );

    const chipTitle = `${event.title}\n${isPrelaunchTask ? "Setup" : isProduce ? "Produce" : "Launch"}: ${event.detail}${draft ? `\nStatus: ${mapDraftStatus(draft.status)}` : ""}`;

    if (event.slotIndex === 99) {
      const pageUrl = facebookPageUrl();
      if (pageUrl) {
        return (
          <a
            key={event.id}
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`${chipTitle}\nOpen Facebook Page`}
            className={`${chipClass} block`}
            onClick={(e) => e.stopPropagation()}
          >
            {chipContent}
          </a>
        );
      }
    }

    if (destination?.kind === "external") {
      return (
        <a
          key={event.id}
          href={destination.href}
          target="_blank"
          rel="noopener noreferrer"
          title={chipTitle}
          className={`${chipClass} block`}
          onClick={(e) => e.stopPropagation()}
        >
          {chipContent}
        </a>
      );
    }

    if (destination?.kind === "internal") {
      return (
        <Link
          key={event.id}
          to={destination.to}
          search={destination.search as Record<string, unknown>}
          title={chipTitle}
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
        title={chipTitle}
        className={chipClass}
        onClick={(e) => {
          e.stopPropagation();
          selectDay(event.date);
        }}
      >
        {chipContent}
      </button>
    );
  };

  const upcomingTasks = events.filter((e) => e.date >= today).length;

  const navTitle =
    view === "weekly" ? editorialWeekLabel(weekStart) : formatChecklistDayLabel(selectedDay);

  return (
    <AdminAccessGate>
      <AppShell
        title="Content Calendar"
        subtitle="Weekly editorial schedule — produce dates and launch dates for every Content Factory asset."
      >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4 text-indigo-400" />
            {editorialWeekLabel(weekStart)}
            {preLaunch && (
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-foreground">
                Pre-launch (LLC setup)
              </Badge>
            )}
            {launchWeek && (
              <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-foreground">
                Week 1 launch
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

        {preLaunch ? (
          <Card className="glass p-4 border-amber-500/25 space-y-3 bg-amber-500/5">
            <h3 className="font-display text-sm font-bold text-foreground">
              Accelerated pre-launch — go live Friday or Saturday when LLC is ready
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{PRE_LAUNCH_NOTE}</p>
            <p className="text-xs text-foreground/90 leading-relaxed">{PRE_LAUNCH_GUIDANCE}</p>
            <ul className="text-[11px] text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-foreground">Sprint week (Mon–Fri):</strong> file LLC → EIN →
                bank → legal pages → Facebook drafts → go/no-go Friday
              </li>
              <li>
                <strong className="text-foreground">Earliest go-live:</strong>{" "}
                {formatEarliestLaunchLabel()} ({EDITORIAL_EARLIEST_LAUNCH_FRIDAY}) — Article 1 +
                welcome post if LLC is green
              </li>
              <li>
                <strong className="text-foreground">Content week starts:</strong>{" "}
                {formatLaunchWeekLabel()} ({EDITORIAL_LAUNCH_WEEK_SATURDAY})
              </li>
            </ul>
            <p className="text-[11px] text-muted-foreground">
              LLC done early? Update the launch dates in{" "}
              <code className="text-[10px]">weekly-editorial-schedule.ts</code> and deploy, or tell
              us to move them up.
            </p>
          </Card>
        ) : launchWeek ? (
          <Card className="glass p-4 border-emerald-500/25 space-y-3 bg-emerald-500/5">
            <h3 className="font-display text-sm font-bold text-foreground">Week 1 — go live</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{LAUNCH_WEEK_NOTE}</p>
            <p className="text-xs text-foreground/90 leading-relaxed">{FB_PAGE_INVITE_GUIDANCE}</p>
          </Card>
        ) : (
          <Card className="glass p-4 border-primary/15 space-y-2">
            <h3 className="font-display text-sm font-bold">Standard weekly schedule</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Full Saturday–Friday editorial plan — produce and launch dates for every Content Factory
              asset. Facebook posts run daily; articles publish Wed–Fri.
            </p>
          </Card>
        )}

        {!preLaunch && (
          <Card className="glass p-4 border-primary/15 space-y-2">
            <h3 className="font-display text-sm font-bold">What the lead magnet does</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{LEAD_MAGNET_PURPOSE}</p>
            <p className="text-[11px] text-muted-foreground">
              Each weekly batch includes one lead magnet (PDF workbook). Produce Tuesday, launch
              Thursday.
            </p>
          </Card>
        )}

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
                {preLaunch
                  ? "Pre-launch weeks show LLC and legal setup tasks only. Navigate to Week 1 launch for content dates."
                  : "Calendar dates follow the weekly editorial template. Selecting a batch replaces placeholder labels with real draft titles."}
              </p>
            </Card>

            <Card className="glass p-5 border-border/40 space-y-3">
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                This week
              </h2>
              <div className="rounded-lg border bg-background/50 p-2 text-center">
                <div className="text-lg font-bold tabular-nums">{upcomingTasks}</div>
                <div className="text-[10px] text-muted-foreground">
                  {preLaunch ? "Setup tasks left" : "Scheduled items left"}
                </div>
              </div>
            </Card>

            <Card className="glass p-5 border-border/40 space-y-3">
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Facebook post images
              </h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Posts 1–3 (Wed–Fri article promos): upload the same hero JPG as the linked Learning
                Center article — generate it from the matching Image Prompt draft first.
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Posts 4–7 (Mon–Sun tips): no linked article — use the brand logo (
                <code className="text-[10px]">email-header-logo.png</code>) or a calm educational
                photo. Full step-by-step instructions are on each post in{" "}
                <Link to="/admin/facebook-posts" search={facebookPostAdminSearch(activeBatchId, 0)} className="text-primary font-medium hover:text-primary/80 underline-offset-2 hover:underline">
                  Facebook Posts
                </Link>
                .
              </p>
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
    </AdminAccessGate>
  );
}

function formatToday(): string {
  return formatIsoDate(new Date());
}
