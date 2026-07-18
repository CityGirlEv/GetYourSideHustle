import homeCoverHero from "@/assets/home-cover-hero.png";
import homeCoverHeroWebp from "@/assets/home-cover-hero.webp";
import { SITE_BRAND_THE } from "@/lib/site-brand";
import { cn } from "@/lib/utils";

/** Native hero artboard from the imported artwork. */
const HERO_WIDTH = 1024;
const HERO_HEIGHT = 694;
export const HOME_COVER_HERO_ASPECT_CLASS = "aspect-[1024/694]";
const HERO_ASPECT_RATIO = `${HERO_WIDTH} / ${HERO_HEIGHT}`;

interface HomeCoverHeroProps {
  className?: string;
  /** Size to the hero column while keeping the full artwork visible. */
  fillHeight?: boolean;
}

export function HomeCoverHero({ className, fillHeight = false }: HomeCoverHeroProps) {
  const img = (
    <img
      src={homeCoverHero}
      alt={`Before and after: from confusing Medicare plan choices to clarity with ${SITE_BRAND_THE}`}
      width={HERO_WIDTH}
      height={HERO_HEIGHT}
      decoding="async"
      fetchPriority="high"
      className="block h-full w-full object-cover object-center"
    />
  );

  if (fillHeight) {
    return (
      <div className={cn("h-full w-full min-h-0 overflow-hidden", className)}>
        <picture className="block h-full w-full">
          <source srcSet={homeCoverHeroWebp} type="image/webp" />
          {img}
        </picture>
      </div>
    );
  }

  return (
    <picture className={cn("block w-full", className)} style={{ aspectRatio: HERO_ASPECT_RATIO }}>
      <source srcSet={homeCoverHeroWebp} type="image/webp" />
      {img}
    </picture>
  );
}
