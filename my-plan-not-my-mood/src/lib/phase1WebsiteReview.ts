import { FOOTER_COMMON_LINK_IDS, launchPageById } from './launchPages';
import { AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE } from './membership';
import { inPageCollectionLinkDestinations } from './siteLinkDestinations';
import { HEADER_PUBLIC_LINKS, routePath, type StoreRoute } from './storeRoutes';
import { INCLUDED_WEBSITE_PAGES } from './websiteScope';
import { TODAYS_NEW_TEST_PARENT_DUE, dueDateForTodaysNewTest } from './todaysReviewDueDates';

export const PHASE_1_WEBSITE_REVIEW_TASK_ID = 't-203';
export const PHASE_1_WEBSITE_REVIEW_TASK_HREF = '/';
export const PHASE_1_WEBSITE_REVIEW_SPRINT = 'Sprint 3' as const;
export const PHASE_1_WEBSITE_REVIEW_ASSIGNEE = 'angela' as const;

export type Phase1NavClick = {
  id: string;
  area: 'header' | 'footer' | 'in-page';
  label: string;
  path: string;
  gatedToJoin?: boolean;
};

export type Phase1WebsiteReviewPage = {
  id: string;
  title: string;
  path: string;
  desc: string;
  contentChecks: Array<string | { label: string; href?: string }>;
};

export type Phase1WebsiteReviewQaSeed = {
  id: string;
  title: string;
  desc: string;
  sprint: typeof PHASE_1_WEBSITE_REVIEW_SPRINT;
  phase: 'Phase 1';
  category: 'Storefront QA';
  priority: 'high';
  status: 'untested';
  assignee: typeof PHASE_1_WEBSITE_REVIEW_ASSIGNEE;
  assignor: 'evelyn';
  dueDate: string;
};

export type Phase1WebsiteReviewContentSeed = {
  description: string;
  steps: Array<string | { label: string; href?: string }>;
};

const MOBILE_LAYOUT_CHECK = 'On a phone-width (~320px), confirm no horizontal scroll and primary taps are at least 44×44';
const COPY_REVIEW_CHECK =
  'Read every heading and body block. Flag typos, placeholder copy, DEMO DATA that should not ship, and broken or missing images';

export const PHASE_1_NAV_CLICKS: Phase1NavClick[] = [
  { id: 'header-home', area: 'header', label: 'Logo / Home', path: '/' },
  ...HEADER_PUBLIC_LINKS.map((link) => ({
    id: `header-${link.route}`,
    area: 'header' as const,
    label: link.label,
    path: routePath(link.route as StoreRoute),
  })),
  { id: 'header-gear', area: 'header', label: 'Shop Gear', path: '/gear' },
  { id: 'header-mood', area: 'header', label: "What's Your Mood?", path: '/#mood-tool' },
  { id: 'header-receipts', area: 'header', label: 'Plan Receipts', path: '/#receipts' },
  {
    id: 'header-affirmations',
    area: 'header',
    label: 'Affirmations (Join to Unlock)',
    path: '/join',
    gatedToJoin: true,
  },
  {
    id: 'header-challenge',
    area: 'header',
    label: '7-Day Challenge (Join to Unlock)',
    path: '/join',
    gatedToJoin: true,
  },
  { id: 'footer-gear', area: 'footer', label: 'Shop Gear', path: '/gear' },
  { id: 'footer-planners', area: 'footer', label: 'Planners & Desk Pads', path: '/planners' },
  { id: 'footer-collections', area: 'footer', label: 'All Collections', path: '/gear' },
  { id: 'footer-sitemap', area: 'footer', label: 'Site Map', path: '/sitemap' },
  ...FOOTER_COMMON_LINK_IDS.map((id) => ({
    id: `footer-${id}`,
    area: 'footer' as const,
    label: launchPageById(id).navLabel ?? launchPageById(id).title,
    path: launchPageById(id).path,
  })),
  { id: 'footer-pay', area: 'footer', label: 'Make Payment', path: '/pay' },
  { id: 'footer-beta', area: 'footer', label: 'Beta Tester Rewards', path: '/beta-rewards' },
  { id: 'footer-mood', area: 'footer', label: 'Is Your Mood Your Plan? Tool', path: '/#mood-tool' },
  { id: 'footer-receipts', area: 'footer', label: '"What Won Today?" Receipt Builder', path: '/#receipts' },
  { id: 'footer-challenge', area: 'footer', label: '7-Day Challenge (Join to Unlock)', path: '/join', gatedToJoin: true },
  ...inPageCollectionLinkDestinations().map((link) => ({
    id: link.id,
    area: 'in-page' as const,
    label: link.label,
    path: link.expectedPath,
  })),
];

