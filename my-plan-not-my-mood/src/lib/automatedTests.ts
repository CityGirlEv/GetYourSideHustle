/**
 * Automated test catalog for the Testing Portal.
 * One Vitest case per unit-test area; one Playwright case per e2e spec.
 * These are NOT Angela/Evelyn walkthroughs.
 */

import type { TestSuite } from './testSuites';

export interface AutomatedTestSeed {
  id: string;
  suite: Exclude<TestSuite, 'manual'>;
  title: string;
  description: string;
  desc: string;
  sprint: 'Sprint 0' | 'Sprint 1' | 'Sprint 2' | 'Sprint 3' | 'Sprint 4';
  category: 'Vitest' | 'Playwright';
  command: string;
}

export const AUTOMATED_VITEST_SEEDS: AutomatedTestSeed[] = [
  {
    id: 'VT-AUTH-001',
    suite: 'vitest',
    title: 'Auth, session, membership, and admin gates',
    description: 'Unit coverage for login, portal session, password reset, RBAC, and membership helpers.',
    desc: 'bun run test — src/lib/__tests__/userAuth.test.ts, adminAuth, portalSession, passwordReset, loginFields, phoneNumber, seedAccounts, userAdminGates, userAuditLog, membership, sessionIdle',
    sprint: 'Sprint 3',
    category: 'Vitest',
    command: 'bun run test',
  },
  {
    id: 'VT-BOARD-001',
    suite: 'vitest',
    title: 'Task & QA work board store',
    description: 'Board filters, seed merge, checklist gates, and shared D1 persist helpers.',
    desc: 'bun run test — workBoard, workBoardStore, workChecklist, workAttachments, workNoteEntries, workItemContentSeed',
    sprint: 'Sprint 1',
    category: 'Vitest',
    command: 'bun run test',
  },
  {
    id: 'VT-EMAIL-001',
    suite: 'vitest',
    title: 'Email templates, preview, and send payload',
    description: 'Phase 1 email chrome, templates, notifications, and send settings.',
    desc: 'bun run test — src/lib/email/__tests__',
    sprint: 'Sprint 3',
    category: 'Vitest',
    command: 'bun run test',
  },
  {
    id: 'VT-GEAR-001',
    suite: 'vitest',
    title: 'Gear selections, store, and sales plan',
    description: 'Style cards, pick limits, merch families, accessories, and ROI helpers.',
    desc: 'bun run test — gearSelections, gearStore, merchStyleFamily, accessories, gearSalesPlan',
    sprint: 'Sprint 1',
    category: 'Vitest',
    command: 'bun run test',
  },
  {
    id: 'VT-ASSETS-001',
    suite: 'vitest',
    title: 'Asset library, logos, and image gates',
    description: 'Uploads, watermarks, previews, PDF export, and folder import limits.',
    desc: 'bun run test — assetLibrary, logoConcepts, logoStore, imagePreview, imageWatermark, assetImagePdf, uploadLimits, localFolder, spaAssets, collectionPhotos',
    sprint: 'Sprint 1',
    category: 'Vitest',
    command: 'bun run test',
  },
  {
    id: 'VT-PLAN-001',
    suite: 'vitest',
    title: 'Plan, budget, agenda, and IP documents',
    description: 'Implementation plan math, sprint agenda, and proposal document rows.',
    desc: 'bun run test — planPage, budgetEditions, phasePayments, proposalDocumentRows, sprintAgenda, sprintCalendar, ipToc, ipTechStack, sprintRoi',
    sprint: 'Sprint 1',
    category: 'Vitest',
    command: 'bun run test',
  },
  {
    id: 'VT-SITE-001',
    suite: 'vitest',
    title: 'Storefront routes, brand UI, and Content Factory',
    description: 'SPA routes, sitemap, brand tokens, header clearance, and organic calendar.',
    desc: 'bun run test — storeRoutes, siteMap, siteLinkDestinations, brandUi, headerClearance, contentFactory, clientIdentity, vercelConfig, mailingList, siteAnalyticsCadence',
    sprint: 'Sprint 1',
    category: 'Vitest',
    command: 'bun run test',
  },
  {
    id: 'VT-AFFIRM-001',
    suite: 'vitest',
    title: 'Daily affirmations rotation',
    description: 'Session pools, weighting, skip, and daily completion state.',
    desc: 'bun run test — src/lib/__tests__/affirmations.test.ts',
    sprint: 'Sprint 2',
    category: 'Vitest',
    command: 'bun run test',
  },
  {
    id: 'VT-CART-001',
    suite: 'vitest',
    title: 'Store cart helpers',
    description: 'Cart add/update/remove unit coverage.',
    desc: 'bun run test — src/__tests__/store.test.ts, src/lib/__tests__/moodShake.test.ts',
    sprint: 'Sprint 2',
    category: 'Vitest',
    command: 'bun run test',
  },
];

