import React, { useEffect, useState } from 'react';
import {
  Award,
  BadgeCheck,
  Banknote,
  BookOpen,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  FlaskConical,
  History,
  Images,
  ListChecks,
  Package,
  Mail,
  Map,
  Megaphone,
  Shirt,
  Sparkles,
  Stamp,
  Users,
} from 'lucide-react';
import {
  defaultOpenStudioGroups,
  financialsSubTabs,
  isFinancialsSubNavOpen,
  isStudioTopSelected,
  openExclusiveStudioGroup,
  studioGroupIdForTab,
  studioGroupSubTabs,
  studioTabDef,
  studioTopSelection,
  visiblePinnedStudioTabs,
  visibleStudioGroups,
  type AdminStudioGroupId,
  type AdminStudioTab,
} from '../lib/adminStudio';
import { BRAND_TAB_ROW_CLASS, BRAND_TAB_SUB_ROW_CLASS, brandTabClass } from '../lib/brandUi';
import {
  TEST_SUITES,
  SUITE_LABELS,
  boardTabCountLabel,
  isTestingSuiteNavSelected,
  isTestingSuiteSubNavOpen,
  type TestSuite,
} from '../lib/testSuites';
import { ComingSoonBadge } from './ComingSoonBadge';

const TAB_ICONS: Record<AdminStudioTab, React.ReactNode> = {
  plan: <CalendarRange className="w-4 h-4 shrink-0" />,
  agenda: <ClipboardList className="w-4 h-4 shrink-0" />,
  tasks: <ListChecks className="w-4 h-4 shrink-0" />,
  testing: <FlaskConical className="w-4 h-4 shrink-0" />,
  'gear-selections': <Shirt className="w-4 h-4 shrink-0" />,
  timesheet: <Clock className="w-4 h-4 shrink-0" />,
  'daily-progress': <FileText className="w-4 h-4 shrink-0" />,
  users: <Users className="w-4 h-4 shrink-0" />,
  memberships: <BadgeCheck className="w-4 h-4 shrink-0" />,
  certificates: <Award className="w-4 h-4 shrink-0" />,
  emails: <Mail className="w-4 h-4 shrink-0" />,
  'mailing-list': <Mail className="w-4 h-4 shrink-0" />,
  factory: <Sparkles className="w-4 h-4 shrink-0" />,
  calendar: <CalendarDays className="w-4 h-4 shrink-0" />,
  'asset-library': <Images className="w-4 h-4 shrink-0" />,
  'logo-concepts': <Stamp className="w-4 h-4 shrink-0" />,
  growth: <Megaphone className="w-4 h-4 shrink-0" />,
  budget: <DollarSign className="w-4 h-4 shrink-0" />,
  pay: <Banknote className="w-4 h-4 shrink-0" />,
  'previous-budget': <History className="w-4 h-4 shrink-0" />,
  'inventory-pricing': <Package className="w-4 h-4 shrink-0" />,
  sitemap: <Map className="w-4 h-4 shrink-0" />,
  guides: <BookOpen className="w-4 h-4 shrink-0" />,
};

interface AdminStudioNavProps {
  activeTab: string;
  permissions: Parameters<typeof visibleStudioGroups>[0];
  onSelect: (tab: AdminStudioTab) => void;
  testingSuiteFilter?: ReadonlySet<TestSuite>;
  testingSuiteCounts?: Array<{ id: TestSuite; done: number; total: number }>;
  onSelectTestingSuite?: (suite: TestSuite) => void;
  taskBoardCount?: { done: number; total: number };
  testBoardCount?: { done: number; total: number };
  compact?: boolean;
  previousBudgetCapturedAt?: string;
}

function openGroupsForTab(tab: string) {
  const groupId = studioGroupIdForTab(tab as AdminStudioTab);
  const open = defaultOpenStudioGroups();
  if (groupId) open[groupId] = true;
  return open;
}

