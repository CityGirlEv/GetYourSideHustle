export const HEAR_ABOUT_US_LABEL = 'How Did You Hear About Us?';
export const HEAR_ABOUT_US_PLACEHOLDER = 'Select one';

export const HEAR_ABOUT_US_OPTIONS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'friend', label: 'Friend or family' },
  { id: 'search', label: 'Search / Google' },
  { id: 'shop', label: 'Shop / SnatchVault' },
  { id: 'live', label: 'Live or event' },
  { id: 'other', label: 'Other' },
] as const;

export type HearAboutUsId = (typeof HEAR_ABOUT_US_OPTIONS)[number]['id'];

export function isHearAboutUsId(value: string): value is HearAboutUsId {
  return HEAR_ABOUT_US_OPTIONS.some((option) => option.id === value);
}

export function normalizeHearAboutUs(value?: string): string {
  return String(value ?? '').trim();
}

export function hearAboutUsLabel(value?: string): string {
  const id = normalizeHearAboutUs(value);
  return HEAR_ABOUT_US_OPTIONS.find((option) => option.id === id)?.label ?? '';
}

export function validateHearAboutUs(
  value?: string,
  required = false,
): { ok: true; value: string } | { ok: false; error: string } {
  const id = normalizeHearAboutUs(value);
  if (!id) {
    if (required) return { ok: false, error: `${HEAR_ABOUT_US_LABEL} is required.` };
    return { ok: true, value: '' };
  }
  if (!isHearAboutUsId(id)) {
    return { ok: false, error: `Choose a ${HEAR_ABOUT_US_LABEL} option.` };
  }
  return { ok: true, value: id };
}
