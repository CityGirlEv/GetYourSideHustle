import React from 'react';
import type { StoreRoute } from '../lib/storeRoutes';
import { MailingListSignup } from './MailingListSignup';

interface WebsiteIntroSectionProps {
  onNavigate: (route: StoreRoute) => void;
}

export const WebsiteIntroSection: React.FC<WebsiteIntroSectionProps> = ({ onNavigate: _onNavigate }) => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3 sm:pt-6 sm:pb-4 space-y-6" data-testid="website-intro">
      <MailingListSignup />
    </section>
  );
};
