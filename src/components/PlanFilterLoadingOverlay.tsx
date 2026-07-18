import { createPortal } from "react-dom";
import { PlanFilterProgressBar } from "@/components/PlanFilterProgressBar";
import { PlansLoadingScreen } from "@/components/PlansLoadingScreen";
import { formatPlanFilterCountdown, PLANS_LOADING_MESSAGE } from "@/lib/plan-filter-loading";
import { cn } from "@/lib/utils";
import type { PlanFilterProgressPhase } from "@/hooks/use-plan-filter-progress";

type PlanFilterLoadingOverlayProps = {
  open: boolean;
  phase: PlanFilterProgressPhase;
  planCount: number;
  secondsLeft: number;
  progress: number;
  /** Override the default loading message. */
  label?: string;
  /** `fixed` covers the viewport (portaled to body); `absolute` covers the nearest positioned ancestor. */
  variant?: "absolute" | "fixed";
  className?: string;
};

/**
 * Full-screen plan loading overlay — logo, patience message, and optional progress bar.
 */
export function PlanFilterLoadingOverlay({
  open,
  phase,
  planCount,
  secondsLeft,
  progress: progressPct,
  label: labelOverride,
  variant = "absolute",
  className,
}: PlanFilterLoadingOverlayProps) {
  if (!open) return null;

  const message = labelOverride ?? PLANS_LOADING_MESSAGE;
  const showProgress = phase === "filtering" || phase === "rendering" || progressPct > 0;

  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
      className={cn(
        "flex flex-col items-center justify-center bg-background/92 px-6 py-8 text-center backdrop-blur-sm",
        variant === "fixed" ? "fixed inset-0 z-[200]" : "absolute inset-0 z-30 rounded-lg",
        className,
      )}
    >
      <PlansLoadingScreen message={message} />
      {showProgress ? (
        <>
          <p className="mt-2 text-xs text-muted-foreground">{formatPlanFilterCountdown(secondsLeft)}</p>
          <PlanFilterProgressBar
            progress={progressPct}
            secondsLeft={secondsLeft}
            phase={phase}
            planCount={planCount}
            className="mt-4 w-full max-w-xs"
          />
        </>
      ) : null}
    </div>
  );

  if (variant === "fixed" && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}
