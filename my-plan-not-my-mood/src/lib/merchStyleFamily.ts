import { fileNameFromRelativePath } from './localFolder';

/** Product words stripped so tee/hoodie/hat of the same design share one style. */
const PRODUCT_TOKENS = new Set([
  'e',
  'eshirt',
  'eshirts',
  't',
  'tee',
  'tees',
  'tshirt',
  'tshirts',
  'shirt',
  'shirts',
  'hoodie',
  'hoodies',
  'sweatshirt',
  'sweatshirts',
  'hat',
  'hats',
  'cap',
  'caps',
  'beanie',
  'beanies',
]);

export const MERCH_COLLECTIONS = [
  { id: 'letters', label: 'My Plan Letters Collection' },
  { id: 'tie-dye', label: 'My Plan Tie-Dye Collection' },
] as const;

export type MerchCollectionId = (typeof MERCH_COLLECTIONS)[number]['id'];

export const MERCH_COLLECTION_LABELS: Record<MerchCollectionId, string> = {
  letters: 'My Plan Letters Collection',
  'tie-dye': 'My Plan Tie-Dye Collection',
};

export interface MerchStyleFamily {
  familyId: string;
  familyLabel: string;
}

export function isMerchCollectionId(value: unknown): value is MerchCollectionId {
  return value === 'letters' || value === 'tie-dye';
}

export function merchCollectionById(id: MerchCollectionId): MerchStyleFamily {
  return { familyId: id, familyLabel: MERCH_COLLECTION_LABELS[id] };
}

/** Tie-Dye / Tie-Die / rainbow spiral → Tie-Dye; everything else → Letters. */
export function isTieDyeMerchText(value: string): boolean {
  return /tie[- _]?dye|tie[- _]?die|tiedye|tiedie|rainbow\s*spiral/i.test(String(value ?? ''));
}

export function splitMerchNameTokens(value: string): string[] {
  return String(value ?? '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[_./\\-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function isMerchProductToken(token: string): boolean {
  return PRODUCT_TOKENS.has(token.toLowerCase().replace(/[^a-z0-9]/g, ''));
}

export function isMerchViewToken(token: string): boolean {
  return /^(front|back|side|left|right|view|mockup|card|image|photo|v\d+)$/i.test(
    token.toLowerCase().replace(/[^a-z0-9]/g, ''),
  );
}

export function slugMerchStyleFamily(label: string): string {
  const slug = String(label ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'style';
}

export function humanizeMerchTokens(tokens: string[]): string {
  return tokens
    .map((token) => {
      if (/^[A-Z0-9]+$/.test(token) && token.length <= 3) return token;
      return token.charAt(0).toUpperCase() + token.slice(1);
    })
    .join(' ')
    .trim();
}

export function merchCollectionDisplayLabel(label: string): string {
  const trimmed = String(label ?? '').trim().replace(/\s+/g, ' ');
  return /collection$/i.test(trimmed) ? trimmed : `${trimmed} Collection`;
}

function canonicalCollectionSlug(slug: string): MerchCollectionId | null {
  if (isMerchCollectionId(slug)) return slug;
  if (slug === 'letters-collection' || slug === 'my-plan-letters-collection') return 'letters';
  if (
    slug === 'tie-die' ||
    slug === 'tie-dye-collection' ||
    slug === 'tie-die-collection' ||
    slug === 'my-plan-tie-dye-collection' ||
    slug === 'my-plan-tie-die-collection'
  ) {
    return 'tie-dye';
  }
  return null;
}

function styleTokensFromPath(relativePath: string): string[] {
  const parts = String(relativePath ?? '')
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean);
  parts.pop();
  for (const part of [...parts].reverse()) {
    const tokens = splitMerchNameTokens(part).filter(
      (token) => !isMerchProductToken(token) && !isMerchViewToken(token),
    );
    if (tokens.length) return tokens;
  }
  return [];
}

function familyFromTokens(tokens: string[], fallbackPath: string): MerchStyleFamily {
  const label = humanizeMerchTokens(tokens);
  const slug = slugMerchStyleFamily(label);
  const canonical = canonicalCollectionSlug(slug);
  if (canonical) return merchCollectionById(canonical);
  if (label) return { familyId: slug, familyLabel: merchCollectionDisplayLabel(label) };
  if (isTieDyeMerchText(fallbackPath)) return merchCollectionById('tie-dye');
  return merchCollectionById('letters');
}

/** Name a collection — any unique name is allowed. Letters and Tie-Dye keep their canonical IDs. */
export function namedMerchStyleFamily(label: string): { family: MerchStyleFamily } | { error: string } {
  const familyLabel = String(label ?? '').trim().replace(/\s+/g, ' ');
  if (!familyLabel) return { error: 'Name this collection.' };
  if (familyLabel.length > 80) return { error: 'Collection names must be 80 characters or fewer.' };
  const slug = slugMerchStyleFamily(familyLabel);
  const canonical = canonicalCollectionSlug(slug);
  const display = merchCollectionDisplayLabel(familyLabel);
  if (canonical) return { family: { familyId: canonical, familyLabel: display } };
  return { family: { familyId: slug, familyLabel: display } };
}

export function suggestedStyleNameFromFile(name: string, relativePath = ''): string {
  return merchStyleFamilyFromName(name, relativePath).familyLabel;
}

export function merchStyleFamilyFromName(name: string, relativePath = ''): MerchStyleFamily {
  const trimmed = name.trim();
  if (isMerchCollectionId(trimmed)) return merchCollectionById(trimmed);
  const folderTokens = styleTokensFromPath(relativePath);
  const nameTokens = splitMerchNameTokens(fileNameFromRelativePath(name)).filter(
    (token) => !isMerchProductToken(token) && !isMerchViewToken(token),
  );
  const tokens = folderTokens.length ? folderTokens : nameTokens;
  return familyFromTokens(tokens, `${relativePath} ${name}`);
}

export function groupByMerchStyleFamily<T>(
  items: T[],
  nameOf: (item: T) => string,
  pathOf?: (item: T) => string,
): Array<MerchStyleFamily & { items: T[] }> {
  const groups = new Map<string, MerchStyleFamily & { items: T[] }>();
  for (const item of items) {
    const family = merchStyleFamilyFromName(nameOf(item), pathOf?.(item) ?? '');
    const current = groups.get(family.familyId);
    if (current) current.items.push(item);
    else groups.set(family.familyId, { ...family, items: [item] });
  }
  return [...groups.values()].sort((a, b) => a.familyLabel.localeCompare(b.familyLabel));
}
