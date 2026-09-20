import { SITE_ANALYTICS_SPRINT_DELIVERABLE } from './siteAnalyticsCadence';
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

export const TEE_SALES_VIDEOS_PER_SPRINT = 3;

export const TEE_SALES_VIDEOS_DELIVERABLE =
  'Create 3 T-shirt sales videos this sprint — shop link in each';

/** Phase 1 marketing videos for Angela — complimentary package, not the per-sprint tee-sales clips. */
export const MARKETING_VIDEOS_COUNT = 4;
export const MARKETING_VIDEOS_DELIVERABLE =
  '4 marketing videos — complimentary at no charge';
export const MARKETING_VIDEOS_COMP_NAME = '4 marketing videos (complimentary, no charge)';

const LEGACY_PROFESSIONAL_VIDEOS_DELIVERABLE =
  '3 professional videos — Evelyn delivered 4 at no charge';

export function upgradeDeliverableLabel(label: string): string {
  return label === LEGACY_PROFESSIONAL_VIDEOS_DELIVERABLE ? MARKETING_VIDEOS_DELIVERABLE : label;
}

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

export type PaymentInstallmentStatus = 'paid' | 'due' | 'upcoming';

export interface PhasePaymentInstallment {
  id: string;
  label: string;
  dueLabel: string;
  sprintLabel: 'Sprint 0' | 'Sprint 1' | 'Sprint 3';
  sprintId: 'sprint0' | 'sprint1' | 'sprint3';
  amount: number;
  percent: number;
  status: PaymentInstallmentStatus;
}

/** Angela sent Payment 2 on Friday Sep 18, 2026 (Sprint 2). */
export const PHASE_1_PAYMENT_2_RECEIVED_ISO = '2026-09-18';
export const PHASE_1_PAYMENT_2_RECEIVED_LABEL = 'Received Sep 18';

/** $10,000 Phase 1 fee in three payments — not Phase 2 / Phase 3 work. */
export const PHASE_PAYMENT_SCHEDULE: readonly PhasePaymentInstallment[] = [
  {
    id: 'pay-1',
    label: 'Payment 1',
    dueLabel: 'Received',
    sprintLabel: 'Sprint 0',
    sprintId: 'sprint0',
    amount: 3_500,
    percent: 35,
    status: 'paid',
  },
  {
    id: 'pay-2',
    label: 'Payment 2',
    dueLabel: PHASE_1_PAYMENT_2_RECEIVED_LABEL,
    sprintLabel: 'Sprint 1',
    sprintId: 'sprint1',
    amount: 3_500,
    percent: 35,
    status: 'paid',
  },
  {
    id: 'pay-3',
    label: 'Payment 3',
    dueLabel: 'Due Sprint 3',
    sprintLabel: 'Sprint 3',
    sprintId: 'sprint3',
    amount: 3_000,
    percent: 30,
    status: 'upcoming',
  },
];

/** Payment 1 + Payment 2 received. */
export const PHASE_1_PAID_TO_DATE = 7_000;

export const PAYMENT_STATUS_LABELS: Record<PaymentInstallmentStatus, string> = {
  paid: 'Paid',
  due: 'Due now',
  upcoming: 'Upcoming',
};

export function paymentSchedulePaid(
  schedule: readonly PhasePaymentInstallment[] = PHASE_PAYMENT_SCHEDULE,
): number {
  return schedule.filter((row) => row.status === 'paid').reduce((sum, row) => sum + row.amount, 0);
}

export function paymentScheduleRemaining(
  schedule: readonly PhasePaymentInstallment[] = PHASE_PAYMENT_SCHEDULE,
): number {
  return paymentScheduleTotal(schedule) - paymentSchedulePaid(schedule);
}

export function duePaymentInstallment(
  schedule: readonly PhasePaymentInstallment[] = PHASE_PAYMENT_SCHEDULE,
): PhasePaymentInstallment | undefined {
  return schedule.find((row) => row.status === 'due') ?? schedule.find((row) => row.status !== 'paid');
}

