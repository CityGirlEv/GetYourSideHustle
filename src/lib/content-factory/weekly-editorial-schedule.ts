import {
  CONTENT_TYPE_LABELS,
  WEEKLY_CONTENT_BATCH_PLAN,
  type ContentAssetType,
} from "@/lib/content-factory/types";
import { withStandaloneEditorialEvents } from "@/lib/content-factory/facebook-ad-launch";
import { editorialDefaultTitlesForWeek } from "@/lib/content-factory/editorial-week-topics";
import { listPublishedArticles } from "@/lib/articles";

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
  /** Set when a milestone is already satisfied (e.g. article live in Learning Center). */
  alreadyComplete?: boolean;
  /** Override default checklist time (24h HH:mm). */
  actionTime?: string;
}

/** Friday (YYYY-MM-DD) when Week 1 content publishing and social posting begin. */
export const EDITORIAL_ROUND_START_DATE = "2026-06-19";

/** Friday (YYYY-MM-DD) when Privacy Policy, Terms, and /about went live. */
export const EDITORIAL_LEGAL_COMPLETE_DATE = "2026-06-19";

/** Delaware LLC + EIN confirmed before the June 19 go-live. */
export const EDITORIAL_ENTITY_READY_DATE = "2026-06-19";

/** @deprecated Use EDITORIAL_ROUND_START_DATE — Week 1 is a Friday kickoff, not Saturday. */
export const EDITORIAL_LAUNCH_WEEK_SATURDAY = EDITORIAL_ROUND_START_DATE;

/** @deprecated Same as EDITORIAL_ROUND_START_DATE */
export const EDITORIAL_EARLIEST_LAUNCH_FRIDAY = EDITORIAL_ROUND_START_DATE;

/** @deprecated Use EDITORIAL_ROUND_START_DATE */
export const EDITORIAL_LAUNCH_WEEK_MONDAY = EDITORIAL_ROUND_START_DATE;

/** When at least this many articles are live, Week 1 promotes the library instead of "Article 1". */
export const EDITORIAL_EXISTING_LIBRARY_THRESHOLD = 10;

export function publishedLearningCenterArticleCount(): number {
  return listPublishedArticles().length;
}

export function hasExistingArticleLibrary(
  publishedCount = publishedLearningCenterArticleCount(),
): boolean {
  return publishedCount >= EDITORIAL_EXISTING_LIBRARY_THRESHOLD;
}

export const PRE_LAUNCH_NOTE =
  "Pre-launch sprint targets Friday, June 19, 2026: legal documents complete and the first public Facebook post. Delaware LLC and EIN are confirmed.";

export const PRE_LAUNCH_GUIDANCE =
  "Friday, June 19: legal pages (Privacy, Terms, /about) are complete. First Facebook post publishes today — Week 1 editorial calendar runs June 19–25.";

export const LAUNCH_WEEK_NOTE =
  "Week 1 (Jun 19–25): legal documents completed and the first Facebook post went live Friday, June 19. Continue the Week 1 calendar — invite followers Wednesday, June 24 once a second post is live.";

export function editorialLaunchWeekNote(
  publishedCount = publishedLearningCenterArticleCount(),
): string {
  if (hasExistingArticleLibrary(publishedCount)) {
    return `Week 1 (Jun 19–25): legal complete and welcome Facebook post live since Friday, June 19. ${publishedCount} Learning Center articles are already published — link posts to cornerstone articles. New Content Factory articles are #${publishedCount + 1}+. Invite followers Wednesday, June 24 once two posts are up.`;
  }
  return LAUNCH_WEEK_NOTE;
}

export function editorialPreLaunchNote(
  publishedCount = publishedLearningCenterArticleCount(),
): string {
  if (hasExistingArticleLibrary(publishedCount)) {
    return `${publishedCount} Learning Center articles are already published. Content and social publishing begin Friday, June 19, 2026 — legal documents complete that same day. Week 1 focuses on Facebook rollout, newsletter, and lead magnet.`;
  }
  return PRE_LAUNCH_NOTE;
}

export const FB_PAGE_INVITE_GUIDANCE =
  "First Facebook post published Friday, June 19. Send follow invites Wednesday, June 24 once a second post is live and the page has at least two posts.";

/** @deprecated Catch-up mode removed — use pre-launch weeks until EDITORIAL_LAUNCH_WEEK_SATURDAY. */
export const CATCH_UP_WEEK_NOTE = PRE_LAUNCH_NOTE;

