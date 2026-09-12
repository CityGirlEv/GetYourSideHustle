import { BRAND_BUBBLE_ON_CLASS } from './brandUi';
import {
  isoDateOffsetDays,
  sprintPlacementForIso,
  sprintWindowById,
  weekdayShortFromIso,
} from './sprintCalendar';
import {
  TEE_SALES_BIO_LINE,
  TEE_SALES_PINNED_POST,
  TEE_SALES_SHOP_URL,
  TEE_LIFESTYLE_MOCKUP_PATH,
  HOUSE_INTRO_LINE,
  HOUSE_WELCOME_HOOK,
} from './teeSalesPlaybook';
import {
  ASSIGNEE_LABELS,
  formatTaskCode,
  formatWorkDueDate,
  formatWorkDueDateShort,
  INITIAL_TASKS,
  SPRINT_OPTIONS,
  TASK_STATUS_LABELS,
  type SprintCategory,
  type TaskStatus,
  type WorkAssignee,
  type WorkPriority,
} from './workBoard';
import { matchesRolledOverStatusFilter, rolloverOutstandingContentFactoryItems } from './sprintRollover';

export const CONTENT_FACTORY_PATH = '/admin/factory';
export const ASSET_LIBRARY_PATH = '/admin/asset-library';
export const LOGO_CONCEPTS_PATH = '/admin/logo-concepts';
export const CONTENT_FACTORY_STATUS_KEY = 'myplan_cf_item_status_v1';
export const CONTENT_FACTORY_EDITS_KEY = 'myplan_cf_item_edits_v1';
export const CONTENT_FACTORY_EDIT_MAX_CHARS = 8000;

export const CF_EDIT_FIELDS = [
  'title',
  'copy',
  'imagePrompt',
  'videoPrompt',
  'visualPrompt',
  'assetHint',
  'visualSrc',
  'taskId',
  'assignee',
  'channel',
  'kind',
  'postTime',
  'dateIso',
] as const;
export type ContentFactoryEditField = (typeof CF_EDIT_FIELDS)[number];
export type ContentFactoryItemEdit = Partial<Record<ContentFactoryEditField, string>>;

export const CF_ASSIGNEE_OPTIONS: WorkAssignee[] = ['angela', 'evelyn', 'dev', 'qa', 'unassigned'];

export const CF_CHANNELS = ['facebook', 'youtube', 'tiktok', 'personal', 'website'] as const;
export type CfChannel = (typeof CF_CHANNELS)[number];

export const CF_KINDS = ['post', 'prep', 'gear', 'logo'] as const;
export type CfKind = (typeof CF_KINDS)[number];

export const CF_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type CfWeekday = (typeof CF_WEEKDAYS)[number];

export const CF_CHANNEL_LABELS: Record<CfChannel, string> = {
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  personal: 'Personal',
  website: 'Website',
};

export const CF_CHANNEL_TONES: Record<CfChannel, string> = {
  facebook: 'bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD]',
  youtube: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]',
  tiktok: 'bg-[#F3E8FF] text-[#6B21A8] border-[#D8B4FE]',
  personal: 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]',
  website: 'bg-[#CCFBF1] text-[#0F766E] border-[#5EEAD4]',
};

export const CF_KIND_LABELS: Record<CfKind, string> = {
  post: 'Post',
  prep: 'Asset prep',
  gear: 'Gear',
  logo: 'Logo Concepts',
};

/** Warm pop buttons — rust orange, never black. */
export const CF_POP_BTN =
  'min-h-[44px] px-3.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-[11px] font-black uppercase tracking-wide cursor-pointer shadow-[0_8px_18px_rgba(234,88,12,0.32)] border-2 border-[#FDBA74] inline-flex items-center justify-center gap-1.5';

export const CF_CHIP_ON = BRAND_BUBBLE_ON_CLASS;
export const CF_CHIP_OFF =
  'bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA] hover:bg-[#FFEDD5]';

export const CF_KIND_TONES: Record<CfKind, { bar: string; chip: string }> = {
  post: { bar: 'border-l-[6px] border-l-[#EA580C]', chip: 'bg-[#FFEDD5] text-[#C2410C]' },
  prep: { bar: 'border-l-[6px] border-l-[#0D9488]', chip: 'bg-[#CCFBF1] text-[#0F766E]' },
  gear: { bar: 'border-l-[6px] border-l-[#D97706]', chip: 'bg-[#FEF3C7] text-[#B45309]' },
  logo: { bar: 'border-l-[6px] border-l-[#BE185D]', chip: 'bg-[#FCE7F3] text-[#9D174D]' },
};

export const CF_ASSIGNEE_CHIPS: Partial<Record<WorkAssignee, string>> = {
  angela: 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]',
  evelyn: 'bg-[#D1FAE5] text-[#047857] border-[#6EE7B7]',
  dev: 'bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD]',
  qa: 'bg-[#F3E8FF] text-[#6B21A8] border-[#D8B4FE]',
  unassigned: 'bg-[#F5F5F4] text-[#57534E] border-[#D6D3D1]',
};

export const CF_DEFAULT_POST_TIME = '7:00 PM CT';

/** Original Sprint 0 Monday — first factory day (posts, prep, and logos). */
export const CF_POSTING_ANCHOR_ISO = '2026-08-24';
/** First live day after the pause — Friday Sep 4, 2026 (tomorrow from Thu Sep 3). */
export const CF_POSTING_RESUME_ISO = '2026-09-04';

