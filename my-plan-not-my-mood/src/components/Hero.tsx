import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Flame, Heart, RefreshCw, Shirt, Sparkles, Users } from 'lucide-react';
import { MOOD_OPTIONS, MoodOption } from '../data/moods';
import { MoodShakePanel } from './MoodShakePanel';
import { MoodWorkflowMap } from './MoodWorkflowMap';
import { HomeEditableField } from './HomeEditableField';
import {
  DEFAULT_HOME_PAGE_COPY,
  HOME_HERO_IMAGE,
  HOME_HERO_IMAGE_ALT,
  HOME_MOVEMENT_IMAGE,
  HOME_MOVEMENT_IMAGE_ALT,
  buildHomePageCopyStorePayload,
  fetchHomePageCopyStore,
  loadHomePageCopy,
  mergeHomePageCopy,
  patchHomePageCopy,
  patchHomePagePillar,
  persistHomePageCopy,
  quoteParts,
  saveHomePageCopyStore,
  type HomePageCopy,
} from '../lib/homePageCopy';

const PILLAR_ICONS = [
  <Shirt key="mindset" className="w-6 h-6" aria-hidden />,
  <Sparkles key="tools" className="w-6 h-6" aria-hidden />,
  <BookOpen key="resources" className="w-6 h-6" aria-hidden />,
  <Heart key="encouragement" className="w-6 h-6" aria-hidden />,
  <Users key="stronger" className="w-6 h-6" aria-hidden />,
];

const QUOTE_PHOTO = '/images/multicultural_hero_moods_bg.jpg';

interface HeroProps {
  onScrollToSection: (id: string) => void;
  onNavigateToGear?: () => void;
  onOpenCarouselProduct?: (path: string) => void;
  onOpenChallenge: () => void;
  onOpenJoin?: () => void;
  onOpenAffirmations?: () => void;
  onOpenAbout?: () => void;
  canManageHero?: boolean;
  hasMembershipAccess?: boolean;
  editorName?: string | null;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToSection,
  onNavigateToGear,
  onOpenJoin,
  onOpenAffirmations,
  onOpenAbout,
  canManageHero = false,
  hasMembershipAccess = false,
  editorName = null,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [copy, setCopy] = useState<HomePageCopy>(() => loadHomePageCopy());
  const [draft, setDraft] = useState<HomePageCopy>(() => loadHomePageCopy());
  const [editing, setEditing] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const editingRef = React.useRef(editing);
  editingRef.current = editing;

