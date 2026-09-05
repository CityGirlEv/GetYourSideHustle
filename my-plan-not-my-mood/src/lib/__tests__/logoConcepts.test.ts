import { describe, expect, it } from 'vitest';
import {
  MAIN_LOGO_LABEL,
  LOGO_ALL_TAB_ID,
  LOGO_SELECTED_TAB_ID,
  LOGO_SELECTED_TAB_LABEL,
  UNSELECT_LABEL,
  chosenLogo,
  isLogoSelectedTab,
  logoPageTabIds,
  SHOW_ALL_LOGOS_LABEL,
  SHOW_CAROUSEL_LOGOS_LABEL,
  addLogoConcept,
  addLogoConceptsFromEntries,
  allLogoConcepts,
  chooseLogoConcept,
  emptyLogoConceptsStore,
  isChosenLogo,
  logoConceptFileError,
  logoConceptsSummary,
  normalizeLogoConceptsStore,
  removeLogoConcept,
  renameLogoConcept,
  reorderLogoConcepts,
  setMainLogo,
  clampLogoCarouselStart,
  clampLogoMiniFocus,
  logoCarouselPositionLabel,
  logoCarouselVisibleCount,
  logoCarouselWindow,
  wrapLogoCarouselIndex,
} from '../logoConcepts';

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const SVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=';

function concept(id: string, kind: 'seal' | 'wordmark' | 'lockup' | 'colorway' = 'seal') {
  const result = addLogoConcept(emptyLogoConceptsStore(), {
    id,
    kind,
    name: `${id} concept`,
    dataUrl: PNG,
    uploadedBy: 'Evelyn',
  });
  return result.concept!;
}

