export const DEPLOY_BROADCAST_KEY = "deploy-logout:v1";
export const DEPLOY_ACK_KEY = "deploy-logout-ack:v1";
export const DEPLOY_RESUME_KEY = "deploy-resume:v1";
/** Fired by DeployVersionGate so pages with drafts can open their save UI. */
export const REQUEST_SAVE_BEFORE_DEPLOY_EVENT = "app:request-save-before-deploy";
export const LOGOUT_COUNTDOWN_SECONDS = 10;
export const VERSION_POLL_INTERVAL_MS = 60_000;

export type DeployResumeContext = {
  redirect: string;
  savedAt: number;
};

export type DeploySaveHandler = () => void | Promise<void>;

const deploySaveHandlers = new Set<DeploySaveHandler>();

/** Pages register how to persist in-progress work before a deploy logout. */
export function registerDeploySaveHandler(handler: DeploySaveHandler): () => void {
  deploySaveHandlers.add(handler);
  return () => {
    deploySaveHandlers.delete(handler);
  };
}

export async function runDeploySaveHandlers(): Promise<{ ran: number; failed: number }> {
  let ran = 0;
  let failed = 0;
  for (const handler of deploySaveHandlers) {
    try {
      await handler();
      ran += 1;
    } catch {
      failed += 1;
    }
  }
  return { ran, failed };
}

export function getCurrentAppPath(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function stashDeployResume(path?: string): string | null {
  if (typeof window === "undefined") return null;
  const redirect = sanitizeDeployResumePath(path ?? getCurrentAppPath());
  if (!redirect) return null;
  try {
    sessionStorage.setItem(
      DEPLOY_RESUME_KEY,
      JSON.stringify({ redirect, savedAt: Date.now() } satisfies DeployResumeContext),
    );
  } catch {
    /* ignore quota / private mode */
  }
  return redirect;
}

export function peekDeployResume(): DeployResumeContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DEPLOY_RESUME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DeployResumeContext;
    if (typeof parsed.redirect !== "string" || !parsed.redirect.startsWith("/")) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function consumeDeployResume(): string | null {
  const resume = peekDeployResume();
  if (!resume) return null;
  try {
    sessionStorage.removeItem(DEPLOY_RESUME_KEY);
  } catch {
    /* ignore */
  }
  return resume.redirect;
}

function sanitizeDeployResumePath(path: string): string | null {
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//")) return null;
  if (path.startsWith("/auth")) return null;
  if (path.startsWith("/register")) return null;
  if (path.startsWith("/reset-password")) return null;
  return path;
}

export type VersionManifest = {
  buildId?: unknown;
  live?: unknown;
  deployedAt?: unknown;
  builtAt?: unknown;
};

export function getLoadedBuildId(): string {
  return import.meta.env.VITE_APP_BUILD_ID ?? "unknown";
}

/** Skip polling in dev and for non-production bundle ids. */
export function isDeployGateActive(): boolean {
  if (import.meta.env.DEV) return false;
  const loadedId = getLoadedBuildId();
  return loadedId !== "unknown" && loadedId !== "dev";
}

/** True when a remote build id differs from the one this tab loaded with. */
export function isNewDeploy(loadedId: string, remoteId: string | null | undefined): boolean {
  if (!loadedId || !remoteId) return false;
  if (loadedId === "unknown" || remoteId === "unknown") return false;
  if (loadedId === "dev" || remoteId === "dev") return false;
  return loadedId !== remoteId;
}

export function isAuthRoute(pathname: string): boolean {
  return pathname === "/auth" || pathname === "/register" || pathname === "/reset-password";
}

/** Only successful production deploys stamp version.json with live: true. */
export function parseVersionManifest(data: unknown): { buildId: string } | null {
  if (!data || typeof data !== "object") return null;
  const manifest = data as VersionManifest;
  if (manifest.live !== true) return null;
  if (typeof manifest.buildId !== "string") return null;
  if (!manifest.buildId || manifest.buildId === "unknown" || manifest.buildId === "dev") {
    return null;
  }
  return { buildId: manifest.buildId };
}

export async function fetchRemoteBuildId(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(`/version.json?_=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    return parseVersionManifest(data)?.buildId ?? null;
  } catch {
    return null;
  }
}

export function markDeployHandled(remoteBuildId: string): void {
  try {
    localStorage.setItem(DEPLOY_ACK_KEY, remoteBuildId);
    localStorage.setItem(
      DEPLOY_BROADCAST_KEY,
      JSON.stringify({ buildId: remoteBuildId, at: Date.now() }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

export function wasDeployAlreadyHandled(remoteBuildId: string): boolean {
  try {
    return localStorage.getItem(DEPLOY_ACK_KEY) === remoteBuildId;
  } catch {
    return false;
  }
}

export function parseDeployBroadcast(raw: string | null): { buildId: string; at: number } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { buildId?: unknown; at?: unknown };
    if (typeof parsed.buildId !== "string") return null;
    return {
      buildId: parsed.buildId,
      at: typeof parsed.at === "number" ? parsed.at : 0,
    };
  } catch {
    return null;
  }
}
