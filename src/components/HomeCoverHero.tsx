import homeCoverHero from "@/assets/home-cover-hero.png";
import { SITE_BRAND_THE } from "@/lib/site-brand";

export function HomeCoverHero() {
  return (
    <img
      src={homeCoverHero}
      alt={`Before and after: from confusing Medicare plan choices to clarity with ${SITE_BRAND_THE}`}
      className="block h-auto max-h-full w-full object-contain object-top leading-none"
    />
  );
}
