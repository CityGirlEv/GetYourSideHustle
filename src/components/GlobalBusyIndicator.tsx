import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Hourglass } from "lucide-react";

/** Routes with inline progress UI — skip the global hourglass overlay. */
const SUPPRESS_BUSY_OVERLAY_PATHS = new Set(["/admin/competitor-scouting"]);

/**
 * Lightweight hourglass chip when the app has in-flight router/query work.
 * Suppressed on pages that already show their own progress (e.g. competitor scouting).
 */
export function GlobalBusyIndicator() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const routerStatus = useRouterState({ select: (s) => s.status });
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const busy = routerStatus === "pending" || isFetching > 0 || isMutating > 0;
  const suppressed = SUPPRESS_BUSY_OVERLAY_PATHS.has(pathname);

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!busy || suppressed) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), 250);
    return () => clearTimeout(t);
  }, [busy, suppressed]);

  if (!visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Processing"
      className="fixed bottom-4 right-4 z-[100] pointer-events-none"
    >
      <div className="pointer-events-none flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur">
        <Hourglass className="h-4 w-4 text-primary animate-spin [animation-duration:1.6s]" />
        <span className="text-xs font-medium text-foreground">Processing…</span>
      </div>
    </div>
  );
}
