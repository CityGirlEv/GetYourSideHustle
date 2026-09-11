import { previousBudgetTabLabel } from './budgetEditions';
import type { AdminPortalTab } from './adminPortalTabs';

export type AdminStudioTab =
  | 'plan'
  | 'agenda'
  | 'tasks'
  | 'testing'
  | 'timesheet'
  | 'daily-progress'
  | 'users'
  | 'memberships'
  | 'certificates'
  | 'emails'
  | 'factory'
  | 'calendar'
  | 'growth'
  | 'budget'
  | 'pay'
  | 'previous-budget'
  | 'sitemap'
  | 'guides'
  | 'gear-selections'
  | 'asset-library'
  | 'logo-concepts';

export type AdminStudioGroupId = 'delivery' | 'people' | 'content' | 'reference';

export const ADMIN_HUB_TITLE = 'My Plan Admin Hub';

export interface AdminStudioTabDef {
  id: AdminStudioTab;
  label: string;
  description: string;
  superAdminOnly?: boolean;
  comingSoon?: boolean;
}

export interface AdminStudioGroup {
  id: AdminStudioGroupId;
  label: string;
  tabs: AdminStudioTab[];
}

export const ADMIN_STUDIO_TABS: AdminStudioTabDef[] = [
  { id: 'plan', label: 'Schedule & Plan', description: 'Living implementation plan' },
  { id: 'agenda', label: 'Agenda', description: 'Kickoff and meeting menus' },
  { id: 'tasks', label: 'Task List', description: 'Sprint work board' },
  { id: 'testing', label: 'Testing', description: 'QA matrix' },
  { id: 'timesheet', label: 'Timesheet', description: 'Hours by sprint' },
  { id: 'daily-progress', label: 'Daily Progress', description: 'What won today' },
  { id: 'users', label: 'Users Area', description: 'Accounts and roles' },
  { id: 'memberships', label: 'Memberships', description: 'Join tiers and access — Coming Soon', comingSoon: true },
  { id: 'certificates', label: 'Certificates', description: 'Beta and completion awards' },
  { id: 'emails', label: 'Emails', description: 'Templates, send settings, and test mail' },
  { id: 'factory', label: 'Content Factory', description: 'Phase 1 posts, Gear, Logo Concepts, and calendar' },
  { id: 'calendar', label: 'Posting Schedule', description: 'One document: date, platform, time, and what to post' },
  { id: 'gear-selections', label: 'Gear', description: 'Style cards that already include hat, hoodie, and tee' },
  { id: 'logo-concepts', label: 'Logos', description: 'Upload logos and highlight the Selected Logo' },
  { id: 'asset-library', label: 'Asset Library', description: 'Logos, Gear, and Phase 2 Accessories' },
  { id: 'growth', label: 'Growth Studio', description: 'Socials and amplification' },
  { id: 'budget', label: 'Financials', description: 'Interactive budget and PDF downloads' },
  { id: 'pay', label: 'Pay', description: 'Make a phase payment' },
  { id: 'previous-budget', label: 'Previous Budget', description: 'Archived budget with pre-payment discount schedule' },
  { id: 'sitemap', label: 'Site Map', description: 'Site map and tree map' },
  { id: 'guides', label: 'User Guides', description: 'How we run this studio' },
];

export const ADMIN_STUDIO_GROUPS: AdminStudioGroup[] = [
  {
    id: 'delivery',
    label: 'Plan & Delivery',
    tabs: ['plan', 'agenda', 'tasks', 'testing', 'timesheet', 'daily-progress'],
  },
  {
    id: 'people',
    label: 'People & Access',
    tabs: ['users', 'memberships', 'certificates', 'emails'],
  },
  {
    id: 'content',
    label: 'Content & Growth',
    tabs: ['factory', 'growth'],
  },
  {
    id: 'reference',
    label: 'Reference',
    tabs: ['sitemap', 'guides'],
  },
];

/** Top-level Hub chips rendered last — Financials stays after the group tabs. */
export const ADMIN_STUDIO_PINNED_TABS: AdminStudioTab[] = ['budget'];

