import {
  CONTENT_TYPE_LABELS,
  WEEKLY_CONTENT_BATCH_PLAN,
  type ContentAssetType,
} from "@/lib/content-factory/types";

/** Produce (write/design) vs launch (publish/send/go-live). */
export type EditorialMilestone = "produce" | "launch";

export interface EditorialCalendarEvent {
  id: string;
  type: ContentAssetType;
  slotIndex: number;
  milestone: EditorialMilestone;
  title: string;
  date: string; // YYYY-MM-DD
  detail: string;
}

/** Offsets from Monday (0) through Sunday (6) for each weekly asset slot. */
interface SlotSchedule {
  produceDay: number;
  launchDay: number | null;
}

const ARTICLE_SCHEDULE: SlotSchedule[] = [
  { produceDay: 0, launchDay: 2 }, // Mon → Wed
  { produceDay: 1, launchDay: 3 }, // Tue → Thu
  { produceDay: 2, launchDay: 4 }, // Wed → Fri
];

/** One Facebook post per weekday + weekend pair. Coordinated with article launches on Wed/Thu/Fri. */
const FACEBOOK_SCHEDULE: SlotSchedule[] = [
  { produceDay: 2, launchDay: 2 }, // Slot 0 (Welcome / Article 1) -> Wed
  { produceDay: 3, launchDay: 3 }, // Slot 1 (Medigap / Article 2) -> Thu
  { produceDay: 4, launchDay: 4 }, // Slot 2 ($0 premium / Article 3) -> Fri
  { produceDay: 0, launchDay: 0 }, // Slot 3 (Still working at 65) -> Mon
  { produceDay: 1, launchDay: 1 }, // Slot 4 (TV ads) -> Tue
  { produceDay: 5, launchDay: 5 }, // Slot 5 (Is doctor in network) -> Sat
  { produceDay: 6, launchDay: 6 }, // Slot 6 (Part D formulary) -> Sun
];

const SINGLE_ASSET_SCHEDULE: Record<
  "newsletter" | "lead_magnet" | "faq",
  SlotSchedule
> = {
  newsletter: { produceDay: 3, launchDay: 6 }, // Thu draft → Sun send
  lead_magnet: { produceDay: 1, launchDay: 3 }, // Tue layout PDF → Thu landing page
  faq: { produceDay: 2, launchDay: 4 }, // Wed edit → Fri Learning Center
};

/** Image prompts are produced ahead of their paired article launch. */
const IMAGE_PROMPT_SCHEDULE: SlotSchedule[] = [
  { produceDay: 0, launchDay: 2 },
  { produceDay: 0, launchDay: 3 },
  { produceDay: 1, launchDay: 4 },
  { produceDay: 2, launchDay: 4 },
  { produceDay: 2, launchDay: 4 },
];

export const LEAD_MAGNET_PURPOSE =
  "A downloadable educational PDF workbook (e.g. Medicare at 65 Planning Workbook) offered in exchange for an email address. It helps visitors organize prescriptions, doctors, and enrollment questions before comparing plans — educational only, not enrollment advice.";

export const CATCH_UP_WEEK_NOTE =
  "Catch-up week: Mon–Tue are skipped. Production starts Wednesday. Navigate to next week for the standard Monday–Sunday schedule.";

export const FB_PAGE_INVITE_GUIDANCE =
  "Publish Article 1 and today's rollout Facebook post before inviting anyone. Send follow invites on Thursday once the page shows a live article link and at least two posts.";

/** Wednesday of the Monday-start week containing `weekStartMonday`. */
export function wednesdayOfWeek(weekStartMonday: Date): Date {
  const d = startOfWeekMonday(weekStartMonday);
  d.setDate(d.getDate() + 2);
  return d;
}

/** True when viewing the current calendar week and today is Wed–Sun (mid-week catch-up). */
export function isCatchUpWeek(weekStartMonday: Date, today = new Date()): boolean {
  const mon = startOfWeekMonday(weekStartMonday);
  const monToday = startOfWeekMonday(today);
  if (formatIsoDate(mon) !== formatIsoDate(monToday)) return false;
  const wed = wednesdayOfWeek(mon);
  const t = new Date(today);
  t.setHours(12, 0, 0, 0);
  return t >= wed;
}

interface CatchUpSlot {
  type: ContentAssetType;
  slotIndex: number;
  produceOffset: number;
  launchOffset: number;
  produceDetail?: string;
  launchDetail?: string;
}

