/** Session keys for benchmark report partner opt-in auto-popup. */
export function benchmarkOptInSessionKeys(code: string) {
  return {
    justCreated: `benchmark-just-created:${code}`,
    shown: `expert-optin-shown:${code}`,
  };
}

/** Session flag: Potential Options catalog should show the hourglass overlay on next report mount. */
export function benchmarkAwaitPlansKey(code: string): string {
  return `benchmark-await-plans:${code}`;
}

export function markBenchmarkAwaitingPlans(code: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(benchmarkAwaitPlansKey(code), "1");
}

/** True while the await-plans flag is set (before consume clears it). */
export function isBenchmarkAwaitingPlans(code: string): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(benchmarkAwaitPlansKey(code)) === "1";
}

/** Read and clear the await-plans flag — true only on the first mount after navigation. */
export function consumeBenchmarkAwaitingPlans(code: string): boolean {
  if (typeof sessionStorage === "undefined") return false;
  const key = benchmarkAwaitPlansKey(code);
  if (sessionStorage.getItem(key) !== "1") return false;
  sessionStorage.removeItem(key);
  return true;
}

/** Whether the expert opt-in dialog should auto-open on a new benchmark report. */
export function shouldAutoOpenBenchmarkExpertOptIn(opts: {
  justCreated: boolean;
  benchmarkJustCreatedFlag: string | null;
  expertOptInShown: string | null;
}): boolean {
  if (opts.expertOptInShown) return false;
  return opts.justCreated || opts.benchmarkJustCreatedFlag === "1";
}
