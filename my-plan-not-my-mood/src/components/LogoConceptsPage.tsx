import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, Pencil, Save, Stamp, Trash2 } from 'lucide-react';
import { FolderImportBar } from './FolderImportBar';
import { CF_CHIP_OFF, CF_POP_BTN } from '../lib/contentFactory';
import {
  LOGO_CAROUSEL_DESKTOP_MQ,
  LOGO_CONCEPTS_STORAGE_KEY,
  MAIN_LOGO_LABEL,
  LOGO_ALL_TAB_ID,
  LOGO_ALL_TAB_LABEL,
  LOGO_SELECTED_TAB_ID,
  LOGO_SELECTED_TAB_LABEL,
  UNSELECT_LABEL,
  chosenLogo,
  isLogoSelectedTab,
  MAX_LOGO_NAME_LENGTH,
  addLogoConceptsFromEntries,
  allLogoConcepts,
  clampLogoCarouselStart,
  clampLogoMiniFocus,
  emptyLogoConceptsStore,
  isChosenLogo,
  logoCarouselPositionLabel,
  logoCarouselVisibleCount,
  logoCarouselWindow,
  logoConceptFileError,
  LOGO_MINI_STRIP_CLASS,
  logoConceptsSummary,
  normalizeLogoConceptsStore,
  SHOW_ALL_LOGOS_LABEL,
  SHOW_CAROUSEL_LOGOS_LABEL,
  logoShowAllStartsOpen,
  persistLogoConceptsStore,
  removeLogoConcept,
  renameLogoConcept,
  reorderLogoConcepts,
  chooseLogoConcept,
  type LogoConcept,
  type LogoConceptsStore,
} from '../lib/logoConcepts';
import { newUploadId, storeFilePreview, withHydratedPreviews, writeLocalJson } from '../lib/idbFileStore';
import {
  SAVE_DATABASE_SKIPPED_NOTICE,
  SAVE_TO_DATABASE_LABEL,
  SAVED_TO_DATABASE_NOTICE,
  SAVING_TO_DATABASE_LABEL,
  buildLogoStorePayload,
  fetchLogoStore,
  saveLogoStore,
} from '../lib/logoStore';
import { imagePreviewFromAsset, showImagePreview, type ImagePreview } from '../lib/imagePreview';
import { ImagePreviewLightbox } from './ImagePreviewLightbox';
import { ThumbnailOrderList } from './ThumbnailOrderList';
import { studioTabClass } from '../lib/assetLibrary';
import { UploadThumb } from './UploadThumb';