export const AUTOMATED_PLAYWRIGHT_SEEDS: AutomatedTestSeed[] = [
  {
    id: 'PW-HOME-001',
    suite: 'playwright',
    title: 'Home storefront loads brand line',
    description: 'Chromium opens / and sees the brand line and Shop Gear entry.',
    desc: 'bun run e2e — e2e/smoke.spec.ts home',
    sprint: 'Sprint 1',
    category: 'Playwright',
    command: 'bun run e2e',
  },
  {
    id: 'PW-GEAR-001',
    suite: 'playwright',
    title: 'Shop Gear page loads',
    description: 'Chromium opens /gear and sees the Shopify tee page link.',
    desc: 'bun run e2e — e2e/smoke.spec.ts gear',
    sprint: 'Sprint 2',
    category: 'Playwright',
    command: 'bun run e2e',
  },
  {
    id: 'PW-PAY-001',
    suite: 'playwright',
    title: 'Make Payment page shows Zelle',
    description: 'Chromium opens /pay and sees a preferred payment method.',
    desc: 'bun run e2e — e2e/smoke.spec.ts pay',
    sprint: 'Sprint 1',
    category: 'Playwright',
    command: 'bun run e2e',
  },
  {
    id: 'PW-JOIN-001',
    suite: 'playwright',
    title: 'Join / Memberships is Coming Soon',
    description: 'Chromium opens /join and sees Coming Soon — no live signup.',
    desc: 'bun run e2e — e2e/smoke.spec.ts join',
    sprint: 'Sprint 3',
    category: 'Playwright',
    command: 'bun run e2e',
  },
  {
    id: 'PW-SITEMAP-001',
    suite: 'playwright',
    title: 'Sitemap page loads',
    description: 'Chromium opens /sitemap and sees the site structure.',
    desc: 'bun run e2e — e2e/smoke.spec.ts sitemap',
    sprint: 'Sprint 3',
    category: 'Playwright',
    command: 'bun run e2e',
  },
  {
    id: 'PW-SITEMAP-002',
    suite: 'playwright',
    title: 'Header, footer, and sitemap links land on mapped paths',
    description: 'Chromium clicks every public header and footer control and loads every Sprint 2 review page.',
    desc: 'bun run e2e — e2e/sitemap-links.spec.ts',
    sprint: 'Sprint 2',
    category: 'Playwright',
    command: 'bun run e2e',
  },
  {
    id: 'PW-ADMIN-001',
    suite: 'playwright',
    title: 'Admin Testing is gated',
    description: 'Anonymous /admin/testing shows sign-in, not the QA matrix.',
    desc: 'bun run e2e — e2e/smoke.spec.ts admin gate',
    sprint: 'Sprint 3',
    category: 'Playwright',
    command: 'bun run e2e',
  },
];

export const AUTOMATED_TEST_SEEDS: AutomatedTestSeed[] = [
  ...AUTOMATED_VITEST_SEEDS,
  ...AUTOMATED_PLAYWRIGHT_SEEDS,
];

export const AUTOMATED_TEST_IDS = new Set(AUTOMATED_TEST_SEEDS.map((seed) => seed.id));

export const VITEST_COMMAND = 'bun run test';
export const PLAYWRIGHT_COMMAND = 'bun run e2e';

export function isAutomatedCatalogId(id: string): boolean {
  const root = String(id || '').split('::')[0].trim();
  return AUTOMATED_TEST_IDS.has(root);
}
