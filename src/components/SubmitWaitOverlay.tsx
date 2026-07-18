import { useEffect, useState } from "react";
import { Hourglass } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

type SubmitWaitOverlayProps = {
  open: boolean;
  /** Shown under the hourglass. */
  label?: string;
  /** Countdown starts here and ticks down each second while open. */
  countdownSeconds?: number;
};

/**
 * Hourglass overlay with a seconds countdown for slow form submissions.
 */
export function SubmitWaitOverlay({
  open,
  label = "Submitting your request…",
  countdownSeconds = 15,
}: SubmitWaitOverlayProps) {
  const [remaining, setRemaining] = useState(countdownSeconds);

  useEffect(() => {
    if (!open) {
      setRemaining(countdownSeconds);
      return;
    }
    setRemaining(countdownSeconds);
    const interval = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [open, countdownSeconds]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="absolute inset-0 z-10 flex flex-col items-center justify-start gap-10 rounded-lg bg-background/92 px-6 pt-14 text-center backdrop-blur-sm sm:gap-12 sm:pt-16"
    >
      <BrandLogo size="compact" />
      <div className="flex flex-col items-center">
        <Hourglass className="h-9 w-9 text-primary animate-spin [animation-duration:1.6s]" />
        <p className="mt-4 text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {remaining > 0 ? (
            <>
              Estimated time remaining:{" "}
              <span className="font-mono font-semibold tabular-nums text-foreground">{remaining}s</span>
            </>
          ) : (
            "Still working — this can take a moment. Please keep this window open."
          )}
        </p>
      </div>
    </div>
  );
}
