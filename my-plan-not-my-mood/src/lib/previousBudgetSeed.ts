import { sprintDatesForId, sprintWindowById } from './sprintCalendar';

/** Archived just before the Aug 27, 2026 4:00 PM Pacific kickoff. */
export const PREVIOUS_BUDGET_CAPTURED_AT = '2026-08-27T16:00:00-07:00';

export interface PreviousBudgetLineItemSeed {
  id: string;
  name: string;
  phase: 'phase1_build' | 'phase2_addons' | 'phase3_future';
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

const RATE = 85;

function dated(id: string, fallback: string): string {
  return sprintDatesForId(id) ?? sprintWindowById(id)?.dates ?? fallback;
}

/** Pre-meeting Financials budget: Phase 1 $17,800 + Phase 2 $6,200 = $24,000, 25% pre-pay. */
export const PREVIOUS_BUDGET_LINE_ITEMS_SEED: PreviousBudgetLineItemSeed[] = [
  {
    id: 'sprint0',
    name: 'Sprint 0: Infrastructure, Brand Foundation & Ad Setup',
    phase: 'phase1_build',
    duration: '1 Week',
    dates: dated('sprint0', 'Mon Aug 24 – Sun Aug 30, 2026'),
    summary:
      'Establish official brand foundation, domain registration, logo design system, and core Supabase backend infrastructure.',
    deliverables: [
      'Initial Consultation & Brand Discovery Session',
      'Project Kick-off & Sprint 0 Planning Ceremony',
      'Official Logo & Brand Seal Creation',
      'Alpha Prototype — Initial Platform Functionality (Complimentary)',
      'Stakeholder Alignment & Requirements Workshop',
      'Canonical Domain Registration & SSL Edge (nonnegotiation.com / localhost:3001)',
      'Brand Design System & Color Palette',
      'Supabase Database Schema & User Auth Engine',
      'Meta & TikTok Business Manager + Pixel & Ad Setup',
      'Sprint 0 Review, Demo & Retrospective',
    ],
    description:
      'Canonical domain setup (nonnegotiation.com / http://localhost:3001), logo pipeline, design system, Supabase DB & Auth, ad infrastructure',
    hours: 35,
    rate: RATE,
    baseAmount: 3_000,
  },
  {
    id: 'sprint1',
    name: 'Sprint 1: E-Commerce Storefront & Apparel/Planner Catalog',
    phase: 'phase1_build',
    duration: '1 Week',
    dates: dated('sprint1', 'Mon Aug 31 – Sun Sep 6, 2026'),
    summary:
      'Build the website page set (up to 15 included), e-commerce storefront UI, product catalog (Tees, Hoodies, Planners), and responsive checkout drawer.',
    deliverables: [
      'Sprint 1 Planning & Backlog Grooming Ceremony',
      'Storefront Project Kick-off & Design Review',
      'Apparel (Tees, Hoodies) & 2026 Daily Accountability Planner Product Catalog',
      'Interactive Product Preview Modals & Variant Customizer',
      'Shopping Cart Drawer & Stripe Payment Binding',
      'Sprint 1 Demo, QA Walkthrough & Retrospective',
      'Website page build (up to 15 included)',
    ],
    description:
      'Website build with up to 15 included pages. Storefront UI, catalog, cart drawer, Stripe checkout.',
    hours: 35,
    rate: RATE,
    baseAmount: 3_500,
  },
  {
    id: 'sprint2',
    name: 'Sprint 2: Digital Magic & Mood Selector Tool',
    phase: 'phase1_build',
    duration: '1 Week',
    dates: dated('sprint2', 'Mon Sep 7 – Sun Sep 13, 2026'),
    summary:
      "Develop interactive Mindset & Mood Selector Tool, 'What Won Today?' Digital Receipt Engine, and 7-Day Challenge.",
    deliverables: [
      'Interactive Mood Selection Matrix (/mood)',
      "'What Won Today?' Digital Accountability Receipt Generator",
      '7-Day Mindset Challenge Modal & Lead Opt-in Form',
    ],
    description:
      "Interactive Mood Selector (/mood), 'What Won Today?' Digital Receipt generator, 7-Day Challenge modal",
    hours: 32,
    rate: RATE,
    baseAmount: 3_200,
  },
  {
    id: 'sprint3',
    name: 'Sprint 3: Admin Command Suite & User Activation Engine',
    phase: 'phase1_build',
    duration: '1 Week',
    dates: dated('sprint3', 'Mon Sep 14 – Sun Sep 20, 2026'),
    summary:
      'Deploy gated Admin Command Portal, QA testing matrix, user activation, and email automation.',
    deliverables: [
      'Gated Admin Command Portal with Multi-Role Access & Account Activation Matrix',
      'Vitest Unit Test & Playwright E2E QA Testing Portal Matrix',
      'Klaviyo / Resend Transactional & Marketing Email Templates',
    ],
    description: 'Task List board, QA Testing Matrix, User RBAC & Activation, email templates',
    hours: 30,
    rate: RATE,
    baseAmount: 3_000,
  },
  {
    id: 'sprint4',
    name: 'Sprint 4: Hard Launch & Core Staging Deployment',
    phase: 'phase1_build',
    duration: '1 Week',
    dates: dated('sprint4', 'Mon Sep 21 – Sun Sep 27, 2026'),
    summary: 'Finalize Cloudflare Pages production deployment and execute live customer onboarding.',
    deliverables: [
      'Cloudflare Pages Production Deployment & SSL binding',
      'Live Customer Onboarding & Retainer Hand-off',
    ],
    description: 'Cloudflare Pages production deployment and live customer onboarding',
    hours: 18,
    rate: RATE,
    baseAmount: 2_400,
  },
  {
    id: 'arch',
    name: 'System Architecture & Cloud Setup',
    phase: 'phase1_build',
    duration: 'Included',
    dates: dated('arch', 'Sprint 0-1'),
    summary: 'Core cloud infra setup.',
    deliverables: ['Cloudflare DNS, SSL edge, Supabase DB design, Stripe payment binding'],
    description: 'Cloudflare DNS, SSL edge, Supabase DB design, Stripe payment binding, POD API setup',
    hours: 0,
    rate: 0,
    baseAmount: 1_500,
  },
  {
    id: 'design',
    name: 'UI/UX Design & Brand Asset Creation',
    phase: 'phase1_build',
    duration: 'Included',
    dates: dated('design', 'Sprint 0-1'),
    summary: 'Visual design system.',
    deliverables: ['E-commerce design system, logo processing, product mockups, email styling'],
    description: 'E-commerce design system, logo processing, product mockups, email template styling',
    hours: 0,
    rate: 0,
    baseAmount: 1_200,
  },
  {
    id: 'socials-ad-infra',
    name: 'Social Media Setup (TikTok, Facebook, YouTube) & Ad Management Infrastructure',
    phase: 'phase2_addons',
    duration: 'Phase 2 Add-On',
    dates: dated('socials-ad-infra', 'Post-Core Launch'),
    summary: 'Official social channels and paid-ad infrastructure after the core launch.',
    deliverables: [
      'Setup of Official Social Channels (TikTok, Facebook, YouTube)',
      'Meta & TikTok Business Manager + Pixel & Ad Management Infrastructure',
    ],
    description: 'Social channel setup and ad management infrastructure after Sprint 4.',
    hours: 20,
    rate: RATE,
    baseAmount: 1_700,
  },
  {
    id: 'content-factory-engine',
    name: 'Content Factory Engine & Short Video Prompts',
    phase: 'phase2_addons',
    duration: 'Phase 2 Add-On',
    dates: dated('content-factory-engine', 'Post-Core Launch'),
    summary: 'Daily social post creation, reels, and video prompts.',
    deliverables: [
      'Content Factory Engine for daily social post creation, reels, and video prompts',
    ],
    description: 'Content Factory automated post generator and short-video prompt library.',
    hours: 18,
    rate: RATE,
    baseAmount: 1_500,
  },
  {
    id: 'maint-website',
    name: 'Website & Platform Ongoing Maintenance Retainer',
    phase: 'phase2_addons',
    duration: 'Monthly Ongoing',
    dates: dated('maint-website', 'Post-Launch Retainer'),
    summary: '24/7 Platform monitoring, security patches, backups, uptime assurance, and performance optimization.',
    deliverables: [
      '24/7 Server & Domain Uptime Monitoring',
      'Weekly Security Patches, SSL Renewal & Database Backups',
      'Bug Fixes & Speed Performance Optimization',
    ],
    description:
      '24/7 Uptime monitoring, domain & SSL management, security updates, database backups, bug fixes & performance optimization',
    hours: 0,
    rate: 0,
    baseAmount: 1_200,
  },
  {
    id: 'maint-socials',
    name: 'Social Media Management & Content Factory Operations Retainer',
    phase: 'phase2_addons',
    duration: 'Monthly Ongoing',
    dates: dated('maint-socials', 'Post-Launch Retainer'),
    summary:
      'Daily Content Factory social posting across TikTok, Facebook, and YouTube, community management, and ad audience optimization.',
    deliverables: [
      'Daily Content Factory Social Posts across TikTok, Facebook & YouTube',
      'Community Engagement & Inbox Management',
      'Monthly Analytics Reporting & Ad Audience Optimization',
    ],
    description:
      'Daily Content Factory posting across TikTok, Facebook, and YouTube, community engagement management, ad audience optimization & monthly analytics reporting',
    hours: 0,
    rate: 0,
    baseAmount: 1_800,
  },
];

export function previousBudgetPhaseTotal(
  phase: PreviousBudgetLineItemSeed['phase'],
  items: PreviousBudgetLineItemSeed[] = PREVIOUS_BUDGET_LINE_ITEMS_SEED,
): number {
  return items
    .filter((item) => item.phase === phase && item.visible !== false)
    .reduce((sum, item) => sum + item.baseAmount, 0);
}

export function previousBudgetGrandTotal(
  items: PreviousBudgetLineItemSeed[] = PREVIOUS_BUDGET_LINE_ITEMS_SEED,
): number {
  return items.filter((item) => item.visible !== false).reduce((sum, item) => sum + item.baseAmount, 0);
}
