import { describe, expect, it, vi } from "vitest";
import {
  AUTH_READY_SAFETY_MS,
  clearStaleChunkReloadFlag,
  htmlModulePreloadDeps,
  isStaleBundledAssetUrl,
  isStaleChunkFailureMessage,
  lazyImportWithStaleRecovery,
  SESSION_RESTORE_TIMEOUT_MS,
  shouldClearSessionOnMeFailure,
  shouldReloadForStaleChunk,
  showStaleShellRefreshBanner,
  staleAssetReloadKey,
  STALE_CHUNK_RELOAD_KEY,
  STALE_SHELL_BANNER_ID,
  staleShellRefreshBannerHtml,
} from "../first-load";

function memoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    store,
  };
}

describe("first-load", () => {
  it("keeps shared entry chunks in the HTML modulepreload list", () => {
    expect(
      htmlModulePreloadDeps([
        "/assets/index-DSzPhECU.js",
        "/assets/api-Bm9RvMqV.js",
        "/assets/membership-DQEvSKsy.js",
        "/assets/chunk-QTnfLwEv.js",
      ]),
    ).toEqual([
      "/assets/index-DSzPhECU.js",
      "/assets/api-Bm9RvMqV.js",
      "/assets/membership-DQEvSKsy.js",
      "/assets/chunk-QTnfLwEv.js",
    ]);
  });

  it("drops lazy popup and page chunks so they do not compete with first paint", () => {
    expect(
      htmlModulePreloadDeps([
        "/assets/api-Bm9RvMqV.js",
        "/assets/ScheduleDuePopup-DWAvpRIf.js",
        "/assets/BetaPhasePopup-DeNNw5CG.js",
        "/assets/JoinPage-abc123.js",
        "/assets/AdminPortal-xyz.js",
        "/assets/KidsCorner-1.js",
      ]),
    ).toEqual(["/assets/api-Bm9RvMqV.js"]);
  });

  it("only clears the tab session on a real 401 from /auth/me", () => {
    expect(shouldClearSessionOnMeFailure(401)).toBe(true);
    expect(shouldClearSessionOnMeFailure(0)).toBe(false);
    expect(shouldClearSessionOnMeFailure(503)).toBe(false);
    expect(shouldClearSessionOnMeFailure(500)).toBe(false);
  });

  it("uses a short session-restore timeout in production and a longer one on localhost", async () => {
    expect(SESSION_RESTORE_TIMEOUT_MS).toBe(4_000);
    expect(SESSION_RESTORE_TIMEOUT_MS).toBeLessThan(45_000);
    expect(AUTH_READY_SAFETY_MS).toBe(SESSION_RESTORE_TIMEOUT_MS + 500);
    const { LOCAL_SESSION_RESTORE_TIMEOUT_MS, sessionRestoreTimeoutMs, authReadySafetyMs } =
      await import("../first-load");
    expect(LOCAL_SESSION_RESTORE_TIMEOUT_MS).toBe(25_000);
    expect(sessionRestoreTimeoutMs(false)).toBe(4_000);
    expect(sessionRestoreTimeoutMs(true)).toBe(25_000);
    expect(authReadySafetyMs(true)).toBeGreaterThan(authReadySafetyMs(false));
  });

  it("reloads once per missing asset key, then stops for that same key", () => {
    const storage = memoryStorage();
    expect(isStaleBundledAssetUrl("https://getyoursidehustle.com/assets/index-abc.js")).toBe(true);
    expect(isStaleBundledAssetUrl("https://getyoursidehustle.com/brand/gysh-home-hero.webp")).toBe(
      false,
    );
    expect(isStaleChunkFailureMessage("Failed to fetch dynamically imported module: /assets/JoinPage-x.js")).toBe(
      true,
    );
    expect(staleAssetReloadKey("/assets/index-abc.js")).toBe("index-abc.js");
    expect(shouldReloadForStaleChunk(storage, "index-abc.js")).toBe(true);
    expect(storage.store.get(STALE_CHUNK_RELOAD_KEY)).toBe("index-abc.js");
    expect(shouldReloadForStaleChunk(storage, "index-abc.js")).toBe(false);
    expect(shouldReloadForStaleChunk(storage, "JoinPage-x.js")).toBe(true);
    clearStaleChunkReloadFlag(storage);
    expect(shouldReloadForStaleChunk(storage, "index-abc.js")).toBe(true);
  });

  it("renders a tap-to-refresh banner when auto-reload is exhausted", () => {
    const doc = document.implementation.createHTMLDocument("t");
    doc.body.innerHTML = "<div id='root'></div>";
    const el = showStaleShellRefreshBanner(doc);
    expect(el?.id).toBe(STALE_SHELL_BANNER_ID);
    expect(doc.getElementById(STALE_SHELL_BANNER_ID)).toBeTruthy();
    expect(staleShellRefreshBannerHtml()).toMatch(/Update available/i);
    expect(showStaleShellRefreshBanner(doc)?.id).toBe(STALE_SHELL_BANNER_ID);
  });

  it("lazy import recovery reloads once then shows the banner", async () => {
    const storage = memoryStorage();
    const reload = vi.fn();
    const showBanner = vi.fn();
    const fail = lazyImportWithStaleRecovery(
      () =>
        Promise.reject(new Error("Failed to fetch dynamically imported module: /assets/JoinPage-x.js")),
      storage,
      reload,
      showBanner,
    );
    await expect(fail()).rejects.toBeTruthy();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(showBanner).not.toHaveBeenCalled();

    const failAgain = lazyImportWithStaleRecovery(
      () =>
        Promise.reject(new Error("Failed to fetch dynamically imported module: /assets/JoinPage-x.js")),
      storage,
      reload,
      showBanner,
    );
    await expect(failAgain()).rejects.toThrow(/Failed to fetch dynamically imported module/);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(showBanner).toHaveBeenCalledTimes(1);
  });
});
