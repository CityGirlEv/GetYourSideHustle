/**
 * How we sell tees from day one: live talk tracks and page copy.
 * Shop Gear is live. Socials amplify. They do not gate sales.
 */

export const TEE_SALES_SHOP_URL = 'https://nonnegotiation.com/gear';
export const TEE_SALES_SHOP_SHORT = 'nonnegotiation.com/gear';
export const TEE_SALES_SAY_THE_LINK = `The tees are at ${TEE_SALES_SHOP_SHORT}`;
export const TEE_LIFESTYLE_MOCKUP_PATH = '/images/apparel_tee_lifestyle.jpg';
export const TEE_LIFESTYLE_MOCKUP_ALT =
  'Woman wearing the My Plan, Not My Mood white tee — FOCUS, DISCIPLINE, FREEDOM seal';

export const TEE_SALES_BIO_LINE =
  'NonNegotiation — introducing MY PLAN, NOT MY MOOD. Tees live now. Shop: nonnegotiation.com/gear';

/** nonnegotiation.com is the house. MY PLAN, NOT MY MOOD is one brand under it. */
export const HOUSE_NAME = 'NonNegotiation';
export const HOUSE_SITE = 'nonnegotiation.com';
export const HOUSE_BRAND_NAME = 'MY PLAN, NOT MY MOOD';
export const HOUSE_BRAND_KICKER = 'A NonNegotiation brand';
export const HOUSE_INTRO_LINE =
  'NonNegotiation.com is the house. MY PLAN, NOT MY MOOD is one of the brands under it.';
export const HOUSE_FOOTER_LINE =
  'Do not let a temporary mood determine a permanent outcome. MY PLAN, NOT MY MOOD is a brand under NonNegotiation — founded by Angela.';
export const HOUSE_WELCOME_HOOK = 'Your mood can ride. It cannot drive.';

export const TEE_SALES_PINNED_POST =
  'The tees are live. Mood gets a vote. The plan gets the shirt.\n\nShop here: https://nonnegotiation.com/gear\n\nSizes and checkout are on that page. Organic only — no ads.';

export const TEE_SALES_LIVE_NO_SAMPLE = [
  'Open with the brand line: Feel it. Follow the plan anyway.',
  'Hold the phone to Shop Gear or show the tee photo — do not wait for the box.',
  `Say once, out loud: ${TEE_SALES_SAY_THE_LINK}`,
  'Pin that URL in the comments in the first two minutes.',
  'Repeat the link when someone asks price, size, or “where do I get it?”',
  'Close: the plan is the shirt. Link is pinned.',
].join(' ');

export const TEE_SALES_LIVE_ON_BODY = [
  'Wear the tee. Name the color and the line on the chest.',
  'Tell one 20-second story: a mood tried to win, the plan won anyway.',
  `Say: this is the one I wear. Yours is at ${TEE_SALES_SHOP_SHORT}`,
  'Pin https://nonnegotiation.com/gear. Read a comment and send them there.',
  'Do not send people to snatchvault.com. Always the brand site first.',
  'Close wearing the tee: if you needed a reminder today, this is it. Link is pinned.',
].join(' ');

export const TEE_SALES_NONNEGOTIATION_PAGES = [
  'NonNegotiation Facebook, Instagram, TikTok, and YouTube bios use the Shop Gear URL.',
  'Pinned post or channel trailer is the tee drop, not a coming-soon teaser.',
  'Lives on those pages follow the same talk track as Angela’s personal live.',
].join(' ');

export const TEE_SALES_ANGELA_PERSONAL = [
  'Angela’s personal Facebook (6.2K) and Instagram bio: tees live now + nonnegotiation.com/gear.',
  'Pin the shop post on personal Facebook. Share lives from personal to NonNegotiation.',
  'Soft-sell now with photos. On-body live the day the sample arrives.',
].join(' ');

export const TEE_SALES_EVELYN_PERSONAL = [
  'Evelyn’s personal Facebook and Instagram: one support post with the Shop Gear link.',
  'Bio can add Shop: nonnegotiation.com/gear while the drop is live.',
  'Share Angela’s live; do not invent a second shop URL.',
].join(' ');

export const TEE_SALES_WEBSITE = [
  'Home introduces MY PLAN, NOT MY MOOD as a brand under NonNegotiation. Shop Gear button goes to /gear. Copy says the tees are live — not coming soon.',
  'Shop Gear shows the real Shopify tees, hoodies, and hats. Buy stays on this site until checkout.',
  'Footer and hero send people to Shop Gear. The only shop URL on the site is nonnegotiation.com/gear.',
  'Strip leftover mock catalog SKUs from Home. Live viewers land here from Angela’s pinned comment.',
].join(' ');

export function teeSalesLiveTalkTrack(hasSampleInHand: boolean): string {
  return hasSampleInHand ? TEE_SALES_LIVE_ON_BODY : TEE_SALES_LIVE_NO_SAMPLE;
}
