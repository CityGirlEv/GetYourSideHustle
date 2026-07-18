import brandLogo from "@/assets/part-b-optimizer-logo.png";
import miniLogo from "@/assets/footer-mini-logo.png";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { cn } from "@/lib/utils";

const logoSizes = {
  /** Full-width hero / email header */
  default: "block h-auto w-52 sm:w-64 md:w-80 max-w-full object-contain object-left",
  /** Header wordmark — left-aligned in site nav */
  nav: "block h-auto w-36 sm:w-44 md:w-52 lg:w-60 max-w-[min(62vw,15rem)] sm:max-w-none object-contain object-left leading-none",
  /** Compact wordmark beside inline mobile nav links */
  navMobile: "block h-auto w-[5.75rem] max-w-[34vw] object-contain object-left leading-none",
  /** Compact card / home hero */
  compact: "block h-auto w-full max-w-[11rem] sm:max-w-[12rem] mx-auto object-contain object-left",
  /** PB+ monogram — hero cards and compact icon slots */
  icon: "block h-auto w-12 sm:w-14 md:w-16 mx-auto object-contain",
  /** PB+ monogram — site footer */
  footer: "block h-7 w-7 sm:h-8 sm:w-8 object-contain object-center",
} as const;

interface BrandLogoProps {
  className?: string;
  size?: keyof typeof logoSizes;
}

export function BrandLogo({ className, size = "default" }: BrandLogoProps) {
  const src = size === "icon" || size === "footer" ? miniLogo : brandLogo;
  return (
    <img
      src={src}
      alt={SITE_BRAND_NAME}
      decoding="async"
      className={cn(logoSizes[size], className)}
    />
  );
}