export const AdminStudioNav: React.FC<AdminStudioNavProps> = ({
  activeTab,
  permissions,
  onSelect,
  testingSuiteFilter,
  testingSuiteCounts,
  onSelectTestingSuite,
  taskBoardCount,
  testBoardCount,
  previousBudgetCapturedAt,
}) => {
  const groups = visibleStudioGroups(permissions);
  const pinned = visiblePinnedStudioTabs(permissions);
  const activeGroupId = studioGroupIdForTab(activeTab as AdminStudioTab);
  const [openGroups, setOpenGroups] = useState(() => openGroupsForTab(activeTab));

  useEffect(() => {
    if (!activeGroupId) return;
    setOpenGroups((prev) => (prev[activeGroupId] ? prev : openExclusiveStudioGroup(prev, activeGroupId)));
  }, [activeGroupId]);

  const openGroupId = groups.find((group) => openGroups[group.id])?.id;
  const openGroup = groups.find((group) => group.id === openGroupId);
  const selectedTop = studioTopSelection(activeTab, openGroupId, pinned);
  const subTabs = openGroup ? studioGroupSubTabs(openGroup, permissions) : [];
  const financialsOpen = isFinancialsSubNavOpen(activeTab, selectedTop);
  const financialsTabs = financialsOpen ? financialsSubTabs(previousBudgetCapturedAt) : [];

  const showGroup = (id: AdminStudioGroupId) => {
    const alreadyOpen = openGroupId === id;
    setOpenGroups((prev) => openExclusiveStudioGroup(prev, id));
    if (alreadyOpen) return;
    const group = groups.find((item) => item.id === id);
    if (!group) return;
    const tabs = studioGroupSubTabs(group, permissions);
    const currentGroup = studioGroupIdForTab(activeTab as AdminStudioTab);
    if (tabs.length && currentGroup !== id) {
      onSelect(tabs[0]);
    }
  };

  const showFinancials = () => {
    setOpenGroups(defaultOpenStudioGroups());
    onSelect('budget');
  };

  return (
    <nav className="flex flex-col items-stretch gap-0 min-w-0 w-full" aria-label="Admin Hub" data-testid="admin-studio-nav">
      <div className={BRAND_TAB_ROW_CLASS} role="tablist" aria-label="Admin Hub sections">
        {groups.map((group) => {
          const selected = isStudioTopSelected(selectedTop, { kind: 'group', id: group.id });
          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`studio-subtabs-${group.id}`}
              data-testid={`studio-group-${group.id}`}
              onClick={() => showGroup(group.id)}
              className={brandTabClass(selected)}
            >
              {group.label}
            </button>
          );
        })}
        {pinned.map((id) => {
          const def = studioTabDef(id);
          const selected = isStudioTopSelected(selectedTop, { kind: 'pinned', id });
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={showFinancials}
              data-testid={`studio-tab-${id}`}
              className={brandTabClass(selected)}
            >
              {TAB_ICONS[id]}
              {def?.label}
            </button>
          );
        })}
      </div>
      {openGroup && (
        <div
          id={`studio-subtabs-${openGroup.id}`}
          role="tablist"
          aria-label={`${openGroup.label} pages`}
          data-testid={`studio-group-items-${openGroup.id}`}
          className={BRAND_TAB_SUB_ROW_CLASS}
        >
          {subTabs.map((id) => {
            const def = studioTabDef(id);
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelect(id)}
                data-testid={`studio-tab-${id}`}
                className={brandTabClass(active)}
              >
                {TAB_ICONS[id]}
                {def?.label}
                {id === 'tasks' && taskBoardCount ? (
                  <span className="font-mono tabular-nums">{boardTabCountLabel(taskBoardCount.done, taskBoardCount.total)}</span>
                ) : null}
                {id === 'testing' && testBoardCount ? (
                  <span className="font-mono tabular-nums">{boardTabCountLabel(testBoardCount.done, testBoardCount.total)}</span>
                ) : null}
                {def?.comingSoon ? <ComingSoonBadge /> : null}
              </button>
            );
          })}
        </div>
      )}
      {isTestingSuiteSubNavOpen(activeTab) && onSelectTestingSuite ? (
        <div
          id="studio-subtabs-testing-suites"
          role="tablist"
          aria-label="Testing suites"
          data-testid="studio-group-items-testing-suites"
          className={BRAND_TAB_SUB_ROW_CLASS}
        >
          {TEST_SUITES.map((suite) => {
            const chip = testingSuiteCounts?.find((item) => item.id === suite);
            const selected = isTestingSuiteNavSelected(
              activeTab,
              suite,
              testingSuiteFilter ?? new Set(),
            );
            return (
              <button
                key={suite}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  onSelect('testing');
                  onSelectTestingSuite(suite);
                }}
                data-testid={`studio-tab-testing-${suite}`}
                className={brandTabClass(selected)}
              >
                {SUITE_LABELS[suite]}
                {chip ? (
                  <span className="font-mono tabular-nums">{boardTabCountLabel(chip.done, chip.total)}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
      {financialsOpen && !openGroup && (
        <div
          id="studio-subtabs-financials"
          role="tablist"
          aria-label="Financials pages"
          data-testid="studio-group-items-financials"
          className={BRAND_TAB_SUB_ROW_CLASS}
        >
          {financialsTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelect(tab.id)}
                data-testid={`studio-tab-${tab.id === 'budget' ? 'budget-sub' : tab.id}`}
                className={brandTabClass(active)}
              >
                {TAB_ICONS[tab.id]}
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
