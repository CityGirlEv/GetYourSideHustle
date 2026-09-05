import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, FileDown, Pencil, Printer, Save, Shirt, Trash2, Upload } from 'lucide-react';
import { CF_CHIP_OFF, CF_POP_BTN } from '../lib/contentFactory';
import {
  GEAR_COLLECTIONS_HEADING,
  GEAR_PAGE_LABEL,
  GEAR_SELECTIONS_STORAGE_KEY,
  addGearMockupsFromEntries,
  angelaPickSummary,
  emptyGearSelectionsStore,
  gearMockupFileError,
  gearStyleCardClass,
  gearCollectionTabLabel,
  orderedGearStyleFamilies,
  sortGearMockupsSelectedFirst,
  GEAR_COMPARE_LABEL,
  GEAR_COMPARE_LIMIT,
  GEAR_COMPARE_UP_TO_LABEL,
  GEAR_COMPARE_TAB_ID,
  GEAR_SELECTED_TAB_ID,
  GEAR_SELECTED_TAB_LABEL,
  GEAR_COMPARE_RESULT_TAB_ID,
  GEAR_SHOW_ALL_TAB_ID,
  GEAR_SHOW_ALL_TAB_LABEL,
  GEAR_SIDE_BY_SIDE_BLINK_CLASS,
  GEAR_SIDE_BY_SIDE_LABEL,
  GEAR_SIDE_BY_SIDE_TAB_ID,
  gearCompareResultTabVisible,
  gearCompareTabHighlights,
  gearCollectionTabClass,
  gearCollectionTabMetaClass,
  gearSelectedTabHighlights,
  gearSideBySideTabBlinks,
  GEAR_STYLE_CHOOSE_GRID_CLASS,
  GEAR_STYLE_CHOOSE_THUMB_CLASS,
  gearHeadingRenameVisible,
  gearStyleChooseBoxClass,
  gearStyleTabThumb,
  GEAR_DELETE_LABEL,
  GEAR_SELECT_LABEL,
  GEAR_UNSELECT_ALL_LABEL,
  GEAR_UNSELECT_LABEL,
  gearCardDeleteVisible,
  gearCollectionSelectDisabled,
  isShirtHoodieCategory,
  itemsForGearCollectionTab,
  isShirtHoodieFamilyPicked,
  pickedShirtHoodieStyleCount,
  clearAngelaPicks,
  GEAR_HAT_COLOR_LIMIT,
  GEAR_HAT_COLOR_LABEL,
  GEAR_HAT_COLOR_OPTIONS,
  GEAR_HAT_COLORS_LABEL,
  GEAR_SHIRT_HOODIE_BRAND_LABEL,
  GEAR_SHIRT_HOODIE_BRAND_OPTIONS,
  gearBrandCompareId,
  gearHatCompareId,
  gearStyleCompareDisabled,
  gearStyleCompareId,
  isGearStyleComparing,
  parseGearCompareRef,
  resolveGearCompareViewItems,
  GEAR_PICK_AS_PROMPT,
  GEAR_PICK_ROLE_LABELS,
  GEAR_PICK_ROLES,
  GEAR_TSHIRT_STYLE_LABEL,
  GEAR_NAME_ON_BACK_LABEL,
  GEAR_NAME_ON_BACK_PHASE_LABEL,
  GEAR_PHASE1_DEFAULT_STEP,
  GEAR_PHASE1_PICKER_ROW_CLASS,
  type GearCategory,
  type GearPhase1Step,
  shouldShowGearCollectionTabs,
  toggleGearPhase1Step,
  GEAR_SHIRT_HOODIE_LABEL,
  GEAR_SHIRT_HOODIE_STYLE_LIMIT,
  GEAR_MOVE_STYLE_LEFT_LABEL,
  GEAR_MOVE_STYLE_RIGHT_LABEL,
  GEAR_REORDER_STYLES_HINT,
  gearFamilyLabelsChanged,
  gearFamilyOrderChanged,
  isGearCompareTab,
  isGearSelectedTab,
  isGearShowAllTab,
  isGearSideBySideTab,
  isNameOnBackMockup,
  isPicked,
  normalizeGearSelectionsStore,
  addHatColor,
  addShirtHoodieBrand,
  isGearHatColorId,
  isGearShirtHoodieBrandId,
  pickedHatColorOptions,
  pickedMockupIds,
  pickedShirtHoodieBrandIds,
  pickedShirtHoodieFamilyIds,
  pickedShirtHoodieMockups,
  toggleShirtHoodieStyle,
  removeHatColor,
  removeShirtHoodieBrand,
  type GearPickRole,
  persistGearSelectionsStore,
  mergeGearSelectionsStores,
  removeGearMockup,
  renameGearMockup,
  resolveActiveCollectionId,
  renameGearStyleFamily,
  reorderGearMockupsInFamily,
  moveGearStyleFamily,
  reorderGearStyleFamilyById,
  toggleAngelaPick,
  type GearSelectionsStore,
} from '../lib/gearSelections';
import {
  ADD_CARDS_TO_NEW_STYLE_LABEL,
  ADD_CARDS_TO_STYLE_LABEL,
  ASSET_LIBRARY_EXAMPLE_STYLES,
  ASSET_LIBRARY_STYLE_STORAGE_KEY,
  emptyAssetLibraryStyleStore,
  normalizeAssetLibraryStyleStore,
  persistAssetLibraryStyleStore,
  renameSharedMerchCollection,
  toggleStyleCompare,
} from '../lib/assetLibrary';
import { namedMerchStyleFamily, suggestedStyleNameFromFile } from '../lib/merchStyleFamily';
import { newUploadId, storeFilePreview, withHydratedPreviews, writeLocalJson } from '../lib/idbFileStore';
import { openAssetGalleryPdf, openAssetImagePdf } from '../lib/assetImagePdf';
import { fullResolutionImageUrl, imagePreviewFromAsset, imagePreviewFromHatColor, showImagePreview, type ImagePreview } from '../lib/imagePreview';
import { ImagePreviewLightbox } from './ImagePreviewLightbox';
import { GearCompareList } from './GearCompareList';
import { StyleCompareTray } from './StyleCompareTray';
import { StyleNameDialog } from './StyleNameDialog';
import { GearHatColorPicker } from './GearHatColorPicker';
import { GearShirtHoodieStylePicker } from './GearShirtHoodieStylePicker';
import { ThumbCarousel } from './ThumbCarousel';
import { UploadThumb } from './UploadThumb';
import { buildGearStorePayload, fetchGearStore, saveGearStore } from '../lib/gearStore';
import {
  SAVE_DATABASE_SKIPPED_NOTICE,
  SAVE_TO_DATABASE_LABEL,
  SAVED_TO_DATABASE_NOTICE,
  SAVING_TO_DATABASE_LABEL,
} from '../lib/logoStore';

