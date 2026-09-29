import type { AdminPortalTab } from './adminPortalTabs';
import { hasRole, isAdminRole, type UserOrRoleInput } from './userAuth';
import {
  ADMIN_STUDIO_TABS,
  canOpenStudioTab,
  studioGroupSubTabs,
  studioParentTab,
  visiblePinnedStudioTabs,
  visibleStudioGroups,
  type AdminStudioTab,
} from './adminStudio';

export const PLAN_TAB_ID = 'plan' as const;
export const BUDGET_TAB_ID = 'budget' as const;
export const PLAN_DOWNLOAD_SECTION_DEFAULT_OPEN = true;

export type PlanAudienceCardId = 'internal';

export const PLAN_BUDGET_SECTION_ID = 'plan-internal-budget';
export const PLAN_BUDGET_VERSIONS_ID = 'plan-internal-budget-versions';

export function shouldShowInteractiveBudget(isInternal: boolean, canViewBudget: boolean): boolean {
  return Boolean(isInternal && canViewBudget);
}

export function internalPlanExtraLinks(
  isInternal: boolean,
  canViewBudget: boolean,
): { id: string; label: string; targetId: string }[] {
  if (!shouldShowInteractiveBudget(isInternal, canViewBudget)) return [];
  return [
    { id: 'budget', label: 'Budget', targetId: PLAN_BUDGET_SECTION_ID },
    { id: 'versions', label: 'Budget Versions', targetId: PLAN_BUDGET_VERSIONS_ID },
  ];
}

/** Angela's Plan audience card is omitted; Super Admin still gets Internal downloads. */
export function planPageCardOrder(canViewBudget: boolean): PlanAudienceCardId[] {
  return canViewBudget ? ['internal'] : [];
}

const LEGACY_PLAN_TABS = new Set(['plan', 'proposal', 'ip', 'schedule', 'schedule-suites']);

export function resolveAdminPortalTab(tab?: AdminPortalTab | string | null): AdminPortalTab {
  if (!tab) return PLAN_TAB_ID;
  if (LEGACY_PLAN_TABS.has(tab)) return PLAN_TAB_ID;
  return tab as AdminPortalTab;
}

export function canOpenPlanTab(canViewProposal: boolean, canViewIP: boolean): boolean {
  return canViewProposal || canViewIP;
}

/** Interactive budget page — Super Admin only. */
export function canOpenBudgetTab(canViewBudget: boolean): boolean {
  return Boolean(canViewBudget);
}

/** Interactive Agenda — Admin and Super Admin. */
export function canOpenAgendaTab(canViewAgenda: boolean): boolean {
  return Boolean(canViewAgenda);
}

export function togglePlanDownloadSection(isOpen: boolean): boolean {
  return !isOpen;
}

/** Header Plan link always opens the combined Plan page. */
export function openPlanFromHeader(tab?: AdminPortalTab | string | null): AdminPortalTab {
  return resolveAdminPortalTab(tab ?? PLAN_TAB_ID);
}

export function parseAdminPortalTab(pathname: string): AdminPortalTab {
  const path = (pathname || '/').split('?')[0].split('#')[0];
  if (path === '/admin/budget' || path.startsWith('/admin/budget/')) return BUDGET_TAB_ID;
  if (path === '/admin/pay' || path.startsWith('/admin/pay/')) return 'pay';
  if (path === '/admin/previous-budget' || path.startsWith('/admin/previous-budget/')) return 'previous-budget';
  if (path === '/admin/inventory-pricing' || path.startsWith('/admin/inventory-pricing/')) return 'inventory-pricing';
  if (path === '/admin/testing' || path.startsWith('/admin/testing/')) return 'testing';
  if (path === '/admin/tasks' || path.startsWith('/admin/tasks/')) return 'tasks';
  if (path === '/admin/users' || path.startsWith('/admin/users/')) return 'users';
  if (path === '/admin/emails' || path.startsWith('/admin/emails/')) return 'emails';
  if (path === '/admin/mailing-list' || path.startsWith('/admin/mailing-list/')) return 'mailing-list';
  if (path === '/admin/agenda' || path.startsWith('/admin/agenda/')) return 'agenda';
  if (path === '/admin/timesheet' || path.startsWith('/admin/timesheet/')) return 'timesheet';
  if (path === '/admin/daily-progress' || path.startsWith('/admin/daily-progress/')) return 'daily-progress';
  if (path === '/admin/memberships' || path.startsWith('/admin/memberships/')) return 'memberships';
  if (path === '/admin/schedule-suites' || path.startsWith('/admin/schedule-suites/')) return PLAN_TAB_ID;
  if (path === '/admin/certificates' || path.startsWith('/admin/certificates/')) return 'certificates';
  if (path === '/admin/factory' || path.startsWith('/admin/factory/')) return 'factory';
  if (path === '/admin/calendar' || path.startsWith('/admin/calendar/')) return 'calendar';
  if (path === '/admin/growth' || path.startsWith('/admin/growth/')) return 'growth';
  if (path === '/admin/sitemap' || path.startsWith('/admin/sitemap/')) return 'sitemap';
  if (path === '/admin/guides' || path.startsWith('/admin/guides/')) return 'guides';
  if (path === '/admin/gear-selections' || path.startsWith('/admin/gear-selections/')) return 'gear-selections';
  if (path === '/admin/asset-library' || path.startsWith('/admin/asset-library/')) return 'asset-library';
  if (path === '/admin/logo-concepts' || path.startsWith('/admin/logo-concepts/')) return 'logo-concepts';
  return PLAN_TAB_ID;
}

