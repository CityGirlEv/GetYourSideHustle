import { ORGANIC_FACEBOOK_FOLLOWERS_LABEL, ORGANIC_ONLY_NOTE } from './sprintRoi';
import { TEE_SALES_SHOP_URL } from './teeSalesPlaybook';
import { SITE_ANALYTICS_CADENCE_DAYS, SITE_ANALYTICS_PLATFORMS } from './siteAnalyticsCadence';

export const GROWTH_STUDIO_PATH = '/admin/growth';
export const GROWTH_STUDIO_TITLE = 'Growth Studio';
export const GROWTH_STUDIO_KICKER = 'Socials and amplification';
export const GROWTH_STUDIO_STORAGE_KEY = 'myplan_growth_studio_v1';
export const GROWTH_STUDIO_SHOP_URL = TEE_SALES_SHOP_URL;
export const GROWTH_STUDIO_FOLLOWERS_LABEL = ORGANIC_FACEBOOK_FOLLOWERS_LABEL;

export const GROWTH_PHASE_1_RULE =
  'Phase 1 is organic only — Angela’s 6.2K personal Facebook. No paid ads. Content Factory writes the posts. This studio owns the channels, bios, pixels, and when ads may turn on.';

export const GROWTH_FACTORY_SPLIT =
  'Content Factory = what to post and when. Growth Studio = where it lives, who owns the page, and whether money is spent to amplify it.';

export type GrowthChannelId = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'personal' | 'website';
export type GrowthSetupPhase = 'phase1' | 'phase2';

export type GrowthChannel = {
  id: GrowthChannelId;
  label: string;
  kind: 'official' | 'personal' | 'shop';
  owner: 'angela' | 'evelyn';
  job: string;
  phase1Status: string;
};

export type GrowthSetupItem = {
  id: string;
  title: string;
  detail: string;
  phase: GrowthSetupPhase;
};

export type GrowthStudioState = {
  channelUrls: Record<string, string>;
  setupDone: Record<string, boolean>;
};

export const GROWTH_CHANNELS: readonly GrowthChannel[] = [
  {
    id: 'facebook',
    label: 'NonNegotiation Facebook',
    kind: 'official',
    owner: 'angela',
    job: 'Official Page. Pin Shop Gear. Share lives from personal.',
    phase1Status: 'Organic posts only',
  },
  {
    id: 'instagram',
    label: 'NonNegotiation Instagram',
    kind: 'official',
    owner: 'angela',
    job: 'Reels and Stories with the shop link in bio.',
    phase1Status: 'Organic posts only',
  },
  {
    id: 'tiktok',
    label: 'NonNegotiation TikTok',
    kind: 'official',
    owner: 'angela',
    job: 'Short sales videos. Bio is Shop Gear, not a second store.',
    phase1Status: 'Organic posts only',
  },
  {
    id: 'youtube',
    label: 'NonNegotiation YouTube',
    kind: 'official',
    owner: 'angela',
    job: 'Shorts and lives. Channel trailer is the tee drop.',
    phase1Status: 'Organic posts only',
  },
  {
    id: 'personal',
    label: 'Angela’s personal Facebook',
    kind: 'personal',
    owner: 'angela',
    job: `${GROWTH_STUDIO_FOLLOWERS_LABEL} following is the Phase 1 selling engine.`,
    phase1Status: 'Primary organic reach',
  },
  {
    id: 'website',
    label: 'Shop Gear',
    kind: 'shop',
    owner: 'evelyn',
    job: 'Every bio and pinned comment sends people to Shop Gear.',
    phase1Status: 'Live',
  },
];

export const GROWTH_SETUP_ITEMS: readonly GrowthSetupItem[] = [
  {
    id: 'facebook-page',
    title: 'Official Facebook Page',
    detail: 'NonNegotiation Page exists and bios point to Shop Gear.',
    phase: 'phase1',
  },
  {
    id: 'instagram',
    title: 'Official Instagram',
    detail: 'NonNegotiation Instagram is live with the shop URL in bio.',
    phase: 'phase1',
  },
  {
    id: 'tiktok',
    title: 'Official TikTok',
    detail: 'NonNegotiation TikTok is live. No second shop URL.',
    phase: 'phase1',
  },
  {
    id: 'youtube',
    title: 'Official YouTube',
    detail: 'Channel exists. Trailer or pin is the tee drop.',
    phase: 'phase1',
  },
  {
    id: 'bios-shop',
    title: 'Bios use Shop Gear',
    detail: `Every public bio uses ${GROWTH_STUDIO_SHOP_URL} — not SnatchVault.`,
    phase: 'phase1',
  },
  {
    id: 'personal-engine',
    title: 'Personal Facebook stays the engine',
    detail: `${GROWTH_STUDIO_FOLLOWERS_LABEL} personal following is where Phase 1 hoodie sales are modeled from.`,
    phase: 'phase1',
  },
  {
    id: 'meta-bm',
    title: 'Meta Business Manager',
    detail: 'Page, Instagram, and ad account live in one Business Manager.',
    phase: 'phase2',
  },
  {
    id: 'meta-pixel',
    title: 'Meta Pixel on the shop',
    detail: 'Pixel fires on Shop Gear / checkout so later ads can retarget.',
    phase: 'phase2',
  },
  {
    id: 'tiktok-pixel',
    title: 'TikTok Pixel / Events',
    detail: 'TikTok Events API or pixel is ready before any paid TikTok spend.',
    phase: 'phase2',
  },
  {
    id: 'ad-account',
    title: 'Paid ad account',
    detail: 'Ad account exists. No spend until Phase 2 is scoped and priced.',
    phase: 'phase2',
  },
  {
    id: 'boosts',
    title: 'Boosts and paid amplification',
    detail: 'Boosting posts or running ads is not in the $10K organic Phase 1.',
    phase: 'phase2',
  },
];

