import { describe, expect, it } from 'vitest';
import {
  GEAR_COLLECTIONS_HEADING,
  GEAR_PAGE_LABEL,
  GEAR_HAT_COLOR_LIMIT,
  GEAR_DONE_LABEL,
  GEAR_HAT_CHOOSE_LABEL,
  GEAR_HAT_COLOR_PROMPT,
  GEAR_MOCKUP_DISCLOSURE_BODY,
  GEAR_MOCKUP_DISCLOSURE_CLASS,
  GEAR_MOCKUP_DISCLOSURE_LABEL,
  GEAR_MOCKUP_DISCLOSURE_TITLE,
  gearMockupDisclosureVisible,
  GEAR_SHIRT_HOODIE_CHOOSE_LABEL,
  GEAR_SHIRT_HOODIE_STEP,
  GEAR_SHIRT_HOODIE_BRAND_STEP,
  GEAR_HAT_COLOR_STEP,
  GEAR_PHASE1_STEPS,
  GEAR_SHIRT_HOODIE_BRAND_STEP_VISIBLE,
  gearStepChooseLabel,
  GEAR_SHIRT_HOODIE_CHANGE_HINT,
  GEAR_SHIRT_HOODIE_EMPTY_LABEL,
  GEAR_SELECTION_BANNER_CLASS,
  GEAR_SHIRT_HOODIE_NOTE,
  gearShirtHoodieSelectionBanner,
  GEAR_HAT_COLOR_EMPTY_LABEL,
  GEAR_HAT_COLOR_SELECTED_NOTE,
  GEAR_PHASE1_PICKER_ROW_CLASS,
  GEAR_PICKER_BUTTON_CLASS,
  GEAR_PICKER_DONE_CLASS,
  GEAR_PICKER_TAB_ACTIVE_CLASS,
  GEAR_PICKER_TAB_BASE_CLASS,
  GEAR_PICKER_TAB_IDLE_CLASS,
  GEAR_CATEGORY_SECTION_LABELS,
  gearPickerTabClass,
  gearPickerTabThumbClass,
  shouldShowGearCollectionTabs,
  toggleGearPhase1Step,
  GEAR_PHASE1_DEFAULT_STEP,
  GEAR_SELECT_IMAGE_GRID_CLASS,
  gearCategoryPickerStartsOpen,
  gearCategorySectionEmptyLabel,
  gearCategorySectionHeading,
  gearCategorySectionPrompt,
  gearCategoryUploadKey,
  gearHatColorHeading,
  gearHatColorPickerStartsOpen,
  gearShirtHoodiePickerStartsOpen,
  gearShirtHoodieHeading,
  GEAR_NAME_ON_BACK_PHASE_LABEL,
  GEAR_PHASE1_SELECTION_LIMIT,
  GEAR_PICK_LIMITS,
  GEAR_SHIRT_HOODIE_STYLE_LIMIT,
  GEAR_SHOP_LABEL,
  GEAR_SHOP_HREF,
  GEAR_SHOP_PAGE_HREF,
  SHOW_ALL_GEAR_LABEL,
  SHOW_CAROUSEL_GEAR_LABEL,
  GEAR_THUMBS_LABEL,
  GEAR_HIDE_THUMBS_LABEL,
  gearCarouselThumbsStartOpen,
  addGearMockup,
  addHatColor,
  addShirtHoodieBrand,
  GEAR_HAT_COLOR_IMAGE,
  GEAR_HAT_COLOR_IMAGE_CLASS,
  GEAR_HAT_COLOR_IMAGES,
  GEAR_HAT_COLOR_OPTIONS,
  gearHatColorImage,
  gearHatPreviewSrc,
  GEAR_BRAND_PRICING_NOTE,
  GEAR_SHIRT_HOODIE_BRAND_CHOOSE_LABEL,
  GEAR_SHIRT_HOODIE_BRAND_LIMIT,
  GEAR_SHIRT_HOODIE_BRAND_OPTIONS,
  GEAR_SHIRT_HOODIE_BRAND_PROMPT,
  gearShirtHoodieBrandHeading,
  pickedShirtHoodieBrandIds,
  removeShirtHoodieBrand,
  clampGearCarouselStart,
  gearCarouselGridClass,
  gearCarouselPositionLabel,
  gearCarouselSlideClass,
  gearCarouselTrackClass,
  gearCarouselVisibleCount,
  gearCarouselWindow,
  gearPhase1SelectionCount,
  isNameOnBackMockup,
  addGearMockupsFromEntries,
  angelaPickSummary,
  canPickAnother,
  gearCollectionSelectDisabled,
  gearSelectAtLimit,
  gearSelectButtonDisabled,
  pickedShirtHoodieCount,
  clearAngelaPicks,
  GEAR_UNSELECT_ALL_LABEL,
  emptyGearSelectionsStore,
  GEAR_STYLE_CARD_CLASS,
  GEAR_STYLE_SCROLL_CLASS,
  GEAR_STYLES,
  GEAR_TEE_CARD_CLASS,
  gearMockupFileError,
  gearStyleCardClass,
  filterGearCompareItems,
  gearBrandCompareId,
  gearHatCompareId,
  gearStyleCompareDisabled,
  gearStyleCompareId,
  isGearStyleComparing,
  parseGearCompareRef,
  resolveGearCompareViewItems,
  GEAR_COMPARE_LABEL,
  GEAR_COMPARE_LIMIT,
  GEAR_COMPARE_UP_TO_LABEL,
  GEAR_COMPARE_TAB_ID,
  GEAR_ALL_STYLES_TAB_ID,
  GEAR_ALL_STYLES_TAB_LABEL,
  GEAR_SHOW_ALL_TAB_ID,
  GEAR_SHOW_ALL_TAB_LABEL,
  GEAR_SELECTED_TAB_ID,
  GEAR_SELECTED_TAB_LABEL,
  GEAR_SAVED_USERS_TAB_ID,
  GEAR_COMPARE_RESULT_TAB_ID,
  GEAR_DELETE_LABEL,
  GEAR_DUPLICATE_CARD_ERROR,
  gearCardDeleteVisible,
  dedupeGearMockups,
  findDuplicateGearMockup,
  GEAR_SELECT_LABEL,
  GEAR_SIDE_BY_SIDE_LABEL,
  gearCompareResultTabVisible,
  GEAR_SIDE_BY_SIDE_TAB_ID,
  gearCollectionTabIds,
  gearCollectionTabLabel,
  isDefaultGearCollectionLabel,
  sortGearMockupsSelectedFirst,
  sortGearStyleFamilies,
  gearSideBySideTabBlinks,
  gearCompareTabHighlights,
  gearSelectedTabHighlights,
  gearCollectionTabClass,
  gearCollectionTabMetaClass,
  GEAR_COLLECTION_TAB_ACTIVE_CLASS,
  gearFilledTabClass,
  GEAR_TAB_HAS_ITEMS_CLASS,
  GEAR_STYLE_TAB_THUMB_CLASS,
  GEAR_STYLE_CHOOSE_GRID_CLASS,
  GEAR_STYLE_CHOOSE_THUMB_CLASS,
  GEAR_STYLE_CHOOSE_BOX_BASE_CLASS,
  gearHeadingRenameVisible,
  gearStyleChooseBoxClass,
  gearStyleTabThumb,
  gearStyleFamilies,
  isGearAllStylesTab,
  isGearCompareTab,
  isGearSideBySideTab,
  itemsForGearCollectionTab,
  resolveActiveCollectionId,
  inferGearCategoryFromRelativePath,
  inferGearStyleFromRelativePath,
  mergeGearSelectionsStores,
  mockupsInCategory,
  mockupsInCategoryStyle,
  normalizeGearSelectionsStore,
  picksInCategory,
  pickedHatColorIds,
  pickedShirtHoodieFamilyIds,
  pickedShirtHoodieStyles,
  removeGearMockup,
  removeHatColor,
  renameGearMockup,
  renameGearStyleFamily,
  reorderGearMockupsInFamily,
  orderedGearStyleFamilies,
  persistAngelaPickMeta,
  persistGearFamilyOrder,
  reorderGearStyleFamilies,
  reorderGearStyleFamilyById,
  moveGearStyleFamily,
  normalizeGearFamilyOrder,
  GEAR_MOVE_STYLE_LEFT_LABEL,
  GEAR_MOVE_STYLE_RIGHT_LABEL,
  GEAR_REORDER_STYLES_HINT,
  setGearSourceFolderPath,
  toggleAngelaPick,
  toggleShirtHoodieStyle,
} from '../gearSelections';
import { cacheBustPublicUrl } from '../spaAssets';

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function mockup(id: string, category: 'tee' | 'hoodie' | 'hat' = 'tee') {
  const result = addGearMockup(emptyGearSelectionsStore(), {
    id,
    category,
    name: `${id} mockup`,
    dataUrl: PNG,
    uploadedBy: 'Evelyn',
  });
  return result.mockup!;
}

