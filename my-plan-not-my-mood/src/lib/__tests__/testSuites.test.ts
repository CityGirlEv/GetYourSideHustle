import { describe, expect, it } from 'vitest';
import {
  buildSuiteChipCounts,
  defaultQaSuiteFilter,
  inflatedQaIdsFromRaw,
  isAutomatedQaTest,
  isHumanQaAssignee,
  isInflatedQaId,
  isTestingSuiteNavSelected,
  isTestingSuiteSubNavOpen,
  matchesSuiteFilter,
  pruneInflatedQaTests,
  suiteForQaTest,
  suiteFromQaId,
  boardTabCountLabel,
} from '../testSuites';

describe('testSuites', () => {
  it('classifies Vitest and Playwright ids separately from manual QA', () => {
    expect(suiteFromQaId('VT-AUTH-001')).toBe('vitest');
    expect(suiteFromQaId('PW-HOME-001')).toBe('playwright');
    expect(suiteFromQaId('qa1')).toBeNull();
    expect(suiteForQaTest({ id: 'qa1' })).toBe('manual');
    expect(suiteForQaTest({ id: 'custom', suite: 'vitest' })).toBe('vitest');
    expect(suiteForQaTest({ id: 'custom', category: 'Playwright' })).toBe('playwright');
    expect(isAutomatedQaTest({ id: 'VT-BOARD-001' })).toBe(true);
    expect(isAutomatedQaTest({ id: 'gear-sel-qa1' })).toBe(false);
  });

  it('does not count automated rows as Angela or Evelyn work', () => {
    expect(isHumanQaAssignee('angela')).toBe(true);
    expect(isHumanQaAssignee('evelyn')).toBe(true);
    expect(isHumanQaAssignee('unassigned')).toBe(true);
    expect(isHumanQaAssignee('vitest')).toBe(false);
    expect(isHumanQaAssignee('playwright')).toBe(false);
  });

  it('prunes timestamp and leaked checklist ids that inflated the 3132 count', () => {
    expect(isInflatedQaId('qa-1788384351510')).toBe(true);
    expect(isInflatedQaId('s-qa1-1')).toBe(true);
    expect(isInflatedQaId('qa1')).toBe(false);
    expect(isInflatedQaId('VT-AUTH-001')).toBe(false);
    const pruned = pruneInflatedQaTests([
      { id: 'qa1', title: 'Hero' },
      { id: 'qa-1788384351510', title: 'Junk' },
      { id: 's-aff-qa1-3', title: 'Step leaked' },
    ]);
    expect(pruned.tests.map((row) => row.id)).toEqual(['qa1']);
    expect(pruned.removedIds).toEqual(['qa-1788384351510', 's-aff-qa1-3']);
    expect(inflatedQaIdsFromRaw([
      { id: 'qa1' },
      { id: 'qa-1788384351510' },
    ])).toEqual(['qa-1788384351510']);
  });

  it('defaults the portal to Manual so Vitest/Playwright do not land on people chips', () => {
    const manual = defaultQaSuiteFilter();
    expect([...manual]).toEqual(['manual']);
    expect(matchesSuiteFilter({ id: 'qa1' }, manual)).toBe(true);
    expect(matchesSuiteFilter({ id: 'VT-AUTH-001' }, manual)).toBe(false);
    expect(matchesSuiteFilter({ id: 'VT-AUTH-001' }, new Set())).toBe(true);

    const chips = buildSuiteChipCounts(
      [
        { id: 'qa1', status: 'passed' },
        { id: 'qa2', status: 'untested' },
        { id: 'VT-AUTH-001', status: 'passed' },
        { id: 'PW-HOME-001', status: 'untested' },
      ],
      (item) => item.status === 'passed',
    );
    expect(chips.find((chip) => chip.id === 'manual')).toMatchObject({ total: 2, done: 1 });
    expect(chips.find((chip) => chip.id === 'vitest')).toMatchObject({ total: 1, done: 1 });
    expect(chips.find((chip) => chip.id === 'playwright')).toMatchObject({ total: 1, done: 0 });
  });

  it('selects Manual, Vitest, and Playwright as Testing sub-tabs', () => {
    const manual = defaultQaSuiteFilter();
    expect(isTestingSuiteNavSelected('testing', 'manual', manual)).toBe(true);
    expect(isTestingSuiteNavSelected('testing', 'vitest', manual)).toBe(false);
    expect(isTestingSuiteNavSelected('tasks', 'manual', manual)).toBe(false);
    expect(isTestingSuiteNavSelected('testing', 'vitest', new Set(['vitest']))).toBe(true);
    expect(isTestingSuiteNavSelected('testing', 'playwright', new Set(['playwright']))).toBe(true);
    expect(isTestingSuiteSubNavOpen('testing')).toBe(true);
    expect(isTestingSuiteSubNavOpen('tasks')).toBe(false);
    expect(isTestingSuiteSubNavOpen('plan')).toBe(false);
    expect(boardTabCountLabel(0, 9)).toBe('0/9');
    expect(boardTabCountLabel(3, 44)).toBe('3/44');
  });
});