export type FinancialsSubTabId = 'budget' | 'previous-budget' | 'pay';

export interface FinancialsSubTab {
  id: FinancialsSubTabId;
  label: string;
}

/** Sub-tabs shown after clicking Financials. Previous Budget is the dated archive. */
export function financialsSubTabs(previousCapturedAt?: string): FinancialsSubTab[] {
  return [
    { id: 'budget', label: 'Budget' },
    { id: 'previous-budget', label: previousBudgetTabLabel(previousCapturedAt) },
    { id: 'pay', label: 'Pay' },
  ];
}

export const FACTORY_CHILD_TABS: AdminStudioTab[] = [
  'calendar',
  'gear-selections',
  'logo-concepts',
  'asset-library',
];

export function studioTabChildren(id: AdminStudioTab): AdminStudioTab[] {
  if (id === 'factory') return [...FACTORY_CHILD_TABS];
  return [];
}

export function studioParentTab(id: AdminStudioTab): AdminStudioTab | undefined {
  if (FACTORY_CHILD_TABS.includes(id)) return 'factory';
  return undefined;
}

export const STUDIO_TAB_IDS = new Set<string>(ADMIN_STUDIO_TABS.map((tab) => tab.id));

export function isAdminStudioTab(tab: string | null | undefined): tab is AdminStudioTab {
  return Boolean(tab && STUDIO_TAB_IDS.has(tab));
}

export function studioTabDef(id: AdminStudioTab): AdminStudioTabDef | undefined {
  return ADMIN_STUDIO_TABS.find((tab) => tab.id === id);
}

export function canOpenStudioTab(
  id: AdminStudioTab,
  permissions: {
    canViewProposal?: boolean;
    canViewIP?: boolean;
    canViewAgenda?: boolean;
    canManageTasks?: boolean;
    canViewTesting?: boolean;
    canManageUsers?: boolean;
    canManageEmailTemplates?: boolean;
    canManageContentFactory?: boolean;
    canViewBudget?: boolean;
    isSuperAdmin?: boolean;
    hasAdminRole?: boolean;
    isAdmin?: boolean;
  },
): boolean {
  const staff = Boolean(permissions.isAdmin || permissions.hasAdminRole || permissions.isSuperAdmin);
  const factory =
    permissions.canManageContentFactory !== undefined
      ? Boolean(permissions.canManageContentFactory)
      : Boolean(permissions.hasAdminRole || permissions.isSuperAdmin);
  if (id === 'budget' || id === 'pay' || id === 'previous-budget') {
    return Boolean(permissions.canViewBudget ?? (permissions.hasAdminRole || permissions.isSuperAdmin));
  }
  if (id === 'agenda') return Boolean(permissions.canViewAgenda ?? (permissions.hasAdminRole || permissions.isSuperAdmin));
  if (id === 'plan') return Boolean(permissions.canViewProposal || permissions.canViewIP);
  if (id === 'tasks') return Boolean(permissions.canManageTasks);
  if (id === 'testing') return Boolean(permissions.canViewTesting);
  if (id === 'users') return Boolean(permissions.canManageUsers);
  if (id === 'memberships') return Boolean(permissions.hasAdminRole || permissions.isSuperAdmin);
  if (id === 'emails') return Boolean(permissions.canManageEmailTemplates);
  if (id === 'factory' || id === 'calendar' || id === 'gear-selections' || id === 'asset-library' || id === 'logo-concepts') return factory;
  return staff;
}

export function visibleStudioGroups(permissions: Parameters<typeof canOpenStudioTab>[1]): AdminStudioGroup[] {
  return ADMIN_STUDIO_GROUPS.map((group) => ({
    ...group,
    tabs: group.tabs.filter((id) => canOpenStudioTab(id, permissions)),
  })).filter((group) => group.tabs.length > 0);
}

export function visiblePinnedStudioTabs(
  permissions: Parameters<typeof canOpenStudioTab>[1],
): AdminStudioTab[] {
  return ADMIN_STUDIO_PINNED_TABS.filter((id) => canOpenStudioTab(id, permissions));
}

