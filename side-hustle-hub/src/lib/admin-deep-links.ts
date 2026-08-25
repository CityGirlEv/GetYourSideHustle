/**
 * Shareable Admin Studio deep links for opening a tab / focusing a test, task, or Content Factory item.
 * Example: /admin?tab=testing&test=AUTH-001
 * GYSH Marketing/Launch Plan: /admin?tab=factory&panel=launch-plan&item=sl-s3-yt-first-short
 * Financials Money model: /admin?tab=financials&sub=money-model
 */

import { ADMIN_TABS, type AdminTab } from "./admin-nav";
import { siteUrl } from "./site-config";

const TAB_IDS = new Set<string>(ADMIN_TABS.map((t) => t.id));

/** Content Factory (and similar) nested panels. */
export type AdminPanelId = "launch-plan" | "workshops";

/** Financials nested sub-tabs. */
export type FinancialsSubId = "budget" | "expenses" | "money-model" | "payments" | "contract";

/** Fired after SPA navigation to an Admin deep link so AdminPortal can re-apply focus. */
export const ADMIN_DEEPLINK_EVENT = "gysh:admin-deeplink";

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
  payments: "payments",
  payment: "payments",
  stripe: "payments",
  revenue: "payments",
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
  /** Content Factory calendar item id (e.g. sl-s3-yt-first-short). */
  itemId?: string;
  /** Nested panel within a tab (e.g. Content Factory → launch-plan). */
  panel?: AdminPanelId;
  /** Nested Financials sub-tab (budget | expenses | money-model | payments | contract). */
  sub?: FinancialsSubId;
  /** Email Templates catalog slug (e.g. registration_confirmation). */
  template?: string;
};

export type AdminDeepLinkOpts = {
  tab?: AdminTab;
  testId?: string;
  taskId?: string;
  itemId?: string;
  panel?: AdminPanelId | string;
  sub?: FinancialsSubId | string;
  /** Email Templates catalog slug. */
  template?: string;
  origin?: string;
};

export function readAdminDeepLink(
  search: string = typeof window !== "undefined" ? window.location.search : "",
): AdminDeepLink {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const tabRaw = (params.get("tab") || "").trim();
  const testId = (params.get("test") || "").trim();
  const taskId = (params.get("task") || "").trim();
  const itemId = (params.get("item") || "").trim();
  const template = (params.get("template") || "").trim();
  const panel = normalizeAdminPanel(params.get("panel"));
  const sub = normalizeFinancialsSub(params.get("sub"));
  const out: AdminDeepLink = {};
  if (isAdminTabId(tabRaw)) out.tab = tabRaw;
  if (testId) out.testId = testId;
  if (taskId) out.taskId = taskId;
  if (itemId) out.itemId = itemId;
  if (template) out.template = template;
  if (panel) out.panel = panel;
  if (sub) out.sub = sub;
  // Infer tab from focus id when tab omitted.
  if (!out.tab && out.testId) out.tab = "testing";
  if (!out.tab && out.taskId) out.tab = "tasks";
  if (!out.tab && out.itemId) {
    out.tab = "factory";
    if (!out.panel) out.panel = "launch-plan";
  }
  if (!out.tab && out.panel) out.tab = "factory";
  if (!out.tab && out.sub) out.tab = "financials";
  if (!out.tab && out.template) out.tab = "email";
  return out;
}

/** Absolute URL to Admin Studio with optional tab / focus. */
export function adminStudioUrl(opts: AdminDeepLinkOpts): string {
  const origin = (opts.origin ?? siteUrl()).replace(/\/$/, "");
  const params = new URLSearchParams();
  const panel = normalizeAdminPanel(opts.panel);
  const sub = normalizeFinancialsSub(opts.sub);
  // Stable order: tab → panel/sub → focus ids (shareable markdown links stay consistent).
  if (opts.tab) params.set("tab", opts.tab);
  else if (opts.testId) params.set("tab", "testing");
  else if (opts.taskId) params.set("tab", "tasks");
  else if (opts.itemId || panel) params.set("tab", "factory");
  else if (sub) params.set("tab", "financials");
  else if (opts.template) params.set("tab", "email");
  const effectivePanel = panel ?? (opts.itemId ? ("launch-plan" as const) : undefined);
  if (effectivePanel) params.set("panel", effectivePanel);
  if (sub) params.set("sub", sub);
  if (opts.testId) params.set("test", opts.testId);
  if (opts.taskId) params.set("task", opts.taskId);
  if (opts.itemId) params.set("item", opts.itemId);
  if (opts.template) params.set("template", opts.template);
  const qs = params.toString();
  return qs ? `${origin}/admin?${qs}` : `${origin}/admin`;
}

