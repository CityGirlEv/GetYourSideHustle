import {
  clickStepForLink,
  footerPublicLinkDestinations,
  headerPublicLinkDestinations,
  inPageCollectionLinkDestinations,
  publicSitemapLinkDestinations,
} from './siteLinkDestinations';
import { TODAYS_NEW_TEST_PARENT_DUE, TODAYS_NEW_TEST_SPRINT, dueDateForTodaysNewTest } from './todaysReviewDueDates';

export const SPRINT_2_WEBSITE_REVIEW_TASK_ID = 't-204';
export const SPRINT_2_WEBSITE_REVIEW_TASK_HREF = '/sitemap';
export const SPRINT_2_WEBSITE_REVIEW_SPRINT = TODAYS_NEW_TEST_SPRINT;
export const SPRINT_2_WEBSITE_REVIEW_ASSIGNEE = 'angela' as const;

export type Sprint2WebsiteReviewPage = {
  id: string;
  title: string;
  path: string;
  desc: string;
  contentChecks: Array<string | { label: string; href?: string }>;
};

export type Sprint2WebsiteReviewQaSeed = {
  id: string;
  title: string;
  desc: string;
  sprint: typeof SPRINT_2_WEBSITE_REVIEW_SPRINT;
  phase: 'Phase 1';
  category: 'Storefront QA';
  priority: 'high';
  status: 'untested';
  assignee: typeof SPRINT_2_WEBSITE_REVIEW_ASSIGNEE;
  assignor: 'evelyn';
  dueDate: string;
};

export type Sprint2WebsiteReviewContentSeed = {
  description: string;
  steps: Array<string | { label: string; href?: string }>;
};

const COPY_A_TO_Z_CHECK =
  'Read every heading and body block A to Z. Check wording, grammar, and punctuation. Flag typos, missing words, placeholder copy, DEMO DATA that should not ship, and broken or missing images';
const MOBILE_LAYOUT_CHECK =
  'On a phone-width (~320px), confirm no horizontal scroll and primary taps are at least 44×44';

