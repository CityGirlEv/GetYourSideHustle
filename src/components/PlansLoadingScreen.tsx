import { BrandLogo } from "@/components/BrandLogo";
import { PLANS_LOADING_MESSAGE } from "@/lib/plan-filter-loading";
import { cn } from "@/lib/utils";

type PlansLoadingScreenProps = {
  message?: string;
  className?: string;
};

/** Logo + patience message while Medicare plans or catalog data load. */
export function PlansLoadingScreen({
  message = PLANS_LOADING_MESSAGE,
  className,
}: PlansLoadingScreenProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center px-4 py-6", className)}>
      <BrandLogo size="compact" className="mx-auto" />
      <p className="mt-4 max-w-sm text-sm font-semibold text-foreground leading-snug">{message}</p>
    </div>
  );
}
