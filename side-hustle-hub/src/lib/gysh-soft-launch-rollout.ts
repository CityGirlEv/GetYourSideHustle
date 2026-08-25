/**
 * GYSH Soft Launch Marketing Rollout — Sprints 3–5
 * Expert marketing cadence: Facebook, Kevina Starr, website/newsletter, ads, new channels.
 * Dates aligned to sprint windows (Tue–Mon) from gysh-sprints.
 */

import { adminMarkdownLink } from "./admin-deep-links";
import { currentSprintIndex } from "./gysh-sprints";

/** Soft-launch calendar covers Sprints 2–5 in Content Factory. */
export const SOFT_LAUNCH_FACTORY_SPRINTS = [2, 3, 4, 5] as const;

/**
 * Default Sprint filter for Content Factory — live sprint,
 * clamped to the soft-launch calendar range (2–5).
 */
export function softLaunchFactoryDefaultSprint(ref: Date = new Date()): number {
  const cur = currentSprintIndex(ref);
  if (cur < 2) return 2;
  if (cur > 5) return 5;
  return cur;
}

/**
 * Default multi-select Sprint filters: current + next (both clamped to 2–5).
 * When already on Sprint 5, returns only [5].
 */
export function softLaunchFactoryDefaultSprints(ref: Date = new Date()): number[] {
  const cur = softLaunchFactoryDefaultSprint(ref);
  const next = Math.min(5, cur + 1);
  return next === cur ? [cur] : [cur, next];
}

/** How Content Factory works + glossary for the Marketing/Launch Plan report. */
export const CONTENT_FACTORY_HOWTO = {
  title: "How the Content Factory works",
  summary:
    "Content Factory is the admin home for GYSH marketing ops: the Marketing/Launch Plan (what to post, where, when, with copy + media prompts + A→Z artifacts) and Workshops (public workshop listings). Only Admin accounts can open it. Partners follow the plan calendar, create creatives from the prompts, publish on the listed channels, and mark related tasks/tests done as each item ships.",
  steps: [
    "Open Admin → Content Factory → GYSH Marketing/Launch Plan (or use the share link).",
    "Filter by sprint and channel to see this week’s calendar.",
    "For each item: use the copy, Hedra starting-image + video prompts (when listed), website actions, and artifact checklist.",
    "Publish on the named channel at the suggested time (America/Chicago).",
    "Follow the Personal amplify growth cadence (S3→S5): Tina and Evelyn each have their own Task on scheduled post days — filter Content Factory by Personal amplify.",
    "Save finished asset links (Drive / upload paths) back into the related task notes when available.",
    "Use Content Factory → Workshops to edit public workshop titles, dates, and registration.",
  ],
};

export const MARKETING_PLAN_DEFINITIONS: { term: string; definition: string }[] = [
  {
    term: "Copy",
    definition:
      "The words you publish — Facebook caption, YouTube description, newsletter body, etc. Not a private note.",
  },
  {
    term: "Image prompt",
    definition:
      "Instructions for AI/image tools (or a designer) to create the still graphic for this item. Not the place for partner comments.",
  },
  {
    term: "Working notes",
    definition:
      "Private partner notes on the calendar item — decisions, blockers, links, reminders. Works with or without uploaded images.",
  },
  {
    term: "GYSH Marketing/Launch Plan",
    definition:
      "The living soft-launch marketing calendar (Sprints 2 kickoff through 5): daily posts, newsletters, ads prep, channel setup, Kevina Starr bridges, website actions, projections, and artifact checklists.",
  },
  {
    term: "Cadence",
    definition:
      "The repeating weekly marketing rhythm — who posts where and when (e.g. Tina on GYSH FB + Kevina Starr; Evelyn on YouTube / TikTok / Instagram / ads / site; both amplify to personal Facebook the same day).",
  },
  {
    term: "Cadence locked",
    definition:
      "The weekly rhythm is agreed and standing — soft launch is no longer ad hoc. Content keeps shipping on a fixed schedule without reinventing the plan every week. Sprint 5 ops item: lock owners, post days/times, and the Tuesday Content Factory review habit.",
  },
  {
    term: "Artifacts",
    definition:
      "Everything needed to ship one calendar item: final copy, image/video (or prompts), page/channel setup, UTM links, screenshots, send logs, etc. Listed A→Z under each item.",
  },
  {
    term: "Hedra prompts",
    definition:
      "For every video item: (1) Hedra · Starting image — paste into image gen / Hedra start frame; (2) Hedra · Video — paste as the motion/animation prompt. Then QA with the linked VIDEO-* test in Testing Portal.",
  },
  {
    term: "Channel",
    definition:
      "Where the item goes live: Facebook (GYSH or Kevina Starr), YouTube, TikTok, Instagram, website, newsletter, paid ads, or Personal amplify (Tina & Evelyn personal accounts).",
  },
  {
    term: "Personal amplify",
    definition:
      "Tina and Evelyn each share selected brand posts from GYSH / Kevina Starr (and later IG/TikTok/YT) to their personal Facebook timelines — and other personal networks when the cadence lists them. Not a second brand Page post: a personal reshare with a short authentic caption + getyoursidehustle.com. Growth cadence (~3–4 nights/week, prefer 6–9 PM CT) is PERSONAL_AMPLIFY_CADENCE in Content Factory — not every brand post.",
  },
  {
    term: "Projections",
    definition:
      "Directional planning ranges for reach, Match Wizard starts, joins, ad spend, and early revenue — for learning, not hard commitments.",
  },
  {
    term: "Workshops (Content Factory tab)",
    definition:
      "Admin editor for public workshop cards on getyoursidehustle.com. Separate from the launch calendar; same Content Factory area.",
  },
];

export type RolloutChannel =
  | "facebook_gysh"
  | "facebook_kevina"
  | "youtube_gysh"
  | "tiktok_gysh"
  | "instagram_gysh"
  | "website"
  | "newsletter"
  | "ads"
  /** Tina + Evelyn personal accounts (esp. Facebook) — amplify brand posts. */
  | "personal_amplify";

export type RolloutOwner = "Tina" | "Evelyn" | "Both";

/**
 * Content Factory calendar item status — same values as Task List.
 * Persisted via D1 soft-launch overrides.
 */
export type SoftLaunchItemStatus = "not_started" | "in_progress" | "blocked" | "done";

export const SOFT_LAUNCH_ITEM_STATUSES: SoftLaunchItemStatus[] = [
  "not_started",
  "in_progress",
  "blocked",
  "done",
];

export const SOFT_LAUNCH_ITEM_STATUS_LABELS: Record<SoftLaunchItemStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

/** Task List–matching card class so CF items tint the same as task-card--status. */
export function contentFactoryItemStatusClass(status: SoftLaunchItemStatus | string): string {
  const key = isSoftLaunchItemStatus(status) ? status : "not_started";
  return `content-factory__item--${key}`;
}

/** @deprecated Use SoftLaunchItemStatus */
export type SoftLaunchCfStatus = SoftLaunchItemStatus;

export type SoftLaunchItem = {
  id: string;
  /** Sprint index (3–5; kickoff items may be 2 if finishing soft-launch week). */
  sprint: 2 | 3 | 4 | 5;
  /** ISO date YYYY-MM-DD */
  day: string;
  channel: RolloutChannel;
  title: string;
  owner: RolloutOwner;
  /** Suggested post / publish time America/Chicago */
  postTime?: string;
  copy?: string;
  /** General / static creative image prompt (also used when no Hedra start frame is set). */
  imagePrompt?: string;
  /** High-level video brief (duration, platform, CTA). */
  videoPrompt?: string;
  /**
   * Hedra starting-frame image prompt — generate or upload this still first.
   * Required for every item that ships a video.
   */
  hedraStartImagePrompt?: string;
  /**
   * Hedra video / motion prompt — animate from the starting image.
   * Required for every item that ships a video.
   */
  hedraVideoPrompt?: string;
  /** Testing Portal cases that QA this video (e.g. VIDEO-003). */
  relatedTestIds?: string[];
  /** A→Z checklist — everything needed to ship this item */
  artifacts: string[];
  websiteActions?: string[];
  notes?: string;
  /**
   * Explicit Content Factory status (D1 override).
   * Same set as Task List. When omitted, status is derived from linked task/tests.
   */
  status?: SoftLaunchItemStatus;
};

export type SprintProjection = {
  sprint: number;
  label: string;
  rangeLabel: string;
  theme: string;
  expectedOutcomes: string[];
  metrics: { label: string; low: string; high: string }[];
  revenue: { label: string; lowUsd: number; highUsd: number; note: string }[];
  /**
   * When set, this projection is the same record as that Content Factory calendar item
   * (shown on the item — not as a separate summary card).
   */
  opsItemId?: string;
};

export const ROLLOUT_CHANNEL_LABELS: Record<RolloutChannel, string> = {
  facebook_gysh: "Facebook · GYSH",
  facebook_kevina: "Facebook · Kevina Starr",
  youtube_gysh: "YouTube · GYSH",
  tiktok_gysh: "TikTok · GYSH",
  instagram_gysh: "Instagram · GYSH",
  website: "Website",
  newsletter: "Newsletter",
  ads: "Paid Ads",
  personal_amplify: "Personal amplify",
};

/** How / when each partner shares brand posts from their personal accounts. */
export const PERSONAL_AMPLIFY_PLAYBOOK = `PERSONAL AMPLIFY — your own Task (Tina or Evelyn)

CADENCE (growth schedule — do not amplify every brand post)
• Goal: followers + site visits without personal-feed fatigue. Cap ≈ 3–4 personal shares / week.
• Always same calendar day as the named brand posts (within ~2 hours). Prefer 6–9 PM CT.
• Facebook personal timeline is primary. Add IG Story / TikTok / YT→FB only when those brand posts shipped that day (see SAME-DAY TARGETS).
• Sprint map: S3 foundation (3 days) → S4 new-platform push (4 days) → S5 UGC + montage (3 days). Filter Content Factory by Personal amplify.

WHEN (America/Chicago)
• Same calendar day as the brand post on GYSH FB, Kevina Starr FB, or (later) IG / TikTok / YouTube.
• Target window: within ~2 hours of the brand post. Prefer 6–9 PM CT for personal Facebook reach.
• If you miss the window: share next morning before 10 AM CT and note it on the Task.

HOW — Facebook (primary)
1. Open the live GYSH or Kevina Starr Page post (do not create a competing original).
2. Share → your personal timeline (or Story if the post is visual-first).
3. Add 1–3 authentic lines in your own voice (why this helps families / your age lane). Do not paste the full brand caption.
4. Keep the link: getyoursidehustle.com (append ?utm_source=personal_fb&utm_medium=social&utm_campaign=soft_launch when easy).
5. Optional: tag Get Your Side Hustle Page; do not mass-tag friends.
6. Optional: one relevant Facebook Group only if group rules allow + you are an active member — never spam.

HOW — other platforms (when the brand post exists that day)
• Instagram: reshare GYSH Reel/post to your Story with Start free sticker / link in bio reminder.
• TikTok: Duet/Stitch or Story share only if comfortable; otherwise skip.
• YouTube: like + comment + share Short to Facebook personal (counts as amplify).

DONE means
• You shared from your personal account (this Task is yours alone — mark Done when you finish).
• Screenshot or URL of your personal share pasted into Task notes.
• Brand post already live before personal share.`;

