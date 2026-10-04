/**
 * Admin Studio navigation — single source of truth for header groups,
 * tab labels, User Guides list, and the Site Map diagram/tree.
 */
import type { MarketingGuideId } from "./marketing-guides";

export type AdminTab =
  | "studio"
  | "schedule"
  | "agenda"
  | "testing"
  | "users"
  | "blueprints"
  | "memberships"
  | "hustle-schedules"
  | "factory"
  | "vspw"
  | "tasks"
  | "timesheet"
  | "daily-progress"
  | "financials"
  | "time-load"
  | "sitemap"
  | "user-guides"
  | "certificates"
  | "email"
  | "workshops";

export type AdminTabDef = { id: AdminTab; label: string; adminOnly?: boolean };

export type UserGuideId = "member" | "admin" | MarketingGuideId;

export const ADMIN_TABS: AdminTabDef[] = [
  { id: "schedule", label: "Schedule & Plan" },
  { id: "agenda", label: "Agenda" },
  { id: "tasks", label: "Task List" },
  { id: "testing", label: "Testing Portal" },
  { id: "timesheet", label: "Timesheet" },
  { id: "daily-progress", label: "Daily Progress" },
  { id: "users", label: "Users Area" },
  { id: "blueprints", label: "Blueprint List", adminOnly: true },
  { id: "memberships", label: "Memberships" },
  { id: "hustle-schedules", label: "Schedule Suites" },
  { id: "certificates", label: "Certificates" },
  { id: "email", label: "Email Templates" },
  { id: "workshops", label: "Workshops", adminOnly: true },
  { id: "factory", label: "Content Factory", adminOnly: true },
  { id: "vspw", label: "VSPW Wizard" },
  { id: "financials", label: "Financials", adminOnly: true },
  { id: "time-load", label: "Time load", adminOnly: true },
  { id: "studio", label: "Growth Studio" },
  { id: "sitemap", label: "Site Map" },
  { id: "user-guides", label: "User Guides" },
];

/** Grouped Admin header menu — keeps the long list scannable. */
export const ADMIN_MENU_GROUPS: { id: string; label: string; tabs: AdminTab[] }[] = [
  {
    id: "delivery",
    label: "Plan & delivery",
    tabs: ["schedule", "agenda", "tasks", "testing", "timesheet", "daily-progress"],
  },
  {
    id: "people",
    label: "People & access",
    tabs: ["users", "blueprints", "memberships", "hustle-schedules", "certificates", "email", "workshops"],
  },
  { id: "content", label: "Content & growth", tabs: ["factory", "vspw", "studio", "financials", "time-load"] },
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
