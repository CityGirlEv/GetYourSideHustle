/**
 * GYSH Soft Launch Marketing Rollout — Sprints 3–5
 * Expert marketing cadence: Facebook, Kevina Starr, website/newsletter, ads, new channels.
 * Dates aligned to sprint windows (Tue–Mon) from gysh-sprints.
 */

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
    "Save finished asset links (Drive / upload paths) back into the related task notes when available.",
    "Use Content Factory → Workshops to edit public workshop titles, dates, and registration.",
  ],
};

export const MARKETING_PLAN_DEFINITIONS: { term: string; definition: string }[] = [
  {
    term: "GYSH Marketing/Launch Plan",
    definition:
      "The living soft-launch marketing calendar (Sprints 2 kickoff through 5): daily posts, newsletters, ads prep, channel setup, Kevina Starr bridges, website actions, projections, and artifact checklists.",
  },
  {
    term: "Cadence",
    definition:
      "The repeating weekly marketing rhythm — who posts where and when (e.g. Tina on GYSH FB + Kevina Starr; Evelyn on YouTube / TikTok / Instagram / ads / site).",
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
      "Where the item goes live: Facebook (GYSH or Kevina Starr), YouTube, TikTok, Instagram, website, newsletter, or paid ads.",
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
  | "ads";

export type RolloutOwner = "Tina" | "Evelyn" | "Both";

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
};

export type SprintProjection = {
  sprint: number;
  label: string;
  rangeLabel: string;
  theme: string;
  expectedOutcomes: string[];
  metrics: { label: string; low: string; high: string }[];
  revenue: { label: string; lowUsd: number; highUsd: number; note: string }[];
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
};

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

/** True when this calendar item is expected to ship a video creative. */
export function softLaunchItemRequiresVideo(item: SoftLaunchItem): boolean {
  return Boolean(item.hedraVideoPrompt || item.videoPrompt);
}

/** All soft-launch items that require video creatives (Hedra path). */
export function softLaunchVideoItems(): SoftLaunchItem[] {
  return SOFT_LAUNCH_ROLLOUT.filter(softLaunchItemRequiresVideo);
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

  /* ───────────── Sprint 3 — Polish + daily cadence (Aug 4–10) ───────────── */
  {
    id: "sl-s3-channels-tiktok",
    sprint: 3,
    day: "2026-08-04",
    channel: "tiktok_gysh",
    title: "Create GYSH TikTok account",
    owner: "Evelyn",
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
    day: "2026-08-04",
    channel: "instagram_gysh",
    title: "Create GYSH Instagram account",
    owner: "Evelyn",
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
    day: "2026-08-04",
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
    day: "2026-08-04",
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
  {
    id: "sl-s3-kevina-1",
    sprint: 3,
    day: "2026-08-05",
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
    day: "2026-08-05",
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
    day: "2026-08-06",
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
    hedraVideoPrompt: `${HEDRA_MOTION} YouTube Short 9:16, 25–35s. Beat 1 (0–3s): hook text snaps in, soft gold glow. Beat 2 (3–12s): camera drifts across Kids→Teens→Adults→Seniors lanes; each lane brightens briefly. Beat 3 (12–22s): transition to Match Wizard card + Blueprint scroll tease (readable, not gibberish). Beat 4 (22–35s): end card hold — Start free · getyoursidehustle.com, subtle zoom stop. High clarity captions; no face morphing.`,
    relatedTestIds: ["VIDEO-003"],
    artifacts: [
      "Hedra start image from hedraStartImagePrompt",
      "Hedra video from hedraVideoPrompt (export 9:16)",
      "Uploaded Short on GYSH YouTube",
      "Thumbnail (brand frame — can use start image crop)",
      "End screen + cards pointing to site",
      "Share Short URL to GYSH FB same day",
      "QA with VIDEO-003 (attach Short URL + export)",
    ],
  },
  {
    id: "sl-s3-fb-free-guides",
    sprint: 3,
    day: "2026-08-06",
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
  {
    id: "sl-s3-newsletter-1",
    sprint: 3,
    day: "2026-08-07",
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
    day: "2026-08-07",
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
    day: "2026-08-08",
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
    day: "2026-08-08",
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
    day: "2026-08-09",
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
    day: "2026-08-09",
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
    day: "2026-08-10",
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
  {
    id: "sl-s3-ads-brief",
    sprint: 3,
    day: "2026-08-10",
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

  /* ───────────── Sprint 4 — Growth + first ads (Aug 11–17) ───────────── */
  {
    id: "sl-s4-ig-launch",
    sprint: 4,
    day: "2026-08-11",
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
    day: "2026-08-11",
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
  {
    id: "sl-s4-ads-live",
    sprint: 4,
    day: "2026-08-12",
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
      "Kill/scale note by Fri Aug 15",
      "Screenshot report for Agenda",
    ],
  },
  {
    id: "sl-s4-newsletter-2",
    sprint: 4,
    day: "2026-08-13",
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
    day: "2026-08-12",
    channel: "facebook_kevina",
    title: "Kevina Starr — 2 posts this sprint (Tue + Sat)",
    owner: "Tina",
    postTime: "6:30 PM CT",
    copy: `Tue: Glow Getter story teaser → Kids Corner CTA
Sat: Family Match Wizard night reminder`,
    imagePrompt: `${BRAND_IMAGE} Two kid-safe story stills / kindness cards.`,
    artifacts: ["Tue post", "Sat post", "GYSH Page shares one of them"],
  },
  {
    id: "sl-s4-fb-cadence",
    sprint: 4,
    day: "2026-08-14",
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
  {
    id: "sl-s4-web-blog-or-update",
    sprint: 4,
    day: "2026-08-15",
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
    day: "2026-08-16",
    channel: "youtube_gysh",
    title: "YouTube Short — Free Blueprint in 60s",
    owner: "Evelyn",
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
  {
    id: "sl-s4-ads-retro",
    sprint: 4,
    day: "2026-08-17",
    channel: "ads",
    title: "Ads — Week 1 retro + Sprint 5 decision",
    owner: "Both",
    artifacts: [
      "Sheet: spend, results, CPA proxy (click→wizard)",
      "Go / iterate / pause decision",
      "Creative winners saved to Drive",
    ],
  },

  /* ───────────── Sprint 5 — Scale & systems (Aug 18–24) ───────────── */
  {
    id: "sl-s5-cadence-system",
    sprint: 5,
    day: "2026-08-18",
    channel: "website",
    title: "Lock weekly Content Factory cadence (ops)",
    owner: "Both",
    artifacts: [
      "Standing: Tina = Kevina + GYSH FB voice; Evelyn = YT/TikTok/ads/tech",
      "Weekly batch generate every Tuesday in Content Factory",
      "Shared calendar invites for post times",
    ],
    notes: "Turns soft launch into a machine.",
  },
  {
    id: "sl-s5-newsletter-3",
    sprint: 5,
    day: "2026-08-20",
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
    day: "2026-08-19",
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
    day: "2026-08-19",
    channel: "facebook_kevina",
    title: "Kevina Starr — 2 posts (story + GYSH bridge)",
    owner: "Tina",
    postTime: "6:30 PM CT",
    copy: `Keep bridging story → Kids Corner without hard sell. Soft CTA every post.`,
    artifacts: ["2 posts", "One cross-share on GYSH"],
  },
  {
    id: "sl-s5-fb-ugc-ask",
    sprint: 5,
    day: "2026-08-21",
    channel: "facebook_gysh",
    title: "FB — UGC ask: share your Blueprint win",
    owner: "Tina",
    postTime: "11:00 AM CT",
    copy: `Early GYSH explorers — what did your Match Wizard suggest?

Comment your age path (Kids/Teens/Adults/Seniors) + one word about how it felt.

We'll feature kindness (with permission).`,
    artifacts: ["Post", "Request permission before resharing names"],
  },
  {
    id: "sl-s5-multi-channel-repost",
    sprint: 5,
    day: "2026-08-22",
    channel: "instagram_gysh",
    title: "IG + TikTok — Best-of soft launch montage",
    owner: "Evelyn",
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
  {
    id: "sl-s5-retro",
    sprint: 5,
    day: "2026-08-24",
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
    rangeLabel: "8/4/26–8/10/26",
    theme: "Welcome the world: FB + YT live, daily organic, Kevina bridge, newsletter #1, channels created",
    expectedOutcomes: [
      "GYSH Facebook welcome + ≥5 organic posts",
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
    rangeLabel: "8/11/26–8/17/26",
    theme: "IG/TikTok first content, Meta test budget, newsletter #2, tighter funnel",
    expectedOutcomes: [
      "IG grid live (3 posts) + TikTok #1",
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
    rangeLabel: "8/18/26–8/24/26",
    theme: "Cadence locked, newsletter #3, ads iterate or pause, UGC, multi-channel best-of",
    expectedOutcomes: [
      "Standing weekly Content Factory ritual",
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

export function rolloutItemsByDay(sprint?: number): { day: string; items: SoftLaunchItem[] }[] {
  const items = sprint == null ? SOFT_LAUNCH_ROLLOUT : rolloutItemsForSprint(sprint);
  const map = new Map<string, SoftLaunchItem[]>();
  for (const item of items) {
    const list = map.get(item.day) ?? [];
    list.push(item);
    map.set(item.day, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, dayItems]) => ({ day, items: dayItems }));
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
  const bodyParts = [
    `CHANNEL: ${channel}`,
    `WHEN: ${item.day}${item.postTime ? ` · ${item.postTime}` : ""}`,
    `OWNER: ${item.owner}`,
    item.relatedTestIds?.length
      ? `QA TESTS: ${item.relatedTestIds.join(", ")} (Testing Portal)`
      : "",
    item.copy ? `\n--- COPY ---\n${item.copy}` : "",
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

export function softLaunchTaskSeeds(): SoftLaunchTaskSeed[] {
  return SOFT_LAUNCH_ROLLOUT.filter((i) => i.sprint >= 3 || i.id.startsWith("sl-s2")).map((item) => {
    const fields = rolloutItemToDraftFields(item);
    return {
      id: softLaunchTaskId(item.id),
      description: `${ROLLOUT_CHANNEL_LABELS[item.channel]}: ${item.title}`,
      category: "launch_marketing",
      priority: item.id.includes("welcome") || item.id.includes("yt-create") ? "P0" : "P1",
      assignedTo: item.owner === "Both" ? "Both" : item.owner,
      assignBy: "Evelyn",
      sprint: item.sprint === 2 ? 2 : item.sprint,
      dueDate: mmddyyFromIso(item.day),
      // Keep Hedra prompts intact in Task List notes (D1 TEXT).
      notes: fields.body.slice(0, 8000),
    };
  });
}