export function cfPostingShiftDays(
  fromIso = CF_POSTING_ANCHOR_ISO,
  toIso = CF_POSTING_RESUME_ISO,
): number {
  const from = new Date(`${fromIso}T12:00:00`);
  const to = new Date(`${toIso}T12:00:00`);
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

/** Public posts always send people to Shop Gear on the brand site. */
export function ensureShopLinkInCopy(copy: string): string {
  if (copy.includes('nonnegotiation.com/gear')) return copy;
  return `${copy.trimEnd()}\n\n${TEE_SALES_SHOP_URL}`;
}

export interface ContentFactoryItem {
  id: string;
  sprint: SprintCategory;
  sprintId: 'sprint0' | 'sprint1' | 'sprint2' | 'sprint3' | 'sprint4';
  phase: 'Phase 1';
  weekday: CfWeekday;
  dateIso: string;
  postTime: string;
  channel: CfChannel;
  kind: CfKind;
  assignee: WorkAssignee;
  title: string;
  copy: string;
  visualPrompt: string;
  imagePrompt: string;
  videoPrompt?: string;
  assetHint: string;
  visualSrc?: string;
  taskId?: string;
  status: TaskStatus;
  rolledOver?: boolean;
  note?: string;
}

function weekdayDate(sprintId: ContentFactoryItem['sprintId'], offset: number): { dateIso: string; weekday: CfWeekday } {
  const window = sprintWindowById(sprintId);
  const startIso = window?.startIso ?? '2026-08-24';
  const [year, month, day] = startIso.split('-').map(Number);
  const date = new Date(year, month - 1, day + offset);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return {
    dateIso: `${y}-${m}-${d}`,
    weekday: CF_WEEKDAYS[((offset % 7) + 7) % 7] ?? 'Mon',
  };
}

function asCfWeekday(value: string): CfWeekday {
  return (CF_WEEKDAYS as readonly string[]).includes(value) ? (value as CfWeekday) : 'Mon';
}

function scheduleContentFactoryDate(
  seedIso: string,
  lockSchedule?: boolean,
): { dateIso: string; weekday: CfWeekday; sprint: SprintCategory; sprintId: ContentFactoryItem['sprintId']; day: number } {
  const dateIso = lockSchedule ? seedIso : isoDateOffsetDays(seedIso, cfPostingShiftDays());
  const placed = sprintPlacementForIso(dateIso);
  return {
    dateIso,
    weekday: asCfWeekday(weekdayShortFromIso(dateIso)),
    sprint: placed.label as SprintCategory,
    sprintId: placed.id,
    day: placed.day,
  };
}

const SELLING_VIDEO_CLOSE =
  'End holding the tee so the seal is readable. Super: Shop — nonnegotiation.com/gear. No faces of family, no names, no PII.';

function sellingVideoPrompt(action: string): string {
  return `15–20 seconds, talk to camera. ${action} ${SELLING_VIDEO_CLOSE} Vertical 9:16 for TikTok/Reels; 16:9 for YouTube. Lifestyle mockup /images/apparel_tee_lifestyle.jpg until the sample is on-body.`;
}

type CfPostMedia = { image: string; video?: string; imageOnly?: boolean };

/** Still + video directions per post. Video is the default sell; image-only is for reshares, FAQ, and story crops. */
export const CF_POST_MEDIA: Record<string, CfPostMedia> = {
  'cf-s0-welcome-facebook': {
    image: 'Angela wearing the white MY PLAN, NOT MY MOOD tee, seal readable. Overlay: A NonNegotiation brand.',
    video:
      '2 scenes, 15 seconds max each. Angela wears the white tee. Scene 1: to camera — “Your mood can ride. It cannot drive.” Beat. “Feel it. Follow the plan anyway.” Scene 2: point at the chest seal — “This is MY PLAN, NOT MY MOOD — a brand under NonNegotiation. Tees are live. nonnegotiation.com/gear.” Vertical 9:16 for Reels; 16:9 for Facebook. No family faces, no names, no PII.',
  },
  'cf-s0-welcome-tiktok': {
    image: 'Tight 9:16 of Angela in the white tee. Overlay: A NonNegotiation brand.',
    video:
      '1 scene, 15 seconds max. Angela wears the white tee. Hook in 2 seconds: “Your mood can ride. It cannot drive.” Hold the seal to camera. “MY PLAN, NOT MY MOOD — a brand under NonNegotiation. Shop: nonnegotiation.com/gear.” 9:16.',
  },
  'cf-s0-welcome-youtube': {
    image: '16:9: Angela in the white tee. Title card: NonNegotiation introduces MY PLAN, NOT MY MOOD.',
    video:
      '2 scenes, 15 seconds max each. Angela wears the white tee. Scene 1: “This is NonNegotiation. One of our brands: MY PLAN, NOT MY MOOD.” Scene 2: “Your mood can ride. It cannot drive.” Point to the seal. “Tees live — nonnegotiation.com/gear.” 16:9.',
  },
  'cf-s0-welcome-personal': {
    image: 'Angela in the white tee, personal still — no family faces. Overlay: A NonNegotiation brand.',
    video:
      '2 scenes, 15 seconds max each. Angela wears the white tee. Scene 1: “Hey — this is me. NonNegotiation is the house. MY PLAN, NOT MY MOOD is my brand under it.” Scene 2: point at the seal. “Your mood can ride. It cannot drive. Tees: nonnegotiation.com/gear.” No names, no PII.',
  },
  'cf-s0-welcome-website': {
    image: 'Home hero with kicker “A NonNegotiation brand” and Shop Gear visible.',
    video:
      '2 scenes, 15 seconds max each. Scene 1: screen-record Home — kicker A NonNegotiation brand, then MY PLAN, NOT MY MOOD. Scene 2: tap Shop Gear. Voiceover: “The house is NonNegotiation. This brand lives here. The pin goes to this shop.”',
  },
  'cf-s0-mon-angela': {
    image: 'Lifestyle tee mockup — white tee, denim jacket, MY PLAN / NOT MY MOOD seal. Cream wall. Overlay: Feel it. Follow the Plan anyway.',
    video: sellingVideoPrompt('Say the brand line once. Hold the lifestyle tee so the seal fills the frame. Pause. “The tees are live.”'),
  },
  'cf-s0-wed-angela': {
    image: 'Quote card: The mood gets a vote. The plan gets the final decision. Plus a tee still in the corner.',
    video: sellingVideoPrompt('Talk to camera: mood gets a vote, plan gets the decision. Cut to the tee. Smile, not a pitch.'),
  },
  'cf-s0-thu-angela': {
    image: 'Soft lifestyle still — no personal family faces, no names, no PII. Tee on a chair. Warm light.',
    video: sellingVideoPrompt('Tell the origin in 20 seconds without naming anyone: a temporary feeling almost decided a lasting outcome. End on the tee.'),
  },
  'cf-s0-fri-angela': {
    image: 'Tee photo or Shop Gear screenshot — not a coming-soon graphic. Overlay: The tees are live.',
    video: sellingVideoPrompt('Show Shop Gear on your phone, then the tee. “I will wear mine when the box lands. Until then, the shop is open.”'),
  },
  'cf-s0-sun-angela': {
    image: 'Story crop of Friday’s graphic with “The tees are live. nonnegotiation.com/gear”.',
    imageOnly: true,
  },
  'cf-s0-w2-mon-angela-pin': {
    image: 'Lifestyle tee mockup: /images/apparel_tee_lifestyle.jpg — this still is the pinned post.',
    video: sellingVideoPrompt('Hold the still, then the live shop URL on your phone. “This is the pin. This is the shop.”'),
  },
  'cf-s0-w2-tue-evelyn-support': {
    image: 'Share the lifestyle tee mockup. Same shop URL only. Overlay: Angela’s tees are live.',
    video: sellingVideoPrompt('Support post, not a second brand. “Angela’s tees are live.” Show the mockup. Point to the link.'),
  },
  'cf-s0-w2-wed-angela-live': {
    image: 'Hold the phone to Shop Gear or the lifestyle tee mockup. Overlay: Link is pinned.',
    video: sellingVideoPrompt('Go live energy even as a clip: pin the URL in the first two seconds of B-roll. “I am live. The tees are at the link.”'),
  },
  'cf-s0-w2-fri-angela-softsell': {
    image: 'Lifestyle tee mockup filling the frame. Caption will carry the shop URL.',
    video: sellingVideoPrompt('Soft-sell to the 6.2K: “Mood gets a vote. The plan gets the shirt.” Turn so they can read the seal. Ask them to use the link, not DMs.'),
  },
  'cf-s0-w2-sun-angela-walk': {
    image: 'Phone screenshot of Shop Gear. Story or post crop.',
    video: sellingVideoPrompt('Walk Home then Shop Gear on camera. Tap a tee. “If I pin a link on live, this is what you get.”'),
  },
  'cf-s1-fri-angela': {
    image: 'Blurred mockup flat-lay of first-drop styles — not the final pick if Angela wants surprise.',
    video: sellingVideoPrompt('Hands over the style cards. “The first drop is on the table.” Do not spoil the pick. Cut to Shop Gear.'),
  },
  'cf-s1-sat-angela': {
    image: 'On-body still wearing the tee. Seal readable. Warm indoor light.',
    video: sellingVideoPrompt('Wear the tee. Name the color and the line on the chest. Pin energy: “This is the one I wear. Yours is at the link.”'),
  },
  'cf-s1-sun-angela-clip': {
    image: 'On-body clip still. Caption is the Shop Gear URL.',
    video: sellingVideoPrompt('15–20 seconds wearing the tee. Post this exact cut to personal Facebook/Instagram, then share to NonNegotiation the same day.'),
  },
  'cf-s2-mon-angela': {
    image: 'Shop Gear screenshot or tee photo — not a countdown to a shop that is already open.',
    video: sellingVideoPrompt('Phone to Shop Gear. “Already live. I go on-body the day the sample arrives.”'),
  },
  'cf-s2-tue-angela': {
    image: 'One picked style card — tee, hoodie, and hat together.',
    video: sellingVideoPrompt('Flash the style card, then the tee. 9:16. “The plan you can wear.”'),
  },
  'cf-s2-wed-angela': {
    image: 'Picked hoodie mockup on a hanger, cream wall.',
    video: sellingVideoPrompt('Pick up the hoodie. “For the days the mood is heavy and the plan still has to move.”'),
  },
  'cf-s2-fri-angela': {
    image: 'Hero product + shop-link sticker on the still.',
    video: sellingVideoPrompt('Three beats: tee, hoodie, hat. One line each. End on the shop URL.'),
  },
  'cf-s2-sat-angela': {
    image: 'Picked hat mockup, close on the mark.',
    video: sellingVideoPrompt('Put the hat on. “Small reminder, big decision.” 9:16.'),
  },
  'cf-s2-sun-angela': {
    image: 'Story crop of Friday’s shop graphic. Overlay: Link is pinned. Plan over mood.',
    imageOnly: true,
  },
  'cf-s3-mon-angela': {
    image: 'Brand mark + About page still.',
    video: sellingVideoPrompt('Talking head: who this brand is for. Cut to About, then the tee.'),
  },
  'cf-s3-tue-angela': {
    image: 'Picked tee, lifestyle crop, overlay: You need the plan you already made.',
    video: sellingVideoPrompt('On-body or mockup. “You do not need a new mood.” Hold the chest seal to camera.'),
  },
  'cf-s3-wed-angela': {
    image: 'What Won Today receipt still + product inset.',
    video: sellingVideoPrompt('Show a blank receipt moment: “What won today? Not the mood.” Cut to the tee.'),
  },
  'cf-s3-thu-angela': {
    image: 'Simple FAQ card: orders, shipping, contact. No DM-your-card-number energy.',
    imageOnly: true,
  },
  'cf-s3-fri-angela': {
    image: 'Hoodie on hanger, cream wall.',
    video: sellingVideoPrompt('Put the hoodie on. “Still the move for the heavy days.”'),
  },
  'cf-s3-sun-angela': {
    image: '3-up product grid story crop. Overlay: No ads. Just the plan.',
    imageOnly: true,
  },
  'cf-s4-mon-angela': {
    image: 'Full drop lineup — tees, hoodie, hat.',
    video: sellingVideoPrompt('Walk the lineup. “First drop is live. This is not a mood. This is a plan you can wear.”'),
  },
  'cf-s4-tue-angela': {
    image: 'Angela’s Gear Selections picks in one frame.',
    video: sellingVideoPrompt('Hold each pick for two seconds. “These are the pieces I picked.”'),
  },
  'cf-s4-wed-angela': {
    image: 'Quote card + small product inset: Do not let a temporary mood determine a permanent outcome.',
    video: sellingVideoPrompt('Say the anthem to camera. End on the tee, not a hard sell.'),
  },
  'cf-s4-thu-angela': {
    image: 'Quiet product still. Overlay: No ads. No funnel tricks.',
    video: sellingVideoPrompt('Whisper-close on the seal. “If this brand is for you, you already know.”'),
  },
  'cf-s4-fri-angela': {
    image: 'Brand mark, no hard sell.',
    video: sellingVideoPrompt('Thank-you to camera. Hold the tee at the end. Soft, not a pitch.'),
  },
  'cf-s4-sun-angela': {
    image: 'Drop lineup story crop. Overlay: Still the plan.',
    imageOnly: true,
  },
};

export function cfPostIsImageOnly(item: Pick<ContentFactoryItem, 'id' | 'videoPrompt'>): boolean {
  return !String(item.videoPrompt ?? '').trim();
}

function mediaForItem(
  id: string,
  visualPrompt: string,
  kind: CfKind,
  overrides?: { imagePrompt?: string; videoPrompt?: string; imageOnly?: boolean },
): { imagePrompt: string; videoPrompt?: string } {
  const catalog = CF_POST_MEDIA[id];
  const imagePrompt = overrides?.imagePrompt ?? catalog?.image ?? visualPrompt;
  if (kind !== 'post' || overrides?.imageOnly || catalog?.imageOnly) {
    return { imagePrompt };
  }
  const videoPrompt = overrides?.videoPrompt ?? catalog?.video ?? sellingVideoPrompt(visualPrompt);
  return { imagePrompt, videoPrompt };
}

function item(
  partial: Omit<ContentFactoryItem, 'phase' | 'dateIso' | 'weekday' | 'status' | 'postTime' | 'imagePrompt' | 'videoPrompt' | 'sprint' | 'sprintId'> & {
    day: number;
    sprint: SprintCategory;
    sprintId: ContentFactoryItem['sprintId'];
    postTime?: string;
    status?: TaskStatus;
    lockSchedule?: boolean;
    imageOnly?: boolean;
    imagePrompt?: string;
    videoPrompt?: string;
  },
): ContentFactoryItem {
  const seed = weekdayDate(partial.sprintId, partial.day);
  const when = scheduleContentFactoryDate(seed.dateIso, partial.lockSchedule);
  const media = mediaForItem(partial.id, partial.visualPrompt, partial.kind, {
    imagePrompt: partial.imagePrompt,
    videoPrompt: partial.videoPrompt,
    imageOnly: partial.imageOnly,
  });
  return {
    id: partial.id,
    sprint: when.sprint,
    sprintId: when.sprintId,
    phase: 'Phase 1',
    weekday: when.weekday,
    dateIso: when.dateIso,
    postTime: partial.postTime ?? CF_DEFAULT_POST_TIME,
    channel: partial.channel,
    kind: partial.kind,
    assignee: partial.assignee,
    title: partial.title,
    copy: partial.kind === 'post' ? ensureShopLinkInCopy(partial.copy) : partial.copy,
    visualPrompt: partial.visualPrompt,
    imagePrompt: media.imagePrompt,
    videoPrompt: media.videoPrompt,
    assetHint: partial.assetHint,
    visualSrc:
      partial.visualSrc !== undefined
        ? partial.visualSrc
        : partial.kind === 'post'
          ? TEE_LIFESTYLE_MOCKUP_PATH
          : undefined,
    taskId: partial.taskId,
    status: partial.status ?? 'not_started',
  };
}

/** Phase 1 organic calendar — Angela posts; Evelyn preps assets and Gear Selections. Shop is live from Sprint 0. No paid ads. */
export const PHASE_1_CONTENT_FACTORY: ContentFactoryItem[] = [
  item({
    id: 'cf-s0-welcome-facebook',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 11,
    lockSchedule: true,
    channel: 'facebook',
    kind: 'post',
    assignee: 'angela',
    title: 'Welcome — NonNegotiation Facebook',
    copy: `Welcome to NonNegotiation.\n\n${HOUSE_INTRO_LINE}\n\n${HOUSE_WELCOME_HOOK} Feel it. Follow the plan anyway.\n\nThe longer story lives here. Short clips on TikTok. Teaching on YouTube. If you want the reminder you can wear: https://nonnegotiation.com/gear`,
    visualPrompt: 'Angela in the white tee. Overlay: A NonNegotiation brand.',
    assetHint: TEE_LIFESTYLE_MOCKUP_PATH,
    taskId: 't-74',
  }),
  item({
    id: 'cf-s0-welcome-tiktok',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 11,
    lockSchedule: true,
    postTime: '7:15 PM CT',
    channel: 'tiktok',
    kind: 'post',
    assignee: 'angela',
    title: 'Welcome — TikTok',
    copy: `NonNegotiation. One of our brands: MY PLAN, NOT MY MOOD.\n\n${HOUSE_WELCOME_HOOK}\n\nFeel it. Follow the plan anyway.\n\nTees: https://nonnegotiation.com/gear`,
    visualPrompt: 'Angela in the white tee, 9:16. Overlay: A NonNegotiation brand.',
    assetHint: TEE_LIFESTYLE_MOCKUP_PATH,
    taskId: 't-74',
  }),
  item({
    id: 'cf-s0-welcome-youtube',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 11,
    lockSchedule: true,
    postTime: '7:30 PM CT',
    channel: 'youtube',
    kind: 'post',
    assignee: 'angela',
    title: 'Welcome — YouTube',
    copy: `This is NonNegotiation — and this channel is introducing MY PLAN, NOT MY MOOD, one of the brands under the house.\n\n${HOUSE_WELCOME_HOOK} This is the teaching: the days a mood gets loud and the plan still has to win.\n\nFacebook is the longer story. TikTok is the short clip. The tees are live: https://nonnegotiation.com/gear`,
    visualPrompt: 'Angela in the white tee. Title: NonNegotiation introduces MY PLAN, NOT MY MOOD.',
    assetHint: TEE_LIFESTYLE_MOCKUP_PATH,
    taskId: 't-74',
  }),
  item({
    id: 'cf-s0-welcome-personal',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 11,
    lockSchedule: true,
    postTime: '8:00 PM CT',
    channel: 'personal',
    kind: 'post',
    assignee: 'angela',
    title: 'Welcome — personal pages',
    copy: `Hey — this is me.\n\n${HOUSE_INTRO_LINE} I started it after watching a feeling try to rewrite a future.\n\n${HOUSE_WELCOME_HOOK} If you know me, you already know the line. The tees are live if you want one on your body: https://nonnegotiation.com/gear`,
    visualPrompt: 'Angela in the white tee. Personal still — no family faces.',
    assetHint: TEE_LIFESTYLE_MOCKUP_PATH,
    taskId: 't-74',
  }),
  item({
    id: 'cf-s0-welcome-website',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 11,
    lockSchedule: true,
    postTime: '11:00 AM CT',
    channel: 'website',
    kind: 'post',
    assignee: 'evelyn',
    title: 'Welcome — Home intro on the website',
    copy: `${HOUSE_INTRO_LINE}\n\nHome kicker: A NonNegotiation brand. Then MY PLAN, NOT MY MOOD. Feel it. Follow the plan anyway. The tees are live.\n\nDo not send social traffic here until this intro is on Home. Shop CTA stays https://nonnegotiation.com/gear`,
    visualPrompt: 'Home hero with A NonNegotiation brand kicker and Shop Gear.',
    assetHint: 'Home + /gear',
    visualSrc: '',
    taskId: 't-74',
  }),
  item({
    id: 'cf-s0-mon-angela',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 1,
    channel: 'facebook',
    kind: 'post',
    assignee: 'angela',
    title: 'Brand line — feel it, follow the plan',
    copy: 'Feel it. Follow the Plan anyway.\n\nA mood is a visitor. The plan is the house.\n\nThe tees are live: https://nonnegotiation.com/gear',
    visualPrompt: 'Lifestyle tee mockup — white tee, denim jacket, MY PLAN / NOT MY MOOD seal. /images/apparel_tee_lifestyle.jpg',
    assetHint: TEE_LIFESTYLE_MOCKUP_PATH,
    taskId: 't-63',
  }),
  item({
    id: 'cf-s0-tue-evelyn',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 1,
    channel: 'youtube',
    kind: 'prep',
    assignee: 'evelyn',
    postTime: '10:00 AM CT',
    title: 'Load quote graphics and the lifestyle tee mockup into Asset Library',
    copy: 'Upload 3 quote cards: Feel it. Follow the Plan anyway. / The mood gets a vote. The plan gets the decision. / Do not let a temporary mood determine a permanent outcome. Also add the lifestyle tee still from /images/apparel_tee_lifestyle.jpg so Angela can post it.',
    visualPrompt: 'Quote cards plus the on-body white-tee lifestyle mockup.',
    assetHint: TEE_LIFESTYLE_MOCKUP_PATH,
    taskId: 't-32',
  }),
  item({
    id: 'cf-s0-tue-evelyn-logos',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 1,
    channel: 'facebook',
    kind: 'logo',
    assignee: 'evelyn',
    postTime: '11:00 AM CT',
    title: 'Upload logo concepts Evelyn made for Angela',
    copy: 'Put seal, wordmark, lockup, and colorway files in Logo Concepts so Angela can pick the mark. Complimentary — $1,200 retail if sold, $0 on the $10K plan.',
    visualPrompt: 'Vector or high-res marks on cream. JPEG, PNG, WebP, GIF, or SVG.',
    assetHint: 'Content Factory → Logo Concepts',
    taskId: 't-41',
  }),
  item({
    id: 'cf-s0-thu-angela-logos',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 3,
    channel: 'facebook',
    kind: 'logo',
    assignee: 'angela',
    postTime: '2:00 PM CT',
    title: 'Pick the chosen logo mark',
    copy: 'Open Logo Concepts and tap Use this mark on the seal, wordmark, lockup, or colorway that becomes the brand.',
    visualPrompt: 'Side-by-side concept review.',
    assetHint: 'Content Factory → Logo Concepts',
    taskId: 't-42',
  }),
  item({
    id: 'cf-s0-wed-angela',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 2,
    channel: 'personal',
    kind: 'post',
    assignee: 'angela',
    title: 'Mood vs plan — the vote',
    copy: 'The mood gets a vote. The plan gets the final decision.\n\nI built this brand because I have watched a feeling try to rewrite a future. We feel it. Then we follow the plan.\n\nThe tees are live: https://nonnegotiation.com/gear',
    visualPrompt: 'Quote card from Asset Library plus a tee still.',
    assetHint: 'Asset Library → Quote',
    taskId: 't-66',
  }),
  item({
    id: 'cf-s0-thu-angela',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 3,
    channel: 'personal',
    kind: 'post',
    assignee: 'angela',
    title: 'Where the idea came from',
    copy: 'This brand started in a family moment. Watching someone I love almost let a temporary feeling decide a lasting outcome.\n\nThat is the whole teaching: feel it. Follow the plan anyway.\n\nMY PLAN, NOT MY MOOD.\n\nhttps://nonnegotiation.com/gear',
    visualPrompt: 'Soft lifestyle still — no personal family faces, no names, no PII.',
    assetHint: 'Asset Library → Brand',
    visualSrc: '',
    taskId: 't-66',
  }),
  item({
    id: 'cf-s0-fri-angela',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 4,
    channel: 'facebook',
    kind: 'post',
    assignee: 'angela',
    title: 'Building in public — tees are live',
    copy: 'The tees are live. I will wear mine on camera when the box lands. Until then, the shop is open.\n\nhttps://nonnegotiation.com/gear\n\nOrganic only. No ads.',
    visualPrompt: 'Tee photo or Shop Gear screenshot — not a coming-soon graphic.',
    assetHint: 'Asset Library → Brand',
    taskId: 't-63',
  }),
  item({
    id: 'cf-s0-sat-evelyn',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 5,
    channel: 'tiktok',
    kind: 'prep',
    assignee: 'evelyn',
    postTime: '11:00 AM CT',
    title: 'Caption bank for Sprint 1',
    copy: 'Write 8 short captions Angela can paste: 3 brand, 3 tee-for-sale, 2 shop-now with https://nonnegotiation.com/gear. Save as Caption assets.',
    visualPrompt: 'Text-only caption cards.',
    assetHint: 'Asset Library → Caption',
    taskId: 't-32',
  }),
  item({
    id: 'cf-s0-sun-angela',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 6,
    channel: 'tiktok',
    kind: 'post',
    assignee: 'angela',
    postTime: '5:00 PM CT',
    title: 'Weekend check-in reshare',
    copy: 'Reshare Friday’s post to Stories with: “The tees are live. nonnegotiation.com/gear”',
    visualPrompt: 'Story crop of Friday graphic.',
    assetHint: 'Asset Library → Quote',
    taskId: 't-63',
  }),

  item({
    id: 'cf-s0-w2-mon-angela-pin',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 7,
    channel: 'personal',
    kind: 'post',
    assignee: 'angela',
    title: 'Pin the shop post on personal Facebook',
    copy: TEE_SALES_PINNED_POST,
    visualPrompt: 'Lifestyle tee mockup: /images/apparel_tee_lifestyle.jpg — pin this post.',
    assetHint: TEE_LIFESTYLE_MOCKUP_PATH,
    taskId: 't-66',
  }),
  item({
    id: 'cf-s0-w2-tue-evelyn-support',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 8,
    channel: 'personal',
    kind: 'post',
    assignee: 'evelyn',
    postTime: '12:00 PM CT',
    title: 'Evelyn personal support post',
    copy: 'Angela’s tees are live. If you have been waiting for a reminder you can wear:\n\nhttps://nonnegotiation.com/gear',
    visualPrompt: 'Share the lifestyle tee mockup or Angela’s shop post. Same URL only.',
    assetHint: TEE_LIFESTYLE_MOCKUP_PATH,
    taskId: 't-67',
  }),
  item({
    id: 'cf-s0-w2-wed-angela-live',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 9,
    channel: 'personal',
    kind: 'post',
    assignee: 'angela',
    title: 'Go live — pin Shop Gear (photos are enough until the box arrives)',
    copy: 'Feel it. Follow the plan anyway.\n\nI am live. The tees are at nonnegotiation.com/gear — that link is pinned in the comments.\n\nI will wear mine on camera the day the sample lands.',
    visualPrompt: 'Hold the phone to Shop Gear or the lifestyle tee mockup. Pin the URL in the first two minutes.',
    assetHint: TEE_LIFESTYLE_MOCKUP_PATH,
    taskId: 't-68',
  }),
  item({
    id: 'cf-s0-w2-thu-angela-bios',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 10,
    channel: 'facebook',
    kind: 'prep',
    assignee: 'angela',
    postTime: '11:00 AM CT',
    title: 'Put Shop Gear on NonNegotiation Facebook, Instagram, TikTok, and YouTube bios',
    copy: `${TEE_SALES_BIO_LINE}\n\nPin the drop — not a coming-soon teaser. Lives on these pages use the same talk track as personal live.`,
    visualPrompt: 'Bio field screenshot after the shop URL is in place.',
    assetHint: 'Shop Gear',
    taskId: 't-65',
  }),
  item({
    id: 'cf-s0-w2-fri-angela-softsell',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 11,
    channel: 'facebook',
    kind: 'post',
    assignee: 'angela',
    title: 'Soft-sell with tee photos — 6.2K Facebook',
    copy: 'The tees are live. Mood gets a vote. The plan gets the shirt.\n\nSizes and checkout: https://nonnegotiation.com/gear\n\nOrganic only — no ads.',
    visualPrompt: 'Lifestyle tee mockup: /images/apparel_tee_lifestyle.jpg. Caption has the shop URL.',
    assetHint: TEE_LIFESTYLE_MOCKUP_PATH,
    taskId: 't-63',
  }),
  item({
    id: 'cf-s0-w2-sat-evelyn-site',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 12,
    channel: 'facebook',
    kind: 'prep',
    assignee: 'evelyn',
    postTime: '11:00 AM CT',
    title: 'Present the drop on Home and Shop Gear',
    copy: 'Home Shop Gear button goes to /gear. Copy says tees are live — not coming soon. Strip leftover mock SKUs. Live viewers land here from Angela’s pin.',
    visualPrompt: 'Production Home + /gear screenshots.',
    assetHint: 'nonnegotiation.com/gear',
    taskId: 't-71',
  }),
  item({
    id: 'cf-s0-w2-sun-angela-walk',
    sprint: 'Sprint 0',
    sprintId: 'sprint0',
    day: 13,
    channel: 'personal',
    kind: 'post',
    assignee: 'angela',
    postTime: '5:00 PM CT',
    title: 'Walk Home and Shop Gear — then send people there',
    copy: 'I walked the shop the way you will. If I pin a link on live, this is what you get.\n\nhttps://nonnegotiation.com/gear',
    visualPrompt: 'Phone screenshot of Shop Gear. Story or post.',
    assetHint: 'Shop Gear',
    taskId: 't-72',
  }),

  item({
    id: 'cf-s1-mon-evelyn-tees',
    sprint: 'Sprint 1',
    sprintId: 'sprint1',
    day: 0,
    channel: 'facebook',
    kind: 'gear',
    assignee: 'evelyn',
    postTime: '10:00 AM CT',
    title: 'Upload style cards to Gear',
    copy: 'Put style cards in Gear — names like E-ShirtLebberingBeige and TShirtTieDieRainbowSpiral. Each card already has the tee, hoodie, and hat.',
    visualPrompt: 'Style cards with tee, hoodie, and hat on the same mockup.',
    assetHint: 'Content Factory → Gear Selections',
    taskId: 't-27',
  }),
  item({
    id: 'cf-s1-tue-angela-tees',
    sprint: 'Sprint 1',
    sprintId: 'sprint1',
    day: 1,
    channel: 'facebook',
    kind: 'gear',
    assignee: 'angela',
    postTime: '12:00 PM CT',
    title: 'Pick first-drop styles',
    copy: 'Open Gear Selections and pick the first-drop styles. Cards are grouped by style, not by hat / hoodie / tee.',
    visualPrompt: 'Picked style cards highlighted in Gear Selections.',
    assetHint: 'Content Factory → Gear Selections',
    taskId: 't-7',
  }),
  item({
    id: 'cf-s1-wed-evelyn-hoodie-hat',
    sprint: 'Sprint 1',
    sprintId: 'sprint1',
    day: 2,
    channel: 'facebook',
    kind: 'gear',
    assignee: 'evelyn',
    postTime: '10:00 AM CT',
    title: 'Add remaining style cards',
    copy: 'Add any leftover style cards (same designs already include hoodie and hat). Keep grouping by style name.',
    visualPrompt: 'More style cards with tee, hoodie, and hat together.',
    assetHint: 'Content Factory → Gear Selections',
    taskId: 't-27',
  }),
  item({
    id: 'cf-s1-thu-angela-hoodie-hat',
    sprint: 'Sprint 1',
    sprintId: 'sprint1',
    day: 3,
    channel: 'facebook',
    kind: 'gear',
    assignee: 'angela',
    postTime: '12:00 PM CT',
    title: 'Finish style picks',
    copy: 'Finish the first drop from the style list. Angela can still pick up to 3 T-Shirts, 1 Hoodie, and 1 Hat from those cards.',
    visualPrompt: 'Full style pick set in Gear Selections.',
    assetHint: 'Content Factory → Gear Selections',
    taskId: 't-7',
  }),
  item({
    id: 'cf-s1-fri-angela',
    sprint: 'Sprint 1',
    sprintId: 'sprint1',
    day: 4,
    channel: 'youtube',
    kind: 'post',
    assignee: 'angela',
    title: 'First drop is being chosen',
    copy: 'The first drop is on the table by style — E-ShirtLebberingBeige, TShirtTieDieRainbowSpiral, and the rest.\n\nEach card already has the tee, hoodie, and hat. Shop is live while I finish picks: https://nonnegotiation.com/gear',
    visualPrompt: 'Blurred mockup flat-lay, not the final pick if Angela wants surprise.',
    assetHint: 'Asset Library → Mockup',
    taskId: 't-51',
  }),
  item({
    id: 'cf-s1-sat-angela',
    sprint: 'Sprint 1',
    sprintId: 'sprint1',
    day: 5,
    channel: 'youtube',
    kind: 'post',
    assignee: 'angela',
    title: 'First live wearing the tee',
    copy: 'Wear the tee. Name the color and the line on the chest. Pin https://nonnegotiation.com/gear in the first two minutes.\n\nThis is the one I wear. Yours is at the link.',
    visualPrompt: 'On-body live still. Pin the Shop Gear URL in comments.',
    assetHint: 'Shop Gear',
    taskId: 't-64',
  }),
  item({
    id: 'cf-s1-sun-evelyn',
    sprint: 'Sprint 1',
    sprintId: 'sprint1',
    day: 6,
    channel: 'facebook',
    kind: 'prep',
    assignee: 'evelyn',
    postTime: '11:00 AM CT',
    title: 'Copy Angela’s picks into Asset Library',
    copy: 'Export the picked style cards into Asset Library so Sprint 2 posts have the real drop, still grouped by style name.',
    visualPrompt: 'Clean crops of Angela’s picked style cards.',
    assetHint: 'Asset Library → Styles',
    taskId: 't-32',
  }),
  item({
    id: 'cf-s1-sun-angela-clip',
    sprint: 'Sprint 1',
    sprintId: 'sprint1',
    day: 6,
    channel: 'personal',
    kind: 'post',
    assignee: 'angela',
    postTime: '5:00 PM CT',
    title: 'On-body clip to personal pages and NonNegotiation',
    copy: '15–20 seconds wearing the tee. Post to personal Facebook and Instagram, then share to NonNegotiation the same day.\n\nhttps://nonnegotiation.com/gear',
    visualPrompt: 'On-body clip still. Caption is the Shop Gear URL.',
    assetHint: 'Shop Gear',
    taskId: 't-70',
  }),

  item({
    id: 'cf-s2-mon-angela',
    sprint: 'Sprint 2',
    sprintId: 'sprint2',
    day: 0,
    channel: 'facebook',
    kind: 'post',
    assignee: 'angela',
    title: 'Shop is live — keep selling while samples ship',
    copy: 'Shop Gear is already live. I will drop the on-body live the day my sample arrives.\n\nUntil then: https://nonnegotiation.com/gear',
    visualPrompt: 'Shop Gear screenshot or tee photo — not a countdown to a shop that is already open.',
    assetHint: 'Asset Library → Quote',
    taskId: 't-52',
  }),
  item({
    id: 'cf-s2-tue-angela',
    sprint: 'Sprint 2',
    sprintId: 'sprint2',
    day: 1,
    channel: 'tiktok',
    kind: 'post',
    assignee: 'angela',
    title: 'Style tease from Gear Selections',
    copy: 'One of the first-drop styles — tee, hoodie, and hat on the same card. The plan you can wear.\n\nhttps://nonnegotiation.com/gear',
    visualPrompt: 'Picked style card from Gear Selections / Asset Library.',
    assetHint: 'Asset Library → Styles',
    taskId: 't-52',
  }),
  item({
    id: 'cf-s2-wed-angela',
    sprint: 'Sprint 2',
    sprintId: 'sprint2',
    day: 2,
    channel: 'youtube',
    kind: 'post',
    assignee: 'angela',
    title: 'Hoodie tease',
    copy: 'The hoodie is for the days the mood is heavy and the plan still has to move. First drop.\n\nhttps://nonnegotiation.com/gear',
    visualPrompt: 'Picked hoodie mockup.',
    assetHint: 'Asset Library → Product',
    taskId: 't-52',
  }),
  item({
    id: 'cf-s2-thu-evelyn',
    sprint: 'Sprint 2',
    sprintId: 'sprint2',
    day: 3,
    channel: 'facebook',
    kind: 'prep',
    assignee: 'evelyn',
    postTime: '4:00 PM CT',
    title: 'Keep the SHOP LINK caption on nonnegotiation.com/gear',
    copy: 'Shop is already live. Put https://nonnegotiation.com/gear in Asset Library → Caption as “SHOP LINK” so every post pastes the same URL. Never snatchvault.com.',
    visualPrompt: 'Text asset with the live shop URL only — no extra tracking.',
    assetHint: 'Asset Library → Caption',
    taskId: 't-69',
  }),
  item({
    id: 'cf-s2-fri-angela',
    sprint: 'Sprint 2',
    sprintId: 'sprint2',
    day: 4,
    channel: 'facebook',
    kind: 'post',
    assignee: 'angela',
    title: 'Keep selling — tees, hoodie, hat',
    copy: 'Shop is live.\n\nFirst drop: tees, hoodie, hat. Organic only — if you want one, the link is here.\n\nhttps://nonnegotiation.com/gear\n\nFeel it. Follow the plan anyway.',
    visualPrompt: 'Hero product + shop link sticker.',
    assetHint: 'Asset Library → Product + Caption (SHOP LINK)',
    taskId: 't-52',
  }),
  item({
    id: 'cf-s2-sat-angela',
    sprint: 'Sprint 2',
    sprintId: 'sprint2',
    day: 5,
    channel: 'tiktok',
    kind: 'post',
    assignee: 'angela',
    title: 'Hat drop',
    copy: 'The hat. Small reminder, big decision. Shop Gear is open.\n\nhttps://nonnegotiation.com/gear',
    visualPrompt: 'Picked hat mockup.',
    assetHint: 'Asset Library → Product',
    taskId: 't-52',
  }),
  item({
    id: 'cf-s2-sun-angela',
    sprint: 'Sprint 2',
    sprintId: 'sprint2',
    day: 6,
    channel: 'tiktok',
    kind: 'post',
    assignee: 'angela',
    postTime: '5:00 PM CT',
    title: 'Reshare the live-shop post',
    copy: 'Reshare Friday’s shop post. Caption: “Link is pinned. Plan over mood. https://nonnegotiation.com/gear”',
    visualPrompt: 'Story crop of Friday graphic.',
    assetHint: 'Asset Library → Product',
    taskId: 't-52',
  }),

  item({
    id: 'cf-s3-mon-angela',
    sprint: 'Sprint 3',
    sprintId: 'sprint3',
    day: 0,
    channel: 'youtube',
    kind: 'post',
    assignee: 'angela',
    title: 'About the brand',
    copy: `If you are new here: NonNegotiation.com is the house. MY PLAN, NOT MY MOOD is one of the brands under it — a lifestyle and accountability line. We make gear you can wear on the days the feeling is loud.\n\nAbout page is up. Shop Gear is open.`,
    visualPrompt: 'Brand mark + About page still.',
    assetHint: 'Asset Library → Brand',
    taskId: 't-12',
  }),
  item({
    id: 'cf-s3-tue-angela',
    sprint: 'Sprint 3',
    sprintId: 'sprint3',
    day: 1,
    channel: 'tiktok',
    kind: 'post',
    assignee: 'angela',
    title: 'Wear the reminder',
    copy: 'You do not need a new mood. You need the plan you already made.\n\nThat is the tee.',
    visualPrompt: 'Picked tee, lifestyle crop.',
    assetHint: 'Asset Library → Product',
    taskId: 't-53',
  }),
  item({
    id: 'cf-s3-wed-angela',
    sprint: 'Sprint 3',
    sprintId: 'sprint3',
    day: 2,
    channel: 'personal',
    kind: 'post',
    assignee: 'angela',
    title: 'What won today + shop',
    copy: 'What won today? Not the mood. The follow-through.\n\nIf you want the reminder on your body, Shop Gear is open.',
    visualPrompt: 'Receipt / “what won today” still + product.',
    assetHint: 'Asset Library → Quote',
    taskId: 't-53',
  }),
  item({
    id: 'cf-s3-thu-angela',
    sprint: 'Sprint 3',
    sprintId: 'sprint3',
    day: 3,
    channel: 'facebook',
    kind: 'post',
    assignee: 'angela',
    title: 'FAQ — orders and contact',
    copy: 'Questions on orders, shipping, or the brand? Contact and FAQ are on the site. Order email comes from the shop. I post here. I do not DM your card number. Ever.',
    visualPrompt: 'Simple FAQ card.',
    assetHint: 'Asset Library → Caption',
    taskId: 't-16',
  }),
  item({
    id: 'cf-s3-fri-angela',
    sprint: 'Sprint 3',
    sprintId: 'sprint3',
    day: 4,
    channel: 'facebook',
    kind: 'post',
    assignee: 'angela',
    title: 'Hoodie still',
    copy: 'The hoodie is still the move for the heavy days. First drop. Shop Gear.',
    visualPrompt: 'Hoodie on hanger, cream wall.',
    assetHint: 'Asset Library → Product',
    taskId: 't-53',
  }),
  item({
    id: 'cf-s3-sat-evelyn',
    sprint: 'Sprint 3',
    sprintId: 'sprint3',
    day: 5,
    channel: 'youtube',
    kind: 'prep',
    assignee: 'evelyn',
    postTime: '11:00 AM CT',
    title: 'Weekend recap graphic',
    copy: 'One graphic: three products + shop link. Angela posts Sunday Stories.',
    visualPrompt: '3-up product grid.',
    assetHint: 'Asset Library → Product',
    taskId: 't-32',
  }),
  item({
    id: 'cf-s3-sun-angela',
    sprint: 'Sprint 3',
    sprintId: 'sprint3',
    day: 6,
    channel: 'tiktok',
    kind: 'post',
    assignee: 'angela',
    postTime: '5:00 PM CT',
    title: 'Soft CTA — no ads',
    copy: 'Story: 3-up grid + “No ads. Just the plan. Link in the shop post.”',
    visualPrompt: 'Weekend recap graphic.',
    assetHint: 'Asset Library → Product',
    taskId: 't-53',
  }),

  item({
    id: 'cf-s4-mon-angela',
    sprint: 'Sprint 4',
    sprintId: 'sprint4',
    day: 0,
    channel: 'facebook',
    kind: 'post',
    assignee: 'angela',
    title: 'Drop announcement',
    copy: 'First drop is live. Tees. Hoodie. Hat.\n\nThis is not a mood. This is a plan you can wear.\n\nShop Gear — organic only, no paid ads.',
    visualPrompt: 'Full drop lineup.',
    assetHint: 'Asset Library → Product',
    taskId: 't-23',
  }),
  item({
    id: 'cf-s4-tue-angela',
    sprint: 'Sprint 4',
    sprintId: 'sprint4',
    day: 1,
    channel: 'youtube',
    kind: 'post',
    assignee: 'angela',
    title: 'Pick showcase',
    copy: 'These are the pieces I picked. If one of them is yours, the shop is open.',
    visualPrompt: 'Angela’s Gear Selections picks, one frame.',
    assetHint: 'Content Factory → Gear Selections',
    taskId: 't-7',
  }),
  item({
    id: 'cf-s4-wed-angela',
    sprint: 'Sprint 4',
    sprintId: 'sprint4',
    day: 2,
    channel: 'personal',
    kind: 'post',
    assignee: 'angela',
    title: 'Anthem post',
    copy: 'Do not let a temporary mood determine a permanent outcome.\n\nFeel it. Follow the Plan anyway.\n\nMY PLAN, NOT MY MOOD.',
    visualPrompt: 'Quote card + small product inset.',
    assetHint: 'Asset Library → Quote',
    taskId: 't-54',
  }),
  item({
    id: 'cf-s4-thu-angela',
    sprint: 'Sprint 4',
    sprintId: 'sprint4',
    day: 3,
    channel: 'tiktok',
    kind: 'post',
    assignee: 'angela',
    title: 'Launch week — still organic',
    copy: 'No ads. No funnel tricks. If this brand is for you, you already know. Shop Gear is open.',
    visualPrompt: 'Quiet product still.',
    assetHint: 'Asset Library → Product',
    taskId: 't-54',
  }),
  item({
    id: 'cf-s4-fri-angela',
    sprint: 'Sprint 4',
    sprintId: 'sprint4',
    day: 4,
    channel: 'personal',
    kind: 'post',
    assignee: 'angela',
    title: 'Thank you — keep the plan',
    copy: 'Thank you for walking with this from a line on a page to a shirt on a body.\n\nThe plan is still the plan. Shop stays open.',
    visualPrompt: 'Brand mark, no hard sell.',
    assetHint: 'Asset Library → Brand',
    taskId: 't-54',
  }),
  item({
    id: 'cf-s4-sat-evelyn',
    sprint: 'Sprint 4',
    sprintId: 'sprint4',
    day: 5,
    channel: 'youtube',
    kind: 'prep',
    assignee: 'evelyn',
    postTime: '11:00 AM CT',
    title: 'Trailing-90-day caption pack',
    copy: 'Save 12 captions Angela can rotate after launch (same organic cadence, no paid ads). Asset Library → Caption.',
    visualPrompt: 'Text-only caption list.',
    assetHint: 'Asset Library → Caption',
    taskId: 't-32',
  }),
  item({
    id: 'cf-s4-sun-angela',
    sprint: 'Sprint 4',
    sprintId: 'sprint4',
    day: 6,
    channel: 'tiktok',
    kind: 'post',
    assignee: 'angela',
    postTime: '5:00 PM CT',
    title: 'Sprint close reshare',
    copy: 'Reshare Monday’s drop announcement. Caption: “Still the plan.”',
    visualPrompt: 'Drop lineup story crop.',
    assetHint: 'Asset Library → Product',
    taskId: 't-54',
  }),
];

/** Display code for a Content Factory row (`CF-1` …). */
export function formatContentFactoryCode(
  id: string,
  items: Array<{ id: string }> = PHASE_1_CONTENT_FACTORY,
): string {
  const idx = items.findIndex((row) => row.id === id);
  return idx >= 0 ? `CF-${idx + 1}` : `CF-${String(id || '').slice(0, 10).toUpperCase()}`;
}

export function overlayContentFactoryStatuses(
  items: ContentFactoryItem[] = PHASE_1_CONTENT_FACTORY,
  statusById: Record<string, TaskStatus> = {},
): ContentFactoryItem[] {
  return rolloverOutstandingContentFactoryItems(
    items.map((row) => {
      const next = statusById[row.id];
      return next && next !== row.status ? { ...row, status: next } : row;
    }),
  );
}

export function parseContentFactoryStatuses(raw: unknown): Record<string, TaskStatus> {
  if (!raw || typeof raw !== 'object') return {};
  const allowed: TaskStatus[] = ['not_started', 'in_progress', 'done', 'blocked'];
  const next: Record<string, TaskStatus> = {};
  for (const [id, status] of Object.entries(raw as Record<string, unknown>)) {
    if (allowed.includes(status as TaskStatus)) next[id] = status as TaskStatus;
  }
  return next;
}

export function setContentFactoryStatus(
  statusById: Record<string, TaskStatus>,
  id: string,
  status: TaskStatus,
): Record<string, TaskStatus> {
  return { ...statusById, [id]: status };
}

function clipContentFactoryEdit(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.slice(0, CONTENT_FACTORY_EDIT_MAX_CHARS);
}

export function isCfDateIso(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime());
}

