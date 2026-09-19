import React, { useEffect } from 'react';
import { Ban, Coins, Gift, TestTube, Trophy, Zap } from 'lucide-react';
import { HEADER_CONTENT_OFFSET } from '../lib/headerClearance';
import {
  BETA_CREDIT_EARN_RULES,
  BETA_CREDIT_NAME,
  BETA_CREDIT_PRIORITY_ROWS,
  BETA_CREDIT_SPEND_RULES,
  BETA_CREDIT_ZERO_STATUSES,
  BETA_REPRO_FAIL_BONUS,
  BETA_RETEST_BONUS,
  BETA_REWARD_LEVELS,
  BETA_REWARDS_CONTACT,
  BETA_REWARDS_FAIR_PLAY,
  BETA_REWARDS_HOW_TO_JOIN,
  BETA_REWARDS_KICKER,
  BETA_REWARDS_META_DESCRIPTION,
  BETA_REWARDS_META_TITLE,
  BETA_REWARDS_SUBTITLE,
  BETA_REWARDS_TITLE,
} from '../lib/betaRewards';
import { applyDocumentMeta } from '../lib/pageMeta';
import { BETA_TESTING_GUIDE_PATH } from '../lib/betaTestingGuide';
import { HOUSE_BRAND_NAME } from '../lib/teeSalesPlaybook';
import { Logo } from './Logo';

interface BetaRewardsPageProps {
  onApply?: () => void;
  onSeeGuide?: () => void;
}

