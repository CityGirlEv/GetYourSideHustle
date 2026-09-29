/** Horizontal chip/tab rows that scroll on phones (Blueprint, Schedule, …). */

export type ChipScrollerMetrics = {
  scrollLeft: number;
  scrollWidth: number;
  clientWidth: number;
  threshold?: number;
};

export function chipScrollerOverflow(metrics: ChipScrollerMetrics): {
  overflow: boolean;
  canLeft: boolean;
  canRight: boolean;
} {
  const t = metrics.threshold ?? 4;
  const max = Math.max(0, metrics.scrollWidth - metrics.clientWidth);
  const overflow = max > t;
  return {
    overflow,
    canLeft: overflow && metrics.scrollLeft > t,
    canRight: overflow && max - metrics.scrollLeft > t,
  };
}

export function chipScrollerStep(clientWidth: number): number {
  return Math.max(120, Math.round(Math.max(0, clientWidth) * 0.65));
}
