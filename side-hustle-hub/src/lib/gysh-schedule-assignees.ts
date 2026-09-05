/**
 * Schedule & Plan assignee chips / filters — live QA roster + accurate test ownership.
 */

import {
  PARTNER_ASSIGNEES,
  assigneeIncludes,
  partnerAssigneesWithExtras,
  requiresPartnerDone,
} from "./gysh-tasks";
import { normalizeProgressAssignee } from "./daily-progress-report";
import { testOwnerLabel, type QaTester } from "./gysh-roles";
import { testerFilterOwnersForCase } from "./gysh-tester-ownership";
import type { TestCase } from "./gysh-test-plan";

export type ScheduleOwnerFilter = "all" | "Both" | "Unassigned" | string;

export type ScheduleOwnerBubble = {
  id: ScheduleOwnerFilter;
  label: string;
  accent?: string;
};

const BOTH_ACCENT = "#181718";
const UNASSIGNED_ACCENT = "#7a7064";

/** Assignee filter chips: All + live QA people + Both + Unassigned. */
export function scheduleOwnerBubbles(
  qaTesters: readonly QaTester[],
): ScheduleOwnerBubble[] {
  const people = partnerAssigneesWithExtras(qaTesters.map((t) => t.shortName));
  const bubbles: ScheduleOwnerBubble[] = [{ id: "all", label: "All assignees" }];
  for (const name of people) {
    const tester = qaTesters.find((t) => t.shortName.toLowerCase() === name.toLowerCase());
    bubbles.push({
      id: name,
      label: name,
      accent: tester?.accent,
    });
  }
  // Fill core partner accents when qaTesters offline / missing accent
  const accentByName: Record<string, string> = {
    Tina: "#9B2F28",
    Evelyn: "#947D64",
    Lyriq: "#2e7d32",
    Candace: "#3d6b8c",
  };
  for (const b of bubbles) {
    if (b.id === "all") continue;
    if (!b.accent && accentByName[b.label]) b.accent = accentByName[b.label];
  }
  bubbles.push({ id: "Both", label: "Both", accent: BOTH_ACCENT });
  bubbles.push({ id: "Unassigned", label: "Unassigned", accent: UNASSIGNED_ACCENT });
  return bubbles;
}

/** Progress-meter rows (no All). */
export function scheduleAssigneeProgressPeople(
  qaTesters: readonly QaTester[],
): { label: string; accent: string }[] {
  return scheduleOwnerBubbles(qaTesters)
    .filter((b) => b.id !== "all")
    .map((b) => ({
      label: b.label,
      accent: b.accent || UNASSIGNED_ACCENT,
    }));
}

/**
 * Display names that own a test for Schedule filters (matches Testing Portal:
 * current assignee + Fail/Blocked original tester).
 */
export function scheduleTestOwnerLabels(
  test: Pick<TestCase, "id" | "suite" | "assignees">,
  dbAssignee: string | null | undefined,
  originalAssignee: string | null | undefined,
  status: string | null | undefined,
  qaTesters: readonly QaTester[],
): string[] {
  const ids = testerFilterOwnersForCase(test, dbAssignee, originalAssignee, status);
  if (ids.length === 0) return ["Unassigned"];
  return ids.map((id) => testOwnerLabel(id, qaTesters));
}

export function matchesScheduleAssigneeFilter(
  ownerValue: string,
  owner: ScheduleOwnerFilter,
  knownPeople: readonly string[] = PARTNER_ASSIGNEES,
  /** When set (tests), match if any listed owner matches the filter. */
  alternateOwners?: readonly string[],
): boolean {
  if (owner === "all") return true;
  const candidates =
    alternateOwners && alternateOwners.length > 0
      ? alternateOwners
      : [normalizeProgressAssignee(ownerValue)];
  if (owner === "Unassigned") {
    return candidates.some((v) => normalizeProgressAssignee(v) === "Unassigned");
  }
  if (owner === "Both") {
    return candidates.some((v) => {
      const n = normalizeProgressAssignee(v);
      return requiresPartnerDone(n) || n === "Both";
    });
  }
  return candidates.some((v) => {
    const n = normalizeProgressAssignee(v);
    return (
      n.toLowerCase() === String(owner).toLowerCase() ||
      assigneeIncludes(n, owner, knownPeople)
    );
  });
}
