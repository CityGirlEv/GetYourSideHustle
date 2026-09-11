import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import aboutTees from "../assets/about-gysh-tees.png";
import aboutTeesCollage from "../assets/about-gysh-tees-collage.png";
import aboutGangTees from "../assets/about-gysh-gang-tees.png";
import aboutTeesCloseup from "../assets/about-gysh-tees-closeup.png";
import gear01 from "../assets/gear-gallery-01.jpg";
import gear02 from "../assets/gear-gallery-02.jpg";
import gear03 from "../assets/gear-gallery-03.jpg";
import gear04 from "../assets/gear-gallery-04.jpg";
import gear05 from "../assets/gear-gallery-05.jpg";
import gear06 from "../assets/gear-gallery-06.jpg";
import gear07 from "../assets/gear-gallery-07.jpg";
import gear08 from "../assets/gear-gallery-08.jpg";
import { SITE_NAME } from "../lib/site-config";
import { nextGearGalleryIndex } from "../lib/gear-gallery";

const GEAR_PHOTOS: { src: string; alt: string }[] = [
  { src: gear01, alt: "Tina and Evelyn in GYSH tees and caps, pointing at the logo" },
  { src: gear02, alt: "Tina and Evelyn in GYSH tees — studio full-body pose" },
  { src: gear03, alt: "Tina and Evelyn high-fiving in GYSH tees and caps" },
  { src: gear04, alt: "Tina and Evelyn holding GYSH tee collars to show the print" },
  { src: gear05, alt: "GYSH tee and cap collage — hat close-ups and full looks" },
  { src: gear06, alt: "GYSH gear collage — high-fives and shirt logo details" },
  { src: gear07, alt: "Illustrated GYSH tee and cap looks — full body and hat callouts" },
  { src: gear08, alt: "GYSH Gang illustrated merch looks with tees and caps" },
  { src: aboutTees, alt: "Tina and Evelyn in Get Your Side Hustle GYSH tees" },
  { src: aboutGangTees, alt: "Get Your Side Hustle Gang tees" },
  { src: aboutTeesCloseup, alt: "Close-up of GYSH brand tees" },
  { src: aboutTeesCollage, alt: "GYSH brand tees photoshoot — studio portraits and matching looks" },
];

const ROTATE_MS = 4000;

export function ShopPage({
  onContact,
}: {
  onContact: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = GEAR_PHOTOS[index] ?? GEAR_PHOTOS[0];

  useEffect(() => {
    if (paused || GEAR_PHOTOS.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((cur) => nextGearGalleryIndex(cur, GEAR_PHOTOS.length));
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const goTo = (next: number) => {
    if (GEAR_PHOTOS.length === 0) return;
    const len = GEAR_PHOTOS.length;
    setIndex(((next % len) + len) % len);
  };

  return (
    <div className="shop-page" data-testid="shop-page">
      <section className="glass shop-page__intro">
        <span className="glow-badge pink">
          <ShoppingBag size={13} aria-hidden /> GYSH Gear
        </span>
        <h2>Wear the hustle</h2>
        <p>
          {SITE_NAME} tees, caps, and Gang merch — Ideas. Action. Income. Freedom. Message us to
          order, and we’ll point you to the current drop.
        </p>
        <button type="button" className="btn btn-primary" onClick={onContact} data-testid="shop-contact">
          Contact us to order
        </button>
      </section>

      <section
        className="shop-page__carousel"
        data-testid="gear-carousel"
        aria-roledescription="carousel"
        aria-label="GYSH Gear photo carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
        }}
      >
        <div className="shop-page__carousel-stage">
          <button
            type="button"
            className="shop-page__carousel-nav shop-page__carousel-nav--prev"
            aria-label="Previous photo"
            data-testid="gear-carousel-prev"
            onClick={() => goTo(index - 1)}
          >
            <ChevronLeft size={22} aria-hidden />
          </button>
          <figure className="shop-page__carousel-figure">
            <img
              key={active.src}
              src={active.src}
              alt={active.alt}
              className="shop-page__carousel-image"
              data-testid="gear-carousel-image"
            />
            <figcaption className="shop-page__carousel-caption">
              {index + 1} / {GEAR_PHOTOS.length}
            </figcaption>
          </figure>
          <button
            type="button"
            className="shop-page__carousel-nav shop-page__carousel-nav--next"
            aria-label="Next photo"
            data-testid="gear-carousel-next"
            onClick={() => goTo(index + 1)}
          >
            <ChevronRight size={22} aria-hidden />
          </button>
        </div>

        <div
          className="shop-page__thumbs"
          role="tablist"
          aria-label="Gear photo thumbnails"
          data-testid="gear-carousel-thumbs"
        >
          {GEAR_PHOTOS.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show photo ${i + 1}`}
              className={`shop-page__thumb${i === index ? " is-active" : ""}`}
              data-testid={`gear-thumb-${i}`}
              onClick={() => goTo(i)}
            >
              <img src={photo.src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </section>

      <section className="shop-page__gallery" aria-label="All Gear photos">
        <h3 className="shop-page__gallery-title">All photos</h3>
        <div className="shop-page__grid" data-testid="gear-gallery-grid">
          {GEAR_PHOTOS.map((photo, i) => (
            <button
              key={`grid-${photo.src}`}
              type="button"
              className="shop-page__grid-item"
              onClick={() => {
                goTo(i);
                document.querySelector(".shop-page__carousel")?.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              }}
            >
              <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
