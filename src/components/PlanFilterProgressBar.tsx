import { Progress } from "@/components/ui/progress";
import {
  formatPlanFilterCountdown,
  planFilterProgressLabel,
} from "@/lib/plan-filter-loading";
import type { PlanFilterProgressPhase } from "@/hooks/use-plan-filter-progress";

export function PlanFilterProgressBar({
  progress,
  secondsLeft,
  phase,
  planCount,
  className,
}: {
  progress: number;
  secondsLeft: number;
  phase: PlanFilterProgressPhase;
  planCount: number;
  className?: string;
}) {
  if (phase === "idle" && progress <= 0) return null;

  const label =
    phase === "filtering" || phase === "rendering"
      ? planFilterProgressLabel(planCount, phase)
      : "Loading plans…";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={className}
    >
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {formatPlanFilterCountdown(secondsLeft)}
        </span>
      </div>
      <Progress value={progress} className="mt-2 h-2" />
      <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">
        {Math.round(progress)}% complete
      </p>
    </div>
  );
}