export const PHASE_1_WEBSITE_REVIEW_PAGES: Phase1WebsiteReviewPage[] = [
  {
    id: 'p1web-home',
    title: 'Home / storefront — content and clicks',
    path: '/',
    desc: 'Review all Home copy, brand line, mood tool, receipts, mailing list, and Shop Gear entry.',
    contentChecks: [
      'Confirm the brand line (Feel it. Follow the plan anyway) is visible',
      'Walk What’s Your Mood and What Won Today — they are on Home, not separate membership tools',
      'Confirm mailing list sign-up is present and is not a membership',
      'Confirm public nav has no List link (List is Admin only)',
      'Click Shop Gear from Home and confirm it lands on /gear',
    ],
  },
  {
    id: 'p1web-gear',
    title: 'Shop Gear — content and collection clicks',
    path: '/gear',
    desc: 'Review Shop Gear copy, images, and collection cards that open the live store.',
    contentChecks: [
      'Confirm Accountability Gear / Shop Gear heading and collection cards',
      'Click All Gear, Hoodies, Hats, and Tee Collection and confirm each opens the matching SnatchVault collection',
      'Confirm Shopify / order links are the live shop, not a dead button',
    ],
  },
  {
    id: 'p1web-gear-hoodies',
    title: 'Shop Gear hoodies — content',
    path: '/gear/hoodies',
    desc: 'Review the hoodies collection page copy, images, and links.',
    contentChecks: [
      'Confirm the hoodies collection loads with hoodie-related copy or listings',
      'Confirm images and product links work',
    ],
  },
  {
    id: 'p1web-gear-hats',
    title: 'Shop Gear hats — content',
    path: '/gear/hats',
    desc: 'Review the hats collection page copy, images, and links.',
    contentChecks: [
      'Confirm the hats collection loads with hat-related copy or listings',
      'Confirm images and product links work',
    ],
  },
  {
    id: 'p1web-about',
    title: 'About — full content review',
    path: '/about',
    desc: 'Read the About page end to end: origin story, founder, Phase 1, and images.',
    contentChecks: [
      'Confirm “Where the idea came from” includes Angela’s niece origin',
      'Confirm founder name, role, portrait, and public bio',
      'Confirm Phase 1 copy: gear-sales site, memberships Coming Soon, mailing list is not a membership',
    ],
  },
  {
    id: 'p1web-contact',
    title: 'Contact — full content review',
    path: '/contact',
    desc: 'Read Contact copy, send-path, form, and mailing list.',
    contentChecks: [
      'Confirm brand/website contact email and that phone / full address / DOB are not requested',
      'Confirm Orders copy points to SnatchVault, not a fake in-house checkout',
      'Confirm the contact form and mailing list are present',
    ],
  },
  {
    id: 'p1web-privacy',
    title: 'Privacy Policy — full content review',
    path: '/privacy',
    desc: 'Read the Privacy Policy end to end, including the /privacy-policy alias.',
    contentChecks: [
      { label: 'Open the /privacy-policy alias and confirm the same policy loads', href: '/privacy-policy' },
      'Confirm Last updated and every policy heading is readable',
      'Confirm mailing list is not described as a membership',
      'Confirm SnatchVault is named as the order store',
    ],
  },
  {
    id: 'p1web-terms',
    title: 'Terms of Use — full content review',
    path: '/terms',
    desc: 'Read the Terms of Use end to end, including the /terms-of-use alias.',
    contentChecks: [
      { label: 'Open the /terms-of-use alias and confirm the same terms load', href: '/terms-of-use' },
      'Confirm Last updated and every terms heading is readable',
    ],
  },
  {
    id: 'p1web-faq',
    title: 'FAQ — full content review',
    path: '/faq',
    desc: 'Read every FAQ group and answer.',
    contentChecks: [
      'Confirm About the brand answers (My Plan, Non-Negotiable, who it is for)',
      'Confirm order / SnatchVault answers',
      'Confirm memberships are Coming Soon and mailing list is not a membership',
    ],
  },
  {
    id: 'p1web-join',
    title: 'Join / Memberships — Coming Soon and perk copy',
    path: '/join',
    desc: 'Confirm Join is Coming Soon with no live checkout, and Affirmations stay a membership perk.',
    contentChecks: [
      'Confirm Coming Soon is visible and every Join button is disabled',
      'Confirm no live member checkout',
      `Confirm this page states: ${AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE}`,
    ],
  },
  {
    id: 'p1web-list',
    title: 'Mailing list — email capture, not a membership',
    path: '/',
    desc: 'Review mailing list copy and sign-up on Home and Contact. List is not a public menu item.',
    contentChecks: [
      { label: 'Confirm the Home mailing list is email + optional first name, not Join', href: '/' },
      { label: 'Confirm the Contact mailing list is the same and does not open memberships', href: '/contact' },
      'Confirm the public header/footer has no List link',
    ],
  },
  {
    id: 'p1web-pay',
    title: 'Make Payment — content review',
    path: '/pay',
    desc: 'Review Make Payment copy and payment methods from the footer click.',
    contentChecks: [
      'Confirm Payment 3 / remaining Phase 1 amount matches the plan',
      'Confirm Zelle and Cash App are preferred and readable',
    ],
  },
  {
    id: 'p1web-sitemap',
    title: 'Site Map — content review',
    path: '/sitemap',
    desc: 'Review the public Site Map structure and that listed public pages match live clicks.',
    contentChecks: [
      'Confirm the site-structure intro is visible',
      'Click a sample of listed public pages and confirm they load',
    ],
  },
  {
    id: 'p1web-planners',
    title: 'Planners & Desk Pads — content review',
    path: '/planners',
    desc: 'Review the Planners page reached from the footer. Flag if it should stay Phase 3.',
    contentChecks: [
      'Confirm the page loads from the footer Planners click',
      'Note whether planner products are live or still a Phase 3 discussion',
    ],
  },
  {
    id: 'p1web-beta',
    title: 'Beta Tester Rewards — content review',
    path: '/beta-rewards',
    desc: 'Review Beta Tester Rewards copy from the footer click.',
    contentChecks: [
      'Confirm the rewards heading and how credits are earned',
      'Confirm memberships are still Coming Soon in that copy',
    ],
  },
];

