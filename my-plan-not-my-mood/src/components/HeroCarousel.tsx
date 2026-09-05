import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Plus, RefreshCw, Trash2, Upload } from 'lucide-react';
import { CF_POP_BTN } from '../lib/contentFactory';
import { confirmDelete } from '../lib/confirmDelete';
import { deleteUploadBlob, getUploadBlob, newUploadId, putUploadBlob } from '../lib/idbFileStore';
import {
  HERO_CAROUSEL_INTERVAL_MS,
  HERO_CAROUSEL_MATTE,
  HERO_CAROUSEL_SLIDE_MS,
  HERO_CAROUSEL_SOURCE_FOLDER,
  addHeroCarouselSlides,
  buildHeroCarouselTrack,
  canFetchHeroCarouselFolder,
  describeHeroCarouselFetch,
  heroCarouselObjectFitFor,
  heroCarouselObjectPositionFor,
  initialHeroCarouselTrackIndex,
  isHeroCarouselImageName,
  loadHeroCarouselStore,
  mergeFetchedHeroSlides,
  persistHeroCarouselStore,
  realIndexFromTrack,
  removeHeroCarouselSlide,
  requestHeroCarouselFolderSync,
  sanitizeHeroCarouselFileName,
  type HeroCarouselSlide,
  type HeroCarouselStore,
  visibleHeroCarouselSlides,
  wrapCarouselIndex,
  wrappedHeroCarouselTrackIndex,
} from '../lib/heroCarousel';
import { MAX_UPLOAD_BYTES, folderFileTooLargeReason } from '../lib/uploadLimits';
import { carouselGearTargetForSlide, gearProductPath } from '../lib/heroCarouselProducts';

const CONTROL_BTN =
  'min-h-[44px] min-w-[44px] rounded-full bg-white/95 hover:bg-[#FFEDD5] text-[#1F1917] border-2 border-[#1F1917] inline-flex items-center justify-center shadow-lg cursor-pointer';

async function hydrateSlides(store: HeroCarouselStore): Promise<HeroCarouselSlide[]> {
  const slides = visibleHeroCarouselSlides(store);
  return Promise.all(
    slides.map(async (slide) => {
      if (slide.blobId) {
        const blob = await getUploadBlob(slide.blobId);
        if (blob) return { ...slide, src: URL.createObjectURL(blob) };
      }
      return slide;
    }),
  );
}

function revokeBlobSrcs(slides: HeroCarouselSlide[]) {
  for (const slide of slides) {
    if (slide.src.startsWith('blob:')) URL.revokeObjectURL(slide.src);
  }
}

