/**
 * GYSH public + admin site map — Tree + Diagram views.
 *
 * Admin groups/tabs and User Guides are built from `admin-nav.ts`.
 * Guides menu from `marketing-guides.ts`.
 * Kids / Teens / Seniors tabs from `audience-nav.ts`.
 * Keep those modules as the source of truth so the diagram stays current.
 */
import {
  ADMIN_MENU_GROUPS,
  ADMIN_TABS,
  ADMIN_USER_GUIDE_LINKS,
  adminGuideSiteMapId,
  adminTabById,
  adminTabSiteMapId,
  type AdminTab,
  type UserGuideId,
} from "./admin-nav";
import { CONTENT_FACTORY_MENU_CHILDREN } from "./content-factory-sections";
import {
  JUNIOR_CORNER_TABS,
  KIDS_CORNER_TABS,
  SENIOR_CORNER_TABS,
} from "./audience-nav";
import { MARKETING_GUIDE_MENU } from "./marketing-guides";

export type SiteMapNode = {
  id: string;
  label: string;
  blurb?: string;
  /** menu = top-level nav; submenu = nested under a menu; page = leaf destination */
  kind?: "menu" | "submenu" | "page" | "section";
  children?: SiteMapNode[];
};

function buildGuidesMenuChildren(): SiteMapNode[] {
  const manuals = MARKETING_GUIDE_MENU.map((g) => ({
    id: g.id === "master" ? "guides-complete" : `guides-${g.id}`,
    label: g.label,
    kind: "submenu" as const,
  }));
  return [{ id: "guides-library", label: "Guides Library", kind: "submenu" }, ...manuals];
}

function buildAdminMap(): SiteMapNode {
  return {
    id: "admin",
    label: "Admin Studio",
    kind: "section",
    blurb: "Partner / admin tools",
    children: ADMIN_MENU_GROUPS.map((group) => ({
      id: `adm-${group.id}`,
      label: group.label,
      kind: "menu" as const,
      children: group.tabs.map((tabId) => {
        const tab = adminTabById(tabId);
        const node: SiteMapNode = {
          id: adminTabSiteMapId(tabId),
          label: tab?.label ?? tabId,
          kind: "submenu",
          ...(tab?.adminOnly ? { blurb: "Admin only" } : {}),
        };
        if (tabId === "user-guides") {
          node.children = ADMIN_USER_GUIDE_LINKS.map((g) => ({
            id: adminGuideSiteMapId(g.id),
            label: g.label,
            kind: "page" as const,
          }));
        }
        if (tabId === "factory") {
          node.children = CONTENT_FACTORY_MENU_CHILDREN.map((section) => ({
            id: section.siteMapId ?? `adm-factory-${section.id}`,
            label: section.label,
            kind: "page" as const,
          }));
        }
        return node;
      }),
    })),
  };
}

