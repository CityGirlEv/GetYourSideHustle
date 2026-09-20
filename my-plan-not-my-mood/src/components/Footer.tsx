import React from 'react';
import { CheckSquare } from 'lucide-react';
import { getAppVersionLabel, getAppVersionStamp } from '../lib/appVersion';
import { StoreRoute } from '../lib/storeRoutes';
import { FOOTER_COMMON_LINK_IDS, launchPageById } from '../lib/launchPages';
import { GEAR_SHOP_LABEL } from '../lib/gearSelections';
import { HOUSE_FOOTER_LINE } from '../lib/teeSalesPlaybook';
import { ComingSoonBadge } from './ComingSoonBadge';

interface FooterProps {
  onScrollToSection: (id: string) => void;
  onNavigate: (route: StoreRoute) => void;
  onOpenChallenge: () => void;
  onOpenJoin: () => void;
  hasMembershipAccess?: boolean;
  showMemberships?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onScrollToSection,
  onNavigate,
  onOpenChallenge,
  onOpenJoin,
  hasMembershipAccess = false,
  showMemberships = false,
}) => {
  return (
    <footer className="bg-[#F6F0E6] border-t border-earth-taupe text-earth-muted py-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8 pb-8 border-b border-earth-taupe">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded bg-earth-terracotta text-white flex items-center justify-center font-black">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span className="font-black text-sm text-earth-espresso uppercase tracking-tight">
                MY PLAN, <span className="text-earth-terracotta">NOT MY MOOD</span>
              </span>
            </div>
            <p className="text-earth-muted leading-relaxed">
              {HOUSE_FOOTER_LINE} — {getAppVersionLabel()}.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold text-earth-espresso uppercase tracking-wider mb-3">
              Shop Collections
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <button
                  type="button"
                  data-testid="footer-gear"
                  onClick={() => onNavigate('gear')}
                  className="hover:text-earth-terracotta cursor-pointer"
                >
                  {GEAR_SHOP_LABEL}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-testid="footer-planners"
                  onClick={() => onNavigate('planners')}
                  className="hover:text-earth-terracotta cursor-pointer"
                >
                  Planners & Desk Pads
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-testid="footer-collections"
                  onClick={() => onNavigate('gear')}
                  className="hover:text-earth-terracotta cursor-pointer"
                >
                  All Collections
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-testid="footer-sitemap"
                  onClick={() => onNavigate('sitemap')}
                  className="hover:text-earth-terracotta cursor-pointer min-h-[44px]"
                >
                  Site Map
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold text-earth-espresso uppercase tracking-wider mb-3">
              Common Links
            </h4>
            <ul className="space-y-2 font-medium">
              {FOOTER_COMMON_LINK_IDS.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(id)}
                    className="hover:text-earth-terracotta cursor-pointer min-h-[44px]"
                    data-testid={`footer-${id}`}
                  >
                    {launchPageById(id).navLabel ?? launchPageById(id).title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold text-earth-espresso uppercase tracking-wider mb-3">
              Brand Features
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <button
                  type="button"
                  data-testid="footer-pay"
                  onClick={() => onNavigate('pay')}
                  className="hover:text-earth-terracotta cursor-pointer text-earth-terracotta font-bold min-h-[44px]"
                >
                  Make Payment
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('beta-rewards')}
                  className="hover:text-earth-terracotta cursor-pointer min-h-[44px]"
                  data-testid="footer-beta-rewards"
                >
                  Beta Tester Rewards
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('beta-guide')}
                  className="hover:text-earth-terracotta cursor-pointer min-h-[44px]"
                  data-testid="footer-beta-guide"
                >
                  Beta Testing Guide
                </button>
              </li>
              {showMemberships && (
              <li>
                <button onClick={onOpenJoin} className="hover:text-earth-terracotta cursor-pointer text-earth-terracotta font-bold inline-flex items-center gap-1.5 min-h-[44px]">
                  Join Membership
                  <ComingSoonBadge />
                </button>
              </li>
              )}
              <li>
                <button
                  type="button"
                  data-testid="footer-mood"
                  onClick={() => onScrollToSection('mood-tool')}
                  className="hover:text-earth-terracotta cursor-pointer"
                >
                  Is Your Mood Your Plan? Tool
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-testid="footer-receipts"
                  onClick={() => onScrollToSection('receipts')}
                  className="hover:text-earth-terracotta cursor-pointer"
                >
                  "What Won Today?" Receipt Builder
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-testid="footer-challenge"
                  onClick={hasMembershipAccess ? onOpenChallenge : onOpenJoin}
                  className="hover:text-earth-terracotta cursor-pointer text-earth-terracotta font-bold"
                >
                  {hasMembershipAccess ? 'Free 7-Day Reset Challenge' : '7-Day Challenge (Join to Unlock)'}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold text-earth-espresso uppercase tracking-wider mb-3">
              Alpha Build & Data Provenance
            </h4>
            <p className="text-earth-muted leading-relaxed mb-2">
              <strong className="text-earth-terracotta font-mono uppercase">{getAppVersionLabel()} DEMO MODE:</strong> Interactive alpha demonstration. All orders, reviews, and test statistics are marked as demonstration data.
            </p>
            <div className="text-[10px] text-earth-muted font-mono">
              Build {getAppVersionStamp()}
            </div>
            <div className="text-[10px] text-earth-muted font-mono mt-1">
              © {new Date().getFullYear()} MY PLAN, NOT MY MOOD. All rights reserved.
            </div>
          </div>
        </div>

        <nav
          aria-label="Common links"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-5"
          data-testid="footer-common-links"
        >
          {FOOTER_COMMON_LINK_IDS.map((id) => (
            <button
              key={`bar-${id}`}
              type="button"
              onClick={() => onNavigate(id)}
              className="min-h-[44px] text-[11px] font-black uppercase tracking-wider text-earth-espresso hover:text-earth-terracotta cursor-pointer"
            >
              {launchPageById(id).navLabel ?? launchPageById(id).title}
            </button>
          ))}
        </nav>

        {/* Powered by Munties AI Agents Pill Badge & Confidentiality Note */}
        <div className="flex flex-col items-center justify-center pt-2 pb-4 space-y-3">
          <a
            href="http://www.muntiesaiagents.com/MyPlan"
            target="_blank"
            rel="noopener noreferrer"
            title="http://www.MuntiesAIAgents.com/MyPlan"
            className="bg-white border-2 border-[#1F1917] hover:border-[#C2410C] rounded-full px-5 py-2 inline-flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer group"
          >
            <span className="font-sans font-bold text-xs text-[#1F1917] tracking-tight">
              Powered by <span className="text-[#C2410C] font-black">Munties AI Agents</span>
            </span>
            <img
              src="/images/munties_ai_agents_logo.png"
              alt="Munties AI Agents Logo"
              className="h-6 sm:h-7 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
          </a>
          <div className="text-[10px] font-mono text-[#3F3832] text-center max-w-2xl px-4">
            <strong>CONFIDENTIALITY & PROPRIETARY NOTICE:</strong> MY PLAN, NOT MY MOOD ™ and Munties AI Agents. Proprietary strategy and brand architecture. Unauthorized distribution or copying is strictly prohibited.
          </div>
        </div>
      </div>
    </footer>
  );
};
