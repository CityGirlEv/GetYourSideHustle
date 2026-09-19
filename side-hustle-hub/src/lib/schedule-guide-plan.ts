/**
 * Map Launch Guide playbook steps onto Schedule Suite Plan tracker rows.
 * Kept out of hustle-schedule.ts so catalog ↔ schedule imports stay one-way.
 */
import { resolveLaunchGuideData } from "./resolve-launch-guide-data";

export type ScheduleGuideStep = {
  title: string;
  desc: string;
};

export const GUIDE_STEP_BLOCK_PREFIX = "gs-";

export function guideStepBlockId(stepNumber: number): string {
  return `${GUIDE_STEP_BLOCK_PREFIX}${Math.max(1, Math.floor(stepNumber))}`;
}

export function isGuideStepBlockId(id: string): boolean {
  return /^gs-\d+$/.test(String(id || "").trim());
}

/** 0-based Steps-tab index for a Plan tracker `gs-N` row. */
export function guideStepIndexFromBlockId(id: string): number | null {
  const m = /^gs-(\d+)$/.exec(String(id || "").trim());
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isInteger(n) && n >= 1 ? n - 1 : null;
}

/** Same persist key the Launch Guide Steps tab uses (`{guideId}-{stepIndex}`). */
export function launchGuideStepProgressKey(guideId: string, stepIndex: number): string {
  return `${String(guideId || "").trim()}-${Math.max(0, Math.floor(stepIndex))}`;
}

/** Full playbook the member sees on the Launch Guide Steps tab. */
export function playbookStepsForSchedule(hustleId: string): ScheduleGuideStep[] {
  const id = String(hustleId || "").trim();
  if (!id) return [];
  const guide = resolveLaunchGuideData(id, []);
  return (guide.steps ?? []).map((s) => ({ title: s.title, desc: s.desc }));
}

/** Default minutes for a tracker row — lighter on wrap-up / review steps. */
export function minutesForGuideStep(title: string, isLast: boolean): number {
  if (isLast) return 30;
  const t = String(title || "").toLowerCase();
  if (/ask for (a )?review|rest & plan|wrap.?up|celebrate/.test(t)) return 30;
  if (/parent thumbs|run this by your parent/.test(t)) return 20;
  return 45;
}