export function phase1PaidBudgetCopy(
  schedule: readonly PhasePaymentInstallment[] = PHASE_PAYMENT_SCHEDULE,
): string {
  const paid = formatUsdAmount(paymentSchedulePaid(schedule));
  const next = duePaymentInstallment(schedule);
  if (!next) return `${paid} is already paid.`;
  return `${paid} is already paid. ${next.label} (${formatUsdAmount(next.amount)}) is due ${next.sprintLabel}.`;
}

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
      'Angela $10,000 in three payments — $7,000 received; Payment 3 due Sprint 3',
      TEE_SALES_VIDEOS_DELIVERABLE,
      MARKETING_VIDEOS_DELIVERABLE,
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
      TEE_SALES_VIDEOS_DELIVERABLE,
      'Payment 2 ($3,500) received Sep 18 — Sprint 1 installment',
      SITE_ANALYTICS_SPRINT_DELIVERABLE,
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
      'Do not pause hoodie sales for page polish',
      TEE_SALES_VIDEOS_DELIVERABLE,
      SITE_ANALYTICS_SPRINT_DELIVERABLE,
    ],
    description: 'Sales stay on. Catalog and socials catch up around the live shop.',
    hours: 20,
    rate: GEAR_SALES_HOURLY_RATE,
    baseAmount: 2_000,
  },
  {
    id: 'sprint3',
    name: 'Sprint 3: Website, Mailing List & Orders',
    phase: 'phase1_build',
    duration: '1 Week',
    dates: sprintWindowById('sprint3')?.dates ?? 'Mon Sep 14 – Sun Sep 20, 2026',
    summary:
      'Introduce the Phase 1 website — About, Contact, Privacy Policy, Terms, FAQ — add mailing list sign-up (not a membership), and confirm Orders on SnatchVault (hosting, 70/30 split, Non-Negotiable menu).',
    deliverables: [
      'About page',
      'Contact page',
      'Privacy Policy and Terms of Use',
      'FAQ',
      'Join / Memberships page marked Coming Soon (not configured)',
      'Orders on SnatchVault: https://snatchvault.com/collections/my-plan-gear — Non-Negotiable menu, Tees / Hoodies / Hats, 70/30 split',
      TEE_SALES_VIDEOS_DELIVERABLE,
      'Introduce the Phase 1 website — launch pages go live on nonnegotiation.com',
      'Mailing list sign-up (email + optional first name — not a membership)',
      SITE_ANALYTICS_SPRINT_DELIVERABLE,
    ],
    description:
      'A real website needs About, Contact, Privacy, Terms, and FAQ. The mailing list captures email without opening memberships. Orders are hosted on SnatchVault. Memberships stay Coming Soon.',
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
      TEE_SALES_VIDEOS_DELIVERABLE,
      SITE_ANALYTICS_SPRINT_DELIVERABLE,
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
      'Each Phase 1 sprint lists organic ROI, expected hoodie sales ($55, about $35 to make, 70% of units), and suggestions to improve. Angela is fairly active on socials and has 6.2K personal Facebook followers — no paid ads. Refresh numbers when production costs and live sales are real.',
    deliverables: [
      'Per-sprint organic ROI and expected hoodie sales',
      'Suggestions to lift hoodie sales without paid ads',
      '6.2K Facebook / no paid ads assumptions',
      'Refresh after hoodie cost and first live orders',
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
      'Mood tools, planners, Content Factory retainers, and extra pages or emails are not in the $10K Phase 1 gear launch. Organic socials for hoodie sales are already in Phase 1.',
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
  {
    id: 'comp-videos',
    name: MARKETING_VIDEOS_COMP_NAME,
    sprintId: 'sprint0',
    sprintLabel: 'Sprint 0',
    retailAmount: 1_500,
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
