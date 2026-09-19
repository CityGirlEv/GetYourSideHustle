import React from 'react';
import type { StoreRoute } from '../lib/storeRoutes';
import { HOME_WEBSITE_LINK_IDS, launchPageById } from '../lib/launchPages';
import { MailingListSignup } from './MailingListSignup';

interface WebsiteIntroSectionProps {
  onNavigate: (route: StoreRoute) => void;
}

export const WebsiteIntroSection: React.FC<WebsiteIntroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" data-testid="website-intro">
      <div className="flex flex-wrap justify-center gap-2">
        {HOME_WEBSITE_LINK_IDS.map((id) => {
          const page = launchPageById(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className="min-h-[44px] px-4 rounded-none border border-[#1F1917] bg-transparent text-xs font-black uppercase tracking-wider hover:bg-[#1F1917] hover:text-white cursor-pointer"
            >
              {page.navLabel ?? page.title}
            </button>
          );
        })}
      </div>
      <MailingListSignup />
    </section>
  );
};
