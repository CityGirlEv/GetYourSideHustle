/**
 * Fixed card numbers shown before titles in Admin Studio
 * (Testing Portal, Task List, Content Factory, Schedule).
 *
 * - CF items: CF-001… (calendar pin via softLaunchItemRef)
 * - GUIDE-REV tests / T-LG tasks: library guide # (pinned)
 * - Numeric T-### tasks: T-###
 * - Soft-launch tasks: CF-### of the linked factory item
 * - Named seeded tasks (T-MEM-*, T-SOC-*, …): stable T-8xx
 * - Catalog tests: unique TST-### from sorted catalog (append-only)
 * - Anything else: deterministic fallback so the badge is never blank
 */

import { AUTOMATED_PLAYWRIGHT_CASES, AUTOMATED_VITEST_CASES } from "./gysh-automated-tests";
import { guideNumberLabel } from "./guide-numbers";
import { guideIdFromGuideReviewCaseId } from "./guide-review-link";
import {
  softLaunchItemFromTaskId,
  softLaunchItemRef,
  softLaunchItemById,
} from "./gysh-soft-launch-rollout";
import { GUIDE_REVIEW_CASES } from "./gysh-guide-review-cases";
import { MEMBERSHIP_TIERS } from "./membership";
import { SOCIAL_ANALYTICS_CHANNELS } from "./social-analytics-review-tasks";
import { TEST_CASES } from "./gysh-test-plan";

/** Literal ids — do not import from gysh-tasks (circular: tasks → sprint-board → here). */
const SENIOR_PAGE_REVIEW_TASK_ID = "T-SENIOR-PAGE";
const MILITARY_VETERAN_CALLOUT_TASK_ID = "T-MEM-MILITARY";

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

/** Deterministic 3-digit slot in a reserved band (avoids blank badges). */
function stableSlot(id: string, bandStart: number, bandSize: number): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return bandStart + (Math.abs(h) % bandSize);
}

/** Content Factory card number (CF-009). */
export function cfCardNumber(itemId: string): string {
  const id = String(itemId || "").trim();
  if (!id) return "";
  if (/^CF-\d+$/i.test(id)) {
    const m = /^CF-(\d+)$/i.exec(id);
    return m ? `CF-${pad3(Number(m[1]))}` : id.toUpperCase();
  }
  return softLaunchItemRef(id) || softLaunchItemRef(softLaunchItemById(id)?.id || "") || "";
}

/** Build stable TST-### map for non–GUIDE-REV catalog tests (append new ids at end). */
const TST_NUMBER_BY_ID: Record<string, string> = (() => {
  const ids = new Set<string>();
  for (const t of TEST_CASES) ids.add(t.id);
  for (const t of GUIDE_REVIEW_CASES) ids.add(t.id);
  for (const t of AUTOMATED_VITEST_CASES) ids.add(t.id);
  for (const t of AUTOMATED_PLAYWRIGHT_CASES) ids.add(t.id);
  const nonGuide = [...ids]
    .filter((id) => !guideIdFromGuideReviewCaseId(id))
    .sort((a, b) => a.localeCompare(b));
  const out: Record<string, string> = {};
  nonGuide.forEach((id, i) => {
    out[id] = `TST-${pad3(i + 1)}`;
  });
  return out;
})();

/**
 * Seeded Task List ids that are not T-### / T-LG-* / soft-launch.
 * Display numbers live in T-801… so they never collide with nextTaskId() sequences.
 */
const NAMED_TASK_NUMBER_BY_ID: Record<string, string> = (() => {
  const ids = new Set<string>([
    SENIOR_PAGE_REVIEW_TASK_ID,
    MILITARY_VETERAN_CALLOUT_TASK_ID,
    ...MEMBERSHIP_TIERS.map((t) => `T-MEM-${t.id.toUpperCase()}`),
    ...SOCIAL_ANALYTICS_CHANNELS.map((c) => c.taskId),
  ]);
  const sorted = [...ids].sort((a, b) => a.localeCompare(b));
  const out: Record<string, string> = {};
  sorted.forEach((id, i) => {
    out[id] = `T-${pad3(801 + i)}`;
  });
  return out;
})();

/**
 * Testing Portal card number shown before the title.
 * GUIDE-REV → #018 (guide pin). Others → unique catalog TST-### (preferred over
 * embedded digits so AUTH-001 / JOIN-001 / NAV-001 are not all TST-001).
 */
export function testCardNumber(testId: string): string {
  const id = String(testId || "").trim();
  if (!id) return "";
  const guideId = guideIdFromGuideReviewCaseId(id);
  if (guideId) return guideNumberLabel(guideId) || "";
  if (TST_NUMBER_BY_ID[id]) return TST_NUMBER_BY_ID[id];
  const embedded = /(?:^|-)(\d{2,4})(?:-|$)/.exec(id);
  if (embedded) return `TST-${pad3(Number(embedded[1]))}`;
  return `TST-${pad3(stableSlot(id, 900, 100))}`;
}

/**
 * Task List card number shown before the title/description.
 * T-018 → T-018; T-LG-* → guide #; soft-launch → CF-###; named seeds → T-8xx.
 */
export function taskCardNumber(taskId: string): string {
  const id = String(taskId || "").trim();
  if (!id) return "";
  const exact = /^T-(\d+)$/i.exec(id);
  if (exact) return `T-${pad3(Number(exact[1]))}`;
  if (id.startsWith("T-LG-")) {
    const guideId = id.slice("T-LG-".length).trim();
    const num = guideNumberLabel(guideId);
    if (num) return num;
  }
  const fromCf = softLaunchItemFromTaskId(id);
  if (fromCf) {
    const ref = softLaunchItemRef(fromCf.id);
    if (ref) return ref;
  }
  if (NAMED_TASK_NUMBER_BY_ID[id]) return NAMED_TASK_NUMBER_BY_ID[id];
  const embedded = /(?:^|-)(\d{2,4})(?:-|$)/.exec(id);
  if (embedded) return `T-${pad3(Number(embedded[1]))}`;
  return `T-${pad3(stableSlot(id, 850, 50))}`;
}

/** Prefix for a card title line: "CF-009 · My title" when a number exists. */
export function withCardNumberPrefix(numberLabel: string, title: string): string {
  const n = String(numberLabel || "").trim();
  const t = String(title || "").trim();
  if (!n) return t;
  if (!t) return n;
  if (t.startsWith(n)) return t;
  return `${n} · ${t}`;
}
