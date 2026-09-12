import { describe, expect, it } from 'vitest';
import {
  PLAN_BUDGET_SECTION_ID,
  PLAN_BUDGET_VERSIONS_ID,
  PLAN_DOWNLOAD_SECTION_DEFAULT_OPEN,
  BUDGET_TAB_ID,
  PLAN_TAB_ID,
  canOpenBudgetTab,
  internalPlanExtraLinks,
  shouldShowInteractiveBudget,
  adminPortalPath,
  adminReturnPath,
  canOpenPlanTab,
  isAdminPortalPath,
  shouldOpenAdminPortal,
  headerAdminNavGroups,
  headerAdminNavItems,
  openPlanFromHeader,
  parseAdminPortalTab,
  planPageCardOrder,
  postLoginAdminPath,
  postLoginAdminTab,
  resolveAdminPortalTab,
  togglePlanDownloadSection,
} from '../planPage';

describe('planPage', () => {
  it('maps Angela Plan and IP tabs onto the combined Plan tab', () => {
    expect(resolveAdminPortalTab()).toBe(PLAN_TAB_ID);
    expect(resolveAdminPortalTab('proposal')).toBe('plan');
    expect(resolveAdminPortalTab('ip')).toBe('plan');
    expect(resolveAdminPortalTab('schedule')).toBe('plan');
    expect(resolveAdminPortalTab('plan')).toBe('plan');
    expect(resolveAdminPortalTab('testing')).toBe('testing');
  });

  it('opens Plan for proposal or IP viewers and keeps the download section expanded by default', () => {
    expect(canOpenPlanTab(true, false)).toBe(true);
    expect(canOpenPlanTab(false, true)).toBe(true);
    expect(canOpenPlanTab(false, false)).toBe(false);
    expect(PLAN_DOWNLOAD_SECTION_DEFAULT_OPEN).toBe(true);
    expect(togglePlanDownloadSection(true)).toBe(false);
    expect(togglePlanDownloadSection(false)).toBe(true);
  });

  it('omits the Angela Plan audience card and keeps Internal only when budget is visible', () => {
    expect(planPageCardOrder(false)).toEqual([]);
    expect(planPageCardOrder(true)).toEqual(['internal']);
  });

  it('shows Budget and Budget Versions links only on the Internal tab for Super Admin', () => {
    expect(shouldShowInteractiveBudget(false, true)).toBe(false);
    expect(shouldShowInteractiveBudget(true, false)).toBe(false);
    expect(shouldShowInteractiveBudget(true, true)).toBe(true);
    expect(internalPlanExtraLinks(false, true)).toEqual([]);
    expect(internalPlanExtraLinks(true, false)).toEqual([]);
    expect(internalPlanExtraLinks(true, true)).toEqual([
      { id: 'budget', label: 'Budget', targetId: PLAN_BUDGET_SECTION_ID },
      { id: 'versions', label: 'Budget Versions', targetId: PLAN_BUDGET_VERSIONS_ID },
    ]);
  });

  it('lists every visible Admin Studio tab in the header Admin menu and never adds a separate IP item', () => {
    const items = headerAdminNavItems({
      canViewProposal: true,
      canViewIP: true,
      canViewTesting: true,
      canManageTasks: true,
    });
    expect(items.map((item) => item.id)).toEqual(['budget', 'plan', 'tasks', 'testing']);
    expect(items.some((item) => item.label === 'IP')).toBe(false);
    expect(items[0]).toEqual({ id: 'budget', label: 'Admin Hub' });
    expect(headerAdminNavItems({ canViewIP: true }).map((item) => item.id)).toEqual(['budget', 'plan']);
    expect(headerAdminNavItems({ canViewProposal: true, canViewBudget: true }).map((item) => item.id)).toEqual([
      'budget',
      'plan',
    ]);
    expect(headerAdminNavItems({ canViewProposal: true, canViewBudget: true })[0]).toEqual({
      id: 'budget',
      label: 'Admin Hub',
    });
    expect(canOpenBudgetTab(true)).toBe(true);
    expect(canOpenBudgetTab(false)).toBe(false);

    const studio = headerAdminNavItems({
      canViewProposal: true,
      canViewIP: true,
      canViewAgenda: true,
      canManageTasks: true,
      canViewTesting: true,
      canManageUsers: true,
      canManageEmailTemplates: true,
      canViewBudget: true,
      isAdmin: true,
      isSuperAdmin: true,
    });
    expect(studio.map((item) => item.id)).toEqual([
      'budget',
      'plan',
      'agenda',
      'tasks',
      'testing',
      'timesheet',
      'daily-progress',
      'users',
      'memberships',
      'certificates',
      'emails',
      'factory',
      'calendar',
      'gear-selections',
      'logo-concepts',
      'asset-library',
      'growth',
      'sitemap',
      'guides',
    ]);
    expect(studio[0]).toEqual({ id: 'budget', label: 'Admin Hub' });
    const groups = headerAdminNavGroups({
      canViewProposal: true,
      canViewAgenda: true,
      canManageTasks: true,
      canViewTesting: true,
      canViewBudget: true,
      canManageContentFactory: true,
      isAdmin: true,
    });
    expect(groups.map((group) => group.id)).toEqual(['hub', 'delivery', 'people', 'content', 'reference']);
    expect(groups.find((group) => group.id === 'content')?.items.map((item) => item.id)).toEqual([
      'factory',
      'calendar',
      'gear-selections',
      'logo-concepts',
      'asset-library',
      'growth',
    ]);
    expect(groups.find((group) => group.id === 'content')?.items.find((item) => item.id === 'factory')?.nested).toBeFalsy();
    expect(groups.find((group) => group.id === 'content')?.items.find((item) => item.id === 'calendar')?.nested).toBe(true);
    expect(groups.find((group) => group.id === 'content')?.items.find((item) => item.id === 'gear-selections')?.nested).toBe(true);
    expect(groups.find((group) => group.id === 'content')?.items.find((item) => item.id === 'logo-concepts')?.nested).toBe(true);
    expect(groups.find((group) => group.id === 'delivery')?.items.find((item) => item.id === 'testing')?.label).toBe('Testing');
  });

  it('sends the header Plan link to the Plan page path', () => {
    expect(openPlanFromHeader()).toBe('plan');
    expect(openPlanFromHeader('plan')).toBe('plan');
    expect(openPlanFromHeader('proposal')).toBe('plan');
    expect(openPlanFromHeader('ip')).toBe('plan');
    expect(adminPortalPath('plan')).toBe('/admin/plan');
    expect(adminPortalPath('proposal')).toBe('/admin/plan');
    expect(parseAdminPortalTab('/admin/plan')).toBe('plan');
    expect(parseAdminPortalTab('/admin/pricing')).toBe('plan');
    expect(parseAdminPortalTab('/admin/budget')).toBe(BUDGET_TAB_ID);
    expect(adminPortalPath('budget')).toBe('/admin/budget');
    expect(parseAdminPortalTab('/admin/pay')).toBe('pay');
    expect(adminPortalPath('pay')).toBe('/admin/pay');
    expect(parseAdminPortalTab('/admin/previous-budget')).toBe('previous-budget');
    expect(adminPortalPath('previous-budget')).toBe('/admin/previous-budget');
    expect(openPlanFromHeader('budget')).toBe(BUDGET_TAB_ID);
    expect(parseAdminPortalTab('/admin/testing')).toBe('testing');
    expect(parseAdminPortalTab('/admin/agenda')).toBe('agenda');
    expect(parseAdminPortalTab('/admin/schedule-suites')).toBe(PLAN_TAB_ID);
    expect(parseAdminPortalTab('/admin/factory')).toBe('factory');
    expect(parseAdminPortalTab('/admin/calendar')).toBe('calendar');
    expect(adminPortalPath('calendar')).toBe('/admin/calendar');
    expect(parseAdminPortalTab('/admin/gear-selections')).toBe('gear-selections');
    expect(adminPortalPath('gear-selections')).toBe('/admin/gear-selections');
    expect(parseAdminPortalTab('/admin/asset-library')).toBe('asset-library');
    expect(adminPortalPath('asset-library')).toBe('/admin/asset-library');
    expect(parseAdminPortalTab('/admin/logo-concepts')).toBe('logo-concepts');
    expect(adminPortalPath('logo-concepts')).toBe('/admin/logo-concepts');
    expect(adminPortalPath('agenda')).toBe('/admin/agenda');
  });

  it('sends Admin and QA to the Task List after login, and keeps Super Admin on Plan', () => {
    const admin = { role: 'admin' as const, roles: ['admin' as const] };
    const qa = { role: 'qa' as const, roles: ['qa' as const] };
    const superAdmin = { role: 'super_admin' as const, roles: ['super_admin' as const] };
    expect(postLoginAdminTab(admin)).toBe('tasks');
    expect(postLoginAdminTab(qa)).toBe('tasks');
    expect(postLoginAdminTab(superAdmin)).toBe('plan');
    expect(postLoginAdminPath(admin)).toBe('/admin/tasks');
    expect(postLoginAdminPath(qa, '/admin/plan')).toBe('/admin/tasks');
    expect(postLoginAdminPath(qa, '/admin/testing')).toBe('/admin/testing');
    expect(postLoginAdminPath(superAdmin, '/admin/plan')).toBe('/admin/plan');
  });

  it('holds /admin/plan until login, then returns the visitor to that same path', () => {
    expect(isAdminPortalPath('/admin/plan')).toBe(true);
    expect(adminReturnPath('/admin/plan')).toBe('/admin/plan');
    expect(adminReturnPath('/admin/testing')).toBe('/admin/testing');
    expect(shouldOpenAdminPortal(false, '/admin/plan')).toBe(false);
    expect(shouldOpenAdminPortal(true, '/admin/plan')).toBe(true);
    expect(shouldOpenAdminPortal(true, '/')).toBe(false);
  });
});
