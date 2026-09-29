import type { CSSProperties } from 'react';

export const HOME_PAGE_COPY_STORAGE_KEY = 'myplan_home_page_copy_v1';

export const HOME_HERO_IMAGE = '/images/home-hero.jpg?v=hero-final';
export const HOME_HERO_IMAGE_ALT =
  'Angela Harris at her desk in a My Plan, Not My Mood tee, with Join the Movement and Shop the Collection';

export type HomeHeroHotspot = {
  left: string;
  top: string;
  width: string;
  height: string;
};

/** Percent boxes over the painted Join / Shop buttons on the landscape hero. Must not overlap. */
export const HOME_HERO_JOIN_HOTSPOT: HomeHeroHotspot = {
  left: '5.5%',
  top: '66.5%',
  width: '28%',
  height: '8.5%',
};
export const HOME_HERO_SHOP_HOTSPOT: HomeHeroHotspot = {
  left: '5.5%',
  top: '76%',
  width: '28%',
  height: '9%',
};

export function homeHeroHotspotStyle(hotspot: HomeHeroHotspot): CSSProperties {
  return {
    position: 'absolute',
    left: hotspot.left,
    top: hotspot.top,
    width: hotspot.width,
    height: hotspot.height,
  };
}

export const HOME_HERO_SHOP_HREF = '/gear';

export function heroShopHotspotOverlapsJoin(
  join: HomeHeroHotspot = HOME_HERO_JOIN_HOTSPOT,
  shop: HomeHeroHotspot = HOME_HERO_SHOP_HOTSPOT,
): boolean {
  const joinBottom = Number.parseFloat(join.top) + Number.parseFloat(join.height);
  return Number.parseFloat(shop.top) < joinBottom;
}
export const HOME_MOVEMENT_IMAGE = '/images/home-movement.jpg?v=couple-tees';
export const HOME_MOVEMENT_IMAGE_ALT =
  'Two people wearing My Plan, Not My Mood tees — a movement for real life';
export const HOME_QUOTE_IMAGE = '/images/multicultural_hero_moods_bg.jpg';

export const HOME_PILLAR_COUNT = 5;

export type HomePillarDestination = {
  href: string;
  kind: 'gear' | 'mood' | 'about' | 'affirmations' | 'join';
};

export const HOME_PILLAR_DESTINATIONS: readonly HomePillarDestination[] = [
  { href: '/gear', kind: 'gear' },
  { href: '/#mood-tool', kind: 'mood' },
  { href: '/about', kind: 'about' },
  { href: '/join', kind: 'affirmations' },
  { href: '/join', kind: 'join' },
];

export function homePillarDestination(index: number): HomePillarDestination {
  return HOME_PILLAR_DESTINATIONS[index] ?? HOME_PILLAR_DESTINATIONS[0];
}

/** Public home copy is Super Admin only — Admin, QA, and Dev cannot edit it. */
export function canEditHomePageCopy(isSuperAdmin: boolean | null | undefined): boolean {
  return Boolean(isSuperAdmin);
}

export type HomePageCopy = {
  kicker: string;
  titleLead: string;
  titleAccent: string;
  lede: string;
  feelIt: string;
  primaryCta: string;
  secondaryCta: string;
  overlayScript: string;
  pillars: string[];
  movementKicker: string;
  movementTitle: string;
  movementBody: string;
  movementCta: string;
  quote: string;
  quoteEmphasis: string;
  quoteAttribution: string;
  moodBanner: string;
  moodTitle: string;
  moodLede: string;
  moodQuote: string;
};

export const DEFAULT_HOME_PAGE_COPY: HomePageCopy = {
  kicker: 'A NONNEGOTIATION BRAND',
  titleLead: 'MY PLAN,',
  titleAccent: 'NOT MY MOOD.',
  lede: 'Do not let a temporary mood determine a permanent outcome.',
  feelIt: 'FEEL IT. FOLLOW THE PLAN ANYWAY.',
  primaryCta: 'JOIN THE MOVEMENT',
  secondaryCta: 'SHOP THE COLLECTION',
  overlayScript: 'Purpose Looks Good On You.',
  pillars: [
    'WEAR THE MINDSET',
    'PRACTICAL TOOLS',
    'REAL LIFE RESOURCES',
    'DAILY ENCOURAGEMENT',
    'A STRONGER YOU',
  ],
  movementKicker: 'DISCIPLINE CREATES FREEDOM',
  movementTitle: 'A Movement for Real Life.',
  movementBody:
    'Whether you’re tired, excited, overwhelmed or somewhere in between — the plan still works. This movement is about making choices that align with the life you want, not just how you feel in the moment.',
  movementCta: 'How The Journey Began',
  quote: 'Discipline today creates the freedom you want tomorrow.',
  quoteEmphasis: 'freedom',
  quoteAttribution: 'MY PLAN, NOT MY MOOD',
  moodBanner: 'No matter the mood, the plan still works.',
  moodTitle: 'HOW ARE YOU FEELING TODAY?',
  moodLede: 'Tap a mood to get encouragement, perspective, and a next step.',
  moodQuote: 'Feel it. Acknowledge it. Then follow the plan anyway.',
};

const STRING_KEYS = [
  'kicker',
  'titleLead',
  'titleAccent',
  'lede',
  'feelIt',
  'primaryCta',
  'secondaryCta',
  'overlayScript',
  'movementKicker',
  'movementTitle',
  'movementBody',
  'movementCta',
  'quote',
  'quoteEmphasis',
  'quoteAttribution',
  'moodBanner',
  'moodTitle',
  'moodLede',
  'moodQuote',
] as const satisfies ReadonlyArray<keyof HomePageCopy>;

