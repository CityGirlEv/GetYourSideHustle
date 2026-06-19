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
  /** Pre-launch business setup vs. public content publishing. */
  category?: "prelaunch" | "content";
}

/** Saturday (YYYY-MM-DD) when Week 1 begins — editorial weeks run Saturday through Friday. */
export const EDITORIAL_LAUNCH_WEEK_SATURDAY = "2026-06-20";

/** Optional first-publish day if LLC is ready before the Saturday kickoff (Friday go-live). */
export const EDITORIAL_EARLIEST_LAUNCH_FRIDAY = "2026-06-19";

/** @deprecated Use EDITORIAL_LAUNCH_WEEK_SATURDAY */
export const EDITORIAL_LAUNCH_WEEK_MONDAY = EDITORIAL_LAUNCH_WEEK_SATURDAY;

export const PRE_LAUNCH_NOTE =
  "Accelerated path: complete LLC, EIN, bank, and legal pages in one sprint week. No public posts until go/no-go passes. If the LLC is active by mid-week, you may publish Article 1 and the welcome Facebook post as early as Friday — otherwise start the content week Saturday.";

export const PRE_LAUNCH_GUIDANCE =
  "Target go-live: Friday evening or Saturday once LLC, legal pages, EIN, and bank account are confirmed. Do not invite followers until Article 1 is live. To launch earlier, set EDITORIAL_EARLIEST_LAUNCH_FRIDAY or EDITORIAL_LAUNCH_WEEK_SATURDAY in weekly-editorial-schedule.ts and deploy.";

export const LAUNCH_WEEK_NOTE =
  "Week 1: if you did not publish Friday, start the Saturday–Friday plan today. Publish Article 1 and the welcome Facebook post by Wednesday at the latest before inviting anyone to follow the page.";

export const FB_PAGE_INVITE_GUIDANCE =
  "Publish Article 1 and the Week 1 rollout Facebook post before inviting anyone. Send follow invites on Thursday once the page shows a live article link and at least two posts.";

/** @deprecated Catch-up mode removed — use pre-launch weeks until EDITORIAL_LAUNCH_WEEK_SATURDAY. */
export const CATCH_UP_WEEK_NOTE = PRE_LAUNCH_NOTE;

/** Offsets from Saturday (0) through Friday (6) for each weekly asset slot. */
interface SlotSchedule {
  produceDay: number;
  launchDay: number | null;
}

const ARTICLE_SCHEDULE: SlotSchedule[] = [
  { produceDay: 2, launchDay: 4 }, // Mon → Wed
  { produceDay: 3, launchDay: 5 }, // Tue → Thu
  { produceDay: 4, launchDay: 6 }, // Wed → Fri
];

/** One Facebook post per weekday + weekend pair. Coordinated with article launches on Wed/Thu/Fri. */
const FACEBOOK_SCHEDULE: SlotSchedule[] = [
  { produceDay: 4, launchDay: 4 }, // Slot 0 (Welcome / Article 1) -> Wed
  { produceDay: 5, launchDay: 5 }, // Slot 1 (Medigap / Article 2) -> Thu
  { produceDay: 6, launchDay: 6 }, // Slot 2 ($0 premium / Article 3) -> Fri
  { produceDay: 2, launchDay: 2 }, // Slot 3 (Still working at 65) -> Mon
  { produceDay: 3, launchDay: 3 }, // Slot 4 (TV ads) -> Tue
  { produceDay: 0, launchDay: 0 }, // Slot 5 (Is doctor in network) -> Sat
  { produceDay: 1, launchDay: 1 }, // Slot 6 (Part D formulary) -> Sun
];

const SINGLE_ASSET_SCHEDULE: Record<
  "newsletter" | "lead_magnet" | "faq",
  SlotSchedule
> = {
  newsletter: { produceDay: 5, launchDay: 1 }, // Thu draft → Sun send
  lead_magnet: { produceDay: 3, launchDay: 5 }, // Tue layout PDF → Thu landing page
  faq: { produceDay: 4, launchDay: 6 }, // Wed edit → Fri Learning Center
};

/** Image prompts are produced ahead of their paired article launch. */
const IMAGE_PROMPT_SCHEDULE: SlotSchedule[] = [
  { produceDay: 2, launchDay: 4 },
  { produceDay: 2, launchDay: 5 },
  { produceDay: 3, launchDay: 6 },
  { produceDay: 4, launchDay: 6 },
  { produceDay: 4, launchDay: 6 },
];

export const LEAD_MAGNET_PURPOSE =
  "A downloadable educational PDF workbook (e.g. Medicare at 65 Planning Workbook) offered in exchange for an email address. It helps visitors organize prescriptions, doctors, and enrollment questions before comparing plans — educational only, not enrollment advice.";

interface PreLaunchTaskTemplate {
  day: number;
  title: string;
  detail: string;
}

