/** Exact ratio 0–100 for progress bars (never rounds 467/468 up to 100). */
export function testRatePercentValue(n: number, total: number): number {
  if (total <= 0) return 0;
  if (n <= 0) return 0;
  if (n >= total) return 100;
  return (n / total) * 100;
}

/** Human-readable percent — shows one decimal when Math.round would lie. */
export function formatTestRatePercent(n: number, total: number): string {
  if (total <= 0) return "0%";
  if (n >= total) return "100%";
  const pct = testRatePercentValue(n, total);
  const rounded = Math.round(pct);
  if (rounded >= 100 && n < total) return `${pct.toFixed(1).replace(/\.0$/, "")}%`;
  return `${rounded}%`;
}