describe('logoConcepts', () => {
  it('accepts a JPEG or SVG logo under 2 MB, including a PNG with no MIME type', () => {
    expect(logoConceptFileError({ name: 'seal.jpg', type: 'image/jpeg', size: 80_000 })).toBeNull();
    expect(logoConceptFileError({ name: 'mark.svg', type: 'image/svg+xml', size: 12_000 })).toBeNull();
    expect(logoConceptFileError({ name: 'folder/seal.png', type: '', size: 40_000 })).toBeNull();
    const added = addLogoConcept(emptyLogoConceptsStore(), {
      id: 'seal-1',
      kind: 'seal',
      name: 'Rust seal',
      dataUrl: SVG,
      uploadedBy: 'Evelyn',
    });
    expect(added.error).toBeUndefined();
    expect(added.concept?.name).toBe('Rust seal');
  });

  it('rejects empty, non-image, and oversized logo files', () => {
    expect(logoConceptFileError({ name: '', type: 'image/png', size: 10 })).toBe('Choose a logo file to upload.');
    expect(logoConceptFileError({ name: 'notes.pdf', type: 'application/pdf', size: 10 })).toBe(
      'Upload a JPEG, PNG, WebP, GIF, or SVG logo.',
    );
    expect(logoConceptFileError({ name: 'huge.png', type: 'image/png', size: 21 * 1024 * 1024 })).toBe(
      'Logo files must be 20 MB or smaller.',
    );
    expect(
      addLogoConcept(emptyLogoConceptsStore(), {
        kind: 'wordmark',
        name: 'bad',
        dataUrl: 'https://example.com/logo.png',
      }).error,
    ).toMatch(/JPEG, PNG, WebP, GIF, or SVG/);
    expect(addLogoConcept(emptyLogoConceptsStore(), { kind: 'seal', name: '   ', dataUrl: PNG }).error).toMatch(
      /Name the logo/,
    );
  });

  it('lets Angela choose one concept and clears the pick when that file is removed', () => {
    let store = emptyLogoConceptsStore();
    store = addLogoConcept(store, { id: 'seal-a', name: 'Seal A', dataUrl: PNG }).store;
    store = addLogoConcept(store, { id: 'word-a', name: 'Word A', dataUrl: PNG }).store;
    expect(store.concepts).toHaveLength(2);
    store = chooseLogoConcept(store, 'seal-a').store;
    expect(isChosenLogo(store, 'seal-a')).toBe(true);
    expect(chosenLogo(store)?.id).toBe('seal-a');
    expect(chosenLogo(store)?.dataUrl).toBe(PNG);
    expect(logoPageTabIds()).toEqual([LOGO_ALL_TAB_ID, LOGO_SELECTED_TAB_ID]);
    expect(isLogoSelectedTab(LOGO_SELECTED_TAB_ID)).toBe(true);
    expect(isLogoSelectedTab(LOGO_ALL_TAB_ID)).toBe(false);
    expect(LOGO_SELECTED_TAB_LABEL).toBe('Selected');
    expect(allLogoConcepts(store).map((item) => item.id)).toContain('seal-a');
    expect(logoConceptsSummary(store)).toBe(`${MAIN_LOGO_LABEL}: Seal A · 2 logos`);
    expect(setMainLogo(store, 'word-a').store.chosenId).toBe('word-a');
    const renamed = renameLogoConcept(store, 'seal-a', '  Brand Mark  ');
    expect(renamed.error).toBeUndefined();
    expect(renamed.store.concepts.find((item) => item.id === 'seal-a')?.name).toBe('Brand Mark');
    expect(renameLogoConcept(store, 'seal-a', '   ').error).toBe('Enter a name for this logo.');
    expect(wrapLogoCarouselIndex(0, 3, -1)).toBe(2);
    expect(wrapLogoCarouselIndex(2, 3, 1)).toBe(0);
    expect(wrapLogoCarouselIndex(2, 2)).toBe(1);
    expect(logoCarouselVisibleCount(false)).toBe(1);
    expect(logoCarouselVisibleCount(true)).toBe(2);
    expect(clampLogoCarouselStart(4, 5, 2)).toBe(3);
    expect(logoCarouselWindow(['a', 'b', 'c', 'd'], 1, 2)).toEqual(['b', 'c']);
    expect(logoCarouselPositionLabel(0, 5, 1)).toBe('1 of 5');
    expect(logoCarouselPositionLabel(1, 5, 2)).toBe('2–3 of 5');
    expect(clampLogoMiniFocus(1, 5)).toBe(1);
    expect(clampLogoMiniFocus(4, 5)).toBe(4);
    expect(clampLogoMiniFocus(-1, 5)).toBe(0);
    expect(clampLogoMiniFocus(9, 5)).toBe(4);
    expect(clampLogoMiniFocus(0, 0)).toBe(0);
    expect(reorderLogoConcepts(store, 0, 1).concepts.map((item) => item.id)).toEqual(['seal-a', 'word-a']);
    expect(UNSELECT_LABEL).toBe('Unselect');
    expect(SHOW_ALL_LOGOS_LABEL).toBe('Show all');
    expect(SHOW_CAROUSEL_LOGOS_LABEL).toBe('Show carousel');
    store = chooseLogoConcept(store, 'seal-a').store;
    expect(store.chosenId).toBeNull();
    store = chooseLogoConcept(store, 'word-a').store;
    store = removeLogoConcept(store, 'word-a');
    expect(store.chosenId).toBeNull();
    expect(store.concepts.map((item) => item.id)).toEqual(['seal-a']);
    expect(chooseLogoConcept(store, 'missing').error).toMatch(/not on the list/);
  });

  it('does not cap how many logos can be stored', () => {
    let store = emptyLogoConceptsStore();
    for (let i = 0; i < 80; i += 1) {
      const result = addLogoConcept(store, { id: `l${i}`, kind: 'seal', name: `Seal ${i}`, dataUrl: PNG });
      expect(result.error).toBeUndefined();
      store = result.store;
    }
    expect(store.concepts).toHaveLength(80);
  });

  it('drops invalid stored rows and keeps a valid chosen id', () => {
    const loaded = normalizeLogoConceptsStore({
      concepts: [
        { id: 'x', kind: 'seal', name: 'x', dataUrl: 'not-an-image' },
        concept('ok'),
      ],
      chosenId: 'ok',
    });
    expect(loaded.concepts.map((item) => item.id)).toEqual(['ok']);
    expect(loaded.chosenId).toBe('ok');
    expect(normalizeLogoConceptsStore(null).concepts).toEqual([]);
    expect(normalizeLogoConceptsStore({ concepts: [], chosenId: 'gone' }).chosenId).toBeNull();
  });

  it('loads a whole folder of logos and sorts by subfolder name', () => {
    const result = addLogoConceptsFromEntries(
      emptyLogoConceptsStore(),
      [
        { name: 'mark.png', relativePath: 'wordmark/mark.png', dataUrl: PNG },
        { name: 'badge.png', relativePath: 'seal/badge.png', dataUrl: PNG },
      ],
      'colorway',
      'Evelyn',
    );
    expect(result.added).toBe(2);
    expect(result.notice).toMatch(/Imported 2 logos/);
    expect(result.store.concepts).toHaveLength(2);
    expect(logoConceptsSummary(result.store)).toBe('No main logo · 2 logos');
  });
});
