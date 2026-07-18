import { PLAN_COMPARE_SELECT_HINT } from "@/lib/plan-comparison-copy";
import { BENCHMARK_FILTER_PILL_UNIFORM_CLASS } from "@/lib/benchmark-report-ui";
import { cn } from "@/lib/utils";

/** Informational pill — prompts users to select plans before Side by Side appears. */
export function PlanCompareHintBubble({ className }: { className?: string }) {
  return (
    <span
      role="note"
      className={cn(
        "inline-flex max-w-full items-center justify-center rounded-full border border-emerald bg-emerald px-2.5 py-1 text-[11px] font-medium leading-snug text-white shadow-sm",
        BENCHMARK_FILTER_PILL_UNIFORM_CLASS,
        "h-auto min-h-[1.375rem] w-auto min-w-0 max-w-none whitespace-normal text-center",
        className,
      )}
    >
      {PLAN_COMPARE_SELECT_HINT}
    </span>
  );
}
