import { describe, expect, it } from 'vitest';
import {
  TEE_SALES_ANGELA_PERSONAL,
  TEE_SALES_BIO_LINE,
  TEE_SALES_EVELYN_PERSONAL,
  TEE_SALES_LIVE_NO_SAMPLE,
  TEE_SALES_LIVE_ON_BODY,
  TEE_SALES_NONNEGOTIATION_PAGES,
  TEE_SALES_PINNED_POST,
  TEE_SALES_SHOP_SHORT,
  TEE_SALES_SHOP_URL,
  TEE_SALES_WEBSITE,
  TEE_LIFESTYLE_MOCKUP_PATH,
  teeSalesLiveTalkTrack,
} from '../teeSalesPlaybook';

describe('teeSalesPlaybook', () => {
  it('sends every surface to Shop Gear on the brand site, not a second storefront URL', () => {
    expect(TEE_SALES_SHOP_URL).toBe('https://nonnegotiation.com/gear');
    expect(TEE_SALES_SHOP_SHORT).toBe('nonnegotiation.com/gear');
    expect(TEE_SALES_BIO_LINE).toMatch(/NonNegotiation/);
    expect(TEE_SALES_BIO_LINE).toMatch(/MY PLAN, NOT MY MOOD/);
    expect(TEE_SALES_BIO_LINE).toMatch(/nonnegotiation\.com\/gear/);
    expect(TEE_SALES_PINNED_POST).toContain(TEE_SALES_SHOP_URL);
    expect(TEE_SALES_LIVE_NO_SAMPLE).toMatch(/pin/i);
    expect(TEE_SALES_LIVE_ON_BODY).toMatch(/Wear the tee/i);
    expect(TEE_SALES_LIVE_ON_BODY).toMatch(/brand site first/i);
    expect(TEE_SALES_NONNEGOTIATION_PAGES).toMatch(/Facebook, Instagram, TikTok, and YouTube/);
    expect(TEE_SALES_ANGELA_PERSONAL).toMatch(/6\.2K/);
    expect(TEE_SALES_EVELYN_PERSONAL).toMatch(/Evelyn’s personal/);
    expect(TEE_SALES_WEBSITE).toMatch(/brand under NonNegotiation/);
    expect(TEE_SALES_WEBSITE).toMatch(/nonnegotiation\.com\/gear/);
    expect(TEE_LIFESTYLE_MOCKUP_PATH).toBe('/images/apparel_tee_lifestyle.jpg');
    expect(teeSalesLiveTalkTrack(false)).toBe(TEE_SALES_LIVE_NO_SAMPLE);
    expect(teeSalesLiveTalkTrack(true)).toBe(TEE_SALES_LIVE_ON_BODY);
  });
});
