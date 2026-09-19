import React, { useState } from 'react';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { MOOD_OPTIONS, MoodOption } from '../data/moods';
import { HeroCarousel } from './HeroCarousel';
import { GEAR_SHOP_LABEL } from '../lib/gearSelections';
import { MoodShakePanel } from './MoodShakePanel';
import { HOUSE_BRAND_KICKER } from '../lib/teeSalesPlaybook';
import { MoodWorkflowMap } from './MoodWorkflowMap';

interface HeroProps {
  onScrollToSection: (id: string) => void;
  onNavigateToGear?: () => void;
  onOpenCarouselProduct?: (path: string) => void;
  onOpenChallenge: () => void;
  onOpenJoin?: () => void;
  onOpenAffirmations?: () => void;
  canManageHero?: boolean;
  hasMembershipAccess?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToSection,
  onNavigateToGear,
  onOpenCarouselProduct,
  onOpenJoin,
  canManageHero = false,
  hasMembershipAccess = false,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);

  return (
    <section id="hero" className="relative pt-2 sm:pt-2.5 pb-4 overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative z-0 space-y-3 text-center">
        <HeroCarousel
          canManage={canManageHero}
          onOpenProduct={onOpenCarouselProduct}
          aside={
            <div className="h-full flex flex-col gap-2 text-left">
              <div className="space-y-1.5 sm:space-y-2 text-left">
                <p
                  className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-[0.2em] text-[#C2410C]"
                  data-testid="house-brand-kicker"
                >
                  {HOUSE_BRAND_KICKER}
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#1F1917] tracking-tight leading-tight uppercase">
                  MY PLAN, <span className="font-serif italic font-extrabold text-[#C2410C]">NOT MY MOOD</span>
                </h1>
                <div className="text-xs sm:text-sm font-sans font-black text-[#1F1917] tracking-tight uppercase leading-snug space-y-1.5">
                  <div>DO NOT LET A TEMPORARY MOOD DETERMINE A PERMANENT OUTCOME.</div>
                  <div className="text-[#C2410C] font-black">FEEL IT. FOLLOW THE PLAN ANYWAY.</div>
                </div>
              </div>

              <div className="bg-white border-2 border-[#1F1917] rounded-3xl p-4 shadow-xl space-y-3 glow-pop flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => onScrollToSection('mood-tool')}
                    className="flex-1 min-h-[44px] py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#1F1917] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    What&apos;s Your Mood Today?
                  </button>
                  <button
                    type="button"
                    onClick={() => (onNavigateToGear ? onNavigateToGear() : onScrollToSection('receipts'))}
                    className="flex-1 min-h-[44px] py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer border-2 border-[#FDBA74]"
                  >
                    {GEAR_SHOP_LABEL}
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                <div className="space-y-0.5 text-center border-b border-[#E5DFD3] pb-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-black text-[#C2410C] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> INTERACTIVE MOOD MATRIX
                  </div>
                  <h3 className="text-sm font-black text-[#1F1917] uppercase">Select Your Current Mood</h3>
                </div>

                <div id="mood-hero-bubbles" className="grid grid-cols-1 gap-2 flex-1" data-testid="mood-hero-bubbles">
                  {MOOD_OPTIONS.map((moodOption) => {
                    const isSelected = selectedMood?.id === moodOption.id;
                    return (
                      <button
                        key={`side-bubble-${moodOption.id}`}
                        type="button"
                        data-testid={`mood-hero-bubble-${moodOption.id}`}
                        onClick={() => {
                          setSelectedMood(moodOption);
                          document.getElementById('mood-tool')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-full min-h-[44px] text-left px-3.5 py-2 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#C2410C] text-white border-[#1F1917] shadow-md ring-2 ring-amber-300 scale-[1.01]'
                            : 'bg-[#FAF8F5] hover:bg-[#FFEDD5] text-[#1F1917] border-[#1F1917]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{moodOption.emoji}</span>
                          <span className="font-mono font-black text-xs uppercase tracking-wider">
                            {moodOption.label}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                            isSelected ? 'bg-white text-[#C2410C]' : 'bg-[#E5DFD3] text-[#1F1917]'
                          }`}
                        >
                          {isSelected ? 'ACTIVE' : 'SELECT'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          }
        />

        <div id="mood-tool" className="max-w-4xl mx-auto pt-2 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white border-2 border-[#1F1917] px-5 py-1.5 rounded-2xl shadow-sm">
            <Sparkles className="w-5 h-5 text-[#C2410C]" />
            <span className="text-base sm:text-lg font-black text-[#1F1917] tracking-wider uppercase font-mono">
              WHAT&apos;S YOUR MOOD TODAY?
            </span>
          </div>

          <div className="text-xs font-mono font-bold text-[#3F3832] uppercase tracking-widest">
            Select how you feel. Get tips to shake it — not a shirt.
          </div>

          <MoodWorkflowMap variant="compact" />

          <div id="mood-area-buttons" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5" data-testid="mood-area-buttons">
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = selectedMood?.id === mood.id;
              return (
                <button
                  key={mood.id}
                  type="button"
                  id={`mood-area-${mood.id}`}
                  data-testid={`mood-area-button-${mood.id}`}
                  onClick={() => setSelectedMood(mood)}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[44px] ${
                    isSelected
                      ? 'bg-[#EA580C] text-white border-[#FDBA74] font-extrabold shadow-xl scale-105'
                      : 'bg-white border-[#E5DFD3] text-[#1F1917] hover:border-[#1F1917] hover:bg-[#FAF8F5] shadow-sm'
                  }`}
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-xs tracking-wider uppercase font-mono font-bold">
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedMood ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setSelectedMood(null)}
                className="absolute -top-1 right-0 z-10 min-h-[44px] px-3 text-xs text-[#3F3832] hover:text-[#1F1917] inline-flex items-center gap-1 cursor-pointer font-mono font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
              <MoodShakePanel
                mood={selectedMood}
                hasMembershipAccess={hasMembershipAccess}
                onUnlock={onOpenJoin}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default Hero;
