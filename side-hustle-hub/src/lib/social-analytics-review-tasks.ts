/**
 * Standing Task List items: social analytics review (every other day).
 * Paste platform Insights into Notes → Cursor reviews performance.
 */
import type { GyshTask, TaskAssignee, TaskCategory } from "./gysh-tasks";
import { currentSprintIndex, dueDateForSprint } from "./gysh-sprints";

export type SocialAnalyticsChannelId =
  | "facebook_gysh"
  | "instagram_gysh"
  | "tiktok_gysh"
  | "youtube_gysh"
  | "facebook_kevina"
  | "youtube_kevina"
  | "personal_evelyn"
  | "personal_tina";

export type SocialAnalyticsChannelDef = {
  id: SocialAnalyticsChannelId;
  taskId: string;
  label: string;
  assignedTo: TaskAssignee;
  category: TaskCategory;
  /** Where to open Insights / Analytics. */
  openUrl?: string;
  /** Exact copy-paste checklist for Notes. */
  pullInstructions: string;
};

const CADENCE_BLURB = [
  "CADENCE: Every other day (standing task).",
  "After you paste metrics and Cursor reviews: set Due Date +2 days, status → Not Started, clear Done checkboxes — do not retire this task.",
  "",
  "PASTE BLOCK — copy Insights numbers into Notes under this line (keep the marker line above intact):",
  "----- PASTE ANALYTICS BELOW -----",
].join("\n");

function facebookPagePull(pageLabel: string): string {
  return [
    `Platform: Facebook Page Insights — ${pageLabel}`,
    "Window: Last 2 days (or since last review).",
    "",
    "Pull & paste:",
    "1) Page followers — total + net change (±)",
    "2) Reach — unique people reached (Page + posts)",
    "3) Engagement — reactions + comments + shares (totals)",
    "4) Top 3 posts — for each: permalink URL, publish time, reach, reactions, comments, shares, any boost spend",
    "5) Best-performing content type (Reel / photo / link / video) if Insights shows it",
    "6) Any negative comments or messages worth a reply (quote 1–2)",
    "",
    "Optional: Screenshots of Insights Overview + Top posts attached to this task.",
  ].join("\n");
}

function personalFacebookPull(who: string): string {
  return [
    `Platform: Personal Facebook — ${who}`,
    "Window: Last 2 days (or since last review).",
    "",
    "Pull & paste:",
    "1) Posts you published or reshared about GYSH / Kevina / Soft Launch (permalink each)",
    "2) Per post: reactions, comments, shares, approximate reach/views if Professional Dashboard or Boost shows it",
    "3) Profile / Page follows gained from those posts (if shown)",
    "4) DMs or comments asking about GYSH (count + 1–2 quotes)",
    "5) Which personal post got the strongest response and why (1 sentence)",
    "",
    "If Professional mode Insights exist: paste Reach + Content interactions for the same window.",
  ].join("\n");
}

function instagramPull(): string {
  return [
    "Platform: Instagram Professional Insights — @getyoursidehustle (GYSH)",
    "Window: Last 2 days (or since last review).",
    "",
    "Pull & paste:",
    "1) Accounts reached",
    "2) Accounts engaged",
    "3) Profile visits + website taps",
    "4) Followers — total + net change (±)",
    "5) Top 3 posts/Reels — permalink, reach, likes, comments, saves, shares, plays (Reels)",
    "6) Audience top cities/ages if shown (one line)",
    "",
    "Optional: attach Insights screenshots.",
  ].join("\n");
}

function tiktokPull(): string {
  return [
    "Platform: TikTok Analytics — @getyoursidehustle (GYSH)",
    "Window: Last 2 days (or since last review).",
    "",
    "Pull & paste:",
    "1) Video views (period)",
    "2) Profile views",
    "3) Followers — total + net change (±)",
    "4) Likes / comments / shares (period totals)",
    "5) Top 3 videos — link, views, watch time %, likes, comments, shares, traffic source if shown",
    "6) Average watch % and any “For You” vs following split if available",
    "",
    "Optional: attach Analytics screenshots.",
  ].join("\n");
}

function youtubePull(channelLabel: string, url?: string): string {
  return [
    `Platform: YouTube Studio Analytics — ${channelLabel}${url ? ` (${url})` : ""}`,
    "Window: Last 2 days (or since last review).",
    "",
    "Pull & paste:",
    "1) Views",
    "2) Watch time (hours)",
    "3) Subscribers — gained / lost / net",
    "4) Impressions + impressions CTR (%) if shown",
    "5) Top 3 videos — title/URL, views, average view duration, CTR, likes, comments",
    "6) Traffic sources (top 3: e.g. Browse, Search, Suggested, External)",
    "7) Any new comments needing reply (quote)",
    "",
    "Optional: attach YouTube Studio Overview + Content screenshots.",
  ].join("\n");
}