/** Offsets from Saturday (0) through Friday (6) for each weekly asset slot. */
interface SlotSchedule {
  produceDay: number;
  launchDay: number | null;
}

/** Week 1 kickoff schedules (day 0 = Friday June 19). */
/** Week 1 kickoff when cornerstone articles are already live — no new article on day 0. */
const FRIDAY_KICKOFF_ARTICLE_EXISTING_LIBRARY: SlotSchedule[] = [
  { produceDay: 1, launchDay: 4 },
  { produceDay: 2, launchDay: 3 }, // Medigap article launch Mon Jun 22 (day after Sunday draft)
  { produceDay: 3, launchDay: 6 },
];

const FRIDAY_KICKOFF_ARTICLE: SlotSchedule[] = [
  { produceDay: 0, launchDay: 0 },
  { produceDay: 1, launchDay: 4 },
  { produceDay: 2, launchDay: 6 },
];

const FRIDAY_KICKOFF_FACEBOOK: SlotSchedule[] = [
  { produceDay: 0, launchDay: 0 },
  { produceDay: 1, launchDay: 4 },
  { produceDay: 2, launchDay: 6 },
  { produceDay: 1, launchDay: 1 },
  { produceDay: 2, launchDay: 2 },
  { produceDay: 3, launchDay: 3 },
  { produceDay: 4, launchDay: 4 },
  { produceDay: 1, launchDay: 1 },
];

/** Week 1 when 10+ articles are already live — FB article promos align with article launch days. */
const FRIDAY_KICKOFF_FACEBOOK_EXISTING_LIBRARY: SlotSchedule[] = [
  { produceDay: 1, launchDay: 4 }, // slot 0 — Prior Auth promo (Tue Jun 23)
  { produceDay: 2, launchDay: 2 }, // slot 1 — Medigap promo Sun Jun 21 (with draft day; not repeated Wed)
  { produceDay: 3, launchDay: 6 }, // slot 2 — $0 premium promo (Thu Jun 25)
  { produceDay: 1, launchDay: 1 }, // slot 3 — workbook page post (Sat Jun 20)
  { produceDay: 2, launchDay: 2 }, // slot 4 — TV ads tip (Sun Jun 21)
  { produceDay: 3, launchDay: 3 }, // slot 5 — doctor network (Mon Jun 22; early publish overrides)
  { produceDay: 4, launchDay: 3 }, // slot 6 — Part D tip (Mon Jun 22, off Jun 23)
  { produceDay: 1, launchDay: 2 }, // slot 7 — workbook personal share (Sun Jun 21, with PDF launch)
];

const FRIDAY_KICKOFF_SINGLE: Record<"newsletter" | "lead_magnet" | "faq", SlotSchedule> = {
  newsletter: { produceDay: 1, launchDay: 2 },
  lead_magnet: { produceDay: 1, launchDay: 2 }, // Sat produce → Sun Jun 21 launch (with newsletter)
  faq: { produceDay: 3, launchDay: 5 },
};

const FRIDAY_KICKOFF_IMAGE: SlotSchedule[] = [
  { produceDay: 0, launchDay: 0 },
  { produceDay: 1, launchDay: 4 },
  { produceDay: 2, launchDay: 6 },
  { produceDay: 3, launchDay: 6 },
  { produceDay: 3, launchDay: 6 },
];

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
  { produceDay: 2, launchDay: 2 }, // Slot 3 (Workbook page post) -> Mon
  { produceDay: 3, launchDay: 3 }, // Slot 4 (TV ads) -> Tue
  { produceDay: 0, launchDay: 0 }, // Slot 5 — scheduled via DOCTOR_NETWORK_CONTENT_DATE
  { produceDay: 1, launchDay: 1 }, // Slot 6 (Part D formulary) -> Sun
  { produceDay: 3, launchDay: 5 }, // Slot 7 (Workbook personal share) -> Thu with lead magnet launch
];

/** Doctor-network article + Facebook post 5 — early publish (before Week 1 kickoff). */
export const DOCTOR_NETWORK_CONTENT_DATE = "2026-06-09";

export const DOCTOR_NETWORK_ARTICLE_TITLE = "Is Your Doctor In Network for Next Year?";

export const DOCTOR_NETWORK_ARTICLE_SLUG = "is-your-doctor-in-network-next-year";

const DOCTOR_NETWORK_FB_SLOT = 5;