export function isCfAssignee(value: string): value is WorkAssignee {
  return (CF_ASSIGNEE_OPTIONS as readonly string[]).includes(value);
}

export function isCfChannel(value: string): value is CfChannel {
  return (CF_CHANNELS as readonly string[]).includes(value);
}

export function isCfKind(value: string): value is CfKind {
  return (CF_KINDS as readonly string[]).includes(value);
}

export function scheduleContentFactoryFromDate(dateIso: string): Pick<
  ContentFactoryItem,
  'dateIso' | 'weekday' | 'sprint' | 'sprintId'
> {
  const placed = sprintPlacementForIso(dateIso);
  return {
    dateIso,
    weekday: asCfWeekday(weekdayShortFromIso(dateIso)),
    sprint: placed.label as SprintCategory,
    sprintId: placed.id,
  };
}

function parseContentFactoryEditField(
  field: ContentFactoryEditField,
  value: unknown,
): string | undefined {
  const clipped = clipContentFactoryEdit(value);
  if (clipped === undefined) return undefined;
  if (field === 'assignee') return isCfAssignee(clipped) ? clipped : undefined;
  if (field === 'channel') return isCfChannel(clipped) ? clipped : undefined;
  if (field === 'kind') return isCfKind(clipped) ? clipped : undefined;
  if (field === 'dateIso') return isCfDateIso(clipped) ? clipped : undefined;
  return clipped;
}

