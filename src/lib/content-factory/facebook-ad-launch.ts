/**
 * Paid Facebook / Meta ad launch — editorial calendar slot 98.
 * Organic page posts use slots 0–7; invites use slot 99.
 */

import { BUILD_COMPARISON_HEADLINE } from "@/lib/plan-comparison-copy";
import { FB_POST_DISCLAIMER } from "@/lib/content-factory/facebook-post-seed-copy";
import { MPD_DISCLAIMER } from "@/lib/medicare-disclaimers";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { seedProductionUrl } from "@/lib/content-factory/seed-production-url";
import { formatIsoDate, shiftIsoDate } from "@/lib/content-factory/editorial-daily-checklist";
import { formatEditorialTimeLabel } from "@/lib/content-factory/weekly-editorial-schedule";
import type { EditorialCalendarEvent, EditorialMilestone } from "@/lib/content-factory/weekly-editorial-schedule";

export const FACEBOOK_AD_SLOT_INDEX = 98;

export const FACEBOOK_AD_PRODUCE_EVENT_ID = "facebook_ad:produce";
export const FACEBOOK_AD_LAUNCH_EVENT_ID = "facebook_ad:launch";

export const FACEBOOK_AD_PRODUCE_TIME = "20:00";
/** Recommended over midnight — higher engagement for Medicare research audience. */
export const FACEBOOK_AD_LAUNCH_TIME = "06:30";
export const FACEBOOK_AD_MIDNIGHT_TIME = "00:00";

export const FACEBOOK_AD_DESTINATION_URL = seedProductionUrl("/scenario/new");

export const FACEBOOK_AD_CAMPAIGN_ID = "plan-comparison-v1";

/** TPMO + MPD footer — required in Meta primary text for CMS marketing compliance. */
export const FACEBOOK_AD_DISCLAIMER = `${FB_POST_DISCLAIMER}

${MPD_DISCLAIMER}`;

/** Producer checklist — Meta ad review + CMS marketing rules (42 CFR §422.2262 / §423.2262). */
export const FACEBOOK_AD_META_COMPLIANCE_NOTES = `Meta & CMS compliance checklist:
• Primary text must include the full disclaimer below (TPMO + Multi-Plan Disclaimer).
• Do not use "free," "best," "#1," "guaranteed," or "all plans" in headline, description, or video.
• Video/image: no Medicare card, CMS/government logos or seals, carrier/plan names, star ratings, premiums, readable text, or enrollment CTAs burned into the creative.
• Add headline, description, disclaimer, and CTA only in Ads Manager — not inside Hedra output.
• Destination must match ${FACEBOOK_AD_DESTINATION_URL} and land on the educational scenario builder (no login wall).
• Prefer the approved voiceover script below — scene by scene in Hedra; do not improvise claims or superlatives ("best," "tremendous," "saved thousands").
• Conversational frustration about sales calls is OK; do not name carriers or show real caller ID text.`;

/** First paid campaign — Traffic beats Page Likes for v1. */
export const FACEBOOK_AD_CAMPAIGN_STRATEGY = `Launch with Traffic (website visits to the scenario builder) — not a Page Like campaign.
• Page Likes build an audience but rarely start comparisons; your goal is people on /scenario/new.
• Week 1: $10–20/day Traffic ad with this video → ${FACEBOOK_AD_DESTINATION_URL}.
• Week 2+ (optional): retarget people who watched 50%+ of the video with the same traffic ad, or test a $5/day Page Like ad to warm future organic reach — only after Traffic CPC looks acceptable.`;

/** Full voiceover (~28s) — record in Hedra per scene or as one track in CapCut. Use exactly; do not paraphrase. */
export const FACEBOOK_AD_VOICEOVER_SCRIPT = `Another Medicare call. I couldn't take one more sales pitch — so I hung up.

Choosing a plan felt overwhelming. Too many options, too many people calling.

I tried ${SITE_BRAND_NAME} — an educational comparison tool. No phone number, no email, no salesperson on the line.

It helped me explore sample plans for my situation on my own terms. That made the research feel a lot more manageable.

Now when I decide to speak to an agent, I'll pretty much know my options. I just liked ${SITE_BRAND_NAME}. You oughta give it a whirl.`;