/** Stable order for Content Factory channel filter bubbles. */
export const ROLLOUT_CHANNELS: RolloutChannel[] = [
  "facebook_gysh",
  "facebook_kevina",
  "personal_amplify",
  "youtube_gysh",
  "instagram_gysh",
  "tiktok_gysh",
  "website",
  "newsletter",
  "ads",
];

/** Stable order for Content Factory assignee filter bubbles. */
export const ROLLOUT_OWNERS: RolloutOwner[] = ["Tina", "Evelyn", "Both"];

/** Counts of calendar items per channel (optionally scoped to a sprint). */
export function rolloutChannelCounts(sprint?: number): Record<RolloutChannel | "all", number> {
  const items = sprint == null ? SOFT_LAUNCH_ROLLOUT : rolloutItemsForSprint(sprint);
  const counts = Object.fromEntries(ROLLOUT_CHANNELS.map((c) => [c, 0])) as Record<
    RolloutChannel | "all",
    number
  >;
  counts.all = items.length;
  for (const item of items) {
    counts[item.channel] = (counts[item.channel] ?? 0) + 1;
  }
  return counts;
}

/** Counts of calendar items per assignee (owner) within a given item list. */
export function rolloutOwnerCounts(
  items: SoftLaunchItem[],
): Record<RolloutOwner | "all", number> {
  const counts = Object.fromEntries(ROLLOUT_OWNERS.map((o) => [o, 0])) as Record<
    RolloutOwner | "all",
    number
  >;
  counts.all = items.length;
  for (const item of items) {
    counts[item.owner] = (counts[item.owner] ?? 0) + 1;
  }
  return counts;
}

/** Empty set / "all" = every owner; otherwise keep items whose owner is selected. */
export function filterSoftLaunchByOwner(
  items: SoftLaunchItem[],
  owners: ReadonlySet<RolloutOwner> | readonly RolloutOwner[] | "all",
): SoftLaunchItem[] {
  if (owners === "all") return items;
  const set = owners instanceof Set ? owners : new Set(owners);
  if (set.size === 0) return items;
  return items.filter((i) => set.has(i.owner));
}

const BRAND_IMAGE =
  "Soft Ivory background (#F7F1E3), Antique Gold (#947D64) accents, Crimson (#9B2F28) CTA. Warm luxury, family-friendly, no clutter. Include GetYourSideHustle.com. No stock-photo watermarks.";

/** Shared quality constraints for Hedra start frames (image gen → upload to Hedra). */
const HEDRA_START =
  "Photoreal or premium illustrated still, Soft Ivory (#F7F1E3) base, Antique Gold (#947D64) accents, Crimson (#9B2F28) CTA. Warm luxury family brand, sharp focus, high detail, centered composition with safe margins for crop, no watermarks, no logos of other brands, no unreadable micro-text, no distorted hands/faces. Include readable wordmark text only when specified.";

/** Shared quality constraints for Hedra motion prompts. */
const HEDRA_MOTION =
  "Smooth cinematic motion, stable camera, no morphing faces, no flickering text, keep on-screen words sharp and locked, warm golden grade, soft film grain optional, family-friendly energy (not hype-bro), clean end hold on CTA/URL for 1.5–2s.";

