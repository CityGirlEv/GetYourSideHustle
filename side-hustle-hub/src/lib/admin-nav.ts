/**
 * Admin Studio navigation — single source of truth for header groups,
 * tab labels, User Guides list, and the Site Map diagram/tree.
 */
import type { MarketingGuideId } from "./marketing-guides";

export type AdminTab =
  | "studio"
  | "schedule"
  | "testing"
  | "users"
  | "memberships"
  | "factory"
  | "tasks"
  | "timesheet"
  | "daily-progress"
  | "financials"
  | "sitemap"
  | "user-guides"
  | "certificates"
  | "email";

export type AdminTabDef = { id: AdminTab; label: string; adminOnly?: boolean };

export type UserGuideId = "member" | "admin" | MarketingGuideId;

export const ADMIN_TABS: AdminTabDef[] = [
  { id: "schedule", label: "Schedule & Plan" },
  { id: "tasks", label: "Task List" },
  { id: "testing", label: "Testing Portal" },
  { id: "timesheet", label: "Timesheet" },
  { id: "daily-progress", label: "Daily Progress" },
  { id: "users", label: "Users Area" },
  { id: "memberships", label: "Memberships" },
  { id: "certificates", label: "Certificates" },
  { id: "email", label: "Email Templates" },
  { id: "factory", label: "Content Factory" },
  { id: "financials", label: "Financials", adminOnly: true },
  { id: "studio", label: "Growth Studio" },
  { id: "sitemap", label: "Site Map" },
  { id: "user-guides", label: "User Guides" },
];

/** Grouped Admin header menu — keeps the long list scannable. */
export const ADMIN_MENU_GROUPS: { id: string; label: string; tabs: AdminTab[] }[] = [
  {
    id: "delivery",
    label: "Plan & delivery",
    tabs: ["schedule", "tasks", "testing", "timesheet", "daily-progress"],
  },
  { id: "people", label: "People & access", tabs: ["users", "memberships", "certificates", "email"] },
  { id: "content", label: "Content & growth", tabs: ["factory", "studio", "financials"] },
  { id: "reference", label: "Reference", tabs: ["sitemap", "user-guides"] },
];

export const ADMIN_USER_GUIDE_LINKS: { id: UserGuideId; label: string }[] = [
  { id: "master", label: "Complete Guide" },
  { id: "adult", label: "Adult Guide" },
  { id: "kids", label: "Kids Guide" },
  { id: "teens", label: "Teens Guide" },
  { id: "seniors", label: "Seniors Guide" },
  { id: "member", label: "Member Tour" },
  { id: "admin", label: "Admin User Guide" },
];

export function adminTabById(id: AdminTab): AdminTabDef | undefined {
  return ADMIN_TABS.find((t) => t.id === id);
}

/** Site-map node id for an admin tab (e.g. schedule → adm-schedule). */
export function adminTabSiteMapId(tab: AdminTab): string {
  return `adm-${tab}`;
}

/** Site-map node id for a user guide leaf. */
export function adminGuideSiteMapId(guide: UserGuideId): string {
  return guide === "master" ? "adm-guide-complete" : `adm-guide-${guide}`;
}