export function adminPortalPath(tab?: AdminPortalTab | string | null): string {
  const resolved = resolveAdminPortalTab(tab);
  if (resolved === PLAN_TAB_ID) return '/admin/plan';
  if (resolved === BUDGET_TAB_ID) return '/admin/budget';
  return `/admin/${resolved}`;
}

export function isAdminPortalPath(pathname: string): boolean {
  return (pathname || '/').split('?')[0].startsWith('/admin');
}

export function adminReturnPath(pathname: string): string {
  if (!isAdminPortalPath(pathname)) return '/admin/plan';
  return adminPortalPath(parseAdminPortalTab(pathname));
}

/** Admin and QA land on the Task List. Super Admin stays on Plan. */
export function postLoginAdminTab(user?: UserOrRoleInput): AdminPortalTab {
  if (isAdminRole(user) || hasRole(user, 'qa')) return 'tasks';
  return PLAN_TAB_ID;
}

/** Keep a specific deep link. Replace a default Plan hold with the role landing. */
export function postLoginAdminPath(user?: UserOrRoleInput, pendingPath?: string | null): string {
  const landing = adminPortalPath(postLoginAdminTab(user));
  if (!pendingPath) return landing;
  const pendingTab = parseAdminPortalTab(pendingPath);
  if (pendingTab === PLAN_TAB_ID && landing === adminPortalPath('tasks')) return landing;
  return pendingPath;
}

/** Deep links only open Admin after storefront login. */
export function shouldOpenAdminPortal(isSignedInToPortal: boolean, pathname: string): boolean {
  return isSignedInToPortal && isAdminPortalPath(pathname);
}

export type HeaderAdminNavId = AdminStudioTab;

export interface HeaderAdminNavItem {
  id: HeaderAdminNavId;
  label: string;
  nested?: boolean;
}

export interface HeaderAdminNavGroup {
  id: string;
  label: string;
  items: HeaderAdminNavItem[];
  underHub?: boolean;
}

const HEADER_ADMIN_LABELS: Partial<Record<AdminStudioTab, string>> = {
  plan: 'Plan',
  agenda: 'Agenda',
  tasks: 'Tasks',
  testing: 'Testing Portal',
  'gear-selections': 'Gear',
  'asset-library': 'Asset Library',
  'logo-concepts': 'Logos',
  users: 'Users',
  emails: 'Emails',
  'mailing-list': 'List',
  factory: 'Content Factory',
  calendar: 'Posting Schedule',
  budget: 'Admin Hub',
};

function headerAdminLabel(id: AdminStudioTab): string {
  return HEADER_ADMIN_LABELS[id] ?? ADMIN_STUDIO_TABS.find((tab) => tab.id === id)?.label ?? id;
}

/** Admin popup: Hub first, then every group including Content Factory and its nested pages. */
export function headerAdminNavGroups(
  permissions: Parameters<typeof canOpenStudioTab>[1],
): HeaderAdminNavGroup[] {
  const groups = visibleStudioGroups(permissions).map((group) => ({
    id: group.id,
    label: group.label,
    underHub: true,
    items: studioGroupSubTabs(group, permissions).map((id) => ({
      id,
      label: headerAdminLabel(id),
      nested: Boolean(studioParentTab(id)),
    })),
  }));
  const hub: HeaderAdminNavGroup = {
    id: 'hub',
    label: 'Admin Hub',
    underHub: false,
    items: [{ id: 'budget', label: 'Admin Hub' }],
  };
  return [hub, ...groups];
}

/** Flat Admin menu — every visible Admin Studio tab, Plan only (never a separate IP item). */
export function headerAdminNavItems(
  permissions: Parameters<typeof canOpenStudioTab>[1],
): HeaderAdminNavItem[] {
  return headerAdminNavGroups(permissions).flatMap((group) => group.items);
}