export function parseContentFactoryEdits(raw: unknown): Record<string, ContentFactoryItemEdit> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const next: Record<string, ContentFactoryItemEdit> = {};
  for (const [id, row] of Object.entries(raw as Record<string, unknown>)) {
    if (!id.trim() || !row || typeof row !== 'object' || Array.isArray(row)) continue;
    const edit: ContentFactoryItemEdit = {};
    for (const field of CF_EDIT_FIELDS) {
      const parsed = parseContentFactoryEditField(field, (row as Record<string, unknown>)[field]);
      if (parsed !== undefined) edit[field] = parsed;
    }
    if (Object.keys(edit).length > 0) next[id] = edit;
  }
  return next;
}

export function seedValueForContentFactoryEdit(
  item: ContentFactoryItem,
  field: ContentFactoryEditField,
): string {
  if (field === 'videoPrompt') return item.videoPrompt ?? '';
  if (field === 'visualSrc') return item.visualSrc ?? '';
  if (field === 'taskId') return item.taskId ?? '';
  return String(item[field] ?? '');
}

export function setContentFactoryItemField(
  edits: Record<string, ContentFactoryItemEdit>,
  item: ContentFactoryItem,
  field: ContentFactoryEditField,
  value: string,
): Record<string, ContentFactoryItemEdit> {
  const parsed = parseContentFactoryEditField(field, value.slice(0, CONTENT_FACTORY_EDIT_MAX_CHARS));
  const clipped = parsed ?? (field === 'assignee' || field === 'channel' || field === 'kind' || field === 'dateIso'
    ? seedValueForContentFactoryEdit(item, field)
    : value.slice(0, CONTENT_FACTORY_EDIT_MAX_CHARS));
  const current = { ...(edits[item.id] ?? {}) };
  if (clipped === seedValueForContentFactoryEdit(item, field)) delete current[field];
  else current[field] = clipped;
  const next = { ...edits };
  if (Object.keys(current).length === 0) delete next[item.id];
  else next[item.id] = current;
  return next;
}

