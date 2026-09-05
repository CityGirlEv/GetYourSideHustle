import { sprintWindowById } from './sprintCalendar';
import type { IpItemPhase } from './ipLineItems';

export const GEAR_SALES_BUDGET_TOTAL = 10_000;
export const GEAR_SALES_HOURLY_RATE = 100;
export const LINE_ITEMS_STORAGE_KEY = 'myplan_admin_line_items_v3';
export const TASKS_STORAGE_KEY = 'myplan_admin_tasks_db_v2';

export const PHASE_1_LABEL = 'Phase 1: Gear Launch & T-Shirt Design';
export const PHASE_2_LABEL = 'Phase 2: Memberships — Coming Soon';
export const PHASE_3_LABEL = 'Phase 3: Open for Future Discussion';

export const MEMBERSHIPS_COMING_SOON_NOTE =
  'Memberships are not configured in Phase 1. The Join page shows Coming Soon until Phase 2.';

export interface GearLineItemSeed {
  id: string;
  name: string;
  phase: IpItemPhase;
  duration?: string;
  dates?: string;
  summary?: string;
  deliverables?: string[];
  description: string;
  hours: number;
  rate: number;
  baseAmount: number;
  visible?: boolean;
}

export const PHASE_PAYMENT_SCHEDULE = [
  { phase: 'phase1_build' as const, label: 'Phase 1 payment', percent: 40, amount: 4_000 },
  { phase: 'phase2_addons' as const, label: 'Phase 2 payment', percent: 30, amount: 3_000 },
  { phase: 'phase3_future' as const, label: 'Phase 3 payment', percent: 30, amount: 3_000 },
] as const;