const DEFAULT_URLS: Record<GrowthChannelId, string> = {
  facebook: '',
  instagram: '',
  tiktok: '',
  youtube: '',
  personal: '',
  website: GROWTH_STUDIO_SHOP_URL,
};

export function emptyGrowthStudioState(): GrowthStudioState {
  return {
    channelUrls: { ...DEFAULT_URLS },
    setupDone: {},
  };
}

export function normalizeGrowthUrl(value: string): string {
  return String(value ?? '').trim();
}

export function growthUrlError(value: string): string | null {
  const url = normalizeGrowthUrl(value);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'Enter an http or https link.';
    }
    return null;
  } catch {
    return 'Enter a full URL, like https://facebook.com/nonnegotiation.';
  }
}

export function parseGrowthStudioState(value: unknown): GrowthStudioState {
  const next = emptyGrowthStudioState();
  if (!value || typeof value !== 'object') return next;
  const record = value as { channelUrls?: unknown; setupDone?: unknown };
  if (record.channelUrls && typeof record.channelUrls === 'object') {
    for (const channel of GROWTH_CHANNELS) {
      const raw = (record.channelUrls as Record<string, unknown>)[channel.id];
      if (typeof raw !== 'string') continue;
      const url = normalizeGrowthUrl(raw);
      if (url && !growthUrlError(url)) next.channelUrls[channel.id] = url;
      if (!url && channel.id !== 'website') next.channelUrls[channel.id] = '';
    }
  }
  if (record.setupDone && typeof record.setupDone === 'object') {
    for (const item of GROWTH_SETUP_ITEMS) {
      next.setupDone[item.id] = (record.setupDone as Record<string, unknown>)[item.id] === true;
    }
  }
  return next;
}

export function setGrowthChannelUrl(state: GrowthStudioState, id: GrowthChannelId, url: string): GrowthStudioState {
  const cleaned = normalizeGrowthUrl(url);
  return {
    ...state,
    channelUrls: { ...state.channelUrls, [id]: cleaned },
  };
}

export function toggleGrowthSetupItem(state: GrowthStudioState, id: string): GrowthStudioState {
  if (!GROWTH_SETUP_ITEMS.some((item) => item.id === id)) return state;
  return {
    ...state,
    setupDone: { ...state.setupDone, [id]: !state.setupDone[id] },
  };
}

export function growthSetupItemsForPhase(phase: GrowthSetupPhase): GrowthSetupItem[] {
  return GROWTH_SETUP_ITEMS.filter((item) => item.phase === phase);
}

export function growthSetupProgress(
  state: GrowthStudioState,
  phase: GrowthSetupPhase,
): { done: number; total: number } {
  const items = growthSetupItemsForPhase(phase);
  return {
    done: items.filter((item) => state.setupDone[item.id]).length,
    total: items.length,
  };
}

export function growthStudioPhase1Ready(state: GrowthStudioState): boolean {
  const progress = growthSetupProgress(state, 'phase1');
  return progress.total > 0 && progress.done === progress.total;
}

/** Paid spend stays off in Phase 1 even if the ad-account checklist is ticked. */
export function growthStudioAllowsPaidSpend(): boolean {
  return false;
}

export function growthStudioOrganicNote(): string {
  return ORGANIC_ONLY_NOTE;
}

export function growthStudioAnalyticsSummary(): {
  cadenceDays: number;
  platforms: string[];
} {
  return {
    cadenceDays: SITE_ANALYTICS_CADENCE_DAYS,
    platforms: SITE_ANALYTICS_PLATFORMS.map((platform) => platform.label),
  };
}

export function growthChannelHref(state: GrowthStudioState, id: GrowthChannelId): string | null {
  const url = normalizeGrowthUrl(state.channelUrls[id] ?? '');
  if (!url || growthUrlError(url)) return null;
  return url;
}
