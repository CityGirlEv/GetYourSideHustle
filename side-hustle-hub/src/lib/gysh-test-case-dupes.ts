/**
 * Duplicate catalog cases so each human tester owns their own Testing Portal row.
 * - Calculator cases Lyriq already has → also Evelyn + Tina copies (original id stays Lyriq).
 * - Any case with multiple assignees → one case per assignee with -EVELYN / -TINA / -LYRIQ suffix.
 */

import { isHumanQaTester, type QaTesterId } from "./gysh-roles";
import type { TestCase } from "./gysh-test-plan";

const OWNER_SUFFIX_RE = /-(TINA|EVELYN|LYRIQ|CANDACE|MILFORD|BRENDA)$/i;
const OWNER_NAME_IN_TITLE_RE =
  /\b(tina|evelyn|lyriq|candace|milford|brenda)\b/gi;

/** Strip -TINA / -EVELYN / -LYRIQ to get the logical catalog id. */
export function testCaseLogicalId(caseId: string): string {
  return caseId.replace(OWNER_SUFFIX_RE, "");
}

/** Normalize titles so “Proofread: Home (Tina)” matches “Proofread: Home (Lyriq)”. */
export function normalizeTestTitleForMatch(title: string): string {
  return String(title || "")
    .toLowerCase()
    .replace(OWNER_NAME_IN_TITLE_RE, "")
    .replace(/[()[\]{}·|/_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type SiblingTestRef = {
  id: string;
  title: string;
  assignees: string[];
  /** How this sibling was matched. */
  via: "logical_id" | "title";
};

/**
 * Other catalog cases that are the same work under a different owner/name
 * (e.g. MEMBER-STRIPE-001-EVELYN ↔ MEMBER-STRIPE-001-CANDACE, PROOF-001-TINA ↔ PROOF-001-LYRIQ).
 */
export function siblingTestCases(
  caseId: string,
  catalog: ReadonlyArray<Pick<TestCase, "id" | "title" | "assignees" | "expected">>,
  index?: SiblingCatalogIndex,
): SiblingTestRef[] {
  const id = String(caseId || "").trim();
  if (!id) return [];
  if (index) return index.byId.get(id) ?? [];

  const self = catalog.find((c) => c.id === id);
  const logical = testCaseLogicalId(id);
  const byLogical = catalog
    .filter((c) => c.id !== id && testCaseLogicalId(c.id) === logical)
    .map((c) => ({
      id: c.id,
      title: c.title,
      assignees: [...c.assignees],
      via: "logical_id" as const,
    }));
  if (byLogical.length > 0) {
    return byLogical.sort((a, b) => a.id.localeCompare(b.id));
  }

  if (!self) return [];
  const titleKey = normalizeTestTitleForMatch(self.title);
  if (titleKey.length < 10) return [];
  const expected = String(self.expected || "").trim();
  return catalog
    .filter((c) => {
      if (c.id === id) return false;
      if (normalizeTestTitleForMatch(c.title) !== titleKey) return false;
      // Same expected outcome = same procedure with a different owner/name.
      if (expected && String(c.expected || "").trim() !== expected) return false;
      return true;
    })
    .map((c) => ({
      id: c.id,
      title: c.title,
      assignees: [...c.assignees],
      via: "title" as const,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Precompute siblings once — avoids O(n²) work per Testing Portal row. */
export type SiblingCatalogIndex = {
  byId: Map<string, SiblingTestRef[]>;
};

export function buildSiblingCatalogIndex(
  catalog: ReadonlyArray<Pick<TestCase, "id" | "title" | "assignees" | "expected">>,
): SiblingCatalogIndex {
  type CaseRef = Pick<TestCase, "id" | "title" | "assignees" | "expected">;
  const byLogical = new Map<string, CaseRef[]>();
  const byTitleExpected = new Map<string, CaseRef[]>();

  for (const c of catalog) {
    const logical = testCaseLogicalId(c.id);
    const logicalBucket = byLogical.get(logical);
    if (logicalBucket) logicalBucket.push(c);
    else byLogical.set(logical, [c]);

    const titleKey = normalizeTestTitleForMatch(c.title);
    if (titleKey.length < 10) continue;
    const expected = String(c.expected || "").trim();
    const teKey = `${titleKey}\n${expected}`;
    const teBucket = byTitleExpected.get(teKey);
    if (teBucket) teBucket.push(c);
    else byTitleExpected.set(teKey, [c]);
  }

  const byId = new Map<string, SiblingTestRef[]>();
  for (const c of catalog) {
    const logical = testCaseLogicalId(c.id);
    const logicalPeers = (byLogical.get(logical) ?? []).filter((x) => x.id !== c.id);
    let peers = logicalPeers;
    let via: SiblingTestRef["via"] = "logical_id";
    if (peers.length === 0) {
      const titleKey = normalizeTestTitleForMatch(c.title);
      if (titleKey.length >= 10) {
        const expected = String(c.expected || "").trim();
        peers = (byTitleExpected.get(`${titleKey}\n${expected}`) ?? []).filter(
          (x) => x.id !== c.id,
        );
        via = "title";
      }
    }
    byId.set(
      c.id,
      peers
        .map((p) => ({
          id: p.id,
          title: p.title,
          assignees: [...p.assignees],
          via,
        }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    );
  }
  return { byId };
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
