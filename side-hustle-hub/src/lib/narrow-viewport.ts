/** Portrait phones — matches existing `@media (max-width: 640px)` layout rules. */
export const NARROW_VIEWPORT_QUERY = "(max-width: 640px)";

export function isNarrowViewport(media: { matches: boolean } | null | undefined): boolean {
  return Boolean(media?.matches);
}

export function readNarrowViewport(
  win: { matchMedia?: (query: string) => { matches: boolean } } | undefined =
    typeof window !== "undefined" ? window : undefined,
): boolean {
  if (!win?.matchMedia) return false;
  return isNarrowViewport(win.matchMedia(NARROW_VIEWPORT_QUERY));
}

/** Secondary page sections start closed on phones so the primary CTA stays above the fold. */
export function sectionStartsOpen(opts: {
  defaultOpen: boolean;
  collapseOnNarrow: boolean;
  narrow: boolean;
}): boolean {
  if (opts.collapseOnNarrow && opts.narrow) return false;
  return opts.defaultOpen;
}

/** Plan perk lists: phones show the toggle only; desktop previews the first rows. */
export function membershipBenefitsPreviewCount(narrow: boolean, desktopPreview = 2): number {
  return narrow ? 0 : desktopPreview;
}

/** Side Hustle Library: phones open in list view; desktop defaults to grid. */
export function defaultGuideLibraryLayout(narrow: boolean): "grid" | "list" {
  return narrow ? "list" : "grid";
}