function weekIncludesIsoDate(weekStart: Date, isoDate: string): boolean {
  const start = editorialWeekStart(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const target = parseIsoDate(isoDate);
  return target >= start && target <= end;
}

export function isDoctorNetworkContentWeek(weekStart: Date): boolean {
  return weekIncludesIsoDate(weekStart, DOCTOR_NETWORK_CONTENT_DATE);
}

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
      title: "Delaware LLC + EIN — confirmed",
      detail:
        "Entity formation and IRS EIN complete. Save the exact legal name for Privacy Policy, Terms, email footers, and /about.",
    },
    {
      day: 3,
      title: "Business bank + legal page drafts",
      detail:
        "Open or confirm business bank account. Draft Privacy Policy, Terms, and /about with the Delaware LLC legal name.",
    },
    {
      day: 4,
      title: "Review Content Factory Week 1 drafts",
      detail: "Edit welcome Facebook post and Week 1 assets offline — target first post Friday, June 19.",
    },
    {
      day: 5,
      title: "Facebook page + email domain",
      detail:
        "Create or verify the Facebook page. Confirm Resend/domain. Pre-stage welcome post for June 19.",
    },
    {
      day: 6,
      title: "Pre-stage Week 1 launch",
      detail:
        "Final proofread of legal pages and welcome post. Go live Friday, June 19 (legal complete + first post).",
    },
  ],
  1: [
    {
      day: 2,
      title: "Delaware LLC + EIN — confirmed",
      detail:
        "Formation and EIN on file. Use the exact legal entity name on all public legal pages and email footers.",
    },
    {
      day: 3,
      title: "Business bank account",
      detail: "Open or confirm the business bank account with EIN confirmation and operating agreement on file.",
    },
    {
      day: 4,
      title: "Legal pages drafted",
      detail:
        "Privacy Policy, Terms, and /about finalized with Delaware LLC name and TPMO disclaimers.",
    },
    {
      day: 5,
      title: "Legal pages deployed",
      detail: "Privacy, Terms, and /about live on production — ready for the June 19 public launch.",
    },
    {
      day: 6,
      title: "Go live — legal complete + first post",
      detail:
        "Friday, June 19: all legal documents complete. Publish the welcome Facebook post and begin Week 1 editorial calendar.",
    },
  ],
};

export function editorialLaunchWeekStart(): Date {
  return parseIsoDate(EDITORIAL_ROUND_START_DATE);
}

/** Editorial week anchor: Friday kickoff for Week 1, then Saturday-start weeks. */
export function editorialWeekStart(date: Date): Date {
  const launch = editorialLaunchWeekStart();
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  if (d < launch) {
    return startOfWeekSaturday(d);
  }

  const launchWeekEnd = new Date(launch);
  launchWeekEnd.setDate(launchWeekEnd.getDate() + 6);
  if (d <= launchWeekEnd) {
    return new Date(launch);
  }

  const week2Saturday = new Date(launchWeekEnd);
  week2Saturday.setDate(week2Saturday.getDate() + 1);

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSince = Math.floor((d.getTime() - week2Saturday.getTime()) / msPerDay);
  const weekIndex = Math.max(0, Math.floor(daysSince / 7));
  const ws = new Date(week2Saturday);
  ws.setDate(ws.getDate() + weekIndex * 7);
  return ws;
}

/** @deprecated Use editorialLaunchWeekStart */
export function editorialLaunchWeekMonday(): Date {
  return editorialLaunchWeekStart();
}

