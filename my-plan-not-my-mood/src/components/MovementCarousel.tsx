import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { confirmDelete } from '../lib/confirmDelete';
import {
  MOVEMENT_CAROUSEL_ASPECT_CLASS,
  MOVEMENT_CAROUSEL_CONTROLS_CLASS,
  MOVEMENT_CAROUSEL_DESKTOP_HEIGHT_CLASS,
  MOVEMENT_CAROUSEL_INTERVAL_MS,
  MOVEMENT_CAROUSEL_MAX_HEIGHT_CLASS,
  MOVEMENT_CAROUSEL_MATTE,
  MOVEMENT_CAROUSEL_MOBILE_FRAME_CLASS,
  MOVEMENT_CAROUSEL_OBJECT_FIT,
  movementCarouselObjectPositionFor,
  loadMovementCarouselStore,
  pairMovementCarouselFrames,
  persistMovementCarouselStore,
  removeMovementCarouselSlide,
  visibleMovementCarouselSlides,
  wrapMovementCarouselIndex,
  type MovementCarouselSlide,
  type MovementCarouselStore,
} from '../lib/movementCarousel';

const CONTROL_HIT =
  'min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer rounded-full bg-transparent border-0 p-0';
const CONTROL_FACE =
  'h-5 w-5 sm:h-8 sm:w-8 rounded-full bg-white/95 hover:bg-[#FFEDD5] text-[#1F1917] border border-[#1F1917] sm:border-2 inline-flex items-center justify-center shadow-sm sm:shadow-md';

function StackedPhoto({
  slide,
  alt,
  testId,
  canManage,
  onRemove,
}: {
  slide: MovementCarouselSlide;
  alt: string;
  testId: string;
  canManage: boolean;
  onRemove: (name: string) => void;
}) {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <img
        src={slide.src}
        alt={alt}
        className="absolute inset-0 h-full w-full"
        style={{
          objectFit: MOVEMENT_CAROUSEL_OBJECT_FIT,
          objectPosition: movementCarouselObjectPositionFor(slide.name),
        }}
        data-testid={testId}
        draggable={false}
      />
      {canManage ? (
        <button
          type="button"
          className="absolute top-2 right-2 z-20 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full bg-[#FAF8F5]/95 border-2 border-[#1F1917] text-[#C2410C] cursor-pointer"
          aria-label={`Remove ${slide.name} from the carousel`}
          data-testid={`${testId}-remove`}
          onClick={() => onRemove(slide.name)}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  );
}

export function MovementCarousel({
  alt,
  canManage = false,
}: {
  alt: string;
  canManage?: boolean;
}) {
  const [store, setStore] = useState<MovementCarouselStore>(() => loadMovementCarouselStore());
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const slides = useMemo(() => visibleMovementCarouselSlides(store), [store]);
  const frames = useMemo(() => pairMovementCarouselFrames(slides), [slides]);
  const current = frames[wrapMovementCarouselIndex(index, frames.length)];

  useEffect(() => {
    if (frames.length < 2 || hovering) return;
    const timer = window.setInterval(() => {
      setIndex((value) => wrapMovementCarouselIndex(value + 1, frames.length));
    }, MOVEMENT_CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [hovering, frames.length]);

  useEffect(() => {
    if (!frames.length) {
      setIndex(0);
      return;
    }
    setIndex((value) => wrapMovementCarouselIndex(value, frames.length));
  }, [frames.length]);

  const removeImage = (name: string) => {
    if (!canManage) return;
    if (!confirmDelete()) return;
    const next = removeMovementCarouselSlide(store, name);
    persistMovementCarouselStore(next);
    setStore(next);
  };

  if (!current) return null;

  const controls =
    frames.length > 1 ? (
      <div className={MOVEMENT_CAROUSEL_CONTROLS_CLASS} data-testid="home-movement-carousel-controls">
        <button
          type="button"
          className={CONTROL_HIT}
          aria-label="Previous movement photo"
          data-testid="home-movement-carousel-prev"
          onClick={() => setIndex((value) => wrapMovementCarouselIndex(value - 1, frames.length))}
        >
          <span className={CONTROL_FACE} aria-hidden>
            <ChevronLeft className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          </span>
        </button>
        <p
          className="min-h-[44px] px-1.5 inline-flex items-center text-[10px] font-mono font-black uppercase tracking-wider text-[#1F1917]"
          data-testid="home-movement-carousel-count"
        >
          {wrapMovementCarouselIndex(index, frames.length) + 1} / {frames.length}
        </p>
        <button
          type="button"
          className={CONTROL_HIT}
          aria-label="Next movement photo"
          data-testid="home-movement-carousel-next"
          onClick={() => setIndex((value) => wrapMovementCarouselIndex(value + 1, frames.length))}
        >
          <span className={CONTROL_FACE} aria-hidden>
            <ChevronRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          </span>
        </button>
      </div>
    ) : null;

  return (
    <div
      className="flex flex-col min-h-0 h-full w-full"
      data-testid="home-movement-carousel"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className={`relative min-h-0 overflow-hidden ${MOVEMENT_CAROUSEL_MOBILE_FRAME_CLASS} ${MOVEMENT_CAROUSEL_ASPECT_CLASS} ${MOVEMENT_CAROUSEL_MAX_HEIGHT_CLASS} ${MOVEMENT_CAROUSEL_DESKTOP_HEIGHT_CLASS}`}
        style={{ backgroundColor: MOVEMENT_CAROUSEL_MATTE }}
        data-testid="home-movement-carousel-frame"
      >
        <div className="absolute inset-0 flex flex-col" data-testid="home-movement-stack">
          <StackedPhoto
            slide={current.top}
            alt={alt}
            testId="home-movement-image-top"
            canManage={canManage}
            onRemove={removeImage}
          />
          {current.bottom ? (
            <StackedPhoto
              slide={current.bottom}
              alt=""
              testId="home-movement-image-bottom"
              canManage={canManage}
              onRemove={removeImage}
            />
          ) : null}
        </div>
      </div>
      {controls}
    </div>
  );
}

export default MovementCarousel;