/** Canonical channel roster for social analytics review tasks. */
export const SOCIAL_ANALYTICS_CHANNELS: readonly SocialAnalyticsChannelDef[] = [
  {
    id: "facebook_gysh",
    taskId: "T-SOC-FB-GYSH",
    label: "Facebook · GYSH",
    assignedTo: "Tina",
    category: "facebook_social",
    openUrl: "https://www.facebook.com/getyoursidehustleofficial",
    pullInstructions: facebookPagePull("Get Your Side Hustle (@getyoursidehustle / getyoursidehustleofficial)"),
  },
  {
    id: "instagram_gysh",
    taskId: "T-SOC-IG-GYSH",
    label: "Instagram · GYSH",
    assignedTo: "Evelyn",
    category: "launch_marketing",
    openUrl: "https://www.instagram.com/getyoursidehustle/",
    pullInstructions: instagramPull(),
  },
  {
    id: "tiktok_gysh",
    taskId: "T-SOC-TT-GYSH",
    label: "TikTok · GYSH",
    assignedTo: "Evelyn",
    category: "launch_marketing",
    openUrl: "https://www.tiktok.com/@getyoursidehustle",
    pullInstructions: tiktokPull(),
  },
  {
    id: "youtube_gysh",
    taskId: "T-SOC-YT-GYSH",
    label: "YouTube · GYSH",
    assignedTo: "Evelyn",
    category: "launch_marketing",
    pullInstructions: youtubePull("Get Your Side Hustle (GYSH)"),
  },
  {
    id: "facebook_kevina",
    taskId: "T-SOC-FB-KEVINA",
    label: "Facebook · Kevina Starr",
    assignedTo: "Tina",
    category: "facebook_social",
    pullInstructions: facebookPagePull("Kevina Starr"),
  },
  {
    id: "youtube_kevina",
    taskId: "T-SOC-YT-KEVINA",
    label: "YouTube · Kevina Starr Stories",
    assignedTo: "Evelyn",
    category: "youtube_kevina",
    openUrl: "https://www.youtube.com/@KevinaStarrStories",
    pullInstructions: youtubePull(
      "Kevina Starr Stories (@KevinaStarrStories)",
      "https://www.youtube.com/@KevinaStarrStories",
    ),
  },
  {
    id: "personal_evelyn",
    taskId: "T-SOC-PERSONAL-EVELYN",
    label: "Personal Facebook · Evelyn",
    assignedTo: "Evelyn",
    category: "personal_amplify",
    pullInstructions: personalFacebookPull("Evelyn"),
  },
  {
    id: "personal_tina",
    taskId: "T-SOC-PERSONAL-TINA",
    label: "Personal Facebook · Tina",
    assignedTo: "Tina",
    category: "personal_amplify",
    pullInstructions: personalFacebookPull("Tina"),
  },
] as const;

export function socialAnalyticsReviewMarker(channelId: SocialAnalyticsChannelId): string {
  return `social-analytics-review:${channelId}`;
}

export function socialAnalyticsReviewDescription(label: string): string {
  return `Social analytics review (every other day) — ${label}`;
}

export function socialAnalyticsReviewNotes(def: SocialAnalyticsChannelDef): string {
  const lines = [
    socialAnalyticsReviewMarker(def.id),
    CADENCE_BLURB,
    "",
    def.openUrl ? `Open: ${def.openUrl}` : "Open: channel Analytics / Insights home",
    "",
    def.pullInstructions,
    "",
    "When pasted: @ Cursor in chat with this task id + Notes paste for review.",
  ];
  return lines.join("\n");
}

/**
 * Next due on the every-other-day cadence anchored at 2026-09-11 (first pass).
 * If today is an anchor day → today; else → next anchor day. Format MM/DD/YY.
 */
export function nextSocialAnalyticsDueDate(ref: Date = new Date()): string {
  const anchor = Date.UTC(2026, 8, 11); // Sep 11, 2026
  const day = Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const daysSince = Math.floor((day - anchor) / (24 * 60 * 60 * 1000));
  const add = daysSince <= 0 ? -daysSince : daysSince % 2 === 0 ? 0 : 1;
  const local = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + add);
  const mm = String(local.getMonth() + 1).padStart(2, "0");
  const dd = String(local.getDate()).padStart(2, "0");
  const yy = String(local.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function todayMMDDYY(ref: Date = new Date()): string {
  const mm = String(ref.getMonth() + 1).padStart(2, "0");
  const dd = String(ref.getDate()).padStart(2, "0");
  const yy = String(ref.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

export function hasSocialAnalyticsReviewTask(
  tasks: GyshTask[],
  channelId: SocialAnalyticsChannelId,
): boolean {
  const def = SOCIAL_ANALYTICS_CHANNELS.find((c) => c.id === channelId);
  if (!def) return false;
  const marker = socialAnalyticsReviewMarker(channelId);
  return tasks.some(
    (t) =>
      t.id === def.taskId ||
      String(t.notes || "").includes(marker) ||
      t.description === socialAnalyticsReviewDescription(def.label),
  );
}

/** Ensures one standing analytics-review task per social channel / personal page. Idempotent. */
export function ensureSocialAnalyticsReviewTasks(existing: GyshTask[]): {
  tasks: GyshTask[];
  created: GyshTask[];
} {
  const created: GyshTask[] = [];
  const today = todayMMDDYY();
  const dueDate = nextSocialAnalyticsDueDate();
  const sprint = currentSprintIndex();

  for (const def of SOCIAL_ANALYTICS_CHANNELS) {
    if (
      hasSocialAnalyticsReviewTask(existing, def.id) ||
      hasSocialAnalyticsReviewTask(created, def.id)
    ) {
      continue;
    }
    created.push({
      id: def.taskId,
      description: socialAnalyticsReviewDescription(def.label),
      category: def.category,
      priority: "P1",
      status: "not_started",
      assignBy: "Evelyn",
      assignedTo: def.assignedTo,
      dateAssigned: today,
      dueDate: dueDate || dueDateForSprint(sprint),
      dateCompleted: "",
      notes: socialAnalyticsReviewNotes(def),
      sprint,
      tinaDone: false,
      evelynDone: false,
      attachments: [],
    });
  }

  if (created.length === 0) return { tasks: existing, created };
  return { tasks: [...existing, ...created], created };
}
