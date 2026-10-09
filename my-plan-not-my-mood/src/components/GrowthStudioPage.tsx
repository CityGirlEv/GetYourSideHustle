import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ExternalLink, Lock, Megaphone } from 'lucide-react';
import type { AdminStudioTab } from '../lib/adminStudio';
import { brandTabClass, BRAND_TAB_SUB_ROW_CLASS } from '../lib/brandUi';
import {
  GROWTH_CHANNELS,
  GROWTH_FACTORY_SPLIT,
  GROWTH_PHASE_1_RULE,
  GROWTH_SETUP_ITEMS,
  GROWTH_STUDIO_KICKER,
  GROWTH_STUDIO_PATH,
  GROWTH_STUDIO_SHOP_URL,
  GROWTH_STUDIO_STORAGE_KEY,
  GROWTH_STUDIO_TITLE,
  emptyGrowthStudioState,
  growthChannelHref,
  growthSetupProgress,
  growthStudioAllowsPaidSpend,
  growthStudioAnalyticsSummary,
  growthStudioOrganicNote,
  growthStudioPhase1Ready,
  growthUrlError,
  parseGrowthStudioState,
  setGrowthChannelUrl,
  toggleGrowthSetupItem,
  type GrowthChannelId,
  type GrowthStudioState,
} from '../lib/growthStudio';

const FIELD_CLASS =
  'w-full min-h-[44px] rounded-xl border-2 border-[#FDBA74] bg-white px-3 py-2 text-sm text-[#1F1917] focus:border-[#EA580C] focus:outline-none';

function loadState(): GrowthStudioState {
  try {
    const raw = localStorage.getItem(GROWTH_STUDIO_STORAGE_KEY);
    return raw ? parseGrowthStudioState(JSON.parse(raw)) : emptyGrowthStudioState();
  } catch {
    return emptyGrowthStudioState();
  }
}