interface HeroCarouselProps {
  canManage?: boolean;
  aside?: React.ReactNode;
  size?: 'default' | 'compact';
  onOpenProduct?: (path: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  canManage = false,
  aside,
  size = 'default',
  onOpenProduct,
}) => {
  const [store, setStore] = useState<HeroCarouselStore>(() => loadHeroCarouselStore());
  const [slides, setSlides] = useState<HeroCarouselSlide[]>(() => visibleHeroCarouselSlides(loadHeroCarouselStore()));
  const [trackIndex, setTrackIndex] = useState(() =>
    initialHeroCarouselTrackIndex(visibleHeroCarouselSlides(loadHeroCarouselStore()).length),
  );
  const [instant, setInstant] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const addInput = useRef<HTMLInputElement | null>(null);
  const fetchInput = useRef<HTMLInputElement | null>(null);
  const blobSlides = useRef<HeroCarouselSlide[]>([]);

  const track = useMemo(() => buildHeroCarouselTrack(slides), [slides]);
  const index = realIndexFromTrack(trackIndex, slides.length);
  const current = slides[index];
  const compact = size === 'compact';
  const frameMin = compact ? '' : 'min-h-[24rem] sm:min-h-[32rem] lg:min-h-full';
  const photoMin = compact ? 'min-h-[11rem] sm:min-h-[13rem] lg:min-h-[15rem]' : 'min-h-[22rem] sm:min-h-[30rem] lg:min-h-[38rem]';
  const colMin = compact ? '' : 'min-h-[24rem] sm:min-h-[32rem] lg:min-h-[42rem]';
  const stackGap = compact ? 'gap-1.5' : 'gap-3';
  const photoGrow = compact ? 'flex-none' : 'flex-1';

  const openSlideProduct = (event: React.MouseEvent<HTMLAnchorElement>, name: string) => {
    if (!onOpenProduct) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    onOpenProduct(gearProductPath(carouselGearTargetForSlide(name)));
  };

  const applyStore = useCallback(async (next: HeroCarouselStore, message?: string) => {
    persistHeroCarouselStore(next);
    setStore(next);
    const hydrated = await hydrateSlides(next);
    revokeBlobSrcs(blobSlides.current);
    blobSlides.current = hydrated.filter((slide) => slide.src.startsWith('blob:'));
    setSlides(hydrated);
    setTrackIndex(initialHeroCarouselTrackIndex(hydrated.length));
    if (message) setStatus(message);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void hydrateSlides(store).then((hydrated) => {
      if (cancelled) return;
      blobSlides.current = hydrated.filter((slide) => slide.src.startsWith('blob:'));
      setSlides(hydrated);
      setTrackIndex(initialHeroCarouselTrackIndex(hydrated.length));
    });
    return () => {
      cancelled = true;
      revokeBlobSrcs(blobSlides.current);
    };
    // First hydrate from the saved store only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!playing || hovering || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setInstant(false);
      setTrackIndex((currentIndex) => currentIndex + 1);
    }, HERO_CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [playing, hovering, slides.length, trackIndex]);

  useEffect(() => {
    if (!instant) return;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setInstant(false));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [instant, trackIndex]);

  const go = (delta: number) => {
    if (slides.length < 2) return;
    setInstant(false);
    setTrackIndex((currentIndex) => currentIndex + delta);
  };

  const snapToSlide = (slideIndex: number) => {
    if (slides.length < 2) {
      setTrackIndex(0);
      return;
    }
    setInstant(false);
    setTrackIndex(wrapCarouselIndex(slideIndex, slides.length) + 1);
  };

  const handleTrackTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const wrapped = wrappedHeroCarouselTrackIndex(trackIndex, slides.length);
    if (wrapped == null) return;
    setInstant(true);
    setTrackIndex(wrapped);
  };

  const ingestFiles = async (files: File[], asFetch: boolean) => {
    const incoming: HeroCarouselSlide[] = [];
    let skipped = 0;
    for (const file of files) {
      const name = sanitizeHeroCarouselFileName(file.name);
      if (!isHeroCarouselImageName(name)) {
        skipped += 1;
        continue;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        skipped += 1;
        setStatus(folderFileTooLargeReason(name));
        continue;
      }
      const id = newUploadId('hero');
      await putUploadBlob(id, file);
      incoming.push({
        id,
        name,
        src: URL.createObjectURL(file),
        origin: asFetch ? 'folder' : 'upload',
        blobId: id,
      });
    }
    if (asFetch) {
      const merged = mergeFetchedHeroSlides(store, incoming);
      await applyStore(merged.store, describeHeroCarouselFetch(merged.added, skipped + merged.skipped));
      return;
    }
    const next = addHeroCarouselSlides(store, incoming);
    const added = visibleHeroCarouselSlides(next).length - visibleHeroCarouselSlides(store).length;
    await applyStore(next, describeHeroCarouselFetch(added, skipped + incoming.length - added));
  };

  const fetchFromFolder = async () => {
    setBusy(true);
    setStatus('');
    try {
      if (canFetchHeroCarouselFolder()) {
        const result = await requestHeroCarouselFolderSync(HERO_CAROUSEL_SOURCE_FOLDER);
        if (result.error) {
          setStatus(result.error);
          fetchInput.current?.click();
          return;
        }
        const merged = mergeFetchedHeroSlides(store, result.files);
        await applyStore(merged.store, describeHeroCarouselFetch(merged.added, merged.skipped));
        return;
      }
      fetchInput.current?.click();
    } finally {
      setBusy(false);
    }
  };

  const removeCurrent = async () => {
    if (!current) return;
    if (!confirmDelete()) return;
    if (current.blobId) await deleteUploadBlob(current.blobId);
    await applyStore(removeHeroCarouselSlide(store, current), `Removed ${current.name}.`);
  };

  const frame = (
    <div
      className={`${compact ? 'w-full' : `relative h-full w-full ${frameMin}`} flex flex-col ${stackGap}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className={`relative ${photoGrow} ${photoMin} rounded-3xl overflow-hidden shadow-2xl border-2 border-[#1F1917] glow-pop`}
        style={{ backgroundColor: HERO_CAROUSEL_MATTE }}
      >
        <div className="absolute inset-0 overflow-hidden" data-testid="hero-carousel-frame">
          <div
            className="flex h-full w-full"
            style={{
              transform: `translateX(-${trackIndex * 100}%)`,
              transition: instant ? 'none' : `transform ${HERO_CAROUSEL_SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
            onTransitionEnd={handleTrackTransitionEnd}
          >
            {track.length > 0 ? (
              track.map((slide, slideIndex) => (
                <div key={`${slide.id}-track-${slideIndex}`} className="relative h-full w-full min-w-full shrink-0">
                  {slide.src ? (
                    <a
                      href={gearProductPath(carouselGearTargetForSlide(slide.name))}
                      data-testid="hero-carousel-slide-link"
                      aria-label="Shop this look on the gear page"
                      className="absolute inset-0 block cursor-pointer"
                      onClick={(event) => openSlideProduct(event, slide.name)}
                    >
                      <img
                        src={slide.src}
                        alt={slide.name.replace(/\.[^.]+$/, '').replace(/-/g, ' ')}
                        className="absolute inset-0 h-full w-full"
                        style={{
                          objectFit: heroCarouselObjectFitFor(slide.name),
                          objectPosition: heroCarouselObjectPositionFor(slide.name),
                        }}
                        draggable={false}
                      />
                    </a>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#1F1917] text-xs font-mono uppercase">
                      Add a hero screenshot
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex h-full w-full min-w-full items-center justify-center text-[#1F1917] text-xs font-mono uppercase">
                Add a hero screenshot
              </div>
            )}
          </div>
        </div>
      </div>

      {slides.length > 1 ? (
        <div
          className={`flex items-center justify-center gap-2 shrink-0 px-1 py-1 rounded-2xl bg-[#FAF8F5]/95 border border-[#E5DFD3] ${
            compact ? '' : 'absolute bottom-3 left-1/2 z-10 -translate-x-1/2 shadow-lg'
          }`}
        >
          <button
            type="button"
            className={CONTROL_BTN}
            aria-label="Previous slide"
            data-testid="hero-carousel-prev"
            onClick={() => go(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            className={CONTROL_BTN}
            aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
            data-testid="hero-carousel-pause"
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <p
            className="min-h-[44px] px-3 inline-flex items-center text-xs font-mono font-black uppercase tracking-wider text-[#1F1917]"
            data-testid="hero-carousel-dots"
            aria-live="polite"
          >
            {index + 1} / {slides.length}
          </p>
          <button
            type="button"
            className={CONTROL_BTN}
            aria-label="Next slide"
            data-testid="hero-carousel-next"
            onClick={() => go(1)}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ) : null}
    </div>
  );

  const manager = canManage ? (
    <div className="rounded-2xl border-2 border-[#1F1917] bg-white p-3 space-y-2" data-testid="hero-carousel-manage">
      <p className="text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]">
        Hero images · fill the frame · slide every 5 seconds
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`${CF_POP_BTN} disabled:opacity-60`}
          data-testid="hero-carousel-fetch"
          disabled={busy}
          onClick={() => void fetchFromFolder()}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {busy ? 'Fetching' : 'Fetch new images'}
        </button>
        <button
          type="button"
          className={CF_POP_BTN}
          data-testid="hero-carousel-add"
          onClick={() => addInput.current?.click()}
        >
          <Plus className="w-3.5 h-3.5" />
          Add images
        </button>
        <button
          type="button"
          className={`${CF_POP_BTN} disabled:opacity-60`}
          data-testid="hero-carousel-remove"
          disabled={!current}
          onClick={() => void removeCurrent()}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove this image
        </button>
      </div>
      <p className="text-[11px] text-[#6B5344] font-medium">
        Fetch reads {HERO_CAROUSEL_SOURCE_FOLDER} on this computer. Drop more screenshots there, then fetch.
        {status ? ` ${status}` : ''}
      </p>
      <input
        ref={addInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        className="sr-only"
        aria-label="Add hero images"
        data-testid="hero-carousel-add-input"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          if (files.length) void ingestFiles(files, false);
        }}
      />
      <input
        ref={fetchInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        className="sr-only"
        aria-label="Choose a folder of hero images"
        data-testid="hero-carousel-fetch-input"
        {...{ webkitdirectory: '', directory: '' }}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          if (files.length) void ingestFiles(files, true);
        }}
      />
      {slides.length > 0 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {slides.map((slide, slideIndex) => (
            <li key={slide.id}>
              <button
                type="button"
                onClick={() => snapToSlide(slideIndex)}
                className={`block w-11 h-14 rounded-lg overflow-hidden border-2 ${
                  slideIndex === index ? 'border-[#EA580C]' : 'border-[#1F1917]'
                }`}
                aria-label={`Select ${slide.name}`}
              >
                {slide.src ? (
                  <img src={slide.src} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-4 h-4 m-auto" />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  ) : null;

  if (aside) {
    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'} data-testid="hero-carousel" data-size={size}>
        <div className={`grid grid-cols-1 lg:grid-cols-12 ${compact ? 'gap-2 items-start' : 'gap-3 items-stretch'}`}>
          <div className={`lg:col-span-6 ${colMin} flex`}>
            <div className={`w-full ${compact ? '' : `h-full ${frameMin}`}`}>{frame}</div>
          </div>
          <div className={`lg:col-span-6 min-h-0 flex flex-col ${compact ? '' : 'h-full'}`}>{aside}</div>
        </div>
        {manager}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2" data-testid="hero-carousel">
      <div className="flex-1 min-h-[24rem] sm:min-h-[32rem]">{frame}</div>
      {manager}
    </div>
  );
};

export default HeroCarousel;