export const SPRINT_2_WEBSITE_REVIEW_PAGES: Sprint2WebsiteReviewPage[] = [
  {
    id: 's2web-home',
    title: 'Home — wording, grammar, punctuation, content A to Z',
    path: '/',
    desc: 'Read the full Home page. Check every line of copy, then confirm header and in-page links.',
    contentChecks: [
      'Confirm the brand line (Feel it. Follow the plan anyway) is visible and punctuated correctly',
      'Read the hero, mood tool, receipts, mailing list, and any remaining Home blocks A to Z',
      'Confirm public nav has no List link (List is Admin only)',
    ],
  },
  {
    id: 's2web-gear',
    title: 'Accountability Gear — wording, grammar, punctuation, content A to Z',
    path: '/gear',
    desc: 'Read Shop Gear / Accountability Gear end to end, including collection links.',
    contentChecks: [
      'Read every heading, product name, and body line on /gear',
      { label: 'Click All Gear and confirm it opens the SnatchVault all-gear collection', href: 'https://snatchvault.com/collections/my-plan-gear' },
      { label: 'Click Hoodies and confirm it opens the SnatchVault hoodie collection', href: 'https://snatchvault.com/collections/my-plan-hoodie-collection' },
      { label: 'Click Hats and confirm it opens the SnatchVault hat collection', href: 'https://snatchvault.com/collections/my-plan-sports-hat' },
      { label: 'Click Tee Collection and confirm it opens the SnatchVault letter-tee collection', href: 'https://snatchvault.com/collections/non-negotiables-letter-tees' },
    ],
  },
  {
    id: 's2web-gear-hoodies',
    title: 'Shop Gear hoodies — wording, grammar, punctuation, content A to Z',
    path: '/gear/hoodies',
    desc: 'Read the hoodies collection page end to end.',
    contentChecks: ['Read every hoodie heading, listing, and caption', 'Confirm images and product links work'],
  },
  {
    id: 's2web-gear-hats',
    title: 'Shop Gear hats — wording, grammar, punctuation, content A to Z',
    path: '/gear/hats',
    desc: 'Read the hats collection page end to end.',
    contentChecks: ['Read every hat heading, listing, and caption', 'Confirm images and product links work'],
  },
  {
    id: 's2web-planners',
    title: 'Planners & Desk Pads — wording, grammar, punctuation, content A to Z',
    path: '/planners',
    desc: 'Read the Planners page reached from the header Shop menu and the footer.',
    contentChecks: [
      'Read every heading and body line',
      'Note whether planner products are live or still a later-phase discussion',
    ],
  },
  {
    id: 's2web-about',
    title: 'About — wording, grammar, punctuation, content A to Z',
    path: '/about',
    desc: 'Read About from the first heading to the last line, including captions.',
    contentChecks: [
      'Read the origin story, founder block, teaching, and Phase 1 copy for grammar and punctuation',
      'Confirm founder name, role, portrait, and public bio',
    ],
  },
  {
    id: 's2web-contact',
    title: 'Contact — wording, grammar, punctuation, content A to Z',
    path: '/contact',
    desc: 'Read Contact copy, form labels, and mailing list text end to end.',
    contentChecks: [
      'Read every heading, label, and helper line',
      'Confirm the form does not ask for phone, full address, or date of birth',
    ],
  },
  {
    id: 's2web-privacy',
    title: 'Privacy Policy — wording, grammar, punctuation, content A to Z',
    path: '/privacy-policy',
    desc: 'Read the Privacy Policy end to end, including the /privacy alias.',
    contentChecks: [
      { label: 'Open /privacy and confirm the same policy loads', href: '/privacy' },
      'Read Last updated and every policy heading and paragraph A to Z',
    ],
  },
  {
    id: 's2web-terms',
    title: 'Terms of Use — wording, grammar, punctuation, content A to Z',
    path: '/terms-of-use',
    desc: 'Read the Terms of Use end to end, including the /terms alias.',
    contentChecks: [
      { label: 'Open /terms and confirm the same terms load', href: '/terms' },
      'Read Last updated and every terms heading and paragraph A to Z',
    ],
  },
  {
    id: 's2web-faq',
    title: 'FAQ — wording, grammar, punctuation, content A to Z',
    path: '/faq',
    desc: 'Open every FAQ group and read every question and answer.',
    contentChecks: [
      'Read every FAQ question and answer A to Z for wording, grammar, and punctuation',
      'Flag any answer that still says ADMINISTRATOR REVIEW NEEDED',
    ],
  },
  {
    id: 's2web-join',
    title: 'Join / Memberships — wording, grammar, punctuation, content A to Z',
    path: '/join',
    desc: 'Read Join / Coming Soon copy. Confirm there is no live member checkout.',
    contentChecks: [
      'Read every Join heading, perk line, and Coming Soon note',
      'Confirm every Join button is disabled and there is no live member checkout',
    ],
  },
  {
    id: 's2web-pay',
    title: 'Make Payment — wording, grammar, punctuation, content A to Z',
    path: '/pay',
    desc: 'Read Make Payment copy and method labels from the footer click.',
    contentChecks: [
      'Read every payment heading, amount, and method line',
      'Confirm Zelle and Cash App are preferred and readable',
    ],
  },
  {
    id: 's2web-sitemap',
    title: 'Site Map — wording, grammar, punctuation, content A to Z',
    path: '/sitemap',
    desc: 'Read the Site Map page, then click every listed public page and confirm the landing path.',
    contentChecks: [
      'Read the site-structure intro and every branch label',
      'Click each listed public page and confirm it opens the path shown on the map',
    ],
  },
  {
    id: 's2web-beta',
    title: 'Beta Tester Rewards — wording, grammar, punctuation, content A to Z',
    path: '/beta-rewards',
    desc: 'Read Beta Tester Rewards copy from the footer click.',
    contentChecks: [
      'Read the rewards heading, table, and how-credits-are-earned copy A to Z',
      { label: 'Open the /beta-tester-rewards alias and confirm the same page loads', href: '/beta-tester-rewards' },
    ],
  },
  {
    id: 's2web-list',
    title: 'Mailing List page — wording, grammar, punctuation, content A to Z',
    path: '/list',
    desc: 'Read /list copy. Confirm it is not in the public header or footer.',
    contentChecks: [
      'Read every mailing-list heading and helper line',
      'Confirm the public header and footer have no List link — List stays under Admin',
    ],
  },
];

const HEADER_LINKS_TEST: Sprint2WebsiteReviewPage = {
  id: 's2web-header-links',
  title: 'Header — every link goes where it should',
  path: '/',
  desc: 'From Home, click every public header control. Confirm each landing page, hash, lock, or disabled Coming Soon state.',
  contentChecks: headerPublicLinkDestinations().map(clickStepForLink),
};

const FOOTER_LINKS_TEST: Sprint2WebsiteReviewPage = {
  id: 's2web-footer-links',
  title: 'Footer — every link goes where it should',
  path: '/',
  desc: 'From Home, click every public footer control and confirm each landing page.',
  contentChecks: footerPublicLinkDestinations().map(clickStepForLink),
};

const SITEMAP_LINKS_TEST: Sprint2WebsiteReviewPage = {
  id: 's2web-sitemap-links',
  title: 'Site Map — every listed public page opens the mapped path',
  path: '/sitemap',
  desc: 'Open Site Map and click every public leaf that shows a path. Confirm the URL matches the map.',
  contentChecks: [
    { label: 'Open Site Map', href: '/sitemap' },
    ...publicSitemapLinkDestinations().map(
      (link) => `On Site Map, click “${link.label}” and confirm it lands on ${link.expectedPath}`,
    ),
    ...inPageCollectionLinkDestinations().map(clickStepForLink),
  ],
};

