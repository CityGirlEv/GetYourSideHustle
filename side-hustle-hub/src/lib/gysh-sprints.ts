/**
 * GYSH Agile sprint cadence + implementation plan helpers.
 * Sprint rules: start Tuesday, end Monday night.
 * Sprint 0 is anchored to Jul 14–Jul 20, 2026 (assignments never drift).
 */

export type SprintWindow = {
  index: number;
  label: string;
  start: Date;
  end: Date;
  startLabel: string;
  endLabel: string;
  rangeLabel: string;
};

/** -1 = Product Backlog (not yet committed to a sprint). */
export const BACKLOG_SPRINT = -1;

export type PlanItemKind =
  | "meeting"
  | "sprint"
  | "rollout"
  | "content"
  | "brand"
  | "launch"
  | "ceremony";

export type PlanItemStatus = "todo" | "in_progress" | "done" | "carried";

export type PlanOwner = "Tina" | "Evelyn" | "Lyriq" | "Both" | "Unassigned";

export type PlanItem = {
  id: string;
  title: string;
  notes: string;
  owner: PlanOwner;
  kind: PlanItemKind;
  /** Sprint index, or BACKLOG_SPRINT (-1) for backlog. */
  sprint: number;
  status: PlanItemStatus;
  date: string;
  dateLabel: string;
  /** Partner completion — Both items need both true before status can be Done. */
  tinaDone?: boolean;
  evelynDone?: boolean;
  attachments?: PlanItemAttachment[];
};

/** Lightweight sprint item attachment metadata (blob currently lives in browser IndexedDB). */
export type PlanItemAttachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  storedId: string;
  r2Key?: string | null;
  addedAt: string;
};

/** Apply status / partner-done rules for plan items (mirrors task Both rules). */
export function applyPlanPartnerDone(
  item: PlanItem,
  patch: Partial<PlanItem> = {},
): PlanItem {
  const next: PlanItem = {
    ...item,
    ...patch,
    tinaDone: patch.tinaDone ?? item.tinaDone ?? false,
    evelynDone: patch.evelynDone ?? item.evelynDone ?? false,
    attachments: patch.attachments ?? item.attachments ?? [],
  };

  if (next.owner === "Tina") {
    if (patch.status === "done") next.tinaDone = true;
    if (patch.status && patch.status !== "done") next.tinaDone = false;
    if (patch.tinaDone === true) next.status = "done";
    if (patch.tinaDone === false && next.status === "done") next.status = "in_progress";
    next.evelynDone = false;
  } else if (next.owner === "Evelyn") {
    if (patch.status === "done") next.evelynDone = true;
    if (patch.status && patch.status !== "done") next.evelynDone = false;
    if (patch.evelynDone === true) next.status = "done";
    if (patch.evelynDone === false && next.status === "done") next.status = "in_progress";
    next.tinaDone = false;
  } else if (next.owner === "Both") {
    if (patch.status === "done" && !(next.tinaDone && next.evelynDone)) {
      next.status = "in_progress";
    }
    if (patch.status === "todo" || patch.status === "carried") {
      if (patch.tinaDone === undefined && patch.evelynDone === undefined) {
        next.tinaDone = false;
        next.evelynDone = false;
      }
    }
    if (next.tinaDone && next.evelynDone) {
      next.status = "done";
    } else if (next.status === "done") {
      next.status = "in_progress";
    }
  } else {
    // Lyriq / Unassigned — overall status is enough
    next.tinaDone = false;
    next.evelynDone = false;
  }

  return next;
}

/** @deprecated Prefer PlanItem — kept for older calendar helpers/tests. */
export type CalendarItemKind = PlanItemKind;
export type ContentCalendarItem = PlanItem & { notes?: string };

export type CeremonyType = "standup" | "planning" | "retrospective";

export type SprintCeremony = {
  id: string;
  type: CeremonyType;
  title: string;
  date: string;
  dateLabel: string;
  time: string;
  sprint: number;
  agenda: string;
};

export type RetroColumn = "went_well" | "improve" | "action";

export type RetroCard = {
  id: string;
  sprint: number;
  column: RetroColumn;
  text: string;
  owner: PlanOwner;
};

export const RETRO_COLUMNS: { id: RetroColumn; label: string; hint: string }[] = [
  { id: "went_well", label: "Went well", hint: "Keep doing / celebrate" },
  { id: "improve", label: "Needs improvement", hint: "Friction, bugs, unclear process" },
  { id: "action", label: "Action items", hint: "Concrete follow-ups for next sprint" },
];

