/**
 * Stable 3-digit Guide Library numbers (#001...).
 * Numbers are pinned per guide id — membership tier changes do NOT renumber.
 * Soft-delete / Inactive keeps the same number. New guides append the next free #.
 */

import { uniqueGuideLibraryIds } from "./guide-library-pool";
import { PINNED_GUIDE_NUMBERS } from "./guide-number-registry";

function buildNumberById(): Record<string, string> {
  const out: Record<string, string> = { ...PINNED_GUIDE_NUMBERS };
  let max = 0;
  for (const n of Object.values(out)) {
    const v = Number.parseInt(n, 10);
    if (Number.isFinite(v) && v > max) max = v;
  }
  const known = new Set(Object.keys(out));
  const missing = uniqueGuideLibraryIds()
    .filter((id) => !known.has(id))
    .sort((a, b) => a.localeCompare(b));
  for (const id of missing) {
    max += 1;
    out[id] = String(max).padStart(3, "0");
  }
  return out;
}

const NUMBER_BY_ID: Record<string, string> = buildNumberById();

/** Guide ids ordered by pinned catalog number (then id). */
export function orderedGuideIdsForNumbering(): string[] {
  return Object.keys(NUMBER_BY_ID).sort((a, b) => {
    const na = NUMBER_BY_ID[a] || "";
    const nb = NUMBER_BY_ID[b] || "";
    return na.localeCompare(nb) || a.localeCompare(b);
  });
}

/** Three-digit catalog number, e.g. "001". Empty string if unknown. */
export function formatGuideNumber(guideId: string): string {
  return NUMBER_BY_ID[String(guideId || "").trim()] ?? "";
}

/** Prefixed label for UI, e.g. "#001". */
export function guideNumberLabel(guideId: string): string {
  const n = formatGuideNumber(guideId);
  return n ? `#${n}` : "";
}

/**
 * Display id for Testing Portal rows.
 * GUIDE-REV cases include the pinned library guide # (e.g. "#018 · GUIDE-REV-launch-rideshare").
 */
export function testCaseIdWithNumber(testId: string): string {
  const id = String(testId || "").trim();
  if (!id) return "";
  const m = id.match(/^GUIDE-REV-(?:launch|kids|junior|senior)-(.+)$/i);
  if (m?.[1]) {
    const num = guideNumberLabel(m[1]);
    return num ? `${num} · ${id}` : id;
  }
  return id;
}

/** Compact parenthetical for titles, e.g. "(#001)". */
export function guideNumberParenthetical(guideId: string): string {
  const label = guideNumberLabel(guideId);
  return label ? `(${label})` : "";
}

export function guideNumberById(): Readonly<Record<string, string>> {
  return NUMBER_BY_ID;
}