function cleanText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.replace(/\s+/g, ' ').trim();
  return trimmed || fallback;
}

/** Mockup stacks the default overlay as three script lines. */
export function overlayScriptDisplay(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (/^purpose looks good on you\.?$/i.test(normalized)) {
    return 'Purpose\nLooks Good\nOn You.';
  }
  return text.trim();
}

function cleanPillars(value: unknown): string[] {
  const source = Array.isArray(value) ? value : [];
  return DEFAULT_HOME_PAGE_COPY.pillars.map((fallback, index) => cleanText(source[index], fallback));
}

export function parseHomePageCopy(raw: unknown): HomePageCopy {
  const input = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const next = { ...DEFAULT_HOME_PAGE_COPY };
  for (const key of STRING_KEYS) {
    next[key] = cleanText(input[key], DEFAULT_HOME_PAGE_COPY[key]);
  }
  next.pillars = cleanPillars(input.pillars);
  return next;
}

export function mergeHomePageCopy(overrides: Partial<HomePageCopy> | null | undefined): HomePageCopy {
  return parseHomePageCopy({ ...DEFAULT_HOME_PAGE_COPY, ...(overrides ?? {}) });
}

export function patchHomePageCopy(current: HomePageCopy, patch: Partial<HomePageCopy>): HomePageCopy {
  return parseHomePageCopy({ ...current, ...patch });
}

export function patchHomePagePillar(current: HomePageCopy, index: number, title: string): HomePageCopy {
  const pillars = current.pillars.slice();
  if (index < 0 || index >= HOME_PILLAR_COUNT) return current;
  pillars[index] = title;
  return parseHomePageCopy({ ...current, pillars });
}

export function homePageCopyEquals(a: HomePageCopy, b: HomePageCopy): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function loadHomePageCopy(
  storage: Pick<Storage, 'getItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
): HomePageCopy {
  if (!storage) return { ...DEFAULT_HOME_PAGE_COPY, pillars: [...DEFAULT_HOME_PAGE_COPY.pillars] };
  try {
    const raw = storage.getItem(HOME_PAGE_COPY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_HOME_PAGE_COPY, pillars: [...DEFAULT_HOME_PAGE_COPY.pillars] };
    return parseHomePageCopy(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_HOME_PAGE_COPY, pillars: [...DEFAULT_HOME_PAGE_COPY.pillars] };
  }
}

export function persistHomePageCopy(
  copy: HomePageCopy,
  storage: Pick<Storage, 'setItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
): HomePageCopy {
  const next = parseHomePageCopy(copy);
  storage?.setItem(HOME_PAGE_COPY_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function resetHomePageCopy(
  storage: Pick<Storage, 'removeItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
): HomePageCopy {
  storage?.removeItem(HOME_PAGE_COPY_STORAGE_KEY);
  return { ...DEFAULT_HOME_PAGE_COPY, pillars: [...DEFAULT_HOME_PAGE_COPY.pillars] };
}

export function quoteParts(copy: Pick<HomePageCopy, 'quote' | 'quoteEmphasis'>): {
  before: string;
  emphasis: string;
  after: string;
} {
  const quote = copy.quote;
  const emphasis = copy.quoteEmphasis.trim();
  if (!emphasis) return { before: quote, emphasis: '', after: '' };
  const at = quote.toLowerCase().indexOf(emphasis.toLowerCase());
  if (at < 0) return { before: quote, emphasis: '', after: '' };
  return {
    before: quote.slice(0, at),
    emphasis: quote.slice(at, at + emphasis.length),
    after: quote.slice(at + emphasis.length),
  };
}

export const HOME_PAGE_COPY_API_PATH = '/api/home-page';
export const HOME_PAGE_COPY_STORE_ID = 'v1';

export type HomePageCopyStorePayload = {
  copy: HomePageCopy;
  updatedAt: string;
  updatedBy: string | null;
  empty?: boolean;
};

export type HomePageCopyStoreResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function parseHomePageCopyStorePayload(value: unknown): HomePageCopyStorePayload | null {
  if (!isRecord(value)) return null;
  if (value.empty === true && value.copy == null) {
    return { copy: parseHomePageCopy({}), updatedAt: '', updatedBy: null, empty: true };
  }
  const source = isRecord(value.copy)
    ? value.copy
    : value.titleLead || value.lede || value.kicker
      ? value
      : null;
  if (!isRecord(source)) return null;
  return {
    copy: parseHomePageCopy(source),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
    updatedBy: typeof value.updatedBy === 'string' && value.updatedBy.trim() ? value.updatedBy.trim() : null,
  };
}

export function buildHomePageCopyStorePayload(
  copy: HomePageCopy,
  updatedBy: string | null,
  now = new Date(),
): HomePageCopyStorePayload {
  return {
    copy: parseHomePageCopy(copy),
    updatedAt: now.toISOString(),
    updatedBy: updatedBy?.trim() || null,
  };
}

export async function fetchHomePageCopyStore(): Promise<HomePageCopyStorePayload | null> {
  try {
    const response = await fetch(HOME_PAGE_COPY_API_PATH, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { empty?: boolean } & Record<string, unknown>;
    if (data.empty) return null;
    return parseHomePageCopyStorePayload(data);
  } catch {
    return null;
  }
}

export async function saveHomePageCopyStore(
  payload: HomePageCopyStorePayload,
): Promise<HomePageCopyStoreResult> {
  try {
    const response = await fetch(HOME_PAGE_COPY_API_PATH, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.status === 503) {
      return { ok: true, skipped: true, error: 'Home page copy database is not configured' };
    }
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error || `Home page copy API failed (${response.status})` };
    }
    return { ok: true };
  } catch {
    return { ok: true, skipped: true };
  }
}
