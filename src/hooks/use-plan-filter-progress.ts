import {
  estimatePlanFilterDurationMs,
  estimatePlanFilterSeconds,
  PLANS_LOADING_MESSAGE,
  PLAN_FILTER_PROGRESS_THRESHOLD,
  PLAN_FILTER_ROW_CHUNK_SIZE,
} from "@/lib/plan-filter-loading";
import { consumeBenchmarkAwaitingPlans } from "@/lib/benchmark-optin-trigger";
import type { Medication } from "@/lib/medicare-math";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { ensureCmsLandscapeLoaded } from "@/lib/cms-landscape";
import { flushSync } from "react-dom";

export type PlanFilterProgressPhase = "idle" | "filtering" | "rendering";

export type PlanFilterProgressState = {
  active: boolean;
  progress: number;
  secondsLeft: number;
  phase: PlanFilterProgressPhase;
  planCount: number;
};

const IDLE_PROGRESS: PlanFilterProgressState = {
  active: false,
  progress: 0,
  secondsLeft: 0,
  phase: "idle",
  planCount: 0,
};

type AppliedFilter = {
  panelKey: string;
  scopeKey: string;
  tabKey: string;
};

export function useDeferredPlanFilter({
  panelKey,
  scopeKey,
  tabKey,
  catalogPlanCount,
  enableProgressOverlay = true,
}: {
  panelKey: string;
  scopeKey: string;
  tabKey: string;
  catalogPlanCount: number;
  /** When false, filters apply immediately with no progress overlay (e.g. outside Plan Options). */
  enableProgressOverlay?: boolean;
}) {
  const requestKey = `${panelKey}|${scopeKey}|${tabKey}`;
  const [applied, setApplied] = useState<AppliedFilter>({
    panelKey,
    scopeKey,
    tabKey,
  });
  const [progress, setProgress] = useState<PlanFilterProgressState>(IDLE_PROGRESS);
  const tickRef = useRef<number | null>(null);
  const finishRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (finishRef.current != null) {
      window.clearTimeout(finishRef.current);
      finishRef.current = null;
    }
  }, []);

  const startProgressTick = useCallback(
    (estMs: number, planCount: number, phase: PlanFilterProgressPhase, startPercent: number) => {
      clearTimers();
      const started = Date.now();
      flushSync(() => {
        setProgress({
          active: true,
          progress: startPercent,
          secondsLeft: estimatePlanFilterSeconds(planCount),
          phase,
          planCount,
        });
      });

      tickRef.current = window.setInterval(() => {
        const elapsed = Date.now() - started;
        const span = phase === "filtering" ? estMs * 0.35 : estMs * 0.65;
        const pct =
          phase === "filtering"
            ? startPercent + Math.min(30, (elapsed / span) * 30)
            : startPercent + Math.min(65, (elapsed / span) * 65);
        setProgress((prev) => ({
          ...prev,
          progress: Math.min(phase === "filtering" ? 35 : 99, pct),
          secondsLeft: Math.max(0, Math.ceil((estMs - elapsed) / 1000)),
        }));
      }, 100);
    },
    [clearTimers],
  );

  useEffect(() => {
    const appliedKey = `${applied.panelKey}|${applied.scopeKey}|${applied.tabKey}`;
    if (requestKey === appliedKey) return;

    if (
      !enableProgressOverlay ||
      catalogPlanCount < PLAN_FILTER_PROGRESS_THRESHOLD
    ) {
      clearTimers();
      setApplied({ panelKey, scopeKey, tabKey });
      setProgress(IDLE_PROGRESS);
      return;
    }

    const estMs = estimatePlanFilterDurationMs(catalogPlanCount);
    startProgressTick(estMs, catalogPlanCount, "filtering", 0);

    let frame2: number | undefined;
    void ensureCmsLandscapeLoaded();

    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        startTransition(() => {
          setApplied({ panelKey, scopeKey, tabKey });
        });
      });
    });

    return () => {
      cancelAnimationFrame(frame1);
      if (frame2 != null) cancelAnimationFrame(frame2);
      // If a newer filter request superseded this one, still apply so progress can finish.
      setApplied({ panelKey, scopeKey, tabKey });
    };
  }, [
    requestKey,
    applied.panelKey,
    applied.scopeKey,
    applied.tabKey,
    panelKey,
    scopeKey,
    tabKey,
    catalogPlanCount,
    enableProgressOverlay,
    clearTimers,
    startProgressTick,
  ]);

  const beginRendering = useCallback(
    (rowCount: number) => {
      if (rowCount < PLAN_FILTER_PROGRESS_THRESHOLD) {
        clearTimers();
        setProgress(IDLE_PROGRESS);
        return;
      }
      const estMs = estimatePlanFilterDurationMs(rowCount);
      startProgressTick(estMs, rowCount, "rendering", 35);
    },
    [clearTimers, startProgressTick],
  );

  const updateRendering = useCallback((rendered: number, total: number, estMs: number) => {
    const pct = 35 + (rendered / total) * 64;
    const elapsed = estMs * (rendered / total);
    setProgress((prev) => ({
      ...prev,
      active: true,
      phase: "rendering",
      planCount: total,
      progress: Math.min(99, pct),
      secondsLeft: Math.max(0, Math.ceil((estMs - elapsed) / 1000)),
    }));
  }, []);

  const complete = useCallback(() => {
    clearTimers();
    setProgress((prev) =>
      prev.active ? { ...prev, progress: 100, secondsLeft: 0, phase: "idle" } : IDLE_PROGRESS,
    );
    finishRef.current = window.setTimeout(() => setProgress(IDLE_PROGRESS), 350);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Failsafe â€” never leave the overlay spinning indefinitely.
  useEffect(() => {
    if (!progress.active) return;
    const timeout = window.setTimeout(() => {
      setProgress(IDLE_PROGRESS);
    }, 30_000);
    return () => window.clearTimeout(timeout);
  }, [progress.active, requestKey]);

  return {
    appliedPanelKey: applied.panelKey,
    appliedScopeKey: applied.scopeKey,
    appliedTabKey: applied.tabKey,
    progress,
    beginRendering,
    updateRendering,
    complete,
    rowChunkSize: PLAN_FILTER_ROW_CHUNK_SIZE,
    progressThreshold: PLAN_FILTER_PROGRESS_THRESHOLD,
  };
}

export function useProgressivePlanRows<T>(
  items: T[],
  {
    enabled,
    chunkSize,
    threshold,
    onBegin,
    onChunk,
    onComplete,
  }: {
    enabled: boolean;
    chunkSize: number;
    threshold: number;
    onBegin?: (total: number) => void;
    onChunk?: (rendered: number, total: number, estMs: number) => void;
    onComplete?: () => void;
  },
) {
  const [visibleItems, setVisibleItems] = useState(items);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onBeginRef = useRef(onBegin);
  const onChunkRef = useRef(onChunk);
  const onCompleteRef = useRef(onComplete);
  onBeginRef.current = onBegin;
  onChunkRef.current = onChunk;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (items.length <= threshold) {
      setVisibleItems(items);
      onCompleteRef.current?.();
      return;
    }

    if (!enabled) {
      setVisibleItems(items);
      return;
    }

    let cancelled = false;
    let index = 0;
    const total = items.length;
    const estMs = estimatePlanFilterDurationMs(total);
    onBeginRef.current?.(total);

    const step = () => {
      if (cancelled) return;
      index = Math.min(total, index + chunkSize);
      setVisibleItems(itemsRef.current.slice(0, index));
      onChunkRef.current?.(index, total, estMs);
      if (index < total) {
        requestAnimationFrame(step);
      } else {
        onCompleteRef.current?.();
      }
    };

    setVisibleItems([]);
    requestAnimationFrame(step);

    return () => {
      cancelled = true;
    };
  }, [items, enabled, chunkSize, threshold]);

  return visibleItems;
}

