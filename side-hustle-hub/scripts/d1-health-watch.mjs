/**
 * Health-watch policy for `wrangler pages dev` + D1.
 *
 * Remote D1 cold queries often take 20–40s. A 20s timeout plus overlapping
 * probes restarts a healthy worker and can spawn two Wranglers on :8788.
 */

/** @typedef {"ok" | "http_error" | "timeout" | "unreachable"} D1HealthEvent */

/**
 * @param {boolean} useRemoteD1
 */
export function d1HealthWatchConfig(useRemoteD1) {
  if (useRemoteD1) {
    return {
      intervalMs: 30_000,
      reqTimeoutMs: 60_000,
      graceMs: 45_000,
      timeoutFailLimit: 3,
      httpFailLimit: 3,
      unreachableFailLimit: 3,
    };
  }
  return {
    intervalMs: 15_000,
    reqTimeoutMs: 5_000,
    graceMs: 5_000,
    timeoutFailLimit: 2,
    httpFailLimit: 2,
    unreachableFailLimit: 3,
  };
}

/**
 * @param {{ shuttingDown?: boolean, restarting?: boolean, probeInFlight?: boolean, startedAt?: number, now?: number, graceMs?: number }} state
 */
export function shouldSkipHealthProbe(state) {
  if (state.shuttingDown || state.restarting || state.probeInFlight) return true;
  const graceMs = state.graceMs ?? 0;
  if (graceMs > 0 && state.startedAt) {
    const now = state.now ?? Date.now();
    if (now - state.startedAt < graceMs) return true;
  }
  return false;
}

/**
 * Keep the restart lock until the replacement process is spawned.
 * Clearing it in the exit handler lets a second timeout start a second Wrangler.
 *
 * @param {{ shuttingDown?: boolean, restarting?: boolean, hasChild?: boolean }} state
 * @returns {"ignore" | "kill-child" | "spawn-now"}
 */
export function wranglerRestartRequestAction(state) {
  if (state.shuttingDown || state.restarting) return "ignore";
  return state.hasChild ? "kill-child" : "spawn-now";
}

/**
 * @param {{ shuttingDown?: boolean, restarting?: boolean }} state
 * @returns {"ignore" | "respawn"}
 */
export function wranglerExitAction(state) {
  if (state.shuttingDown) return "ignore";
  return "respawn";
}

/**
 * @param {{ failStreak?: number, shuttingDown?: boolean, restarting?: boolean }} state
 * @param {D1HealthEvent} event
 * @param {ReturnType<typeof d1HealthWatchConfig>} config
 */
export function applyD1HealthWatchEvent(state, event, config) {
  if (state.shuttingDown || state.restarting) {
    return { failStreak: state.failStreak ?? 0, restart: false };
  }
  if (event === "ok") {
    return { failStreak: 0, restart: false };
  }
  const failStreak = (state.failStreak ?? 0) + 1;
  const limit =
    event === "timeout"
      ? config.timeoutFailLimit
      : event === "http_error"
        ? config.httpFailLimit
        : config.unreachableFailLimit;
  return { failStreak, restart: failStreak >= limit };
}