export interface FacebookAdHedraScene {
  id: string;
  label: string;
  durationSec: number;
  /** Hedra motion / scene prompt — use with saved character from character image step */
  prompt: string;
  /** Hedra audio / lip-sync — paste exactly */
  voiceoverLine: string;
}

/** Step 0 — generate once in Hedra Character, then reuse in all five video scenes. */
export const FACEBOOK_AD_HEDRA_CHARACTER_IMAGE_PROMPT = `Photorealistic portrait, 9:16 vertical. Woman in her early 60s, shoulder-length silver-streaked brown hair, warm friendly face, minimal natural makeup, soft cream cardigan over a simple top. Bright quiet American living room, soft natural window light, shallow depth of field, documentary lifestyle photography — not stock-ad glossy. Calm neutral expression, looking slightly off-camera as if about to answer a phone. No text, no logos, no Medicare card, no government seals, no insurance agent in a suit, no readable props.`;

export function formatHedraSceneBlock(scene: FacebookAdHedraScene): string {
  return [`VO (exact): "${scene.voiceoverLine}"`, "", scene.prompt].join("\n");
}

/** Conversational story: sales-call fatigue → plan stress → private tool → relief → friendly CTA. */
export const FACEBOOK_AD_HEDRA_SCENES: FacebookAdHedraScene[] = [
  {
    id: "hang-up",
    label: "Scene 1 — another Medicare call, hang up (~4s)",
    durationSec: 4,
    voiceoverLine: "Another Medicare call. I couldn't take one more sales pitch — so I hung up.",
    prompt: `9:16 vertical, ~4 seconds. This character in her quiet living room. She picks up a smartphone, listens briefly with a tired frustrated expression, then ends the call and sets the phone face-down on the table — small relieved sigh, not angry. Natural indoor light, documentary feel.

CRITICAL — CMS/Meta safe: no readable caller ID or phone screen text; no carrier or agency names; no Medicare card; no government logos; no on-screen captions; no enrollment language.`,
  },
  {
    id: "headache",
    label: "Scene 2 — the headache of choosing (~6s)",
    durationSec: 6,
    voiceoverLine:
      "Choosing a plan felt overwhelming. Too many options, too many people calling.",
    prompt: `9:16 vertical, ~6 seconds. Medium close-up of this character speaking directly to camera — conversational, empathetic, like talking to a friend. She gestures lightly with one hand (open palm, small shrug). Kitchen or living room background, soft bokeh. Expression: honest frustration, not dramatic.

CRITICAL — CMS/Meta safe: lip-sync only the approved voiceover line; no text overlays; no logos; no agent in a suit pitching; no superlative claims; no CMS or carrier branding.`,
  },
  {
    id: "private-tool",
    label: "Scene 3 — private comparison tool (~5s)",
    durationSec: 5,
    voiceoverLine: `I tried ${SITE_BRAND_NAME} — an educational comparison tool. No phone number, no email, no salesperson on the line.`,
    prompt: `9:16 vertical, ~5 seconds. Over-the-shoulder shot of this character holding a smartphone at the kitchen table. Screen shows only soft blurred color blocks — no readable text, URLs, or buttons. Calm focus, slower scroll. Mood: quiet research on her own schedule, not a sales appointment.

CRITICAL — CMS/Meta safe: no readable screen; no "Enroll" buttons; no website URL visible; no carrier logos; no Medicare card.`,
  },
  {
    id: "relief",
    label: "Scene 4 — research feels manageable (~5s)",
    durationSec: 5,
    voiceoverLine:
      "It helped me explore sample plans for my situation on my own terms. That made the research feel a lot more manageable.",
    prompt: `9:16 vertical, ~5 seconds. Medium close-up of this character speaking to camera — warmer, relieved smile, nodding slightly. Same home setting. Conversational close, educational tone (not a hard sell).

CRITICAL — CMS/Meta safe: no text overlays, logos, or end cards in the video file; no "best plan" or guarantee language; headline "${BUILD_COMPARISON_HEADLINE}" goes in Ads Manager only.`,
  },
  {
    id: "cta-close",
    label: "Scene 5 — friendly CTA close (~7s)",
    durationSec: 7,
    voiceoverLine: `Now when I decide to speak to an agent, I'll pretty much know my options. I just liked ${SITE_BRAND_NAME}. You oughta give it a whirl.`,
    prompt: `9:16 vertical, ~7 seconds. Medium close-up of this character speaking directly to camera — warm, confident smile, like recommending a tool to a friend over coffee. Light inviting gesture (open palm toward viewer). Same home setting, soft natural light.

CRITICAL — CMS/Meta safe: lip-sync only the approved voiceover line; no "free," "best," or guarantee language on screen; no text overlays, logos, URLs, or end cards in the video file; no enrollment CTAs burned into the clip.`,
  },
];