function loadStore(): GearSelectionsStore {
  try {
    const raw = localStorage.getItem(GEAR_SELECTIONS_STORAGE_KEY);
    return raw ? normalizeGearSelectionsStore(JSON.parse(raw)) : emptyGearSelectionsStore();
  } catch {
    return emptyGearSelectionsStore();
  }
}

function loadAssetLibraryStyles() {
  try {
    const raw = localStorage.getItem(ASSET_LIBRARY_STYLE_STORAGE_KEY);
    return raw ? normalizeAssetLibraryStyleStore(JSON.parse(raw)) : emptyAssetLibraryStyleStore();
  } catch {
    return emptyAssetLibraryStyleStore();
  }
}

export const GearSelectionsPage: React.FC<{
  actorName?: string;
  actorEmail?: string;
  embedded?: boolean;
  allowSelect?: boolean;
  allowCompare?: boolean;
  startOnCompare?: boolean;
  canConfigure?: boolean;
  canDelete?: boolean;
  canRename?: boolean;
}> = ({
  actorName = 'Evelyn',
  actorEmail,
  embedded = false,
  allowSelect = true,
  allowCompare,
  startOnCompare = false,
  canConfigure = true,
  canDelete = false,
  canRename = false,
}) => {
  const canCompare = allowCompare ?? true;
  const canRenameHeadings = gearHeadingRenameVisible(canRename);
  const [store, setStore] = useState<GearSelectionsStore>(() => loadStore());
  const [notice, setNotice] = useState<string>('');
  const [persistNotice, setPersistNotice] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [hiRes, setHiRes] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<ImagePreview | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);
  const [pendingSuggested, setPendingSuggested] = useState('');
  const [renameFamilyId, setRenameFamilyId] = useState<string | null>(null);
  const [renameMockupId, setRenameMockupId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(
    startOnCompare ? GEAR_COMPARE_TAB_ID : null,
  );
  const [chooseStep, setChooseStep] = useState<GearPhase1Step | null>(GEAR_PHASE1_DEFAULT_STEP);
  const [sideBySideOpen, setSideBySideOpen] = useState(false);
  const [pickForId, setPickForId] = useState<string | null>(null);
  const [draggingFamilyId, setDraggingFamilyId] = useState<string | null>(null);
  const fileInputs = useRef<Partial<Record<string, HTMLInputElement | null>>>({});
  const newStyleInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let live = true;
    void (async () => {
      const local = loadStore();
      const remote = await fetchGearStore();
      const next = remote ? mergeGearSelectionsStores(local, remote.store) : local;
      const hydrated = await withHydratedPreviews(next.mockups);
      if (!live) return;
      setStore({
        ...next,
        mockups: next.mockups.map((row) => hydrated.find((item) => item.id === row.id) ?? row),
      });
      if (
        remote &&
        (next.mockups.length > remote.store.mockups.length ||
          gearFamilyLabelsChanged(next, remote.store) ||
          gearFamilyOrderChanged(next, remote.store))
      ) {
        void saveGearStore(buildGearStorePayload(next, actorEmail || actorName));
      }
      setReady(true);
    })();
    return () => {
      live = false;
    };
  }, [actorEmail, actorName]);

  useEffect(() => {
    writeLocalJson(GEAR_SELECTIONS_STORAGE_KEY, persistGearSelectionsStore(store));
  }, [store]);

  useEffect(() => {
    let live = true;
    const created: string[] = [];
    void (async () => {
      const next: Record<string, string> = {};
      for (const item of store.mockups) {
        const url = await fullResolutionImageUrl(item.id, item.dataUrl);
        if (!url) continue;
        if (url.startsWith('blob:') && url !== item.dataUrl) created.push(url);
        next[item.id] = url;
      }
      if (!live) {
        created.forEach((url) => URL.revokeObjectURL(url));
        return;
      }
      setHiRes(next);
    })();
    return () => {
      live = false;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [store.mockups]);

  const summary = useMemo(() => angelaPickSummary(store), [store]);
  const families = useMemo(() => orderedGearStyleFamilies(store), [store]);
  const pickedIds = useMemo(() => pickedMockupIds(store), [store]);
  const showAllItems = useMemo(
    () => sortGearMockupsSelectedFirst(itemsForGearCollectionTab(families, GEAR_SHOW_ALL_TAB_ID), pickedIds),
    [families, pickedIds],
  );
  const showingCompare = canCompare && isGearCompareTab(activeTab);
  const showingSideBySide = canCompare && isGearSideBySideTab(activeTab);
  const compareResultTabOpen = gearCompareResultTabVisible(compareIds.length, sideBySideOpen);
  const showingSelected = allowSelect && isGearSelectedTab(activeTab);
  const showingShowAll = isGearShowAllTab(activeTab);
  const showCollectionRow = shouldShowGearCollectionTabs(chooseStep, true);
  const showStyleBrowse = showCollectionRow;
  const selectedFamilyId = showingCompare || showingSideBySide || showingSelected || showingShowAll
    ? null
    : resolveActiveCollectionId(
        families.map((family) => family.id),
        activeTab,
      );
  const selectedFamily = families.find((family) => family.id === selectedFamilyId) ?? null;
  const selectedFamilyItems = useMemo(
    () => sortGearMockupsSelectedFirst(itemsForGearCollectionTab(families, selectedFamilyId), pickedIds),
    [families, pickedIds, selectedFamilyId],
  );

  useEffect(() => {
    if (activeTab !== null || !selectedFamilyId) return;
    setActiveTab(selectedFamilyId);
  }, [activeTab, selectedFamilyId]);
  const selectedShirtHoodie = useMemo(() => pickedShirtHoodieMockups(store), [store]);
  const selectedHats = useMemo(() => pickedHatColorOptions(store), [store]);
  const selectedBrands = useMemo(() => pickedShirtHoodieBrandIds(store), [store]);
  const shirtHoodieStyleCount = pickedShirtHoodieStyleCount(store);
  const compareItems = useMemo(
    () => resolveGearCompareViewItems(store.mockups, compareIds, (item) => hiRes[item.id] || item.dataUrl),
    [compareIds, hiRes, store.mockups],
  );
  const compareChoices = useMemo(
    () => [
      ...families.map((family) => {
        const thumb = family.items.find((item) => isShirtHoodieCategory(item.category)) ?? family.items[0];
        return {
          id: gearStyleCompareId(family.id),
          name: family.label,
          subtitle: GEAR_TSHIRT_STYLE_LABEL,
          src: thumb ? hiRes[thumb.id] || thumb.dataUrl : undefined,
        };
      }),
      ...store.mockups.map((item) => ({
        id: item.id,
        name: item.name,
        subtitle: item.familyLabel,
        src: hiRes[item.id] || item.dataUrl,
      })),
      ...GEAR_SHIRT_HOODIE_BRAND_OPTIONS.map((brand) => ({
        id: gearBrandCompareId(brand.id),
        name: brand.label,
        subtitle: GEAR_SHIRT_HOODIE_BRAND_LABEL,
        swatch: brand.swatch,
      })),
      ...GEAR_HAT_COLOR_OPTIONS.map((color) => ({
        id: gearHatCompareId(color.id),
        name: color.label,
        subtitle: GEAR_HAT_COLOR_LABEL,
        src: color.image,
      })),
    ],
    [families, hiRes, store.mockups],
  );

  const askForStyleName = (files: File[]) => {
    if (!files.length) return;
    setPendingFiles(files);
    const first = files[0]!;
    setPendingSuggested(suggestedStyleNameFromFile(first.name, first.webkitRelativePath || first.name));
  };

  const ingestFiles = async (
    files: File[],
    uploadingKey: string,
    pinFamily?: { familyId: string; familyLabel: string },
    pinCategory?: GearCategory,
  ) => {
    setUploading(uploadingKey);
    const entries: Array<{
      id?: string;
      name: string;
      relativePath?: string;
      dataUrl: string;
      category?: GearCategory;
      familyId?: string;
      familyLabel?: string;
    }> = [];
    let skipped = 0;
    let lastError = '';
    for (const file of files) {
      const fileError = gearMockupFileError(file);
      if (fileError) {
        skipped += 1;
        lastError = fileError;
        continue;
      }
      try {
        const id = newUploadId('gear');
        entries.push({
          id,
          name: file.name,
          relativePath: file.webkitRelativePath || file.name,
          dataUrl: await storeFilePreview(id, file),
          category: pinCategory,
          familyId: pinFamily?.familyId,
          familyLabel: pinFamily?.familyLabel,
        });
      } catch {
        skipped += 1;
        lastError = 'Could not read that file.';
      }
    }
    if (entries.length === 0) {
      setNotice(lastError || (skipped ? `No mockups imported. Skipped ${skipped}.` : 'Choose mockup files.'));
      setUploading(null);
      return;
    }
    const result = addGearMockupsFromEntries(store, entries, pinCategory ?? 'tee', actorName);
    writeLocalJson(GEAR_SELECTIONS_STORAGE_KEY, persistGearSelectionsStore(result.store));
    setStore(result.store);
    void saveGearStore(buildGearStorePayload(result.store, actorEmail || actorName));
    if (pinFamily) setActiveTab(pinFamily.familyId);
    else {
      const added = result.store.mockups.find((row) => row.id === entries[0]?.id);
      if (added) setActiveTab(added.familyId);
    }
    setNotice(
      skipped || result.skipped
        ? `${result.notice}${lastError ? ` ${lastError}` : ''}${result.error ? ` ${result.error}` : ''}`
        : '',
    );
    setUploading(null);
  };

  const persistStore = (next: GearSelectionsStore) => {
    writeLocalJson(GEAR_SELECTIONS_STORAGE_KEY, persistGearSelectionsStore(next));
    setStore(next);
    void saveGearStore(buildGearStorePayload(next, actorEmail || actorName)).then((result) => {
      if (!result.ok) {
        setPersistNotice(result.error || 'Could not save gear to the database.');
        return;
      }
      setPersistNotice(result.skipped ? SAVE_DATABASE_SKIPPED_NOTICE : SAVED_TO_DATABASE_NOTICE);
    });
  };

  const handlePick = (id: string, role?: GearPickRole) => {
    if (!role && !isPicked(store, id)) {
      setPickForId(id);
      setNotice('');
      return;
    }
    const result = toggleAngelaPick(store, id, role);
    if (result.error) {
      setNotice(result.error);
      return;
    }
    persistStore(result.store);
    setPickForId(null);
    setNotice('');
  };

  const handleShirtHoodieToggle = (familyId: string) => {
    const result = toggleShirtHoodieStyle(store, familyId);
    if (result.error) {
      setNotice(result.error);
      return;
    }
    persistStore(result.store);
    setNotice('');
  };

  const handleHatColorAdd = (colorId: Parameters<typeof addHatColor>[1]) => {
    const result = addHatColor(store, colorId);
    if (result.error) {
      setNotice(result.error);
      return;
    }
    persistStore(result.store);
    setNotice('');
  };

  const handleHatColorRemove = (colorId: string) => {
    persistStore(removeHatColor(store, colorId));
    setNotice('');
  };

  const handleShirtHoodieBrandAdd = (brandId: Parameters<typeof addShirtHoodieBrand>[1]) => {
    const result = addShirtHoodieBrand(store, brandId);
    if (result.error) {
      setNotice(result.error);
      return;
    }
    persistStore(result.store);
    setNotice('');
  };

  const handleShirtHoodieBrandRemove = (brandId: string) => {
    persistStore(removeShirtHoodieBrand(store, brandId));
    setNotice('');
  };

  const openMockupPreview = (item: { id: string; name: string; dataUrl: string }) => {
    showImagePreview(
      imagePreviewFromAsset({ ...item, dataUrl: hiRes[item.id] || item.dataUrl }, 'mockup'),
      setPreview,
    );
  };

  const openHatPreview = (color: Parameters<typeof imagePreviewFromHatColor>[0]) => {
    showImagePreview(imagePreviewFromHatColor(color), setPreview);
  };

  const activateStep = (step: GearPhase1Step) => {
    setChooseStep((prev) => toggleGearPhase1Step(prev, step));
  };

  const phase1Pickers = (startOpen = false, selectedOnly = false, tabOnly = false) => (
    <div
      className={startOpen ? 'space-y-3' : GEAR_PHASE1_PICKER_ROW_CLASS}
      role={startOpen ? undefined : 'tablist'}
      data-testid="gear-phase1-pickers"
    >
      <GearShirtHoodieStylePicker
        store={store}
        startOpen={startOpen}
        selectedOnly={selectedOnly}
        tabOnly={tabOnly}
        active={chooseStep === 'style'}
        onActivate={tabOnly ? () => activateStep('style') : undefined}
        srcOf={(item) => hiRes[item.id] || item.dataUrl}
        onToggle={handleShirtHoodieToggle}
        onOpen={openMockupPreview}
      />
      <GearHatColorPicker
        store={store}
        startOpen={startOpen}
        selectedOnly={selectedOnly}
        tabOnly={tabOnly}
        active={chooseStep === 'hat'}
        onActivate={tabOnly ? () => activateStep('hat') : undefined}
        onAdd={handleHatColorAdd}
        onRemove={handleHatColorRemove}
        onOpen={openHatPreview}
        onCompare={(colorId) => handleCompareToggle(gearHatCompareId(colorId))}
        comparingIds={compareIds}
        compareLimit={GEAR_COMPARE_LIMIT}
      />
    </div>
  );

  const handleRemoveCard = (id: string) => {
    if (!gearCardDeleteVisible(canDelete)) return;
    const familyId = store.mockups.find((item) => item.id === id)?.familyId;
    persistStore(removeGearMockup(store, id));
    setCompareIds((prev) => {
      const next = prev.filter((row) => row !== id);
      if (!familyId) return next;
      const stillHasFamily = store.mockups.some((item) => item.id !== id && item.familyId === familyId);
      return stillHasFamily ? next : next.filter((row) => row !== gearStyleCompareId(familyId));
    });
    setNotice('');
  };

  const renameMockup = renameMockupId ? store.mockups.find((item) => item.id === renameMockupId) : null;

  const cardSelectCompareRow = (item: { id: string; name: string; familyId: string; category: 'tee' | 'hoodie' | 'hat' }) => {
    const nameOnBack = isNameOnBackMockup(item);
    const comparing = compareIds.includes(item.id);
    if (!canCompare && !(nameOnBack && allowSelect)) return null;
    return (
      <div className="flex flex-wrap items-center gap-1.5 w-full" data-testid={`gear-card-actions-${item.id}`}>
        {nameOnBack && allowSelect ? (
          <button
            type="button"
            disabled
            className="min-h-[44px] flex-1 px-2 rounded-xl text-[11px] font-black uppercase inline-flex items-center justify-center border-2 bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA] opacity-80"
            data-testid={`gear-pick-${item.id}`}
          >
            {GEAR_NAME_ON_BACK_PHASE_LABEL}
          </button>
        ) : null}
        {canCompare ? (
          <button
            type="button"
            disabled={!comparing && compareIds.length >= GEAR_COMPARE_LIMIT}
            aria-pressed={comparing}
            onClick={() => handleCompareToggle(item.id)}
            className={`min-h-[44px] flex-1 px-2 rounded-xl text-[11px] font-black uppercase inline-flex items-center justify-center border-2 disabled:opacity-40 disabled:cursor-not-allowed ${
              comparing
                ? 'bg-[#EA580C] text-white border-[#FDBA74] shadow-[0_4px_12px_rgba(234,88,12,0.28)] cursor-pointer'
                : `${CF_CHIP_OFF} cursor-pointer`
            }`}
            data-testid={`gear-compare-${item.id}`}
          >
            {GEAR_COMPARE_LABEL}
          </button>
        ) : null}
      </div>
    );
  };

  const cardActionButtons = (item: { id: string; name: string }) => (
    <div className="contents">
      <button
        type="button"
        onClick={() => void handlePdf([item], item.name)}
        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border-2 border-[#1F1917] bg-white cursor-pointer"
        aria-label={`Save or print PDF for ${item.name}`}
        data-testid={`gear-pdf-${item.id}`}
      >
        <FileDown className="w-4 h-4" />
      </button>
      {canConfigure ? (
        <button
          type="button"
          onClick={() => {
            setRenameMockupId(item.id);
            setPendingSuggested(item.name);
          }}
          className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] bg-white text-[11px] font-black uppercase cursor-pointer inline-flex items-center gap-1"
          data-testid={`gear-rename-card-${item.id}`}
        >
          <Pencil className="w-3.5 h-3.5" />
          Rename
        </button>
      ) : null}
      {gearCardDeleteVisible(canDelete) ? (
        <button
          type="button"
          onClick={() => handleRemoveCard(item.id)}
          className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] bg-white text-[#9A3412] text-[11px] font-black uppercase cursor-pointer inline-flex items-center gap-1 hover:bg-[#FFF7ED]"
          aria-label={`Delete ${item.name}`}
          data-testid={`gear-delete-${item.id}`}
        >
          <Trash2 className="w-4 h-4" />
          {GEAR_DELETE_LABEL}
        </button>
      ) : null}
    </div>
  );

  const handleCompareToggle = (id: string) => {
    const result = toggleStyleCompare(compareIds, id);
    setCompareIds(result.selected);
    setNotice(result.error ?? '');
    if (result.selected.length === 0) setSideBySideOpen(false);
  };

  const handleCompareChoiceSelect = (id: string) => {
    const ref = parseGearCompareRef(id);
    if (ref.kind === 'style') {
      handleShirtHoodieToggle(ref.id);
      return;
    }
    if (ref.kind === 'brand' && isGearShirtHoodieBrandId(ref.id)) {
      if (selectedBrands.includes(ref.id)) handleShirtHoodieBrandRemove(ref.id);
      else handleShirtHoodieBrandAdd(ref.id);
      return;
    }
    if (ref.kind === 'hat' && isGearHatColorId(ref.id)) {
      if (selectedHats.some((color) => color.id === ref.id)) handleHatColorRemove(ref.id);
      else handleHatColorAdd(ref.id);
      return;
    }
    handlePick(id);
  };

  const openSideBySide = () => {
    if (compareIds.length === 0) {
      setNotice('Check at least one design, then tap Compare.');
      return;
    }
    setSideBySideOpen(true);
    setActiveTab(GEAR_COMPARE_RESULT_TAB_ID);
    setNotice('');
  };

  const handleSaveDatabase = async () => {
    setSaving(true);
    writeLocalJson(GEAR_SELECTIONS_STORAGE_KEY, persistGearSelectionsStore(store));
    const result = await saveGearStore(buildGearStorePayload(store, actorEmail || actorName));
    setSaving(false);
    if (!result.ok) {
      setPersistNotice(result.error || 'Could not save gear to the database.');
      return;
    }
    setPersistNotice(result.skipped ? SAVE_DATABASE_SKIPPED_NOTICE : SAVED_TO_DATABASE_NOTICE);
  };

  const handlePdf = async (
    items: Array<{ id?: string; name: string; dataUrl?: string }>,
    title: string,
  ) => {
    const result = items.length === 1 ? await openAssetImagePdf(items[0]!) : await openAssetGalleryPdf(title, items);
    if (!result.ok && result.error) setNotice(result.error);
  };

  return (
    <section className={`${embedded ? 'space-y-1' : 'space-y-2'} animate-fadeIn`} data-testid="gear-selections-page">
      {embedded ? null : (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider">
          <Shirt className="w-3.5 h-3.5" /> {GEAR_PAGE_LABEL}
        </div>
      )}
      {persistNotice ? (
        <p className="text-sm font-semibold text-[#3F3832]" data-testid="gear-persist-notice">
          {persistNotice}
        </p>
      ) : null}
      {notice ? (
        <p className="text-sm font-semibold text-[#9A3412]" role="status" data-testid="gear-selections-notice">
          {notice}
        </p>
      ) : null}
      {canConfigure ? (
        <div className="flex flex-wrap items-center gap-2" data-testid="gear-upload-bar">
          <input
            ref={newStyleInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            aria-label="Choose gear files"
            data-testid="gear-selections-files-input"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = '';
              if (files.length) askForStyleName(files);
            }}
          />
          <button
            type="button"
            onClick={() => newStyleInput.current?.click()}
            disabled={uploading === 'folder'}
            className={`${CF_POP_BTN} disabled:opacity-60`}
            data-testid="gear-selections-choose-files"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading === 'folder' ? 'Loading' : ADD_CARDS_TO_NEW_STYLE_LABEL}
          </button>
          {selectedFamily ? (
            <>
              <input
                ref={(el) => {
                  fileInputs.current[selectedFamily.id] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="sr-only"
                aria-label={`Upload ${selectedFamily.label} mockups`}
                data-testid={`gear-upload-input-${selectedFamily.id}`}
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = '';
                  if (files.length) {
                    void ingestFiles(files, selectedFamily.id, {
                      familyId: selectedFamily.id,
                      familyLabel: selectedFamily.label,
                    });
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputs.current[selectedFamily.id]?.click()}
                disabled={uploading === selectedFamily.id}
                className={`${CF_POP_BTN} disabled:opacity-60`}
                data-testid={`gear-upload-${selectedFamily.id}`}
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading === selectedFamily.id ? 'Saving' : ADD_CARDS_TO_STYLE_LABEL}
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => void handleSaveDatabase()}
            disabled={saving || !ready}
            className="min-h-[44px] px-3 rounded-xl border-2 border-[#C2410C] bg-[#EA580C] text-white text-[11px] font-black uppercase cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60"
            data-testid="gear-save-database"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? SAVING_TO_DATABASE_LABEL : SAVE_TO_DATABASE_LABEL}
          </button>
        </div>
      ) : null}
      {allowSelect && !showingSelected ? (
        <div className="space-y-2" data-testid="gear-choose-tabs-top">
          {phase1Pickers(false, false, true)}
        </div>
      ) : null}
      {allowSelect && chooseStep && !showingSelected && !showingCompare && !showingSideBySide ? (
        <div data-testid="gear-choose-step-page">
          {chooseStep === 'style' ? (
            <GearShirtHoodieStylePicker
              store={store}
              panelOnly
              startOpen
              srcOf={(item) => hiRes[item.id] || item.dataUrl}
              onToggle={handleShirtHoodieToggle}
              onOpen={openMockupPreview}
            />
          ) : null}
          {chooseStep === 'hat' ? (
            <GearHatColorPicker
              store={store}
              panelOnly
              startOpen
              onAdd={handleHatColorAdd}
              onRemove={handleHatColorRemove}
              onOpen={openHatPreview}
              onCompare={(colorId) => handleCompareToggle(gearHatCompareId(colorId))}
              comparingIds={compareIds}
              compareLimit={GEAR_COMPARE_LIMIT}
            />
          ) : null}
        </div>
      ) : null}
      {showCollectionRow ? (
      <>
      <div className="space-y-2" data-testid="gear-collection-tabs">
        <div className="flex flex-wrap items-end justify-between gap-2">
        <div
          className={GEAR_PHASE1_PICKER_ROW_CLASS}
          role="tablist"
          aria-label={GEAR_COLLECTIONS_HEADING}
        >
          <button
            type="button"
            role="tab"
            aria-selected={showingShowAll}
            onClick={() => setActiveTab(GEAR_SHOW_ALL_TAB_ID)}
            className={gearCollectionTabClass(showingShowAll)}
            data-testid="gear-collection-tab-show-all"
          >
            {GEAR_SHOW_ALL_TAB_LABEL}
            <span className={gearCollectionTabMetaClass(showingShowAll)}>{store.mockups.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={showingCompare}
            onClick={() => setActiveTab(GEAR_COMPARE_TAB_ID)}
            className={gearCollectionTabClass(showingCompare, gearCompareTabHighlights(compareIds.length, showingCompare))}
            data-testid="gear-compare-tab"
          >
            {GEAR_COMPARE_LABEL}
            <span className={gearCollectionTabMetaClass(showingCompare)}>
              {compareIds.length}/{GEAR_COMPARE_LIMIT}
            </span>
          </button>
          {compareResultTabOpen ? (
            <button
              type="button"
              role="tab"
              aria-selected={showingSideBySide}
              onClick={() => {
                setSideBySideOpen(true);
                setActiveTab(GEAR_SIDE_BY_SIDE_TAB_ID);
              }}
              className={`${gearCollectionTabClass(showingSideBySide)} ${
                gearSideBySideTabBlinks(compareIds.length, showingSideBySide) ? GEAR_SIDE_BY_SIDE_BLINK_CLASS : ''
              }`}
              data-testid="gear-side-by-side-tab"
            >
              {GEAR_SIDE_BY_SIDE_LABEL}
              <span className={gearCollectionTabMetaClass(showingSideBySide)}>
                {compareIds.length}/{GEAR_COMPARE_LIMIT}
              </span>
            </button>
          ) : null}
          {allowSelect ? (
            <button
              type="button"
              role="tab"
              aria-selected={showingSelected}
              onClick={() => setActiveTab(GEAR_SELECTED_TAB_ID)}
              className={gearCollectionTabClass(
                showingSelected,
                gearSelectedTabHighlights(
                  shirtHoodieStyleCount,
                  selectedHats.length,
                  showingSelected,
                  selectedBrands.length,
                ),
              )}
              data-testid="gear-selected-tab"
            >
              {GEAR_SELECTED_TAB_LABEL}
              <span className={gearCollectionTabMetaClass(showingSelected)}>
                {shirtHoodieStyleCount}/{GEAR_SHIRT_HOODIE_STYLE_LIMIT} {GEAR_TSHIRT_STYLE_LABEL} ·{' '}
                {selectedHats.length}/{GEAR_HAT_COLOR_LIMIT} {GEAR_HAT_COLOR_LABEL}
              </span>
            </button>
          ) : null}
        </div>
        {showStyleBrowse && selectedFamily && selectedFamily.items.length > 0 ? (
          <div className="flex flex-wrap items-end gap-1 ml-auto" data-testid="gear-tab-export-actions">
            <button
              type="button"
              onClick={() => void handlePdf(selectedFamily.items, selectedFamily.label)}
              className="min-h-[44px] px-2 py-1 -mb-px rounded-t-lg text-[10px] font-black uppercase tracking-wide cursor-pointer inline-flex items-center gap-1 border border-[#1F1917] bg-[#FAF8F5] text-[#3F3832] hover:bg-[#FFF7ED] hover:text-[#C2410C]"
              data-testid={`gear-style-print-${selectedFamily.id}`}
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={() => void handlePdf(selectedFamily.items, selectedFamily.label)}
              className="min-h-[44px] px-2 py-1 -mb-px rounded-t-lg text-[10px] font-black uppercase tracking-wide cursor-pointer inline-flex items-center gap-1 border border-[#FDBA74] bg-[#EA580C] text-white"
              data-testid={`gear-style-pdf-${selectedFamily.id}`}
            >
              <FileDown className="w-3.5 h-3.5" />
              PDF
            </button>
          </div>
        ) : null}
        </div>
        <div
          className={GEAR_STYLE_CHOOSE_GRID_CLASS}
          role="tablist"
          aria-label={GEAR_TSHIRT_STYLE_LABEL}
          data-testid="gear-style-choose-grid"
        >
          {families.map((family, familyIndex) => {
            const active = !showingCompare && !showingSideBySide && !showingSelected && !showingShowAll && family.id === selectedFamilyId;
            const familyPicked = isShirtHoodieFamilyPicked(store, family.id);
            const familyComparing = isGearStyleComparing(compareIds, family.id);
            const tabLabel = gearCollectionTabLabel(family.id, family.label);
            const canReorder = canConfigure && families.length > 1;
            const tabThumb = gearStyleTabThumb(family.items);
            const tabThumbSrc = tabThumb?.dataUrl;
            return (
              <div
                key={family.id}
                className={`flex flex-col min-w-0 h-full rounded-xl overflow-hidden ${draggingFamilyId === family.id ? 'opacity-50' : ''}`}
                onDragOver={(event) => {
                  if (!canReorder || !draggingFamilyId || draggingFamilyId === family.id) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(event) => {
                  if (!canReorder) return;
                  event.preventDefault();
                  const fromId = event.dataTransfer.getData('text/plain') || draggingFamilyId;
                  setDraggingFamilyId(null);
                  if (!fromId || fromId === family.id) return;
                  persistStore(reorderGearStyleFamilyById(store, fromId, family.id));
                  setActiveTab(fromId);
                }}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  draggable={canReorder}
                  onDragStart={(event) => {
                    if (!canReorder) return;
                    event.dataTransfer.setData('text/plain', family.id);
                    event.dataTransfer.effectAllowed = 'move';
                    setDraggingFamilyId(family.id);
                  }}
                  onDragEnd={() => setDraggingFamilyId(null)}
                  onClick={() => setActiveTab(family.id)}
                  className={`${gearStyleChooseBoxClass(active, (familyPicked || familyComparing) && !active)} ${
                    canRenameHeadings || canReorder ? 'rounded-b-none border-b-0' : ''
                  } ${canReorder ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  data-testid={`gear-collection-tab-${family.id}`}
                >
                  {tabThumbSrc ? (
                    <img
                      src={tabThumbSrc}
                      alt=""
                      width={24}
                      height={24}
                      className={GEAR_STYLE_CHOOSE_THUMB_CLASS}
                      data-testid={`gear-collection-tab-thumb-${family.id}`}
                    />
                  ) : (
                    <Shirt className="w-4 h-4 shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{tabLabel}</span>
                  <span className={gearCollectionTabMetaClass(active)}>{family.items.length}</span>
                </button>
                {canRenameHeadings || canReorder ? (
                  <div className="flex items-stretch border-2 border-t-0 border-[#1F1917] rounded-b-xl overflow-hidden bg-white">
                    {canRenameHeadings ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab(family.id);
                          setRenameFamilyId(family.id);
                          setPendingSuggested(family.label);
                        }}
                        className="min-h-[44px] min-w-[44px] flex-1 px-2 text-[#9A3412] cursor-pointer inline-flex items-center justify-center hover:bg-[#FFF7ED]"
                        aria-label={`Rename ${tabLabel}`}
                        data-testid={`gear-rename-tab-${family.id}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                    {canReorder ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            persistStore(moveGearStyleFamily(store, family.id, -1));
                            setActiveTab(family.id);
                          }}
                          disabled={familyIndex === 0}
                          className="min-h-[44px] min-w-[44px] flex-1 px-2 text-[#1F1917] cursor-pointer inline-flex items-center justify-center hover:bg-[#FFF7ED] disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`${GEAR_MOVE_STYLE_LEFT_LABEL} ${tabLabel}`}
                          data-testid={`gear-style-tab-move-left-${family.id}`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            persistStore(moveGearStyleFamily(store, family.id, 1));
                            setActiveTab(family.id);
                          }}
                          disabled={familyIndex === families.length - 1}
                          className="min-h-[44px] min-w-[44px] flex-1 px-2 text-[#1F1917] cursor-pointer inline-flex items-center justify-center hover:bg-[#FFF7ED] disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`${GEAR_MOVE_STYLE_RIGHT_LABEL} ${tabLabel}`}
                          data-testid={`gear-style-tab-move-right-${family.id}`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      {canConfigure && families.length > 1 ? (
        <p className="text-[10px] font-mono font-black uppercase text-[#C2410C]" data-testid="gear-reorder-styles-hint">
          {GEAR_REORDER_STYLES_HINT}
        </p>
      ) : null}
      </>
      ) : null}
      {showStyleBrowse && selectedFamily ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {allowSelect ? (
            <button
              type="button"
              disabled={gearCollectionSelectDisabled(store, selectedFamily.id)}
              onClick={() => handleShirtHoodieToggle(selectedFamily.id)}
              className={`min-h-[44px] px-3 rounded-xl text-[11px] font-black uppercase inline-flex items-center justify-center border-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                isShirtHoodieFamilyPicked(store, selectedFamily.id)
                  ? 'bg-[#EA580C] text-white border-[#FDBA74] shadow-[0_4px_12px_rgba(234,88,12,0.28)] cursor-pointer'
                  : `${CF_CHIP_OFF} cursor-pointer`
              }`}
              data-testid={`gear-collection-select-${selectedFamily.id}`}
            >
              {isShirtHoodieFamilyPicked(store, selectedFamily.id) ? GEAR_UNSELECT_LABEL : GEAR_SELECT_LABEL}
            </button>
          ) : null}
          {canCompare ? (
            <button
              type="button"
              disabled={gearStyleCompareDisabled(compareIds, selectedFamily.id)}
              onClick={() => handleCompareToggle(gearStyleCompareId(selectedFamily.id))}
              className={`min-h-[44px] px-3 rounded-xl text-[11px] font-black uppercase inline-flex items-center justify-center border-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                isGearStyleComparing(compareIds, selectedFamily.id)
                  ? 'bg-[#EA580C] text-white border-[#FDBA74] shadow-[0_4px_12px_rgba(234,88,12,0.28)] cursor-pointer'
                  : `${CF_CHIP_OFF} cursor-pointer`
              }`}
              data-testid={`gear-collection-compare-${selectedFamily.id}`}
            >
              {GEAR_COMPARE_LABEL}
            </button>
          ) : null}
          {canConfigure ? (
            <button
              type="button"
              onClick={() => fileInputs.current[selectedFamily.id]?.click()}
              disabled={uploading === selectedFamily.id}
              className={`${CF_POP_BTN} disabled:opacity-60`}
              data-testid={`gear-collection-add-${selectedFamily.id}`}
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading === selectedFamily.id ? 'Saving' : ADD_CARDS_TO_STYLE_LABEL}
            </button>
          ) : null}
          <span className="text-[10px] font-mono font-black uppercase text-[#C2410C]">
            {selectedFamily.items.length} cards
          </span>
          {canRenameHeadings ? (
            <button
              type="button"
              onClick={() => {
                setRenameFamilyId(selectedFamily.id);
                setPendingSuggested(selectedFamily.label);
              }}
              aria-label={`Rename ${gearCollectionTabLabel(selectedFamily.id, selectedFamily.label)}`}
              className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] bg-white text-[11px] font-black uppercase cursor-pointer"
              data-testid={`gear-rename-${selectedFamily.id}`}
            >
              Rename
            </button>
          ) : null}
          {canCompare && compareIds.length > 0 ? (
            <button
              type="button"
              onClick={openSideBySide}
              className={`${CF_POP_BTN} ${
                gearSideBySideTabBlinks(compareIds.length, showingSideBySide) ? GEAR_SIDE_BY_SIDE_BLINK_CLASS : ''
              }`}
              data-testid="gear-compare-open-collection"
            >
              {GEAR_COMPARE_UP_TO_LABEL}
              <span className="opacity-80">
                {compareIds.length}/{GEAR_COMPARE_LIMIT}
              </span>
            </button>
          ) : null}
        </div>
      ) : null}

      {showStyleBrowse || showingSelected || showingCompare || showingSideBySide ? (
      <div className="space-y-2" data-testid="gear-selections-list">
        {showingShowAll ? (
          <div className="space-y-3" data-testid="gear-show-all-panel">
            {families.length === 0 ? (
              <p className="text-sm text-[#3F3832] px-1">
                No style cards yet. Upload files named like {ASSET_LIBRARY_EXAMPLE_STYLES[0]} or{' '}
                {ASSET_LIBRARY_EXAMPLE_STYLES[1]}.
              </p>
            ) : (
              <section
                className="rounded-2xl border border-[#E8DFD2] bg-white overflow-hidden"
                data-testid="gear-show-all-all"
              >
                <div className="px-3 pb-3 pt-2">
                  <ThumbCarousel
                    items={showAllItems}
                    getSrc={(item) => hiRes[item.id] || item.dataUrl}
                    getName={(item) => item.name}
                    testId="gear-show-all"
                    onOpen={openMockupPreview}
                    renderSlide={(item) => {
                      const pickedRow = isPicked(store, item.id) || isShirtHoodieFamilyPicked(store, item.familyId);
                      const nameOnBack = isNameOnBackMockup(item);
                      return (
                        <article
                          key={item.id}
                          className={`${gearStyleCardClass(item.category)} w-full min-w-0 flex flex-col gap-2 rounded-xl border p-2 ${
                            pickedRow ? 'border-[#C2410C] bg-[#FFF7ED]' : 'border-[#E8DFD2] bg-white'
                          }`}
                          data-testid={`gear-show-all-card-${item.id}`}
                        >
                          {cardSelectCompareRow(item)}
                          <UploadThumb
                            src={hiRes[item.id] || item.dataUrl}
                            alt={`${item.name} mockup`}
                            size="md"
                            fill
                            contain
                            onClick={() => openMockupPreview(item)}
                          />
                          <p className="text-sm font-semibold text-[#1F1917] truncate">{item.name}</p>
                          {nameOnBack ? (
                            <p
                              className="text-[10px] font-mono font-black uppercase text-[#C2410C]"
                              data-testid={`gear-phase2-${item.id}`}
                            >
                              {GEAR_NAME_ON_BACK_PHASE_LABEL} · {GEAR_NAME_ON_BACK_LABEL}
                            </p>
                          ) : null}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {cardActionButtons(item)}
                          </div>
                        </article>
                      );
                    }}
                  />
                </div>
              </section>
            )}
          </div>
        ) : null}
        {selectedFamily ? (
          <section
            key={selectedFamily.id}
            className="rounded-2xl border border-[#E8DFD2] bg-white overflow-hidden"
            data-testid={`gear-style-${selectedFamily.id}`}
          >
            <div className="px-3 pb-3 pt-2">
              <ThumbCarousel
                key={selectedFamily.id}
                items={selectedFamilyItems}
                getSrc={(item) => hiRes[item.id] || item.dataUrl}
                getName={(item) => item.name}
                testId={`gear-style-${selectedFamily.id}`}
                onOpen={openMockupPreview}
                onReorder={
                  canConfigure
                    ? (from, to) => setStore(reorderGearMockupsInFamily(store, selectedFamily.id, from, to))
                    : undefined
                }
                renderSlide={(item) => {
                  const pickedRow = isPicked(store, item.id) || isShirtHoodieFamilyPicked(store, item.familyId);
                  const nameOnBack = isNameOnBackMockup(item);
                  return (
                    <article
                      key={item.id}
                      className={`${gearStyleCardClass(item.category)} w-full min-w-0 flex flex-col gap-2 rounded-xl border p-2 ${
                        pickedRow ? 'border-[#C2410C] bg-[#FFF7ED]' : 'border-[#E8DFD2] bg-white'
                      }`}
                      data-testid={`gear-mockup-${item.id}`}
                    >
                      {cardSelectCompareRow(item)}
                      <UploadThumb
                        src={hiRes[item.id] || item.dataUrl}
                        alt={`${item.name} mockup`}
                        size="md"
                        fill
                        contain
                        onClick={() => openMockupPreview(item)}
                      />
                      <p className="text-sm font-semibold text-[#1F1917] truncate">{item.name}</p>
                      {nameOnBack ? (
                        <p
                          className="text-[10px] font-mono font-black uppercase text-[#C2410C]"
                          data-testid={`gear-phase2-${item.id}`}
                        >
                          {GEAR_NAME_ON_BACK_PHASE_LABEL} · {GEAR_NAME_ON_BACK_LABEL}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {cardActionButtons(item)}
                      </div>
                    </article>
                  );
                }}
              />
            </div>
          </section>
        ) : null}
        {showingSelected ? (
          <div className="space-y-3" data-testid="gear-selected-panel">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-mono font-black uppercase tracking-wider text-[#C2410C]" data-testid="gear-pick-summary">
                Angela&apos;s picks: {summary}
              </p>
              <button
                type="button"
                onClick={() => {
                  persistStore(clearAngelaPicks(store));
                  setNotice('');
                }}
                disabled={
                  store.picks.length === 0 &&
                  store.hatColorIds.length === 0 &&
                  store.shirtHoodieBrandIds.length === 0
                }
                className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] bg-white text-[11px] font-black uppercase cursor-pointer disabled:opacity-40"
                data-testid="gear-unselect-all-selected"
              >
                {GEAR_UNSELECT_ALL_LABEL}
              </button>
            </div>
            <div data-testid="gear-selected-shirt-hoodie">{phase1Pickers(true, true)}</div>
          </div>
        ) : null}
        {showingCompare ? (
          <div className="space-y-3" data-testid="gear-compare-selected">
            <div className="flex flex-wrap items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setCompareIds([]);
                  setSideBySideOpen(false);
                  setNotice('');
                }}
                disabled={compareIds.length === 0}
                className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] bg-white text-[11px] font-black uppercase cursor-pointer disabled:opacity-40"
                data-testid="gear-unselect-all-compare"
              >
                {GEAR_UNSELECT_ALL_LABEL}
              </button>
            </div>
            <GearCompareList
              items={compareChoices}
              selectedIds={compareIds}
              onToggle={handleCompareToggle}
            />
            <button
              type="button"
              onClick={openSideBySide}
              disabled={compareIds.length === 0}
              className={`${CF_POP_BTN} disabled:opacity-40`}
              data-testid="gear-compare-open"
            >
              {GEAR_COMPARE_UP_TO_LABEL}
            </button>
          </div>
        ) : null}
        {showingSideBySide ? (
          compareItems.length > 0 ? (
            <StyleCompareTray
              title={GEAR_SIDE_BY_SIDE_LABEL}
              items={compareItems}
              selectedIds={[
                ...pickedIds,
                ...pickedShirtHoodieFamilyIds(store).map((id) => gearStyleCompareId(id)),
                ...selectedBrands.map((id) => gearBrandCompareId(id)),
                ...selectedHats.map((color) => gearHatCompareId(color.id)),
              ]}
              onSelect={allowSelect ? handleCompareChoiceSelect : undefined}
              onOpen={(item) => {
                if (!item.src) return;
                showImagePreview(
                  imagePreviewFromAsset({ id: item.id, name: item.name, dataUrl: item.src }, 'mockup'),
                  setPreview,
                );
              }}
              onRemove={(id) => {
                setCompareIds((prev) => {
                  const next = prev.filter((row) => row !== id);
                  if (next.length === 0) setSideBySideOpen(false);
                  return next;
                });
              }}
              onClear={() => {
                setCompareIds([]);
                setSideBySideOpen(false);
                setActiveTab(GEAR_COMPARE_TAB_ID);
              }}
            />
          ) : (
            <p className="text-sm text-[#3F3832] px-1" data-testid="gear-side-by-side-empty">
              {GEAR_COMPARE_UP_TO_LABEL} on Compare, then open them here side by side.
            </p>
          )
        ) : null}
        {families.length === 0 && !showingCompare && !showingSelected && !showingSideBySide && !showingShowAll ? (
          <p className="text-sm text-[#3F3832] px-1">
            No style cards yet. Upload files named like {ASSET_LIBRARY_EXAMPLE_STYLES[0]} or{' '}
            {ASSET_LIBRARY_EXAMPLE_STYLES[1]}.
          </p>
        ) : null}
      </div>
      ) : null}
      <StyleNameDialog
        open={Boolean(pendingFiles) || Boolean(renameFamilyId) || Boolean(renameMockup)}
        suggested={pendingSuggested}
        title={
          renameMockup ? 'Rename this card' : renameFamilyId ? 'Rename this style' : 'Name this style'
        }
        saveLabel={renameMockup || renameFamilyId ? 'Save name' : 'Save cards'}
        fieldLabel={renameMockup ? 'Card name' : 'Style name'}
        hint={
          renameMockup
            ? 'This updates the file name on the card only.'
            : 'Cards with this name stay together — Tee, Hoodie, and Hat on one style.'
        }
        plainName={Boolean(renameMockup)}
        onCancel={() => {
          setPendingFiles(null);
          setRenameFamilyId(null);
          setRenameMockupId(null);
        }}
        onSave={(label) => {
          if (renameMockupId) {
            const result = renameGearMockup(store, renameMockupId, label);
            if (result.error) setNotice(result.error);
            else {
              persistStore(result.store);
              setNotice('');
            }
            setRenameMockupId(null);
            return;
          }
          if (renameFamilyId) {
            if (!canRenameHeadings) {
              setRenameFamilyId(null);
              return;
            }
            const stayOnShowAll = isGearShowAllTab(activeTab);
            const result = renameSharedMerchCollection(store, loadAssetLibraryStyles(), renameFamilyId, label);
            if (result.error) setNotice(result.error);
            else {
              writeLocalJson(GEAR_SELECTIONS_STORAGE_KEY, persistGearSelectionsStore(result.gear));
              writeLocalJson(ASSET_LIBRARY_STYLE_STORAGE_KEY, persistAssetLibraryStyleStore(result.library));
              setStore(result.gear);
              if (!stayOnShowAll) setActiveTab(result.familyId);
              void saveGearStore(buildGearStorePayload(result.gear, actorEmail || actorName));
              setNotice('');
            }
            setRenameFamilyId(null);
            return;
          }
          const named = namedMerchStyleFamily(label);
          const files = pendingFiles ?? [];
          setPendingFiles(null);
          if ('error' in named) {
            setNotice(named.error);
            return;
          }
          void ingestFiles(files, 'folder', named.family);
        }}
      />
      <ImagePreviewLightbox preview={preview} onClose={() => setPreview(null)} />
    </section>
  );
};