function pageContentSeed(page: Sprint2WebsiteReviewPage): Sprint2WebsiteReviewContentSeed {
  return {
    description: page.desc,
    steps: [
      { label: `Open ${page.title.split(' — ')[0]}`, href: page.path },
      COPY_A_TO_Z_CHECK,
      ...page.contentChecks,
      MOBILE_LAYOUT_CHECK,
    ],
  };
}

export const SPRINT_2_WEBSITE_REVIEW_SPECS: Sprint2WebsiteReviewPage[] = [
  ...SPRINT_2_WEBSITE_REVIEW_PAGES,
  HEADER_LINKS_TEST,
  FOOTER_LINKS_TEST,
  SITEMAP_LINKS_TEST,
];

export function sprint2WebsiteReviewTestIds(): string[] {
  return SPRINT_2_WEBSITE_REVIEW_SPECS.map((spec) => spec.id);
}

export function sprint2WebsiteReviewTestCount(): number {
  return SPRINT_2_WEBSITE_REVIEW_SPECS.length;
}

export function sprint2WebsiteReviewTaskTitle(count = sprint2WebsiteReviewTestCount()): string {
  return `Sprint 2 Website Review (${count} tests)`;
}

export function buildSprint2WebsiteReviewQaSeeds(): Sprint2WebsiteReviewQaSeed[] {
  return SPRINT_2_WEBSITE_REVIEW_SPECS.map((spec, index) => ({
    id: spec.id,
    title: spec.title,
    desc: spec.desc,
    sprint: SPRINT_2_WEBSITE_REVIEW_SPRINT,
    phase: 'Phase 1',
    category: 'Storefront QA',
    priority: 'high',
    status: 'untested',
    assignee: SPRINT_2_WEBSITE_REVIEW_ASSIGNEE,
    assignor: 'evelyn',
    dueDate: dueDateForTodaysNewTest(index),
  }));
}

export function buildSprint2WebsiteReviewTask(): {
  id: string;
  title: string;
  sprint: typeof SPRINT_2_WEBSITE_REVIEW_SPRINT;
  phase: 'Phase 1';
  category: 'QA & Testing';
  priority: 'high';
  status: 'not_started';
  assignee: typeof SPRINT_2_WEBSITE_REVIEW_ASSIGNEE;
  assignor: 'evelyn';
  dueDate: string;
} {
  return {
    id: SPRINT_2_WEBSITE_REVIEW_TASK_ID,
    title: sprint2WebsiteReviewTaskTitle(),
    sprint: SPRINT_2_WEBSITE_REVIEW_SPRINT,
    phase: 'Phase 1',
    category: 'QA & Testing',
    priority: 'high',
    status: 'not_started',
    assignee: SPRINT_2_WEBSITE_REVIEW_ASSIGNEE,
    assignor: 'evelyn',
    dueDate: TODAYS_NEW_TEST_PARENT_DUE,
  };
}

export function sprint2WebsiteReviewTaskContent(): Sprint2WebsiteReviewContentSeed {
  const count = sprint2WebsiteReviewTestCount();
  return {
    description: `Angela reads every public page A to Z (${SPRINT_2_WEBSITE_REVIEW_PAGES.length} pages) and confirms every header, footer, and Site Map link lands where it should. ${count} website tests are attached to this task. Check wording, grammar, punctuation, and content on each page.`,
    steps: [
      { label: 'Open Site Map and start the Sprint 2 website walkthrough', href: '/sitemap' },
      `Open Testing Portal and work the ${count} linked website tests on this task`,
      'Pass or fail each page after reading all wording, grammar, punctuation, and content A to Z',
      'Click every header link (s2web-header-links) and confirm each landing page',
      'Click every footer link (s2web-footer-links) and confirm each landing page',
      'On Site Map, click every listed public page (s2web-sitemap-links) and confirm the mapped path',
    ],
  };
}

export function sprint2WebsiteReviewPageHrefs(): Record<string, string> {
  return {
    [SPRINT_2_WEBSITE_REVIEW_TASK_ID]: SPRINT_2_WEBSITE_REVIEW_TASK_HREF,
    ...Object.fromEntries(SPRINT_2_WEBSITE_REVIEW_SPECS.map((spec) => [spec.id, spec.path])),
  };
}

export function sprint2WebsiteReviewQaContent(): Record<string, Sprint2WebsiteReviewContentSeed> {
  return Object.fromEntries(SPRINT_2_WEBSITE_REVIEW_SPECS.map((spec) => [spec.id, pageContentSeed(spec)]));
}
