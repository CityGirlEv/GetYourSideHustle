import { describe, expect, it } from 'vitest';
import {
  INITIAL_BETA_GUIDE_ITEMS,
  addBetaGuideItem,
  applyBetaGuideItemPatch,
  betaGuideOffersHat,
  betaGuideOffersTee,
  createBetaGuideItem,
  isBetaTestingGuidePath,
  parseBetaGuideItem,
  parseBetaGuideItems,
  removeBetaGuideItem,
  BETA_TESTING_GUIDE_PATH,
  BETA_TESTING_GUIDE_TITLE,
} from '../betaTestingGuide';
import {
  betaGuideBlessingPickLabel,
  parseBetaGuideBlessingPick,
  toggleBetaGuideBlessingPick,
} from '../betaGuideBlessingPick';
import {
  BETA_TESTING_GUIDE_API_PATH,
  BETA_TESTING_GUIDE_STORAGE_KEY,
  buildBetaTestingGuideStorePayload,
  parseBetaTestingGuideStorePayload,
} from '../betaTestingGuideStore';

describe('betaTestingGuide', () => {
  it('seeds a living tester guide that blesses a tee and/or a hat', () => {
    expect(BETA_TESTING_GUIDE_TITLE).toBe('Beta Testing Guide');
    expect(INITIAL_BETA_GUIDE_ITEMS.some((item) => item.kind === 'step' && item.addedBy === 'Evelyn')).toBe(true);
    expect(betaGuideOffersTee(INITIAL_BETA_GUIDE_ITEMS)).toBe(true);
    expect(betaGuideOffersHat(INITIAL_BETA_GUIDE_ITEMS)).toBe(true);
    const blessing = INITIAL_BETA_GUIDE_ITEMS.find((item) => item.kind === 'blessing');
    expect(blessing?.perk).toBe('tee_or_hat');
    expect(blessing?.title).toMatch(/tee/i);
    expect(blessing?.title).toMatch(/hat/i);
    expect(isBetaTestingGuidePath(BETA_TESTING_GUIDE_PATH)).toBe(true);
    expect(isBetaTestingGuidePath('/beta-testing-guide')).toBe(true);
    expect(isBetaTestingGuidePath('/about')).toBe(false);
  });

  it('lets admins add and delete items so Angela can add ideas', () => {
    const idea = createBetaGuideItem('Angela', 1, 'idea');
    expect(idea).toMatchObject({
      id: 'bg-1',
      kind: 'idea',
      addedBy: 'Angela',
      perk: 'none',
    });
    const withIdea = addBetaGuideItem(INITIAL_BETA_GUIDE_ITEMS, idea);
    expect(withIdea).toHaveLength(INITIAL_BETA_GUIDE_ITEMS.length + 1);
    expect(addBetaGuideItem(withIdea, idea)).toHaveLength(withIdea.length);
    expect(removeBetaGuideItem(withIdea, idea.id).map((item) => item.id)).toEqual(
      INITIAL_BETA_GUIDE_ITEMS.map((item) => item.id),
    );
  });

  it('parses stored rows and patches kind, perk, and copy', () => {
    expect(parseBetaGuideItems(null)).toBeNull();
    expect(parseBetaGuideItem({ title: 'No id' })).toBeNull();
    const parsed = parseBetaGuideItems([
      { id: 'bg-a', title: '  Check Home  ', body: 'Tap every header link.', kind: 'step', addedBy: 'Angela' },
      { id: 'bg-a', title: 'duplicate id' },
      { id: 'bg-b', title: 'Hat only', kind: 'blessing', perk: 'hat' },
      { name: 'missing' },
    ]);
    expect(parsed?.map((item) => item.id)).toEqual(['bg-a', 'bg-b']);
    expect(parsed?.[0]).toMatchObject({ title: 'Check Home', kind: 'step', addedBy: 'Angela', perk: 'none' });
    expect(parsed?.[1]?.perk).toBe('hat');

    const patched = applyBetaGuideItemPatch(INITIAL_BETA_GUIDE_ITEMS[0]!, {
      title: 'Apply first',
      kind: 'blessing',
      perk: 'tee',
    });
    expect(patched).toMatchObject({ title: 'Apply first', kind: 'blessing', perk: 'tee' });
    expect(applyBetaGuideItemPatch(patched, { kind: 'idea' }).perk).toBe('none');
  });

  it('lets a tester pick a tee, a hat, or both', () => {
    const none = parseBetaGuideBlessingPick(null);
    expect(betaGuideBlessingPickLabel(none)).toBe('Not chosen yet');
    const tee = toggleBetaGuideBlessingPick(none, 'tee');
    expect(tee).toEqual({ tee: true, hat: false });
    expect(betaGuideBlessingPickLabel(tee)).toBe('Tee');
    const both = toggleBetaGuideBlessingPick(tee, 'hat');
    expect(betaGuideBlessingPickLabel(both)).toBe('Tee and hat');
    expect(toggleBetaGuideBlessingPick(both, 'tee')).toEqual({ tee: false, hat: true });
    expect(parseBetaGuideBlessingPick({ tee: 1, hat: 0 })).toEqual({ tee: true, hat: false });
  });

  it('builds a shared Admin payload for the living guide', () => {
    const payload = buildBetaTestingGuideStorePayload(
      INITIAL_BETA_GUIDE_ITEMS,
      'angela@myplannotmymood.com',
      new Date('2026-09-18T12:00:00.000Z'),
    );
    expect(payload.items).toHaveLength(INITIAL_BETA_GUIDE_ITEMS.length);
    expect(payload.updatedBy).toBe('angela@myplannotmymood.com');
    expect(payload.updatedAt).toBe('2026-09-18T12:00:00.000Z');
    expect(parseBetaTestingGuideStorePayload({ items: payload.items, updatedAt: payload.updatedAt })?.items[0]?.id).toBe(
      'bg-step-apply',
    );
    expect(parseBetaTestingGuideStorePayload(null)).toBeNull();
    expect(BETA_TESTING_GUIDE_API_PATH).toBe('/api/beta-testing-guide');
    expect(BETA_TESTING_GUIDE_STORAGE_KEY).toBe('myplan_beta_testing_guide_v1');
  });
});
