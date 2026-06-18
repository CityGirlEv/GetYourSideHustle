import brandLogo from "@/assets/get-part-b-optimizer-logo.png";
import brandIcon from "@/assets/get-part-b-optimizer-icon.png";
import footerMiniLogo from "@/assets/footer-mini-logo.png";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { cn } from "@/lib/utils";

const logoSizes = {
  /** Full-width hero / email header */
  default: "block h-auto w-48 sm:w-60 md:w-80 max-w-full object-contain object-top",
  /** Compact wordmark beside inline mobile nav links */
  navMobile: "block h-auto w-[4.5rem] max-w-[28vw] object-contain object-left",
  /** Header wordmark — left-aligned in site nav */
  nav: "block h-auto w-28 sm:w-32 md:w-40 lg:w-48 max-w-[min(55vw,12rem)] sm:max-w-none object-contain object-top",
  /** Compact card / home hero */
  compact: "block h-auto w-full max-w-[10rem] sm:max-w-[11rem] mx-auto object-contain object-top",
  /** GPB monogram icon — home hero white card */
  icon: "block h-auto w-12 sm:w-14 md:w-16 mx-auto object-contain",
  /** PB monogram — site footer */
  footer: "block h-9 w-9 sm:h-10 sm:w-10 object-contain object-center",
} as const;

interface BrandLogoProps {
  className?: string;
  size?: keyof typeof logoSizes;
}

export function BrandLogo({ className, size = "default" }: BrandLogoProps) {
  const src = size === "icon" ? brandIcon : size === "footer" ? footerMiniLogo : brandLogo;
  return <img src={src} alt={SITE_BRAND_NAME} className={cn(logoSizes[size], className)} />;
}
