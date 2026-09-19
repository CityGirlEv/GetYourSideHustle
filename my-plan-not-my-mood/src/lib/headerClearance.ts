/** Site header menu stays pinned and paints above page content. */
export const HEADER_STICKY_CLASS = 'sticky top-0 z-[9999] overflow-visible';

/** Brand wordmark only — no seal, and never absolutely positioned over Admin Studio. */
export const HEADER_BRAND_SLOT_CLASS =
  'relative flex flex-col justify-center min-w-0 py-1 text-center md:text-left max-w-full';

/** Admin Studio menu bar must scroll away on desktop and mobile. */
export const ADMIN_STUDIO_HEADER_CLASS =
  'relative z-0 isolate overflow-hidden static bg-gradient-to-r from-[#FFF7ED] via-[#FFEDD5] to-[#FEF3C7] text-[#9A3412] border-b-2 border-[#EA580C]';
export const ADMIN_STUDIO_HEADER_INNER_CLASS =
  'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 flex flex-wrap items-end justify-between gap-x-2 gap-y-0';
export const ADMIN_STUDIO_MAIN_CLASS =
  'flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4 w-full';

export function headerBrandCanOverlapPage(className: string): boolean {
  return /\babsolute\b/.test(className);
}

export function headerOverflowClipsMenu(className: string): boolean {
  return /\boverflow-hidden\b/.test(className);
}

/** Mobile drawer is a page-level overlay so it cannot slip under hero photos. */
export const HEADER_MOBILE_OVERLAY_CLASS =
  'md:hidden fixed left-0 right-0 bottom-0 z-[10040] bg-[#1F1917]/50 cursor-pointer';
export const HEADER_MOBILE_MENU_CLASS =
  'md:hidden fixed inset-x-0 bottom-0 z-[10050] overflow-y-auto overscroll-contain border-t-2 border-[#1F1917] bg-[#FAF8F5] px-3 py-4 space-y-3 shadow-[0_18px_40px_rgba(31,25,23,0.28)] isolate';

/** Room under the sticky nav. Quote bubble is not sticky so it does not cover the hero. */
export const QUOTE_BAR_TRAILING_SPACE = 'pb-2 sm:pb-3';
export const HEADER_CONTENT_OFFSET = 'pt-28 sm:pt-32 lg:pt-36';
/** About, FAQ, Contact, Privacy, and Terms sit just under the in-flow header — no extra band. */
export const HEADER_COMPACT_PAGE_OFFSET = 'pt-0';

const COMPACT_LAUNCH_PAGE_IDS = new Set(['about', 'faq', 'contact', 'privacy', 'terms']);

export function isCompactLaunchPage(pageId: string | null | undefined): boolean {
  return COMPACT_LAUNCH_PAGE_IDS.has(String(pageId ?? ''));
}

export function launchPageContentOffset(pageId: string | null | undefined): string {
  return isCompactLaunchPage(pageId) ? HEADER_COMPACT_PAGE_OFFSET : HEADER_CONTENT_OFFSET;
}

export const MOBILE_NAV_SECTION_LABELS = ['Shop', 'Tools', 'Account'] as const;