export const FACEBOOK_AD_HEDRA_NOTES = `Hedra workflow (conversational ~28s ad):
1. Character image first — paste the character image prompt, save her in Hedra (reuse in every scene).
2. Scenes 1–5 — select saved character → paste motion prompt → paste matching VO for lip-sync (word for word).
3. Export each clip 9:16; stitch to ~28s in CapCut or DaVinci.
4. Do not let Hedra rewrite dialogue — CMS/Meta rules forbid improvised superlatives or enrollment promises.
5. Disclaimers and CTA live in Meta primary text only, never burned into the video.
6. Image fallback if video slips: 1080×1080 hero crop with no text in the file.`;

export function formatFacebookAdHedraPasteBlock(
  scenes: FacebookAdHedraScene[] = FACEBOOK_AD_HEDRA_SCENES,
): string {
  return [
    FACEBOOK_AD_HEDRA_NOTES,
    "",
    "--- Character image (Hedra — create once, reuse all scenes) ---",
    FACEBOOK_AD_HEDRA_CHARACTER_IMAGE_PROMPT,
    "",
    ...scenes.flatMap((scene) => [
      `--- ${scene.label} (${scene.durationSec}s) ---`,
      ...formatHedraSceneBlock(scene).split("\n"),
      "",
    ]),
  ].join("\n").trim();
}

/** Legacy single-block summary — prefer Hedra scene prompts above. */
export const FACEBOOK_AD_VIDEO_PROMPT = formatFacebookAdHedraPasteBlock();

export interface FacebookAdCopy {
  primaryText: string;
  headline: string;
  description: string;
  callToAction: string;
  destinationUrl: string;
  disclaimer: string;
}

export const FACEBOOK_AD_COPY: FacebookAdCopy = {
  primaryText: `Tired of another Medicare sales call? Picking a plan can feel overwhelming — especially when every ring sounds like a pitch.

${SITE_BRAND_NAME} lets you explore sample plan types privately: no phone number, no email, no salesperson on the line. Answer a few questions about your ZIP area and medications, then get a de-identified comparison ID you share only if you choose.

${FACEBOOK_AD_DISCLAIMER}`,
  headline: BUILD_COMPARISON_HEADLINE,
  description: "Educational Medicare comparison tool",
  callToAction: "Learn more",
  destinationUrl: FACEBOOK_AD_DESTINATION_URL,
  disclaimer: FACEBOOK_AD_DISCLAIMER,
};

export const FACEBOOK_AD_IMAGE_NOTE =
  "Image fallback: 1080×1080 crop of src/assets/home-cover-hero.png (no text burned into the image). Add headline and full disclaimer in Meta Ads Manager only — do not imply CMS or Medicare endorsement.";

export interface FacebookAdTargeting {
  objective: string;
  locations: string;
  ageRange: string;
  interests: string;
  dailyBudget: string;
  placements: string;
}

export const FACEBOOK_AD_TARGETING: FacebookAdTargeting = {
  objective:
    "Traffic → website visits to /scenario/new (not Page Likes for v1 — see campaign strategy on Meta admin)",
  locations: "United States",
  ageRange: "55–64",
  interests: "Medicare, retirement planning, turning 65",
  dailyBudget: "$10–20/day to start",
  placements: "Facebook Feed + Instagram Feed only (disable Audience Network for v1)",
};

export interface FacebookAdCampaign {
  id: string;
  title: string;
  summary: string;
  strategyNote: string;
  copy: FacebookAdCopy;
  videoPrompt: string;
  hedraScenes: FacebookAdHedraScene[];
  hedraCharacterImagePrompt: string;
  hedraNotes: string;
  voiceoverScript: string;
  metaComplianceNotes: string;
  imageNote: string;
  targeting: FacebookAdTargeting;
}