/** Task id for a rollout item (matches D1 Task List / seed script). */
export function softLaunchTaskId(itemId: string): string {
  return `T-${itemId.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

/** Content Factory cross-ref number (CF-001 …) from calendar order. */
export function softLaunchItemNumber(itemId: string): number {
  const want = String(itemId || "").trim();
  if (!want) return 0;
  const idx = SOFT_LAUNCH_ROLLOUT.findIndex((i) => i.id === want);
  return idx >= 0 ? idx + 1 : 0;
}

/** Display / deep-link ref like CF-009. */
export function softLaunchItemRef(itemId: string): string {
  const n = softLaunchItemNumber(itemId);
  return n > 0 ? `CF-${String(n).padStart(3, "0")}` : "";
}

/** Parse CF-009 → SoftLaunchItem (also accepts slug ids via softLaunchItemById). */
export function softLaunchItemFromRef(ref: string): SoftLaunchItem | undefined {
  const raw = String(ref || "").trim();
  const m = /^CF-(\d{1,4})$/i.exec(raw);
  if (!m) return undefined;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return SOFT_LAUNCH_ROLLOUT[n - 1];
}

/** Task List id + Testing Portal case ids for a Content Factory calendar item. */
export function softLaunchCrossLinks(item: Pick<SoftLaunchItem, "id" | "relatedTestIds">): {
  taskId: string;
  testIds: string[];
  /** Content Factory number, e.g. CF-009. */
  itemRef: string;
} {
  return {
    taskId: softLaunchTaskId(item.id),
    testIds: (item.relatedTestIds ?? []).map((id) => String(id).trim()).filter(Boolean),
    itemRef: softLaunchItemRef(item.id),
  };
}

/**
 * Optional live overlay (D1 overrides) applied on top of the code catalog.
 * Registered by soft-launch-item-overrides when Admin surfaces load patches.
 */
let softLaunchItemOverlay: ((item: SoftLaunchItem) => SoftLaunchItem) | null = null;

export function registerSoftLaunchItemOverlay(
  fn: ((item: SoftLaunchItem) => SoftLaunchItem) | null,
): void {
  softLaunchItemOverlay = fn;
}

function resolveSoftLaunchItem(item: SoftLaunchItem): SoftLaunchItem {
  return softLaunchItemOverlay ? softLaunchItemOverlay(item) : item;
}

/** Catalog items with any live D1 overrides applied. */
export function softLaunchRolloutItems(): SoftLaunchItem[] {
  return SOFT_LAUNCH_ROLLOUT.map(resolveSoftLaunchItem);
}

export function softLaunchItemById(itemId: string): SoftLaunchItem | undefined {
  const want = String(itemId || "").trim();
  if (!want) return undefined;
  const byRef = softLaunchItemFromRef(want);
  if (byRef) return resolveSoftLaunchItem(byRef);
  const base = SOFT_LAUNCH_ROLLOUT.find((i) => i.id === want);
  return base ? resolveSoftLaunchItem(base) : undefined;
}

/** Reverse-map Task List id (T-SL-…) → Content Factory calendar item. */
export function softLaunchItemFromTaskId(taskId: string): SoftLaunchItem | undefined {
  const want = String(taskId || "").trim().toUpperCase();
  if (!want) return undefined;
  const base = SOFT_LAUNCH_ROLLOUT.find((i) => softLaunchTaskId(i.id) === want);
  return base ? resolveSoftLaunchItem(base) : undefined;
}

/** Reverse-map Testing Portal case id (VIDEO-…) → Content Factory calendar item. */
export function softLaunchItemFromTestId(testId: string): SoftLaunchItem | undefined {
  const want = String(testId || "").trim().toUpperCase();
  if (!want) return undefined;
  const wantLogical = want.replace(/-(TINA|EVELYN|LYRIQ)$/i, "");
  return softLaunchRolloutItems().find((i) =>
    (i.relatedTestIds ?? []).some((t) => {
      const tid = String(t).trim().toUpperCase();
      const logical = tid.replace(/-(TINA|EVELYN|LYRIQ)$/i, "");
      return tid === want || logical === wantLogical || logical === want || tid === wantLogical;
    }),
  );
}

/** Projection folded into a Content Factory calendar item (same record). */
export function softLaunchProjectionForItem(itemId: string): SprintProjection | undefined {
  const want = String(itemId || "").trim();
  if (!want) return undefined;
  return SOFT_LAUNCH_PROJECTIONS.find((p) => p.opsItemId === want);
}

/** Standalone projection cards (not already represented by a calendar ops item). */
export function softLaunchStandaloneProjections(sprint?: number | "all"): SprintProjection[] {
  return SOFT_LAUNCH_PROJECTIONS.filter((p) => {
    if (p.opsItemId) return false;
    if (sprint == null || sprint === "all") return true;
    return p.sprint === sprint;
  });
}

export type SoftLaunchItemCompletion = {
  taskId: string;
  testIds: string[];
  /** Raw Task List status (`not_started` when unknown / missing). */
  taskStatus: string;
  /** Raw Testing Portal status per linked test id (`not_run` when unknown / missing). */
  testStatusById: Record<string, string>;
  /** Task List row is status `done`. */
  taskDone: boolean;
  /** Every linked test is `pass` (vacuously true when no tests). */
  testsDone: boolean;
  testDoneById: Record<string, boolean>;
  /** Linked task+tests imply done (before CF status override). */
  linkedDone: boolean;
  /** True when status came from an explicit CF override (not auto-derived). */
  statusIsExplicit: boolean;
  /** Effective CF item status (explicit override or derived from links). */
  itemStatus: SoftLaunchItemStatus;
  /** Content Factory item is done when effective status is `done`. */
  itemDone: boolean;
};

function isSoftLaunchItemStatus(value: unknown): value is SoftLaunchItemStatus {
  return (
    value === "not_started" ||
    value === "in_progress" ||
    value === "blocked" ||
    value === "done"
  );
}

/** Auto status when the CF item has no explicit D1 status override. */
export function deriveSoftLaunchItemStatus(opts: {
  taskStatus: string;
  taskDone: boolean;
  testsDone: boolean;
}): SoftLaunchItemStatus {
  if (opts.taskDone && opts.testsDone) return "done";
  if (opts.taskStatus === "blocked") return "blocked";
  if (opts.taskStatus === "in_progress" || opts.taskStatus === "done") return "in_progress";
  return "not_started";
}

/**
 * Derive Content Factory calendar completion from Task List + Testing Portal,
 * with optional explicit CF status (same values as Task List).
 */
export function softLaunchItemCompletion(
  item: Pick<SoftLaunchItem, "id" | "relatedTestIds" | "status">,
  opts: {
    taskStatusById?: Record<string, string | undefined>;
    testStatusById?: Record<string, string | undefined>;
    /** Explicit CF status; wins over item.status / auto. */
    status?: SoftLaunchItemStatus | null;
  } = {},
): SoftLaunchItemCompletion {
  const links = softLaunchCrossLinks(item);
  const taskStatus = String(opts.taskStatusById?.[links.taskId] || "not_started").trim() || "not_started";
  const taskDone = taskStatus === "done";
  const testStatusById: Record<string, string> = {};
  const testDoneById: Record<string, boolean> = {};
  for (const id of links.testIds) {
    const st = String(opts.testStatusById?.[id] || "not_run").trim() || "not_run";
    testStatusById[id] = st;
    testDoneById[id] = st === "pass";
  }
  const testsDone =
    links.testIds.length === 0 || links.testIds.every((id) => testDoneById[id] === true);
  const linkedDone = taskDone && testsDone;
  const explicit =
    opts.status !== undefined && opts.status !== null
      ? opts.status
      : isSoftLaunchItemStatus(item.status)
        ? item.status
        : null;
  const itemStatus =
    explicit ??
    deriveSoftLaunchItemStatus({ taskStatus, taskDone, testsDone });
  return {
    taskId: links.taskId,
    testIds: links.testIds,
    taskStatus,
    testStatusById,
    taskDone,
    testsDone,
    testDoneById,
    linkedDone,
    statusIsExplicit: explicit != null,
    itemStatus,
    itemDone: itemStatus === "done",
  };
}

/** True when a seeded draft id belongs to a soft-launch calendar item. */
export function draftBelongsToSoftLaunchItem(draftId: string, itemId: string): boolean {
  const id = String(draftId || "");
  const item = String(itemId || "");
  if (!id || !item) return false;
  return id.includes(`D-SL-${item}-`) || id.includes(`-${item}-`);
}

/** True when this calendar item is expected to ship a video creative. */
export function softLaunchItemRequiresVideo(item: SoftLaunchItem): boolean {
  return Boolean(item.hedraVideoPrompt || item.videoPrompt);
}

/** All soft-launch items that require video creatives (Hedra path). */
export function softLaunchVideoItems(): SoftLaunchItem[] {
  return SOFT_LAUNCH_ROLLOUT.filter(softLaunchItemRequiresVideo);
}

/**
 * Soft-launch personal amplify posting schedule (one Task per owner per day).
 * Tuned for growth: evening CT, high-value brand days only, platform mix when new channels launch.
 */
export const PERSONAL_AMPLIFY_CADENCE = [
  {
    sprint: 3 as const,
    day: "2026-08-18",
    idBase: "sl-s3-personal-amplify-why",
    title: "Personal amplify — Why GYSH (+ Welcome catch-up)",
    postTime: "7:00 PM CT",
    amplifyTargets:
      "Platforms today: Facebook (personal timeline)\n" +
      "• GYSH FB — Why we built GYSH (sl-s3-fb-why-gysh)\n" +
      "• Catch-up if needed: Soft Launch Welcome (sl-s2-fb-welcome)\n" +
      "Why tonight: origin story + soft-launch kickoff — best early-follower magnet.",
  },
  {
    sprint: 3 as const,
    day: "2026-08-20",
    idBase: "sl-s3-personal-amplify-guides",
    title: "Personal amplify — Free Guides + first YouTube Short",
    postTime: "7:00 PM CT",
    amplifyTargets:
      "Platforms today: Facebook personal + YouTube Short → personal FB\n" +
      "• GYSH FB — Free Guides (sl-s3-fb-free-guides)\n" +
      "• YouTube — first Short (sl-s3-yt-first-short): like/comment + share Short to personal Facebook\n" +
      "Why tonight: value post + video — dual format lifts reach.",
  },
  {
    sprint: 3 as const,
    day: "2026-08-24",
    idBase: "sl-s3-personal-amplify-wrap",
    title: "Personal amplify — Soft launch week wrap",
    postTime: "6:00 PM CT",
    amplifyTargets:
      "Platforms today: Facebook personal\n" +
      "• GYSH FB — Soft launch week wrap (sl-s3-fb-week-wrap)\n" +
      "• Best Kevina Starr post from this week (sl-s3-kevina-1 / 2 / 3) if not yet shared\n" +
      "Why tonight: week close + ask engagement; seeds Sprint 4 habit.",
  },
  {
    sprint: 4 as const,
    day: "2026-08-25",
    idBase: "sl-s4-personal-amplify-ig-tt",
    title: "Personal amplify — IG grid + TikTok launch day",
    postTime: "7:00 PM CT",
    amplifyTargets:
      "Platforms today: Facebook personal + Instagram Story + TikTok (optional)\n" +
      "• Instagram — Grid launch 3 posts (sl-s4-ig-launch) → Story reshare + link-in-bio nudge\n" +
      "• TikTok — First video Pick Your Path (sl-s4-tiktok-1) → share/Duet if comfortable, else skip\n" +
      "• Also share one GYSH FB or Kevina link on personal Facebook pointing people to IG/TikTok\n" +
      "Why tonight: new-channel launch day — personal graphs seed first followers on IG/TT.",
  },
  {
    sprint: 4 as const,
    day: "2026-08-26",
    idBase: "sl-s4-personal-amplify-kevina",
    title: "Personal amplify — Kevina Tuesday bridge",
    postTime: "7:30 PM CT",
    amplifyTargets:
      "Platforms today: Facebook personal\n" +
      "• Kevina Starr FB cadence (sl-s4-kevina-cadence)\n" +
      "Why tonight: Kids-path trust voice → parents in personal network.",
  },
  {
    sprint: 4 as const,
    day: "2026-08-28",
    idBase: "sl-s4-personal-amplify-fb",
    title: "Personal amplify — Mid-sprint GYSH FB tip",
    postTime: "7:00 PM CT",
    amplifyTargets:
      "Platforms today: Facebook personal\n" +
      "• GYSH FB mid-sprint cadence (sl-s4-fb-cadence)\n" +
      "Why tonight: mid-week consistency — algorithm rewards steady personal shares.",
  },
  {
    sprint: 4 as const,
    day: "2026-08-30",
    idBase: "sl-s4-personal-amplify-yt2",
    title: "Personal amplify — YouTube Short #2",
    postTime: "6:00 PM CT",
    amplifyTargets:
      "Platforms today: Facebook personal + Instagram Story (if Reel cross-posted)\n" +
      "• YouTube Short #2 Free Blueprint in 60s (sl-s4-yt-short-2) → share to personal Facebook\n" +
      "• Optional: IG Story if the Short was also posted as a Reel\n" +
      "Why tonight: weekend video share — high watch + subscribe path.",
  },
  {
    sprint: 5 as const,
    day: "2026-09-02",
    idBase: "sl-s5-personal-amplify-kevina",
    title: "Personal amplify — Kevina bridge posts",
    postTime: "7:30 PM CT",
    amplifyTargets:
      "Platforms today: Facebook personal\n" +
      "• Kevina Starr — story + GYSH bridge (sl-s5-kevina-cadence)\n" +
      "Why tonight: trust bridge into Kids Corner for personal network parents.",
  },
  {
    sprint: 5 as const,
    day: "2026-09-04",
    idBase: "sl-s5-personal-amplify-ugc",
    title: "Personal amplify — UGC ask",
    postTime: "7:00 PM CT",
    amplifyTargets:
      "Platforms today: Facebook personal\n" +
      "• GYSH FB — UGC ask: share your Blueprint win (sl-s5-fb-ugc-ask)\n" +
      "• Add a personal line inviting friends to comment their age path\n" +
      "Why tonight: UGC posts need personal graph comments to take off.",
  },
  {
    sprint: 5 as const,
    day: "2026-09-05",
    idBase: "sl-s5-personal-amplify-montage",
    title: "Personal amplify — Soft-launch montage",
    postTime: "7:00 PM CT",
    amplifyTargets:
      "Platforms today: Facebook personal + Instagram Story + TikTok (optional)\n" +
      "• IG + TikTok + YT best-of montage (sl-s5-multi-channel-repost)\n" +
      "• Personal FB: share the strongest cut + link to getyoursidehustle.com\n" +
      "• IG Story reshare; TikTok only if comfortable\n" +
      "Why tonight: highlight reel — best single day for follower conversion across platforms.",
  },
] as const;

const PERSONAL_AMPLIFY_ARTIFACTS_FOR = (owner: "Tina" | "Evelyn") => [
  "Brand post(s) live before your personal share",
  `${owner}: personal Facebook share (timeline or Story) + 1–3 authentic lines + getyoursidehustle.com`,
  "Optional same day: IG Story / TikTok / YouTube Short → personal FB if those brand posts shipped",
  "Paste personal share URL or screenshot into your Task notes",
  "Mark this Task Done when you have shared (partner has their own Task)",
];

/** Calendar row: one partner’s personal amplify for a brand-post day. */
export function personalAmplifyItem(p: {
  id: string;
  sprint: 2 | 3 | 4 | 5;
  day: string;
  title: string;
  owner: "Tina" | "Evelyn";
  /** What brand posts to share today (GYSH FB / Kevina / IG / etc.). */
  amplifyTargets: string;
  postTime?: string;
}): SoftLaunchItem {
  return {
    id: p.id,
    sprint: p.sprint,
    day: p.day,
    channel: "personal_amplify",
    title: p.title,
    owner: p.owner,
    postTime: p.postTime ?? "Within ~2h of brand post · prefer 6–9 PM CT",
    copy: `SAME-DAY TARGETS\n${p.amplifyTargets}\n\n${PERSONAL_AMPLIFY_PLAYBOOK}`,
    artifacts: PERSONAL_AMPLIFY_ARTIFACTS_FOR(p.owner),
    notes:
      "Required content-delivery step: personal amplify on the growth cadence day (not every brand post). Facebook first. Each partner has their own Task.",
  };
}

/** Tina + Evelyn Tasks for one amplify calendar day. */
export function personalAmplifyPair(p: {
  idBase: string;
  sprint: 2 | 3 | 4 | 5;
  day: string;
  title: string;
  amplifyTargets: string;
  postTime?: string;
}): SoftLaunchItem[] {
  return (["Tina", "Evelyn"] as const).map((owner) =>
    personalAmplifyItem({
      id: `${p.idBase}-${owner.toLowerCase()}`,
      sprint: p.sprint,
      day: p.day,
      owner,
      title: `${p.title} (${owner})`,
      amplifyTargets: p.amplifyTargets,
      postTime: p.postTime,
    }),
  );
}

/** Expand a PERSONAL_AMPLIFY_CADENCE row into Tina + Evelyn calendar items. */
export function personalAmplifyFromCadence(
  idBase: (typeof PERSONAL_AMPLIFY_CADENCE)[number]["idBase"],
): SoftLaunchItem[] {
  const row = PERSONAL_AMPLIFY_CADENCE.find((r) => r.idBase === idBase);
  if (!row) throw new Error(`Unknown personal amplify cadence id: ${idBase}`);
  return personalAmplifyPair({
    idBase: row.idBase,
    sprint: row.sprint,
    day: row.day,
    title: row.title,
    amplifyTargets: row.amplifyTargets,
    postTime: row.postTime,
  });
}

/** All Personal amplify calendar items from the growth cadence. */
export function personalAmplifyCadenceItems(): SoftLaunchItem[] {
  return PERSONAL_AMPLIFY_CADENCE.flatMap((row) => personalAmplifyFromCadence(row.idBase));
}

/** Soft-launch marketing calendar — Sprint 3 kickoff through Sprint 5. */
export const SOFT_LAUNCH_ROLLOUT: SoftLaunchItem[] = [
  /* ───────────── Sprint 2 close / Soft Launch day (Mon Aug 3) ───────────── */
  {
    id: "sl-s2-fb-welcome",
    sprint: 2,
    day: "2026-08-03",
    channel: "facebook_gysh",
    title: "FB Welcome — Introduce GYSH to the world",
    owner: "Tina",
    postTime: "10:00 AM CT",
    copy: `Welcome to Get Your Side Hustle — GYSH!

We're Tina & Evelyn, and we built one platform for four generations: Kids, Teens, Adults, and Seniors.

Whether you're a parent coaching a first lemonade stand, a teen ready to earn, an adult launching Airbnb or AI agents, or a senior pacing a flexible hustle — WE GOT YOU.

Start free → take the Match Wizard → unlock your Side Hustle Blueprint.

getyoursidehustle.com

Drop a ✨ if you're building with family — or going solo. We're here either way.`,
    imagePrompt: `${BRAND_IMAGE} Hero: warm family + solo adult vignette split composition. Text: "Get Your Side Hustle" large; subtitle "Kids · Teens · Adults · Seniors". Soft gold wash, crimson "Start free" button.`,
    videoPrompt:
      "15–20s vertical or square: soft open on GYSH logo, quick cuts of Match Wizard UI mock, Kids Corner book, adult hustle icons, end card with URL. Voiceover optional: “One platform. Four generations. Get Your Side Hustle.” Upbeat acoustic, warm tones.",
    hedraStartImagePrompt: `${HEDRA_START} 1080×1350 portrait. Split hero: left warm multi-generational family at a kitchen table with a laptop showing a soft gold UI; right solo adult working confidently. Large crisp text top: "Get Your Side Hustle". Smaller subtitle: "Kids · Teens · Adults · Seniors". Crimson button graphic "Start free". Bottom edge: getyoursidehustle.com.`,
    hedraVideoPrompt: `${HEDRA_MOTION} 15–20s, 1080×1350. Slow push-in on the brand frame; gentle parallax between family and solo vignettes; gold light sweep across subtitle chips; crimson "Start free" button soft pulse once; final 2s hold with getyoursidehustle.com sharp. Optional soft VO feel (no lip-sync faces): warm welcome energy. End locked on CTA.`,
    relatedTestIds: ["VIDEO-001"],
    artifacts: [
      "GYSH Facebook Page live (cover + profile using brand kit)",
      "Pinned welcome post with link sticker / CTA to getyoursidehustle.com",
      "Hedra start image exported from hedraStartImagePrompt",
      "Hedra video exported (1080×1080 or 1080×1350) from hedraVideoPrompt",
      "Page About filled: tagline, contact, website",
      "Call-to-action button: Sign Up → join URL",
      "Tina reviews copy; Evelyn confirms URL + UTM `?utm_source=facebook&utm_medium=organic&utm_campaign=soft_launch`",
      "QA with VIDEO-001 (attach export as evidence)",
    ],
    notes: "SOFT LAUNCH FLAGSHIP — post this first. Use Hedra start image + video prompts.",
  },
  {
    id: "sl-s2-yt-create",
    sprint: 2,
    day: "2026-08-03",
    channel: "youtube_gysh",
    title: "Create GYSH YouTube channel + About",
    owner: "Evelyn",
    postTime: "Afternoon CT",
    copy: `CHANNEL NAME
Get Your Side Hustle (GYSH)

ABOUT (paste into YouTube → Customize channel → About)
Get Your Side Hustle helps Kids, Teens, Adults, and Seniors find a side hustle that fits their life — without the overwhelm.

Take the free Match Wizard → unlock your Side Hustle Blueprint → open Launch Guides built for your age path.

We are Tina & Evelyn. One platform. Four generations. Start free at getyoursidehustle.com

Keywords: side hustle, kids entrepreneurship, teens earn money, adult side hustle, senior side hustle, family business, Match Wizard, Side Hustle Blueprint

LINKS
Website: https://getyoursidehustle.com
Facebook: Get Your Side Hustle Page

OPTIONAL TRAILER (if you upload the Hedra trailer)
Title: Welcome to Get Your Side Hustle
Description: Side hustles for Kids · Teens · Adults · Seniors. Free Match Wizard + Blueprint → https://getyoursidehustle.com`,
    videoPrompt:
      "Optional 20–30s channel trailer / Community welcome: logo open → four age chips → URL end card. Can ship later with first Short if needed.",
    hedraStartImagePrompt: `${HEDRA_START} 1920×1080 YouTube-safe frame. Soft Ivory studio backdrop, centered GYSH wordmark "Get Your Side Hustle", four Antique Gold pills underneath labeled Kids / Teens / Adults / Seniors, crimson underline, getyoursidehustle.com bottom-center. Plenty of margin for 2560×1440 channel art crop.`,
    hedraVideoPrompt: `${HEDRA_MOTION} 20–30s, 16:9. Soft logo reveal from gentle gold light; age pills fade/slide in one-by-one left→right; subtle paper texture drift; end hold 2s on getyoursidehustle.com. Calm premium trailer — not gaming intro.`,
    relatedTestIds: ["VIDEO-007"],
    artifacts: [
      "YouTube channel: Get Your Side Hustle (or GYSH)",
      "Channel art 2560×1440 brand frame + Soft Ivory",
      "Profile icon: GYSH mark",
      "About description (SEO: side hustle, kids, teens, adults, seniors)",
      "Trailer OR Community welcome (Hedra prompts above) — or defer to Sprint 3 first Short",
      "Link to getyoursidehustle.com in channel links",
      "Default upload settings + end screen template",
      "If trailer ships: QA with VIDEO-007",
    ],
    notes: "May launch empty with Community post; first short can land Sprint 3. Hedra prompts ready when you make the trailer.",
  },

  /* ───────────── Sprint 3 — Polish + daily cadence (Aug 18–24) ───────────── */
  {
    id: "sl-s3-polish-cadence",
    sprint: 3,
    day: "2026-08-18",
    channel: "website",
    title: "Sprint 3 — Polish + cadence",
    owner: "Both",
    postTime: "Anytime",
    copy: `Sprint 3 Marketing/Launch Plan — polish + daily cadence (8/18–8/24).

Theme: Welcome the world: FB + YT live, daily organic, Kevina bridge, newsletter #1, channels created.

This is the week umbrella (projections + checklist). Each calendar row below is a shippable piece with its own Task + (when listed) Test.`,
    websiteActions: [
      "Open Content Factory → GYSH Marketing/Launch Plan · Sprint 3 filter",
      "Walk every Sprint 3 CF item; owners clear blockers daily",
      "Green the website soft-launch checklist before week wrap",
    ],
    artifacts: [
      "GYSH Facebook welcome + ≥5 organic posts shipped or scheduled",
      "Kevina Starr Page: 3 soft CTAs into Kids Corner",
      "Tina + Evelyn personal amplify on the growth cadence (3 days in Sprint 3 — filter Personal amplify)",
      "YouTube channel + first Short live (or staged with VIDEO QA)",
      "TikTok + Instagram accounts created (ready to post Sprint 4)",
      "Newsletter #1 sent (even to a small list)",
      "Website soft-launch checklist green",
      "Ads brief ready — no required spend yet",
      "All Sprint 3 CF items have Task statuses current",
    ],
    notes:
      "Sprint 3 — Polish + cadence (combined projection + calendar item). Linked Task tracks week health; other CF rows keep their own tasks/tests.",
  },
  {
    id: "sl-s3-channels-tiktok",
    sprint: 3,
    day: "2026-08-18",
    channel: "tiktok_gysh",
    title: "Create GYSH TikTok account",
    owner: "Evelyn",
    copy: `HANDLE
@getyoursidehustle (or approved alternate)

BIO (paste into TikTok profile)
Side hustles for Kids · Teens · Adults · Seniors
Free Match Wizard → your Blueprint
Start free ↓

LINK IN BIO
https://getyoursidehustle.com

OPTIONAL FIRST PIN / COMMUNITY NOTE (if you post a welcome before Sprint 4)
We’re live. One platform. Four generations. Free Match Wizard + Side Hustle Blueprint → getyoursidehustle.com`,
    artifacts: [
      "TikTok @getyoursidehustle (or approved handle)",
      "Bio + link in bio (Linktree or direct site)",
      "Profile photo + brand-aligned cover",
      "Save login in shared GYSH Drive",
      "Task done note with handle URL",
    ],
  },
  {
    id: "sl-s3-channels-ig",
    sprint: 3,
    day: "2026-08-18",
    channel: "instagram_gysh",
    title: "Create GYSH Instagram account",
    owner: "Evelyn",
    copy: `HANDLE
@getyoursidehustle

NAME
Get Your Side Hustle

BIO (paste into Instagram)
Kids · Teens · Adults · Seniors
Free Match Wizard → Side Hustle Blueprint
Start free ↓ link in bio

CATEGORY
Education / Entrepreneur (or closest Business category)

LINK
https://getyoursidehustle.com

OPTIONAL FIRST STORY / PINNED POST (channel warm-up)
Welcome to GYSH — side hustles that fit your life, your age, your pace. Match Wizard is free. getyoursidehustle.com`,
    artifacts: [
      "IG Business/Creator @getyoursidehustle",
      "Bio, category, link, contact",
      "Highlight covers planned (Kids / Adults / Start Free)",
      "Connect to FB Page if Meta Business Suite",
      "Shared Drive credentials note",
    ],
  },
  {
    id: "sl-s3-web-soft-launch",
    sprint: 3,
    day: "2026-08-18",
    channel: "website",
    title: "Website soft-launch checklist",
    owner: "Evelyn",
    postTime: "Morning CT",
    websiteActions: [
      "Confirm Home hero + Pick Your Path live on prod",
      "Guides page Free filter working",
      "Join free CTA paths for Kids/Teens/Adults/Seniors",
      "Contact form delivers to GYSH inbox",
      "Add soft-launch UTM landing note in Admin if needed",
      "Lighthouse prod smoke (Perf/A11y/SEO) — note scores in task",
    ],
    artifacts: [
      "Screenshot pack of Home / Join / Guides for social proof later",
      "Status: green / yellow list shared with Tina",
    ],
  },
  {
    id: "sl-s3-fb-why-gysh",
    sprint: 3,
    day: "2026-08-18",
    channel: "facebook_gysh",
    title: "FB — Why we built GYSH (founders story)",
    owner: "Tina",
    postTime: "11:00 AM CT",
    copy: `Why GYSH?

Because side hustle advice usually talks to one age — and families hustle together.

Tina brings Kids Glow & stories. Evelyn builds the tech, Match Wizards, and launch systems. Together we made a place where:

• Kids earn with a coach nearby
• Teens practice real skills
• Adults launch with a plan
• Seniors move at their pace

Soft launch is live. Come take the free Match Wizard → getyoursidehustle.com`,
    imagePrompt: `${BRAND_IMAGE} Dual portrait placeholders for Tina & Evelyn (tasteful silhouettes OK). Headline: "Built by a partnership." Sub: "Four generations. One adventure."`,
    artifacts: ["Approved founders photo or brand graphic", "Post + first-comment with URL", "Engage first 10 comments same day"],
  },
  ...personalAmplifyFromCadence("sl-s3-personal-amplify-why"),
  {
    id: "sl-s3-kevina-1",
    sprint: 3,
    day: "2026-08-19",
    channel: "facebook_kevina",
    title: "Kevina Starr FB — Soft invite to Kids Corner",
    owner: "Tina",
    postTime: "6:30 PM CT",
    copy: `Glow Getters ✨

Kevina’s Library of Light adventures now have a home with Get Your Side Hustle — Kids Corner.

Parents: take the Kids Match Wizard together. Stories, kindness, and first hustles — coached by you.

getyoursidehustle.com → Kids

(What glow moment did your kid have this week?)`,
    imagePrompt: `${BRAND_IMAGE} Storybook night-light scene, soft gold, child-safe illustration, Kevina-adjacent warmth without claiming trademarked characters. Text: "Kids Corner · GYSH"`,
    artifacts: ["Post on Kevina Starr FB Page", "Cross-comment from GYSH Page", "Save creative to Drive / Content Factory"],
  },
  {
    id: "sl-s3-fb-match-wizard",
    sprint: 3,
    day: "2026-08-19",
    channel: "facebook_gysh",
    title: "FB — Match Wizard walkthrough CTA",
    owner: "Evelyn",
    postTime: "12:00 PM CT",
    copy: `Not sure which hustle fits?

The GYSH Match Wizard asks honest questions — time, money, energy, age stage — then unlocks your Side Hustle Blueprint (free).

Kids · Teens · Adults · Seniors — pick your path.

Start here → getyoursidehustle.com`,
    imagePrompt: `${BRAND_IMAGE} Clean UI mock of Match Wizard question card + "Unlock Blueprint" button. Antique Gold chips for four ages.`,
    videoPrompt:
      "20–30s: preferred Hedra brand motion OR screen capture of Match Wizard (adult path). Captions on, end with URL. No login secrets.",
    hedraStartImagePrompt: `${HEDRA_START} 1080×1080. Clean product still of a Match Wizard question card on Soft Ivory: large readable question text "How many hours can you give?", four Antique Gold age chips (Kids Teens Adults Seniors), crimson "Unlock Blueprint" button, subtle laptop edge in frame, getyoursidehustle.com footer.`,
    hedraVideoPrompt: `${HEDRA_MOTION} 20–30s, 1:1. Soft zoom into the question card; age chips illuminate one at a time; Unlock Blueprint button gently pulses; light paper-turn transition to a Blueprint summary card tease; final 2s end card: Start free · getyoursidehustle.com. Keep all UI text sharp — no gibberish letters.`,
    relatedTestIds: ["VIDEO-002"],
    artifacts: [
      "Hedra start image + Hedra video (or clean screen capture fallback)",
      "Caption + alt text",
      "UTM link",
      "QA with VIDEO-002",
    ],
  },
  {
    id: "sl-s3-yt-first-short",
    sprint: 3,
    day: "2026-08-20",
    channel: "youtube_gysh",
    title: "YouTube — First Short: What is GYSH?",
    owner: "Both",
    postTime: "4:00 PM CT",
    copy: `Title: What is Get Your Side Hustle? (30 sec)
Description: GYSH helps Kids, Teens, Adults & Seniors find a side hustle that fits — free Match Wizard + Blueprint. https://getyoursidehustle.com
Tags: side hustle, family business, kids entrepreneurship, teens earn money, senior side hustle`,
    imagePrompt: `${BRAND_IMAGE} Vertical 9:16 hero still: bold hook “Side hustles for every age?” over Pick Your Path four-lane graphic; crimson Start free; getyoursidehustle.com.`,
    videoPrompt:
      "YouTube Short 9:16, 25–35s. Hook text on screen: “Side hustles for every age?” Quick montage Home → Pick Your Path → Wizard → Blueprint tease. End card: Start free · getyoursidehustle.com. Warm brand colors.",
    hedraStartImagePrompt: `${HEDRA_START} 1080×1920 (9:16). Bold hook text upper third, perfectly sharp: "Side hustles for every age?" Soft Ivory field with four vertical age lanes (Kids / Teens / Adults / Seniors) in Antique Gold frames, tiny friendly icons only (no messy faces). Mid: crimson "Start free" pill. Lower third clear space for motion. Footer: getyoursidehustle.com.`,
    hedraVideoPrompt: `${HEDRA_MOTION} YouTube Short 9:16, 25–35s. Hook text on screen (0–3s): "Side hustles for every age?" with soft gold glow. Quick montage: Home hero → Pick Your Path age lanes → Match Wizard question card → Blueprint summary tease (readable UI, no gibberish). End card hold 1.5–2s: Start free · getyoursidehustle.com. Warm brand colors (Soft Ivory / Antique Gold / Crimson). High clarity captions; no face morphing.`,
    relatedTestIds: ["VIDEO-003-EVELYN", "VIDEO-003-TINA"],
    artifacts: [
      "[Task T-SL-S3-YT-FIRST-SHORT](/admin?tab=tasks&task=T-SL-S3-YT-FIRST-SHORT) (Task List — same id as Content Factory calendar item sl-s3-yt-first-short)",
      "[Test VIDEO-003-EVELYN](/admin?tab=testing&test=VIDEO-003-EVELYN) / [VIDEO-003-TINA](/admin?tab=testing&test=VIDEO-003-TINA) (Testing Portal — Hedra QA for this Short)",
      "Hedra start image from hedraStartImagePrompt",
      "Hedra video from hedraVideoPrompt (export 9:16) — montage Home → Pick Your Path → Wizard → Blueprint; end card Start free · getyoursidehustle.com",
      "Uploaded Short on GYSH YouTube",
      "Thumbnail (brand frame — can use start image crop)",
      "End screen + cards pointing to site",
      "Share Short URL to GYSH FB same day",
      "Mark [Task T-SL-S3-YT-FIRST-SHORT](/admin?tab=tasks&task=T-SL-S3-YT-FIRST-SHORT) ready/done and attach Short URL + export on VIDEO-003-EVELYN / VIDEO-003-TINA",
    ],
  },
  {
    id: "sl-s3-fb-free-guides",
    sprint: 3,
    day: "2026-08-20",
    channel: "facebook_gysh",
    title: "FB — Free Guides library",
    owner: "Tina",
    postTime: "10:30 AM CT",
    copy: `Free guides are open 📖

Browse launch playbooks for every age — no membership required for the free previews.

Filter Free on the Guides page, then join when you're ready for member libraries & coaches.

→ getyoursidehustle.com/guides (or Guides in the menu)`,
    imagePrompt: `${BRAND_IMAGE} Stack of guide covers / book icons in gold + ivory. Badge: "Free guides".`,
    artifacts: ["Confirm Guides Free filter on prod", "Post + first comment with deep link"],
  },
  ...personalAmplifyFromCadence("sl-s3-personal-amplify-guides"),
  {
    id: "sl-s3-newsletter-1",
    sprint: 3,
    day: "2026-08-21",
    channel: "newsletter",
    title: "Newsletter #1 — Soft launch welcome",
    owner: "Both",
    postTime: "9:00 AM CT",
    copy: `Subject: You're invited — Get Your Side Hustle is live (soft launch)

Hi {first_name},

GYSH is open for early explorers.

This week:
1) Take the free Match Wizard for your age path
2) Grab a Free Guide
3) Tell a friend who's been "meaning to start"

Kids & Teens: parents coach the journey.
Adults & Seniors: pick one hustle and a weekly hour budget.

Start → https://getyoursidehustle.com

— Tina & Evelyn`,
    artifacts: [
      "Audience list or Resend segment (even if small)",
      "HTML or Resend template with brand footer",
      "Unsubscribe compliant",
      "Preview send to Tina + Evelyn",
      "Send log in Content Factory (status → published)",
    ],
    websiteActions: ["Optional: homepage banner “Soft launch — Match Wizard free” for 7 days"],
  },
  {
    id: "sl-s3-kevina-2",
    sprint: 3,
    day: "2026-08-21",
    channel: "facebook_kevina",
    title: "Kevina Starr FB — Kindness + first earn",
    owner: "Tina",
    postTime: "6:30 PM CT",
    copy: `Kindness is a glow skill ✨

This week’s Kids Corner idea: a kindness quest that can also be a tiny earn (cards, crafts, help-a-neighbor with a parent).

Parents — open Kids Match Wizard on GYSH and pick one gentle next step.

getyoursidehustle.com`,
    imagePrompt: `${BRAND_IMAGE} Soft illustrated “kindness quest” card for kids, gold stars, ivory page.`,
    artifacts: ["Evening post on Kevina page", "Reply to comments as Kevina/Tina voice"],
  },
  {
    id: "sl-s3-fb-seniors",
    sprint: 3,
    day: "2026-08-22",
    channel: "facebook_gysh",
    title: "FB — Seniors path (pace that fits)",
    owner: "Evelyn",
    postTime: "11:00 AM CT",
    copy: `Seniors: you don't need a grind culture hustle.

GYSH Seniors mode asks for flexible opportunities, fair pacing, and clear next steps — then a Blueprint you can keep.

Explore Seniors → getyoursidehustle.com`,
    imagePrompt: `${BRAND_IMAGE} Calm senior lifestyle + laptop, warm light, dignity-first. Headline: "Your pace. Your hustle."`,
    artifacts: ["Post", "Boost consideration later in Sprint 4 ads"],
  },
  {
    id: "sl-s3-web-seo-snippets",
    sprint: 3,
    day: "2026-08-22",
    channel: "website",
    title: "Website — SEO snippets for soft launch pages",
    owner: "Evelyn",
    websiteActions: [
      "Title/meta for Home, Guides, Join, Kids, Seniors",
      "Open Graph image for social shares (brand)",
      "Confirm robots.txt + sitemap reachable",
    ],
    artifacts: ["Doc of final meta strings in Drive", "OG image 1200×630 uploaded"],
  },
  {
    id: "sl-s3-fb-teens",
    sprint: 3,
    day: "2026-08-23",
    channel: "facebook_gysh",
    title: "FB — Teens: real skills, real practice",
    owner: "Tina",
    postTime: "1:00 PM CT",
    copy: `Teens (13–17): GYSH isn’t “little kids mode.”

Age-right questions, hustle ideas, and money tools — with parents still in the loop.

Teens path → getyoursidehustle.com`,
    imagePrompt: `${BRAND_IMAGE} Teen with notebook/phone, gold accent, confident not childish. Text: "Teens · Practice that pays."`,
    artifacts: ["Post", "Optional share to family groups"],
  },
  {
    id: "sl-s3-kevina-3",
    sprint: 3,
    day: "2026-08-23",
    channel: "facebook_kevina",
    title: "Kevina Starr FB — Weekend family Match night",
    owner: "Tina",
    postTime: "5:00 PM CT",
    copy: `Family night idea ✨

Open GYSH. Pick Kids or Teens. Take the Match Wizard together. Compare Blueprints. Cheer one tiny next step.

That’s the adventure.

getyoursidehustle.com`,
    imagePrompt: `${BRAND_IMAGE} Kitchen-table family scene, soft evening light, laptop open to GYSH-colored UI.`,
    artifacts: ["Weekend post", "Ask followers to comment their age path"],
  },
  {
    id: "sl-s3-fb-week-wrap",
    sprint: 3,
    day: "2026-08-24",
    channel: "facebook_gysh",
    title: "FB — Soft launch week wrap + ask",
    owner: "Both",
    postTime: "10:00 AM CT",
    copy: `Soft launch week — thank you for being early.

What do you want next from GYSH?
A) More free guides
B) Live workshops
C) Deeper Match Wizard tips
D) Kids story nights

Comment A/B/C/D — we read every one.

Keep exploring → getyoursidehustle.com`,
    imagePrompt: `${BRAND_IMAGE} Poll-style graphic with A–D chips in gold/crimson.`,
    artifacts: ["Post", "Tally replies into Agenda / Content Factory note"],
  },
  ...personalAmplifyFromCadence("sl-s3-personal-amplify-wrap"),
  {
    id: "sl-s3-ads-brief",
    sprint: 3,
    day: "2026-08-24",
    channel: "ads",
    title: "Ads — Sprint 4 test brief (prepare, don’t spend yet)",
    owner: "Evelyn",
    artifacts: [
      "Meta Business Manager access confirmed",
      "Pixel or Conversions API plan for getyoursidehustle.com",
      "Audience draft: lookalike / interest — side hustle, parenting, small business",
      "Creative: reuse FB Welcome + Match Wizard assets",
      "Budget proposal: $5–15/day test for 7 days (Sprint 4)",
      "Success metrics: CTR, CPC, landing → wizard start",
    ],
    notes: "No spend until Sprint 4 go/no-go with Tina.",
  },

  /* ───────────── Sprint 4 — Growth + first ads (Aug 25–31) ───────────── */
  {
    id: "sl-s4-ig-launch",
    sprint: 4,
    day: "2026-08-25",
    channel: "instagram_gysh",
    title: "IG — Grid launch (3 posts)",
    owner: "Tina",
    postTime: "11:00 AM CT",
    copy: `Post 1: Welcome carousel — four ages
Post 2: Match Wizard CTA
Post 3: Free Guides
Captions mirror FB; use #GetYourSideHustle #SideHustle #FamilyBusiness`,
    imagePrompt: `${BRAND_IMAGE} Three matching square posts, consistent frame, gold rule lines.`,
    artifacts: ["3 posts scheduled or published", "Highlights created", "Bio link live"],
  },
  {
    id: "sl-s4-tiktok-1",
    sprint: 4,
    day: "2026-08-25",
    channel: "tiktok_gysh",
    title: "TikTok — First video: Pick Your Path",
    owner: "Evelyn",
    postTime: "5:00 PM CT",
    imagePrompt: `${BRAND_IMAGE} 9:16: big question “Which path are you?” with four popping age chips Kids/Teens/Adults/Seniors; CTA Link in bio; getyoursidehustle.com.`,
    videoPrompt:
      "TikTok 9:16, 20–35s, trending-safe audio or original. On-screen: Kids/Teens/Adults/Seniors chips popping. CTA: Link in bio. Energetic but warm — not hype-bro.",
    hedraStartImagePrompt: `${HEDRA_START} 1080×1920. Centered bold question "Which path are you?" Four round Antique Gold chips stacked or 2×2: Kids, Teens, Adults, Seniors. Soft Ivory background, crimson accent arc, "Link in bio" small but sharp, getyoursidehustle.com at bottom. High contrast for mobile.`,
    hedraVideoPrompt: `${HEDRA_MOTION} TikTok 9:16, 20–35s. Punchy but warm: chips pop/scale in one-by-one with light bounce (no cartoon chaos); quick gold flash transitions; hold on "Link in bio" + getyoursidehustle.com last 2s. Pair with trending-safe audio after export. No distorted text.`,
    relatedTestIds: ["VIDEO-004"],
    copy: `Caption: Which path are you? Kids · Teens · Adults · Seniors — free Match Wizard on GYSH. Link in bio.`,
    artifacts: [
      "Hedra start image + Hedra video (9:16)",
      "Posted TikTok",
      "Cross-post to YT Shorts + IG Reels if quality allows",
      "QA with VIDEO-004",
    ],
  },
  ...personalAmplifyFromCadence("sl-s4-personal-amplify-ig-tt"),
  {
    id: "sl-s4-ads-live",
    sprint: 4,
    day: "2026-08-26",
    channel: "ads",
    title: "Ads — Meta traffic test week 1",
    owner: "Evelyn",
    postTime: "Morning CT",
    copy: `Ad primary text: Soft launch — find a side hustle that fits your age & stage. Free Match Wizard + Blueprint.
Headline: Get Your Side Hustle
CTA: Sign Up
Landing: getyoursidehustle.com?utm_source=meta&utm_medium=paid&utm_campaign=s4_soft_launch`,
    artifacts: [
      "Campaign live ($5–15/day)",
      "Daily check: spend, CTR, CPC, landing clicks",
      "Kill/scale note by Fri Aug 29",
      "Screenshot report for Agenda",
    ],
  },
  {
    id: "sl-s4-newsletter-2",
    sprint: 4,
    day: "2026-08-27",
    channel: "newsletter",
    title: "Newsletter #2 — One hustle, 30 days",
    owner: "Both",
    postTime: "9:00 AM CT",
    copy: `Subject: Pick ONE hustle for the next 30 days

Soft launch tip from GYSH:
1) Finish the Match Wizard
2) Choose one primary hustle — not five
3) Open its Launch Guide (steps 1–3 this week)
4) Set a weekly hour budget you can keep

Need a nudge? Reply to this email — we read them.

→ https://getyoursidehustle.com`,
    artifacts: ["Send", "Log open/click if available"],
  },
  {
    id: "sl-s4-kevina-cadence",
    sprint: 4,
    day: "2026-08-26",
    channel: "facebook_kevina",
    title: "Kevina Starr — 2 posts this sprint (Tue + Sat)",
    owner: "Tina",
    postTime: "6:30 PM CT",
    copy: `Tue: Glow Getter story teaser → Kids Corner CTA
Sat: Family Match Wizard night reminder`,
    imagePrompt: `${BRAND_IMAGE} Two kid-safe story stills / kindness cards.`,
    artifacts: ["Tue post", "Sat post", "GYSH Page shares one of them"],
  },
  ...personalAmplifyFromCadence("sl-s4-personal-amplify-kevina"),
  {
    id: "sl-s4-fb-cadence",
    sprint: 4,
    day: "2026-08-28",
    channel: "facebook_gysh",
    title: "FB — Mid-sprint value post (adult tip)",
    owner: "Evelyn",
    postTime: "12:00 PM CT",
    copy: `Adult tip: your constraint is a feature.

Low hours? Pick a hustle that respects that.
Tight budget? Start with free/low-cost GYSH guides.
Need accountability? Workshops & community are coming.

Match Wizard → Blueprint → one Guide.

getyoursidehustle.com`,
    imagePrompt: `${BRAND_IMAGE} Simple 3-step diagram: Match → Blueprint → Guide.`,
    artifacts: ["Post", "Boost top organic if ads paused"],
  },
  ...personalAmplifyFromCadence("sl-s4-personal-amplify-fb"),
  {
    id: "sl-s4-web-blog-or-update",
    sprint: 4,
    day: "2026-08-29",
    channel: "website",
    title: "Website — Soft launch update block / About polish",
    owner: "Evelyn",
    websiteActions: [
      "Ship or refresh About partnership blurb if ready",
      "Ensure Join expectation copy is clear (free vs paid)",
      "Add FAQ snippet: parental consent ages 4–12",
    ],
    artifacts: ["Prod deploy note", "Share URL to FB"],
  },
  {
    id: "sl-s4-yt-short-2",
    sprint: 4,
    day: "2026-08-30",
    channel: "youtube_gysh",
    title: "YouTube Short — Free Blueprint in 60s",
    owner: "Evelyn",
    copy: `Title: Free Side Hustle Blueprint in 60 Seconds
Description: Watch the GYSH path: pick your age → answer a few questions → unlock your free Side Hustle Blueprint.

Kids · Teens · Adults · Seniors — one platform, four generations.

Start free → https://getyoursidehustle.com

#Shorts #SideHustle #Blueprint #KidsEntrepreneurship #TeensEarnMoney
Tags: side hustle, free blueprint, match wizard, kids entrepreneurship, teens make money, adult side hustle, senior side hustle, get your side hustle`,
    imagePrompt: `${BRAND_IMAGE} 9:16 storyboard still: Home → age pick → Wizard → Unlock Blueprint, with caption bar "Free Blueprint in 60s".`,
    videoPrompt:
      "Screen + Hedra hybrid Short: click path Home → age → wizard tease → unlock CTA. Captions burned in. ≤60s.",
    hedraStartImagePrompt: `${HEDRA_START} 1080×1920. Vertical storyboard frame showing three stacked phone UI panels: (1) GYSH Home, (2) Pick Your Path ages, (3) Unlock Blueprint button. Caption bar: "Free Blueprint in 60s". Soft Ivory chrome, gold outlines, getyoursidehustle.com footer.`,
    hedraVideoPrompt: `${HEDRA_MOTION} YouTube Short 9:16, 35–55s. Animate a clear click-path: Home panel → age chip select → Wizard question flash → Blueprint unlock CTA. Burned-in captions: "Pick your age" → "Answer a few questions" → "Unlock your free Blueprint". Final 2s: Start free · getyoursidehustle.com. Prefer stylized UI motion over real login screens; never show secrets.`,
    relatedTestIds: ["VIDEO-005"],
    artifacts: [
      "Hedra start image + Hedra video (or screen capture hybrid)",
      "Upload Short",
      "Share to FB + IG Reels",
      "QA with VIDEO-005",
    ],
  },
  ...personalAmplifyFromCadence("sl-s4-personal-amplify-yt2"),
  {
    id: "sl-s4-ads-retro",
    sprint: 4,
    day: "2026-08-31",
    channel: "ads",
    title: "Ads — Week 1 retro + Sprint 5 decision",
    owner: "Both",
    artifacts: [
      "Sheet: spend, results, CPA proxy (click→wizard)",
      "Go / iterate / pause decision",
      "Creative winners saved to Drive",
    ],
  },

  /* ───────────── Sprint 5 — Scale & systems (Sep 1–7) ───────────── */
  {
    id: "sl-s5-cadence-system",
    sprint: 5,
    day: "2026-09-01",
    channel: "website",
    title: "Lock weekly Content Factory cadence (ops)",
    owner: "Both",
    artifacts: [
      "Standing: Tina = Kevina + GYSH FB voice; Evelyn = YT/TikTok/ads/tech",
      "Standing: follow PERSONAL_AMPLIFY_CADENCE (Tina + Evelyn each Task) — Personal amplify filter in Content Factory",
      "Weekly batch generate every Tuesday in Content Factory",
      "Shared calendar invites for brand post times + amplify windows (prefer 6–9 PM CT)",
    ],
    notes: "Turns soft launch into a machine — brand post + personal amplify growth cadence across Sprints 3–5.",
  },
  {
    id: "sl-s5-newsletter-3",
    sprint: 5,
    day: "2026-09-03",
    channel: "newsletter",
    title: "Newsletter #3 — Workshops teaser + guides",
    owner: "Both",
    copy: `Subject: What's next after your Blueprint?

If you finished the Match Wizard — open one Launch Guide and book (or waitlist) a workshop when dates lock.

Soft launch → steady rhythm. We're with you.

getyoursidehustle.com`,
    artifacts: ["Send", "Segment engaged openers if possible"],
  },
  {
    id: "sl-s5-ads-iterate",
    sprint: 5,
    day: "2026-09-02",
    channel: "ads",
    title: "Ads — Iterate winners or pause",
    owner: "Evelyn",
    artifacts: [
      "New creative from Sprint 4 winner",
      "Or pause and document learnings",
      "Budget cap respected",
    ],
  },
  {
    id: "sl-s5-kevina-cadence",
    sprint: 5,
    day: "2026-09-02",
    channel: "facebook_kevina",
    title: "Kevina Starr — 2 posts (story + GYSH bridge)",
    owner: "Tina",
    postTime: "6:30 PM CT",
    copy: `POST 1 — STORY (Kevina Starr Page)
A quiet win from Kids Corner this week: a child who finished one small step and felt proud.

That’s the pace I trust — curiosity first, pressure never.

If you’re coaching a kid ages 4–12, Kids Corner on Get Your Side Hustle meets you there.

getyoursidehustle.com (Kids path)

POST 2 — GYSH BRIDGE (same day or next evening)
When a family asks “where do we start?” I point them to the free Match Wizard — then Kids Corner Launch Guides.

No hard sell. Just a clear next step.

Start free → getyoursidehustle.com

(Optional: cross-share Post 2 to GYSH Facebook with one warm line from Tina.)`,
    artifacts: ["2 posts", "One cross-share on GYSH"],
  },
  ...personalAmplifyFromCadence("sl-s5-personal-amplify-kevina"),
  {
    id: "sl-s5-fb-ugc-ask",
    sprint: 5,
    day: "2026-09-04",
    channel: "facebook_gysh",
    title: "FB — UGC ask: share your Blueprint win",
    owner: "Tina",
    postTime: "11:00 AM CT",
    copy: `Early GYSH explorers — what did your Match Wizard suggest?

Comment your age path (Kids/Teens/Adults/Seniors) + one word about how it felt.

We'll feature kindness (with permission).`,
    artifacts: ["Post", "Request permission before resharing names"],
  },
  ...personalAmplifyFromCadence("sl-s5-personal-amplify-ugc"),
  {
    id: "sl-s5-multi-channel-repost",
    sprint: 5,
    day: "2026-09-05",
    channel: "instagram_gysh",
    title: "IG + TikTok — Best-of soft launch montage",
    owner: "Evelyn",
    copy: `INSTAGRAM REEL / CAPTION
Soft launch highlights — Get Your Side Hustle is live.

Kids · Teens · Adults · Seniors
Free Match Wizard → your Side Hustle Blueprint

Start free → link in bio
getyoursidehustle.com

#GetYourSideHustle #SideHustle #FamilyBusiness #KidsEntrepreneurship #MatchWizard

TIKTOK CAPTION
Best of our soft launch ✨ Side hustles for every age. Free Match Wizard + Blueprint → getyoursidehustle.com

YOUTUBE SHORTS CROSS-POST
Title: GYSH Soft Launch — Best Moments
Description: Highlights from the Get Your Side Hustle soft launch. Free Match Wizard + Blueprint for Kids, Teens, Adults & Seniors. https://getyoursidehustle.com`,
    imagePrompt: `${BRAND_IMAGE} 9:16 collage still of best soft-launch creatives in a gold grid + URL end card space.`,
    videoPrompt: "15–25s montage of best creatives + URL end card.",
    hedraStartImagePrompt: `${HEDRA_START} 1080×1920. Premium collage: 4–6 soft-launch stills in a gold-ruled grid (welcome hero, Match Wizard, Guides, age chips), Soft Ivory gutters, centered title "GYSH Soft Launch", crimson accent, bottom reserved for URL end card.`,
    hedraVideoPrompt: `${HEDRA_MOTION} 15–25s 9:16 montage. Ken Burns / soft crossfades across the collage tiles (no chaotic whip pans); brief gold flash between winners; end card 2s: getyoursidehustle.com + Start free. Keep text from source creatives legible when on screen.`,
    relatedTestIds: ["VIDEO-006"],
    artifacts: [
      "Hedra start image + Hedra montage video",
      "IG Reel",
      "TikTok",
      "YT Shorts cross-post",
      "QA with VIDEO-006",
    ],
  },
  ...personalAmplifyFromCadence("sl-s5-personal-amplify-montage"),
  {
    id: "sl-s5-retro",
    sprint: 5,
    day: "2026-09-07",
    channel: "website",
    title: "Soft launch marketing retro (Agenda input)",
    owner: "Both",
    artifacts: [
      "What worked / what didn't (1 page)",
      "Next 30-day content themes",
      "Budget recommendation for ads",
      "Update Content Factory statuses to published where done",
    ],
  },
];

