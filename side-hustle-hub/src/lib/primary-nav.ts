import type { AppRouteView } from "./app-routes";

/** Match Wizards top-nav children. Workshops is its own main-menu item. */
export const MATCH_WIZARDS_NAV_LABEL = "Match Wizards";

export const MATCH_WIZARD_NAV_CHILDREN = [
  { id: "adults", label: "Adults", testId: "nav-adults" },
  { id: "seniors", label: "Seniors", testId: "nav-seniors" },
  { id: "kids", label: "Kids & Teens", testId: "nav-kids" },
] as const;

/** Community top-nav children. First item is the Community page, labeled Blog. */
export const COMMUNITY_NAV_CHILDREN = [
  { id: "blog", label: "Blog", view: "community" as const, testId: "nav-community-blog" },
  { id: "newsletter", label: "Newsletter", view: "newsletter" as const, testId: "nav-newsletter" },
  { id: "gear", label: "GEAR", view: "shop" as const, testId: "nav-community-gear" },
] as const;

export function isCommunityNavView(view: AppRouteView): boolean {
  return (
    COMMUNITY_NAV_CHILDREN.some((child) => child.view === view) ||
    view === "welcome_vol1" ||
    view === "welcome_vol1_answer"
  );
}
