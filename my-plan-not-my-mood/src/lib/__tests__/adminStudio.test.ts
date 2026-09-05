import { describe, expect, it } from 'vitest';
import {
  ADMIN_HUB_TITLE,
  ADMIN_STUDIO_GROUPS,
  ADMIN_STUDIO_PINNED_TABS,
  canOpenStudioTab,
  defaultOpenStudioGroups,
  ensureStudioGroupOpen,
  financialsSubTabs,
  isFinancialsSubNavOpen,
  isStudioTopSelected,
  mapLegacyAdminTab,
  openExclusiveStudioGroup,
  studioGroupIdForTab,
  studioTabChildren,
  studioTabDef,
  studioGroupSubTabs,
  studioTopSelection,
  toggleStudioGroup,
  visibleStudioGroups,
} from '../adminStudio';

describe('adminStudio', () => {
  it('groups Admin Studio like Plan & Delivery, People, Content, and Reference', () => {
    expect(ADMIN_HUB_TITLE).toBe('My Plan Admin Hub');
    expect(ADMIN_STUDIO_GROUPS.map((group) => group.id)).toEqual([
      'delivery',
      'people',
      'content',
      'reference',
    ]);
    expect(ADMIN_STUDIO_GROUPS[0]?.tabs).toContain('agenda');
    expect(ADMIN_STUDIO_GROUPS[0]?.tabs).not.toContain('gear-selections');
    expect(ADMIN_STUDIO_GROUPS[1]?.tabs).not.toContain('schedule-suites');
    expect(ADMIN_STUDIO_GROUPS[2]?.tabs).toContain('factory');
    expect(studioTabChildren('factory')).toEqual([
      'calendar',
      'gear-selections',
      'logo-concepts',
      'asset-library',
    ]);
    expect(studioTabChildren('asset-library')).toEqual([]);
    expect(studioTabDef('calendar')?.label).toBe('Calendar');
    expect(studioTabDef('gear-selections')?.label).toBe('Gear');
    expect(studioTabDef('testing')?.label).toBe('Testing');
    expect(studioTabDef('emails')?.label).toBe('Emails');
    const content = ADMIN_STUDIO_GROUPS.find((group) => group.id === 'content');
    expect(
      studioGroupSubTabs(content!, {
        hasAdminRole: true,
        isAdmin: true,
        canManageContentFactory: true,
      }),
    ).toEqual(['factory', 'calendar', 'gear-selections', 'logo-concepts', 'asset-library', 'growth']);
  });

  it('lets Admin open Agenda, Content Factory, and Financials', () => {
    const admin = { hasAdminRole: true, isAdmin: true, canViewAgenda: true, canViewProposal: true };
    expect(canOpenStudioTab('agenda', admin)).toBe(true);
    expect(canOpenStudioTab('factory', admin)).toBe(true);
    expect(canOpenStudioTab('calendar', admin)).toBe(true);
    expect(canOpenStudioTab('gear-selections', admin)).toBe(true);
    expect(canOpenStudioTab('asset-library', admin)).toBe(true);
    expect(canOpenStudioTab('logo-concepts', admin)).toBe(true);
    expect(canOpenStudioTab('factory', { isAdmin: true, hasAdminRole: false })).toBe(false);
    expect(canOpenStudioTab('budget', admin)).toBe(true);
    expect(canOpenStudioTab('budget', { isAdmin: true, hasAdminRole: false })).toBe(false);
    expect(canOpenStudioTab('budget', { ...admin, canViewBudget: true, isSuperAdmin: true })).toBe(true);
  });

  it('hides Memberships from QA/Dev and only shows them to Admin and Super Admin', () => {
    expect(canOpenStudioTab('memberships', { isAdmin: true, hasAdminRole: false })).toBe(false);
    expect(canOpenStudioTab('memberships', { hasAdminRole: true })).toBe(true);
    expect(canOpenStudioTab('memberships', { isSuperAdmin: true })).toBe(true);
    expect(studioTabDef('memberships')?.comingSoon).toBe(true);
  });

  it('puts Financials last and opens Budget + Pay after Financials is selected', () => {
    expect(ADMIN_STUDIO_PINNED_TABS).toEqual(['budget']);
    expect(ADMIN_STUDIO_GROUPS.map((group) => group.id).at(-1)).not.toBe('budget');
    expect(financialsSubTabs().map((tab) => tab.id)).toEqual(['budget', 'previous-budget', 'pay']);
    expect(financialsSubTabs().find((tab) => tab.id === 'pay')?.label).toBe('Pay');
    expect(financialsSubTabs('2026-08-15T18:30:00.000Z').find((tab) => tab.id === 'previous-budget')?.label).toMatch(
      /Previous Budget · /,
    );
    expect(isFinancialsSubNavOpen('budget', { kind: 'pinned', id: 'budget' })).toBe(true);
    expect(isFinancialsSubNavOpen('previous-budget', { kind: 'pinned', id: 'budget' })).toBe(true);
    expect(isFinancialsSubNavOpen('plan', { kind: 'group', id: 'delivery' })).toBe(false);
  });

  it('selects only one Admin Studio top chip at a time', () => {
    expect(studioTopSelection('budget', 'delivery')).toEqual({ kind: 'group', id: 'delivery' });
    expect(studioTopSelection('pay', undefined)).toEqual({ kind: 'pinned', id: 'budget' });
    expect(studioTopSelection('previous-budget', undefined)).toEqual({ kind: 'pinned', id: 'budget' });
    expect(studioTopSelection('plan', undefined)).toEqual({ kind: 'group', id: 'delivery' });
    expect(studioTopSelection('plan', 'people')).toEqual({ kind: 'group', id: 'people' });
    expect(isStudioTopSelected(studioTopSelection('budget', 'delivery'), { kind: 'pinned', id: 'budget' })).toBe(false);
    expect(isStudioTopSelected(studioTopSelection('budget', undefined), { kind: 'pinned', id: 'budget' })).toBe(true);
  });

  it('hides Financials from Admin visible groups and maps legacy plan tabs', () => {
    const groups = visibleStudioGroups({
      hasAdminRole: true,
      isAdmin: true,
      canViewAgenda: true,
      canViewProposal: true,
      canManageTasks: true,
      canViewTesting: true,
      canManageUsers: true,
      canManageEmailTemplates: true,
    });
    expect(groups.find((group) => group.id === 'content')?.tabs).toEqual(['factory', 'growth']);
    expect(mapLegacyAdminTab('proposal')).toBe('plan');
    expect(mapLegacyAdminTab('schedule-suites')).toBe('plan');
    expect(mapLegacyAdminTab('agenda')).toBe('agenda');
  });

  it('toggles Admin Studio groups independently and reopens the active tab group', () => {
    const open = defaultOpenStudioGroups();
    expect(open.delivery).toBe(false);
    expect(open.people).toBe(false);
    expect(open.content).toBe(false);
    expect(open.reference).toBe(false);

    const expanded = toggleStudioGroup(open, 'people');
    expect(expanded.people).toBe(true);
    expect(expanded.delivery).toBe(false);
    expect(expanded.content).toBe(false);
    expect(toggleStudioGroup(expanded, 'people').people).toBe(false);

    expect(studioGroupIdForTab('agenda')).toBe('delivery');
    expect(studioGroupIdForTab('users')).toBe('people');
    expect(studioGroupIdForTab('factory')).toBe('content');
    expect(studioGroupIdForTab('calendar')).toBe('content');
    expect(studioGroupIdForTab('gear-selections')).toBe('content');
    expect(studioGroupIdForTab('asset-library')).toBe('content');
    expect(studioGroupIdForTab('logo-concepts')).toBe('content');
    expect(studioGroupIdForTab('sitemap')).toBe('reference');
    expect(ensureStudioGroupOpen(open, 'people').people).toBe(true);
    expect(ensureStudioGroupOpen(expanded, 'people')).toBe(expanded);

    const menu = openExclusiveStudioGroup(expanded, 'content');
    expect(menu.content).toBe(true);
    expect(menu.people).toBe(false);
    expect(openExclusiveStudioGroup(menu, 'content').content).toBe(false);
  });
});
