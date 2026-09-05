export const ACCESSORY_PAGE_LABEL = 'Accessories';
export const ACCESSORY_PHASE2_LABEL = 'Phase 2';
export const ACCESSORY_BRAND_NAME = 'My Plan, Not My Mood';

export const ACCESSORY_PHASE2_ITEMS = [
  {
    id: 'journal',
    label: 'Journal',
    name: 'My Plan, Not My Mood Journal',
    summary: '90-day follow-through journal — write the plan, then keep it.',
  },
  {
    id: 'planner',
    label: 'Planner',
    name: 'My Plan, Not My Mood Planner',
    summary: 'Daily planner and desk pad so the plan stays in front of you.',
  },
  {
    id: 'bracelets',
    label: 'Bracelets',
    name: 'My Plan, Not My Mood Bracelets',
    summary: 'Wearable reminder: feel it, follow the plan anyway.',
  },
] as const;

export type AccessoryPhase2Id = (typeof ACCESSORY_PHASE2_ITEMS)[number]['id'];
export type AccessoryPhase2Item = (typeof ACCESSORY_PHASE2_ITEMS)[number];

export const DEFAULT_ACCESSORY_TAB: AccessoryPhase2Id = 'journal';

export const ACCESSORY_PHASE2_ITEM_LABELS = ACCESSORY_PHASE2_ITEMS.map((item) => item.label);

/** @deprecated Use ACCESSORY_PHASE2_ITEM_LABELS — Accessories is Phase 2. */
export const ACCESSORY_PHASE3_EXAMPLES = ACCESSORY_PHASE2_ITEM_LABELS;

export function isAccessoryPhase2Id(value: unknown): value is AccessoryPhase2Id {
  return typeof value === 'string' && ACCESSORY_PHASE2_ITEMS.some((item) => item.id === value);
}

export function resolveAccessoryTab(tab: string | null | undefined): AccessoryPhase2Id {
  return isAccessoryPhase2Id(tab) ? tab : DEFAULT_ACCESSORY_TAB;
}

export function accessoryPhase2Item(id: string | null | undefined): AccessoryPhase2Item {
  return ACCESSORY_PHASE2_ITEMS.find((item) => item.id === resolveAccessoryTab(id))!;
}

export function accessoryBrandedName(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return ACCESSORY_BRAND_NAME;
  if (trimmed.toLowerCase().startsWith(ACCESSORY_BRAND_NAME.toLowerCase())) return trimmed;
  return `${ACCESSORY_BRAND_NAME} ${trimmed}`;
}

export function accessoriesPhase2Summary(): string {
  return `${ACCESSORY_PHASE2_ITEM_LABELS.join(', ')} — ${ACCESSORY_BRAND_NAME}. ${ACCESSORY_PHASE2_LABEL}.`;
}