const CLICKS_TEST: Phase1WebsiteReviewPage = {
  id: 'p1web-clicks',
  title: 'Click every header, footer, and Shop Gear collection link',
  path: '/',
  desc: 'From Home, click every public header and footer control and every Shop Gear collection link. Confirm each landing page.',
  contentChecks: PHASE_1_NAV_CLICKS.map((click) =>
    click.gatedToJoin
      ? `Click ${click.area} “${click.label}” and confirm it goes to Join / Coming Soon — not a free public tool`
      : `Click ${click.area} “${click.label}” and confirm it lands on ${click.path}`,
  ),
};

const AFFIRMATIONS_TEST: Phase1WebsiteReviewPage = {
  id: 'p1web-affirmations-scope',
  title: 'Affirmations stay membership — free public access is a scope change',
  path: '/',
  desc: AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE,
  contentChecks: [
    'On Home, click Affirmations in the top header while logged out — you should land on Join / Coming Soon. A box of today’s affirmations should not appear on top of the page.',
    'Confirm Affirmations and 7-Day Challenge in the header show a lock or say Join to Unlock.',
    'If Angela wants Affirmations free on the public site, mark this test as a scope change — do not treat it as Phase 1 included work',
  ],
};

function pageContentSeed(page: Phase1WebsiteReviewPage): Phase1WebsiteReviewContentSeed {
  return {
    description: page.desc,
    steps: [
      { label: `Open ${page.title.split(' — ')[0]}`, href: page.path },
      COPY_REVIEW_CHECK,
      ...page.contentChecks,
      MOBILE_LAYOUT_CHECK,
    ],
  };
}

