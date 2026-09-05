/**
 * Testing Portal suites: Manual (human QA) vs Vitest vs Playwright.
 * Human assignee chips must never include automated suite rows.
 */

export const TEST_SUITES = ['manual', 'vitest', 'playwright'] as const;
export type TestSuite = (typeof TEST_SUITES)[number];

export const SUITE_LABELS: Record<TestSuite, string> = {
  manual: 'Manual',
  vitest: 'Vitest',
  playwright: 'Playwright',
};

export const SUITE_DETAILS: Record<TestSuite, string> = {
  manual: 'Human walkthroughs for Angela and Evelyn',
  vitest: 'Unit tests — bun run test',
  playwright: 'Browser e2e — bun run e2e',
};

export const SUITE_ACCENTS: Record<TestSuite, string> = {
  manual: '#C2410C',
  vitest: '#2563EB',
  playwright: '#7C3AED',
};

export const HUMAN_QA_ASSIGNEE_IDS = ['angela', 'evelyn', 'dev', 'qa', 'unassigned'] as const;

export function isTestSuite(value: unknown): value is TestSuite {
  return typeof value === 'string' && (TEST_SUITES as readonly string[]).includes(value);
}

export function suiteFromQaId(id: string): TestSuite | null {
  const root = String(id || '').split('::')[0].trim();
  if (/^VT-/i.test(root) || /^vitest-/i.test(root)) return 'vitest';
  if (/^PW-/i.test(root) || /^pw-/i.test(root) || /^playwright-/i.test(root)) return 'playwright';
  return null;
}

export function suiteForQaTest(test: { id?: string; suite?: string; category?: string }): TestSuite {
  if (isTestSuite(test.suite)) return test.suite;
  const fromId = suiteFromQaId(String(test.id || ''));
  if (fromId) return fromId;
  const category = String(test.category || '').trim().toLowerCase();
  if (category === 'vitest') return 'vitest';
  if (category === 'playwright') return 'playwright';
  return 'manual';
}

export function isAutomatedSuite(suite: TestSuite): boolean {
  return suite === 'vitest' || suite === 'playwright';
}

export function isAutomatedQaTest(test: { id?: string; suite?: string; category?: string }): boolean {
  return isAutomatedSuite(suiteForQaTest(test));
}

export function isHumanQaAssignee(assignee: string): boolean {
  return (HUMAN_QA_ASSIGNEE_IDS as readonly string[]).includes(assignee);
}

/**
 * Date.now() fallback ids and leaked checklist/note rows that inflated the board
 * into thousands of fake “tests” on Angela / Evelyn chips.
 */
export function isInflatedQaId(id: string): boolean {
  const root = String(id || '').split('::')[0].trim();
  if (/^qa-\d{12,}$/i.test(root)) return true;
  if (/^s-[a-z0-9-]+-\d+$/i.test(root)) return true;
  if (/^n-[a-z0-9]+/i.test(root)) return true;
  return false;
}

export function inflatedQaIdsFromRaw(rawList: unknown): string[] {
  if (!Array.isArray(rawList)) return [];
  const ids: string[] = [];
  for (const item of rawList) {
    if (!item || typeof item !== 'object') continue;
    const id = String((item as { id?: unknown }).id ?? '').trim();
    if (id && isInflatedQaId(id)) ids.push(id);
  }
  return ids;
}

export function pruneInflatedQaTests<T extends { id: string }>(tests: T[]): {
  tests: T[];
  removedIds: string[];
} {
  const removedIds: string[] = [];
  const kept: T[] = [];
  for (const test of tests) {
    if (isInflatedQaId(test.id)) removedIds.push(test.id);
    else kept.push(test);
  }
  return { tests: kept, removedIds };
}

export function matchesSuiteFilter(
  test: { id?: string; suite?: string; category?: string },
  selected: Set<TestSuite>,
): boolean {
  if (selected.size === 0) return true;
  return selected.has(suiteForQaTest(test));
}

export function defaultQaSuiteFilter(): Set<TestSuite> {
  return new Set(['manual']);
}

export function isTestingSuiteNavSelected(
  activeTab: string,
  suite: TestSuite,
  filter: ReadonlySet<TestSuite>,
): boolean {
  return activeTab === 'testing' && filter.size === 1 && filter.has(suite);
}

export function boardTabCountLabel(done: number, total: number): string {
  return `${done}/${total}`;
}

export function buildSuiteChipCounts<
  T extends { id?: string; suite?: string; category?: string; status: string },
>(
  items: T[],
  isDone: (item: T) => boolean,
): Array<{ id: TestSuite; label: string; total: number; done: number; accent: string; detail: string }> {
  return TEST_SUITES.map((suite) => {
    const matched = items.filter((item) => suiteForQaTest(item) === suite);
    return {
      id: suite,
      label: SUITE_LABELS[suite],
      detail: SUITE_DETAILS[suite],
      total: matched.length,
      done: matched.filter(isDone).length,
      accent: SUITE_ACCENTS[suite],
    };
  });
}
