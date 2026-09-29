import { describe, expect, it } from 'vitest';
import {
  AUTOMATED_PLAYWRIGHT_SEEDS,
  AUTOMATED_TEST_SEEDS,
  AUTOMATED_VITEST_SEEDS,
  PLAYWRIGHT_COMMAND,
  VITEST_COMMAND,
  isAutomatedCatalogId,
} from '../automatedTests';
import { allSeedQaTests, INITIAL_QA_TESTS } from '../workBoard';
import { suiteForQaTest } from '../testSuites';

describe('automatedTests catalog', () => {
  it('keeps Vitest and Playwright catalogs separate from manual QA seeds', () => {
    expect(AUTOMATED_VITEST_SEEDS.every((seed) => seed.suite === 'vitest')).toBe(true);
    expect(AUTOMATED_PLAYWRIGHT_SEEDS.every((seed) => seed.suite === 'playwright')).toBe(true);
    expect(AUTOMATED_VITEST_SEEDS.every((seed) => seed.command === VITEST_COMMAND)).toBe(true);
    expect(AUTOMATED_PLAYWRIGHT_SEEDS.every((seed) => seed.command === PLAYWRIGHT_COMMAND)).toBe(true);
    const ids = AUTOMATED_TEST_SEEDS.map((seed) => seed.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(INITIAL_QA_TESTS.some((test) => ids.includes(test.id))).toBe(false);
  });

  it('seeds the work board with all three suites and unique ids', () => {
    const seeded = allSeedQaTests();
    const vitest = seeded.filter((test) => suiteForQaTest(test) === 'vitest');
    const playwright = seeded.filter((test) => suiteForQaTest(test) === 'playwright');
    const manual = seeded.filter((test) => suiteForQaTest(test) === 'manual');
    expect(manual.length).toBe(INITIAL_QA_TESTS.length);
    expect(vitest.length).toBe(AUTOMATED_VITEST_SEEDS.length);
    expect(playwright.length).toBe(AUTOMATED_PLAYWRIGHT_SEEDS.length);
    expect(vitest.every((test) => test.assignee === 'vitest')).toBe(true);
    expect(playwright.every((test) => test.assignee === 'playwright')).toBe(true);
    expect(manual.every((test) => test.assignee === 'qa' || ['angela', 'evelyn', 'dev', 'unassigned'].includes(test.assignee))).toBe(true);
    expect(manual.some((test) => test.assignee === 'qa')).toBe(true);
  });
});
