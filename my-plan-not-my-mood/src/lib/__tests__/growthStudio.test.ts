import { describe, expect, it } from 'vitest';
import {
  GROWTH_CHANNELS,
  GROWTH_PHASE_1_RULE,
  GROWTH_SETUP_ITEMS,
  GROWTH_STUDIO_PATH,
  GROWTH_STUDIO_SHOP_URL,
  GROWTH_STUDIO_TITLE,
  emptyGrowthStudioState,
  growthSetupProgress,
  growthStudioAllowsPaidSpend,
  growthStudioAnalyticsSummary,
  growthStudioPhase1Ready,
  growthUrlError,
  parseGrowthStudioState,
  setGrowthChannelUrl,
  toggleGrowthSetupItem,
} from '../growthStudio';

describe('growthStudio', () => {
  it('is the socials and amplification studio, not the posting calendar', () => {
    expect(GROWTH_STUDIO_TITLE).toBe('Growth Studio');
    expect(GROWTH_STUDIO_PATH).toBe('/admin/growth');
    expect(GROWTH_PHASE_1_RULE).toMatch(/organic only/i);
    expect(GROWTH_PHASE_1_RULE).toMatch(/Content Factory writes the posts/);
    expect(GROWTH_CHANNELS.map((channel) => channel.id)).toEqual([
      'facebook',
      'instagram',
      'tiktok',
      'youtube',
      'personal',
      'website',
    ]);
    expect(GROWTH_CHANNELS.find((channel) => channel.id === 'website')?.job).toMatch(/Shop Gear/);
    expect(GROWTH_STUDIO_SHOP_URL).toContain('nonnegotiation.com/gear');
    expect(growthStudioAllowsPaidSpend()).toBe(false);
  });

  it('tracks official-channel URLs and Phase 1 setup without unlocking paid ads', () => {
    expect(growthUrlError('')).toBeNull();
    expect(growthUrlError('not-a-url')).toMatch(/full URL/i);
    expect(growthUrlError('https://facebook.com/nonnegotiation')).toBeNull();

    let state = emptyGrowthStudioState();
    expect(state.channelUrls.website).toBe(GROWTH_STUDIO_SHOP_URL);
    expect(growthStudioPhase1Ready(state)).toBe(false);
    state = setGrowthChannelUrl(state, 'facebook', ' https://facebook.com/nonnegotiation ');
    expect(state.channelUrls.facebook).toBe('https://facebook.com/nonnegotiation');
    const phase1 = GROWTH_SETUP_ITEMS.filter((item) => item.phase === 'phase1');
    const phase2 = GROWTH_SETUP_ITEMS.filter((item) => item.phase === 'phase2');
    expect(phase1.length).toBe(6);
    expect(phase2.map((item) => item.id)).toEqual([
      'meta-bm',
      'meta-pixel',
      'tiktok-pixel',
      'ad-account',
      'boosts',
    ]);
    for (const item of phase1) {
      state = toggleGrowthSetupItem(state, item.id);
    }
    expect(growthSetupProgress(state, 'phase1')).toEqual({ done: 6, total: 6 });
    expect(growthStudioPhase1Ready(state)).toBe(true);
    expect(growthStudioAllowsPaidSpend()).toBe(false);

    const parsed = parseGrowthStudioState({
      channelUrls: { facebook: 'https://facebook.com/nonnegotiation', tiktok: 'ftp://bad' },
      setupDone: { 'facebook-page': true, 'ad-account': true, nope: true },
    });
    expect(parsed.channelUrls.facebook).toBe('https://facebook.com/nonnegotiation');
    expect(parsed.channelUrls.tiktok).toBe('');
    expect(parsed.setupDone['facebook-page']).toBe(true);
    expect(parsed.setupDone['ad-account']).toBe(true);
    expect(parsed.setupDone.nope).toBeUndefined();
  });

  it('lists the analytics cadence platforms Growth Studio watches', () => {
    const summary = growthStudioAnalyticsSummary();
    expect(summary.cadenceDays).toBe(3);
    expect(summary.platforms).toEqual(['Facebook', 'Instagram', 'TikTok', 'YouTube', 'Personal']);
  });
});
