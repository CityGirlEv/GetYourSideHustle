import type { AppRouteView } from "./app-routes";

/** Community top-nav children. First item is the Community page, labeled Blog. Guides is a primary nav item. */
export const COMMUNITY_NAV_CHILDREN = [
  { id: "blog", label: "Blog", view: "community" as const, testId: "nav-community-blog" },
  { id: "workshops", label: "Workshops", view: "workshops" as const, testId: "nav-workshops" },
  { id: "newsletter", label: "Newsletter", view: "newsletter" as const, testId: "nav-newsletter" },
  { id: "gear", label: "GEAR", view: "shop" as const, testId: "nav-community-gear" },
] as const;

export function isCommunityNavView(view: AppRouteView): boolean {
  return COMMUNITY_NAV_CHILDREN.some((child) => child.view === view);
}