/** Tasks keyed by weeks before launch (2 = optional head start, 1 = one-week sprint). Days are Mon–Fri (offsets 2–6). */
const PRE_LAUNCH_WEEK_PLANS: Record<number, PreLaunchTaskTemplate[]> = {
  2: [
    {
      day: 2,
      title: "Choose LLC legal name & registered agent",
      detail:
        "Pick the entity name and agent now so you can file on Monday of sprint week (or today if ready).",
    },
    {
      day: 3,
      title: "Gather formation documents",
      detail: "Member info, operating agreement outline, and business address of record.",
    },
    {
      day: 4,
      title: "Review Content Factory Week 1 drafts",
      detail: "Edit copy offline only — no Facebook or Learning Center publishes yet.",
    },
    {
      day: 5,
      title: "Optional: file LLC early",
      detail:
        "If your state allows expedited filing, submit now to hit Friday/Saturday go-live. Otherwise wait for sprint week.",
    },
    {
      day: 6,
      title: "Hold — no public posts",
      detail: "Sprint week starts Monday. No marketing until go/no-go Friday.",
    },
  ],
  1: [
    {
      day: 2,
      title: "File LLC + confirm registered agent",
      detail:
        "Submit formation today. Save the exact legal entity name for Privacy Policy, Terms, and email footers.",
    },
    {
      day: 3,
      title: "Operating agreement + apply for EIN",
      detail: "Finalize ownership terms and apply at IRS.gov once filing is accepted (or same day if eligible).",
    },
    {
      day: 4,
      title: "Business bank account + legal pages",
      detail:
        "Open the bank account with EIN confirmation. Update Privacy Policy, Terms, and /about with the LLC name — deploy.",
    },
    {
      day: 5,
      title: "Facebook page, email domain, pre-stage Article 1",
      detail:
        "Create the Facebook page and draft posts (unpublished). Verify Resend/domain. Generate Article 1 hero image and proofread welcome post.",
    },
    {
      day: 6,
      title: "Go / no-go — go live Friday or Saturday",
      detail:
        "LLC active, EIN, bank, legal pages, and disclaimers confirmed? Green → publish Article 1 + welcome Facebook post Friday evening, or start the full content week Saturday. Red → push EDITORIAL_LAUNCH_WEEK_SATURDAY forward.",
    },
  ],
};

export function editorialLaunchWeekStart(): Date {
  return startOfWeekSaturday(parseIsoDate(EDITORIAL_LAUNCH_WEEK_SATURDAY));
}

/** @deprecated Use editorialLaunchWeekStart */
export function editorialLaunchWeekMonday(): Date {
  return editorialLaunchWeekStart();
}

export function formatEarliestLaunchLabel(): string {
  const fri = parseIsoDate(EDITORIAL_EARLIEST_LAUNCH_FRIDAY);
  return fri.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
}

export function formatLaunchWeekLabel(): string {
  return editorialWeekLabel(editorialLaunchWeekStart());
}

/** Whole weeks between weekStart Saturday and launch Saturday (0 = launch week, 1 = week before, etc.). */
export function weeksBeforeLaunch(weekStart: Date): number {
  const week = startOfWeekSaturday(weekStart);
  const launch = editorialLaunchWeekStart();
  const diffDays = Math.round((launch.getTime() - week.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(0, Math.floor(diffDays / 7));
}

export function isPreLaunchWeek(weekStart: Date): boolean {
  const week = startOfWeekSaturday(weekStart);
  return week < editorialLaunchWeekStart();
}

export function isLaunchWeek(weekStart: Date): boolean {
  return formatIsoDate(startOfWeekSaturday(weekStart)) === formatIsoDate(editorialLaunchWeekStart());
}

/** @deprecated Replaced by isPreLaunchWeek — catch-up mode is no longer used. */
export function isCatchUpWeek(_weekStartMonday: Date, _today = new Date()): boolean {
  return false;
}

export function buildPreLaunchEditorialCalendar(
  weekStartInput: Date,
): EditorialCalendarEvent[] {
  const weekStart = startOfWeekSaturday(weekStartInput);
  const weeksOut = weeksBeforeLaunch(weekStart);
  if (weeksOut === 0) return [];
  const planKey = weeksOut >= 2 ? 2 : 1;
  const plan = PRE_LAUNCH_WEEK_PLANS[planKey];
  if (!plan) {
    return [];
  }

  return plan.map((task, index) => ({
    id: `prelaunch:${weeksOut}:${index}`,
    type: "faq" as ContentAssetType,
    slotIndex: -100 - index,
    milestone: "produce" as EditorialMilestone,
    title: task.title,
    date: addDays(weekStart, task.day),
    detail: task.detail,
    category: "prelaunch" as const,
  }));
}

/** Wednesday of the Saturday-start week containing `weekStart`. */
export function wednesdayOfWeek(weekStart: Date): Date {
  const d = startOfWeekSaturday(weekStart);
  d.setDate(d.getDate() + 4);
  return d;
}

/** Pre-launch setup weeks, then standard Sat–Fri content from launch week onward. */
export function buildEditorialCalendar(
  options: BuildWeeklyEditorialCalendarOptions & { today?: Date } = {},
): EditorialCalendarEvent[] {
  const today = options.today ?? new Date();
  const weekStart = startOfWeekSaturday(options.weekStart ?? today);
  if (isPreLaunchWeek(weekStart)) {
    return buildPreLaunchEditorialCalendar(weekStart);
  }
  return buildWeeklyEditorialCalendar({ weekStart, titles: options.titles });
}

export function startOfWeekSaturday(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 6 ? 0 : day === 0 ? -1 : -(day + 1);
  d.setDate(d.getDate() + diff);
  return d;
}

/** @deprecated Use startOfWeekSaturday — editorial weeks begin on Saturday. */
export function startOfWeekMonday(date: Date): Date {
  return startOfWeekSaturday(date);
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
  const weekStart = startOfWeekSaturday(options.weekStart ?? new Date());
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

  // Network follower invites on Thursday (day 5)
  events.push({
    id: "facebook_invite:launch",
    type: "facebook_post",
    slotIndex: 99,
    milestone: "launch",
    title: "Invite network to follow Facebook page",
    date: addDays(weekStart, 5),
    detail: "Send follow invites once Article 2 is live and you have at least two posts",
  });

  return events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function editorialWeekLabel(weekStart: Date): string {
  const start = startOfWeekSaturday(weekStart);
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
  const d = startOfWeekSaturday(weekStart);
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
