/**
 * First-paint helpers — keep the public HTML from waiting on fonts, lazy routes,
 * or a hung /auth/me. Also recover from mid-deploy stale hashed assets.
 */

/** Session restore must not use the 45s API default — that feels like a stalled page. */
export const SESSION_RESTORE_TIMEOUT_MS = 4_000;

/**
 * Localhost + remote D1 often needs 10–20s after Vite/wrangler remounts.
 * A short timeout made Dev look logged out even when the bearer was still valid.
 */
export const LOCAL_SESSION_RESTORE_TIMEOUT_MS = 25_000;

/** Hard cap so authReady always flips even if AbortController misbehaves on mobile. */
export const AUTH_READY_SAFETY_MS = SESSION_RESTORE_TIMEOUT_MS + 500;

/** Local Dev safety: cover one cold restore + one retry without freezing forever. */
export const LOCAL_AUTH_READY_SAFETY_MS = LOCAL_SESSION_RESTORE_TIMEOUT_MS * 2 + 2_000;

export function sessionRestoreTimeoutMs(localDev: boolean): number {
  return localDev ? LOCAL_SESSION_RESTORE_TIMEOUT_MS : SESSION_RESTORE_TIMEOUT_MS;
}

export function authReadySafetyMs(localDev: boolean): number {
  return localDev ? LOCAL_AUTH_READY_SAFETY_MS : AUTH_READY_SAFETY_MS;
}

/** sessionStorage: last failed asset key that already triggered a reload. */
export const STALE_CHUNK_RELOAD_KEY = "gysh_stale_chunk_reload";

/** DOM id for the manual refresh prompt when auto-reload is exhausted. */
export const STALE_SHELL_BANNER_ID = "gysh-stale-shell-refresh";

/**
 * Vite puts every statically-discoverable dynamic import into index.html as
 * modulepreload. Lazy popups/pages then compete with the home JS on first paint.
 */
const LAZY_HTML_PRELOAD_RE =
  /(?:Popup|Portal|Page|Wizard|Hub|Manual|Quiz|Section|Guides|Kids|Join|Contact|About|Newsletter|Community|Checklist|Consent|Corner|Selector|Report)-[\w-]+\.js$/i;

export function htmlModulePreloadDeps(deps: string[]): string[] {
  return deps.filter((dep) => {
    const file = dep.split(/[/\\]/).pop() || dep;
    return !LAZY_HTML_PRELOAD_RE.test(file);
  });
}

/** Only a real 401 means the tab session is gone. Timeouts / D1 blips must not log the user out. */
export function shouldClearSessionOnMeFailure(status: number): boolean {
  return status === 401;
}

export function isStaleBundledAssetUrl(url: string): boolean {
  const path = url.split("?")[0]?.split("#")[0] ?? "";
  return /\/assets\/[^/]+\.(js|css)$/i.test(path);
}

export function isStaleChunkFailureMessage(message: string): boolean {
  return /Failed to fetch dynamically imported module|Loading chunk [\w.-]+ failed|ChunkLoadError/i.test(
    message,
  );
}

