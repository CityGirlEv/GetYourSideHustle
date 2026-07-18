import { FontSizeToggle } from "@/components/FontSizeToggle";
import { YearToggle } from "@/components/YearToggle";
import { cn } from "@/lib/utils";

/** Plan year bubbles + page zoom on one compact row (site header). */
export function PlanYearZoomControls({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 min-w-0", className)}>
      <YearToggle tone={tone} />
      <FontSizeToggle tone={tone} />
    </div>
  );
}