export const SOFT_LAUNCH_PROJECTIONS: SprintProjection[] = [
  {
    sprint: 3,
    label: "Sprint 3 — Polish + cadence",
    rangeLabel: "8/18/26–8/24/26",
    theme:
      "Welcome the world: FB + YT live, daily organic, Kevina bridge, newsletter #1, channels created; personal amplify growth cadence (3 days)",
    /** Same as Content Factory item sl-s3-polish-cadence (not a separate card). */
    opsItemId: "sl-s3-polish-cadence",
    expectedOutcomes: [
      "GYSH Facebook welcome + ≥5 organic posts",
      "Tina + Evelyn personal amplify on cadence days (Why / Guides+YT / Week wrap)",
      "Kevina Starr Page: 3 soft CTAs into Kids Corner",
      "YouTube channel + first Short",
      "TikTok + Instagram accounts created (ready to post Sprint 4)",
      "Newsletter #1 sent (even to small list)",
      "Website soft-launch checklist green",
      "Ads brief ready — no required spend yet",
    ],
    metrics: [
      { label: "FB Page reach (organic)", low: "200", high: "1,500" },
      { label: "Site sessions from social", low: "40", high: "250" },
      { label: "Match Wizard starts", low: "10", high: "60" },
      { label: "Free accounts / joins", low: "5", high: "30" },
      { label: "YT Short views", low: "50", high: "500" },
    ],
    revenue: [
      {
        label: "Paid memberships (soft launch week)",
        lowUsd: 0,
        highUsd: 150,
        note: "Mostly free explorers; any Starter is upside, not the goal yet.",
      },
      {
        label: "Ad spend",
        lowUsd: 0,
        highUsd: 0,
        note: "Prepare only in S3.",
      },
    ],
  },
  {
    sprint: 4,
    label: "Sprint 4 — Growth + first ads",
    rangeLabel: "8/25/26–8/31/26",
    theme: "IG/TikTok first content, Meta test budget, newsletter #2, personal amplify on new platforms",
    expectedOutcomes: [
      "IG grid live (3 posts) + TikTok #1",
      "Personal amplify cadence: IG/TT launch, Kevina, GYSH tip, YT Short #2 (Tina + Evelyn each)",
      "Meta ads test $5–15/day with daily monitoring",
      "Newsletter #2 — “one hustle / 30 days”",
      "Kevina 2× + GYSH mid-week value post",
      "Ads retro with go/iterate/pause",
    ],
    metrics: [
      { label: "Paid + organic site sessions", low: "150", high: "800" },
      { label: "Match Wizard starts", low: "25", high: "120" },
      { label: "Free joins", low: "15", high: "70" },
      { label: "Ad CTR", low: "0.8%", high: "2.5%" },
      { label: "CPC (traffic)", low: "$0.40", high: "$2.50" },
    ],
    revenue: [
      {
        label: "Paid memberships (cumulative soft-launch)",
        lowUsd: 27,
        highUsd: 400,
        note: "Assumes a few Starter/Pro trials; treat as learning revenue.",
      },
      {
        label: "Ad spend (test week)",
        lowUsd: 35,
        highUsd: 105,
        note: "$5–15/day × ~7 days.",
      },
    ],
  },
  {
    sprint: 5,
    label: "Sprint 5 — Systems + iterate",
    rangeLabel: "9/1/26–9/7/26",
    theme: "Cadence locked, newsletter #3, ads iterate or pause, UGC, multi-channel best-of + personal amplify",
    expectedOutcomes: [
      "Standing weekly Content Factory ritual",
      "Personal amplify cadence: Kevina bridge, UGC ask, soft-launch montage (Tina + Evelyn each)",
      "Newsletter #3 + workshops teaser",
      "Ads decision executed",
      "UGC ask + montage across IG/TikTok/YT",
      "Written marketing retro for Agenda",
    ],
    metrics: [
      { label: "Email list size", low: "40", high: "200" },
      { label: "Returning site users", low: "20", high: "100" },
      { label: "Wizard completions (Blueprint unlocks)", low: "20", high: "100" },
      { label: "Combined social followers", low: "75", high: "400" },
    ],
    revenue: [
      {
        label: "MRR run-rate (early)",
        lowUsd: 0,
        highUsd: 300,
        note: "Directional only — soft launch is awareness + funnel learning.",
      },
      {
        label: "Net after ad spend (S4–S5)",
        lowUsd: -105,
        highUsd: 250,
        note: "OK to run slightly negative while learning CPA.",
      },
    ],
  },
];