describe('gearSelections', () => {
  it('accepts a JPEG mockup under 2 MB, including a PNG with no MIME type', () => {
    expect(
      gearMockupFileError({ name: 'tee.jpg', type: 'image/jpeg', size: 120_000 }),
    ).toBeNull();
    expect(gearMockupFileError({ name: 'hoodie/front.png', type: '', size: 80_000 })).toBeNull();
    expect(gearMockupFileError({ name: 'mark.svg', type: 'image/svg+xml', size: 12_000 })).toMatch(/JPEG, PNG, WebP, or GIF/);
  });

  it('rejects empty, non-image, and oversized mockup files', () => {
    expect(gearMockupFileError({ name: '', type: 'image/png', size: 10 })).toBe(
      'Choose an image file to upload.',
    );
    expect(gearMockupFileError({ name: 'notes.pdf', type: 'application/pdf', size: 10 })).toBe(
      'Upload a JPEG, PNG, WebP, or GIF mockup.',
    );
    expect(gearMockupFileError({ name: 'empty.png', type: 'image/png', size: 0 })).toBe(
      'That file is empty.',
    );
    expect(gearMockupFileError({ name: 'huge.png', type: 'image/png', size: 21 * 1024 * 1024 })).toBe(
      'Mockups must be 20 MB or smaller.',
    );
  });

  it('does not cap how many mockups can be stored', () => {
    let store = emptyGearSelectionsStore();
    for (let i = 0; i < 80; i += 1) {
      const category = i % 3 === 0 ? 'hoodie' : i % 3 === 1 ? 'hat' : 'tee';
      const result = addGearMockup(store, {
        id: `g${i}`,
        category,
        name: `Mockup ${i}`,
        dataUrl: PNG,
      });
      expect(result.error).toBeUndefined();
      store = result.store;
    }
    expect(store.mockups).toHaveLength(80);
  });

  it('lets Angela pick 3 T-Shirt styles and 3 hat colors, choosing a role per card', () => {
    let store = emptyGearSelectionsStore();
    [
      ['tee-a', 'style-a'],
      ['tee-b', 'style-b'],
      ['tee-c', 'style-c'],
      ['tee-d', 'style-d'],
    ].forEach(([id, familyId]) => {
      store = addGearMockup(store, {
        id,
        category: 'tee',
        name: id,
        familyId,
        familyLabel: familyId,
        dataUrl: PNG,
      }).store;
    });
    store = addGearMockup(store, {
      id: 'hood-a',
      category: 'hoodie',
      name: 'hood-a',
      familyId: 'style-a',
      familyLabel: 'style-a',
      dataUrl: PNG,
    }).store;
    store = addGearMockup(store, {
      id: 'name-back',
      category: 'tee',
      name: 'Letters Name on the Back',
      familyId: 'style-a',
      familyLabel: 'style-a',
      dataUrl: PNG,
    }).store;
    ['hat-a', 'hat-b', 'hat-c', 'hat-d'].forEach((id) => {
      store = addGearMockup(store, { id, category: 'hat', name: id, dataUrl: PNG }).store;
    });

    expect(isNameOnBackMockup(store.mockups.find((item) => item.id === 'name-back')!)).toBe(true);
    expect(toggleAngelaPick(store, 'name-back').error).toMatch(GEAR_NAME_ON_BACK_PHASE_LABEL);
    expect(toggleAngelaPick(store, 'tee-a').error).toMatch(/Shirt & Hoodie Style/);
    expect(pickedShirtHoodieStyles(store)).toEqual([]);
    const oneCard = toggleAngelaPick(store, 'tee-a', 'tee');
    expect(oneCard.error).toBeUndefined();
    expect(oneCard.store.picks.map((pick) => pick.mockupId)).toEqual(['tee-a']);
    expect(pickedShirtHoodieStyles(oneCard.store).map((style) => style.items.map((item) => item.id))).toEqual([
      ['tee-a'],
    ]);

    store = toggleShirtHoodieStyle(store, 'style-a').store;
    expect(store.picks.map((pick) => pick.mockupId).sort()).toEqual(['hood-a', 'tee-a']);
    store = toggleShirtHoodieStyle(store, 'style-b').store;
    expect(pickedShirtHoodieCount(store)).toBe(3);
    expect(gearSelectAtLimit(store)).toBe(false);
    expect(gearCollectionSelectDisabled(store, 'style-d')).toBe(false);
    expect(gearSelectButtonDisabled(store, 'tee-d')).toBe(false);
    expect(gearSelectButtonDisabled(store, 'tee-a')).toBe(false);
    store = toggleShirtHoodieStyle(store, 'style-c').store;
    expect(gearSelectAtLimit(store)).toBe(true);
    expect(gearCollectionSelectDisabled(store, 'style-d')).toBe(true);
    expect(gearSelectButtonDisabled(store, 'tee-d')).toBe(true);
    expect(toggleShirtHoodieStyle(store, 'style-d').error).toMatch(/3 Shirt & Hoodie Styles/);
    expect(toggleAngelaPick(store, 'tee-d', 'tee').error).toMatch(/Select up to 3/);
    store = toggleShirtHoodieStyle(store, 'style-c').store;
    store = toggleShirtHoodieStyle(store, 'style-b').store;
    expect(pickedShirtHoodieFamilyIds(store)).toEqual(['style-a']);
    expect(gearSelectButtonDisabled(store, 'tee-c')).toBe(false);
    store = toggleAngelaPick(store, 'tee-c', 'tee').store;

    expect(GEAR_HAT_COLOR_IMAGE).toBe(cacheBustPublicUrl('/images/apparel_hat_white.png'));
    expect(GEAR_HAT_COLOR_IMAGES).toEqual({
      white: cacheBustPublicUrl('/images/apparel_hat_white.png'),
      black: cacheBustPublicUrl('/images/apparel_hat_black.png'),
      red: cacheBustPublicUrl('/images/apparel_hat_red.png'),
      blue: cacheBustPublicUrl('/images/apparel_hat_blue.png'),
      purple: cacheBustPublicUrl('/images/apparel_hat_purple.png'),
    });
    expect(GEAR_HAT_COLOR_OPTIONS).toHaveLength(5);
    expect(GEAR_HAT_COLOR_OPTIONS.map((color) => color.label)).toEqual([
      'White',
      'Black',
      'Red',
      'Blue',
      'Purple',
    ]);
    expect(GEAR_HAT_COLOR_OPTIONS.map((color) => color.image)).toEqual([
      cacheBustPublicUrl('/images/apparel_hat_white.png'),
      cacheBustPublicUrl('/images/apparel_hat_black.png'),
      cacheBustPublicUrl('/images/apparel_hat_red.png'),
      cacheBustPublicUrl('/images/apparel_hat_blue.png'),
      cacheBustPublicUrl('/images/apparel_hat_purple.png'),
    ]);
    expect(gearHatColorImage('blue')).toBe(cacheBustPublicUrl('/images/apparel_hat_blue.png'));
    expect(GEAR_HAT_COLOR_IMAGE_CLASS).toContain('max-h-56');
    expect(GEAR_HAT_COLOR_IMAGE_CLASS).toContain('sm:max-h-64');
    expect(gearHatPreviewSrc()).toBe(cacheBustPublicUrl('/images/apparel_hat_white.png'));
    expect(GEAR_HAT_CHOOSE_LABEL).toBe('2. Choose Hat Color');
    expect(GEAR_DONE_LABEL).toBe('Done');
    expect(GEAR_SHIRT_HOODIE_STEP).toBe(1);
    expect(GEAR_SHIRT_HOODIE_BRAND_STEP_VISIBLE).toBe(false);
    expect(GEAR_PHASE1_STEPS).toEqual(['style', 'hat']);
    expect(GEAR_HAT_COLOR_STEP).toBe(2);
    expect(gearStepChooseLabel(1, 'Choose T-Shirt/Hoodie')).toBe('1. Choose T-Shirt/Hoodie');
    expect(GEAR_SHIRT_HOODIE_CHOOSE_LABEL).toBe('1. Choose T-Shirt/Hoodie');
    expect(GEAR_SHIRT_HOODIE_NOTE).toBe('Pick your Selections Below');
    expect(gearShirtHoodieSelectionBanner(0)).toBe(
      'Pick your Selections Below · No T-Shirt/Hoodie Style selected.',
    );
    expect(gearShirtHoodieSelectionBanner(2)).toBe('Pick your Selections Below');
    expect(GEAR_SELECTION_BANNER_CLASS).toContain('bg-[#EA580C]');
    expect(GEAR_HAT_COLOR_SELECTED_NOTE).toBe('These are your selections for Hat color');
    expect(GEAR_SHIRT_HOODIE_CHANGE_HINT).toMatch(/Unselect/);
    expect(GEAR_SHIRT_HOODIE_EMPTY_LABEL).toBe('No T-Shirt/Hoodie Style selected.');
    expect(GEAR_HAT_COLOR_EMPTY_LABEL).toBe('No hat color selected.');
    expect(GEAR_PHASE1_PICKER_ROW_CLASS).toContain('border-b-2');
    expect(GEAR_PHASE1_PICKER_ROW_CLASS).toContain('flex');
    expect(GEAR_SELECT_IMAGE_GRID_CLASS).toContain('sm:grid-cols-3');
    expect(GEAR_HAT_COLOR_PROMPT).toBe('Choose 3 hat colors');
    expect(GEAR_MOCKUP_DISCLOSURE_LABEL).toBe('Disclosure');
    expect(GEAR_MOCKUP_DISCLOSURE_TITLE).toBe('Please take notice');
    expect(GEAR_MOCKUP_DISCLOSURE_BODY).toMatch(/close — or near close — to the real item/);
    expect(GEAR_MOCKUP_DISCLOSURE_BODY).toMatch(/submitted for approval/);
    expect(GEAR_MOCKUP_DISCLOSURE_BODY).toMatch(/brands will be the brands you choose, as they are/);
    expect(GEAR_MOCKUP_DISCLOSURE_CLASS).toContain('border-double');
    expect(GEAR_MOCKUP_DISCLOSURE_CLASS).toContain('px-2.5');
    expect(gearMockupDisclosureVisible()).toBe(true);
    expect(gearMockupDisclosureVisible(false)).toBe(true);
    expect(gearMockupDisclosureVisible(true)).toBe(false);
    expect(gearHatColorHeading(0)).toBe('2. Choose Hat Color · 0/3');
    expect(gearHatColorHeading(2)).toBe('2. Choose Hat Color · 2/3');
    expect(gearShirtHoodieHeading(0)).toBe('1. Choose T-Shirt/Hoodie · 0/3');
    expect(gearShirtHoodieHeading(3)).toBe('1. Choose T-Shirt/Hoodie · 3/3');
    expect(gearHatColorPickerStartsOpen(0)).toBe(false);
    expect(gearHatColorPickerStartsOpen(2)).toBe(false);
    expect(gearHatColorPickerStartsOpen(2, true)).toBe(true);
    expect(gearShirtHoodiePickerStartsOpen(0, true)).toBe(true);
    store = addHatColor(store, 'white').store;
    expect(gearHatPreviewSrc(store)).toBe(cacheBustPublicUrl('/images/apparel_hat_white.png'));
    store = addHatColor(store, 'black').store;
    store = addHatColor(store, 'red').store;
    expect(addHatColor(store, 'purple').error).toMatch(/3 Hat colors/);
    expect(canPickAnother(store, 'hat')).toBe(false);
    store = removeHatColor(store, 'white');
    expect(pickedHatColorIds(store)).toEqual(['black', 'red']);
    expect(gearHatPreviewSrc(store)).toBe(cacheBustPublicUrl('/images/apparel_hat_black.png'));
    store = addHatColor(store, 'white').store;
    expect(GEAR_PICK_LIMITS).toEqual({
      tee: GEAR_SHIRT_HOODIE_STYLE_LIMIT,
      hoodie: GEAR_SHIRT_HOODIE_STYLE_LIMIT,
      hat: GEAR_HAT_COLOR_LIMIT,
    });
    expect(gearPhase1SelectionCount(store)).toBe(GEAR_PHASE1_SELECTION_LIMIT);
    expect(GEAR_SHIRT_HOODIE_BRAND_CHOOSE_LABEL).toBe('2. Choose Shirt/Hoodie Brand');
    expect(GEAR_SHIRT_HOODIE_BRAND_PROMPT).toMatch(/blank brand/);
    expect(GEAR_BRAND_PRICING_NOTE).toBe('Pricing does not include shipping and other nominal fees.');
    expect(GEAR_SHIRT_HOODIE_BRAND_OPTIONS.map((brand) => brand.id)).toEqual([
      'gildan',
      'comfort-colors',
      'bella-canvas',
      'next-level',
      'independent',
      'lane-seven',
    ]);
    expect(gearShirtHoodieBrandHeading(0)).toBe('2. Choose Shirt/Hoodie Brand · 0/2');
    store = addShirtHoodieBrand(store, 'gildan').store;
    store = addShirtHoodieBrand(store, 'comfort-colors').store;
    expect(addShirtHoodieBrand(store, 'bella-canvas').error).toMatch(/2 Shirt\/Hoodie brands/);
    store = removeShirtHoodieBrand(store, 'gildan');
    expect(pickedShirtHoodieBrandIds(store)).toEqual(['comfort-colors']);
    store = addShirtHoodieBrand(store, 'gildan').store;
    expect(angelaPickSummary(store)).toBe(
      '2/3 Shirt & Hoodie Styles · 3/3 Hat colors · 2/2 Shirt/Hoodie brands',
    );
    expect(GEAR_UNSELECT_ALL_LABEL).toBe('Unselect All');
    expect(clearAngelaPicks(store).picks).toEqual([]);
    expect(clearAngelaPicks(store).hatColorIds).toEqual([]);
    expect(clearAngelaPicks(store).shirtHoodieBrandIds).toEqual([]);
    expect(clearAngelaPicks(emptyGearSelectionsStore()).picks).toEqual([]);
    expect(GEAR_SHIRT_HOODIE_BRAND_LIMIT).toBe(2);
    expect(filterGearCompareItems(store.mockups, ['hat-b', 'tee-a']).map((item) => item.id)).toEqual([
      'hat-b',
      'tee-a',
    ]);
    expect(gearBrandCompareId('gildan')).toBe('brand:gildan');
    expect(gearHatCompareId('white')).toBe('hat:white');
    expect(gearStyleCompareId('letters')).toBe('style:letters');
    expect(parseGearCompareRef('brand:gildan')).toEqual({ kind: 'brand', id: 'gildan' });
    expect(parseGearCompareRef('hat:red')).toEqual({ kind: 'hat', id: 'red' });
    expect(parseGearCompareRef('style:letters')).toEqual({ kind: 'style', id: 'letters' });
    expect(parseGearCompareRef('tee-a')).toEqual({ kind: 'mockup', id: 'tee-a' });
    expect(isGearStyleComparing(['style:style-a'], 'style-a')).toBe(true);
    expect(gearStyleCompareDisabled(['style:a'], 'b', 1)).toBe(true);
    expect(gearStyleCompareDisabled(['style:a'], 'a', 1)).toBe(false);
    expect(
      resolveGearCompareViewItems(store.mockups, ['style:style-a', 'tee-c', 'brand:gildan', 'hat:white']).map((item) => item.id),
    ).toEqual(['style:style-a', 'tee-c', 'brand:gildan', 'hat:white']);
    expect(GEAR_PICKER_BUTTON_CLASS).toBe(GEAR_PICKER_TAB_IDLE_CLASS);
    expect(GEAR_PICKER_TAB_IDLE_CLASS).toContain('border-[#1F1917]');
    expect(GEAR_PICKER_TAB_BASE_CLASS).toContain('max-w-max');
    expect(gearPickerTabClass(false)).toBe(GEAR_PICKER_TAB_IDLE_CLASS);
    expect(gearPickerTabClass(true)).toBe(GEAR_PICKER_TAB_ACTIVE_CLASS);
    expect(gearPickerTabClass(true)).toContain('bg-[#EA580C]');
    expect(gearPickerTabClass(false, true)).toContain('border-[#1F1917]');
    expect(gearPickerTabClass(false)).not.toContain('bg-[#1F1917] text-white');
    expect(gearPickerTabThumbClass(true)).toContain('border-[#1F1917]/25');
    expect(gearPickerTabThumbClass(false)).toContain('border-[#1F1917]/25');
    expect(GEAR_STYLE_TAB_THUMB_CLASS).toContain('w-6');
    expect(GEAR_STYLE_CHOOSE_GRID_CLASS).toContain('flex');
    expect(GEAR_STYLE_CHOOSE_GRID_CLASS).toContain('flex-wrap');
    expect(GEAR_STYLE_CHOOSE_THUMB_CLASS).toContain('w-6');
    expect(GEAR_STYLE_CHOOSE_BOX_BASE_CLASS).toContain('min-w-[10rem]');
    expect(GEAR_STYLE_CHOOSE_BOX_BASE_CLASS).toContain('flex-1');
    expect(GEAR_STYLE_CHOOSE_BOX_BASE_CLASS).not.toContain('max-w-max');
    expect(gearStyleChooseBoxClass(true)).toContain('bg-[#EA580C]');
    expect(gearStyleChooseBoxClass(false)).toContain('flex-1');
    expect(gearStyleTabThumb([
      { category: 'hat', name: 'Hat' },
      { category: 'hoodie', name: 'Hood' },
      { category: 'tee', name: 'Tee' },
    ])?.name).toBe('Tee');
    expect(gearStyleTabThumb([
      { category: 'tee', name: 'Name on the back' },
      { category: 'hoodie', name: 'Hood' },
    ])?.name).toBe('Hood');
    expect(GEAR_PHASE1_DEFAULT_STEP).toBe('style');
    expect(toggleGearPhase1Step(null, 'hat')).toBe('hat');
    expect(toggleGearPhase1Step('hat', 'hat')).toBe(null);
    expect(toggleGearPhase1Step('hat', 'style')).toBe('style');
    expect(shouldShowGearCollectionTabs(null)).toBe(false);
    expect(shouldShowGearCollectionTabs('hat')).toBe(true);
    expect(shouldShowGearCollectionTabs('style')).toBe(true);
    expect(shouldShowGearCollectionTabs(null, true)).toBe(true);
    expect(GEAR_PICKER_DONE_CLASS).toContain('bg-[#C2410C]');
    expect(GEAR_CATEGORY_SECTION_LABELS).toEqual({
      tee: 'T-Shirts',
      hoodie: 'Hoodies',
      hat: 'Hats',
    });
    expect(gearCategorySectionHeading('tee', 1, 4)).toBe('T-Shirts · 1/4');
    expect(gearCategorySectionHeading('hoodie', 0, 0)).toBe('Hoodies · 0/0');
    expect(gearCategorySectionHeading('hat', 2, 5)).toBe('Hats · 2/5');
    expect(gearCategorySectionPrompt('tee', true)).toBe('Upload T-Shirts for Angela to pick');
    expect(gearCategorySectionPrompt('hoodie')).toBe('Pick from Hoodies');
    expect(gearCategorySectionEmptyLabel('hat')).toBe('No Hats uploaded yet.');
    expect(gearCategoryPickerStartsOpen(3)).toBe(false);
    expect(gearCategoryPickerStartsOpen(3, true)).toBe(true);
    expect(gearCategoryUploadKey('tee')).toBe('category-tee');
  });

  it('groups mockups by category and drops picks when a mockup is removed', () => {
    let store = emptyGearSelectionsStore();
    store = addGearMockup(store, { id: 'tee-a', category: 'tee', name: 'Alpha', dataUrl: PNG }).store;
    store = toggleAngelaPick(store, 'tee-a', 'tee').store;
    expect(mockupsInCategory(store, 'tee').map((item) => item.id)).toEqual(['tee-a']);
    store = removeGearMockup(store, 'tee-a');
    expect(store.mockups).toHaveLength(0);
    expect(store.picks).toEqual([]);
    store = addGearMockup(emptyGearSelectionsStore(), { id: 'tee-a', category: 'tee', name: 'Alpha', dataUrl: PNG }).store;
    expect(renameGearMockup(store, 'tee-a', 'Front Tee').store.mockups[0]?.name).toBe('Front Tee');
    expect(renameGearMockup(store, 'tee-a', '').error).toBe('Name this card.');
    expect(mockup('tee-z').category).toBe('tee');
  });

  it('rejects a non-image data URL and ignores junk on load', () => {
    expect(
      addGearMockup(emptyGearSelectionsStore(), {
        category: 'tee',
        name: 'bad',
        dataUrl: 'https://example.com/tee.png',
      }).error,
    ).toMatch(/JPEG, PNG, WebP, or GIF/);
    const loaded = normalizeGearSelectionsStore({
      mockups: [{ id: 'x', category: 'tee', name: 'x', dataUrl: 'not-an-image' }, mockup('ok')],
      picks: ['ok', 'missing'],
    });
    expect(loaded.mockups.map((item) => item.id)).toEqual(['ok']);
    expect(loaded.picks).toEqual([{ mockupId: 'ok', role: 'tee' }]);
  });

  it('keeps mockup rows when JSON has a dead blob URL so the real file can hydrate', () => {
    const loaded = normalizeGearSelectionsStore({
      mockups: [
        {
          id: 'tee-a',
          category: 'tee',
          name: 'Alpha',
          dataUrl: 'blob:http://localhost:3001/dead',
          uploadedBy: 'Evelyn',
        },
      ],
    });
    expect(loaded.mockups.map((item) => item.id)).toEqual(['tee-a']);
    expect(loaded.mockups[0]?.dataUrl).toBe('');
  });

  it('adds several hoodie and hat mockups in one batch', () => {
    const result = addGearMockupsFromEntries(
      emptyGearSelectionsStore(),
      [
        { name: 'hood-a.png', dataUrl: PNG, category: 'hoodie' },
        { name: 'hood-b.png', dataUrl: PNG, category: 'hoodie' },
        { name: 'hat-a.png', dataUrl: PNG, category: 'hat' },
        { name: 'hat-b.png', dataUrl: PNG, category: 'hat' },
      ],
      'hoodie',
      'Evelyn',
    );
    expect(result.added).toBe(4);
    expect(mockupsInCategory(result.store, 'hoodie')).toHaveLength(2);
    expect(mockupsInCategory(result.store, 'hat')).toHaveLength(2);
    const pinned = addGearMockupsFromEntries(
      emptyGearSelectionsStore(),
      [{ name: 'tee-look.png', relativePath: 'tee/front.png', dataUrl: PNG, category: 'hoodie' }],
      'hoodie',
      'Evelyn',
    );
    expect(mockupsInCategory(pinned.store, 'hoodie')).toHaveLength(1);
    expect(mockupsInCategory(pinned.store, 'tee')).toHaveLength(0);
    const hatOnly = addGearMockupsFromEntries(
      emptyGearSelectionsStore(),
      [
        { name: 'front.png', dataUrl: PNG },
        { name: 'side.png', dataUrl: PNG },
      ],
      'hat',
      'Evelyn',
    );
    expect(hatOnly.added).toBe(2);
    expect(mockupsInCategory(hatOnly.store, 'hat')).toHaveLength(2);
    const first = addGearMockup(emptyGearSelectionsStore(), {
      id: 'letters-1',
      category: 'tee',
      name: 'MyPlanLetters1',
      familyId: 'letters',
      familyLabel: 'Letters Collection',
      dataUrl: PNG,
    });
    expect(first.error).toBeUndefined();
    expect(
      addGearMockup(first.store, {
        id: 'letters-1-copy',
        category: 'tee',
        name: 'MyPlanLetters1.png',
        familyId: 'letters',
        familyLabel: 'Letters Collection',
        dataUrl: PNG,
      }).error,
    ).toBe(GEAR_DUPLICATE_CARD_ERROR);
    const batchDup = addGearMockupsFromEntries(
      first.store,
      [{ name: 'MyPlanLetters1.jpg', dataUrl: PNG, familyId: 'letters', familyLabel: 'Letters Collection' }],
      'tee',
      'Evelyn',
    );
    expect(batchDup.added).toBe(0);
    expect(batchDup.skipped).toBe(1);
    expect(batchDup.store.mockups).toHaveLength(1);
    const loadedDup = normalizeGearSelectionsStore({
      mockups: [first.mockup, { ...first.mockup, id: 'letters-dup' }],
    });
    expect(loadedDup.mockups.map((item) => item.id)).toEqual(['letters-1']);
    expect(findDuplicateGearMockup(first.store.mockups, { name: 'myplanletters1', familyId: 'letters' })?.id).toBe(
      'letters-1',
    );
    expect(dedupeGearMockups([first.mockup!, { ...first.mockup!, id: 'other' }])).toHaveLength(1);
  });

  it('loads a whole mockup folder and sorts tee, hoodie, and hat files', () => {
    const result = addGearMockupsFromEntries(
      emptyGearSelectionsStore(),
      [
        { name: 'front.png', relativePath: 'hoodie/front.png', dataUrl: PNG },
        { name: 'cap.png', relativePath: 'hat/cap.png', dataUrl: PNG },
        { name: 'rust.png', relativePath: 'tee/rust.png', dataUrl: PNG },
      ],
      'tee',
      'Evelyn',
    );
    expect(result.added).toBe(3);
    expect(result.notice).toMatch(/Imported 3 mockups/);
    expect(inferGearCategoryFromRelativePath('sweatshirt/v1.png', 'tee')).toBe('hoodie');
    expect(mockupsInCategory(result.store, 'hoodie')).toHaveLength(1);
    expect(mockupsInCategory(result.store, 'hat')).toHaveLength(1);
    expect(mockupsInCategory(result.store, 'tee')).toHaveLength(1);
    expect(setGearSourceFolderPath(emptyGearSelectionsStore(), 'C:\\Users\\evely\\Documents\\mockups').store.sourceFolderPath).toMatch(
      /mockups/,
    );
  });

  it('nests Logo, Tie-Dye, and Unisex/Fem styles under each gear type', () => {
    expect(GEAR_STYLES).toEqual(['logo', 'tie-dye', 'unisex-fem']);
    expect(inferGearStyleFromRelativePath('tees/tie-dye/front.png')).toBe('tie-dye');
    expect(inferGearStyleFromRelativePath('hoodie/unisex-fem/v1.png')).toBe('unisex-fem');
    expect(inferGearStyleFromRelativePath('hat/logo-style.png')).toBe('logo');
    let store = emptyGearSelectionsStore();
    store = addGearMockup(store, {
      id: 'td',
      category: 'tee',
      style: 'tie-dye',
      name: 'Dye',
      dataUrl: PNG,
    }).store;
    store = addGearMockup(store, {
      id: 'lg',
      category: 'tee',
      name: 'LogoFront',
      relativePath: 'tee/logo/front.png',
      dataUrl: PNG,
    }).store;
    expect(mockupsInCategoryStyle(store, 'tee', 'tie-dye').map((item) => item.id)).toEqual(['td']);
    expect(mockupsInCategoryStyle(store, 'tee', 'logo').map((item) => item.id)).toEqual(['lg']);
    const loaded = normalizeGearSelectionsStore({
      mockups: [{ id: 'old', category: 'hoodie', name: 'tiedye-back', dataUrl: PNG }],
    });
    expect(loaded.mockups[0]?.style).toBe('tie-dye');
    expect(gearStyleCardClass('tee')).toBe(GEAR_TEE_CARD_CLASS);
    expect(GEAR_TEE_CARD_CLASS).toContain('w-full');
    expect(gearStyleCardClass('hoodie')).toBe(GEAR_STYLE_CARD_CLASS);
    expect(GEAR_STYLE_CARD_CLASS).toContain('w-full');
    expect(GEAR_STYLE_SCROLL_CLASS).toContain('overflow-x-auto');
    expect(GEAR_PAGE_LABEL).toBe('Gear');
    expect(GEAR_COLLECTIONS_HEADING).toBe('Tee, Hoodie & Hat Collections');
    expect(GEAR_SHOP_LABEL).toBe('Accountability Gear');
    expect(GEAR_SHOP_PAGE_HREF).toBe('/gear');
    expect(GEAR_SHOP_HREF.tee).toBe('https://snatchvault.com/collections/non-negotiables-letter-tees');
    expect(GEAR_SHOP_HREF.hoodie).toBe('https://snatchvault.com/collections/my-plan-hoodie-collection');
    expect(GEAR_SHOP_HREF.hat).toBe('https://snatchvault.com/collections/my-plan-sports-hat');
    expect(SHOW_ALL_GEAR_LABEL).toBe('Show all');
    expect(SHOW_CAROUSEL_GEAR_LABEL).toBe('Show carousel');
    expect(GEAR_THUMBS_LABEL).toBe('Thumbs');
    expect(GEAR_HIDE_THUMBS_LABEL).toBe('Hide thumbs');
    expect(gearCarouselThumbsStartOpen()).toBe(true);
    expect(gearCarouselVisibleCount(false)).toBe(2);
    expect(gearCarouselVisibleCount('mobile')).toBe(2);
    expect(gearCarouselVisibleCount('tablet')).toBe(3);
    expect(gearCarouselVisibleCount(true)).toBe(4);
    expect(gearCarouselVisibleCount('desktop')).toBe(4);
    expect(gearCarouselGridClass(1)).toBe('grid grid-cols-1 gap-3');
    expect(gearCarouselGridClass(2)).toContain('grid-cols-2');
    expect(gearCarouselGridClass(4)).toContain('grid-cols-4');
    expect(gearCarouselSlideClass(4)).toContain('snap-start');
    expect(gearCarouselSlideClass(4)).toContain('max-w-[14rem]');
    expect(gearCarouselTrackClass(4)).toBe(gearCarouselGridClass(4));
    expect(gearCarouselTrackClass(2)).toBe(gearCarouselGridClass(2));
    expect(gearCarouselTrackClass(1)).toBe(gearCarouselGridClass(1));
    expect(clampGearCarouselStart(4, 5, 2)).toBe(3);
    expect(gearCarouselWindow(['a', 'b', 'c', 'd'], 1, 2)).toEqual(['b', 'c']);
    expect(gearCarouselPositionLabel(0, 5, 1)).toBe('1 of 5');
    expect(gearCarouselPositionLabel(1, 5, 2)).toBe('2–3 of 5');
  });

  it('groups tee, hoodie, and hat cards under the same style name', () => {
    let store = emptyGearSelectionsStore();
    store = addGearMockup(store, {
      id: 'tee-lb',
      category: 'tee',
      name: 'E-ShirtLebberingBeige',
      dataUrl: PNG,
    }).store;
    store = addGearMockup(store, {
      id: 'hood-lb',
      category: 'hoodie',
      name: 'HoodieLebberingBeige',
      dataUrl: PNG,
    }).store;
    store = addGearMockup(store, {
      id: 'spiral',
      category: 'tee',
      name: 'TShirtTieDieRainbowSpiral',
      dataUrl: PNG,
    }).store;
    const families = gearStyleFamilies(store);
    expect(families.map((family) => family.id)).toEqual(['lebbering-beige', 'tie-die-rainbow-spiral']);
    expect(
      reorderGearMockupsInFamily(store, 'lebbering-beige', 0, 1)
        .mockups.filter((item) => item.familyId === 'lebbering-beige')
        .map((item) => item.id),
    ).toEqual(['tee-lb', 'hood-lb']);
    expect(families.find((family) => family.id === 'lebbering-beige')?.items.map((item) => item.id).sort()).toEqual([
      'hood-lb',
      'tee-lb',
    ]);
    const renamed = renameGearStyleFamily(store, 'lebbering-beige', 'Brush');
    expect(renamed.error).toBeUndefined();
    expect(gearStyleFamilies(renamed.store).find((family) => family.id === 'brush')).toMatchObject({
      id: 'brush',
      label: 'Brush Collection',
    });
    expect(renameGearStyleFamily(store, 'lebbering-beige', '').error).toBe('Name this collection.');
  });

  it('keeps local Tie-Dye cards when the database still has the older 11-card store', () => {
    const remote = addGearMockup(emptyGearSelectionsStore(), {
      id: 'letters-1',
      category: 'tee',
      name: 'Letter Tee',
      familyId: 'letters',
      familyLabel: 'My Plan Letters Collection',
      dataUrl: PNG,
    }).store;
    const local = addGearMockup(remote, {
      id: 'tie-new',
      category: 'tee',
      name: 'Spiral Tee',
      familyId: 'tie-dye',
      familyLabel: 'My Plan Tie-Dye Collection',
      dataUrl: PNG,
    }).store;
    const merged = mergeGearSelectionsStores(local, remote);
    expect(merged.mockups.map((item) => item.id).sort()).toEqual(['letters-1', 'tie-new']);
    expect(gearStyleFamilies(merged).map((family) => family.id)).toContain('tie-dye');
    const afterDelete = removeGearMockup(local, 'letters-1');
    expect(mergeGearSelectionsStores(afterDelete, remote).mockups.map((item) => item.id).sort()).toEqual([
      'letters-1',
      'tie-new',
    ]);
    const staleLocal = addGearMockup(emptyGearSelectionsStore(), {
      id: 'letters-1',
      category: 'tee',
      name: 'Letter Tee',
      familyId: 'letters',
      familyLabel: 'My Plan Letters Collection',
      dataUrl: 'data:image/png;base64,old',
    }).store;
    const freshRemote = addGearMockup(emptyGearSelectionsStore(), {
      id: 'letters-1',
      category: 'tee',
      name: 'Letter Tee',
      familyId: 'letters',
      familyLabel: 'My Plan Letters Collection',
      dataUrl: PNG,
    }).store;
    expect(mergeGearSelectionsStores(staleLocal, freshRemote).mockups[0]?.dataUrl).toBe(PNG);
  });

  it('keeps Unselect All when the database still has older picks', () => {
    let remote = addGearMockup(emptyGearSelectionsStore(), {
      id: 'tee-a',
      category: 'tee',
      name: 'Alpha',
      dataUrl: PNG,
    }).store;
    remote = toggleAngelaPick(remote, 'tee-a', 'tee').store;
    const local = clearAngelaPicks(remote);
    expect(mergeGearSelectionsStores(local, remote).picks).toEqual([]);
    expect(angelaPickSummary(local)).toBe('0/3 Shirt & Hoodie Styles · 0/3 Hat colors · 0/2 Shirt/Hoodie brands');
  });

  it('keeps the selected collection when it still exists', () => {
    expect(resolveActiveCollectionId(['letters', 'tie-dye'], 'tie-dye')).toBe('tie-dye');
    expect(resolveActiveCollectionId(['letters', 'tie-dye'], 'gone')).toBe('letters');
    expect(resolveActiveCollectionId([], 'letters')).toBeNull();
    const letters = [{ id: 'tee-a' }, { id: 'hood-a' }];
    const tiedye = [{ id: 'tee-c' }];
    const tabFamilies = [
      { id: 'letters', items: letters },
      { id: 'tie-dye', items: tiedye },
    ];
    expect(itemsForGearCollectionTab(tabFamilies, 'letters').map((item) => item.id)).toEqual(['tee-a', 'hood-a']);
    expect(itemsForGearCollectionTab(tabFamilies, 'tie-dye').map((item) => item.id)).toEqual(['tee-c']);
    expect(itemsForGearCollectionTab(tabFamilies, GEAR_SHOW_ALL_TAB_ID).map((item) => item.id)).toEqual([
      'tee-a',
      'hood-a',
      'tee-c',
    ]);
    expect(itemsForGearCollectionTab(tabFamilies, GEAR_COMPARE_TAB_ID)).toEqual([]);
    expect(gearCollectionTabIds(['letters', 'tie-dye'], true)).toEqual([
      GEAR_SHOW_ALL_TAB_ID,
      'letters',
      'tie-dye',
      GEAR_COMPARE_TAB_ID,
      GEAR_SIDE_BY_SIDE_TAB_ID,
    ]);
    expect(gearCollectionTabIds(['letters', 'tie-dye'], true, true, true)).toEqual([
      GEAR_SHOW_ALL_TAB_ID,
      'letters',
      'tie-dye',
      GEAR_COMPARE_TAB_ID,
      GEAR_SIDE_BY_SIDE_TAB_ID,
      GEAR_SELECTED_TAB_ID,
      GEAR_SAVED_USERS_TAB_ID,
    ]);
    expect(GEAR_COMPARE_RESULT_TAB_ID).toBe(GEAR_SIDE_BY_SIDE_TAB_ID);
    expect(isGearCompareTab(GEAR_COMPARE_TAB_ID)).toBe(true);
    expect(isGearCompareTab('letters')).toBe(false);
    expect(isGearSideBySideTab(GEAR_SIDE_BY_SIDE_TAB_ID)).toBe(true);
    expect(GEAR_SIDE_BY_SIDE_LABEL).toBe('Side by Side');
    expect(GEAR_COMPARE_LABEL).toBe('Compare');
    expect(GEAR_COMPARE_LIMIT).toBe(8);
    expect(GEAR_COMPARE_UP_TO_LABEL).toBe('Compare up to 8');
    expect(GEAR_SELECT_LABEL).toBe('Select');
    expect(GEAR_DELETE_LABEL).toBe('Delete');
    expect(gearCardDeleteVisible(true)).toBe(true);
    expect(gearCardDeleteVisible(false)).toBe(false);
    expect(gearCardDeleteVisible(undefined)).toBe(false);
    expect(gearHeadingRenameVisible(true)).toBe(true);
    expect(gearHeadingRenameVisible(false)).toBe(false);
    expect(gearHeadingRenameVisible(undefined)).toBe(false);
    expect(gearCompareResultTabVisible(0, true)).toBe(false);
    expect(gearCompareResultTabVisible(1, false)).toBe(false);
    expect(gearCompareResultTabVisible(2, false)).toBe(true);
    expect(gearCompareResultTabVisible(2, true)).toBe(true);
    expect(gearSideBySideTabBlinks(0)).toBe(false);
    expect(gearSideBySideTabBlinks(1)).toBe(false);
    expect(gearSideBySideTabBlinks(2)).toBe(true);
    expect(gearSideBySideTabBlinks(3, true)).toBe(false);
    expect(gearCompareTabHighlights(0)).toBe(false);
    expect(gearCompareTabHighlights(1)).toBe(true);
    expect(gearCompareTabHighlights(2, true)).toBe(false);
    expect(gearSelectedTabHighlights(0, 0)).toBe(false);
    expect(gearSelectedTabHighlights(1, 0)).toBe(true);
    expect(gearSelectedTabHighlights(0, 2)).toBe(true);
    expect(gearSelectedTabHighlights(1, 1, true)).toBe(false);
    expect(gearSelectedTabHighlights(0, 0, false, 1)).toBe(true);
    expect(gearFilledTabClass(false, true)).toBe(GEAR_TAB_HAS_ITEMS_CLASS);
    expect(gearCollectionTabClass(true)).toBe(GEAR_COLLECTION_TAB_ACTIVE_CLASS);
    expect(gearCollectionTabClass(true)).toContain('bg-[#EA580C]');
    expect(gearCollectionTabClass(true)).not.toContain('bg-[#1F1917]');
    expect(gearCollectionTabClass(false)).toBe(GEAR_PICKER_TAB_IDLE_CLASS);
    expect(gearCollectionTabMetaClass(true)).toBe('text-white');
    expect(gearCollectionTabMetaClass(false)).toBe('text-[#C2410C]');
    expect(sortGearMockupsSelectedFirst([{ id: 'a' }, { id: 'b' }, { id: 'c' }], ['c', 'a']).map((item) => item.id)).toEqual([
      'a',
      'c',
      'b',
    ]);
    expect(GEAR_SELECTED_TAB_LABEL).toBe('Selected');
    expect(GEAR_SELECTED_TAB_ID).toBe('selected');
    expect(GEAR_SHOW_ALL_TAB_LABEL).toBe('All Style');
    expect(GEAR_ALL_STYLES_TAB_LABEL).toBe('All Style');
    expect(GEAR_ALL_STYLES_TAB_ID).toBe('all');
    expect(isGearAllStylesTab(GEAR_ALL_STYLES_TAB_ID)).toBe(true);
    expect(isGearAllStylesTab('letters')).toBe(false);
    expect(isDefaultGearCollectionLabel('letters', 'My Plan Letters Collection')).toBe(true);
    expect(gearCollectionTabLabel('letters', 'My Plan Letters Collection')).toBe('Letters/Logo Style');
    expect(gearCollectionTabLabel('tie-dye', 'Tie-Die Collection')).toBe('Tie-Die Style');
    expect(gearCollectionTabLabel('letters', 'Script Logo Collection')).toBe('Script Logo');
    expect(gearCollectionTabLabel('tie-dye', 'Rainbow Spiral Collection')).toBe('Rainbow Spiral');
    expect(sortGearStyleFamilies([
      { id: 'other', label: 'Other' },
      { id: 'tie-dye', label: 'Tie-Dye Collection' },
      { id: 'letters', label: 'Letters Collection' },
    ]).map((family) => family.id)).toEqual(['letters', 'tie-dye', 'other']);
  });

  it('lets an admin reorder t-shirt style tabs and keeps new styles at the end', () => {
    let store = emptyGearSelectionsStore();
    store = addGearMockup(store, {
      id: 'letters-1',
      category: 'tee',
      name: 'Letter Tee',
      familyId: 'letters',
      familyLabel: 'Letters Collection',
      dataUrl: PNG,
    }).store;
    store = addGearMockup(store, {
      id: 'tie-1',
      category: 'tee',
      name: 'Spiral Tee',
      familyId: 'tie-dye',
      familyLabel: 'Tie-Dye Collection',
      dataUrl: PNG,
    }).store;
    store = addGearMockup(store, {
      id: 'frame-1',
      category: 'tee',
      name: 'Frame Tee',
      familyId: 'frame-collection-brown',
      familyLabel: 'Frame Collection Brown',
      dataUrl: PNG,
    }).store;
    expect(orderedGearStyleFamilies(store).map((family) => family.id)).toEqual([
      'letters',
      'tie-dye',
      'frame-collection-brown',
    ]);
    store = reorderGearStyleFamilies(store, 2, 0);
    expect(orderedGearStyleFamilies(store).map((family) => family.id)).toEqual([
      'frame-collection-brown',
      'letters',
      'tie-dye',
    ]);
    expect(moveGearStyleFamily(store, 'letters', 1).familyOrder).toEqual([
      'frame-collection-brown',
      'tie-dye',
      'letters',
    ]);
    expect(reorderGearStyleFamilyById(store, 'tie-dye', 'frame-collection-brown').familyOrder).toEqual([
      'tie-dye',
      'frame-collection-brown',
      'letters',
    ]);
    store = addGearMockup(store, {
      id: 'brush-1',
      category: 'tee',
      name: 'Brush Tee',
      familyId: 'brush',
      familyLabel: 'Brush Collection',
      dataUrl: PNG,
    }).store;
    expect(orderedGearStyleFamilies(store).map((family) => family.id)).toEqual([
      'frame-collection-brown',
      'letters',
      'tie-dye',
      'brush',
    ]);
    expect(normalizeGearFamilyOrder(['gone', 'tie-dye', 'tie-dye', 'letters'], ['letters', 'tie-dye', 'other'], {
      letters: 'Letters',
      'tie-dye': 'Tie-Dye',
      other: 'Other',
    })).toEqual(['tie-dye', 'letters', 'other']);
    expect(persistGearFamilyOrder(store)).toEqual([
      'frame-collection-brown',
      'letters',
      'tie-dye',
      'brush',
    ]);
    expect(persistAngelaPickMeta(store).familyOrder).toEqual(persistGearFamilyOrder(store));
    expect(GEAR_MOVE_STYLE_LEFT_LABEL).toBe('Move left');
    expect(GEAR_MOVE_STYLE_RIGHT_LABEL).toBe('Move right');
    expect(GEAR_REORDER_STYLES_HINT).toContain('Drag');
    const loaded = normalizeGearSelectionsStore({
      mockups: store.mockups,
      picks: persistAngelaPickMeta(store),
    });
    expect(loaded.familyOrder).toEqual([
      'frame-collection-brown',
      'letters',
      'tie-dye',
      'brush',
    ]);
  });
});
