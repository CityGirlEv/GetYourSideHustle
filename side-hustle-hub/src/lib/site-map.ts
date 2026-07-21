/** GYSH public + admin site map — hierarchical menus / submenus for Tree + Diagram views. */

export type SiteMapNode = {
  id: string;
  label: string;
  blurb?: string;
  /** menu = top-level nav; submenu = nested under a menu; page = leaf destination */
  kind?: "menu" | "submenu" | "page" | "section";
  children?: SiteMapNode[];
};

/** Public site: Home at the root, then header menus and their submenus. */
export const GYSH_PUBLIC_MAP: SiteMapNode = {
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
      children: [
        {
          id: "match-kids",
          label: "Kids (4–12)",
          kind: "submenu",
          blurb: "Bands 4–8 & 9–12 · GYSH Coaches · consent ≤12",
        },
        {
          id: "match-teens",
          label: "Teens (13–17)",
          kind: "submenu",
          blurb: "Bands 13–14 & 15–17",
        },
        {
          id: "match-adult",
          label: "Adults (18–54)",
          kind: "submenu",
          blurb: "Budget, hours, strengths, goals",
        },
        {
          id: "match-senior",
          label: "Seniors (55+)",
          kind: "submenu",
          blurb: "Flexible pace & second careers",
        },
      ],
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
          children: [
            { id: "kids-stories", label: "Stories", kind: "page", blurb: "Kevina Starr" },
            { id: "kids-wizard", label: "GYSH Match Wizard", kind: "page" },
            { id: "kids-ideas", label: "Ideas", kind: "page" },
            { id: "kids-piggy", label: "Piggy Bank", kind: "page" },
            { id: "kids-guides", label: "Guides", kind: "page" },
            { id: "kids-join", label: "Join", kind: "page", blurb: "Kids Corner GYSH Team" },
          ],
        },
        {
          id: "teens-mode",
          label: "Teens (Ages 13–17)",
          kind: "submenu",
          children: [
            { id: "teens-wizard", label: "GYSH Match Wizard", kind: "page" },
            { id: "teens-ideas", label: "Ideas", kind: "page" },
            { id: "teens-bank", label: "My Bank", kind: "page" },
            { id: "teens-guides", label: "Guides", kind: "page" },
            { id: "teens-join", label: "Join", kind: "page", blurb: "Join Teens" },
          ],
        },
      ],
    },
    {
      id: "nav-seniors",
      label: "Seniors",
      kind: "menu",
      blurb: "GYSH Seniors Corner",
      children: [
        { id: "sen-wizard", label: "GYSH Match Wizard", kind: "submenu" },
        { id: "sen-ideas", label: "Ideas", kind: "submenu" },
        { id: "sen-guides", label: "Guides", kind: "submenu" },
        { id: "sen-join", label: "Join", kind: "submenu" },
      ],
    },
    {
      id: "nav-guides",
      label: "Guides",
      kind: "menu",
      blurb: "Dropdown menu",
      children: [
        { id: "guides-library", label: "Guides Library", kind: "submenu" },
        { id: "guides-adult", label: "Adult Manual", kind: "submenu" },
        { id: "guides-kids", label: "Kids Manual", kind: "submenu" },
        { id: "guides-teens", label: "Teens Manual", kind: "submenu" },
        { id: "guides-seniors", label: "Seniors Manual", kind: "submenu" },
        { id: "guides-complete", label: "Complete Guide", kind: "submenu" },
      ],
    },
    { id: "nav-workshops", label: "Workshops", kind: "menu" },
    { id: "nav-community", label: "Community", kind: "menu" },
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
        { id: "nav-login", label: "Login / Portal", kind: "submenu" },
      ],
    },
  ],
};

/** Admin Studio menus grouped like the admin nav. */
export const GYSH_ADMIN_MAP: SiteMapNode = {
  id: "admin",
  label: "Admin Studio",
  kind: "section",
  blurb: "Partner / admin tools",
  children: [
    {
      id: "adm-delivery",
      label: "Plan & delivery",
      kind: "menu",
      children: [
        { id: "adm-schedule", label: "Schedule & Plan", kind: "submenu" },
        { id: "adm-tasks", label: "Task List", kind: "submenu" },
        { id: "adm-timesheet", label: "Timesheet", kind: "submenu" },
        { id: "adm-testing", label: "Testing Portal", kind: "submenu" },
        { id: "adm-daily-progress", label: "Daily Progress", kind: "submenu" },
      ],
    },
    {
      id: "adm-people",
      label: "People & access",
      kind: "menu",
      children: [
        { id: "adm-users", label: "Users Area", kind: "submenu" },
        { id: "adm-memberships", label: "Memberships", kind: "submenu" },
        { id: "adm-certificates", label: "Certificates", kind: "submenu" },
        { id: "adm-email", label: "Email Templates", kind: "submenu" },
      ],
    },
    {
      id: "adm-content",
      label: "Content & growth",
      kind: "menu",
      children: [
        { id: "adm-factory", label: "Content Factory", kind: "submenu" },
        { id: "adm-studio", label: "Growth Studio", kind: "submenu" },
        { id: "adm-financials", label: "Financials", kind: "submenu", blurb: "Admin only" },
      ],
    },
    {
      id: "adm-reference",
      label: "Reference",
      kind: "menu",
      children: [
        { id: "adm-sitemap", label: "Site Map", kind: "submenu" },
        {
          id: "adm-guides",
          label: "User Guides",
          kind: "submenu",
          children: [
            { id: "adm-guide-complete", label: "Complete Guide", kind: "page" },
            { id: "adm-guide-adult", label: "Adult Manual", kind: "page" },
            { id: "adm-guide-kids", label: "Kids Manual", kind: "page" },
            { id: "adm-guide-teens", label: "Teens Manual", kind: "page" },
            { id: "adm-guide-seniors", label: "Seniors Manual", kind: "page" },
            { id: "adm-guide-member", label: "Member Tour", kind: "page" },
            { id: "adm-guide-admin", label: "Admin User Guide", kind: "page" },
          ],
        },
      ],
    },
  ],
};

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
  | { kind: "join" }
  | { kind: "join-signup" }
  | { kind: "login" }
  | { kind: "about" }
  | { kind: "contact" }
  | {
      kind: "admin";
      tab:
        | "schedule"
        | "tasks"
        | "timesheet"
        | "testing"
        | "daily-progress"
        | "users"
        | "memberships"
        | "certificates"
        | "email"
        | "factory"
        | "studio"
        | "financials"
        | "sitemap"
        | "user-guides";
      guide?: "master" | "adult" | "kids" | "teens" | "seniors" | "member" | "admin";
    };