  useEffect(() => {
    let cancelled = false;
    void fetchHomePageCopyStore().then((payload) => {
      if (cancelled || !payload) return;
      persistHomePageCopy(payload.copy);
      setCopy(payload.copy);
      if (!editingRef.current) setDraft(payload.copy);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const shown = editing ? draft : copy;
  const quoted = quoteParts(shown);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    const next = persistHomePageCopy(draft);
    const payload = buildHomePageCopyStorePayload(next, editorName);
    const result = await saveHomePageCopyStore(payload);
    setCopy(next);
    setDraft(next);
    setEditing(false);
    setSaving(false);
    setSaveMsg(result.ok && !result.error ? 'Home copy saved.' : result.error || 'Saved on this device.');
  };

  const handlePillar = (index: number) => {
    if (editing) return;
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

  return (
    <section id="hero" className="relative overflow-hidden bg-[#FAF8F5]" data-testid="home-marketing">
      {canManageHero ? (
        <div className="sticky top-[4.5rem] z-30 border-b border-[#E5DFD3] bg-[#FAF8F5]/95 backdrop-blur-sm" data-testid="home-copy-editor">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center gap-2">
            {!editing ? (
              <button
                type="button"
                className="min-h-[44px] px-4 rounded-xl border-2 border-[#1F1917] bg-white text-xs font-black uppercase tracking-wider"
                data-testid="home-copy-edit"
                onClick={() => {
                  setDraft(copy);
                  setEditing(true);
                  setSaveMsg('');
                }}
              >
                Edit home copy
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="min-h-[44px] px-4 rounded-xl bg-[#C2410C] text-white text-xs font-black uppercase tracking-wider border-2 border-[#1F1917] disabled:opacity-60"
                  data-testid="home-copy-save"
                  disabled={saving}
                  onClick={() => void handleSave()}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  className="min-h-[44px] px-4 rounded-xl border-2 border-[#1F1917] bg-white text-xs font-black uppercase tracking-wider"
                  data-testid="home-copy-cancel"
                  onClick={() => {
                    setDraft(copy);
                    setEditing(false);
                    setSaveMsg('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="min-h-[44px] px-4 rounded-xl border-2 border-[#E5DFD3] bg-[#FAF8F5] text-xs font-black uppercase tracking-wider"
                  data-testid="home-copy-reset"
                  onClick={() => setDraft(mergeHomePageCopy(DEFAULT_HOME_PAGE_COPY))}
                >
                  Reset to defaults
                </button>
              </>
            )}
            {saveMsg ? <span className="text-xs font-bold text-[#047857]">{saveMsg}</span> : null}
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#3F3832]">
              Section text is editable when you are signed in as admin.
            </span>
          </div>
        </div>
      ) : null}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-5 text-left">
            <HomeEditableField
              editing={editing}
              value={shown.kicker}
              onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { kicker: value }))}
              as="p"
              testId="house-brand-kicker"
              className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-[0.22em] text-[#C2410C]"
              aria-label="Home kicker"
            />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-[#1F1917] tracking-tight leading-[0.95]">
              <HomeEditableField
                editing={editing}
                value={shown.titleLead}
                onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { titleLead: value }))}
                as="span"
                testId="home-hero-title-1"
                className="block"
                aria-label="Home title line 1"
              />
              <HomeEditableField
                editing={editing}
                value={shown.titleAccent}
                onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { titleAccent: value }))}
                as="span"
                testId="home-hero-title-2"
                className="block italic"
                aria-label="Home title line 2"
              />
            </h1>
            <HomeEditableField
              editing={editing}
              value={shown.lede}
              onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { lede: value }))}
              as="p"
              multiline
              testId="home-hero-body"
              className="text-base sm:text-lg text-[#3F3832] font-medium leading-relaxed max-w-xl"
              aria-label="Home intro"
            />
            <HomeEditableField
              editing={editing}
              value={shown.feelIt}
              onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { feelIt: value }))}
              as="p"
              testId="home-hero-emphasis"
              className="text-sm sm:text-base font-black uppercase tracking-wide text-[#1F1917]"
              aria-label="Home emphasis line"
            />
            <div className="flex flex-wrap gap-3 pt-1">
              {editing ? (
                <>
                  <HomeEditableField
                    editing
                    value={shown.primaryCta}
                    onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { primaryCta: value }))}
                    testId="home-cta-explore"
                    aria-label="Explore button label"
                    inputClassName="font-black uppercase text-xs"
                  />
                  <HomeEditableField
                    editing
                    value={shown.secondaryCta}
                    onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { secondaryCta: value }))}
                    testId="home-cta-shop"
                    aria-label="Shop button label"
                    inputClassName="font-black uppercase text-xs"
                  />
                </>
              ) : (
                <>
                  <button
                    type="button"
                    data-testid="home-cta-explore"
                    onClick={() => onScrollToSection('movement')}
                    className="min-h-[44px] px-6 py-3 bg-[#1F1917] hover:bg-[#2D2623] text-white font-black text-xs uppercase tracking-widest"
                  >
                    {shown.primaryCta}
                  </button>
                  <button
                    type="button"
                    data-testid="home-cta-shop"
                    onClick={() => (onNavigateToGear ? onNavigateToGear() : onScrollToSection('receipts'))}
                    className="min-h-[44px] px-6 py-3 border-2 border-[#1F1917] bg-transparent text-[#1F1917] font-black text-xs uppercase tracking-widest hover:bg-[#1F1917] hover:text-white"
                  >
                    {shown.secondaryCta}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-2xl">
              <img
                src={HOME_HERO_IMAGE}
                alt={HOME_HERO_IMAGE_ALT}
                className="absolute inset-0 h-full w-full object-cover object-top"
                data-testid="home-hero-image"
              />
              <div className="pointer-events-none absolute bottom-8 left-6 right-6 text-right">
                {editing ? (
                  <div className="pointer-events-auto">
                    <HomeEditableField
                      editing
                      value={shown.overlayScript}
                      onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { overlayScript: value }))}
                      testId="home-photo-overlay"
                      aria-label="Photo overlay script"
                      inputClassName="font-script text-2xl text-right"
                    />
                  </div>
                ) : (
                  <p data-testid="home-photo-overlay" className="font-script text-3xl sm:text-4xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] leading-tight">
                    {shown.overlayScript}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-y border-[#E5DFD3] bg-[#FAF8F5]" data-testid="home-pillars">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-5 gap-6">
          {shown.pillars.map((title, index) => (
            <button
              key={`${title}-${index}`}
              type="button"
              data-testid={`home-pillar-${index}`}
              onClick={() => handlePillar(index)}
              className="flex flex-col items-center text-center gap-2 min-h-[44px]"
            >
              <span className="text-[#C2410C]">{PILLAR_ICONS[index]}</span>
              {editing ? (
                <div className="w-full" onClick={(event) => event.stopPropagation()}>
                  <HomeEditableField
                    editing
                    value={title}
                    onChange={(value) => setDraft((prev) => patchHomePagePillar(prev, index, value))}
                    testId={`home-pillar-title-${index}`}
                    aria-label={`Pillar ${index + 1}`}
                    inputClassName="text-center text-[10px] font-black uppercase"
                  />
                </div>
              ) : (
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.14em] text-[#1F1917] leading-tight">
                  {title}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div id="movement" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="home-movement">
        <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden border border-[#E5DFD3]">
          <div className="relative min-h-[320px]">
            <img src={HOME_MOVEMENT_IMAGE} alt={HOME_MOVEMENT_IMAGE_ALT} className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="bg-[#9A3412] text-[#FAF8F5] p-8 sm:p-12 flex flex-col justify-center gap-4">
            <HomeEditableField
              editing={editing}
              value={shown.movementKicker}
              onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { movementKicker: value }))}
              as="p"
              testId="home-movement-kicker"
              className="text-[10px] font-mono font-black uppercase tracking-[0.22em] text-[#FDBA74]"
              aria-label="Movement kicker"
              inputClassName="text-[#1F1917]"
            />
            <HomeEditableField
              editing={editing}
              value={shown.movementTitle}
              onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { movementTitle: value }))}
              as="h2"
              testId="home-movement-title"
              className="text-3xl sm:text-4xl font-serif font-black leading-tight"
              aria-label="Movement title"
              inputClassName="text-[#1F1917]"
            />
            <HomeEditableField
              editing={editing}
              value={shown.movementBody}
              onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { movementBody: value }))}
              as="p"
              multiline
              testId="home-movement-body"
              className="text-sm sm:text-base leading-relaxed text-[#FFEDD5]"
              aria-label="Movement story"
              inputClassName="text-[#1F1917]"
            />
            {editing ? (
              <HomeEditableField
                editing
                value={shown.movementCta}
                onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { movementCta: value }))}
                testId="home-movement-cta"
                aria-label="Our story button label"
                inputClassName="text-[#1F1917] font-black uppercase text-xs"
              />
            ) : (
              <button
                type="button"
                data-testid="home-movement-cta"
                onClick={() => onOpenAbout?.()}
                className="self-start min-h-[44px] inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] border-b border-[#FAF8F5] pb-1"
              >
                {shown.movementCta}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative min-h-[280px] sm:min-h-[340px] flex items-end" data-testid="home-quote">
        <img src={QUOTE_PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1917]/80 via-[#1F1917]/25 to-transparent" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-10 text-center text-white space-y-3">
          {editing ? (
            <>
              <HomeEditableField
                editing
                value={shown.quote}
                onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { quote: value }))}
                as="p"
                multiline
                testId="home-quote-text"
                aria-label="Home quote"
                inputClassName="text-[#1F1917]"
              />
              <HomeEditableField
                editing
                value={shown.quoteEmphasis}
                onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { quoteEmphasis: value }))}
                testId="home-quote-emphasis"
                aria-label="Quoted italic word"
                inputClassName="text-[#1F1917]"
              />
            </>
          ) : (
            <p data-testid="home-quote-text" className="font-serif italic text-2xl sm:text-3xl leading-snug">
              {quoted.before}
              {quoted.emphasis ? <em className="not-italic font-serif italic text-[#FDBA74]">{quoted.emphasis}</em> : null}
              {quoted.after}
            </p>
          )}
          <HomeEditableField
            editing={editing}
            value={shown.quoteAttribution}
            onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { quoteAttribution: value }))}
            as="p"
            testId="home-quote-attr"
            className="text-[10px] font-mono font-black uppercase tracking-[0.22em] text-[#FDBA74]"
            aria-label="Quote attribution"
            inputClassName="text-[#1F1917]"
          />
        </div>
      </div>

      <div id="mood-tool" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-5">
        <HomeEditableField
          editing={editing}
          value={shown.moodBanner}
          onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { moodBanner: value }))}
          as="p"
          testId="home-mood-banner"
          className="text-sm font-serif italic text-[#3F3832]"
          aria-label="Mood banner"
        />
        <div className="inline-flex items-center gap-2 bg-white border border-[#E5DFD3] px-4 py-1.5 rounded-full">
          <Flame className="w-4 h-4 text-[#C2410C]" />
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#1F1917] font-mono">Mood Matrix</span>
        </div>
        <HomeEditableField
          editing={editing}
          value={shown.moodTitle}
          onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { moodTitle: value }))}
          as="h2"
          testId="home-mood-title"
          className="text-3xl sm:text-4xl font-serif font-black text-[#1F1917]"
          aria-label="Mood section title"
        />
        <HomeEditableField
          editing={editing}
          value={shown.moodLede}
          onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { moodLede: value }))}
          as="p"
          testId="home-mood-lede"
          className="text-sm text-[#3F3832] max-w-2xl mx-auto"
          aria-label="Mood section lede"
        />

        {canManageHero ? <MoodWorkflowMap variant="compact" /> : null}

        <div id="mood-hero-bubbles" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3" data-testid="mood-hero-bubbles">
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
                  className={`min-h-[44px] p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-[#EA580C] text-white border-[#FDBA74] font-extrabold shadow-xl scale-105'
                      : 'bg-white border-[#E5DFD3] text-[#1F1917] hover:border-[#1F1917] hover:bg-[#FAF8F5] shadow-sm'
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    {mood.emoji}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-mono font-bold">{mood.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <HomeEditableField
          editing={editing}
          value={shown.moodQuote}
          onChange={(value) => setDraft((prev) => patchHomePageCopy(prev, { moodQuote: value }))}
          as="p"
          testId="home-mood-quote"
          className="font-serif italic text-lg text-[#1F1917] pt-2"
          aria-label="Mood quote"
        />

        {selectedMood ? (
          <div className="relative text-left">
            <button
              type="button"
              onClick={() => setSelectedMood(null)}
              className="absolute -top-1 right-0 z-10 min-h-[44px] px-3 text-xs text-[#3F3832] hover:text-[#1F1917] inline-flex items-center gap-1 cursor-pointer font-mono font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <MoodShakePanel mood={selectedMood} hasMembershipAccess={hasMembershipAccess} onUnlock={onOpenJoin} />
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Hero;
