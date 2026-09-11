/**
 * Stable 3-digit Guide Library numbers (001…).
 * Free guides first (A–Z), then the rest of the unique library (A–Z).
 * Soft-delete / Inactive keeps the same number — numbers are never reused or renumbered.
 */

import { uniqueGuideLibraryEntries } from "./guide-library-pool";

function compareName(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

/** Ordered ids for numbering — Free first, then non-free; A–Z within each band. */
export function orderedGuideIdsForNumbering(): string[] {
  const entries = uniqueGuideLibraryEntries();
  const free = entries
    .filter((e) => e.minTier === "free")
    .sort((a, b) => compareName(a.name, b.name) || a.id.localeCompare(b.id));
  const rest = entries
    .filter((e) => e.minTier !== "free")
    .sort((a, b) => compareName(a.name, b.name) || a.id.localeCompare(b.id));
  return [...free, ...rest].map((e) => e.id);
}

const NUMBER_BY_ID: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  orderedGuideIdsForNumbering().forEach((id, i) => {
    out[id] = String(i + 1).padStart(3, "0");
  });
  return out;
})();

/** Three-digit catalog number, e.g. "001". Empty string if unknown. */
export function formatGuideNumber(guideId: string): string {
  return NUMBER_BY_ID[String(guideId || "").trim()] ?? "";
}

/** Prefixed label for UI, e.g. "#001". */
export function guideNumberLabel(guideId: string): string {
  const n = formatGuideNumber(guideId);
  return n ? `#${n}` : "";
}

/** Compact parenthetical for titles, e.g. "(#001)". */
export function guideNumberParenthetical(guideId: string): string {
  const label = guideNumberLabel(guideId);
  return label ? `(${label})` : "";
}

export function guideNumberById(): Readonly<Record<string, string>> {
  return NUMBER_BY_ID;
}
