/**
 * Duplicate catalog cases so each human tester owns their own Testing Portal row.
 * - Calculator cases Lyriq already has → also Evelyn + Tina copies (original id stays Lyriq).
 * - Any case with multiple assignees → one case per assignee with -EVELYN / -TINA / -LYRIQ suffix.
 */

import { isHumanQaTester, type QaTesterId } from "./gysh-roles";
import type { TestCase } from "./gysh-test-plan";

const OWNER_SUFFIX_RE = /-(TINA|EVELYN|LYRIQ|CANDACE)$/i;

/** Strip -TINA / -EVELYN / -LYRIQ to get the logical catalog id. */
export function testCaseLogicalId(caseId: string): string {
  return caseId.replace(OWNER_SUFFIX_RE, "");
}

export function ownerSuffix(owner: QaTesterId): string {
  return owner.toUpperCase();
}

/** Cases Lyriq already runs that also need Evelyn + Tina calculator copies. */
export const CALCULATOR_CASES_TO_TRIPLE: readonly string[] = [
  "SCHED-PNL-001",
  "ADULT-002",
] as const;

export function isCalculatorCaseToTriple(caseId: string): boolean {
  return CALCULATOR_CASES_TO_TRIPLE.includes(testCaseLogicalId(caseId));
}

/**
 * Keep the original case (typically Lyriq) and add sibling copies for extra owners.
 */
export function addAssigneeCopies(
  base: TestCase,
  extraAssignees: QaTesterId[],
): TestCase[] {
  const extras = extraAssignees.filter((a) => !base.assignees.includes(a));
  return [
    { ...base, assignees: base.assignees.length ? [base.assignees[0]!] : base.assignees },
    ...extras.map((a) => ({
      ...base,
      id: `${base.id}-${ownerSuffix(a)}`,
      assignees: [a] as TestCase["assignees"],
      relatedTaskIds: relatedTaskIdsForOwnerCopy(base, a),
    })),
  ];
}

function relatedTaskIdsForOwnerCopy(base: TestCase, _owner: QaTesterId): string[] | undefined {
  // Schedule Suite / calculator QA is Testing Portal only — no Task List links.
  if (base.id.startsWith("SCHED-") || base.id === "ADULT-002") return undefined;
  return base.relatedTaskIds;
}

/** One Testing Portal case per assignee (suffixes the id). */
export function splitSharedAssignees(base: TestCase): TestCase[] {
  const owners = base.assignees.filter((a): a is QaTesterId => isHumanQaTester(String(a)));
  if (owners.length <= 1) {
    return [{ ...base, assignees: owners.length ? [owners[0]!] : base.assignees }];
  }
  return owners.map((a) => ({
    ...base,
    id: `${base.id}-${ownerSuffix(a)}`,
    assignees: [a] as TestCase["assignees"],
  }));
}

/**
 * Expand the raw catalog:
 * 1) Calculator cases → Lyriq original + Evelyn + Tina copies
 * 2) Multi-assignee cases → one case per assignee
 */
export function expandCatalogCasesForSingleAssignees(cases: TestCase[]): TestCase[] {
  const out: TestCase[] = [];
  const seen = new Set<string>();

  for (const raw of cases) {
    let expanded: TestCase[];
    if (isCalculatorCaseToTriple(raw.id) && raw.assignees.length === 1) {
      expanded = addAssigneeCopies(raw, ["evelyn", "tina"]);
    } else if (raw.assignees.length > 1) {
      expanded = splitSharedAssignees(raw);
    } else {
      expanded = [raw];
    }

    for (const c of expanded) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      out.push(c);
    }
  }
  return out;
}