export const PHASE_1_WEBSITE_REVIEW_SPECS: Phase1WebsiteReviewPage[] = [
  ...PHASE_1_WEBSITE_REVIEW_PAGES,
  CLICKS_TEST,
  AFFIRMATIONS_TEST,
];

export function phase1WebsiteReviewTestIds(): string[] {
  return PHASE_1_WEBSITE_REVIEW_SPECS.map((spec) => spec.id);
}

export function phase1WebsiteReviewTestCount(): number {
  return PHASE_1_WEBSITE_REVIEW_SPECS.length;
}

export function phase1WebsiteReviewTaskTitle(
  count = phase1WebsiteReviewTestCount(),
): string {
  return `Phase 1 Website Review (${count} tests)`;
}

export function buildPhase1WebsiteReviewQaSeeds(): Phase1WebsiteReviewQaSeed[] {
  return PHASE_1_WEBSITE_REVIEW_SPECS.map((spec, index) => ({
    id: spec.id,
    title: spec.title,
    desc: spec.desc,
    sprint: PHASE_1_WEBSITE_REVIEW_SPRINT,
    phase: 'Phase 1',
    category: 'Storefront QA',
    priority: 'high',
    status: 'untested',
    assignee: PHASE_1_WEBSITE_REVIEW_ASSIGNEE,
    assignor: 'evelyn',
    dueDate: dueDateForTodaysNewTest(index),
  }));
}

export function buildPhase1WebsiteReviewTask(): {
  id: string;
  title: string;
  sprint: typeof PHASE_1_WEBSITE_REVIEW_SPRINT;
  phase: 'Phase 1';
  category: 'QA & Testing';
  priority: 'high';
  status: 'not_started';
  assignee: typeof PHASE_1_WEBSITE_REVIEW_ASSIGNEE;
  assignor: 'evelyn';
  dueDate: string;
} {
  return {
    id: PHASE_1_WEBSITE_REVIEW_TASK_ID,
    title: phase1WebsiteReviewTaskTitle(),
    sprint: PHASE_1_WEBSITE_REVIEW_SPRINT,
    phase: 'Phase 1',
    category: 'QA & Testing',
    priority: 'high',
    status: 'not_started',
    assignee: PHASE_1_WEBSITE_REVIEW_ASSIGNEE,
    assignor: 'evelyn',
    dueDate: TODAYS_NEW_TEST_PARENT_DUE,
  };
}

export function phase1WebsiteReviewTaskContent(): Phase1WebsiteReviewContentSeed {
  const count = phase1WebsiteReviewTestCount();
  return {
    description: `Angela reviews every Phase 1 public page (${INCLUDED_WEBSITE_PAGES.length} included launch pages plus every header/footer click destination). ${count} website tests are attached to this task. Read all content. Click every public control and confirm the landing page. ${AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE}`,
    steps: [
      { label: 'Open Home and start the Phase 1 website walkthrough', href: '/' },
      `Open Testing Portal and work the ${count} linked website tests on this task`,
      'Pass or fail each page after reading all content on that page',
      'Click every header and footer link (p1web-clicks) and confirm each landing page',
      'Confirm Affirmations and the 7-Day Challenge stay Join to Unlock unless Angela files a scope change to offer them free',
    ],
  };
}

export function phase1WebsiteReviewPageHrefs(): Record<string, string> {
  return {
    [PHASE_1_WEBSITE_REVIEW_TASK_ID]: PHASE_1_WEBSITE_REVIEW_TASK_HREF,
    ...Object.fromEntries(PHASE_1_WEBSITE_REVIEW_SPECS.map((spec) => [spec.id, spec.path])),
  };
}

export function phase1WebsiteReviewQaContent(): Record<string, Phase1WebsiteReviewContentSeed> {
  return Object.fromEntries(PHASE_1_WEBSITE_REVIEW_SPECS.map((spec) => [spec.id, pageContentSeed(spec)]));
}

export function headerPublicClickPaths(): string[] {
  return HEADER_PUBLIC_LINKS.map((link) => routePath(link.route as StoreRoute));
}

export function footerCommonClickPaths(): string[] {
  return FOOTER_COMMON_LINK_IDS.map((id) => launchPageById(id).path);
}