export function clearContentFactoryItemEdit(
  edits: Record<string, ContentFactoryItemEdit>,
  id: string,
): Record<string, ContentFactoryItemEdit> {
  if (!(id in edits)) return edits;
  const next = { ...edits };
  delete next[id];
  return next;
}

export function clearContentFactoryStatus(
  statusById: Record<string, TaskStatus>,
  id: string,
): Record<string, TaskStatus> {
  if (!(id in statusById)) return statusById;
  const next = { ...statusById };
  delete next[id];
  return next;
}

export function contentFactoryHasItemEdits(
  edits: Record<string, ContentFactoryItemEdit>,
  id: string,
): boolean {
  return Object.keys(edits[id] ?? {}).length > 0;
}

export function applyContentFactoryItemEdit(
  item: ContentFactoryItem,
  edit: ContentFactoryItemEdit,
): ContentFactoryItem {
  let next: ContentFactoryItem = { ...item };
  if (edit.title !== undefined) next.title = edit.title;
  if (edit.copy !== undefined) next.copy = edit.copy;
  if (edit.imagePrompt !== undefined) next.imagePrompt = edit.imagePrompt;
  if (edit.visualPrompt !== undefined) next.visualPrompt = edit.visualPrompt;
  if (edit.assetHint !== undefined) next.assetHint = edit.assetHint;
  if (edit.postTime !== undefined) next.postTime = edit.postTime;
  if (edit.videoPrompt !== undefined) next.videoPrompt = edit.videoPrompt.trim() ? edit.videoPrompt : undefined;
  if (edit.visualSrc !== undefined) next.visualSrc = edit.visualSrc.trim() ? edit.visualSrc : undefined;
  if (edit.taskId !== undefined) next.taskId = edit.taskId.trim() ? edit.taskId : undefined;
  if (edit.assignee !== undefined && isCfAssignee(edit.assignee)) next.assignee = edit.assignee;
  if (edit.channel !== undefined && isCfChannel(edit.channel)) next.channel = edit.channel;
  if (edit.kind !== undefined && isCfKind(edit.kind)) next.kind = edit.kind;
  if (edit.dateIso !== undefined && isCfDateIso(edit.dateIso)) {
    next = { ...next, ...scheduleContentFactoryFromDate(edit.dateIso) };
  }
  if (next.kind === 'post' && edit.copy !== undefined) {
    next.copy = ensureShopLinkInCopy(next.copy);
  }
  return next;
}

