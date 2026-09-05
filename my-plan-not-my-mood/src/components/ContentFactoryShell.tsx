import React from 'react';
import { Sparkles } from 'lucide-react';
import type { AdminStudioTab } from '../lib/adminStudio';

export const ContentFactoryShell: React.FC<{
  active: 'factory' | 'calendar' | 'gear-selections' | 'asset-library' | 'logo-concepts';
  onOpenTab: (tab: AdminStudioTab) => void;
  children?: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="space-y-4" data-testid="content-factory-shell">
      <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-[#FDBA74] bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FEF3C7] p-5 sm:p-6 shadow-[0_12px_32px_rgba(234,88,12,0.14)] space-y-3">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#FB923C]/25 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-[#F59E0B]/20 blur-2xl pointer-events-none" />
        <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EA580C] text-white text-[10px] font-mono font-black uppercase tracking-wider shadow-[0_4px_12px_rgba(234,88,12,0.35)]">
          <Sparkles className="w-3.5 h-3.5" /> Content Factory
        </div>
        <h2 className="relative text-2xl font-serif font-semibold text-[#9A3412]">Phase 1 organic calendar</h2>
        <p className="relative text-sm text-[#9A3412] font-medium w-full">
          Posting starts Friday Sep 4 with one welcome per platform — NonNegotiation.com is the house, MY PLAN, NOT MY MOOD is the brand. Facebook, TikTok, YouTube, personal, and Home that day. The first selling Facebook post is Saturday.
          Video prompts are 1–2 scenes, 15 seconds max each. Every public post includes https://nonnegotiation.com/gear. Due dates sit on each card header with the linked task number.
        </p>
      </div>
      {children}
    </div>
  );
};
