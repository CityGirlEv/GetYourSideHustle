import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_HOME_PAGE_COPY,
  HOME_PAGE_COPY_STORAGE_KEY,
  HOME_PILLAR_COUNT,
  homePageCopyEquals,
  loadHomePageCopy,
  mergeHomePageCopy,
  parseHomePageCopy,
  patchHomePageCopy,
  patchHomePagePillar,
  persistHomePageCopy,
  quoteParts,
  resetHomePageCopy,
} from '../homePageCopy';

describe('homePageCopy', () => {
  afterEach(() => {
    localStorage.removeItem(HOME_PAGE_COPY_STORAGE_KEY);
  });

  it('keeps the mockup home phrases as defaults', () => {
    expect(DEFAULT_HOME_PAGE_COPY.titleLead).toBe('MY PLAN,');
    expect(DEFAULT_HOME_PAGE_COPY.titleAccent).toBe('NOT MY MOOD.');
    expect(DEFAULT_HOME_PAGE_COPY.feelIt).toMatch(/feel it\. follow the plan anyway/i);
    expect(DEFAULT_HOME_PAGE_COPY.primaryCta).toBe('EXPLORE THE MOVEMENT');
    expect(DEFAULT_HOME_PAGE_COPY.secondaryCta).toBe('SHOP THE COLLECTION');
    expect(DEFAULT_HOME_PAGE_COPY.overlayScript).toBe('Purpose Looks Good On You.');
    expect(DEFAULT_HOME_PAGE_COPY.pillars).toHaveLength(HOME_PILLAR_COUNT);
    expect(DEFAULT_HOME_PAGE_COPY.movementTitle).toBe('A Movement for Real Life.');
    expect(DEFAULT_HOME_PAGE_COPY.quote).toMatch(/freedom you want tomorrow/i);
  });

  it('parses overlays and ignores junk, empty strings, and extra pillars', () => {
    const parsed = parseHomePageCopy({
      lede: '  New lede  ',
      pillars: ['Wear it', '', 'Tools', 'Extra ignored'],
      unknown: 'nope',
      quoteEmphasis: '   ',
    });
    expect(parsed.lede).toBe('New lede');
    expect(parsed.kicker).toBe(DEFAULT_HOME_PAGE_COPY.kicker);
    expect(parsed.pillars).toEqual([
      'Wear it',
      DEFAULT_HOME_PAGE_COPY.pillars[1],
      'Tools',
      'Extra ignored',
      DEFAULT_HOME_PAGE_COPY.pillars[4],
    ]);
    expect(
      parseHomePageCopy({
        pillars: ['Wear it', '', 'Tools', 'Kept fourth', 'Kept fifth', 'too many'],
      }).pillars,
    ).toEqual(['Wear it', DEFAULT_HOME_PAGE_COPY.pillars[1], 'Tools', 'Kept fourth', 'Kept fifth']);
    expect(parsed.quoteEmphasis).toBe(DEFAULT_HOME_PAGE_COPY.quoteEmphasis);
    expect(parseHomePageCopy('bad')).toEqual(DEFAULT_HOME_PAGE_COPY);
  });

  it('patches a single field or pillar and round-trips through storage', () => {
    const patched = patchHomePageCopy(DEFAULT_HOME_PAGE_COPY, { primaryCta: 'See the movement' });
    expect(patched.primaryCta).toBe('See the movement');
    expect(patchHomePagePillar(patched, 0, 'Wear it out').pillars[0]).toBe('Wear it out');
    expect(patchHomePagePillar(patched, 9, 'nope').pillars).toEqual(patched.pillars);

    persistHomePageCopy(patched);
    expect(loadHomePageCopy().primaryCta).toBe('See the movement');
    expect(homePageCopyEquals(loadHomePageCopy(), mergeHomePageCopy({ primaryCta: 'See the movement' }))).toBe(true);
    expect(resetHomePageCopy()).toEqual(DEFAULT_HOME_PAGE_COPY);
    expect(loadHomePageCopy()).toEqual(DEFAULT_HOME_PAGE_COPY);
  });

  it('splits the quote so the emphasis word can stay italic', () => {
    expect(quoteParts(DEFAULT_HOME_PAGE_COPY)).toEqual({
      before: 'Discipline today creates the ',
      emphasis: 'freedom',
      after: ' you want tomorrow.',
    });
    expect(quoteParts({ quote: 'Stay the course.', quoteEmphasis: 'missing' })).toEqual({
      before: 'Stay the course.',
      emphasis: '',
      after: '',
    });
  });
});