/** Wed=0 … Sun=4. Skips Mon/Tue FB posts; compresses the batch into Wed–Sun. */
const CATCH_UP_FROM_WEDNESDAY: CatchUpSlot[] = [
  { type: "image_prompt", slotIndex: 0, produceOffset: 0, launchOffset: 0 },
  { type: "article", slotIndex: 0, produceOffset: 0, launchOffset: 0 },
  {
    type: "facebook_post",
    slotIndex: 0,
    produceOffset: 0,
    launchOffset: 0,
    launchDetail: "Rollout post — introduce the page + link to Article 1",
  },
  { type: "lead_magnet", slotIndex: 0, produceOffset: 0, launchOffset: 1 },
  { type: "faq", slotIndex: 0, produceOffset: 0, launchOffset: 2 },
  { type: "image_prompt", slotIndex: 1, produceOffset: 0, launchOffset: 1 },
  { type: "article", slotIndex: 1, produceOffset: 0, launchOffset: 1 },
  {
    type: "facebook_post",
    slotIndex: 1,
    produceOffset: 1,
    launchOffset: 1,
    launchDetail: "Share Article 2 + invite your network to follow the page",
  },
  { type: "newsletter", slotIndex: 0, produceOffset: 1, launchOffset: 4 },
  { type: "image_prompt", slotIndex: 2, produceOffset: 1, launchOffset: 2 },
  { type: "article", slotIndex: 2, produceOffset: 1, launchOffset: 2 },
  { type: "facebook_post", slotIndex: 2, produceOffset: 2, launchOffset: 2 },
  { type: "facebook_post", slotIndex: 3, produceOffset: 3, launchOffset: 3 },
  { type: "facebook_post", slotIndex: 4, produceOffset: 3, launchOffset: 4 },
  { type: "facebook_post", slotIndex: 5, produceOffset: 4, launchOffset: 4 },
];

export interface BuildCatchUpEditorialCalendarOptions {
  /** First day of catch-up (typically Wednesday of the current week). */
  catchUpStart: Date;
  titles?: Record<string, string>;
}

export function buildCatchUpEditorialCalendar(
  options: BuildCatchUpEditorialCalendarOptions,
): EditorialCalendarEvent[] {
  const base = new Date(options.catchUpStart);
  base.setHours(12, 0, 0, 0);
  const events: EditorialCalendarEvent[] = [];

  for (const slot of CATCH_UP_FROM_WEDNESDAY) {
    const key = `${slot.type}:${slot.slotIndex}`;
    const count =
      WEEKLY_CONTENT_BATCH_PLAN.find((s) => s.type === slot.type)?.count ?? 1;
    const label = slotLabel(slot.type, slot.slotIndex, count);
    const title = options.titles?.[key] ?? label;

    events.push({
      id: `${key}:produce:catchup`,
      type: slot.type,
      slotIndex: slot.slotIndex,
      milestone: "produce",
      title,
      date: addDays(base, slot.produceOffset),
      detail: slot.produceDetail ?? milestoneDetail(slot.type, "produce"),
    });

    events.push({
      id: `${key}:launch:catchup`,
      type: slot.type,
      slotIndex: slot.slotIndex,
      milestone: "launch",
      title,
      date: addDays(base, slot.launchOffset),
      detail: slot.launchDetail ?? milestoneDetail(slot.type, "launch"),
    });
  }

  // Push the network follower invite task for Thursday (Offset 1)
  events.push({
    id: "facebook_invite:launch:catchup",
    type: "facebook_post",
    slotIndex: 99,
    milestone: "launch",
    title: "Invite network to follow Facebook page",
    date: addDays(base, 1), // Thursday (Offset 1)
    detail: "Send follow invites once Article 2 is live and you have at least two posts",
  });

  return events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

/** Standard Mon–Sun plan, or Wed–Sun catch-up when viewing the current mid-week week. */
export function buildEditorialCalendar(
  options: BuildWeeklyEditorialCalendarOptions & { today?: Date } = {},
): EditorialCalendarEvent[] {
  const today = options.today ?? new Date();
  const weekStart = startOfWeekMonday(options.weekStart ?? today);
  if (isCatchUpWeek(weekStart, today)) {
    return buildCatchUpEditorialCalendar({
      catchUpStart: wednesdayOfWeek(weekStart),
      titles: options.titles,
    });
  }
  return buildWeeklyEditorialCalendar({ weekStart, titles: options.titles });
}

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return formatIsoDate(d);
}

function slotLabel(type: ContentAssetType, slotIndex: number, count: number): string {
  const base = CONTENT_TYPE_LABELS[type];
  return count > 1 ? `${base} ${slotIndex + 1}` : base;
}