export const KIND_LABELS: Record<PlanItemKind, string> = {
  meeting: "Meeting",
  sprint: "Sprint",
  rollout: "Rollout",
  content: "Content",
  brand: "Brand",
  launch: "Launch",
  ceremony: "Ceremony",
};

export const STATUS_LABELS: Record<PlanItemStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  carried: "Carry over",
};

export const CEREMONY_LABELS: Record<CeremonyType, string> = {
  standup: "Sprint Standup",
  planning: "Sprint Planning",
  retrospective: "Sprint Retrospective",
};

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const SPRINT_ZERO_START = new Date(2026, 6, 14);
export const DEFAULT_SPRINT_COUNT = 8;

/** Implementation themes — one focus per Tue–Mon sprint. */
export type SprintTheme = {
  index: number;
  theme: string;
  goal: string;
};

export const SPRINT_THEMES: SprintTheme[] = [
  {
    index: 0,
    theme: "Brand & public foundation",
    goal: "FB page created, brand kit live, About story, home/layout polish — public face takes shape",
  },
  {
    index: 1,
    theme: "Public pages & launch content",
    goal: "Contact live, main hustle copy pass, Kevina launch assets, Content Factory cadence for launch week",
  },
  {
    index: 2,
    theme: "Go public — introduce GYSH",
    goal: "By Mon Aug 3: introduce the Facebook Page and website to the world (soft launch)",
  },
  {
    index: 3,
    theme: "Post-launch polish",
    goal: "Workshop/conference dates, Senior page, safety PDF, SEO landings, first launch-guide batch, QA cycle",
  },
  {
    index: 4,
    theme: "Growth & Kids FMSH verify",
    goal: "AI brainstorm, R2 attachments, mentor listings, remaining guides, Kids Get Your Side Hustle sign-off",
  },
  {
    index: 5,
    theme: "Junior & Adult FMSH verify",
    goal: "Junior + Adult Get Your Side Hustle automated matrices (Vitest ownership)",
  },
  {
    index: 6,
    theme: "Senior FMSH & seniors polish",
    goal: "Senior Get Your Side Hustle matrix + Senior Side Hustles content polish",
  },
  {
    index: 7,
    theme: "Buffer & carry-over",
    goal: "Polish, deferred items, Planning pull for next horizon",
  },
];

export function themeForSprint(index: number): SprintTheme | undefined {
  return SPRINT_THEMES.find((t) => t.index === index);
}

