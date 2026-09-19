import React from 'react';
import { Globe } from 'lucide-react';
import type { StoreRoute } from '../lib/storeRoutes';
import { HOME_WEBSITE_LINK_IDS, launchPageById } from '../lib/launchPages';
import { MailingListSignup } from './MailingListSignup';

interface WebsiteIntroSectionProps {
  onNavigate: (route: StoreRoute) => void;
}

export const WebsiteIntroSection: React.FC<WebsiteIntroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5" data-testid="website-intro">
      <div className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] border border-[#C2410C]/30 text-[10px] font-mono font-black uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5" /> Phase 1 website
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase tracking-tight text-[#1F1917]">
          The website is <span className="text-[#C2410C] italic">live</span>
        </h2>
        <p className="text-sm text-[#3F3832] font-medium leading-relaxed max-w-3xl">
          Sprint 3 introduces the public site: About, Contact, Privacy, Terms, and FAQ. Shop Gear stays the selling path.
          Sign up for the mailing list below — that is not a membership.
        </p>
        <div className="flex flex-wrap gap-2">
          {HOME_WEBSITE_LINK_IDS.map((id) => {
            const page = launchPageById(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className="min-h-[44px] px-4 rounded-xl border-2 border-[#1F1917] bg-[#FAF8F5] text-xs font-black uppercase tracking-wider hover:bg-[#FFEDD5] cursor-pointer"
              >
                {page.navLabel ?? page.title}
              </button>
            );
          })}
        </div>
      </div>
      <MailingListSignup />
    </section>
  );
};