function useDesktopLogoPair(): boolean {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(LOGO_CAROUSEL_DESKTOP_MQ).matches : false,
  );
  useEffect(() => {
    const media = window.matchMedia(LOGO_CAROUSEL_DESKTOP_MQ);
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  return desktop;
}

function loadStore(): LogoConceptsStore {
  try {
    const raw = localStorage.getItem(LOGO_CONCEPTS_STORAGE_KEY);
    return raw ? normalizeLogoConceptsStore(JSON.parse(raw)) : emptyLogoConceptsStore();
  } catch {
    return emptyLogoConceptsStore();
  }
}

export const LogoConceptsPage: React.FC<{
  actorName?: string;
  actorEmail?: string;
  embedded?: boolean;
  canConfigure?: boolean;
  allowSelect?: boolean;
}> = ({ actorName = 'Evelyn', actorEmail, embedded = false, canConfigure = true, allowSelect = true }) => {
  const [store, setStore] = useState<LogoConceptsStore>(() => loadStore());
  const [notice, setNotice] = useState('');
  const [persistNotice, setPersistNotice] = useState('');
  const [ready, setReady] = useState(false);
  const [uploading, setUploading] = useState<'folder' | 'file' | null>(null);
  const [preview, setPreview] = useState<ImagePreview | null>(null);
  const [slide, setSlide] = useState(0);
  const [focusIndex, setFocusIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [showAll, setShowAll] = useState(() => logoShowAllStartsOpen());
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(LOGO_ALL_TAB_ID);
  const desktop = useDesktopLogoPair();
  const visible = logoCarouselVisibleCount(desktop);

  useEffect(() => {
    let live = true;
    void (async () => {
      const local = loadStore();
      const remote = await fetchLogoStore();
      const next = remote && remote.store.concepts.length > 0 ? remote.store : local;
      const hydrated = await withHydratedPreviews(next.concepts);
      if (!live) return;
      setStore({
        ...next,
        concepts: next.concepts.map((row) => hydrated.find((item) => item.id === row.id) ?? row),
      });
      if (remote && remote.store.concepts.length === 0 && local.concepts.length > 0) {
        void saveLogoStore(buildLogoStorePayload(local, actorEmail || actorName));
      }
      setReady(true);
    })();
    return () => {
      live = false;
    };
  }, [actorEmail, actorName]);

  useEffect(() => {
    writeLocalJson(LOGO_CONCEPTS_STORAGE_KEY, persistLogoConceptsStore(store));
  }, [store]);

  const summary = useMemo(() => logoConceptsSummary(store), [store]);
  const logos = useMemo(() => allLogoConcepts(store), [store]);
  const selectedLogo = useMemo(() => chosenLogo(store), [store]);
  const showingSelected = isLogoSelectedTab(activeTab);
  const start = clampLogoCarouselStart(slide, logos.length, visible);
  const visibleLogos = logoCarouselWindow(logos, start, visible);
  const position = logoCarouselPositionLabel(start, logos.length, visible);

  useEffect(() => {
    setSlide((index) => clampLogoCarouselStart(index, logos.length, visible));
    setFocusIndex((index) => clampLogoMiniFocus(index, logos.length));
    setEditingId(null);
  }, [logos.length, visible]);

  const handlePickFiles = async (files: File[]) => {
    setUploading('folder');
    const entries = [];
    let skipped = 0;
    for (const file of files) {
      if (logoConceptFileError(file)) {
        skipped += 1;
        continue;
      }
      try {
        const id = newUploadId('logo');
        entries.push({
          id,
          name: file.name,
          relativePath: file.webkitRelativePath || file.name,
          dataUrl: await storeFilePreview(id, file),
        });
      } catch {
        skipped += 1;
      }
    }
    if (entries.length === 0) {
      setNotice(skipped ? `No logos imported. Skipped ${skipped}.` : 'Choose logo files.');
      setUploading(null);
      return;
    }
    const result = addLogoConceptsFromEntries(store, entries, 'logo', actorName);
    setStore(result.store);
    setSlide(0);
    setNotice(result.notice);
    setUploading(null);
  };

  const handleMain = (id: string) => {
    const result = chooseLogoConcept(store, id);
    if (result.error) {
      setNotice(result.error);
      return;
    }
    setStore(result.store);
    if (result.store.chosenId) {
      setActiveTab(LOGO_SELECTED_TAB_ID);
      setNotice(`${MAIN_LOGO_LABEL} saved.`);
    } else {
      setNotice(`${MAIN_LOGO_LABEL} cleared.`);
    }
  };

  const handleRename = (id: string) => {
    const result = renameLogoConcept(store, id, nameDraft);
    if (result.error) {
      setNotice(result.error);
      return;
    }
    setStore(result.store);
    setEditingId(null);
    setNotice('Logo name saved.');
  };

  const handleDelete = (id: string) => {
    const next = removeLogoConcept(store, id);
    setStore(next);
    setEditingId(null);
    setNotice('');
  };

  const handleSaveDatabase = async () => {
    setSaving(true);
    writeLocalJson(LOGO_CONCEPTS_STORAGE_KEY, persistLogoConceptsStore(store));
    const result = await saveLogoStore(buildLogoStorePayload(store, actorEmail || actorName));
    setSaving(false);
    if (!result.ok) {
      setPersistNotice(result.error || 'Could not save logos to the database.');
      return;
    }
    setPersistNotice(result.skipped ? SAVE_DATABASE_SKIPPED_NOTICE : SAVED_TO_DATABASE_NOTICE);
  };

  const focusLogo = (index: number) => {
    const next = clampLogoMiniFocus(index, logos.length);
    setFocusIndex(next);
    setSlide(clampLogoCarouselStart(next, logos.length, visible));
    setShowAll(false);
    setEditingId(null);
  };

  const moveCarousel = (delta: number) => {
    focusLogo(focusIndex + delta);
  };

  const selectLogoAt = (index: number) => {
    focusLogo(index);
  };

  const renderLogoSlide = (item: LogoConcept) => {
    const selected = isChosenLogo(store, item.id);
    const renaming = editingId === item.id;
    return (
      <article
        key={item.id}
        className={`min-w-0 rounded-2xl border-2 p-3 ${
          selected
            ? 'border-[#EA580C] bg-[#FFF7ED] shadow-[0_4px_16px_rgba(234,88,12,0.18)] ring-2 ring-[#FDBA74]'
            : 'border-[#FED7AA] bg-[#FAF8F5]'
        }`}
        data-testid={`logo-concept-${item.id}`}
        data-selected={selected ? 'true' : 'false'}
      >
        {selected ? (
          <p
            className="inline-flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-lg bg-[#EA580C] text-white text-[10px] font-black uppercase tracking-wider"
            data-testid={`logo-selected-badge-${item.id}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {MAIN_LOGO_LABEL}
          </p>
        ) : null}
        <div className="flex justify-center">
          <UploadThumb
            src={item.dataUrl}
            alt={`${item.name} logo`}
            size="lg"
            onClick={() => {
              showImagePreview(imagePreviewFromAsset(item, 'logo'), setPreview);
            }}
          />
        </div>
        {renaming && canConfigure ? (
          <form
            className="mt-2 space-y-2"
            data-testid="logo-rename-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleRename(item.id);
            }}
          >
            <label htmlFor={`logo-rename-${item.id}`} className="block text-[10px] font-black uppercase text-[#C2410C]">
              Logo name
            </label>
            <input
              id={`logo-rename-${item.id}`}
              type="text"
              value={nameDraft}
              maxLength={MAX_LOGO_NAME_LENGTH}
              autoFocus
              onChange={(event) => setNameDraft(event.target.value)}
              className="w-full min-h-[44px] rounded-xl border-2 border-[#FDBA74] bg-white px-3 text-sm font-semibold text-[#1F1917]"
              data-testid="logo-rename-input"
            />
            <div className="flex flex-wrap gap-2">
              <button type="submit" className={CF_POP_BTN} data-testid="logo-rename-save">
                Save name
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] bg-white text-[11px] font-black uppercase cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-2 text-center text-sm font-semibold text-[#9A3412] truncate">{item.name}</p>
        )}
        <div className="mt-2 flex flex-wrap justify-center gap-2" data-testid={`logo-carousel-controls-${item.id}`}>
          {allowSelect ? (
            <button
              type="button"
              onClick={() => handleMain(item.id)}
              className={selected ? CF_CHIP_OFF : CF_POP_BTN}
              data-testid={`logo-choose-${item.id}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {selected ? UNSELECT_LABEL : `Select as ${MAIN_LOGO_LABEL}`}
            </button>
          ) : selected ? (
            <span className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-[11px] font-black uppercase text-[#C2410C]">
              <CheckCircle2 className="w-3.5 h-3.5" /> {MAIN_LOGO_LABEL}
            </span>
          ) : null}
          {canConfigure ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setNameDraft(item.name);
                  setEditingId(item.id);
                }}
                className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] bg-white text-[11px] font-black uppercase cursor-pointer inline-flex items-center gap-1.5"
                data-testid={`logo-rename-${item.id}`}
              >
                <Pencil className="w-3.5 h-3.5" />
                Modify name
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="min-h-[44px] px-3 rounded-xl border-2 border-[#C2410C] bg-white text-[11px] font-black uppercase text-[#C2410C] cursor-pointer inline-flex items-center gap-1.5"
                data-testid={`logo-delete-${item.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </>
          ) : null}
        </div>
      </article>
    );
  };

  const uploadBar = (
    <>
      {canConfigure ? (
        <div className="flex flex-wrap items-center gap-2" data-testid="logo-upload-bar">
          <FolderImportBar
            onPickFiles={(files) => void handlePickFiles(files)}
            importing={uploading === 'folder' || uploading === 'file'}
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            testId="logo-concepts"
            noun="logo"
            title="Upload"
            compact
          />
          <button
            type="button"
            onClick={() => void handleSaveDatabase()}
            disabled={saving || !ready}
            className="min-h-[44px] px-3 rounded-xl border-2 border-[#C2410C] bg-[#EA580C] text-white text-[11px] font-black uppercase cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60"
            data-testid="logo-save-database"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? SAVING_TO_DATABASE_LABEL : SAVE_TO_DATABASE_LABEL}
          </button>
        </div>
      ) : null}
      {notice ? (
        <p className="text-sm font-semibold text-[#9A3412]" role="status" data-testid="logo-concepts-notice">
          {notice}
        </p>
      ) : null}
    </>
  );

  return (
    <section className="space-y-4 animate-fadeIn" data-testid="logo-concepts-page">
      {!embedded ? (
        <div className="bg-[#FFF7ED] border-2 border-[#FDBA74] rounded-2xl px-3 py-2 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#EA580C] text-white text-[10px] font-mono font-black uppercase tracking-wider">
              <Stamp className="w-3.5 h-3.5" /> Logos
            </div>
            <p className="text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]" data-testid="logo-concepts-summary">
              {summary}
            </p>
          </div>
          {persistNotice ? (
            <p className="text-xs font-semibold text-[#3F3832]" data-testid="logo-persist-notice">
              {persistNotice}
            </p>
          ) : null}
          {uploadBar}
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]" data-testid="logo-concepts-summary">
            {summary}
          </p>
          {persistNotice ? (
            <p className="text-xs font-semibold text-[#3F3832]" data-testid="logo-persist-notice">
              {persistNotice}
            </p>
          ) : null}
          {uploadBar}
        </div>
      )}

      <div className="flex flex-wrap gap-0 border-b-2 border-[#E8DFD2]" role="tablist" aria-label="Logos">
        <button
          type="button"
          role="tab"
          aria-selected={!showingSelected}
          onClick={() => setActiveTab(LOGO_ALL_TAB_ID)}
          className={studioTabClass(!showingSelected)}
          data-testid="logo-tab-logos"
        >
          {LOGO_ALL_TAB_LABEL}
          <span className="text-[#C2410C]">{logos.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={showingSelected}
          onClick={() => setActiveTab(LOGO_SELECTED_TAB_ID)}
          className={studioTabClass(showingSelected)}
          data-testid="logo-tab-selected"
        >
          {selectedLogo?.dataUrl ? (
            <img
              src={selectedLogo.dataUrl}
              alt=""
              width={28}
              height={28}
              className="w-7 h-7 rounded-lg object-contain bg-white border border-[#FED7AA] shrink-0"
              data-testid="logo-selected-tab-thumb"
            />
          ) : null}
          {LOGO_SELECTED_TAB_LABEL}
        </button>
      </div>
      {showingSelected ? (
        <section className="rounded-2xl border-2 border-[#FED7AA] bg-white overflow-hidden" data-testid="logo-selected-panel">
          {selectedLogo ? (
            <div className="p-4 space-y-3 flex flex-col items-center">
              <p className="text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]">
                {MAIN_LOGO_LABEL}
              </p>
              <UploadThumb
                src={selectedLogo.dataUrl}
                alt={`${selectedLogo.name} logo`}
                size="lg"
                onClick={() => {
                  showImagePreview(imagePreviewFromAsset(selectedLogo, 'logo'), setPreview);
                }}
              />
              <p className="text-sm font-semibold text-[#1F1917] text-center">{selectedLogo.name}</p>
              {allowSelect ? (
                <button
                  type="button"
                  onClick={() => handleMain(selectedLogo.id)}
                  className={CF_CHIP_OFF}
                  data-testid={`logo-unselect-${selectedLogo.id}`}
                >
                  {UNSELECT_LABEL}
                </button>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-[#9A3412] p-4">No logo selected yet. Choose one on the Logos tab.</p>
          )}
        </section>
      ) : (
      <section className="rounded-2xl border-2 border-[#FED7AA] bg-white overflow-hidden" data-testid="logo-concepts-list">
        <div className="px-3 min-h-[48px] bg-[#FFF7ED] flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-black uppercase tracking-wide text-[#9A3412]">Logos</span>
          <span className="text-[10px] font-mono font-black text-[#C2410C]" data-testid="logo-carousel-count">
            {position}
          </span>
        </div>
        <div className="border-t border-[#FED7AA] px-3 pb-4 pt-3">
          {logos.length === 0 ? (
            <p className="text-sm text-[#9A3412] py-3">No logos yet. Upload one to select.</p>
          ) : (
            <div className="space-y-3" data-testid="logo-carousel">
              <div className="flex items-center gap-2">
                <div className={`flex-1 min-w-0 ${LOGO_MINI_STRIP_CLASS}`} data-testid="logo-mini-strip">
                  {logos.map((item, index) => {
                    const selected = index === clampLogoMiniFocus(focusIndex, logos.length);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          selectLogoAt(index);
                          showImagePreview(imagePreviewFromAsset(item, 'logo'), setPreview);
                        }}
                        aria-label={`View ${item.name}`}
                        aria-current={selected}
                        className={`snap-start shrink-0 min-h-[44px] min-w-[44px] rounded-xl border-2 p-0.5 cursor-pointer ${
                          selected ? 'border-[#EA580C] bg-[#FFF7ED]' : 'border-[#FED7AA] bg-white'
                        }`}
                        data-testid={`logo-mini-${item.id}`}
                      >
                        {item.dataUrl ? (
                          <UploadThumb src={item.dataUrl} alt="" size="xs" />
                        ) : (
                          <span className="block w-11 h-11 rounded-xl bg-[#FFEDD5]" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAll((open) => !open)}
                  className="min-h-[44px] shrink-0 px-3 rounded-xl border-2 border-[#1F1917] bg-white text-[11px] font-black uppercase cursor-pointer inline-flex items-center gap-1.5"
                  data-testid="logo-show-all"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  {showAll ? SHOW_CAROUSEL_LOGOS_LABEL : SHOW_ALL_LOGOS_LABEL}
                </button>
              </div>
              {showAll ? (
                <ThumbnailOrderList
                  items={logos}
                  getSrc={(item) => item.dataUrl}
                  getName={(item) => item.name}
                  selectedId={logos[clampLogoMiniFocus(focusIndex, logos.length)]?.id}
                  onSelect={selectLogoAt}
                  onReorder={(from, to) => setStore(reorderLogoConcepts(store, from, to))}
                  testId="logo"
                />
              ) : (
                <div
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowLeft') {
                      event.preventDefault();
                      moveCarousel(-1);
                    }
                    if (event.key === 'ArrowRight') {
                      event.preventDefault();
                      moveCarousel(1);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveCarousel(-1)}
                      disabled={start <= 0}
                      className="min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center rounded-xl border-2 border-[#1F1917] bg-white disabled:opacity-40 cursor-pointer"
                      aria-label="Previous logo"
                      data-testid="logo-carousel-prev"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div
                      className={`flex-1 min-w-0 grid gap-2 ${visibleLogos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
                      data-testid="logo-carousel-window"
                    >
                      {visibleLogos.map((item) => renderLogoSlide(item))}
                    </div>
                    <button
                      type="button"
                      onClick={() => moveCarousel(1)}
                      disabled={start + visible >= logos.length}
                      className="min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center rounded-xl border-2 border-[#1F1917] bg-white disabled:opacity-40 cursor-pointer"
                      aria-label="Next logo"
                      data-testid="logo-carousel-next"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      )}
      <ImagePreviewLightbox preview={preview} onClose={() => setPreview(null)} />
    </section>
  );
};