export function overlayContentFactoryEdits(
  items: ContentFactoryItem[],
  edits: Record<string, ContentFactoryItemEdit> = {},
): ContentFactoryItem[] {
  return rolloverOutstandingContentFactoryItems(
    items.map((item) => {
      const edit = edits[item.id];
      if (!edit) return item;
      return applyContentFactoryItemEdit(item, edit);
    }),
  );
}

export function contentFactorySearchBlob(item: ContentFactoryItem): string {
  return [
    item.title,
    item.copy,
    item.visualPrompt,
    item.imagePrompt,
    item.videoPrompt ?? '',
    item.assetHint,
    item.visualSrc ?? '',
    item.assignee,
    ASSIGNEE_LABELS[item.assignee],
    item.sprint,
    item.channel,
    CF_CHANNEL_LABELS[item.channel],
    item.kind,
    CF_KIND_LABELS[item.kind],
    item.note ?? '',
    item.taskId ?? '',
    item.dateIso,
  ]
    .join(' ')
    .toLowerCase();
}

export function filterContentFactoryItems(
  items: ContentFactoryItem[],
  filters: {
    search?: string;
    sprints?: Set<string>;
    assignees?: Set<string>;
    channels?: Set<string>;
    statuses?: Set<string>;
    kinds?: Set<string>;
  } = {},
): ContentFactoryItem[] {
  const search = (filters.search ?? '').trim().toLowerCase();
  return items.filter((item) => {
    if (filters.sprints && filters.sprints.size > 0 && !filters.sprints.has(item.sprint)) return false;
    if (filters.assignees && filters.assignees.size > 0 && !filters.assignees.has(item.assignee)) return false;
    if (filters.channels && filters.channels.size > 0 && !filters.channels.has(item.channel)) return false;
    if (filters.statuses && filters.statuses.size > 0 && !matchesRolledOverStatusFilter(item, filters.statuses)) {
      return false;
    }
    if (filters.kinds && filters.kinds.size > 0 && !filters.kinds.has(item.kind)) return false;
    if (search && !contentFactorySearchBlob(item).includes(search)) return false;
    return true;
  });
}