export const GrowthStudioPage: React.FC<{
  onOpenTab: (tab: AdminStudioTab) => void;
}> = ({ onOpenTab }) => {
  const [state, setState] = useState<GrowthStudioState>(() => loadState());
  const [draftUrls, setDraftUrls] = useState<Record<string, string>>(() => ({ ...loadState().channelUrls }));
  const analytics = growthStudioAnalyticsSummary();
  const phase1 = growthSetupProgress(state, 'phase1');
  const phase2 = growthSetupProgress(state, 'phase2');

  useEffect(() => {
    localStorage.setItem(GROWTH_STUDIO_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const saveUrl = (id: GrowthChannelId) => {
    const next = draftUrls[id] ?? '';
    const error = growthUrlError(next);
    if (error) return;
    setState((current) => setGrowthChannelUrl(current, id, next));
  };

  return (
    <div className="space-y-4" data-testid="growth-studio">
      <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-[#FDBA74] bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FEF3C7] p-5 sm:p-6 shadow-[0_12px_32px_rgba(234,88,12,0.14)] space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EA580C] text-white text-[10px] font-mono font-black uppercase tracking-wider">
          <Megaphone className="w-3.5 h-3.5" /> {GROWTH_STUDIO_KICKER}
        </div>
        <h2 className="text-2xl font-serif font-semibold text-[#9A3412]">{GROWTH_STUDIO_TITLE}</h2>
        <p className="text-sm text-[#9A3412] font-medium">{GROWTH_PHASE_1_RULE}</p>
        <p className="text-sm text-[#9A3412] font-medium">{GROWTH_FACTORY_SPLIT}</p>
        <div className={BRAND_TAB_SUB_ROW_CLASS} role="tablist" aria-label="Growth Studio related pages">
          <button type="button" role="tab" aria-selected className={brandTabClass(true)} data-testid="growth-studio-tab">
            Growth Studio
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={false}
            onClick={() => onOpenTab('factory')}
            className={brandTabClass(false)}
            data-testid="growth-open-factory"
          >
            Content Factory
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={false}
            onClick={() => onOpenTab('calendar')}
            className={brandTabClass(false)}
            data-testid="growth-open-calendar"
          >
            Posting Schedule
          </button>
        </div>
      </div>

      <section className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 space-y-3" data-testid="growth-organic-rule">
        <h3 className="text-lg font-black uppercase font-serif text-[#1F1917]">Phase 1 traffic</h3>
        <p className="text-sm font-medium text-[#3F3832]">{growthStudioOrganicNote()}</p>
        <p className="text-sm font-semibold text-[#9A3412]">
          Paid spend is {growthStudioAllowsPaidSpend() ? 'on' : 'off'}. Shop URL:{' '}
          <a className="underline" href={GROWTH_STUDIO_SHOP_URL} target="_blank" rel="noreferrer">
            {GROWTH_STUDIO_SHOP_URL}
          </a>
        </p>
        <p className="text-xs font-mono font-black uppercase text-[#C2410C]" data-testid="growth-phase1-ready">
          Channel setup {phase1.done}/{phase1.total}
          {growthStudioPhase1Ready(state) ? ' · Phase 1 channels ready' : ''}
        </p>
      </section>

      <section className="space-y-3" data-testid="growth-channels">
        <h3 className="text-lg font-black uppercase font-serif text-[#1F1917]">Official channels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {GROWTH_CHANNELS.map((channel) => {
            const href = growthChannelHref(state, channel.id);
            const draft = draftUrls[channel.id] ?? '';
            const error = growthUrlError(draft);
            return (
              <article
                key={channel.id}
                className="bg-white border-2 border-[#1F1917] rounded-3xl p-4 sm:p-5 space-y-3"
                data-testid={`growth-channel-${channel.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black uppercase text-[#1F1917]">{channel.label}</h4>
                    <p className="text-xs font-medium text-[#3F3832] mt-1">{channel.job}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-mono font-black uppercase px-2 py-1 rounded-lg bg-[#FFEDD5] text-[#9A3412]">
                    {channel.phase1Status}
                  </span>
                </div>
                <p className="text-[10px] font-mono font-black uppercase text-[#6B5344]">
                  Owner · {channel.owner === 'angela' ? 'Angela posts' : 'Evelyn keeps live'}
                </p>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#9A6B3D]">Page URL</span>
                  <input
                    type="url"
                    value={draft}
                    onChange={(event) => setDraftUrls((current) => ({ ...current, [channel.id]: event.target.value }))}
                    onBlur={() => saveUrl(channel.id)}
                    placeholder="https://"
                    className={FIELD_CLASS}
                    data-testid={`growth-channel-url-${channel.id}`}
                  />
                </label>
                {error ? (
                  <p className="text-xs font-semibold text-[#9A3412]" role="alert">
                    {error}
                  </p>
                ) : null}
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-black uppercase text-[#C2410C]"
                  >
                    Open <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 space-y-3" data-testid="growth-setup-phase1">
          <h3 className="text-lg font-black uppercase font-serif text-[#1F1917]">Phase 1 channel setup</h3>
          <p className="text-xs font-medium text-[#3F3832]">
            Check these off as official pages and bios go live. This does not turn ads on.
          </p>
          {GROWTH_SETUP_ITEMS.filter((item) => item.phase === 'phase1').map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-3 min-h-[44px] cursor-pointer"
              data-testid={`growth-setup-${item.id}`}
            >
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 accent-[#C2410C] shrink-0"
                checked={Boolean(state.setupDone[item.id])}
                onChange={() => setState((current) => toggleGrowthSetupItem(current, item.id))}
              />
              <span>
                <span className="block text-sm font-black uppercase text-[#1F1917]">{item.title}</span>
                <span className="block text-xs font-medium text-[#3F3832]">{item.detail}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 space-y-3" data-testid="growth-setup-phase2">
          <h3 className="text-lg font-black uppercase font-serif text-[#1F1917] inline-flex items-center gap-2">
            Paid amplification
            <Lock className="w-4 h-4 text-[#C2410C]" />
          </h3>
          <p className="text-xs font-medium text-[#3F3832]">
            Track setup for later. Phase 1 does not include paid ads, boosts, or ad spend ({phase2.done}/{phase2.total}{' '}
            prepped).
          </p>
          {GROWTH_SETUP_ITEMS.filter((item) => item.phase === 'phase2').map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-3 min-h-[44px] cursor-pointer"
              data-testid={`growth-setup-${item.id}`}
            >
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 accent-[#C2410C] shrink-0"
                checked={Boolean(state.setupDone[item.id])}
                onChange={() => setState((current) => toggleGrowthSetupItem(current, item.id))}
              />
              <span>
                <span className="block text-sm font-black uppercase text-[#1F1917]">{item.title}</span>
                <span className="block text-xs font-medium text-[#3F3832]">{item.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 space-y-3" data-testid="growth-analytics">
        <h3 className="text-lg font-black uppercase font-serif text-[#1F1917]">What is driving shop clicks</h3>
        <p className="text-sm font-medium text-[#3F3832]">
          Angela uploads the latest analytics every {analytics.cadenceDays} days on{' '}
          {analytics.platforms.join(', ')}. Evelyn reviews the next day and that review guides the next create.
        </p>
        <button
          type="button"
          onClick={() => onOpenTab('tasks')}
          className="inline-flex min-h-[44px] items-center gap-2 px-4 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-black uppercase tracking-wider cursor-pointer"
        >
          Open Task List analytics <ArrowRight className="w-4 h-4" />
        </button>
        {growthStudioPhase1Ready(state) ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-[#166534]">
            <CheckCircle2 className="w-5 h-5" /> Phase 1 channel checklist is complete.
          </p>
        ) : null}
        <p className="text-[10px] font-mono text-[#6B5344] uppercase">{GROWTH_STUDIO_PATH}</p>
      </section>
    </div>
  );
};
