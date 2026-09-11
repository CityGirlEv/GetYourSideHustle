/**
 * Admin Side Hustle Library listing search — plain substring or * / ? wildcards.
 */

/** Member-facing library name. */
export const SIDE_HUSTLE_LIBRARY_TITLE = "Side Hustle Library";

/** Admin listing page (browse + filters; not the status editor). */
export const GUIDE_HUSTLE_LIBRARY_LISTING_TITLE = "Guide Hustle Library Listing Page";

/** Admin guide detail where status / bulk edit live. */
export const SIDE_HUSTLE_LIBRARY_ADMIN_TITLE = "Side Hustle Library Admin";

export function sideHustleLibraryPageTitle(opts: {
  isAdmin: boolean;
  /** True when viewing a single guide (status / steps). */
  isDetail?: boolean;
}): string {
  if (!opts.isAdmin) return SIDE_HUSTLE_LIBRARY_TITLE;
  if (opts.isDetail) return SIDE_HUSTLE_LIBRARY_ADMIN_TITLE;
  return GUIDE_HUSTLE_LIBRARY_LISTING_TITLE;
}

/** Build a case-insensitive RegExp from a * / ? pattern (other regex chars escaped). */
export function wildcardPatternToRegExp(pattern: string): RegExp {
  const escaped = String(pattern)
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`, "i");
}

/**
 * Match haystack against an admin query.
 * - Empty query → match all
 * - No `*` / `?` → case-insensitive substring
 * - With wildcards → full-string glob (`*` any run, `?` one char); use `*foo*` for contains
 */
export function textMatchesWildcardQuery(haystack: string, rawQuery: string): boolean {
  const q = String(rawQuery || "").trim();
  if (!q) return true;
  const hay = String(haystack || "");
  if (!/[*?]/.test(q)) {
    return hay.toLowerCase().includes(q.toLowerCase());
  }
  return wildcardPatternToRegExp(q).test(hay);
}

/** Join id / name / peek / guide # into one searchable string. */
export function guideLibrarySearchHaystack(parts: {
  id: string;
  name: string;
  peek?: string;
  guideNumber?: string;
}): string {
  return [parts.id, parts.name, parts.peek ?? "", parts.guideNumber ?? ""]
    .map((p) => String(p || "").trim())
    .filter(Boolean)
    .join(" ");
}

export function guideMatchesLibrarySearch(
  parts: { id: string; name: string; peek?: string; guideNumber?: string },
  rawQuery: string,
): boolean {
  const q = String(rawQuery || "").trim();
  if (!q) return true;
  const hay = guideLibrarySearchHaystack(parts);
  if (!/[*?]/.test(q)) {
    return textMatchesWildcardQuery(hay, q);
  }
  // Wildcard: match if the pattern fits the full haystack OR any single field.
  if (textMatchesWildcardQuery(hay, q)) return true;
  return [parts.id, parts.name, parts.peek ?? "", parts.guideNumber ?? ""].some((field) =>
    textMatchesWildcardQuery(field, q),
  );
}