/** Stable key for an asset URL so a *different* missing file can still auto-reload once. */
export function staleAssetReloadKey(urlOrMessage: string): string {
  const fromUrl = urlOrMessage.match(/\/assets\/([^/?#]+\.(?:js|css))/i);
  if (fromUrl?.[1]) return fromUrl[1].toLowerCase();
  const trimmed = String(urlOrMessage || "").trim().slice(0, 180);
  return trimmed || "unknown";
}

type FlagStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Entry JS loaded — allow a later deploy's missing lazy chunk to reload once. */
export function clearStaleChunkReloadFlag(storage: FlagStorage): void {
  storage.removeItem(STALE_CHUNK_RELOAD_KEY);
}

/**
 * First failure for this asset key → reload.
 * Same key again → do not reload (caller should show a refresh banner).
 * A *different* asset key may still reload once (mid-deploy race).
 */
export function shouldReloadForStaleChunk(storage: FlagStorage, assetKey = "1"): boolean {
  const key = String(assetKey || "1").trim() || "1";
  const prev = storage.getItem(STALE_CHUNK_RELOAD_KEY);
  if (prev === key) return false;
  storage.setItem(STALE_CHUNK_RELOAD_KEY, key);
  return true;
}

export function staleShellRefreshBannerHtml(): string {
  return [
    '<div class="gysh-stale-shell-refresh__inner" role="alert">',
    "<p><strong>Update available.</strong> This page is out of date — tap Refresh to load the latest version.</p>",
    '<button type="button" class="gysh-stale-shell-refresh__btn" data-gysh-stale-refresh>Refresh</button>',
    "</div>",
  ].join("");
}

/** Visible recovery when auto-reload already ran for this missing asset. */
export function showStaleShellRefreshBanner(doc: Document = document): HTMLElement | null {
  const existing = doc.getElementById(STALE_SHELL_BANNER_ID);
  if (existing) return existing as HTMLElement;
  const root = doc.body || doc.documentElement;
  if (!root) return null;
  const el = doc.createElement("div");
  el.id = STALE_SHELL_BANNER_ID;
  el.className = "gysh-stale-shell-refresh";
  el.setAttribute("data-testid", "stale-shell-refresh");
  el.innerHTML = staleShellRefreshBannerHtml();
  el.addEventListener("click", (event) => {
    const t = event.target as HTMLElement | null;
    if (t?.closest?.("[data-gysh-stale-refresh]")) {
      try {
        clearStaleChunkReloadFlag(doc.defaultView?.sessionStorage as FlagStorage);
      } catch {
        /* private mode */
      }
      doc.defaultView?.location.reload();
    }
  });
  root.insertBefore(el, root.firstChild);
  return el;
}

type ReloadHost = {
  sessionStorage: FlagStorage;
  location: { reload: () => void };
  document: Document;
  addEventListener: (type: string, listener: (event: Event) => void, capture?: boolean) => void;
};

/**
 * Recover from missing hashed /assets/* after a deploy.
 * One auto-reload per asset key; further failures show a tap-to-refresh banner.
 */
export function installStaleChunkAutoReload(win: ReloadHost): void {
  const handleFailure = (assetKey: string) => {
    if (shouldReloadForStaleChunk(win.sessionStorage, assetKey)) {
      win.location.reload();
      return;
    }
    showStaleShellRefreshBanner(win.document);
  };

  win.addEventListener(
    "error",
    (event) => {
      const t = event.target as { src?: string; href?: string } | null;
      const url = String(t?.src || t?.href || "");
      if (url && isStaleBundledAssetUrl(url)) {
        handleFailure(staleAssetReloadKey(url));
      }
    },
    true,
  );
  win.addEventListener("unhandledrejection", (event) => {
    const reason = (event as Event & { reason?: unknown }).reason;
    const msg = reason instanceof Error ? reason.message : String(reason ?? "");
    if (isStaleChunkFailureMessage(msg)) {
      handleFailure(staleAssetReloadKey(msg));
    }
  });
}

/**
 * Wrap a React.lazy factory so a missing chunk triggers reload/banner
 * instead of leaving Suspense on “Loading…” forever.
 */
export function lazyImportWithStaleRecovery<T>(
  factory: () => Promise<T>,
  storage: FlagStorage = typeof sessionStorage !== "undefined" ? sessionStorage : {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  },
  reload: () => void = () => {
    if (typeof location !== "undefined") location.reload();
  },
  showBanner: () => void = () => {
    if (typeof document !== "undefined") showStaleShellRefreshBanner(document);
  },
): () => Promise<T> {
  return () =>
    factory().catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      if (isStaleChunkFailureMessage(msg) || /Loading CSS chunk/i.test(msg)) {
        const key = staleAssetReloadKey(msg);
        if (shouldReloadForStaleChunk(storage, key)) {
          reload();
          return new Promise<T>(() => {
            /* wait for reload */
          });
        }
        showBanner();
      }
      throw err;
    });
}
