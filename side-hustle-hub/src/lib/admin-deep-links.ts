/**
 * Shareable Admin Studio deep links for opening a tab / focusing a test or task.
 * Example: /admin?tab=testing&test=AUTH-001
 */

import { ADMIN_TABS, type AdminTab } from "./admin-nav";
import { siteUrl } from "./site-config";

const TAB_IDS = new Set<string>(ADMIN_TABS.map((t) => t.id));

export function isAdminTabId(value: string | null | undefined): value is AdminTab {
  return !!value && TAB_IDS.has(value);
}

export type AdminDeepLink = {
  tab?: AdminTab;
  testId?: string;
  taskId?: string;
};

export function readAdminDeepLink(
  search: string = typeof window !== "undefined" ? window.location.search : "",
): AdminDeepLink {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const tabRaw = (params.get("tab") || "").trim();
  const testId = (params.get("test") || "").trim();
  const taskId = (params.get("task") || "").trim();
  const out: AdminDeepLink = {};
  if (isAdminTabId(tabRaw)) out.tab = tabRaw;
  if (testId) out.testId = testId;
  if (taskId) out.taskId = taskId;
  // Infer tab from focus id when tab omitted.
  if (!out.tab && out.testId) out.tab = "testing";
  if (!out.tab && out.taskId) out.tab = "tasks";
  return out;
}

/** Absolute URL to Admin Studio with optional tab / focus. */
export function adminStudioUrl(opts: {
  tab?: AdminTab;
  testId?: string;
  taskId?: string;
  origin?: string;
}): string {
  const origin = (opts.origin ?? siteUrl()).replace(/\/$/, "");
  const params = new URLSearchParams();
  if (opts.tab) params.set("tab", opts.tab);
  if (opts.testId) params.set("test", opts.testId);
  if (opts.taskId) params.set("task", opts.taskId);
  if (!opts.tab && opts.testId) params.set("tab", "testing");
  if (!opts.tab && opts.taskId) params.set("tab", "tasks");
  const qs = params.toString();
  return qs ? `${origin}/admin?${qs}` : `${origin}/admin`;
}

/** Open Admin Studio focus target in a new browser tab/window. */
export function openAdminStudioInNewWindow(opts: {
  tab?: AdminTab;
  testId?: string;
  taskId?: string;
}): void {
  if (typeof window === "undefined") return;
  window.open(adminStudioUrl(opts), "_blank", "noopener,noreferrer");
}

/** Drop test/task focus params after they've been applied (keeps tab). */
export function clearAdminFocusFromUrl(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("test") && !url.searchParams.has("task")) return;
  url.searchParams.delete("test");
  url.searchParams.delete("task");
  const qs = url.searchParams.toString();
  const next = `${url.pathname}${qs ? `?${qs}` : ""}${url.hash}`;
  window.history.replaceState(window.history.state, "", next);
}
