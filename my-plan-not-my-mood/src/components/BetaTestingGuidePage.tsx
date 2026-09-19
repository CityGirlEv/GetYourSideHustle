import React, { useEffect, useMemo, useState } from 'react';
import { Gift, Shirt, TestTube, BookOpen } from 'lucide-react';
import { HEADER_CONTENT_OFFSET } from '../lib/headerClearance';
import {
  BETA_TESTING_GUIDE_BLESSING_NOTE,
  BETA_TESTING_GUIDE_INTRO,
  BETA_TESTING_GUIDE_KICKER,
  BETA_TESTING_GUIDE_META_DESCRIPTION,
  BETA_TESTING_GUIDE_META_TITLE,
  BETA_TESTING_GUIDE_SUBTITLE,
  BETA_TESTING_GUIDE_TITLE,
  betaGuideItemsByKind,
  betaGuideOffersHat,
  betaGuideOffersTee,
  type BetaGuideItem,
} from '../lib/betaTestingGuide';
import { BETA_REWARDS_PATH } from '../lib/betaRewards';
import {
  betaGuideBlessingPickLabel,
  loadBetaGuideBlessingPick,
  saveBetaGuideBlessingPick,
  toggleBetaGuideBlessingPick,
  type BetaGuideBlessingPick,
} from '../lib/betaGuideBlessingPick';
import {
  fetchBetaTestingGuideStore,
  loadBetaTestingGuideFromStorage,
  saveBetaTestingGuideToStorage,
} from '../lib/betaTestingGuideStore';
import { applyDocumentMeta } from '../lib/pageMeta';
import { Logo } from './Logo';

interface BetaTestingGuidePageProps {
  onApply?: () => void;
  onSeeRewards?: () => void;
}

function GuideItemCard({ item }: { item: BetaGuideItem }) {
  return (
    <article
      className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 space-y-2"
      data-testid={`beta-guide-item-${item.id}`}
    >
      <h3 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917]">{item.title}</h3>
      {item.body ? <p className="text-sm text-[#3F3832] font-medium leading-relaxed whitespace-pre-wrap">{item.body}</p> : null}
      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C2410C]">Added by {item.addedBy}</p>
    </article>
  );
}

export const BetaTestingGuidePage: React.FC<BetaTestingGuidePageProps> = ({ onApply, onSeeRewards }) => {
  const [items, setItems] = useState<BetaGuideItem[]>(() => loadBetaTestingGuideFromStorage());
  const [pick, setPick] = useState<BetaGuideBlessingPick>(() => loadBetaGuideBlessingPick());

  useEffect(() => {
    return applyDocumentMeta({
      title: BETA_TESTING_GUIDE_META_TITLE,
      description: BETA_TESTING_GUIDE_META_DESCRIPTION,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchBetaTestingGuideStore().then((remote) => {
      if (cancelled || !remote) return;
      setItems(remote.items);
      saveBetaTestingGuideToStorage(remote);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const steps = useMemo(() => betaGuideItemsByKind(items, 'step'), [items]);
  const blessings = useMemo(() => betaGuideItemsByKind(items, 'blessing'), [items]);
  const ideas = useMemo(() => betaGuideItemsByKind(items, 'idea'), [items]);
  const offerTee = betaGuideOffersTee(items);
  const offerHat = betaGuideOffersHat(items);

  const choose = (piece: 'tee' | 'hat') => {
    const next = toggleBetaGuideBlessingPick(pick, piece);
    setPick(next);
    saveBetaGuideBlessingPick(next);
  };

  return (
    <div
      className={`bg-[#FAF8F5] min-h-[60vh] ${HEADER_CONTENT_OFFSET}`}
      id="beta-testing-guide-page"
      data-testid="beta-testing-guide-page"
    >
      <section className="bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FEF3C7] text-[#9A3412] border-b-4 border-[#EA580C] py-4 sm:py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Logo variant="seal-only" size="sm" className="shrink-0 drop-shadow-lg !w-10 !h-10 sm:!w-12 sm:!h-12" />
            <div className="text-left space-y-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EA580C] text-white text-[10px] font-mono font-black uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" /> {BETA_TESTING_GUIDE_KICKER}
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase tracking-tight leading-tight text-[#9A3412]">
                {BETA_TESTING_GUIDE_TITLE}
              </h1>
              <p className="text-sm text-[#C2410C] font-medium leading-snug">{BETA_TESTING_GUIDE_SUBTITLE}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        <p className="text-sm text-[#3F3832] font-medium leading-relaxed">{BETA_TESTING_GUIDE_INTRO}</p>

        <div className="flex flex-wrap gap-2">
          {onApply ? (
            <button
              type="button"
              onClick={onApply}
              className="min-h-[44px] px-5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-black uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"
              data-testid="beta-guide-apply"
            >
              <TestTube className="w-4 h-4" /> Apply as a Beta Tester
            </button>
          ) : null}
          {onSeeRewards ? (
            <button
              type="button"
              onClick={onSeeRewards}
              className="min-h-[44px] px-5 rounded-xl bg-white border-2 border-[#1F1917] text-[#1F1917] text-xs font-black uppercase tracking-wider cursor-pointer"
              data-testid="beta-guide-rewards"
            >
              Plan Credits & reward levels
            </button>
          ) : (
            <a
              href={BETA_REWARDS_PATH}
              className="min-h-[44px] px-5 rounded-xl bg-white border-2 border-[#1F1917] text-[#1F1917] text-xs font-black uppercase tracking-wider inline-flex items-center"
            >
              Plan Credits & reward levels
            </a>
          )}
        </div>

        {steps.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917]">How to test</h2>
            {steps.map((item) => (
              <GuideItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : null}

        {blessings.length > 0 || offerTee || offerHat ? (
          <div className="space-y-3">
            <h2 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917] inline-flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#C2410C]" /> Thank-you blessing
            </h2>
            {blessings.map((item) => (
              <GuideItemCard key={item.id} item={item} />
            ))}
            <p className="text-sm text-[#3F3832] font-medium leading-relaxed">{BETA_TESTING_GUIDE_BLESSING_NOTE}</p>
            <div className="flex flex-wrap gap-2" data-testid="beta-guide-blessing-pick">
              {offerTee ? (
                <button
                  type="button"
                  aria-pressed={pick.tee}
                  onClick={() => choose('tee')}
                  className={`min-h-[44px] px-5 rounded-xl border-2 text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 ${
                    pick.tee
                      ? 'bg-[#C2410C] border-[#C2410C] text-white'
                      : 'bg-white border-[#1F1917] text-[#1F1917]'
                  }`}
                  data-testid="beta-guide-pick-tee"
                >
                  <Shirt className="w-4 h-4" /> Tee
                </button>
              ) : null}
              {offerHat ? (
                <button
                  type="button"
                  aria-pressed={pick.hat}
                  onClick={() => choose('hat')}
                  className={`min-h-[44px] px-5 rounded-xl border-2 text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 ${
                    pick.hat
                      ? 'bg-[#C2410C] border-[#C2410C] text-white'
                      : 'bg-white border-[#1F1917] text-[#1F1917]'
                  }`}
                  data-testid="beta-guide-pick-hat"
                >
                  Hat
                </button>
              ) : null}
            </div>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#C2410C]" data-testid="beta-guide-pick-label">
              Your pick: {betaGuideBlessingPickLabel(pick)}
            </p>
          </div>
        ) : null}

        {ideas.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917]">More from the house</h2>
            {ideas.map((item) => (
              <GuideItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
};
