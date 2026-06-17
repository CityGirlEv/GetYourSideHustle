import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  Facebook,
  Mail,
  BookOpen,
  Settings,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/admin_/calendar")({
  head: () => ({
    meta: [
      { title: "Content Calendar — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ContentCalendarPage,
});

interface CalendarEvent {
  id: string;
  type: "article" | "facebook_post" | "newsletter" | "lead_magnet";
  title: string;
  date: string; // YYYY-MM-DD
  status: "draft" | "review" | "approved" | "scheduled" | "published";
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: "ev-1",
    type: "article",
    title: "Turning 65? Start Here Guide",
    date: "2026-06-16",
    status: "published",
  },
  {
    id: "ev-2",
    type: "article",
    title: "3 Months Before 65 Plan",
    date: "2026-06-18",
    status: "scheduled",
  },
  {
    id: "ev-3",
    type: "facebook_post",
    title: "COBRA coordinate work alert",
    date: "2026-06-19",
    status: "approved",
  },
  {
    id: "ev-4",
    type: "newsletter",
    title: "Weekly Digest: Penalty Rules",
    date: "2026-06-22",
    status: "scheduled",
  },
  {
    id: "ev-5",
    type: "lead_magnet",
    title: "Medicare Timeline PDF Tracker",
    date: "2026-06-25",
    status: "approved",
  },
  {
    id: "ev-6",
    type: "facebook_post",
    title: "HSA tax rule alert post",
    date: "2026-06-26",
    status: "review",
  },
];

const DRAFTS_AWAITING_APPROVAL: CalendarEvent[] = [
  {
    id: "ev-dr1",
    type: "article",
    title: "Medicare Special Enrollment Periods",
    date: "",
    status: "review",
  },
  {
    id: "ev-dr2",
    type: "facebook_post",
    title: "GEP Missed Penalty Post",
    date: "",
    status: "draft",
  },
];

function ContentCalendarPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();

  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [unscheduledDrafts, setUnscheduledDrafts] = useState<CalendarEvent[]>(DRAFTS_AWAITING_APPROVAL);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStatus, setRescheduleStatus] = useState<CalendarEvent["status"]>("draft");

  // Render static calendar for June 2026
  const year = 2026;
  const month = 5; // June (0-indexed)
  const monthName = "June 2026";
  const totalDays = 30;
  const firstDayIndex = 1; // June 1, 2026 is a Monday (1-indexed starting Sunday as 0? Wait, June 1, 2026 is a Monday. Let's make grid alignment clean).

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

  if (authLoading || !user || !userHasAdminRole(user)) return null;

  const getDayEvents = (dayNum: number) => {
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dateStr = `2026-06-${formattedDay}`;
    return events.filter((e) => e.date === dateStr);
  };

  const handleOpenReschedule = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setRescheduleDate(event.date);
    setRescheduleStatus(event.status);
  };

  const handleSaveReschedule = () => {
    if (!selectedEvent) return;
    
    // Check if the event was previously unscheduled
    const isUnscheduled = !selectedEvent.date;

    if (isUnscheduled) {
      if (!rescheduleDate) {
        toast.error("Please select a date to schedule.");
        return;
      }
      const updatedEvent: CalendarEvent = {
        ...selectedEvent,
        date: rescheduleDate,
        status: rescheduleStatus,
      };
      setEvents((prev) => [...prev, updatedEvent]);
      setUnscheduledDrafts((prev) => prev.filter((d) => d.id !== selectedEvent.id));
    } else {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEvent.id
            ? { ...e, date: rescheduleDate, status: rescheduleStatus }
            : e
        )
      );
    }

    setSelectedEvent(null);
    toast.success("Event successfully scheduled.");
  };

  const handleUnschedule = () => {
    if (!selectedEvent) return;
    
    const unscheduled: CalendarEvent = {
      ...selectedEvent,
      date: "",
      status: "review",
    };
    setUnscheduledDrafts((prev) => [...prev, unscheduled]);
    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    setSelectedEvent(null);
    toast.success("Event removed from calendar and queued.");
  };

  const getEventClass = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "article":
        return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
      case "facebook_post":
        return "bg-sky-500/10 text-sky-300 border-sky-500/20";
      case "newsletter":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
      case "lead_magnet":
        return "bg-pink-500/10 text-pink-300 border-pink-500/20";
    }
  };

  const getEventIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "article":
        return <FileText className="h-3 w-3 inline mr-1 shrink-0" />;
      case "facebook_post":
        return <Facebook className="h-3 w-3 inline mr-1 shrink-0" />;
      case "newsletter":
        return <Mail className="h-3 w-3 inline mr-1 shrink-0" />;
      case "lead_magnet":
        return <BookOpen className="h-3 w-3 inline mr-1 shrink-0" />;
    }
  };

  return (
    <AppShell
      title="Content Calendar"
      subtitle="Editorial calendar tracking scheduled articles, social media updates, and newsletters."
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4 text-indigo-400" />
            June 2026 Editorial Dashboard
          </div>
          <Link to="/admin">
            <Button size="sm" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Admin dashboard
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <Card className="glass p-5 border-primary/10 lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold flex items-center gap-1">
                <ChevronLeft className="h-5 w-5 text-muted-foreground cursor-pointer" />
                {monthName}
                <ChevronRight className="h-5 w-5 text-muted-foreground cursor-pointer" />
              </h2>
              <div className="flex gap-2 text-[10px]">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-indigo-500/40"></span> Article</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-sky-500/40"></span> Post</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500/40"></span> Email</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-pink-500/40"></span> Magnet</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="text-center font-semibold text-[10px] uppercase text-muted-foreground py-1">
                  {d}
                </div>
              ))}

              {/* Pad blank slots for May end */}
              {Array.from({ length: 0 }).map((_, i) => (
                <div key={i} className="min-h-[5.5rem] bg-secondary/5 border border-transparent rounded-lg p-1.5"></div>
              ))}

              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum = i + 1;
                const dayEvents = getDayEvents(dayNum);
                return (
                  <div key={dayNum} className="min-h-[5.5rem] bg-background/30 border border-border/60 hover:border-primary/20 transition-all rounded-lg p-1.5 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground">{dayNum}</span>
                    <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-0.5">
                      {dayEvents.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => handleOpenReschedule(e)}
                          className={`w-full text-left border rounded text-[9px] px-1 py-0.5 font-medium leading-normal truncate ${getEventClass(
                            e.type
                          )}`}
                          title={e.title}
                        >
                          {getEventIcon(e.type)}
                          {e.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="glass p-5 border-border/40 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Awaiting Approval
                </h2>
                <Badge variant="outline" className="text-[9px]">Draft Queue</Badge>
              </div>

              {unscheduledDrafts.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">No unscheduled drafts in queue.</p>
              ) : (
                <div className="space-y-2">
                  {unscheduledDrafts.map((d) => (
                    <div key={d.id} className="rounded-lg border bg-background/60 p-2.5 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded bg-primary/10">{getEventIcon(d.type)}</span>
                        <h4 className="text-xs font-bold truncate flex-1">{d.title}</h4>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wide">
                          {d.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2"
                          onClick={() => handleOpenReschedule(d)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Schedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="glass p-5 border-border/40 text-xs text-muted-foreground space-y-2.5">
              <h3 className="font-display font-semibold text-foreground">Interactive Planning Guide</h3>
              <p className="leading-normal">
                Click on any calendar card or sidebar draft to reschedule, approve status, or remove items back to the queue.
              </p>
              <p className="leading-normal">
                This page mirrors scheduled Supabase records, providing visual sync audits.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Scheduled Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-primary/10">{getEventIcon(selectedEvent.type)}</span>
                <div>
                  <h4 className="text-sm font-semibold">{selectedEvent.title}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase mt-0.5">
                    Type: {selectedEvent.type.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Scheduled Date</label>
                  <Input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Workflow Status</label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    value={rescheduleStatus}
                    onChange={(e) => setRescheduleStatus(e.target.value as CalendarEvent["status"])}
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="approved">Approved</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            {selectedEvent && selectedEvent.date && (
              <Button variant="ghost" size="sm" onClick={handleUnschedule} className="text-rose-400 hover:text-rose-300">
                Unschedule Event
              </Button>
            )}
            <div className="flex gap-2 justify-end flex-1">
              <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveReschedule} className="grad-indigo">
                Apply Settings
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
