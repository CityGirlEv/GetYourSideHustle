import brandLogo from "@/assets/get-part-b-optimizer-logo.png";
import brandIcon from "@/assets/get-part-b-optimizer-icon.png";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { cn } from "@/lib/utils";

const logoSizes = {
  /** Full-width hero / email header */
  default: "block h-auto w-48 sm:w-60 md:w-80 max-w-full object-contain",
  /** Center column in site nav — wide horizontal wordmark */
  nav: "block h-auto w-32 sm:w-40 md:w-52 lg:w-60 max-w-[min(60vw,14rem)] sm:max-w-none object-contain object-bottom",
  /** Compact card / home hero */
  compact: "block h-auto w-full max-w-[10rem] sm:max-w-[11rem] mx-auto object-contain",
  /** GPB monogram icon — home hero white card */
  icon: "block h-auto w-12 sm:w-14 md:w-16 mx-auto object-contain",
} as const;

interface BrandLogoProps {
  className?: string;
  size?: keyof typeof logoSizes;
}

export function BrandLogo({ className, size = "default" }: BrandLogoProps) {
  const src = size === "icon" ? brandIcon : brandLogo;
  return (
    <img src={src} alt={SITE_BRAND_NAME} className={cn(logoSizes[size], className)} />
  );
}