export const GEAR_SALES_LINE_ITEMS_SEED: GearLineItemSeed[] = [
  {
    id: 'sprint0',
    name: 'Sprint 0: Brand Foundation & Gear Storefront Shell',
    phase: 'phase1_build',
    duration: '2 Weeks',
    dates: sprintWindowById('sprint0')?.dates ?? 'Mon Aug 24 – Sun Sep 6, 2026',
    summary:
      'Sell tees from day one. Shop Gear is live on nonnegotiation.com. Soft-sell Angela’s 6.2K Facebook now. Order her samples so the first live is on-body. Socials (TikTok, YouTube, Instagram) are built in parallel — they do not gate sales.',
    deliverables: [
      'Keep Shop Gear live with Shopify tee links (nonnegotiation.com/gear)',
      'Present the drop on Home + Shop Gear so live viewers land on a selling page',
      'Soft-sell to Angela’s 6.2K Facebook: shop link in bio, posts, and comments',
      'Angela live talk track: pin nonnegotiation.com/gear (photos now, on-body when samples arrive)',
      'NonNegotiation + Angela personal + Evelyn personal pages all sell the same URL',
      'Order Angela’s sample tees (hoodie/hat if ready) so she has product in hand',
      'Stand up TikTok / YouTube / Instagram in parallel — not a sales gate',
      'Canonical domain and SSL (nonnegotiation.com / localhost:3001)',
      'Angela $10,000 budget paid across three phase payments',
    ],
    description:
      'Phase 1 start is shirt sales. Socials grow beside the shop. Memberships stay Coming Soon.',
    hours: 20,
    rate: GEAR_SALES_HOURLY_RATE,
    baseAmount: 2_000,
  },
  {
    id: 'sprint1',
    name: 'Sprint 1: Developing Shirts — First Drop',
    phase: 'phase1_build',
    duration: '1 Week',
    dates: sprintWindowById('sprint1')?.dates ?? 'Mon Aug 31 – Sun Sep 6, 2026',
    summary:
      'Keep selling the live tees while Angela finishes first-drop picks. When her samples arrive, she wears them on live. Socials keep building in the background.',
    deliverables: [
      'Keep the Facebook shop-link cadence (do not wait for new channels)',
      'Angela’s samples in hand — tees first, hoodie/hat if they ship with the order',
      'First live wearing the tee (pin Shop Gear in comments)',
      'Finish 3 shirt styles / hoodie / hat picks on Gear Selections',
      'T-shirt design stays inside the $10,000 Phase 1 budget',
    ],
    description:
      'Selling does not pause for design. Samples unlock the on-body live. Socials stay parallel.',
    hours: 25,
    rate: GEAR_SALES_HOURLY_RATE,
    baseAmount: 2_500,
  },
  {
    id: 'sprint2',
    name: 'Sprint 2: Keep Selling — Hoodies, Hats & Social Reach',
    phase: 'phase1_build',
    duration: '1 Week',
    dates: sprintWindowById('sprint2')?.dates ?? 'Mon Sep 7 – Sun Sep 13, 2026',
    summary:
      'Shop is already live. Add hoodie and hat pages the same way as tees. Every post still sells. New social channels amplify; they do not replace Facebook sales.',
    deliverables: [
      'Hoodie and hat listings on nonnegotiation.com/gear (then Shopify product links)',
      'Shop link in every organic post (Facebook plus any live TikTok / YouTube / Instagram)',
      'Keep checkout on Shopify — sizes, shipping, payment',
      'Do not pause tee sales for page polish',
    ],
    description: 'Sales stay on. Catalog and socials catch up around the live shop.',
    hours: 20,
    rate: GEAR_SALES_HOURLY_RATE,
    baseAmount: 2_000,
  },
  {
    id: 'sprint3',
    name: 'Sprint 3: Website Pages & Phase 1 Email',
    phase: 'phase1_build',
    duration: '1 Week',
    dates: sprintWindowById('sprint3')?.dates ?? 'Mon Sep 14 – Sun Sep 20, 2026',
    summary:
      'Ship the pertinent launch pages — About, Contact, Privacy Policy, Terms, FAQ — and configure Phase 1 email for orders and contact.',
    deliverables: [
      'About page',
      'Contact page',
      'Privacy Policy and Terms of Use',
      'FAQ',
      'Join / Memberships page marked Coming Soon (not configured)',
      'Phase 1 email: orders, fulfillment, contact, and admin alerts',
    ],
    description:
      'A real website needs About, Contact, Privacy, Terms, FAQ, and working email. Memberships stay Coming Soon.',
    hours: 22,
    rate: GEAR_SALES_HOURLY_RATE,
    baseAmount: 2_200,
  },
  {
    id: 'sprint4',
    name: 'Sprint 4: QA & Gear Launch',
    phase: 'phase1_build',
    duration: '1 Week',
    dates: sprintWindowById('sprint4')?.dates ?? 'Mon Sep 21 – Sun Sep 27, 2026',
    summary: 'Test the selling path, then run launch-week lives in the tee. Socials are a megaphone, not a prerequisite.',
    deliverables: [
      'QA Shop Gear and Shopify checkout (a real test order)',
      'Launch-week lives wearing the sample tee — pin nonnegotiation.com/gear',
      'Cloudflare Pages stays production-live',
      'Phase 1 close-out against the $10,000 budget',
    ],
    description: 'Launch week is on-body selling. Pages and email already ride beside the shop.',
    hours: 13,
    rate: GEAR_SALES_HOURLY_RATE,
    baseAmount: 1_300,
  },
  {
    id: 'memberships-phase2',
    name: 'Memberships Configuration (Coming Soon in Phase 1)',
    phase: 'phase2_addons',
    duration: 'Phase 2 — future discussion',
    dates: 'Open for discussion',
    summary:
      'Member accounts, tiers, and access are not part of Phase 1. The public Join page shows Coming Soon until this phase is scoped and priced.',
    deliverables: [
      'Decide membership tiers and pricing',
      'Configure member accounts and access',
      'Turn Coming Soon into a live Join flow',
    ],
    description: MEMBERSHIPS_COMING_SOON_NOTE,
    hours: 0,
    rate: 0,
    baseAmount: 0,
  },
  {
    id: 'roi-phase2',
    name: 'ROI by Sprint (Organic Facebook)',
    phase: 'phase2_addons',
    duration: 'Phase 1 modeled · Phase 2 refresh',
    dates: 'Open for discussion',
    summary:
      'Each Phase 1 sprint lists organic ROI, expected tee-shirt sales ($38, 70% of units), and suggestions to improve. Angela is fairly active on socials and has 6.2K personal Facebook followers — no paid ads. Refresh numbers when production costs and live sales are real.',
    deliverables: [
      'Per-sprint organic ROI and expected tee-shirt sales',
      'Suggestions to lift tee sales without paid ads',
      '6.2K Facebook / no paid ads assumptions',
      'Refresh after shirt COGS and first live orders',
    ],
    description:
      'Phase 1 ROI is modeled from organic Facebook. Memberships and paid amplification stay Phase 2 discussion.',
    hours: 0,
    rate: 0,
    baseAmount: 0,
  },
  {
    id: 'future-phase3',
    name: 'Beyond Phase 1 — Open for Future Discussion',
    phase: 'phase3_future',
    duration: 'Phase 3 — not scoped',
    dates: 'Open for discussion',
    summary:
      'Mood tools, planners, Content Factory retainers, and extra pages or emails are not in the $10K Phase 1 gear launch. Organic socials for tee sales are already in Phase 1.',
    deliverables: [
      'Mood Tool, Daily Affirmations, Receipts, 7-Day Challenge',
      'Planners and additional products',
      'Content Factory retainers after Phase 1',
    ],
    description: 'Anything beyond the shirt-site launch stays open. No Phase 3 price is committed yet.',
    hours: 0,
    rate: 0,
    baseAmount: 0,
  },
];