export const BetaRewardsPage: React.FC<BetaRewardsPageProps> = ({ onApply, onSeeGuide }) => {
  useEffect(() => {
    return applyDocumentMeta({
      title: BETA_REWARDS_META_TITLE,
      description: BETA_REWARDS_META_DESCRIPTION,
    });
  }, []);

  return (
    <div
      className={`bg-[#FAF8F5] min-h-[60vh] ${HEADER_CONTENT_OFFSET}`}
      id="beta-rewards-page"
      data-testid="beta-rewards-page"
    >
      <section className="bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FEF3C7] text-[#9A3412] border-b-4 border-[#EA580C] py-4 sm:py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Logo variant="seal-only" size="sm" className="shrink-0 drop-shadow-lg !w-10 !h-10 sm:!w-12 sm:!h-12" />
            <div className="text-left space-y-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EA580C] text-white text-[10px] font-mono font-black uppercase tracking-wider">
                <Coins className="w-3.5 h-3.5" /> {BETA_REWARDS_KICKER}
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase tracking-tight leading-tight text-[#9A3412]">
                {BETA_REWARDS_TITLE}
              </h1>
              <p className="text-sm text-[#C2410C] font-medium leading-snug">{BETA_REWARDS_SUBTITLE}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        <article className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917]">Who may participate</h2>
          <ul className="space-y-2 text-sm text-[#3F3832] font-medium leading-relaxed list-disc pl-5">
            {BETA_REWARDS_HOW_TO_JOIN.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
          {onApply ? (
            <button
              type="button"
              onClick={onApply}
              className="min-h-[44px] px-5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-black uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"
              data-testid="beta-rewards-apply"
            >
              <TestTube className="w-4 h-4" /> Apply as a Beta Tester
            </button>
          ) : null}
          {onSeeGuide ? (
            <button
              type="button"
              onClick={onSeeGuide}
              className="min-h-[44px] px-5 rounded-xl bg-white border-2 border-[#1F1917] text-[#1F1917] text-xs font-black uppercase tracking-wider cursor-pointer"
              data-testid="beta-rewards-guide"
            >
              Open the Beta Testing Guide
            </button>
          ) : (
            <a
              href={BETA_TESTING_GUIDE_PATH}
              className="min-h-[44px] px-5 rounded-xl bg-white border-2 border-[#1F1917] text-[#1F1917] text-xs font-black uppercase tracking-wider inline-flex items-center"
            >
              Open the Beta Testing Guide
            </a>
          )}
          </div>
        </article>

        <article className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917] inline-flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#C2410C]" /> How {BETA_CREDIT_NAME} are earned
          </h2>
          <p className="text-sm text-[#3F3832] font-medium leading-relaxed">
            Credits are <strong>{BETA_CREDIT_NAME}</strong> on your tester record — not cash and not a wage. A case must
            reach an eligible status with honest work.
          </p>
          <ul className="space-y-2 text-sm text-[#3F3832] font-medium leading-relaxed list-disc pl-5">
            {BETA_CREDIT_EARN_RULES.map((rule) => (
              <li key={rule.id}>
                <strong>{rule.title}.</strong> {rule.detail}
              </li>
            ))}
          </ul>
          <p
            className="text-sm font-semibold text-[#9A3412] bg-[#FFEDD5] border border-[#C2410C]/30 rounded-2xl px-4 py-3"
            data-testid="beta-rewards-zero-note"
          >
            <Ban className="w-4 h-4 inline-block mr-1 align-text-bottom" />
            <strong>{BETA_CREDIT_ZERO_STATUSES.join(', ')}</strong> earn <strong>0</strong> credits.
          </p>
        </article>

        <article className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917] inline-flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#C2410C]" /> Credit reward table
          </h2>
          <p className="text-sm text-[#3F3832] font-medium leading-relaxed">
            Token amount scales with Testing Portal priority:
          </p>
          <div className="overflow-x-auto -mx-1">
            <table
              className="w-full min-w-[32rem] text-left text-sm border-2 border-[#1F1917] rounded-2xl overflow-hidden"
              data-testid="beta-rewards-table"
            >
              <thead className="bg-[#FFEDD5] text-[#9A3412]">
                <tr>
                  <th scope="col" className="px-3 py-2 font-black uppercase tracking-wider text-[11px]">
                    Priority
                  </th>
                  <th scope="col" className="px-3 py-2 font-black uppercase tracking-wider text-[11px]">
                    Meaning
                  </th>
                  <th scope="col" className="px-3 py-2 font-black uppercase tracking-wider text-[11px]">
                    {BETA_CREDIT_NAME}
                  </th>
                </tr>
              </thead>
              <tbody className="text-[#1F1917]">
                {BETA_CREDIT_PRIORITY_ROWS.map((row) => (
                  <tr key={row.priority} className="border-t border-[#E5DFD3]">
                    <td className="px-3 py-2 font-black uppercase tracking-tight">{row.label}</td>
                    <td className="px-3 py-2 font-medium text-[#3F3832]">{row.meaning}</td>
                    <td className="px-3 py-2 font-black text-[#C2410C]">{row.credits}</td>
                  </tr>
                ))}
                <tr className="border-t border-[#E5DFD3]">
                  <td className="px-3 py-2 font-black uppercase tracking-tight" colSpan={2}>
                    Re-test bonus
                  </td>
                  <td className="px-3 py-2 font-black text-[#C2410C]">+{BETA_RETEST_BONUS}</td>
                </tr>
                <tr className="border-t border-[#E5DFD3]">
                  <td className="px-3 py-2 font-black uppercase tracking-tight" colSpan={2}>
                    First reproducible Fail bonus
                  </td>
                  <td className="px-3 py-2 font-black text-[#C2410C]">+{BETA_REPRO_FAIL_BONUS}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917] inline-flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#C2410C]" /> How credits are used
          </h2>
          <ul className="space-y-2 text-sm text-[#3F3832] font-medium leading-relaxed list-disc pl-5">
            {BETA_CREDIT_SPEND_RULES.map((rule) => (
              <li key={rule.id}>
                <strong>{rule.title}.</strong> {rule.detail}
              </li>
            ))}
          </ul>
        </article>

        <article className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917] inline-flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#C2410C]" /> Reward levels
          </h2>
          <p className="text-sm text-[#3F3832] font-medium leading-relaxed">
            Volume of eligible tests (Passed or documented Failed) sets your level. {HOUSE_BRAND_NAME} may also announce
            a round-specific gift or shout-out.
          </p>
          <ul className="space-y-2 text-sm text-[#3F3832] font-medium leading-relaxed list-disc pl-5" data-testid="beta-rewards-levels">
            {BETA_REWARD_LEVELS.map((level) => (
              <li key={level.id}>
                <strong>{level.label}</strong>
                {level.minTests > 0 ? ` (${level.minTests}+ tests)` : ''} — {level.blurb}
              </li>
            ))}
          </ul>
        </article>

        <article className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 space-y-2">
          <h2 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917]">Fair play</h2>
          <p className="text-sm text-[#3F3832] font-medium leading-relaxed">{BETA_REWARDS_FAIR_PLAY}</p>
          <p className="text-sm text-[#3F3832] font-medium leading-relaxed">{BETA_REWARDS_CONTACT}</p>
        </article>
      </section>
    </div>
  );
};
