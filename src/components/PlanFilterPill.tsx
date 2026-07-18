import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { BENCHMARK_FILTER_PILL_UNIFORM_CLASS } from "@/lib/benchmark-report-ui";

function planFilterPillText(label: string, count: number | undefined, hideCount?: boolean) {
  if (hideCount || count == null) return label;
  return `${label}-${count}`;
}

export const PlanFilterPill = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    active: boolean;
    count?: number;
    onClick: () => void;
    hideCount?: boolean;
    /** `link` — text-style filter for inline Medigap sub-options. */
    variant?: "pill" | "link";
    /** Tighter pill for single-line filter toolbars. */
    size?: "default" | "compact";
    /** Fixed equal width — benchmark report filter rows. */
    uniformSize?: boolean;
  }
>(function PlanFilterPill(
  {
    label,
    active,
    count,
    onClick,
    hideCount,
    variant = "pill",
    size = "default",
    uniformSize = false,
  },
  ref,
) {
  const isLink = variant === "link";
  const isCompact = size === "compact";
  const text = planFilterPillText(label, count, hideCount);

  return (
    <button
      ref={ref}
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "justify-self-start",
        "inline-flex cursor-pointer items-center transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed",
        isLink
          ? cn(
              isCompact ? "gap-0.5 text-micro" : "gap-1 text-xs",
              "rounded-sm border-0 bg-transparent font-medium underline-offset-2",
              isCompact ? "px-0 py-0" : "px-0.5 py-0",
              active
                ? "text-primary font-semibold underline"
                : "text-primary/80 hover:text-primary hover:underline",
            )
          : uniformSize
            ? cn(
                "rounded-full border font-medium text-white",
                BENCHMARK_FILTER_PILL_UNIFORM_CLASS,
                active
                  ? "border-emerald bg-emerald font-semibold shadow-sm"
                  : "border-[var(--brand-navy-light)] bg-[var(--brand-navy-light)] shadow-sm hover:bg-[var(--brand-navy-accent)]",
              )
            : cn(
                isCompact ? "gap-0.5 text-xs" : "gap-1 text-xs",
                "rounded-full border font-medium text-white whitespace-nowrap justify-center",
                isCompact ? "px-2 py-0.5" : "px-2 py-0.5",
                active
                  ? "border-emerald bg-emerald font-semibold shadow-sm"
                  : "border-[var(--brand-navy-light)] bg-[var(--brand-navy-light)] shadow-sm hover:bg-[var(--brand-navy-accent)]",
              ),
      )}
    >
      <span
        className={cn(
          isLink ? undefined : "text-white text-center truncate max-w-full",
          !isLink && count != null && !hideCount ? "tabular-nums" : undefined,
        )}
      >
        {text}
      </span>
    </button>
  );
});
