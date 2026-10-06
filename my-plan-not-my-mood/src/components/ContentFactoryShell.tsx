import React from 'react';
import { Sparkles } from 'lucide-react';
import { FACTORY_CHILD_TABS, studioTabDef, type AdminStudioTab } from '../lib/adminStudio';
import { brandTabClass, BRAND_TAB_SUB_ROW_CLASS } from '../lib/brandUi';

const FACTORY_SHELL_TABS: AdminStudioTab[] = ['factory', ...FACTORY_CHILD_TABS];

export const ContentFactoryShell: React.FC<{
  active: 'factory' | 'calendar' | 'gear-selections' | 'asset-library' | 'logo-concepts';
  onOpenTab: (tab: AdminStudioTab) => void;
  children?: React.ReactNode;
}> = ({ active, onOpenTab, children }) => {
  const heading = active === 'calendar' ? 'Angela’s posting schedule' : 'Phase 1 organic calendar';
  const intro =
    active === 'calendar'
      ? 'This is the Content Factory calendar. Each row has the same Not Started / In Progress / Done / Blocked status as a task. Change it here or on the Factory card.'
      : 'Posting starts Friday Sep 4 with one welcome per platform — NonNegotiation.com is the house, MY PLAN, NOT MY MOOD is the brand. Every public post includes https://nonnegotiation.com/gear. Status on each card is the same as the Posting Schedule.';

  return (
    <div className="space-y-4" data-testid="content-factory-shell">
      <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-[#FDBA74] bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FEF3C7] p-5 sm:p-6 shadow-[0_12px_32px_rgba(234,88,12,0.14)] space-y-3">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#FB923C]/25 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-[#F59E0B]/20 blur-2xl pointer-events-none" />
        <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EA580C] text-white text-[10px] font-mono font-black uppercase tracking-wider shadow-[0_4px_12px_rgba(234,88,12,0.35)]">
          <Sparkles className="w-3.5 h-3.5" /> Content Factory
        </div>
        <h2 className="relative text-2xl font-serif font-semibold text-[#9A3412]">{heading}</h2>
        <p className="relative text-sm text-[#9A3412] font-medium w-full">{intro}</p>
        <div className={`relative ${BRAND_TAB_SUB_ROW_CLASS}`} role="tablist" aria-label="Content Factory pages" data-testid="content-factory-tabs">
          {FACTORY_SHELL_TABS.map((id) => {
            const selected = id === active;
            const label = id === 'factory' ? 'Work cards' : id === 'calendar' ? 'Posting Schedule' : studioTabDef(id)?.label ?? id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onOpenTab(id)}
                className={brandTabClass(selected)}
                data-testid={`content-factory-tab-${id}`}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            role="tab"
            aria-selected={false}
            onClick={() => onOpenTab('growth')}
            className={brandTabClass(false)}
            data-testid="content-factory-tab-growth"
          >
            Growth Studio
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};