const SITE_MAP_HREFS: Record<string, SiteMapHref> = {
  home: { kind: "home" },
  "nav-match": { kind: "quiz" },
  "match-kids": { kind: "kids", mode: "kids", tab: "wizard" },
  "match-teens": { kind: "kids", mode: "junior", tab: "wizard" },
  "match-adult": { kind: "quiz-adult" },
  "match-senior": { kind: "seniors", tab: "match" },
  "nav-kids": { kind: "kids", mode: "kids", tab: "wizard" },
  "kids-mode": { kind: "kids", mode: "kids", tab: "wizard" },
  "kids-stories": { kind: "kids", mode: "kids", tab: "stories" },
  "kids-wizard": { kind: "kids", mode: "kids", tab: "wizard" },
  "kids-ideas": { kind: "kids", mode: "kids", tab: "jobs" },
  "kids-piggy": { kind: "kids", mode: "kids", tab: "piggy" },
  "kids-guides": { kind: "kids", mode: "kids", tab: "guides" },
  "kids-join": { kind: "kids", mode: "kids", tab: "join" },
  "teens-mode": { kind: "kids", mode: "junior", tab: "wizard" },
  "teens-wizard": { kind: "kids", mode: "junior", tab: "wizard" },
  "teens-ideas": { kind: "kids", mode: "junior", tab: "jobs" },
  "teens-bank": { kind: "kids", mode: "junior", tab: "piggy" },
  "teens-guides": { kind: "kids", mode: "junior", tab: "guides" },
  "teens-join": { kind: "kids", mode: "junior", tab: "join" },
  "nav-seniors": { kind: "seniors", tab: "match" },
  "sen-wizard": { kind: "seniors", tab: "match" },
  "sen-ideas": { kind: "seniors", tab: "opportunities" },
  "sen-guides": { kind: "seniors", tab: "guides" },
  "sen-join": { kind: "seniors", tab: "join" },
  "nav-guides": { kind: "guides" },
  "guides-library": { kind: "guides" },
  "guides-adult": { kind: "guides", manual: "adult" },
  "guides-kids": { kind: "guides", manual: "kids" },
  "guides-teens": { kind: "guides", manual: "teens" },
  "guides-seniors": { kind: "guides", manual: "seniors" },
  "guides-complete": { kind: "guides", manual: "master" },
  "nav-workshops": { kind: "workshops" },
  "nav-community": { kind: "community" },
  "nav-join": { kind: "join" },
  "join-plans": { kind: "join" },
  "join-signup": { kind: "join-signup" },
  "join-signin": { kind: "login" },
  "nav-meta": { kind: "about" },
  "nav-about": { kind: "about" },
  "nav-contact": { kind: "contact" },
  "nav-login": { kind: "login" },
  admin: { kind: "admin", tab: "schedule" },
  "adm-delivery": { kind: "admin", tab: "schedule" },
  "adm-schedule": { kind: "admin", tab: "schedule" },
  "adm-tasks": { kind: "admin", tab: "tasks" },
  "adm-timesheet": { kind: "admin", tab: "timesheet" },
  "adm-testing": { kind: "admin", tab: "testing" },
  "adm-daily-progress": { kind: "admin", tab: "daily-progress" },
  "adm-people": { kind: "admin", tab: "users" },
  "adm-users": { kind: "admin", tab: "users" },
  "adm-memberships": { kind: "admin", tab: "memberships" },
  "adm-certificates": { kind: "admin", tab: "certificates" },
  "adm-email": { kind: "admin", tab: "email" },
  "adm-content": { kind: "admin", tab: "factory" },
  "adm-factory": { kind: "admin", tab: "factory" },
  "adm-studio": { kind: "admin", tab: "studio" },
  "adm-financials": { kind: "admin", tab: "financials" },
  "adm-reference": { kind: "admin", tab: "sitemap" },
  "adm-sitemap": { kind: "admin", tab: "sitemap" },
  "adm-guides": { kind: "admin", tab: "user-guides" },
  "adm-guide-complete": { kind: "admin", tab: "user-guides", guide: "master" },
  "adm-guide-adult": { kind: "admin", tab: "user-guides", guide: "adult" },
  "adm-guide-kids": { kind: "admin", tab: "user-guides", guide: "kids" },
  "adm-guide-teens": { kind: "admin", tab: "user-guides", guide: "teens" },
  "adm-guide-seniors": { kind: "admin", tab: "user-guides", guide: "seniors" },
  "adm-guide-member": { kind: "admin", tab: "user-guides", guide: "member" },
  "adm-guide-admin": { kind: "admin", tab: "user-guides", guide: "admin" },
};

export function hrefForSiteMapNode(id: string): SiteMapHref | null {
  return SITE_MAP_HREFS[id] ?? null;
}