export function groupContentFactoryByChannel(
  items: ContentFactoryItem[],
): Record<CfChannel, ContentFactoryItem[]> {
  const grouped = Object.fromEntries(CF_CHANNELS.map((channel) => [channel, [] as ContentFactoryItem[]])) as Record<
    CfChannel,
    ContentFactoryItem[]
  >;
  items.forEach((item) => {
    grouped[item.channel].push(item);
  });
  CF_CHANNELS.forEach((channel) => {
    grouped[channel].sort((a, b) => a.dateIso.localeCompare(b.dateIso) || a.title.localeCompare(b.title));
  });
  return grouped;
}

export function contentFactoryHasChannelCoverage(
  items: ContentFactoryItem[] = PHASE_1_CONTENT_FACTORY,
): boolean {
  const channels = new Set(items.map((item) => item.channel));
  return CF_CHANNELS.every((channel) => channels.has(channel));
}

export function groupContentFactoryBySprint(
  items: ContentFactoryItem[],
): Record<SprintCategory, ContentFactoryItem[]> {
  const grouped = Object.fromEntries(SPRINT_OPTIONS.map((sprint) => [sprint, [] as ContentFactoryItem[]])) as Record<
    SprintCategory,
    ContentFactoryItem[]
  >;
  items.forEach((item) => {
    grouped[item.sprint].push(item);
  });
  SPRINT_OPTIONS.forEach((sprint) => {
    grouped[sprint].sort((a, b) => a.dateIso.localeCompare(b.dateIso) || a.title.localeCompare(b.title));
  });
  return grouped;
}

