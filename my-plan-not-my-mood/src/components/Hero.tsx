import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, Flame, RefreshCw } from 'lucide-react';
import { MOOD_OPTIONS, MoodOption } from '../data/moods';
import { SessionType } from '../data/affirmations';
import { MoodShakePanel } from './MoodShakePanel';
import { DailyAffirmationsWidget } from './DailyAffirmationsWidget';
import { HomePillarSeal } from './HomePillarSeals';
import { MovementCarousel } from './MovementCarousel';
import {
  HOME_HERO_IMAGE,
  HOME_HERO_IMAGE_ALT,
  HOME_HERO_JOIN_HOTSPOT,
  HOME_HERO_SHOP_HREF,
  HOME_HERO_SHOP_HOTSPOT,
  HOME_MOVEMENT_IMAGE_ALT,
  homeHeroHotspotStyle,
  fetchHomePageCopyStore,
  loadHomePageCopy,
  persistHomePageCopy,
  type HomePageCopy,
} from '../lib/homePageCopy';
import {
  HOME_WHO_WON_TODAY_LABEL,
  HOME_WHO_WON_TODAY_POP_CLASS,
  HOME_WHO_WON_TODAY_TARGET,
  homeMoodLabelDisplay,
  homeMoodTitleDisplay,
  homeMovementTitleDisplay,
  homePillarDisplay,
} from '../lib/homePillars';
import { FancySectionHeading } from './FancySectionHeading';
import { HOME_WEBSITE_LINK_IDS, launchPageById } from '../lib/launchPages';
import type { StoreRoute } from '../lib/storeRoutes';
import { JOIN_THE_MOVEMENT_LABEL } from '../lib/mailingList';

interface HeroProps {
  onScrollToSection: (id: string) => void;
  onNavigateToGear?: () => void;
  onOpenChallenge: () => void;
  onOpenJoin?: () => void;
  onOpenAffirmations?: (sessionType?: SessionType) => void;
  onOpenAbout?: () => void;
  onNavigate?: (route: StoreRoute) => void;
  hasMembershipAccess?: boolean;
  membershipsVisible?: boolean;
  canManageMovementCarousel?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToSection,
  onNavigateToGear,
  onOpenJoin,
  onOpenAffirmations,
  onOpenAbout,
  onNavigate,
  hasMembershipAccess = false,
  membershipsVisible = false,
  canManageMovementCarousel = false,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [copy, setCopy] = useState<HomePageCopy>(() => loadHomePageCopy());

