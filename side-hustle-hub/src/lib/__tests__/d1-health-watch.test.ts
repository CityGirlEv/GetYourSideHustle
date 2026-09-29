import { describe, expect, it } from "vitest";
import {
  applyD1HealthWatchEvent,
  d1HealthWatchConfig,
  shouldSkipHealthProbe,
  wranglerExitAction,
  wranglerRestartRequestAction,
} from "../../../scripts/d1-health-watch.mjs";

describe("d1HealthWatchConfig", () => {
  it("gives remote D1 a timeout longer than a 24s cold health query", () => {
    const remote = d1HealthWatchConfig(true);
    expect(remote.reqTimeoutMs).toBeGreaterThanOrEqual(60_000);
    expect(remote.intervalMs).toBeGreaterThanOrEqual(remote.reqTimeoutMs / 2);
    expect(remote.timeoutFailLimit).toBeGreaterThanOrEqual(3);
    expect(remote.graceMs).toBeGreaterThanOrEqual(45_000);
  });

  it("keeps the local-sandbox watch snappier", () => {
    const local = d1HealthWatchConfig(false);
    expect(local.reqTimeoutMs).toBe(5_000);
    expect(local.intervalMs).toBe(15_000);
  });
});

describe("shouldSkipHealthProbe", () => {
  it("does not overlap probes or poll while Wrangler is restarting", () => {
    expect(shouldSkipHealthProbe({ probeInFlight: true })).toBe(true);
    expect(shouldSkipHealthProbe({ restarting: true })).toBe(true);
    expect(shouldSkipHealthProbe({ shuttingDown: true })).toBe(true);
    expect(shouldSkipHealthProbe({})).toBe(false);
  });

  it("skips during the post-start grace window", () => {
    const cfg = d1HealthWatchConfig(true);
    expect(
      shouldSkipHealthProbe({
        startedAt: 1_000,
        now: 20_000,
        graceMs: cfg.graceMs,
      }),
    ).toBe(true);
    expect(
      shouldSkipHealthProbe({
        startedAt: 1_000,
        now: 50_000,
        graceMs: cfg.graceMs,
      }),
    ).toBe(false);
  });
});

describe("applyD1HealthWatchEvent", () => {
  const remote = d1HealthWatchConfig(true);

  it("does not restart after two slow timeouts (the old death spiral)", () => {
    let state = { failStreak: 0 };
    const first = applyD1HealthWatchEvent(state, "timeout", remote);
    expect(first.restart).toBe(false);
    const second = applyD1HealthWatchEvent(first, "timeout", remote);
    expect(second.restart).toBe(false);
    expect(second.failStreak).toBe(2);
  });

  it("restarts after three consecutive remote timeouts", () => {
    let state = { failStreak: 0 };
    for (let i = 0; i < 2; i += 1) {
      state = applyD1HealthWatchEvent(state, "timeout", remote);
    }
    const third = applyD1HealthWatchEvent(state, "timeout", remote);
    expect(third.restart).toBe(true);
    expect(third.failStreak).toBe(3);
  });

  it("resets the streak on a healthy response", () => {
    const afterFail = applyD1HealthWatchEvent({ failStreak: 2 }, "ok", remote);
    expect(afterFail).toEqual({ failStreak: 0, restart: false });
  });

  it("ignores probes while a restart is already in flight", () => {
    const ignored = applyD1HealthWatchEvent(
      { failStreak: 2, restarting: true },
      "timeout",
      remote,
    );
    expect(ignored).toEqual({ failStreak: 2, restart: false });
  });
});

describe("wrangler restart lock", () => {
  it("does not start a second Wrangler while one restart is already pending", () => {
    expect(wranglerRestartRequestAction({ restarting: true, hasChild: true })).toBe(
      "ignore",
    );
    expect(wranglerRestartRequestAction({ hasChild: true })).toBe("kill-child");
    expect(wranglerRestartRequestAction({ hasChild: false })).toBe("spawn-now");
  });

  it("respawns after an unexpected exit, but not during shutdown", () => {
    expect(wranglerExitAction({ restarting: false })).toBe("respawn");
    expect(wranglerExitAction({ restarting: true })).toBe("respawn");
    expect(wranglerExitAction({ shuttingDown: true })).toBe("ignore");
  });
});
