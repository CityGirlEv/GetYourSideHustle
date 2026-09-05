import React from 'react';
import type { AdminStudioTab } from '../lib/adminStudio';
import { studioTabDef } from '../lib/adminStudio';
import { ComingSoonBadge } from './ComingSoonBadge';

export const AdminStudioPlaceholder: React.FC<{ tab: AdminStudioTab }> = ({ tab }) => {
  const def = studioTabDef(tab);
  return (
    <section
      className="bg-[#F3E6C8] border-2 border-[#D4C4A0] rounded-3xl p-6 sm:p-8 space-y-3"
      data-testid={`studio-placeholder-${tab}`}
    >
      <h2 className="text-2xl font-black text-[#1F1917] inline-flex items-center gap-2 flex-wrap">
        {def?.label ?? tab}
        {def?.comingSoon ? <ComingSoonBadge /> : null}
      </h2>
      <p className="text-sm font-medium text-[#3F3832] max-w-2xl">
        {def?.description}. This Admin Studio section is on the same menu as Get Your Side Hustle —
        wired here for MY PLAN, NOT MY MOOD. Open it anytime from the studio groups above.
      </p>
    </section>
  );
};
