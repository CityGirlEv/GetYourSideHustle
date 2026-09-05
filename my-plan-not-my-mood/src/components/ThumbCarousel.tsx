import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import {
  GEAR_CAROUSEL_DESKTOP_MQ,
  GEAR_CAROUSEL_TABLET_MQ,
  GEAR_COLLECTION_SCROLL_CLASS,
  GEAR_HIDE_THUMBS_LABEL,
  GEAR_MINI_STRIP_CLASS,
  GEAR_SHOW_ALL_GRID_CLASS,
  GEAR_THUMBS_LABEL,
  SHOW_ALL_GEAR_LABEL,
  SHOW_CAROUSEL_GEAR_LABEL,
  clampGearCarouselStart,
  gearCarouselPositionLabel,
  gearCarouselSlideClass,
  gearCarouselThumbsStartOpen,
  gearCarouselVisibleCount,
  gearCarouselWindow,
  type GearCarouselBreakpoint,
} from '../lib/gearSelections';

function useGearBreakpoint(): GearCarouselBreakpoint {
  const read = (): GearCarouselBreakpoint => {
    if (typeof window === 'undefined') return 'mobile';
    if (window.matchMedia(GEAR_CAROUSEL_DESKTOP_MQ).matches) return 'desktop';
    if (window.matchMedia(GEAR_CAROUSEL_TABLET_MQ).matches) return 'tablet';
    return 'mobile';
  };
  const [breakpoint, setBreakpoint] = useState<GearCarouselBreakpoint>(read);
  useEffect(() => {
    const tablet = window.matchMedia(GEAR_CAROUSEL_TABLET_MQ);
    const desktop = window.matchMedia(GEAR_CAROUSEL_DESKTOP_MQ);
    const sync = () => setBreakpoint(read());
    sync();
    tablet.addEventListener('change', sync);
    desktop.addEventListener('change', sync);
    return () => {
      tablet.removeEventListener('change', sync);
      desktop.removeEventListener('change', sync);
    };
  }, []);
  return breakpoint;
}

export function ThumbCarousel<T extends { id: string }>({
  items,
  getSrc,
  getName,
  renderSlide,
  onOpen,
  testId,
}: {
  items: T[];
  getSrc: (item: T) => string | undefined;
  getName: (item: T) => string;
  renderSlide: (item: T) => React.ReactNode;
  onOpen?: (item: T) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  testId: string;
}): React.ReactElement {
  const breakpoint = useGearBreakpoint();
  const visible = gearCarouselVisibleCount(breakpoint);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [slide, setSlide] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [thumbsOpen, setThumbsOpen] = useState(() => gearCarouselThumbsStartOpen());
  const start = clampGearCarouselStart(slide, items.length, visible);
  const windowItems = gearCarouselWindow(items, start, visible);
  const position = gearCarouselPositionLabel(start, items.length, visible);

  useEffect(() => {
    setSlide((index) => clampGearCarouselStart(index, items.length, visible));
  }, [items.length, visible]);

  const scrollToIndex = (index: number) => {
    const next = clampGearCarouselStart(index, items.length, visible);
    setSlide(next);
    setShowAll(false);
    trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const move = (delta: number) => {
    scrollToIndex(start + delta);
  };

  if (items.length === 0) {
    return <p className="text-sm text-[#3F3832] py-2">No designs yet.</p>;
  }

  return (
    <div className="space-y-3" data-testid={`${testId}-carousel`}>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono font-black uppercase text-[#C2410C] shrink-0" data-testid={`${testId}-count`}>
          {items.length} cards
        </span>
        <button
          type="button"
          aria-expanded={thumbsOpen}
          aria-controls={`${testId}-mini-strip`}
          onClick={() => setThumbsOpen((open) => !open)}
          className="min-h-[44px] shrink-0 px-2.5 rounded-xl border-2 border-[#1F1917] bg-white text-[11px] font-black uppercase cursor-pointer inline-flex items-center gap-1"
          data-testid={`${testId}-thumbs-toggle`}
        >
          {thumbsOpen ? GEAR_HIDE_THUMBS_LABEL : GEAR_THUMBS_LABEL}
          <ChevronDown className={`w-3.5 h-3.5 ${thumbsOpen ? 'rotate-180' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => setShowAll((open) => !open)}
          className="ml-auto min-h-[44px] shrink-0 px-3 rounded-xl border-2 border-[#1F1917] bg-white text-[11px] font-black uppercase cursor-pointer inline-flex items-center gap-1.5"
          data-testid={`${testId}-show-all`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          {showAll ? SHOW_CAROUSEL_GEAR_LABEL : SHOW_ALL_GEAR_LABEL}
        </button>
      </div>
      {thumbsOpen ? (
        <div
          id={`${testId}-mini-strip`}
          className={GEAR_MINI_STRIP_CLASS}
          data-testid={`${testId}-mini-strip`}
        >
          {items.map((item, index) => {
            const inView = !showAll && windowItems.some((row) => row.id === item.id);
            const src = getSrc(item);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  scrollToIndex(index);
                  onOpen?.(item);
                }}
                aria-label={`View ${getName(item)}`}
                aria-current={inView}
                className={`snap-start shrink-0 min-h-[44px] min-w-[44px] rounded-lg border p-1 cursor-pointer inline-flex items-center justify-center ${
                  inView ? 'border-[#EA580C] bg-[#FFF7ED]' : 'border-[#FED7AA] bg-white'
                }`}
                data-testid={`${testId}-mini-${item.id}`}
              >
                {src ? (
                  <img
                    src={src}
                    alt=""
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-md object-cover"
                  />
                ) : (
                  <span className="block w-8 h-8 rounded-md bg-[#FFEDD5]" />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
      <p className="text-[10px] font-mono font-black text-[#C2410C]" data-testid={`${testId}-position`}>
        {showAll ? `${items.length} of ${items.length}` : position}
      </p>
      {showAll ? (
        <div className={GEAR_SHOW_ALL_GRID_CLASS} data-testid={`${testId}-all-list`}>
          {items.map((item) => renderSlide(item))}
        </div>
      ) : (
        <div
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              move(-1);
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault();
              move(1);
            }
          }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={start <= 0}
              className="min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center rounded-xl border-2 border-[#1F1917] bg-white disabled:opacity-40 cursor-pointer"
              aria-label="Previous design"
              data-testid={`${testId}-prev`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div
              ref={trackRef}
              className={`flex-1 min-w-0 ${GEAR_COLLECTION_SCROLL_CLASS}`}
              data-testid={`${testId}-window`}
            >
              {windowItems.map((item) => (
                <div key={item.id} className={gearCarouselSlideClass(visible)}>
                  {renderSlide(item)}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => move(1)}
              disabled={start + visible >= items.length}
              className="min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center rounded-xl border-2 border-[#1F1917] bg-white disabled:opacity-40 cursor-pointer"
              aria-label="Next design"
              data-testid={`${testId}-next`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
