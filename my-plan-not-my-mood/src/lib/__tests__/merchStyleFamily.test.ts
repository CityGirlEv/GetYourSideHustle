import { describe, expect, it } from 'vitest';
import {
  groupByMerchStyleFamily,
  merchStyleFamilyFromName,
  namedMerchStyleFamily,
  splitMerchNameTokens,
  suggestedStyleNameFromFile,
} from '../merchStyleFamily';

describe('merchStyleFamily', () => {
  it('gives each distinctive style its own collection and keeps tee/hoodie together', () => {
    expect(splitMerchNameTokens('E-ShirtLebberingBeige')).toEqual(['E', 'Shirt', 'Lebbering', 'Beige']);
    expect(merchStyleFamilyFromName('E-ShirtLebberingBeige.png')).toEqual({
      familyId: 'lebbering-beige',
      familyLabel: 'Lebbering Beige Collection',
    });
    expect(merchStyleFamilyFromName('TShirtTieDieRainbowSpiral.jpg')).toEqual({
      familyId: 'tie-die-rainbow-spiral',
      familyLabel: 'Tie Die Rainbow Spiral Collection',
    });
    expect(merchStyleFamilyFromName('HoodieLebberingBeige.png').familyId).toBe('lebbering-beige');
    expect(merchStyleFamilyFromName('HatTieDieRainbowSpiral.png').familyId).toBe('tie-die-rainbow-spiral');
  });

  it('uses a style folder when the file name is only a view', () => {
    expect(merchStyleFamilyFromName('front.png', 'tees/tie-dye/front.png')).toEqual({
      familyId: 'tie-dye',
      familyLabel: 'My Plan Tie-Dye Collection',
    });
    const grouped = groupByMerchStyleFamily(
      [
        { name: 'E-ShirtLebberingBeige.png' },
        { name: 'HoodieLebberingBeige.png' },
        { name: 'TShirtTieDieRainbowSpiral.png' },
      ],
      (item) => item.name,
    );
    expect(grouped.map((group) => group.familyId)).toEqual(['lebbering-beige', 'tie-die-rainbow-spiral']);
    expect(grouped[0]?.items).toHaveLength(2);
  });

  it('allows unlimited named collections and keeps Letters / Tie-Dye canonical', () => {
    expect(suggestedStyleNameFromFile('E-ShirtLebberingBeige.png')).toBe('Lebbering Beige Collection');
    expect(namedMerchStyleFamily('  letters  ')).toEqual({
      family: { familyId: 'letters', familyLabel: 'letters Collection' },
    });
    expect(namedMerchStyleFamily('Tie-Die')).toEqual({
      family: { familyId: 'tie-dye', familyLabel: 'Tie-Die Collection' },
    });
    expect(namedMerchStyleFamily('Tie-Dye')).toEqual({
      family: { familyId: 'tie-dye', familyLabel: 'Tie-Dye Collection' },
    });
    expect(namedMerchStyleFamily('Brush Collection')).toEqual({
      family: { familyId: 'brush-collection', familyLabel: 'Brush Collection' },
    });
    expect(namedMerchStyleFamily('Circle')).toEqual({
      family: { familyId: 'circle', familyLabel: 'Circle Collection' },
    });
    expect(namedMerchStyleFamily('')).toEqual({ error: 'Name this collection.' });
    expect(namedMerchStyleFamily('x'.repeat(81))).toEqual({
      error: 'Collection names must be 80 characters or fewer.',
    });
  });
});