export function formatDisplayDate(d: Date): string {
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Tuesday that starts the sprint containing `ref` (local calendar). */
export function sprintStartTuesday(ref: Date = new Date()): Date {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const day = d.getDay();
  const daysSinceTue = (day + 5) % 7;
  d.setDate(d.getDate() - daysSinceTue);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Monday night end of the sprint that started on `startTue`. */
export function sprintEndMonday(startTue: Date): Date {
  const end = new Date(startTue);
  end.setDate(startTue.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Sprint numbers are anchored so persisted assignments never drift.
 * Sprint 0 is Jul 14–Jul 20, 2026.
 */
export function getSprintWindow(index: number, _ref?: Date): SprintWindow {
  const baseStart = new Date(SPRINT_ZERO_START);
  const start = new Date(baseStart);
  start.setDate(baseStart.getDate() + index * 7);
  const end = sprintEndMonday(start);
  const label = index === 0 ? "Sprint 0" : `Sprint ${index}`;
  return {
    index,
    label,
    start,
    end,
    startLabel: formatDisplayDate(start),
    endLabel: formatDisplayDate(end),
    rangeLabel: `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`,
  };
}

export function listUpcomingSprints(count = DEFAULT_SPRINT_COUNT, ref?: Date): SprintWindow[] {
  return Array.from({ length: count }, (_, i) => getSprintWindow(i, ref));
}

/** Sprint index containing `ref` (clamped to Sprint 0 … DEFAULT_SPRINT_COUNT-1). */
export function currentSprintIndex(ref: Date = new Date()): number {
  const tue = sprintStartTuesday(ref);
  const base = new Date(SPRINT_ZERO_START);
  base.setHours(0, 0, 0, 0);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const idx = Math.floor((tue.getTime() - base.getTime()) / msPerWeek);
  if (!Number.isFinite(idx)) return 0;
  return Math.max(0, Math.min(DEFAULT_SPRINT_COUNT - 1, idx));
}

export function sprintLabel(sprint: number): string {
  if (sprint === BACKLOG_SPRINT) return "Backlog";
  return sprint === 0 ? "Sprint 0" : `Sprint ${sprint}`;
}

export function dayOffset(sprint: SprintWindow, offset: number): Date {
  const d = new Date(sprint.start);
  d.setDate(sprint.start.getDate() + offset);
  return d;
}

/** Assign a plan item onto a sprint workday (0=Tue … 6=Mon). */
export function planItemOnSprintDay(
  sprintIndex: number,
  day: number,
  partial: Omit<PlanItem, "status" | "notes" | "sprint" | "date" | "dateLabel" | "tinaDone" | "evelynDone"> & {
    notes?: string;
    status?: PlanItemStatus;
    tinaDone?: boolean;
    evelynDone?: boolean;
  },
  ref: Date = new Date(),
): PlanItem {
  const sw = getSprintWindow(sprintIndex, ref);
  const d = dayOffset(sw, day);
  return {
    ...partial,
    notes: partial.notes ?? "",
    status: partial.status ?? "todo",
    sprint: sprintIndex,
    date: toISODate(d),
    dateLabel: formatDisplayDate(d),
    tinaDone: partial.tinaDone ?? false,
    evelynDone: partial.evelynDone ?? false,
    attachments: [],
  };
}

/**
 * Agile ceremonies for one sprint:
 * - Standup 3×/week: Tue, Thu, Sat
 * - Planning / review: Sunday (day before sprint ends) — done vs carry-over
 * - Retrospective: Monday (sprint end) — feeds the retro board
 */
export function ceremoniesForSprint(sprint: SprintWindow): SprintCeremony[] {
  const tue = dayOffset(sprint, 0);
  const thu = dayOffset(sprint, 2);
  const sat = dayOffset(sprint, 4);
  const sun = dayOffset(sprint, 5); // day before Mon end
  const mon = dayOffset(sprint, 6);

  return [
    {
      id: `standup-${sprint.index}-tue`,
      type: "standup",
      title: "Sprint Standup",
      date: toISODate(tue),
      dateLabel: `${WEEKDAY_SHORT[2]} ${formatDisplayDate(tue)}`,
      time: "10:00 AM",
      sprint: sprint.index,
      agenda: "What did I finish? What am I working on? Any blockers?",
    },
    {
      id: `standup-${sprint.index}-thu`,
      type: "standup",
      title: "Sprint Standup",
      date: toISODate(thu),
      dateLabel: `${WEEKDAY_SHORT[4]} ${formatDisplayDate(thu)}`,
      time: "10:00 AM",
      sprint: sprint.index,
      agenda: "What did I finish? What am I working on? Any blockers?",
    },
    {
      id: `standup-${sprint.index}-sat`,
      type: "standup",
      title: "Sprint Standup",
      date: toISODate(sat),
      dateLabel: `${WEEKDAY_SHORT[6]} ${formatDisplayDate(sat)}`,
      time: "10:00 AM",
      sprint: sprint.index,
      agenda: "What did I finish? What am I working on? Any blockers?",
    },
    {
      id: `planning-${sprint.index}`,
      type: "planning",
      title: "Sprint Planning / Review",
      date: toISODate(sun),
      dateLabel: `${WEEKDAY_SHORT[0]} ${formatDisplayDate(sun)}`,
      time: "10:00 AM",
      sprint: sprint.index,
      agenda:
        "Review what was Done this sprint. Mark incomplete items Carry over. Pull from Backlog into the next sprint.",
    },
    {
      id: `retro-${sprint.index}`,
      type: "retrospective",
      title: "Sprint Retrospective",
      date: toISODate(mon),
      dateLabel: `${WEEKDAY_SHORT[1]} ${formatDisplayDate(mon)}`,
      time: "4:00 PM",
      sprint: sprint.index,
      agenda: "Went well · Needs improvement · Action items — capture on the Retrospective board.",
    },
  ];
}

export function ceremoniesForSprints(count = DEFAULT_SPRINT_COUNT): SprintCeremony[] {
  return listUpcomingSprints(count).flatMap(ceremoniesForSprint);
}

/** Seed plan: committed sprint work + unassigned backlog. */
export function buildDefaultPlanItems(ref: Date = new Date()): PlanItem[] {
  const s0 = getSprintWindow(0, ref);
  const s1 = getSprintWindow(1, ref);
  const s2 = getSprintWindow(2, ref);

  const item = (
    partial: Omit<PlanItem, "status" | "notes" | "tinaDone" | "evelynDone"> & {
      notes?: string;
      status?: PlanItemStatus;
      tinaDone?: boolean;
      evelynDone?: boolean;
    },
  ): PlanItem => ({
    ...partial,
    notes: partial.notes ?? "",
    status: partial.status ?? "todo",
    tinaDone: partial.tinaDone ?? false,
    evelynDone: partial.evelynDone ?? false,
    attachments: [],
  });

  const items: PlanItem[] = [
    item({
      id: "s0-kickoff",
      title: "Sprint 0 kickoff — public launch path",
      date: toISODate(s0.start),
      dateLabel: formatDisplayDate(s0.start),
      owner: "Unassigned",
      kind: "sprint",
      sprint: 0,
      notes: "Scope for soft launch by end of Sprint 2: FB Page + website introduced to the world",
    }),
    item({
      id: "s0-fb-page",
      title: "Create Facebook Page for GYSH",
      date: toISODate(dayOffset(s0, 2)),
      dateLabel: formatDisplayDate(dayOffset(s0, 2)),
      owner: "Tina",
      kind: "rollout",
      sprint: 0,
      notes: "Brand name + cover using GYSH color system (task T-003) — must be ready before Sprint 2 go-public",
    }),
    item({
      id: "s0-brand",
      title: "Brand kit & layout colors live check",
      date: toISODate(dayOffset(s0, 1)),
      dateLabel: formatDisplayDate(dayOffset(s0, 1)),
      owner: "Evelyn",
      kind: "brand",
      sprint: 0,
      notes: "Antique Gold / Soft Ivory across public views (T-001 / T-011)",
    }),
    item({
      id: "s0-about",
      title: "About page partnership origin story",
      date: toISODate(dayOffset(s0, 2)),
      dateLabel: formatDisplayDate(dayOffset(s0, 2)),
      owner: "Both",
      kind: "content",
      sprint: 0,
      notes: "Tina brainchild + Evelyn partnership framing (T-004) — public-facing",
    }),
    item({
      id: "s0-content-factory",
      title: "Content Factory weekly batch cadence",
      date: toISODate(dayOffset(s0, 4)),
      dateLabel: formatDisplayDate(dayOffset(s0, 4)),
      owner: "Both",
      kind: "content",
      sprint: 0,
      notes: "YT shorts hooks, FB, newsletter for launch week (T-007)",
    }),
    item({
      id: "s1-contact",
      title: "Contact page + inbox routing",
      date: toISODate(dayOffset(s1, 1)),
      dateLabel: formatDisplayDate(dayOffset(s1, 1)),
      owner: "Evelyn",
      kind: "rollout",
      sprint: 1,
      notes: "Public Contact page before go-live (T-005)",
    }),
    item({
      id: "s1-video-review",
      title: "Evelyn reviews Kevina launch videos",
      date: toISODate(dayOffset(s1, 2)),
      dateLabel: formatDisplayDate(dayOffset(s1, 2)),
      owner: "Evelyn",
      kind: "content",
      sprint: 1,
      notes: "Task T-014 — launch-week social assets",
    }),
    item({
      id: "s1-copy-pass",
      title: "Public side hustle pages verbiage pass",
      date: toISODate(dayOffset(s1, 4)),
      dateLabel: formatDisplayDate(dayOffset(s1, 4)),
      owner: "Both",
      kind: "content",
      sprint: 1,
      notes: "Main public hustle cards + Get Your Side Hustle copy (T-017) — before soft launch",
    }),
    item({
      id: "s0-kevina",
      title: "Kevina Glow Getter launch assets",
      date: toISODate(dayOffset(s1, 3)),
      dateLabel: formatDisplayDate(dayOffset(s1, 3)),
      owner: "Tina",
      kind: "launch",
      sprint: 1,
      notes: "Plan/film 4 episodes for launch week (T-008)",
    }),
    item({
      id: "s2-world-launch",
      title: "Introduce GYSH website + Facebook Page to the world",
      date: toISODate(dayOffset(s2, 5)),
      dateLabel: formatDisplayDate(dayOffset(s2, 5)),
      owner: "Both",
      kind: "launch",
      sprint: 2,
      notes: "Soft launch end of Sprint 2 (Sun Aug 2 / Mon Aug 3). Share FB Page + getyoursidehustle.com.",
    }),
    item({
      id: "s2-public-qa",
      title: "Public smoke check before go-live",
      date: toISODate(dayOffset(s2, 3)),
      dateLabel: formatDisplayDate(dayOffset(s2, 3)),
      owner: "Unassigned",
      kind: "sprint",
      sprint: 2,
      notes: "Home, About, Contact, Kids intro, login — public paths only. Deep admin/QA after launch.",
    }),
    // Post-launch (Sprint 3+) — conference dates, niche pages, deep content
    planItemOnSprintDay(3, 1, {
      id: "s0-workshops",
      title: "Review workshops and conference dates",
      owner: "Unassigned",
      kind: "content",
      notes: "Post-launch — dates TBD until confirmed (T-018). Edit in Content Factory → Workshops.",
    }, ref),
    planItemOnSprintDay(3, 2, {
      id: "s2-seo",
      title: "Adult hustle SEO landing pages",
      owner: "Evelyn",
      kind: "launch",
      notes: "Post-launch depth: Airbnb, POD, Dropshipping landings (T-009)",
    }, ref),
    planItemOnSprintDay(3, 3, {
      id: "s2-safety-pdf",
      title: "Parent safety checklist PDF",
      owner: "Tina",
      kind: "launch",
      notes: "Post-launch Junior safety asset (T-010)",
    }, ref),
    planItemOnSprintDay(1, 2, {
      id: "bl-newsletter",
      title: "Dual-audience newsletter template",
      owner: "Unassigned",
      kind: "content",
      notes: "Ready for launch-week announce · Sprint 1",
    }, ref),
    planItemOnSprintDay(3, 2, {
      id: "bl-training-waitlists",
      title: "Training Circle waitlist CTAs",
      owner: "Unassigned",
      kind: "launch",
      notes: "Post-launch growth — Agents, Websites, Meta+Shopify, POD",
    }, ref),
    planItemOnSprintDay(3, 4, {
      id: "bl-qa-cycle",
      title: "QA ↔ Dev retest cycle polish",
      owner: "Unassigned",
      kind: "sprint",
      notes: "Internal tooling after go-public · Sprint 3",
    }, ref),
    planItemOnSprintDay(4, 1, {
      id: "bl-ai-brainstorm",
      title: "AI sidekick hustle brainstorm",
      owner: "Both",
      kind: "rollout",
      notes: "Capture fits for catalog + Get Your Side Hustle (T-016) · Sprint 4",
    }, ref),
    planItemOnSprintDay(4, 3, {
      id: "bl-mentor-listings",
      title: "Paid mentor listings sketch",
      owner: "Unassigned",
      kind: "rollout",
      notes: "Featured mentors from Training Circle graduates · Sprint 4",
    }, ref),
  ];

  return items;
}

/** Legacy helper used by older tests — includes weekly sync as calendar meetings. */
export function weeklySyncForSprint(sprint: SprintWindow): ContentCalendarItem {
  return {
    id: `meet-sprint-${sprint.index}`,
    title: "T + E weekly sync",
    date: toISODate(sprint.start),
    dateLabel: `${WEEKDAY_SHORT[sprint.start.getDay()]} ${formatDisplayDate(sprint.start)} · 10:00 AM`,
    owner: "Both",
    kind: "meeting",
    sprint: sprint.index,
    notes: "Recurring partner sync — agenda: blockers, content, launch assets",
    status: "todo",
  };
}

/** @deprecated Prefer buildDefaultPlanItems + ceremoniesForSprint. */
export function buildRolloutCalendar(ref: Date = new Date()): ContentCalendarItem[] {
  const items = buildDefaultPlanItems(ref).filter((i) => i.sprint !== BACKLOG_SPRINT);
  const s0 = getSprintWindow(0, ref);
  const s1 = getSprintWindow(1, ref);
  const s2 = getSprintWindow(2, ref);
  return [...items, weeklySyncForSprint(s0), weeklySyncForSprint(s1), weeklySyncForSprint(s2)].sort(
    (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title),
  );
}

export function newPlanItemId(): string {
  return `plan-${crypto.randomUUID().slice(0, 8)}`;
}

export function newRetroCardId(): string {
  return `retro-${crypto.randomUUID().slice(0, 8)}`;
}