/** Defer heavy Medicare catalog work so the hourglass overlay can paint first. */
export function useReportPotentialPlansLoad(
  estimateId: string,
  catalogPlanCount = 0,
  _catalogInput?: { year: number; medications: Medication[] },
) {
  const [awaitingOnMount, setAwaitingOnMount] = useState(false);
  const [catalogEnabled, setCatalogEnabled] = useState(true);
  const [overlayState, setOverlayState] = useState<PlanFilterProgressState>(IDLE_PROGRESS);
  const tickRef = useRef<number | null>(null);
  const finishRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (finishRef.current != null) {
      window.clearTimeout(finishRef.current);
      finishRef.current = null;
    }
  }, []);

  const startProgressTick = useCallback(
    (estMs: number, planCount: number) => {
      clearTimers();
      const started = Date.now();
      flushSync(() => {
        setOverlayState({
          active: true,
          progress: 0,
          secondsLeft: estimatePlanFilterSeconds(planCount || 5000),
          phase: "filtering",
          planCount,
        });
      });

      tickRef.current = window.setInterval(() => {
        const elapsed = Date.now() - started;
        const span = estMs * 0.85;
        const pct = Math.min(90, (elapsed / span) * 90);
        setOverlayState((prev) => ({
          ...prev,
          progress: pct,
          secondsLeft: Math.max(0, Math.ceil((estMs - elapsed) / 1000)),
        }));
      }, 100);
    },
    [clearTimers],
  );

  useEffect(() => {
    const flagged = consumeBenchmarkAwaitingPlans(estimateId);
    if (!flagged) {
      setAwaitingOnMount(false);
      setCatalogEnabled(true);
      setOverlayState(IDLE_PROGRESS);
      return;
    }

    setAwaitingOnMount(true);
    setCatalogEnabled(false);
    const estMs = estimatePlanFilterDurationMs(5000);
    startProgressTick(estMs, 0);

    let cancelled = false;
    let frame1: number | undefined;
    let frame2: number | undefined;

    void ensureCmsLandscapeLoaded().then(() => {
      if (cancelled) return;
      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => {
          if (cancelled) return;
          startTransition(() => {
            setCatalogEnabled(true);
          });
        });
      });
    });

    return () => {
      cancelled = true;
      if (frame1 != null) cancelAnimationFrame(frame1);
      if (frame2 != null) cancelAnimationFrame(frame2);
    };
  }, [estimateId, startProgressTick]);

  useEffect(() => {
    if (!awaitingOnMount || !catalogEnabled || catalogPlanCount <= 0) return;
    const estMs = estimatePlanFilterDurationMs(catalogPlanCount);
    startProgressTick(estMs, catalogPlanCount);
  }, [awaitingOnMount, catalogEnabled, catalogPlanCount, startProgressTick]);

  const completeInitialLoad = useCallback(() => {
    clearTimers();
    setOverlayState((prev) =>
      prev.active ? { ...prev, progress: 100, secondsLeft: 0, phase: "idle" } : IDLE_PROGRESS,
    );
    finishRef.current = window.setTimeout(() => setOverlayState(IDLE_PROGRESS), 350);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (!overlayState.active) return;
    const timeout = window.setTimeout(() => setOverlayState(IDLE_PROGRESS), 30_000);
    return () => window.clearTimeout(timeout);
  }, [overlayState.active, estimateId]);

  const overlayLabel = PLANS_LOADING_MESSAGE;

  return {
    awaitingOnMount,
    overlayOpen: overlayState.active,
    overlayState,
    overlayLabel,
    catalogEnabled,
    completeInitialLoad,
  };
}