export function phase1LineItemTotal(
  items: { phase: string; baseAmount: number; visible?: boolean }[] = GEAR_SALES_LINE_ITEMS_SEED,
): number {
  return items
    .filter((item) => item.phase === 'phase1_build' && item.visible !== false)
    .reduce((sum, item) => sum + item.baseAmount, 0);
}

export function paymentScheduleTotal(
  schedule: readonly { amount: number }[] = PHASE_PAYMENT_SCHEDULE,
): number {
  return schedule.reduce((sum, row) => sum + row.amount, 0);
}

export interface ComplimentaryWorkItem {
  id: string;
  name: string;
  sprintId: 'sprint0' | 'sprint1' | 'sprint2';
  sprintLabel: string;
  retailAmount: number;
  chargedAmount: 0;
  complimentary: true;
}

export const COMPLIMENTARY_WORK: ComplimentaryWorkItem[] = [
  {
    id: 'comp-logo',
    name: 'Brand logo (wordmark + seal)',
    sprintId: 'sprint0',
    sprintLabel: 'Sprint 0',
    retailAmount: 1_200,
    chargedAmount: 0,
    complimentary: true,
  },
  {
    id: 'comp-mockups',
    name: 'Apparel mockup set (tees, hoodie, hat)',
    sprintId: 'sprint1',
    sprintLabel: 'Sprint 1',
    retailAmount: 1_800,
    chargedAmount: 0,
    complimentary: true,
  },
  {
    id: 'comp-hosting',
    name: 'Phase 1 merch hosting on Evelyn’s site',
    sprintId: 'sprint0',
    sprintLabel: 'Sprint 0',
    retailAmount: 750,
    chargedAmount: 0,
    complimentary: true,
  },
];

export function formatUsdAmount(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

export function complimentaryRetailTotal(
  items: { retailAmount: number }[] = COMPLIMENTARY_WORK,
): number {
  return items.reduce((sum, item) => sum + item.retailAmount, 0);
}
