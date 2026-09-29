import { describe, expect, it } from 'vitest';
import {
  addContentAsset,
  ACCESSORY_PHASE3_EXAMPLES,
  ADD_CARDS_TO_NEW_STYLE_LABEL,
  ADD_CARDS_TO_STYLE_LABEL,
  ASSET_LIBRARY_HUB_SECTIONS,
  ASSET_LIBRARY_SHOW_ALL_LABEL,
  ASSET_LIBRARY_SHOW_ALL_TAB_ID,
  assetLibraryCatalogSections,
  isAssetLibraryShowAllTab,
  isAssetLibraryHubSection,
  assetFileError,
  ASSET_LIBRARY_EXAMPLE_STYLES,
  ASSET_LIBRARY_SCROLL_CLASS,
  ASSET_LIBRARY_STYLE_LABELS,
  ASSET_LIBRARY_THUMB_CARD_CLASS,
  assetLibraryFilledStyleCount,
  assetLibraryStyleFamilies,
  assetLibraryStyleFile,
  assetLibraryStyleFileError,
  assetLibraryStyleSummary,
  assetsInCategory,
  defaultOpenAssetLibraryHub,
  defaultOpenAssetLibraryShowAll,
  DEFAULT_ASSET_LIBRARY_SHOW_ALL_FOCUS,
  resolveAssetLibraryShowAllFocus,
  DEFAULT_ASSET_LIBRARY_HUB_TAB,
  resolveAssetLibraryHubTab,
  studioTabClass,
  studioTabMetaClass,
  defaultOpenAssetLibrarySections,
  emptyAssetLibraryStore,
  emptyAssetLibraryStyleStore,
  isAssetLibrarySection,
  isAssetLibraryStyle,
  normalizeAssetLibraryStore,
  normalizeAssetLibraryStyleStore,
  moveAssetLibraryCard,
  persistAssetLibraryStyleStore,
  filesInAssetLibraryFamily,
  removeAssetLibraryStyle,
  removeContentAsset,
  reorderAssetLibraryFilesInFamily,
  renameAssetLibraryFamily,
  setAssetLibraryStyle,
  toggleAssetLibraryOpen,
  styleCompareGridClass,
  toggleStyleCompare,
} from '../assetLibrary';

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('assetLibrary', () => {
  it('groups style cards by name so tee, hoodie, and hat share one family', () => {
    expect(ASSET_LIBRARY_HUB_SECTIONS.map((section) => section.id)).toEqual([
      'show-all',
      'gear',
      'logos',
      'accessories',
    ]);
    expect(ASSET_LIBRARY_SHOW_ALL_LABEL).toBe('Show All');
    expect(isAssetLibraryShowAllTab(ASSET_LIBRARY_SHOW_ALL_TAB_ID)).toBe(true);
    expect(assetLibraryCatalogSections().map((section) => section.id)).toEqual(['gear', 'logos', 'accessories']);
    expect(ASSET_LIBRARY_HUB_SECTIONS.find((section) => section.id === 'accessories')).toMatchObject({
      phase: 'Phase 2',
      comingSoon: true,
    });
    expect(ASSET_LIBRARY_HUB_SECTIONS.find((section) => section.id === 'gear')?.phase).toBe('Phase 1');
    expect(ASSET_LIBRARY_HUB_SECTIONS.find((section) => section.id === 'logos')?.phase).toBe('');
    expect(ACCESSORY_PHASE3_EXAMPLES).toContain('Journal');
    expect(ACCESSORY_PHASE3_EXAMPLES).toContain('Planner');
    expect(ACCESSORY_PHASE3_EXAMPLES).toContain('Bracelets');
    expect(isAssetLibraryHubSection('logos')).toBe(true);
    expect(isAssetLibraryHubSection('gear-library')).toBe(false);
    expect(defaultOpenAssetLibraryHub()).toEqual({
      'show-all': true,
      logos: true,
      gear: true,
      accessories: false,
    });
    expect(resolveAssetLibraryHubTab('compare')).toBe('gear');
    expect(DEFAULT_ASSET_LIBRARY_HUB_TAB).toBe('gear');
    expect(studioTabClass(true)).toContain('rounded-t-lg');
    expect(studioTabClass(true)).toContain('border-[#FDBA74]');
    expect(studioTabClass(true)).toContain('bg-[#EA580C]');
    expect(studioTabClass(true)).not.toContain('bg-[#1F1917]');
    expect(studioTabClass(true)).toContain('text-white');
    expect(studioTabClass(false)).toContain('border-[#1F1917]');
    expect(studioTabClass(false)).toContain('max-w-max');
    expect(studioTabMetaClass(true)).toContain('text-white');
    expect(studioTabMetaClass(false)).toContain('text-[#C2410C]');
    expect(defaultOpenAssetLibraryShowAll()).toEqual({ gear: true, logos: true, accessories: true });
    expect(toggleAssetLibraryOpen(defaultOpenAssetLibraryShowAll(), 'logos').logos).toBe(false);
    expect(DEFAULT_ASSET_LIBRARY_SHOW_ALL_FOCUS).toBe('gear');
    expect(resolveAssetLibraryShowAllFocus('logos')).toBe('logos');
    expect(resolveAssetLibraryShowAllFocus('nope')).toBe('gear');
    expect(resolveAssetLibraryHubTab('logos')).toBe('logos');
    expect(resolveAssetLibraryHubTab('nope')).toBe('gear');
    expect(ADD_CARDS_TO_STYLE_LABEL).toBe('Add Cards to this Style');
    expect(ADD_CARDS_TO_NEW_STYLE_LABEL).toBe('Add Cards to a New Style');
    expect(ASSET_LIBRARY_EXAMPLE_STYLES).toEqual(['E-ShirtLebberingBeige', 'TShirtTieDieRainbowSpiral']);
    expect(ASSET_LIBRARY_STYLE_LABELS['tie-dye']).toBe('Tie Dye');
    expect(isAssetLibraryStyle('logo')).toBe(true);
    expect(isAssetLibrarySection('')).toBe(false);
    expect(isAssetLibrarySection('unisex-fem')).toBe(true);

    let store = emptyAssetLibraryStyleStore();
    store = setAssetLibraryStyle(store, { id: 'td-1', name: 'E-ShirtLebberingBeige', dataUrl: PNG }).store;
    store = setAssetLibraryStyle(store, { id: 'td-2', name: 'HoodieLebberingBeige', dataUrl: PNG }).store;
    store = setAssetLibraryStyle(store, { id: 'lg-1', name: 'TShirtTieDieRainbowSpiral', dataUrl: PNG }).store;
    expect(assetLibraryFilledStyleCount(store)).toBe(2);
    expect(assetLibraryStyleFamilies(store).find((family) => family.id === 'lebbering-beige')?.files).toHaveLength(2);
    expect(assetLibraryStyleSummary(store)).toBe('3 cards · 2 styles');
    expect(assetLibraryStyleFamilies(store).map((family) => family.id)).toEqual([
      'lebbering-beige',
      'tie-die-rainbow-spiral',
    ]);
    expect(
      reorderAssetLibraryFilesInFamily(store, 'lebbering-beige', 0, 1)
        .files.filter((file) => file.familyId === 'lebbering-beige')
        .map((file) => file.id),
    ).toEqual(['td-1', 'td-2']);
    expect(assetLibraryStyleFile(store, 'lebbering-beige')).toMatchObject({ name: 'HoodieLebberingBeige' });

    const replaced = setAssetLibraryStyle(store, { id: 'td-1', name: 'E-ShirtLebberingBeige', dataUrl: PNG });
    expect(replaced.replaced).toBe(true);
    expect(assetLibraryFilledStyleCount(replaced.store)).toBe(2);

    const cleared = removeAssetLibraryStyle(replaced.store, 'tie-die-rainbow-spiral');
    expect(assetLibraryStyleFile(cleared, 'tie-die-rainbow-spiral')).toBeUndefined();
    expect(assetLibraryFilledStyleCount(cleared)).toBe(1);

    const open = defaultOpenAssetLibrarySections(['letters', 'logo']);
    expect(open.letters).toBe(true);
    expect(open.logo).toBe(true);
    expect(toggleAssetLibraryOpen(open, 'logo').logo).toBe(false);

    const renamed = renameAssetLibraryFamily(cleared, 'lebbering-beige', 'letters');
    expect(renamed.error).toBeUndefined();
    expect(assetLibraryStyleFamilies(renamed.store)[0]).toMatchObject({
      id: 'letters',
      label: 'letters Collection',
    });
    expect(renameAssetLibraryFamily(cleared, 'lebbering-beige', '').error).toBe('Name this collection.');

    const moved = moveAssetLibraryCard(replaced.store, 'td-2', 'tie-die-rainbow-spiral');
    expect(moved.error).toBeUndefined();
    expect(filesInAssetLibraryFamily(moved.store, 'tie-die-rainbow-spiral').map((file) => file.id)).toContain('td-2');
    expect(filesInAssetLibraryFamily(moved.store, 'lebbering-beige')).toHaveLength(1);
    expect(toggleStyleCompare(['a', 'b'], 'c').selected).toEqual(['a', 'b', 'c']);
    expect(toggleStyleCompare(['1', '2', '3', '4', '5', '6', '7', '8'], '9').error).toBe('Compare up to 8.');
    expect(styleCompareGridClass()).toContain('grid-cols-2');
    expect(styleCompareGridClass()).toContain('lg:grid-cols-4');
  });

  it('rejects empty, non-image, and oversized style files', () => {
    expect(assetLibraryStyleFileError({ name: '', type: 'image/png', size: 10 })).toBe('Choose an image file to upload.');
    expect(assetLibraryStyleFileError({ name: 'notes.pdf', type: 'application/pdf', size: 10 })).toBe(
      'Upload a JPEG, PNG, WebP, or GIF.',
    );
    expect(assetLibraryStyleFileError({ name: 'huge.png', type: 'image/png', size: 21 * 1024 * 1024 })).toBe(
      'Style files must be 20 MB or smaller.',
    );
    expect(setAssetLibraryStyle(emptyAssetLibraryStyleStore(), { style: 'tie-dye', name: 'bad', dataUrl: 'https://x.png' }).error).toMatch(
      /JPEG, PNG, WebP, or GIF/,
    );
    expect(setAssetLibraryStyle(emptyAssetLibraryStyleStore(), { name: '', dataUrl: PNG }).error).toBe(
      'Name the asset.',
    );
  });

  it('drops invalid style previews on load', () => {
    const loaded = normalizeAssetLibraryStyleStore({
      styles: {
        'tie-dye': { id: 'td', name: 'Dye', dataUrl: PNG },
        logo: { id: 'lg', name: 'Mark', dataUrl: 'not-an-image' },
        extra: { id: 'x', name: 'Nope', dataUrl: PNG },
      },
    });
    expect(assetLibraryStyleFile(loaded, 'tie-dye')?.id).toBe('td');
    expect(assetLibraryStyleFile(loaded, 'logo')).toBeUndefined();
    expect(assetLibraryStyleFile(loaded, 'extra')?.name).toBe('Nope');
    expect(assetLibraryFilledStyleCount(loaded)).toBe(2);
    const blobRow = normalizeAssetLibraryStyleStore({
      styles: { 'unisex-fem': { id: 'uf', name: 'Fem', dataUrl: 'blob:http://localhost:3001/dead' } },
    });
    expect(assetLibraryStyleFile(blobRow, 'unisex-fem')?.id).toBe('uf');
    expect(assetLibraryStyleFile(blobRow, 'unisex-fem')?.dataUrl).toBeUndefined();
    expect(persistAssetLibraryStyleStore(loaded).files.find((file) => file.familyId === 'tie-dye')?.name).toBe('Dye');
  });

  it('accepts a JPEG mockup under 2 MB', () => {
    expect(assetFileError({ name: 'mark.jpg', type: 'image/jpeg', size: 80_000 }, 'mockup')).toBeNull();
    const added = addContentAsset(emptyAssetLibraryStore(), {
      id: 'm1',
      category: 'mockup',
      name: 'Tee front',
      dataUrl: PNG,
    });
    expect(added.error).toBeUndefined();
    expect(added.asset?.category).toBe('mockup');
  });

  it('rejects empty, non-image, and oversized mockup files', () => {
    expect(assetFileError({ name: '', type: 'image/png', size: 10 }, 'mockup')).toBe('Choose an image file to upload.');
    expect(assetFileError({ name: 'notes.pdf', type: 'application/pdf', size: 10 }, 'mockup')).toBe(
      'Upload a JPEG, PNG, WebP, or GIF.',
    );
    expect(assetFileError({ name: 'huge.png', type: 'image/png', size: 21 * 1024 * 1024 }, 'mockup')).toBe(
      'Mockups must be 20 MB or smaller.',
    );
    expect(
      addContentAsset(emptyAssetLibraryStore(), {
        category: 'mockup',
        name: 'bad',
        dataUrl: 'https://example.com/tee.png',
      }).error,
    ).toMatch(/JPEG, PNG, WebP, or GIF/);
  });

  it('does not cap how many mockups can be stored', () => {
    let store = emptyAssetLibraryStore();
    for (let i = 0; i < 80; i += 1) {
      const result = addContentAsset(store, { id: `m${i}`, category: 'mockup', name: `Tee ${i}`, dataUrl: PNG });
      expect(result.error).toBeUndefined();
      store = result.store;
    }
    expect(store.assets).toHaveLength(80);
  });

  it('groups mockups and drops removed rows', () => {
    let store = emptyAssetLibraryStore();
    store = addContentAsset(store, { id: 'm1', category: 'mockup', name: 'Tee', dataUrl: PNG }).store;
    expect(assetsInCategory(store, 'mockup')).toHaveLength(1);
    store = removeContentAsset(store, 'm1');
    expect(store.assets).toEqual([]);
    const loaded = normalizeAssetLibraryStore({
      assets: [{ id: 'x', category: 'mockup', name: 'x', dataUrl: 'not-an-image' }, { id: 'ok', category: 'mockup', name: 'ok', dataUrl: PNG }],
    });
    expect(loaded.assets.map((item) => item.id)).toEqual(['ok']);
    const blobRow = normalizeAssetLibraryStore({
      assets: [{ id: 'm2', category: 'mockup', name: 'Hoodie', dataUrl: 'blob:http://localhost:3001/dead' }],
    });
    expect(blobRow.assets.map((item) => item.id)).toEqual(['m2']);
    expect(blobRow.assets[0]?.dataUrl).toBeUndefined();
  });

  it('uses a medium horizontal thumbnail strip', () => {
    expect(ASSET_LIBRARY_SCROLL_CLASS).toContain('overflow-x-auto');
    expect(ASSET_LIBRARY_SCROLL_CLASS).toContain('snap-x');
    expect(ASSET_LIBRARY_THUMB_CARD_CLASS).toContain('w-36');
    expect(ASSET_LIBRARY_THUMB_CARD_CLASS).toContain('sm:w-40');
  });
});
