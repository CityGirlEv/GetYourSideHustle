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
      className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur pointer-events-none"
    >
      <Hourglass className="h-4 w-4 text-primary animate-spin [animation-duration:1.6s]" />
      <span className="text-xs font-medium text-foreground">Processing…</span>
    </div>
  );
}