export function rolloutItemsForSprint(sprint: number): SoftLaunchItem[] {
  return SOFT_LAUNCH_ROLLOUT.filter((i) => i.sprint === sprint);
}

export type SoftLaunchDueSort = "asc" | "desc";

/** Unique calendar due days (ISO) for filter chips, ascending. */
export function softLaunchDueDates(items: SoftLaunchItem[]): string[] {
  return [...new Set(items.map((i) => i.day).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function filterSoftLaunchByDueDay(
  items: SoftLaunchItem[],
  dueDay: string | "all",
): SoftLaunchItem[] {
  if (!dueDay || dueDay === "all") return items;
  return items.filter((i) => i.day === dueDay);
}

export function sortSoftLaunchByDueDay(
  items: SoftLaunchItem[],
  sort: SoftLaunchDueSort = "asc",
): SoftLaunchItem[] {
  const dir = sort === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    const byDay = a.day.localeCompare(b.day);
    if (byDay !== 0) return byDay * dir;
    return a.title.localeCompare(b.title);
  });
}

/** Group items by due day after optional channel/due filters; days ordered by sort. */
export function groupSoftLaunchByDay(
  items: SoftLaunchItem[],
  sort: SoftLaunchDueSort = "asc",
): { day: string; items: SoftLaunchItem[] }[] {
  const map = new Map<string, SoftLaunchItem[]>();
  for (const item of sortSoftLaunchByDueDay(items, sort)) {
    const list = map.get(item.day) ?? [];
    list.push(item);
    map.set(item.day, list);
  }
  const days = [...map.keys()].sort((a, b) =>
    sort === "desc" ? b.localeCompare(a) : a.localeCompare(b),
  );
  return days.map((day) => ({ day, items: map.get(day) ?? [] }));
}

export function rolloutItemsByDay(sprint?: number): { day: string; items: SoftLaunchItem[] }[] {
  const items = sprint == null ? SOFT_LAUNCH_ROLLOUT : rolloutItemsForSprint(sprint);
  return groupSoftLaunchByDay(items, "asc");
}

/** Convert a rollout item into Content Factory draft fields. */
export function rolloutItemToDraftFields(item: SoftLaunchItem): {
  type: "facebook_post" | "newsletter" | "youtube_script" | "image_prompt" | "adult_guide";
  title: string;
  excerpt: string;
  body: string;
  audience: "kid" | "junior" | "adult" | "all";
  owner: RolloutOwner;
} {
  const channel = ROLLOUT_CHANNEL_LABELS[item.channel];
  const links = softLaunchCrossLinks(item);
  const taskMd = adminMarkdownLink(`Task ${links.taskId}`, {
    tab: "tasks",
    taskId: links.taskId,
  });
  const factoryMd = adminMarkdownLink(
    `Content Factory ${links.itemRef}`,
    {
      tab: "factory",
      panel: "launch-plan",
      itemId: item.id,
    },
  );
  const testsMd = links.testIds
    .map((testId) =>
      adminMarkdownLink(`Test ${testId}`, { tab: "testing", testId }),
    )
    .join(", ");
  const bodyParts = [
    `CF: ${links.itemRef}`,
    `CHANNEL: ${channel}`,
    `WHEN: ${item.day}${item.postTime ? ` · ${item.postTime}` : ""}`,
    `OWNER: ${item.owner}`,
    `TASK: ${taskMd} · ${factoryMd}`,
    links.testIds.length ? `QA TESTS: ${testsMd}` : "",
    item.copy ? `\n--- COPY ---\n${item.copy}` : "",
    item.channel === "personal_amplify" && !item.copy?.includes("PERSONAL AMPLIFY")
      ? `\n--- HOW / WHEN (PERSONAL AMPLIFY) ---\n${PERSONAL_AMPLIFY_PLAYBOOK}`
      : "",
    item.hedraStartImagePrompt
      ? `\n--- HEDRA · STARTING IMAGE (generate/upload this still first) ---\n${item.hedraStartImagePrompt}`
      : item.imagePrompt
        ? `\n--- IMAGE PROMPT ---\n${item.imagePrompt}`
        : "",
    item.hedraVideoPrompt
      ? `\n--- HEDRA · VIDEO / MOTION (animate from the starting image) ---\n${item.hedraVideoPrompt}`
      : "",
    item.videoPrompt ? `\n--- VIDEO BRIEF ---\n${item.videoPrompt}` : "",
    item.imagePrompt && item.hedraStartImagePrompt
      ? `\n--- STATIC IMAGE (optional alternate) ---\n${item.imagePrompt}`
      : "",
    item.websiteActions?.length
      ? `\n--- WEBSITE ACTIONS ---\n${item.websiteActions.map((a, i) => `${i + 1}. ${a}`).join("\n")}`
      : "",
    `\n--- ARTIFACTS (A→Z) ---\n${item.artifacts.map((a, i) => `${i + 1}. ${a}`).join("\n")}`,
    item.notes ? `\nNOTES: ${item.notes}` : "",
  ];
  const type =
    item.channel === "newsletter"
      ? ("newsletter" as const)
      : item.channel === "youtube_gysh" || item.channel === "tiktok_gysh"
        ? ("youtube_script" as const)
        : item.channel === "website" || item.channel === "ads"
          ? ("adult_guide" as const)
          : item.imagePrompt && !item.copy
            ? ("image_prompt" as const)
            : ("facebook_post" as const);
  const audience =
    item.channel === "facebook_kevina" ? ("kid" as const) : ("all" as const);
  return {
    type,
    title: `[S${item.sprint}] ${item.title}`,
    excerpt: `${channel} · ${item.day}${item.postTime ? ` · ${item.postTime}` : ""}`,
    body: bodyParts.filter(Boolean).join("\n"),
    audience,
    owner: item.owner,
  };
}

/** Task rows for D1 / Task List (Sprint 3–5 soft launch marketing). */
export type SoftLaunchTaskSeed = {
  id: string;
  description: string;
  category: string;
  priority: string;
  assignedTo: string;
  assignBy: string;
  sprint: number;
  dueDate: string;
  notes: string;
};

function mmddyyFromIso(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${String(y).slice(-2)}`;
}

export type SoftLaunchTaskSeedOpts = {
  /** When true, return only task ids (cheap — used to find missing rows). */
  idsOnly?: boolean;
  /** Only build seeds for these task ids. */
  onlyIds?: string[];
  /**
   * Short notes (CF deep link only). Prefer for bulk sync so we do not
   * serialize every Hedra prompt into D1 on admin mount.
   */
  lightNotes?: boolean;
};

/** Soft-launch calendar items that get a Task List row. */
export function softLaunchSeedItems(): SoftLaunchItem[] {
  return SOFT_LAUNCH_ROLLOUT.filter((i) => i.sprint >= 3 || i.id.startsWith("sl-s2"));
}

export function softLaunchTaskSeeds(): SoftLaunchTaskSeed[];
export function softLaunchTaskSeeds(opts: { idsOnly: true }): string[];
export function softLaunchTaskSeeds(opts: SoftLaunchTaskSeedOpts): SoftLaunchTaskSeed[];
export function softLaunchTaskSeeds(
  opts: SoftLaunchTaskSeedOpts = {},
): SoftLaunchTaskSeed[] | string[] {
  let items = softLaunchSeedItems();
  if (opts.onlyIds?.length) {
    const want = new Set(opts.onlyIds.map((id) => id.toUpperCase()));
    items = items.filter((i) => want.has(softLaunchTaskId(i.id)));
  }
  if (opts.idsOnly) {
    return items.map((i) => softLaunchTaskId(i.id));
  }
  return items.map((item) => {
    const ref = softLaunchItemRef(item.id);
    const taskId = softLaunchTaskId(item.id);
    const factoryLink = adminMarkdownLink(`Content Factory ${ref}`, {
      tab: "factory",
      panel: "launch-plan",
      itemId: item.id,
    });
    const notes = opts.lightNotes
      ? `CF: ${ref}\n${factoryLink}\nOpen Content Factory for full copy / Hedra prompts / artifacts.`
      : rolloutItemToDraftFields(item).body.slice(0, 8000);
    return {
      id: taskId,
      description: `${ref} · ${ROLLOUT_CHANNEL_LABELS[item.channel]}: ${item.title}`,
      category: "launch_marketing",
      priority:
        item.id.includes("welcome") ||
        item.id.includes("yt-create") ||
        item.id.includes("polish-cadence")
          ? "P0"
          : "P1",
      assignedTo: item.owner === "Both" ? "Both" : item.owner,
      assignBy: "Evelyn",
      sprint: item.sprint === 2 ? 2 : item.sprint,
      dueDate: mmddyyFromIso(item.day),
      notes,
    };
  });
}