/** Relative Admin Studio path (same-tab SPA navigation). */
export function adminStudioPath(opts: AdminDeepLinkOpts): string {
  const abs = adminStudioUrl({ ...opts, origin: "https://local.invalid" });
  return abs.replace("https://local.invalid", "");
}

/** Markdown `[label](/admin?…)` for notes, steps, and Content Factory copy. */
export function adminMarkdownLink(label: string, opts: AdminDeepLinkOpts): string {
  return `[${label}](${adminStudioPath(opts)})`;
}

/** Canonical share link for GYSH Marketing/Launch Plan. */
export function marketingLaunchPlanUrl(origin?: string): string {
  return adminStudioUrl({ tab: "factory", panel: "launch-plan", origin });
}

/** Deep link to a Content Factory calendar item. */
export function contentFactoryItemUrl(itemId: string, origin?: string): string {
  return adminStudioUrl({
    tab: "factory",
    panel: "launch-plan",
    itemId,
    origin,
  });
}

/** Canonical share link for partnership Money model (Financials). */
export function financialsMoneyModelUrl(origin?: string): string {
  return adminStudioUrl({ tab: "financials", sub: "money-model", origin });
}

/** Deep link path to Admin → Email Templates (optional catalog slug). */
export function emailTemplateAdminPath(templateSlug?: string): string {
  return adminStudioPath({
    tab: "email",
    ...(templateSlug ? { template: templateSlug } : {}),
  });
}

/** Build a deep-link payload from navigate opts (does not depend on URL timing). */
export function adminDeepLinkFromOpts(opts: AdminDeepLinkOpts): AdminDeepLink {
  return readAdminDeepLink(adminStudioPath(opts).replace(/^[^?]*/, "") || "?");
}

/**
 * Same-tab SPA navigate to an Admin deep link, then notify AdminPortal to focus.
 * Prefer this over target=_blank so sessionStorage auth survives.
 *
 * Focus targets are passed on the custom event detail so listeners are not racing
 * clearAdminFocusFromUrl() (which strips ?task/?test/?item from the address bar).
 */
export function navigateAdminDeepLink(opts: AdminDeepLinkOpts): void {
  if (typeof window === "undefined") return;
  const next = adminStudioPath(opts);
  const detail = adminDeepLinkFromOpts(opts);
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (current !== next) {
    window.history.pushState({ view: "admin", adminDeepLink: true }, "", next);
  } else {
    // Same URL (e.g. re-click same task) — still force focus via event detail.
    window.history.replaceState(
      { ...(window.history.state as object), view: "admin", adminDeepLink: true },
      "",
      next,
    );
  }
  // App routing (tab / view) — do not rely on this for focus ids.
  window.dispatchEvent(new PopStateEvent("popstate"));
  // AdminPortal focus — detail keeps task/test/item even if URL focus params are cleared.
  window.dispatchEvent(new CustomEvent(ADMIN_DEEPLINK_EVENT, { detail }));
}

/** Open Admin Studio focus target in a new browser tab/window. */
export function openAdminStudioInNewWindow(opts: AdminDeepLinkOpts): void {
  if (typeof window === "undefined") return;
  window.open(adminStudioUrl(opts), "_blank", "noopener,noreferrer");
}

/** Drop focus params after they've been applied (keeps tab/panel/sub). */
export function clearAdminFocusFromUrl(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("test") && !url.searchParams.has("task") && !url.searchParams.has("item")) {
    return;
  }
  url.searchParams.delete("test");
  url.searchParams.delete("task");
  url.searchParams.delete("item");
  const qs = url.searchParams.toString();
  const next = `${url.pathname}${qs ? `?${qs}` : ""}${url.hash}`;
  window.history.replaceState(window.history.state, "", next);
}
