import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, ExternalLink, ImagePlus, ShoppingBag, Trash2, Undo2 } from 'lucide-react';
import { ComingSoonBadge } from './ComingSoonBadge';
import { gearKindForHandle } from '../lib/heroCarouselProducts';
import { GEAR_SHOP_LABEL } from '../lib/gearSelections';
import {
  GEAR_HUB_CAROUSEL_INTERVAL_MS,
  GEAR_HUB_THUMBNAIL_ACCEPT,
  GEAR_HUB_THUMBNAIL_CLEAR_LABEL,
  GEAR_HUB_THUMBNAIL_REMOVE_LABEL,
  GEAR_HUB_THUMBNAIL_UPLOAD_LABEL,
  advanceGearHubDistinctIndexes,
  gearHubSlideImageKey,
  gearHubVisibleSlides,
  hydrateGearHubThumbnails,
  loadGearHubThumbnailStore,
  nextGearHubDistinctIndex,
  pickGearHubDistinctIndexes,
  removeGearHubCarouselFile,
  resetGearHubThumbnail,
  revokeGearHubThumbnailSrcs,
  saveGearHubCarouselFiles,
  takenGearHubImageKeys,
  wrapGearHubCarouselIndex,
  type GearHubThumbnailSlot,
  type GearHubThumbnailStore,
  type GearHubVisibleSlide,
} from '../lib/gearHubThumbnails';
import { applyDocumentMeta, formatPublicPageTitle } from '../lib/pageMeta';
import { cacheBustPublicUrl } from '../lib/spaAssets';
import {
  GEAR_HUB_JOURNAL_PLACEHOLDERS,
  SHOPIFY_GEAR_HUB_BLURB,
  shopifyPublicCollectionUrl,
  shopifyPublicHubCollections,
  type GearHubJournalPlaceholderId,
  type ShopifyPublicCollectionId,
} from '../lib/shopifyStore';

type ShopGearPageProps = {
  kind?: ShopifyPublicCollectionId;
  productHandle?: string;
  onSelectKind?: (kind: ShopifyPublicCollectionId) => void;
  canManageThumbnails?: boolean;
};

const JOURNAL_ICONS: Record<GearHubJournalPlaceholderId, React.ReactNode> = {
  '90day': <BookOpen className="w-10 h-10" />,
  deskpad: <CalendarDays className="w-10 h-10" />,
};

const CARD_CHROME =
  'flex flex-col h-full bg-white border-2 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow min-h-[44px]';

const CONTROL_HIT =
  'min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer rounded-full bg-transparent border-0 p-0';
const CONTROL_FACE =
  'h-8 w-8 rounded-full bg-white/95 hover:bg-[#FFEDD5] text-[#1F1917] border-2 border-[#1F1917] inline-flex items-center justify-center shadow-md';

