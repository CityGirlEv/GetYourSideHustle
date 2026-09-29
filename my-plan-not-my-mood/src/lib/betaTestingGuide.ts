/**
 * Living Beta Testing Guide — testers see the steps and thank-you gear options;
 * Angela and Evelyn add or delete items from Admin → Reference → Beta Guide.
 */

export const BETA_TESTING_GUIDE_PATH = '/beta-guide';
export const BETA_TESTING_GUIDE_PATH_ALIASES = ['/beta-testing-guide'] as const;

export const BETA_TESTING_GUIDE_TITLE = 'Beta Testing Guide';
export const BETA_TESTING_GUIDE_KICKER = 'For beta testers';
export const BETA_TESTING_GUIDE_SUBTITLE =
  'How to help us test My Plan, Not My Mood — and how we bless you with a tee, a hat, or both.';
export const BETA_TESTING_GUIDE_META_TITLE = 'Beta Testing Guide | My Plan, Not My Mood';
export const BETA_TESTING_GUIDE_META_DESCRIPTION =
  'Beta tester guide: run assigned tests, leave honest notes, and pick a thank-you tee and/or hat.';
export const BETA_TESTING_GUIDE_INTRO =
  'Evelyn started this living guide. Angela can add ideas anytime. Testers follow the steps; the house keeps the list current.';
export const BETA_TESTING_GUIDE_BLESSING_NOTE =
  'Thank-you gear is a gift, not cash. Pick a tee, a hat, or both. Size and color happen at fulfillment — this page does not collect an address.';

export const BETA_GUIDE_ITEM_KINDS = ['step', 'blessing', 'idea'] as const;
export type BetaGuideItemKind = (typeof BETA_GUIDE_ITEM_KINDS)[number];

export const BETA_GUIDE_PERKS = ['none', 'tee', 'hat', 'tee_or_hat'] as const;
export type BetaGuidePerk = (typeof BETA_GUIDE_PERKS)[number];

export const BETA_GUIDE_KIND_LABELS: Record<BetaGuideItemKind, string> = {
  step: 'Testing step',
  blessing: 'Thank-you blessing',
  idea: 'Idea',
};

export const BETA_GUIDE_PERK_LABELS: Record<BetaGuidePerk, string> = {
  none: 'None',
  tee: 'Tee',
  hat: 'Hat',
  tee_or_hat: 'Tee and/or hat',
};

export type BetaGuideItem = {
  id: string;
  kind: BetaGuideItemKind;
  title: string;
  body: string;
  perk: BetaGuidePerk;
  addedBy: string;
};

export type BetaGuideItemPatch = Partial<Pick<BetaGuideItem, 'kind' | 'title' | 'body' | 'perk' | 'addedBy'>>;