function buildPublicMap(): SiteMapNode {
  return {
    id: "home",
    label: "Home",
    kind: "page",
    blurb: "Family start · hustle catalog · Match Wizard night",
    children: [
      {
        id: "nav-match",
        label: "Match Wizards",
        kind: "menu",
        children: [
          { id: "nav-adults", label: "Adults", kind: "submenu" },
          {
            id: "nav-seniors",
            label: "Seniors",
            kind: "submenu",
            blurb: "GYSH Seniors Corner",
            children: SENIOR_CORNER_TABS.map((t) => ({
              id: t.siteMapId,
              label: t.label,
              kind: "page" as const,
            })),
          },
          {
            id: "nav-kids",
            label: "Kids & Teens",
            kind: "submenu",
            blurb: "GYSH Kids & Teens Corner",
            children: [
              {
                id: "kids-mode",
                label: "Kids (Ages 4–12)",
                kind: "page",
                children: KIDS_CORNER_TABS.map((t) => ({
                  id: t.siteMapId,
                  label: t.label,
                  kind: "page" as const,
                  ...(t.blurb ? { blurb: t.blurb } : {}),
                })),
              },
              {
                id: "teens-mode",
                label: "Teens (Ages 13–17)",
                kind: "page",
                children: JUNIOR_CORNER_TABS.map((t) => ({
                  id: t.siteMapId,
                  label: t.label,
                  kind: "page" as const,
                  ...(t.blurb ? { blurb: t.blurb } : {}),
                })),
              },
            ],
          },
        ],
      },
      {
        id: "nav-guides",
        label: "Side Hustle Guides",
        kind: "menu",
        children: buildGuidesMenuChildren(),
      },
      { id: "nav-workshops", label: "Workshops", kind: "menu" },
      {
        id: "nav-community",
        label: "Community",
        kind: "menu",
        children: [
          { id: "nav-community-blog", label: "Blog", kind: "submenu" },
          { id: "nav-newsletter", label: "Newsletter", kind: "submenu", blurb: "Members only · Weekly Friday issue" },
          { id: "nav-community-gear", label: "GEAR", kind: "submenu", blurb: "GYSH merch shop" },
        ],
      },
      { id: "nav-memberships", label: "Memberships", kind: "menu", blurb: "Free → Elite plans" },
      { id: "nav-gear", label: "Gear", kind: "menu", blurb: "GYSH merch shop" },
      {
        id: "nav-join",
        label: "Join Free",
        kind: "menu",
        blurb: "Free account signup",
        children: [
          { id: "join-plans", label: "Membership plans", kind: "submenu" },
          { id: "join-signup", label: "Membership Sign-up", kind: "submenu" },
          { id: "join-signin", label: "Log in", kind: "submenu" },
        ],
      },
      { id: "nav-about", label: "About Us", kind: "menu" },
      { id: "nav-contact", label: "Contact Us", kind: "menu" },
      {
        id: "nav-meta",
        label: "Account & policies",
        kind: "menu",
        blurb: "Member links and policies",
        children: [
          { id: "nav-dashboard", label: "My Dashboard", kind: "submenu", blurb: "Logged-in members" },
          { id: "nav-privacy", label: "Privacy Policy", kind: "submenu" },
          { id: "nav-beta-nda", label: "Beta Tester NDA", kind: "submenu" },
          { id: "nav-beta-credits", label: "Beta Tester Credit Guide", kind: "submenu" },
          { id: "nav-beta-points", label: "Beta Tester Points", kind: "submenu" },
          { id: "nav-beta-testing", label: "Beta Tester Dashboard", kind: "submenu" },
          { id: "nav-login", label: "Login / Portal", kind: "submenu" },
        ],
      },
    ],
  };
}

/** Public site: Home at the root, then header menus and their submenus. */
export const GYSH_PUBLIC_MAP: SiteMapNode = buildPublicMap();

/** Admin Studio menus grouped like the admin nav (derived from admin-nav). */
export const GYSH_ADMIN_MAP: SiteMapNode = buildAdminMap();

/** Full site root used by Tree view (Home + Admin). */
export const GYSH_SITE_MAP: SiteMapNode = {
  id: "root",
  label: "Get Your Side Hustle (GYSH)",
  kind: "section",
  blurb: "Ideas · Action · Income · Freedom",
  children: [GYSH_PUBLIC_MAP, GYSH_ADMIN_MAP],
};

/** Click targets for Tree + Diagram links (resolved in App). */
export type SiteMapHref =
  | { kind: "home" }
  | { kind: "quiz" }
  | { kind: "quiz-adult" }
  | {
      kind: "kids";
      mode: "kids" | "junior";
      tab?: "stories" | "wizard" | "jobs" | "piggy" | "guides" | "join";
    }
  | { kind: "seniors"; tab?: "match" | "opportunities" | "guides" | "join" }
  | { kind: "guides"; manual?: "adult" | "kids" | "teens" | "seniors" | "master"; age?: "kids" | "junior" | "adult" | "senior" }
  | { kind: "workshops" }
  | { kind: "community" }
  | { kind: "newsletter" }
  | { kind: "shop" }
  | { kind: "join" }
  | { kind: "join-signup" }
  | { kind: "login" }
  | { kind: "user_portal" }
  | { kind: "about" }
  | { kind: "contact" }
  | { kind: "privacy" }
  | { kind: "beta_nda" }
  | { kind: "beta_testing" }
  | { kind: "beta_credits" }
  | { kind: "beta_points" }
  | {
      kind: "admin";
      tab: AdminTab;
      guide?: UserGuideId;
      panel?: "launch-plan" | "posting" | "creatives";
    };

