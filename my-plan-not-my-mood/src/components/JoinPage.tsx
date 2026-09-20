import React from 'react';
import {
  Sparkles,
  Users,
  GraduationCap,
  Crown,
  CheckCircle2,
  Lock,
  HeartHandshake,
  Calendar,
  Mic,
} from 'lucide-react';
import { MEMBERSHIP_TIERS, MembershipTier, AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE } from '../lib/membership';
import { HEADER_COMPACT_PAGE_OFFSET } from '../lib/headerClearance';
import { PAGE_CANVAS_CLASS } from '../lib/brandUi';
import { Logo } from './Logo';

const TIER_ICONS: Record<string, React.ReactNode> = {
  starter: <Sparkles className="w-5 h-5" />,
  accountability: <Users className="w-5 h-5" />,
  mentorship: <HeartHandshake className="w-5 h-5" />,
  executive: <Crown className="w-5 h-5" />,
};

interface JoinPageProps {
  onJoinTier: (tier: MembershipTier) => void;
  hasMembershipAccess: boolean;
  onOpenAffirmations?: () => void;
  onOpenChallenge?: () => void;
}

export const JoinPage: React.FC<JoinPageProps> = ({
  hasMembershipAccess,
  onOpenAffirmations,
  onOpenChallenge,
}) => {
  return (
    <div className={`${PAGE_CANVAS_CLASS} min-h-[60vh] ${HEADER_COMPACT_PAGE_OFFSET}`} id="join-page" data-testid="join-page">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FEF3C7] text-[#9A3412] border-b-4 border-[#EA580C] py-2.5 sm:py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Logo
              variant="seal-only"
              size="sm"
              className="shrink-0 drop-shadow-lg !w-8 !h-8 sm:!w-12 sm:!h-12"
            />
            <div className="text-left min-w-0 space-y-1">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EA580C] text-white text-[9px] font-mono font-black uppercase tracking-wider leading-none">
                <Lock className="w-3 h-3" /> Coming Soon
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black uppercase tracking-tight leading-none text-[#9A3412]">
                Memberships — <span className="text-[#C2410C] italic">Coming Soon</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#C2410C] font-medium max-w-2xl leading-snug">
                Phase 1 is the gear launch. Member accounts, tiers, and access are not configured yet.
                Shop shirts now — memberships open in Phase 2.
              </p>
              <p
                className="text-xs sm:text-sm text-[#9A3412] font-medium max-w-2xl leading-snug"
                data-testid="affirmations-scope-note"
              >
                {AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Unlocked quick access */}
      {hasMembershipAccess && (onOpenAffirmations || onOpenChallenge) && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-[#10B981]/10 border-2 border-[#10B981] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-[#10B981] shrink-0" />
              <div>
                <div className="text-sm font-black uppercase text-[#1F1917]">You&apos;re In — Member Access Active</div>
                <div className="text-xs text-[#3F3832] font-medium">Your perks are unlocked. Jump in below.</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {onOpenAffirmations && (
                <button
                  type="button"
                  onClick={onOpenAffirmations}
                  className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-xl text-xs font-black uppercase cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Affirmations
                </button>
              )}
              {onOpenChallenge && (
                <button
                  type="button"
                  onClick={onOpenChallenge}
                  className="px-4 py-2 bg-white border-2 border-[#1F1917] text-[#1F1917] hover:bg-[#FFEDD5] rounded-xl text-xs font-black uppercase cursor-pointer"
                >
                  7-Day Challenge
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Perks overview strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { icon: <Mic className="w-4 h-4" />, label: 'Mentorship' },
            { icon: <Users className="w-4 h-4" />, label: 'Accountability Sessions' },
            { icon: <GraduationCap className="w-4 h-4" />, label: 'Workshops' },
            { icon: <Calendar className="w-4 h-4" />, label: 'Live Events' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border-2 border-[#E5DFD3] rounded-2xl p-4 text-center space-y-2"
            >
              <div className="mx-auto w-9 h-9 rounded-xl bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center">
                {item.icon}
              </div>
              <div className="text-[10px] sm:text-xs font-black uppercase text-[#1F1917]">{item.label}</div>
              <div className="text-[9px] font-mono text-[#3F3832] uppercase">Coming online</div>
            </div>
          ))}
        </div>

        {/* Tier cards */}
        <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#1F1917] font-serif text-center mb-2">
          Memberships Coming Soon
        </h2>
        <p className="text-center text-sm text-[#3F3832] font-medium mb-8 max-w-2xl mx-auto">
          Tiers below are a preview only. Checkout and member setup wait for Phase 2.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {MEMBERSHIP_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`rounded-3xl border-2 p-5 sm:p-6 flex flex-col shadow-lg transition-transform hover:scale-[1.02] ${
                tier.highlight
                  ? 'bg-[#FFEDD5] border-[#C2410C] ring-2 ring-[#C2410C]/30'
                  : 'bg-white border-[#1F1917]'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`p-2 rounded-xl ${
                    tier.highlight ? 'bg-[#C2410C] text-white' : 'bg-[#FAF8F5] text-[#C2410C] border border-[#E5DFD3]'
                  }`}
                >
                  {TIER_ICONS[tier.id]}
                </span>
                {tier.highlight && (
                  <span className="text-[9px] font-mono font-black uppercase bg-[#C2410C] text-white px-2 py-0.5 rounded-lg">
                    Start Here
                  </span>
                )}
              </div>

              <h3 className="text-lg font-black uppercase text-[#1F1917]">{tier.name}</h3>
              <div className="text-2xl font-black text-[#C2410C] font-serif my-1">{tier.priceLabel}</div>
              <p className="text-xs text-[#3F3832] font-medium mb-4">{tier.tagline}</p>

              <ul className="space-y-2 flex-1 mb-5">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-xs text-[#1F1917] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled
                aria-disabled="true"
                className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 bg-[#E5DFD3] text-[#3F3832] border-[#E5DFD3] cursor-not-allowed"
              >
                Coming Soon
                <Lock className="w-3.5 h-3.5" />
              </button>
            </article>
          ))}
        </div>

        <p
          className="text-center text-[10px] font-mono text-[#3F3832] uppercase tracking-wider mt-8 max-w-3xl mx-auto"
          data-testid="affirmations-scope-note-footer"
        >
          Paid tiers are preliminary placeholders — checkout and scheduling wait for Phase 2.
          {AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE}
        </p>
      </section>
    </div>
  );
};

export default JoinPage;