function scheduleForType(type: ContentAssetType, slotIndex: number): SlotSchedule {
  switch (type) {
    case "article":
      return ARTICLE_SCHEDULE[slotIndex] ?? ARTICLE_SCHEDULE[0];
    case "facebook_post":
      return FACEBOOK_SCHEDULE[slotIndex] ?? FACEBOOK_SCHEDULE[0];
    case "newsletter":
      return SINGLE_ASSET_SCHEDULE.newsletter;
    case "lead_magnet":
      return SINGLE_ASSET_SCHEDULE.lead_magnet;
    case "faq":
      return SINGLE_ASSET_SCHEDULE.faq;
    case "image_prompt":
      return IMAGE_PROMPT_SCHEDULE[slotIndex] ?? IMAGE_PROMPT_SCHEDULE[0];
  }
}

function milestoneDetail(type: ContentAssetType, milestone: EditorialMilestone): string {
  if (milestone === "produce") {
    switch (type) {
      case "article":
        return "Draft, review, and TPMO-safe edits";
      case "facebook_post":
        return "Write post + compliance check";
      case "newsletter":
        return "Assemble digest and test send";
      case "lead_magnet":
        return "Finalize PDF workbook layout";
      case "faq":
        return "Edit accordion copy";
      case "image_prompt":
        return "Generate hero image prompt";
    }
  }
  switch (type) {
    case "article":
      return "Publish to Learning Center";
    case "facebook_post":
      return "Post to Facebook";
    case "newsletter":
      return "Send weekly email";
    case "lead_magnet":
      return "Publish download landing page";
    case "faq":
      return "Publish FAQ block";
    case "image_prompt":
      return "Attach hero to article go-live";
  }
}

export interface BuildWeeklyEditorialCalendarOptions {
  weekStart?: Date;
  /** Optional draft titles keyed by `${type}:${slotIndex}` */
  titles?: Record<string, string>;
}

/** Build produce + launch milestones for every asset in the weekly batch plan. */
export function buildWeeklyEditorialCalendar(
  options: BuildWeeklyEditorialCalendarOptions = {},
): EditorialCalendarEvent[] {
  const weekStart = startOfWeekMonday(options.weekStart ?? new Date());
  const events: EditorialCalendarEvent[] = [];

  for (const slot of WEEKLY_CONTENT_BATCH_PLAN) {
    for (let i = 0; i < slot.count; i++) {
      const schedule = scheduleForType(slot.type, i);
      const key = `${slot.type}:${i}`;
      const label = slotLabel(slot.type, i, slot.count);
      const customTitle = options.titles?.[key];
      const title = customTitle ?? label;

      events.push({
        id: `${key}:produce`,
        type: slot.type,
        slotIndex: i,
        milestone: "produce",
        title,
        date: addDays(weekStart, schedule.produceDay),
        detail: milestoneDetail(slot.type, "produce"),
      });

      if (schedule.launchDay != null) {
        events.push({
          id: `${key}:launch`,
          type: slot.type,
          slotIndex: i,
          milestone: "launch",
          title,
          date: addDays(weekStart, schedule.launchDay),
          detail: milestoneDetail(slot.type, "launch"),
        });
      }
    }
  }

  // Push the network follower invite task for Thursday (Day 3)
  events.push({
    id: "facebook_invite:launch",
    type: "facebook_post",
    slotIndex: 99,
    milestone: "launch",
    title: "Invite network to follow Facebook page",
    date: addDays(weekStart, 3), // Thursday (Day 3)
    detail: "Send follow invites once Article 2 is live and you have at least two posts",
  });

  return events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function editorialWeekLabel(weekStart: Date): string {
  const start = startOfWeekMonday(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function shiftWeekStart(weekStart: Date, weeks: number): Date {
  const d = startOfWeekMonday(weekStart);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

/** Recommended local times (24h HH:mm) for produce vs launch actions. */
const EDITORIAL_ACTION_TIMES: Record<
  ContentAssetType,
  Record<EditorialMilestone, string>
> = {
  article: { produce: "09:00", launch: "11:30" },
  facebook_post: { produce: "08:30", launch: "10:30" },
  newsletter: { produce: "14:00", launch: "08:00" },
  lead_magnet: { produce: "10:00", launch: "14:00" },
  faq: { produce: "11:00", launch: "15:00" },
  image_prompt: { produce: "08:00", launch: "11:00" },
};

export function editorialActionTime(
  type: ContentAssetType,
  milestone: EditorialMilestone,
): string {
  return EDITORIAL_ACTION_TIMES[type][milestone];
}

export function formatEditorialTimeLabel(time24: string): string {
  const [hourPart, minutePart] = time24.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}