function buildAdminHrefEntries(): Record<string, SiteMapHref> {
  const out: Record<string, SiteMapHref> = {
    admin: { kind: "admin", tab: "schedule" },
  };
  for (const group of ADMIN_MENU_GROUPS) {
    const first = group.tabs[0] ?? "schedule";
    out[`adm-${group.id}`] = { kind: "admin", tab: first };
    for (const tab of group.tabs) {
      out[adminTabSiteMapId(tab)] = { kind: "admin", tab };
    }
  }
  for (const g of ADMIN_USER_GUIDE_LINKS) {
    out[adminGuideSiteMapId(g.id)] = {
      kind: "admin",
      tab: "user-guides",
      guide: g.id,
    };
  }
  for (const section of CONTENT_FACTORY_MENU_CHILDREN) {
    const id = section.siteMapId ?? `adm-factory-${section.id}`;
    out[id] = {
      kind: "admin",
      tab: section.tab,
      ...(section.panel ? { panel: section.panel } : {}),
    };
  }
  return out;
}

const SITE_MAP_HREFS: Record<string, SiteMapHref> = {
  home: { kind: "home" },
  "nav-match": { kind: "quiz" },
  "nav-adults": { kind: "quiz-adult" },
  "match-kids": { kind: "kids", mode: "kids", tab: "wizard" },
  "match-teens": { kind: "kids", mode: "junior", tab: "wizard" },
  "match-adult": { kind: "quiz-adult" },
  "match-senior": { kind: "seniors", tab: "match" },
  "nav-kids": { kind: "kids", mode: "kids", tab: "wizard" },
  "kids-mode": { kind: "kids", mode: "kids", tab: "wizard" },
  ...Object.fromEntries(
    KIDS_CORNER_TABS.map((t) => [
      t.siteMapId,
      { kind: "kids" as const, mode: "kids" as const, tab: t.id },
    ]),
  ),
  "teens-mode": { kind: "kids", mode: "junior", tab: "wizard" },
  ...Object.fromEntries(
    JUNIOR_CORNER_TABS.map((t) => [
      t.siteMapId,
      { kind: "kids" as const, mode: "junior" as const, tab: t.id },
    ]),
  ),
  "nav-seniors": { kind: "seniors", tab: "match" },
  ...Object.fromEntries(
    SENIOR_CORNER_TABS.map((t) => [t.siteMapId, { kind: "seniors" as const, tab: t.id }]),
  ),
  "nav-community": { kind: "community" },
  "nav-community-blog": { kind: "community" },
  "nav-guides": { kind: "guides" },
  "guides-library": { kind: "guides" },
  "kids-guides": { kind: "guides", age: "kids" },
  "teens-guides": { kind: "guides", age: "junior" },
  "sen-guides": { kind: "guides", age: "senior" },
  ...Object.fromEntries(
    MARKETING_GUIDE_MENU.map((g) => [
      g.id === "master" ? "guides-complete" : `guides-${g.id}`,
      { kind: "guides" as const, manual: g.id },
    ]),
  ),
  "nav-workshops": { kind: "workshops" },
  "nav-newsletter": { kind: "newsletter" },
  "nav-community-gear": { kind: "shop" },
  "nav-gear": { kind: "shop" },
  "nav-memberships": { kind: "join" },
  "nav-join": { kind: "join" },
  "join-plans": { kind: "join" },
  "join-signup": { kind: "join-signup" },
  "join-signin": { kind: "login" },
  "nav-meta": { kind: "about" },
  "nav-about": { kind: "about" },
  "nav-contact": { kind: "contact" },
  "nav-privacy": { kind: "privacy" },
  "nav-beta-nda": { kind: "beta_nda" },
  "nav-beta-testing": { kind: "beta_testing" },
  "nav-beta-credits": { kind: "beta_credits" },
  "nav-beta-points": { kind: "beta_points" },
  "nav-login": { kind: "login" },
  "nav-dashboard": { kind: "user_portal" },
  ...buildAdminHrefEntries(),
};

export function hrefForSiteMapNode(id: string): SiteMapHref | null {
  return SITE_MAP_HREFS[id] ?? null;
}

/** Flatten every node id under a tree (for tests / diagnostics). */
export function collectSiteMapIds(node: SiteMapNode): string[] {
  const ids = [node.id];
  for (const child of node.children ?? []) {
    ids.push(...collectSiteMapIds(child));
  }
  return ids;
}

/** All admin tab ids that appear in menu groups (must match ADMIN_TABS coverage). */
export function adminTabsInMenuGroups(): AdminTab[] {
  const grouped = ADMIN_MENU_GROUPS.flatMap((g) => g.tabs);
  const nested = CONTENT_FACTORY_MENU_CHILDREN.map((section) => section.tab).filter(
    (tab) => !grouped.includes(tab),
  );
  return [...grouped, ...nested];
}

export { ADMIN_TABS, ADMIN_MENU_GROUPS, ADMIN_USER_GUIDE_LINKS };