export const INITIAL_BETA_GUIDE_ITEMS: BetaGuideItem[] = [
  {
    id: 'bg-step-apply',
    kind: 'step',
    title: 'Apply as a Beta Tester',
    body: 'Create a site account and check Apply as a Beta Tester. An admin activates you before you can sign in. Beta Tester is not Admin access.',
    perk: 'none',
    addedBy: 'Evelyn',
  },
  {
    id: 'bg-step-portal',
    kind: 'step',
    title: 'Run your assigned tests',
    body: 'Open Testing Portal. Follow every step, including the page links. Set Passed when it works, or Failed with notes another adult can follow.',
    perk: 'none',
    addedBy: 'Evelyn',
  },
  {
    id: 'bg-step-notes',
    kind: 'step',
    title: 'Leave honest evidence',
    body: 'Empty checkboxes and copy-paste notes do not count. A screenshot helps when something breaks. Untested, In Progress, and Blocked earn no credits.',
    perk: 'none',
    addedBy: 'Evelyn',
  },
  {
    id: 'bg-bless-gear',
    kind: 'blessing',
    title: 'Pick a thank-you tee and/or hat',
    body: 'When you complete assigned testing, the house blesses you with Accountability Gear. Choose a MY PLAN tee, a hat, or both. Fulfillment is later — no shipping address on this page.',
    perk: 'tee_or_hat',
    addedBy: 'Evelyn',
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isBetaGuideItemKind(value: unknown): value is BetaGuideItemKind {
  return typeof value === 'string' && (BETA_GUIDE_ITEM_KINDS as readonly string[]).includes(value);
}

export function isBetaGuidePerk(value: unknown): value is BetaGuidePerk {
  return typeof value === 'string' && (BETA_GUIDE_PERKS as readonly string[]).includes(value);
}

export function parseBetaGuideItem(value: unknown): BetaGuideItem | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === 'string' ? value.id.trim() : '';
  const title = typeof value.title === 'string' ? value.title.trim() : '';
  if (!id || !title) return null;
  const body = typeof value.body === 'string' ? value.body : '';
  const kind = isBetaGuideItemKind(value.kind) ? value.kind : 'idea';
  const perk = isBetaGuidePerk(value.perk) ? value.perk : kind === 'blessing' ? 'tee_or_hat' : 'none';
  const addedBy =
    typeof value.addedBy === 'string' && value.addedBy.trim() ? value.addedBy.trim() : 'House';
  return { id, kind, title, body, perk: kind === 'blessing' ? perk : 'none', addedBy };
}

export function parseBetaGuideItems(value: unknown): BetaGuideItem[] | null {
  if (!Array.isArray(value)) return null;
  const items: BetaGuideItem[] = [];
  const seen = new Set<string>();
  for (const row of value) {
    const item = parseBetaGuideItem(row);
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    items.push(item);
  }
  return items;
}

export function applyBetaGuideItemPatch(item: BetaGuideItem, patch: BetaGuideItemPatch): BetaGuideItem {
  const next: BetaGuideItem = { ...item };
  if (typeof patch.title === 'string') next.title = patch.title;
  if (typeof patch.body === 'string') next.body = patch.body;
  if (typeof patch.addedBy === 'string' && patch.addedBy.trim()) next.addedBy = patch.addedBy.trim();
  if (isBetaGuideItemKind(patch.kind)) next.kind = patch.kind;
  if (isBetaGuidePerk(patch.perk)) next.perk = patch.perk;
  if (next.kind !== 'blessing') next.perk = 'none';
  else if (next.perk === 'none') next.perk = 'tee_or_hat';
  return next;
}

export function createBetaGuideItem(
  actorName: string,
  now = Date.now(),
  kind: BetaGuideItemKind = 'idea',
): BetaGuideItem {
  const addedBy = actorName.trim() || 'House';
  const isBlessing = kind === 'blessing';
  return {
    id: `bg-${now}`,
    kind,
    title: isBlessing ? 'New thank-you blessing' : kind === 'step' ? 'New testing step' : 'New idea',
    body: '',
    perk: isBlessing ? 'tee_or_hat' : 'none',
    addedBy,
  };
}

export function addBetaGuideItem(items: BetaGuideItem[], item: BetaGuideItem): BetaGuideItem[] {
  if (items.some((existing) => existing.id === item.id)) return items;
  return [...items, item];
}

export function removeBetaGuideItem(items: BetaGuideItem[], id: string): BetaGuideItem[] {
  return items.filter((item) => item.id !== id);
}

export function betaGuideItemsByKind(items: BetaGuideItem[], kind: BetaGuideItemKind): BetaGuideItem[] {
  return items.filter((item) => item.kind === kind);
}

export function betaGuideOffersTee(items: BetaGuideItem[]): boolean {
  return items.some((item) => item.kind === 'blessing' && (item.perk === 'tee' || item.perk === 'tee_or_hat'));
}

export function betaGuideOffersHat(items: BetaGuideItem[]): boolean {
  return items.some((item) => item.kind === 'blessing' && (item.perk === 'hat' || item.perk === 'tee_or_hat'));
}

export function isBetaTestingGuidePath(pathname: string): boolean {
  const path = (pathname || '/').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  if (path === BETA_TESTING_GUIDE_PATH) return true;
  return (BETA_TESTING_GUIDE_PATH_ALIASES as readonly string[]).includes(path);
}
