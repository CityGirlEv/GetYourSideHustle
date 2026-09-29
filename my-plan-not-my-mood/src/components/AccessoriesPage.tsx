import React, { useState } from 'react';
import { BookOpen, CalendarDays, CircleDot, Sparkles } from 'lucide-react';
import {
  ACCESSORY_BRAND_NAME,
  ACCESSORY_PAGE_LABEL,
  ACCESSORY_PHASE2_ITEMS,
  ACCESSORY_PHASE2_LABEL,
  accessoryPhase2Item,
  DEFAULT_ACCESSORY_TAB,
  resolveAccessoryTab,
  type AccessoryPhase2Id,
} from '../lib/accessories';
import { studioTabClass, studioTabMetaClass } from '../lib/assetLibrary';
import { ComingSoonBadge } from './ComingSoonBadge';

const ACCESSORY_ICONS: Record<AccessoryPhase2Id, React.ReactNode> = {
  journal: <BookOpen className="w-8 h-8" />,
  planner: <CalendarDays className="w-8 h-8" />,
  bracelets: <CircleDot className="w-8 h-8" />,
};

export const AccessoriesPage: React.FC<{
  embedded?: boolean;
}> = ({ embedded = false }) => {
  const [activeTab, setActiveTab] = useState<AccessoryPhase2Id>(DEFAULT_ACCESSORY_TAB);
  const selectedId = resolveAccessoryTab(activeTab);
  const selected = accessoryPhase2Item(selectedId);

  return (
    <section className="space-y-4 animate-fadeIn" data-testid="accessories-page">
      {embedded ? null : (
        <div className="space-y-2 px-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> {ACCESSORY_PAGE_LABEL}
            <span>{ACCESSORY_PHASE2_LABEL}</span>
          </div>
          <h2 className="text-2xl font-serif font-semibold text-[#1F1917]">{ACCESSORY_BRAND_NAME}</h2>
        </div>
      )}

      <div
        className="flex flex-wrap gap-0 border-b-2 border-[#E8DFD2]"
        role="tablist"
        aria-label="Accessories"
        data-testid="accessories-tabs"
      >
        {ACCESSORY_PHASE2_ITEMS.map((item) => {
          const active = item.id === selectedId;
          return (
            <button
              type="button"
              key={item.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(item.id)}
              className={studioTabClass(active)}
              data-testid={`accessories-tab-${item.id}`}
            >
              {item.label}
              <span className={studioTabMetaClass(active)}>{ACCESSORY_PHASE2_LABEL}</span>
            </button>
          );
        })}
      </div>

      <article
        className="rounded-[1.75rem] border border-[#E8DFD2] bg-[#FFFCF7] p-5 sm:p-6 space-y-3"
        data-testid={`accessories-panel-${selected.id}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFEDD5] text-[#C2410C]">
            {ACCESSORY_ICONS[selected.id]}
          </div>
          <ComingSoonBadge />
        </div>
        <p className="text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]">
          {ACCESSORY_PAGE_LABEL} · {ACCESSORY_PHASE2_LABEL}
        </p>
        <h3 className="text-xl font-serif font-semibold text-[#1F1917]">{selected.name}</h3>
        <p className="text-sm font-medium text-[#3F3832] w-full">{selected.summary}</p>
      </article>
    </section>
  );
};