export function formatEarliestLaunchLabel(): string {
  const start = parseIsoDate(EDITORIAL_ROUND_START_DATE);
  return start.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatLaunchWeekLabel(): string {
  return editorialWeekLabel(editorialLaunchWeekStart());
}

/** Whole weeks before the Friday kickoff (pre-launch sprint weeks only). */
export function weeksBeforeLaunch(weekStart: Date): number {
  if (!isPreLaunchWeek(weekStart)) return 0;
  const week = startOfWeekSaturday(weekStart);
  const launch = editorialLaunchWeekStart();
  const diffDays = Math.round((launch.getTime() - week.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil(diffDays / 7);
}

export function isPreLaunchWeek(weekStart: Date): boolean {
  return editorialWeekStart(weekStart) < editorialLaunchWeekStart();
}

export function isLaunchWeek(weekStart: Date): boolean {
  return formatIsoDate(editorialWeekStart(weekStart)) === EDITORIAL_ROUND_START_DATE;
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

/** Wednesday of the current editorial week (day 5 from Friday kickoff, day 4 from Saturday start). */
export function wednesdayOfWeek(weekStart: Date): Date {
  const start = editorialWeekStart(weekStart);
  const d = new Date(start);
  d.setDate(d.getDate() + (isFridayKickoffWeek(start) ? 5 : 4));
  return d;
}

export interface BuildWeeklyEditorialCalendarOptions {
  weekStart?: Date;
  titles?: Record<string, string>;
  publishedArticleCount?: number;
  draftStatusBySlot?: Record<string, string>;
  /** When workbook PDF is saved to public/downloads/, hide launch and mark produce done. */
  leadMagnetPdfSavedBySlot?: Record<string, boolean>;
  /** Skip Facebook post launch rows when that slot was checked off on any earlier day. */
  completedFacebookPostSlots?: Set<number>;
}

/** @deprecated Use BuildWeeklyEditorialCalendarOptions */
export type BuildEditorialCalendarOptions = BuildWeeklyEditorialCalendarOptions & { today?: Date };

/** Pre-launch setup weeks, then standard content from launch week onward. */
export function buildEditorialCalendar(
  options: BuildWeeklyEditorialCalendarOptions & { today?: Date } = {},
): EditorialCalendarEvent[] {
  const today = options.today ?? new Date();
  const weekStart = editorialWeekStart(options.weekStart ?? today);
  if (isPreLaunchWeek(weekStart)) {
    const prelaunch = buildPreLaunchEditorialCalendar(weekStart);
    const earlyDoctor = isDoctorNetworkContentWeek(weekStart)
      ? buildDoctorNetworkEarlyEvents({ titles: options.titles })
      : [];
    return [...prelaunch, ...earlyDoctor].sort(
      (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title),
    );
  }
  return buildWeeklyEditorialCalendar({
    weekStart,
    titles: options.titles,
    publishedArticleCount: options.publishedArticleCount,
    draftStatusBySlot: options.draftStatusBySlot,
  });
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

function slotLabel(
  type: ContentAssetType,
  slotIndex: number,
  count: number,
  articleNumber?: number,
): string {
  if (type === "article" && articleNumber != null) {
    return count > 1 ? `Learning Center Article ${articleNumber}` : `Learning Center Article ${articleNumber}`;
  }
  const base = CONTENT_TYPE_LABELS[type];
  return count > 1 ? `${base} ${slotIndex + 1}` : base;
}

export function editorialWeekIndex(weekStart: Date): number {
  const anchor = editorialLaunchWeekStart();
  const ws = editorialWeekStart(weekStart);
  if (ws < anchor) return -1;
  if (formatIsoDate(ws) === EDITORIAL_ROUND_START_DATE) return 0;
  const week2Saturday = new Date(anchor);
  week2Saturday.setDate(week2Saturday.getDate() + 7);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSince = Math.floor((ws.getTime() - week2Saturday.getTime()) / msPerDay);
  return 1 + Math.max(0, Math.floor(daysSince / 7));
}

function articleNumberForSlot(
  slotIndex: number,
  weekStart: Date,
  publishedArticleCount: number,
): number {
  const weekIndex = Math.max(0, editorialWeekIndex(weekStart));
  return publishedArticleCount + weekIndex * 3 + slotIndex + 1;
}

function isFridayKickoffWeek(weekStart: Date): boolean {
  return formatIsoDate(weekStart) === EDITORIAL_ROUND_START_DATE;
}

function scheduleForType(
  type: ContentAssetType,
  slotIndex: number,
  weekStart: Date,
  publishedArticleCount: number,
): SlotSchedule {
  if (isFridayKickoffWeek(weekStart)) {
    switch (type) {
      case "article":
        if (hasExistingArticleLibrary(publishedArticleCount)) {
          return FRIDAY_KICKOFF_ARTICLE_EXISTING_LIBRARY[slotIndex] ?? FRIDAY_KICKOFF_ARTICLE_EXISTING_LIBRARY[0];
        }
        return FRIDAY_KICKOFF_ARTICLE[slotIndex] ?? FRIDAY_KICKOFF_ARTICLE[0];
      case "facebook_post":
        if (hasExistingArticleLibrary(publishedArticleCount)) {
          return (
            FRIDAY_KICKOFF_FACEBOOK_EXISTING_LIBRARY[slotIndex] ??
            FRIDAY_KICKOFF_FACEBOOK_EXISTING_LIBRARY[0]
          );
        }
        return FRIDAY_KICKOFF_FACEBOOK[slotIndex] ?? FRIDAY_KICKOFF_FACEBOOK[0];
      case "newsletter":
        return FRIDAY_KICKOFF_SINGLE.newsletter;
      case "lead_magnet":
        return FRIDAY_KICKOFF_SINGLE.lead_magnet;
      case "faq":
        return FRIDAY_KICKOFF_SINGLE.faq;
      case "image_prompt":
        return FRIDAY_KICKOFF_IMAGE[slotIndex] ?? FRIDAY_KICKOFF_IMAGE[0];
    }
  }
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

function shouldEmitEditorialCalendarEvent(
  type: ContentAssetType,
  milestone: EditorialMilestone,
): boolean {
  if (type === "image_prompt") return false;
  if (type === "facebook_post" && milestone === "produce") return false;
  return true;
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
      return "Generate or attach image, copy post, publish to Facebook page";
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

function buildDoctorNetworkEarlyEvents(
  options: Pick<BuildWeeklyEditorialCalendarOptions, "titles">,
): EditorialCalendarEvent[] {
  const customFbTitle = options.titles?.[`facebook_post:${DOCTOR_NETWORK_FB_SLOT}`];
  const fbTitle = customFbTitle ?? "Is your doctor in network for next year?";

  return [
    {
      id: "early:doctor-network:article:produce",
      type: "article",
      slotIndex: 100,
      milestone: "produce",
      title: DOCTOR_NETWORK_ARTICLE_TITLE,
      date: DOCTOR_NETWORK_CONTENT_DATE,
      detail: milestoneDetail("article", "produce"),
      category: "content",
    },
    {
      id: "early:doctor-network:article:launch",
      type: "article",
      slotIndex: 100,
      milestone: "launch",
      title: DOCTOR_NETWORK_ARTICLE_TITLE,
      date: DOCTOR_NETWORK_CONTENT_DATE,
      detail: milestoneDetail("article", "launch"),
      category: "content",
    },
    {
      id: `facebook_post:${DOCTOR_NETWORK_FB_SLOT}:launch`,
      type: "facebook_post",
      slotIndex: DOCTOR_NETWORK_FB_SLOT,
      milestone: "launch",
      title: fbTitle,
      date: DOCTOR_NETWORK_CONTENT_DATE,
      detail: milestoneDetail("facebook_post", "launch"),
      category: "content",
    },
  ];
}

/** Build produce + launch milestones for every asset in the weekly batch plan. */
export function buildWeeklyEditorialCalendar(
  options: BuildWeeklyEditorialCalendarOptions = {},
): EditorialCalendarEvent[] {
  const weekStart = editorialWeekStart(options.weekStart ?? new Date());
  const publishedArticleCount =
    options.publishedArticleCount ?? publishedLearningCenterArticleCount();
  const events: EditorialCalendarEvent[] = [];
  const kickoff = isFridayKickoffWeek(weekStart);
  const existingLibrary = hasExistingArticleLibrary(publishedArticleCount);
  const weekDefaultTitles = editorialDefaultTitlesForWeek(weekStart);

  if (kickoff && existingLibrary) {
    events.push({
      id: "library:promote",
      type: "facebook_post",
      slotIndex: -2,
      milestone: "launch",
      title: `Promote ${publishedArticleCount} live Learning Center articles`,
      date: addDays(weekStart, 0),
      detail:
        "Welcome Facebook post links to a cornerstone article — first post went live June 19; the library is already live.",
      category: "content",
      alreadyComplete: false,
    });
  }

  for (const slot of WEEKLY_CONTENT_BATCH_PLAN) {
    for (let i = 0; i < slot.count; i++) {
      if (slot.type === "facebook_post" && i === DOCTOR_NETWORK_FB_SLOT) {
        continue;
      }
      const schedule = scheduleForType(slot.type, i, weekStart, publishedArticleCount);
      const key = `${slot.type}:${i}`;
      const draftStatus = options.draftStatusBySlot?.[key];
      const draftAlreadyPublished = draftStatus === "published";
      const workbookPdfLive =
        slot.type === "lead_magnet" && options.leadMagnetPdfSavedBySlot?.[key] === true;
      const articleNumber =
        slot.type === "article" ? articleNumberForSlot(i, weekStart, publishedArticleCount) : undefined;
      const label = slotLabel(slot.type, i, slot.count, articleNumber);
      const customTitle = options.titles?.[key];
      const title = customTitle ?? weekDefaultTitles[key] ?? label;

      const milestones: EditorialMilestone[] = ["produce", "launch"];

      for (const milestone of milestones) {
        if (!shouldEmitEditorialCalendarEvent(slot.type, milestone)) continue;
        const dayOffset =
          milestone === "produce" ? schedule.produceDay : schedule.launchDay;
        if (dayOffset == null) continue;
        const facebookPostAlreadyDone =
          slot.type === "facebook_post" &&
          milestone === "launch" &&
          options.completedFacebookPostSlots?.has(i) === true;
        const launchAlreadyComplete =
          milestone === "launch" &&
          (draftAlreadyPublished || workbookPdfLive || facebookPostAlreadyDone);
        const produceAlreadyComplete =
          milestone === "produce" && (draftAlreadyPublished || workbookPdfLive);

        events.push({
          id: `${key}:${milestone}`,
          type: slot.type,
          slotIndex: i,
          milestone,
          title,
          date: addDays(weekStart, dayOffset),
          detail: milestoneDetail(slot.type, milestone),
          alreadyComplete: launchAlreadyComplete || produceAlreadyComplete || undefined,
        });
      }
    }
  }

  if (isDoctorNetworkContentWeek(weekStart)) {
    events.push(...buildDoctorNetworkEarlyEvents({ titles: options.titles }));
  }

  // Network follower invites — always Wednesday of the editorial week
  events.push({
    id: "facebook_invite:launch",
    type: "facebook_post",
    slotIndex: 99,
    milestone: "launch",
    title: "Invite network to follow Facebook page",
    date: formatIsoDate(wednesdayOfWeek(weekStart)),
    detail:
      "Wednesday invite day — run the pipeline, then invite_agent.py (see sub-steps on calendar)",
  });

  return events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function editorialWeekLabel(weekStart: Date): string {
  const start = editorialWeekStart(weekStart);
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
  const anchor = editorialWeekStart(weekStart);
  if (formatIsoDate(anchor) === EDITORIAL_ROUND_START_DATE) {
    if (weeks <= 0) return new Date(anchor);
    const week2Saturday = new Date(anchor);
    week2Saturday.setDate(week2Saturday.getDate() + 7);
    if (weeks === 1) return week2Saturday;
    const d = new Date(week2Saturday);
    d.setDate(d.getDate() + (weeks - 1) * 7);
    return d;
  }
  const d = startOfWeekSaturday(anchor);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function editorialWeekStartsBetween(startIso: string, endIso: string): Date[] {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  const seen = new Set<string>();
  const out: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const weekStart = editorialWeekStart(cursor);
    const key = formatIsoDate(weekStart);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(new Date(weekStart));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return out.sort((a, b) => a.getTime() - b.getTime());
}

/** Merge editorial events for every editorial week that touches the calendar month. */
export function buildEditorialCalendarForMonth(
  monthStart: Date,
  options: BuildWeeklyEditorialCalendarOptions & { today?: Date } = {},
): EditorialCalendarEvent[] {
  const month = monthStart.getMonth();
  const year = monthStart.getFullYear();
  const firstDay = new Date(year, month, 1, 12, 0, 0, 0);
  const lastDay = new Date(year, month + 1, 0, 12, 0, 0, 0);
  const weekStarts = editorialWeekStartsBetween(formatIsoDate(firstDay), formatIsoDate(lastDay));
  const events: EditorialCalendarEvent[] = [];

  for (const weekStart of weekStarts) {
    for (const event of buildEditorialCalendar({ ...options, weekStart })) {
      const eventDate = parseIsoDate(event.date);
      if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
        events.push(event);
      }
    }
  }

  return withStandaloneEditorialEvents(
    events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title)),
  );
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
  if (type === "facebook_post") {
    return EDITORIAL_ACTION_TIMES.facebook_post.launch;
  }
  return EDITORIAL_ACTION_TIMES[type][milestone];
}

/** UI label for calendar checklist rows. */
export function editorialMilestoneLabel(
  type: ContentAssetType,
  milestone: EditorialMilestone,
  slotIndex?: number,
): string {
  if (slotIndex === 98) {
    return milestone === "produce" ? "Prep ad" : "Ad live";
  }
  if (type === "facebook_post" && milestone === "launch") return "Post";
  return milestone === "produce" ? "Produce" : "Launch";
}

export function formatEditorialTimeLabel(time24: string): string {
  const [hourPart, minutePart] = time24.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}
