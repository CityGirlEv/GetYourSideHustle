import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Hourglass } from "lucide-react";

/**
 * Fixed-position hourglass overlay that appears whenever the app is
 * actively doing work — pending route navigation, in-flight React Query
 * fetches, or running mutations. Shows after a 250ms delay so it doesn't
 * flash for instantaneous work, and announces itself to screen readers.
 */
export function GlobalBusyIndicator() {
  const routerStatus = useRouterState({ select: (s) => s.status });
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const busy = routerStatus === "pending" || isFetching > 0 || isMutating > 0;

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!busy) { setVisible(false); return; }
    const t = setTimeout(() => setVisible(true), 250);
    return () => clearTimeout(t);
  }, [busy]);

  if (!visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Processing"
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
    >
      <div className="pointer-events-none flex items-center gap-3 rounded-2xl border border-border bg-background/95 px-5 py-4 shadow-2xl backdrop-blur">
        <Hourglass className="h-6 w-6 text-primary animate-spin [animation-duration:1.6s]" />
        <span className="text-sm font-semibold text-foreground">Processing…</span>
      </div>
    </div>
  );
}