/** Pages shown in a group's submenu, including nested factory children. */
export function studioTabDescendants(
  id: AdminStudioTab,
  permissions: Parameters<typeof canOpenStudioTab>[1],
): AdminStudioTab[] {
  return studioTabChildren(id)
    .filter((child) => canOpenStudioTab(child, permissions))
    .flatMap((child) => [child, ...studioTabDescendants(child, permissions)]);
}

export function studioGroupSubTabs(
  group: AdminStudioGroup,
  permissions: Parameters<typeof canOpenStudioTab>[1],
): AdminStudioTab[] {
  return group.tabs.flatMap((id) => [id, ...studioTabDescendants(id, permissions)]);
}

export function defaultOpenStudioGroups(): Record<AdminStudioGroupId, boolean> {
  return {
    delivery: false,
    people: false,
    content: false,
    reference: false,
  };
}

export function toggleStudioGroup(
  open: Record<AdminStudioGroupId, boolean>,
  id: AdminStudioGroupId,
): Record<AdminStudioGroupId, boolean> {
  return { ...open, [id]: !open[id] };
}

export function openExclusiveStudioGroup(
  open: Record<AdminStudioGroupId, boolean>,
  id: AdminStudioGroupId,
): Record<AdminStudioGroupId, boolean> {
  const next = defaultOpenStudioGroups();
  next[id] = !open[id];
  return next;
}

export function studioGroupIdForTab(tab: AdminStudioTab): AdminStudioGroupId | undefined {
  let current: AdminStudioTab | undefined = tab;
  const seen = new Set<AdminStudioTab>();
  while (current && !seen.has(current)) {
    seen.add(current);
    const match = ADMIN_STUDIO_GROUPS.find((group) => group.tabs.includes(current!));
    if (match) return match.id;
    current = studioParentTab(current);
  }
  return undefined;
}

export function ensureStudioGroupOpen(
  open: Record<AdminStudioGroupId, boolean>,
  id: AdminStudioGroupId,
): Record<AdminStudioGroupId, boolean> {
  return open[id] ? open : { ...open, [id]: true };
}

export type StudioTopSelection =
  | { kind: 'pinned'; id: AdminStudioTab }
  | { kind: 'group'; id: AdminStudioGroupId };

/** Exactly one Admin Studio top chip is selected — never Financials and a group together. */
export function isFinancialsTab(tab: string): boolean {
  return tab === 'budget' || tab === 'pay' || tab === 'previous-budget';
}

export function studioTopSelection(
  activeTab: string,
  openGroupId: AdminStudioGroupId | undefined,
  pinned: readonly AdminStudioTab[] = ADMIN_STUDIO_PINNED_TABS,
): StudioTopSelection | undefined {
  if (openGroupId) return { kind: 'group', id: openGroupId };
  if (isFinancialsTab(activeTab) || (isAdminStudioTab(activeTab) && pinned.includes(activeTab))) {
    return { kind: 'pinned', id: pinned[0] ?? 'budget' };
  }
  if (isAdminStudioTab(activeTab)) {
    const groupId = studioGroupIdForTab(activeTab);
    if (groupId) return { kind: 'group', id: groupId };
  }
  return undefined;
}

export function isStudioTopSelected(
  selection: StudioTopSelection | undefined,
  candidate: StudioTopSelection,
): boolean {
  return selection?.kind === candidate.kind && selection.id === candidate.id;
}

export function isFinancialsSubNavOpen(
  activeTab: string,
  selection: StudioTopSelection | undefined,
): boolean {
  return selection?.kind === 'pinned' || isFinancialsTab(activeTab);
}

export function mapLegacyAdminTab(tab: AdminPortalTab | string | null | undefined): AdminStudioTab {
  if (tab === 'proposal' || tab === 'ip' || tab === 'schedule' || tab === 'schedule-suites') return 'plan';
  if (tab === 'financials') return 'budget';
  if (isAdminStudioTab(tab)) return tab;
  return 'plan';
}
