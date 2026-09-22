/**
 * Stable “random” Guide Library PDF / GUIDE-REV QA sample.
 * 10 guides: first 5 → Tina, next 5 → Evelyn. Seed locked for CI.
 */
import { uniqueGuideLibraryEntries } from "./guide-library-pool";
import { guideReviewCaseIdForGuide } from "./guide-review-link";
import { formatGuideNumber } from "./guide-numbers";

/** Bump only when intentionally reshuffling the sample pool. */
export const GUIDE_PDF_QA_SAMPLE_SEED = "gysh-guide-pdf-qa-sample-v1";

export type GuidePdfQaSampleRow = {
  guideId: string;
  guideNumber: string;
  name: string;
  assignee: "tina" | "evelyn";
  caseId: string;
};

/** FNV-1a 32-bit — stable across Node / browser. */
export function fnv1aHash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Deterministic shuffle of library guide ids (by hash of id + seed).
 * Picks `count` guides for PDF / content QA.
 */
export function pickGuidePdfQaSampleIds(
  count = 10,
  seed: string = GUIDE_PDF_QA_SAMPLE_SEED,
): string[] {
  const n = Math.max(0, Math.floor(count));
  const entries = uniqueGuideLibraryEntries();
  const ranked = entries
    .map((e) => ({
      id: e.id,
      rank: fnv1aHash(`${e.id}\0${seed}`),
    }))
    .sort((a, b) => a.rank - b.rank || a.id.localeCompare(b.id));
  return ranked.slice(0, n).map((r) => r.id);
}

/** Tina gets indices 0–4, Evelyn 5–9 (for a 10-guide pool). */
export function buildGuidePdfQaSample(
  count = 10,
  seed: string = GUIDE_PDF_QA_SAMPLE_SEED,
): GuidePdfQaSampleRow[] {
  const ids = pickGuidePdfQaSampleIds(count, seed);
  const byId = new Map(uniqueGuideLibraryEntries().map((e) => [e.id, e]));
  return ids.map((guideId, index) => {
    const entry = byId.get(guideId);
    const assignee: "tina" | "evelyn" = index < Math.ceil(ids.length / 2) ? "tina" : "evelyn";
    const caseId = guideReviewCaseIdForGuide(guideId) ?? `GUIDE-REV-launch-${guideId}`;
    return {
      guideId,
      guideNumber: formatGuideNumber(guideId),
      name: entry?.name ?? guideId,
      assignee,
      caseId,
    };
  });
}

/** Checklist pasted into GUIDE-REV / Task notes for PDF parity QA. */
export function guidePdfQaChecklist(row: GuidePdfQaSampleRow): string {
  return [
    `PDF / content QA sample (${GUIDE_PDF_QA_SAMPLE_SEED})`,
    `Guide ${row.guideNumber} — ${row.name} (${row.guideId})`,
    `Assignee: ${row.assignee}`,
    `Linked test: ${row.caseId}`,
    "",
    "Verify:",
    "1) Open Guide Library → this guide.",
    "2) Review all 7 prep tabs in order: Show All, About, Suggested Pricing, Supply List, Tools, Steps, and Revenue Calculator — open each dedicated tab (not only Show All).",
    "3) Confirm name, About, Tools, Steps, Suggested Pricing, and Supply List match what you expect (incl. any Admin edits).",
    "4) Download PDF — title, prereqs, tools, supplies, pricing, and steps must match the on-screen guide (not stale code-only kit).",
    "5) If mismatch: Fail the GUIDE-REV test with note listing the field(s); assign Evelyn for fix.",
    "6) If OK: Pass / mark Done and note “PDF matches library”.",
  ].join("\n");
}
