/**
 * Shareable Admin Studio deep links for opening a tab / focusing a test or task.
 * Example: /admin?tab=testing&test=AUTH-001
 * GYSH Marketing/Launch Plan: /admin?tab=factory&panel=launch-plan
 * Financials Money model: /admin?tab=financials&sub=money-model
 */

import { ADMIN_TABS, type AdminTab } from "./admin-nav";
import { siteUrl } from "./site-config";

const TAB_IDS = new Set<string>(ADMIN_TABS.map((t) => t.id));

/** Content Factory (and similar) nested panels. */
export type AdminPanelId = "launch-plan" | "workshops";

/** Financials nested sub-tabs. */
export type FinancialsSubId = "budget" | "expenses" | "money-model" | "contract";

const PANEL_ALIASES: Record<string, AdminPanelId> = {
  "launch-plan": "launch-plan",
  launch_plan: "launch-plan",
  soft_launch: "launch-plan",
  "soft-launch": "launch-plan",
  marketing: "launch-plan",
  /** Legacy drafts deep links → Marketing/Launch Plan */
  drafts: "launch-plan",
  workshops: "workshops",
};

const FINANCIALS_SUB_ALIASES: Record<string, FinancialsSubId> = {
  budget: "budget",
  expenses: "expenses",
  expense: "expenses",
  "money-model": "money-model",
  money_model: "money-model",
  moneymodel: "money-model",
  money: "money-model",
  contract: "contract",
  contracts: "contract",
};

export function isAdminTabId(value: string | null | undefined): value is AdminTab {
  return !!value && TAB_IDS.has(value);
}

export function isAdminPanelId(value: string | null | undefined): value is AdminPanelId {
  return !!value && Object.prototype.hasOwnProperty.call(PANEL_ALIASES, value);
}

export function normalizeAdminPanel(value: string | null | undefined): AdminPanelId | undefined {
  if (!value) return undefined;
  return PANEL_ALIASES[value.trim()] ?? undefined;
}

export function isFinancialsSubId(value: string | null | undefined): value is FinancialsSubId {
  return !!value && Object.prototype.hasOwnProperty.call(FINANCIALS_SUB_ALIASES, value);
}

export function normalizeFinancialsSub(value: string | null | undefined): FinancialsSubId | undefined {
  if (!value) return undefined;
  return FINANCIALS_SUB_ALIASES[value.trim().toLowerCase()] ?? undefined;
}

export type AdminDeepLink = {
  tab?: AdminTab;
  testId?: string;
  taskId?: string;
  /** Nested panel within a tab (e.g. Content Factory → launch-plan). */
  panel?: AdminPanelId;
  /** Nested Financials sub-tab (budget | expenses | money-model | contract). */
  sub?: FinancialsSubId;
};

export function readAdminDeepLink(
  search: string = typeof window !== "undefined" ? window.location.search : "",
): AdminDeepLink {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const tabRaw = (params.get("tab") || "").trim();
  const testId = (params.get("test") || "").trim();
  const taskId = (params.get("task") || "").trim();
  const panel = normalizeAdminPanel(params.get("panel"));
  const sub = normalizeFinancialsSub(params.get("sub"));
  const out: AdminDeepLink = {};
  if (isAdminTabId(tabRaw)) out.tab = tabRaw;
  if (testId) out.testId = testId;
  if (taskId) out.taskId = taskId;
  if (panel) out.panel = panel;
  if (sub) out.sub = sub;
  // Infer tab from focus id when tab omitted.
  if (!out.tab && out.testId) out.tab = "testing";
  if (!out.tab && out.taskId) out.tab = "tasks";
  if (!out.tab && out.panel) out.tab = "factory";
  if (!out.tab && out.sub) out.tab = "financials";
  return out;
}

/** Absolute URL to Admin Studio with optional tab / focus. */
export function adminStudioUrl(opts: {
  tab?: AdminTab;
  testId?: string;
  taskId?: string;
  panel?: AdminPanelId | string;
  sub?: FinancialsSubId | string;
  origin?: string;
}): string {
  const origin = (opts.origin ?? siteUrl()).replace(/\/$/, "");
  const params = new URLSearchParams();
  const panel = normalizeAdminPanel(opts.panel);
  const sub = normalizeFinancialsSub(opts.sub);
  if (opts.tab) params.set("tab", opts.tab);
  if (opts.testId) params.set("test", opts.testId);
  if (opts.taskId) params.set("task", opts.taskId);
  if (panel) params.set("panel", panel);
  if (sub) params.set("sub", sub);
  if (!opts.tab && opts.testId) params.set("tab", "testing");
  if (!opts.tab && opts.taskId) params.set("tab", "tasks");
  if (!opts.tab && panel) params.set("tab", "factory");
  if (!opts.tab && sub) params.set("tab", "financials");
  const qs = params.toString();
  return qs ? `${origin}/admin?${qs}` : `${origin}/admin`;
}

/** Canonical share link for GYSH Marketing/Launch Plan. */
export function marketingLaunchPlanUrl(origin?: string): string {
  return adminStudioUrl({ tab: "factory", panel: "launch-plan", origin });
}

/** Canonical share link for partnership Money model (Financials). */
export function financialsMoneyModelUrl(origin?: string): string {
  return adminStudioUrl({ tab: "financials", sub: "money-model", origin });
}

/** Open Admin Studio focus target in a new browser tab/window. */
export function openAdminStudioInNewWindow(opts: {
  tab?: AdminTab;
  testId?: string;
  taskId?: string;
  panel?: AdminPanelId | string;
  sub?: FinancialsSubId | string;
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
