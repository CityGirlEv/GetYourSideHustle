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
import {
  JUNIOR_CORNER_TABS,
  KIDS_CORNER_TABS,
  MATCH_WIZARD_AGES,
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
        label: "GYSH Match Wizard",
        kind: "menu",
        blurb: "Age-group selector",
        children: MATCH_WIZARD_AGES.map((a) => ({
          id: a.id,
          label: a.label,
          kind: "submenu" as const,
          blurb: a.blurb,
        })),
      },
      {
        id: "nav-kids",
        label: "Kids & Teens",
        kind: "menu",
        blurb: "GYSH Kids & Teens Corner",
        children: [
          {
            id: "kids-mode",
            label: "Kids (Ages 4–12)",
            kind: "submenu",
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
            kind: "submenu",
            children: JUNIOR_CORNER_TABS.map((t) => ({
              id: t.siteMapId,
              label: t.label,
              kind: "page" as const,
              ...(t.blurb ? { blurb: t.blurb } : {}),
            })),
          },
        ],
      },
      {
        id: "nav-seniors",
        label: "Seniors",
        kind: "menu",
        blurb: "GYSH Seniors Corner",
        children: SENIOR_CORNER_TABS.map((t) => ({
          id: t.siteMapId,
          label: t.label,
          kind: "submenu" as const,
        })),
      },
      {
        id: "nav-guides",
        label: "Guides",
        kind: "menu",
        blurb: "Dropdown menu",
        children: buildGuidesMenuChildren(),
      },
      { id: "nav-workshops", label: "Workshops", kind: "menu" },
      { id: "nav-community", label: "Community", kind: "menu" },
      { id: "nav-newsletter", label: "Newsletter", kind: "menu", blurb: "Members only · Weekly Friday issue" },
      {
        id: "nav-join",
        label: "Join",
        kind: "menu",
        blurb: "Membership Free → Elite",
        children: [
          { id: "join-plans", label: "Membership plans", kind: "submenu" },
          { id: "join-signup", label: "Membership Sign-up", kind: "submenu" },
          { id: "join-signin", label: "Sign in", kind: "submenu" },
        ],
      },
      {
        id: "nav-meta",
        label: "About & Contact",
        kind: "menu",
        blurb: "Secondary header",
        children: [
          { id: "nav-about", label: "About", kind: "submenu" },
          { id: "nav-contact", label: "Contact Us", kind: "submenu" },
          { id: "nav-privacy", label: "Privacy Policy", kind: "submenu" },
          { id: "nav-beta-nda", label: "Beta Tester NDA", kind: "submenu" },
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
  | { kind: "guides"; manual?: "adult" | "kids" | "teens" | "seniors" | "master" }
  | { kind: "workshops" }
  | { kind: "community" }
  | { kind: "newsletter" }
  | { kind: "join" }
  | { kind: "join-signup" }
  | { kind: "login" }
  | { kind: "about" }
  | { kind: "contact" }
  | { kind: "privacy" }
  | { kind: "beta_nda" }
  | { kind: "beta_testing" }
  | {
      kind: "admin";
      tab: AdminTab;
      guide?: UserGuideId;
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
  return out;
}

const SITE_MAP_HREFS: Record<string, SiteMapHref> = {
  home: { kind: "home" },
  "nav-match": { kind: "quiz" },
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
  "nav-guides": { kind: "guides" },
  "guides-library": { kind: "guides" },
  ...Object.fromEntries(
    MARKETING_GUIDE_MENU.map((g) => [
      g.id === "master" ? "guides-complete" : `guides-${g.id}`,
      { kind: "guides" as const, manual: g.id },
    ]),
  ),
  "nav-workshops": { kind: "workshops" },
  "nav-community": { kind: "community" },
  "nav-newsletter": { kind: "newsletter" },
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
  "nav-login": { kind: "login" },
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
  return ADMIN_MENU_GROUPS.flatMap((g) => g.tabs);
}

export { ADMIN_TABS, ADMIN_MENU_GROUPS, ADMIN_USER_GUIDE_LINKS };