  useEffect(() => {
    let cancelled = false;
    void fetchHomePageCopyStore().then((payload) => {
      if (cancelled || !payload) return;
      persistHomePageCopy(payload.copy);
      setCopy(payload.copy);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const shown = copy;

  const handlePillar = (index: number) => {
    if (index === 0) {
      onNavigateToGear ? onNavigateToGear() : onScrollToSection('receipts');
      return;
    }
    if (index === 1) {
      onScrollToSection('mood-tool');
      return;
    }
    if (index === 2) {
      onOpenAbout?.();
      return;
    }
    if (index === 3) {
      onOpenAffirmations?.();
      return;
    }
    onOpenJoin?.();
  };

  const openJoin = () => (onOpenJoin ? onOpenJoin() : onScrollToSection('movement'));
  const openShop = (event?: { preventDefault: () => void }) => {
    event?.preventDefault();
    if (onNavigateToGear) onNavigateToGear();
    else onScrollToSection('receipts');
  };

  return (
    <section id="hero" className="relative overflow-x-hidden bg-[#F6F0E6]" data-testid="home-marketing">
      <div className="w-full bg-[#F3EBE0]" data-testid="home-hero-bleed">
        <div className="home-hero-frame grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_11.5rem] sm:grid-rows-[auto_auto] items-stretch">
            <div className="home-hero-shot">
              <h1 className="sr-only">{shown.titleLead} {shown.titleAccent}</h1>
              <p className="sr-only">{shown.lede}</p>
              <p className="sr-only">{shown.feelIt}</p>
              <img
                src={HOME_HERO_IMAGE}
                alt={HOME_HERO_IMAGE_ALT}
                className="block w-full h-auto"
                data-testid="home-hero-image"
              />
              <div className="absolute inset-0">
                <button
                  type="button"
                  data-testid="home-cta-explore"
                  aria-label={shown.primaryCta}
                  onClick={openJoin}
                  style={homeHeroHotspotStyle(HOME_HERO_JOIN_HOTSPOT)}
                  className="absolute z-10 rounded-xl bg-transparent cursor-pointer hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]"
                >
                  <span className="sr-only">{shown.primaryCta}</span>
                </button>
                <a
                  href={HOME_HERO_SHOP_HREF}
                  data-testid="home-cta-shop"
                  aria-label={shown.secondaryCta}
                  onClick={openShop}
                  style={homeHeroHotspotStyle(HOME_HERO_SHOP_HOTSPOT)}
                  className="absolute z-20 rounded-xl bg-transparent cursor-pointer hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F1917]"
                >
                  <span className="sr-only">{shown.secondaryCta}</span>
                </a>
              </div>
            </div>

          <aside
            data-testid="home-pillars"
            className="home-pillar-rail sm:row-span-2 min-h-0 text-[#1F1917] grid grid-cols-5 sm:grid-cols-1 sm:grid-rows-5"
          >
            {shown.pillars.map((title, index) => {
              const display = homePillarDisplay(index, title);
              return (
              <button
                key={`${title}-${index}`}
                type="button"
                data-testid={`home-pillar-${index}`}
                onClick={() => handlePillar(index)}
                className="group flex flex-col items-center justify-center text-center gap-0 min-h-[72px] min-w-0 sm:min-h-0 sm:h-full px-0.5 py-1.5 sm:px-2 sm:py-1 overflow-hidden cursor-pointer transition-colors hover:bg-[#F3EBE0]"
              >
                <span className="inline-flex transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5">
                  <HomePillarSeal index={index} />
                </span>
                {display.kicker ? (
                  <span className="home-pillar-kicker hidden sm:block max-w-[8.5rem] px-0.5">
                    {display.kicker}
                  </span>
                ) : null}
                <span
                  data-testid={`home-pillar-script-${index}`}
                  className="home-pillar-script block max-w-full px-0.5 leading-tight"
                >
                  {display.script}
                </span>
                <span className="sr-only">{title}</span>
              </button>
              );
            })}
          </aside>

            <div
              id="mood-tool"
              data-testid="home-mood-rail"
              className="home-pillar-rail h-full min-h-0 min-w-0 overflow-x-hidden flex flex-col justify-center border-t-2 border-[#C4A050] px-2 sm:px-5 pt-4 pb-3 sm:border-t-[16px] sm:border-[#F3EBE0] sm:pt-2.5 sm:pb-2.5"
            >
              <p data-testid="home-mood-banner" className="sr-only">{shown.moodBanner}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 pb-2 sm:pb-1">
                <Flame className="w-5 h-5 text-[#C2410C] shrink-0" aria-hidden />
                <FancySectionHeading
                  title={shown.moodTitle}
                  display={homeMoodTitleDisplay(shown.moodTitle)}
                  testId="home-mood-title"
                  align="center"
                />
              </div>
              <p data-testid="home-mood-lede" className="sr-only">{shown.moodLede}</p>
              <div
                id="mood-hero-bubbles"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 w-full min-w-0 justify-items-center"
                data-testid="mood-hero-bubbles"
              >
                <div id="mood-area-buttons" className="contents" data-testid="mood-area-buttons">
                  {MOOD_OPTIONS.map((mood) => {
                    const isSelected = selectedMood?.id === mood.id;
                    return (
                      <button
                        key={mood.id}
                        type="button"
                        id={`mood-area-${mood.id}`}
                        data-testid={`mood-hero-bubble-${mood.id}`}
                        onClick={() => setSelectedMood(mood)}
                        className={`min-h-[52px] sm:min-h-[44px] min-w-0 w-full max-w-full overflow-hidden rounded-xl border-0 text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 px-2 py-2 sm:px-0.5 sm:py-1 ${
                          isSelected
                            ? 'is-mood-selected bg-[#EA580C] text-white font-extrabold'
                            : 'bg-transparent text-[#1F1917] hover:bg-[#F3EBE0]'
                        }`}
                      >
                        <span className="text-2xl sm:text-3xl leading-none" aria-hidden>
                          {mood.emoji}
                        </span>
                        <span className="home-mood-label">
                          {homeMoodLabelDisplay(mood.label)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <p data-testid="home-mood-quote" className="sr-only">{shown.moodQuote}</p>
            </div>
        </div>
        {selectedMood ? (
          <div className="w-full px-3 sm:px-4 pb-3 relative text-left">
            <button
              type="button"
              onClick={() => setSelectedMood(null)}
              className="absolute top-1 right-3 z-10 min-h-[44px] px-3 text-xs text-[#3F3832] hover:text-[#1F1917] inline-flex items-center gap-1 cursor-pointer font-mono font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <MoodShakePanel mood={selectedMood} hasMembershipAccess={hasMembershipAccess} onUnlock={onOpenJoin} />
          </div>
        ) : null}
      </div>

      <div
        className="w-full bg-[#F6F0E6] py-2 sm:py-5"
        data-testid="home-mood-movement-gap"
        aria-hidden="true"
      >
        <div className="h-px w-full bg-[#E8C49A]" />
      </div>

      <div className="w-full bg-[#F7F1E8]">
      <div
        id="movement"
        className="home-hero-frame grid grid-cols-1 md:grid-cols-[minmax(20rem,42%)_minmax(0,1fr)] items-start md:items-stretch"
        data-testid="home-movement"
      >
        <MovementCarousel alt={HOME_MOVEMENT_IMAGE_ALT} canManage={canManageMovementCarousel} />
        <div className="text-[#1F1917] px-5 pt-6 pb-4 sm:px-8 md:pt-0 lg:px-12 flex flex-col justify-start gap-5 min-w-0 h-full">
          <div className="flex flex-col gap-3">
            <p data-testid="home-movement-kicker" className="home-heading-kicker">
              {shown.movementKicker}
            </p>
            <FancySectionHeading
              title={shown.movementTitle}
              display={homeMovementTitleDisplay(shown.movementTitle)}
              testId="home-movement-title"
              align="left"
              trailing={
                <button
                  type="button"
                  data-testid="home-who-won-today"
                  onClick={() => onScrollToSection(HOME_WHO_WON_TODAY_TARGET)}
                  className={`${HOME_WHO_WON_TODAY_POP_CLASS} min-h-[44px] shrink-0 inline-flex items-center gap-1 px-3 sm:px-3.5 rounded-full bg-[#C2410C] text-white text-[11px] sm:text-sm font-black uppercase tracking-wider ring-2 ring-[#FDBA74] hover:bg-[#9A3412] cursor-pointer`}
                >
                  {HOME_WHO_WON_TODAY_LABEL}
                  <ArrowDown className="w-4 h-4" aria-hidden="true" />
                </button>
              }
            />
            <p data-testid="home-movement-body" className="text-base sm:text-lg lg:text-xl leading-relaxed text-[#3F3832] max-w-2xl lg:max-w-3xl">
              {shown.movementBody}
            </p>
          </div>
          <DailyAffirmationsWidget
            layout="inline"
            onOpenAffirmations={(session) => onOpenAffirmations?.(session)}
            hasMembershipAccess={hasMembershipAccess}
            onOpenJoin={onOpenJoin}
            membershipsVisible={membershipsVisible}
          />
          <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            data-testid="home-movement-cta"
            onClick={() => onOpenAbout?.()}
            className="self-center min-h-[44px] inline-flex items-center gap-2 text-sm lg:text-base font-black uppercase tracking-[0.16em] text-[#C2410C] border-b-2 border-[#C2410C] pb-1"
          >
            {shown.movementCta}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            data-testid="home-join-movement"
            onClick={() => onScrollToSection('mailing-list')}
            className="min-h-[44px] px-5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            {JOIN_THE_MOVEMENT_LABEL}
          </button>
          </div>
          <div
            className="flex flex-wrap justify-center gap-2"
            data-testid="home-website-links"
          >
            {HOME_WEBSITE_LINK_IDS.map((id) => {
              const page = launchPageById(id);
              return (
                <button
                  key={id}
                  type="button"
                  data-testid={`home-website-link-${id}`}
                  onClick={() => (onNavigate ? onNavigate(id) : id === 'about' ? onOpenAbout?.() : undefined)}
                  className="min-h-[44px] px-4 rounded-none border border-[#1F1917] bg-transparent text-xs font-black uppercase tracking-wider hover:bg-[#1F1917] hover:text-white cursor-pointer"
                >
                  {page.navLabel ?? page.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default Hero;