export function contentFactoryGearItems(
  items: ContentFactoryItem[] = PHASE_1_CONTENT_FACTORY,
): ContentFactoryItem[] {
  return items.filter((item) => item.kind === 'gear');
}

export function contentFactoryLogoItems(
  items: ContentFactoryItem[] = PHASE_1_CONTENT_FACTORY,
): ContentFactoryItem[] {
  return items.filter((item) => item.kind === 'logo');
}

export function contentFactoryHasSprintAndAssigneeCoverage(
  items: ContentFactoryItem[] = PHASE_1_CONTENT_FACTORY,
): boolean {
  const sprints = new Set(items.map((item) => item.sprint));
  const assignees = new Set(items.map((item) => item.assignee));
  return (
    SPRINT_OPTIONS.filter((sprint) => sprint !== 'Sprint 0').every((sprint) => sprints.has(sprint)) &&
    assignees.has('angela') &&
    assignees.has('evelyn')
  );
}

export function formatCfWhen(item: ContentFactoryItem): string {
  return `Due ${item.weekday}, ${formatWorkDueDate(item.dateIso)} · ${item.postTime}`;
}

export function formatCfDueChip(item: Pick<ContentFactoryItem, 'dateIso'>): string {
  return `Due ${formatWorkDueDateShort(item.dateIso)}`;
}

export function contentFactoryLinkedTask(
  taskId: string | undefined,
  tasks: Array<{ id: string; title: string; priority?: WorkPriority }> = INITIAL_TASKS,
): { id: string; code: string; title: string; priority?: WorkPriority } | null {
  const id = String(taskId ?? '').trim();
  if (!id) return null;
  const task = tasks.find((row) => row.id === id || row.id.split('::')[0] === id);
  return {
    id,
    code: formatTaskCode(id, tasks),
    title: task?.title ?? id,
    priority: task?.priority,
  };
}

export function contentFactoryHasNumberedTask(item: Pick<ContentFactoryItem, 'taskId'>): boolean {
  const linked = contentFactoryLinkedTask(item.taskId);
  return Boolean(linked && /^T-\d+$/.test(linked.code));
}

export function cfStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_LABELS[status];
}