export const FACEBOOK_AD_CAMPAIGNS: FacebookAdCampaign[] = [
  {
    id: FACEBOOK_AD_CAMPAIGN_ID,
    title: "Plan comparison traffic — scenario builder",
    summary:
      "Conversational Hedra video (sales-call fatigue → plan stress → private comparison tool). First paid campaign: Traffic to the wizard, not Page Likes.",
    strategyNote: FACEBOOK_AD_CAMPAIGN_STRATEGY,
    copy: FACEBOOK_AD_COPY,
    videoPrompt: FACEBOOK_AD_VIDEO_PROMPT,
    hedraScenes: FACEBOOK_AD_HEDRA_SCENES,
    hedraCharacterImagePrompt: FACEBOOK_AD_HEDRA_CHARACTER_IMAGE_PROMPT,
    hedraNotes: FACEBOOK_AD_HEDRA_NOTES,
    voiceoverScript: FACEBOOK_AD_VOICEOVER_SCRIPT,
    metaComplianceNotes: FACEBOOK_AD_META_COMPLIANCE_NOTES,
    imageNote: FACEBOOK_AD_IMAGE_NOTE,
    targeting: FACEBOOK_AD_TARGETING,
  },
];

export function getFacebookAdCampaign(campaignId = FACEBOOK_AD_CAMPAIGN_ID): FacebookAdCampaign {
  return (
    FACEBOOK_AD_CAMPAIGNS.find((c) => c.id === campaignId) ?? FACEBOOK_AD_CAMPAIGNS[0]!
  );
}

export interface FacebookAdScheduleDates {
  produceDate: string;
  launchDate: string;
}

/** Produce = today, launch = tomorrow (rolling schedule for first campaign). */
export function getFacebookAdScheduleDates(today = new Date()): FacebookAdScheduleDates {
  const anchor = new Date(today);
  anchor.setHours(12, 0, 0, 0);
  const produceDate = formatIsoDate(anchor);
  return {
    produceDate,
    launchDate: shiftIsoDate(produceDate, 1),
  };
}