function GearHubCarousel({
  slot,
  fallbackSrc,
  fallbackAlt,
  fallbackNode,
  href,
  canManage,
  store,
  index,
  onStep,
  onHoverChange,
  onUploaded,
}: {
  slot: GearHubThumbnailSlot;
  fallbackSrc?: string;
  fallbackAlt: string;
  fallbackNode?: React.ReactNode;
  href?: string;
  canManage: boolean;
  store: GearHubThumbnailStore;
  index: number;
  onStep: (delta: number) => void;
  onHoverChange: (hovering: boolean) => void;
  onUploaded: (next: GearHubThumbnailStore, message?: string) => void;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const slides: GearHubVisibleSlide[] = gearHubVisibleSlides(
    store,
    slot,
    fallbackSrc ? { src: fallbackSrc, alt: fallbackAlt } : undefined,
  );
  const current = slides[wrapGearHubCarouselIndex(index, slides.length)];
  const hasUploads = slides.some((slide) => slide.uploaded);

  const photo = current?.src ? (
    <img
      src={current.src.startsWith('blob:') ? current.src : cacheBustPublicUrl(current.src)}
      alt={current.alt}
      data-testid={`gear-hub-carousel-image-${slot}`}
      className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] object-contain object-center"
    />
  ) : (
    fallbackNode ?? null
  );

  return (
    <div className="flex flex-col">
    <div
      className="relative bg-[#FAF8F5] w-full aspect-[16/10] overflow-hidden border-b border-[#E5DFD3]"
      data-testid={`gear-hub-carousel-${slot}`}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0"
        >
          {photo}
        </a>
      ) : (
        photo
      )}
      {slides.length > 1 ? (
        <div className="absolute left-1/2 z-10 -translate-x-1/2 bottom-2 flex items-center justify-center shrink-0 rounded-2xl bg-[#FAF8F5]/95 border border-[#E5DFD3] shadow-lg px-0.5">
          <button
            type="button"
            className={CONTROL_HIT}
            aria-label={`Previous ${fallbackAlt} photo`}
            data-testid={`gear-hub-carousel-prev-${slot}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onStep(-1);
            }}
          >
            <span className={CONTROL_FACE} aria-hidden="true">
              <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </button>
          <p
            className="min-h-[44px] px-1 inline-flex items-center text-[10px] font-mono font-black uppercase tracking-wider text-[#1F1917]"
            data-testid={`gear-hub-carousel-dots-${slot}`}
          >
            {wrapGearHubCarouselIndex(index, slides.length) + 1} / {slides.length}
          </p>
          <button
            type="button"
            className={CONTROL_HIT}
            aria-label={`Next ${fallbackAlt} photo`}
            data-testid={`gear-hub-carousel-next-${slot}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onStep(1);
            }}
          >
            <span className={CONTROL_FACE} aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      ) : null}
    </div>
      {canManage ? (
        <div className="flex flex-wrap items-center justify-center gap-1.5 px-2 py-2 border-b border-[#E5DFD3] bg-white" data-testid={`gear-hub-thumb-admin-${slot}`}>
          <button
            type="button"
            data-testid={`gear-hub-thumb-upload-${slot}`}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 border-[#1F1917] bg-white text-[#1F1917]"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              input.current?.click();
            }}
          >
            <ImagePlus className="w-3.5 h-3.5" />
            {GEAR_HUB_THUMBNAIL_UPLOAD_LABEL}
          </button>
          {current && (current.uploaded || current.id.startsWith('seed-')) ? (
            <button
              type="button"
              data-testid={`gear-hub-thumb-remove-${slot}`}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 border-[#1F1917] bg-white text-[#1F1917]"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void removeGearHubCarouselFile(store, current.id).then((next) => onUploaded(next));
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {GEAR_HUB_THUMBNAIL_REMOVE_LABEL}
            </button>
          ) : null}
          {hasUploads || (store.removedSeedIds ?? []).some((id) => id.startsWith(`seed-${slot}-`)) ? (
            <button
              type="button"
              data-testid={`gear-hub-thumb-clear-${slot}`}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 border-[#1F1917] bg-[#FAF8F5] text-[#1F1917]"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void resetGearHubThumbnail(store, slot).then((next) => onUploaded(next));
              }}
            >
              <Undo2 className="w-3.5 h-3.5" />
              {GEAR_HUB_THUMBNAIL_CLEAR_LABEL}
            </button>
          ) : null}
          <input
            ref={input}
            type="file"
            accept={GEAR_HUB_THUMBNAIL_ACCEPT}
            multiple
            className="sr-only"
            aria-label={`${GEAR_HUB_THUMBNAIL_UPLOAD_LABEL} for ${fallbackAlt}`}
            data-testid={`gear-hub-thumb-input-${slot}`}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = '';
              if (!files.length) return;
              void saveGearHubCarouselFiles(store, slot, files).then((result) => {
                onUploaded(result.store, result.error);
              });
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

type HubSlotFallback = {
  slot: GearHubThumbnailSlot;
  fallbackSrc?: string;
  fallbackAlt: string;
};

function gearHubPageSlots(): HubSlotFallback[] {
  return [
    ...shopifyPublicHubCollections().map((collection) => ({
      slot: collection.id as GearHubThumbnailSlot,
      fallbackSrc: collection.image,
      fallbackAlt: collection.imageAlt,
    })),
    ...GEAR_HUB_JOURNAL_PLACEHOLDERS.map((journal) => ({
      slot: journal.id,
      fallbackAlt: `${journal.heading} placeholder`,
    })),
  ];
}

function gearHubPageKeys(store: GearHubThumbnailStore, slots: HubSlotFallback[]): string[][] {
  return slots.map((row) =>
    gearHubVisibleSlides(
      store,
      row.slot,
      row.fallbackSrc ? { src: row.fallbackSrc, alt: row.fallbackAlt } : undefined,
    ).map((slide) => gearHubSlideImageKey(slide)),
  );
}

export const ShopGearPage: React.FC<ShopGearPageProps> = ({
  kind = 'all',
  productHandle = '',
  canManageThumbnails = false,
}) => {
  const canManage = canManageThumbnails;
  const activeKind: ShopifyPublicCollectionId | null = productHandle
    ? gearKindForHandle(productHandle)
    : kind === 'all'
      ? null
      : kind;
  const hubSlots = gearHubPageSlots();
  const [thumbStore, setThumbStore] = useState<GearHubThumbnailStore>(() => loadGearHubThumbnailStore());
  const [thumbStatus, setThumbStatus] = useState('');
  const keysBySlot = gearHubPageKeys(thumbStore, hubSlots);
  const slideSignature = keysBySlot.map((keys) => keys.join('|')).join('||');
  const [indexes, setIndexes] = useState<number[]>(() => pickGearHubDistinctIndexes(keysBySlot));
  const thumbStoreRef = useRef(thumbStore);
  const keysRef = useRef(keysBySlot);
  const slotsRef = useRef(hubSlots);
  const hoveringRef = useRef<Partial<Record<GearHubThumbnailSlot, boolean>>>({});
  thumbStoreRef.current = thumbStore;
  keysRef.current = keysBySlot;
  slotsRef.current = hubSlots;

  useEffect(() => {
    if (!productHandle) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [productHandle]);

  useEffect(() => {
    return applyDocumentMeta({
      title: formatPublicPageTitle(GEAR_SHOP_LABEL),
      description: SHOPIFY_GEAR_HUB_BLURB,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loaded = loadGearHubThumbnailStore();
    void hydrateGearHubThumbnails(loaded).then((hydrated) => {
      if (cancelled) return;
      revokeGearHubThumbnailSrcs(thumbStoreRef.current);
      setThumbStore(hydrated);
    });
    return () => {
      cancelled = true;
      revokeGearHubThumbnailSrcs(thumbStoreRef.current);
    };
    // Hydrate once from saved thumbnails.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIndexes((prev) =>
      keysBySlot.map((keys, slotIndex) => wrapGearHubCarouselIndex(prev[slotIndex] ?? 0, keys.length || 1)),
    );
    // Re-wrap when the visible photo lists change (upload, remove, hydrate).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideSignature]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndexes((prev) => {
        const keys = keysRef.current;
        const skip = slotsRef.current.map((row) => Boolean(hoveringRef.current[row.slot]));
        return advanceGearHubDistinctIndexes(
          keys,
          keys.map((_, slotIndex) => prev[slotIndex] ?? 0),
          skip,
        );
      });
    }, GEAR_HUB_CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  const applyThumbs = (next: GearHubThumbnailStore, message?: string) => {
    revokeGearHubThumbnailSrcs(thumbStoreRef.current);
    void hydrateGearHubThumbnails(next).then(setThumbStore);
    setThumbStatus(message ?? '');
  };

  const stepSlot = (slot: GearHubThumbnailSlot, delta: number) => {
    const slotIndex = hubSlots.findIndex((row) => row.slot === slot);
    if (slotIndex < 0) return;
    setIndexes((prev) => {
      const next = keysBySlot.map((keys, index) => wrapGearHubCarouselIndex(prev[index] ?? 0, keys.length || 1));
      next[slotIndex] = nextGearHubDistinctIndex(
        keysBySlot[slotIndex] ?? [],
        next[slotIndex] ?? 0,
        takenGearHubImageKeys(keysBySlot, next, slotIndex),
        delta,
      );
      return next;
    });
  };

  return (
    <section id="gear-page" className="pt-1 pb-8 bg-[#FAF8F5]" data-testid="shop-gear-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <header className="text-center space-y-1 max-w-2xl mx-auto" data-testid="shop-gear-aside">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F1917] uppercase tracking-tight leading-none">
            {GEAR_SHOP_LABEL}
          </h2>
          <p className="text-[#3F3832] text-sm font-medium leading-snug">{SHOPIFY_GEAR_HUB_BLURB}</p>
          {canManage && thumbStatus ? (
            <p className="text-sm font-semibold text-[#9A3412]" role="status" data-testid="gear-hub-thumb-status">
              {thumbStatus}
            </p>
          ) : null}
        </header>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="shop-gear-collections">
          {shopifyPublicHubCollections().map((collection) => {
            const href = shopifyPublicCollectionUrl(collection.id);
            const active = collection.id === activeKind;
            return (
              <li key={collection.id}>
                <div
                  className={`${CARD_CHROME} ${
                    active ? 'border-[#C2410C] ring-4 ring-[#EA580C] ring-offset-2' : 'border-[#1F1917]'
                  }`}
                >
                  <GearHubCarousel
                    slot={collection.id}
                    fallbackSrc={collection.image}
                    fallbackAlt={collection.imageAlt}
                    href={href}
                    canManage={canManage}
                    store={thumbStore}
                    index={indexes[hubSlots.findIndex((row) => row.slot === collection.id)] ?? 0}
                    onStep={(delta) => stepSlot(collection.id, delta)}
                    onHoverChange={(hovering) => {
                      hoveringRef.current[collection.id] = hovering;
                    }}
                    onUploaded={applyThumbs}
                  />
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`shopify-${collection.id}-page-link`}
                    data-active={active ? 'true' : undefined}
                    className="p-3 space-y-1.5 flex flex-col min-h-[44px] hover:bg-[#FFF7ED]"
                  >
                    <h3 className="text-sm font-black text-[#1F1917] uppercase tracking-tight leading-tight">
                      {collection.heading}
                    </h3>
                    <p className="text-xs font-medium text-[#3F3832] leading-snug">{collection.blurb}</p>
                    <span className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 px-3 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider border-2 border-[#1F1917] bg-[#C2410C] text-white shadow-md">
                      <ShoppingBag className="w-4 h-4" />
                      {collection.cta}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </a>
                </div>
              </li>
            );
          })}
          {GEAR_HUB_JOURNAL_PLACEHOLDERS.map((journal) => (
            <li key={journal.id}>
              <article
                data-testid={`shop-gear-journal-${journal.id}`}
                className={`${CARD_CHROME} border-dashed border-[#1F1917]`}
              >
                <GearHubCarousel
                  slot={journal.id}
                  fallbackAlt={`${journal.heading} placeholder`}
                  fallbackNode={
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#C2410C]">
                      {JOURNAL_ICONS[journal.id]}
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider">Placeholder</span>
                    </div>
                  }
                  canManage={canManage}
                  store={thumbStore}
                  index={indexes[hubSlots.findIndex((row) => row.slot === journal.id)] ?? 0}
                  onStep={(delta) => stepSlot(journal.id, delta)}
                  onHoverChange={(hovering) => {
                    hoveringRef.current[journal.id] = hovering;
                  }}
                  onUploaded={applyThumbs}
                />
                <div className="p-3 space-y-1.5 flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-[#1F1917] uppercase tracking-tight leading-tight">
                      {journal.heading}
                    </h3>
                    <ComingSoonBadge />
                  </div>
                  <p className="text-xs font-medium text-[#3F3832] leading-snug">{journal.blurb}</p>
                  <span className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 px-3 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider border-2 border-[#1F1917] bg-[#FAF8F5] text-[#1F1917]">
                    {journal.cta}
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