export function formatFacebookAdScheduleNote(dates: FacebookAdScheduleDates): string {
  const launchLabel = new Date(`${dates.launchDate}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `Recommended: schedule for ${launchLabel} at ${formatEditorialTimeLabel(FACEBOOK_AD_LAUNCH_TIME)} Eastern (account timezone in Ads Manager). Midnight works, but early-morning delivery usually gets better reach among people researching Medicare before work.`;
}

export interface FacebookAdLaunchStep {
  id: string;
  label: string;
  detail?: string;
  copyField?:
    | keyof FacebookAdCopy
    | "videoPrompt"
    | "imageNote"
    | "hedraScenes"
    | "hedraCharacterImage"
    | "hedraNotes"
    | "voiceoverScript"
    | "metaComplianceNotes"
    | "strategyNote";
  /** When set, copy block is motion prompt + VO for this Hedra scene */
  hedraSceneId?: string;
}

export function buildFacebookAdProduceSteps(dates: FacebookAdScheduleDates): FacebookAdLaunchStep[] {
  const launchTimeLabel = formatEditorialTimeLabel(FACEBOOK_AD_LAUNCH_TIME);
  const leadScenes = FACEBOOK_AD_HEDRA_SCENES.slice(0, -1);
  const closingScene = FACEBOOK_AD_HEDRA_SCENES.at(-1)!;
  const hedraSceneStep = (scene: (typeof FACEBOOK_AD_HEDRA_SCENES)[number]): FacebookAdLaunchStep => ({
    id: `hedra-${scene.id}`,
    label: `Hedra — ${scene.label}`,
    detail: "Select saved character → paste motion prompt + VO lip-sync (exact words).",
    hedraSceneId: scene.id,
  });

  return [
    {
      id: "hedra-character",
      label: "Hedra — create character image (once, reuse in all scenes).",
      detail: "Generate portrait in Hedra Character, save her, then select this character for every video scene below.",
      copyField: "hedraCharacterImage",
    },
    ...leadScenes.map(hedraSceneStep),
    {
      id: "hedra-stitch",
      label: "Stitch scenes 1–4 in CapCut / DaVinci (timing preview).",
      copyField: "voiceoverScript",
      detail: "Rough-cut the first four clips, then record Scene 5 below — the finished video must end on “give it a whirl.”",
    },
    hedraSceneStep(closingScene),
    {
      id: "meta-login",
      label: "Log into Meta Business Suite / Ads Manager (Part B Optimizer Benchmark Tool Facebook account).",
      detail: "https://business.facebook.com and https://adsmanager.facebook.com",
    },
    {
      id: "ads-manager",
      label: "Create campaign — objective Traffic (website visits), not Page Likes.",
      detail: "Turn OFF Advantage+ campaign budget for first test.",
    },
    {
      id: "ad-set",
      label: "Ad set: United States, ages 55–64, Medicare / retirement interests.",
      detail: "$10–20/day. Placements: Facebook Feed + Instagram Feed only (disable Audience Network).",
    },
    {
      id: "upload-creative",
      label: "Upload stitched Hedra video (or hero image fallback if video not ready).",
      copyField: "imageNote",
    },
    {
      id: "paste-copy",
      label: "Paste primary text (includes TPMO + MPD disclaimer), headline, description, CTA.",
      copyField: "primaryText",
    },
    {
      id: "destination",
      label: "Destination URL → scenario builder.",
      copyField: "destinationUrl",
    },
    {
      id: "schedule-draft",
      label: `Save draft or schedule start: ${dates.launchDate} at ${launchTimeLabel} (account timezone).`,
      detail: formatFacebookAdScheduleNote(dates),
    },
  ];
}

export function buildFacebookAdLaunchSteps(dates: FacebookAdScheduleDates): FacebookAdLaunchStep[] {
  const launchTimeLabel = formatEditorialTimeLabel(FACEBOOK_AD_LAUNCH_TIME);
  const midnightLabel = formatEditorialTimeLabel(FACEBOOK_AD_MIDNIGHT_TIME);
  return [
    {
      id: "review-policy",
      label: "Confirm ad passed Meta review (or scheduled with green status).",
    },
    {
      id: "disclaimer-visible",
      label: "Mobile preview: full TPMO + MPD disclaimer visible in primary text.",
      copyField: "disclaimer",
    },
    {
      id: "video-preview",
      label: "Preview video on mobile — no burned-in text, logos, or enrollment CTAs.",
      copyField: "metaComplianceNotes",
    },
    {
      id: "link-test",
      label: "Click ad preview → lands on /scenario/new with no login wall.",
      copyField: "destinationUrl",
    },
    {
      id: "go-live",
      label: `Publish or confirm scheduled start (${launchTimeLabel} on ${dates.launchDate} ET recommended).`,
      detail: `Midnight alternative: ${midnightLabel} on ${dates.launchDate} in Ads Manager.`,
    },
    {
      id: "note-spend",
      label: "Screenshot Ads Manager confirmation; note daily budget in run log.",
    },
  ];
}

export function facebookAdStepStorageId(eventDate: string, stepId: string): string {
  return `${eventDate}:facebook_ad:${stepId}`;
}

export function isFacebookAdLaunchEvent(event: {
  slotIndex: number;
  id?: string;
}): boolean {
  return (
    event.slotIndex === FACEBOOK_AD_SLOT_INDEX ||
    event.id === FACEBOOK_AD_LAUNCH_EVENT_ID ||
    event.id === FACEBOOK_AD_PRODUCE_EVENT_ID
  );
}

export function buildFacebookAdLaunchEvents(today = new Date()): EditorialCalendarEvent[] {
  const dates = getFacebookAdScheduleDates(today);
  const scheduleNote = formatFacebookAdScheduleNote(dates);

  return [
    {
      id: FACEBOOK_AD_PRODUCE_EVENT_ID,
      type: "facebook_post",
      slotIndex: FACEBOOK_AD_SLOT_INDEX,
      milestone: "produce",
      title: "Prep Facebook ad — Hedra character, video, Meta draft",
      date: dates.produceDate,
      detail:
        "Character image → 5 Hedra scenes → stitch video → Traffic campaign draft in Ads Manager (see /admin/meta).",
      category: "content",
      actionTime: FACEBOOK_AD_PRODUCE_TIME,
    },
    {
      id: FACEBOOK_AD_LAUNCH_EVENT_ID,
      type: "facebook_post",
      slotIndex: FACEBOOK_AD_SLOT_INDEX,
      milestone: "launch",
      title: "Facebook ad launch — plan comparison traffic",
      date: dates.launchDate,
      detail: `Confirm Traffic ad live or scheduled — mobile disclaimer + link test — ${scheduleNote}`,
      category: "content",
      actionTime: FACEBOOK_AD_LAUNCH_TIME,
    },
  ];
}

export function withStandaloneEditorialEvents(
  events: EditorialCalendarEvent[],
  today: Date = new Date(),
): EditorialCalendarEvent[] {
  const ids = new Set(events.map((e) => e.id));
  const extra = buildFacebookAdLaunchEvents(today).filter((e) => !ids.has(e.id));
  if (extra.length === 0) return events;
  return [...events, ...extra].sort(
    (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title),
  );
}

export function facebookAdCopyValue(
  field: NonNullable<FacebookAdLaunchStep["copyField"]>,
  campaign = getFacebookAdCampaign(),
): string {
  if (field === "videoPrompt") return campaign.videoPrompt;
  if (field === "imageNote") return campaign.imageNote;
  if (field === "hedraScenes") return formatFacebookAdHedraPasteBlock(campaign.hedraScenes);
  if (field === "hedraCharacterImage") return campaign.hedraCharacterImagePrompt;
  if (field === "hedraNotes") return campaign.hedraNotes;
  if (field === "voiceoverScript") return campaign.voiceoverScript;
  if (field === "metaComplianceNotes") return campaign.metaComplianceNotes;
  if (field === "strategyNote") return campaign.strategyNote;
  return campaign.copy[field];
}

export function facebookAdStepCopyContent(
  step: Pick<FacebookAdLaunchStep, "copyField" | "hedraSceneId">,
  campaign = getFacebookAdCampaign(),
): string | null {
  if (step.hedraSceneId) {
    const scene = campaign.hedraScenes.find((s) => s.id === step.hedraSceneId);
    return scene ? formatHedraSceneBlock(scene) : null;
  }
  if (step.copyField) return facebookAdCopyValue(step.copyField, campaign);
  return null;
}

export function facebookAdStepCopyLabel(
  step: Pick<FacebookAdLaunchStep, "copyField" | "hedraSceneId">,
): string | null {
  if (step.hedraSceneId) return "Motion prompt + VO";
  if (step.copyField) return facebookAdCopyFieldLabel(step.copyField);
  return null;
}

export function facebookAdCopyFieldLabel(
  field: NonNullable<FacebookAdLaunchStep["copyField"]>,
): string {
  switch (field) {
    case "videoPrompt":
      return "Full Hedra brief (character + all scenes)";
    case "hedraScenes":
      return "All Hedra prompts (one block)";
    case "hedraCharacterImage":
      return "Character image prompt (Hedra — step 1)";
    case "hedraNotes":
      return "Hedra workflow";
    case "voiceoverScript":
      return "Full voiceover script";
    case "metaComplianceNotes":
      return "Meta & CMS compliance checklist";
    case "strategyNote":
      return "First campaign strategy (Traffic vs Likes)";
    case "imageNote":
      return "Image fallback (if video not ready)";
    case "primaryText":
      return "Primary text";
    case "headline":
      return "Headline";
    case "description":
      return "Description";
    case "callToAction":
      return "CTA button";
    case "destinationUrl":
      return "Destination URL";
    case "disclaimer":
      return "Disclaimer";
    default:
      return field;
  }
}

export function facebookAdAdminSearch(
  milestone?: EditorialMilestone,
  campaignId = FACEBOOK_AD_CAMPAIGN_ID,
): { campaign?: string; milestone?: EditorialMilestone } {
  return {
    campaign: campaignId,
    ...(milestone ? { milestone } : {}),
  };
}

export function facebookAdAdminHref(
  milestone?: EditorialMilestone,
  campaignId = FACEBOOK_AD_CAMPAIGN_ID,
): string {
  const params = new URLSearchParams();
  params.set("campaign", campaignId);
  if (milestone) params.set("milestone", milestone);
  return `/admin/meta?${params.toString()}`;
}

/** Full paste block for Meta Ads Manager primary text field. */
export function formatFacebookAdPasteBlock(campaign = getFacebookAdCampaign()): string {
  const { copy } = campaign;
  return [
    copy.primaryText,
    "",
    `Headline: ${copy.headline}`,
    `Description: ${copy.description}`,
    `CTA: ${copy.callToAction}`,
    `URL: ${copy.destinationUrl}`,
  ].join("\n");
}
