/**
 * Seeded overall descriptions + Task/Test Steps for the work board.
 * Step structure is Super Admin–editable; assignees check boxes.
 */

import {
  applyFirstStepPageHref,
  normalizeWorkChecklist,
  type WorkChecklistStep,
} from './workChecklist';
import {
  SITE_ANALYTICS_TASK_HREF,
  buildSiteAnalyticsInstances,
  siteAnalyticsContentSeed,
  siteAnalyticsTaskById,
} from './siteAnalyticsCadence';
import {
  TEE_SALES_BIO_LINE,
  TEE_SALES_LIVE_NO_SAMPLE,
  TEE_SALES_LIVE_ON_BODY,
  TEE_SALES_PINNED_POST,
  TEE_SALES_SHOP_URL,
  TEE_SALES_WEBSITE,
} from './teeSalesPlaybook';
import {
  PHASE_1_WEBSITE_REVIEW_TASK_ID,
  phase1WebsiteReviewPageHrefs,
  phase1WebsiteReviewQaContent,
  phase1WebsiteReviewTaskContent,
  phase1WebsiteReviewTestIds,
} from './phase1WebsiteReview';
import {
  SPRINT_2_WEBSITE_REVIEW_TASK_ID,
  sprint2WebsiteReviewPageHrefs,
  sprint2WebsiteReviewQaContent,
  sprint2WebsiteReviewTaskContent,
  sprint2WebsiteReviewTestIds,
} from './sprint2WebsiteReview';
import {
  FORM_WALKTHROUGH_TASK_ID,
  formWalkthroughPageHrefs,
  formWalkthroughQaContent,
  formWalkthroughTaskContent,
  formWalkthroughTestIds,
} from './formWalkthroughTests';
import {
  MOOD_WORKFLOW_TASK_ID,
  moodWorkflowPageHrefs,
  moodWorkflowQaContent,
  moodWorkflowTaskContent,
  moodWorkflowTestIds,
} from './moodWorkflow';
import {
  journalMakeReviewPageHrefs,
  journalMakeReviewQaContent,
  journalMakeReviewTaskContent,
  journalMakeReviewTaskToTestLinks,
} from './journalMakeReview';

export type WorkItemContentSeed = {
  description: string;
  steps: Array<string | { label: string; href?: string }>;
};

export function buildSeededSteps(
  itemId: string,
  defs: WorkItemContentSeed['steps'],
): WorkChecklistStep[] {
  const firstHref = pageHrefForWorkItem(itemId);
  return defs.map((def, index) => {
    const row = typeof def === 'string' ? { label: def } : def;
    return {
      id: `s-${itemId}-${index + 1}`,
      label: row.label,
      href: row.href || (index === 0 ? firstHref : undefined),
      checked: false,
    };
  });
}

/** Keep checked state when re-applying the same step ids from a seed. Overlay page hrefs from the seed. */
export function mergeStepsPreserveChecked(
  existing: WorkChecklistStep[] | undefined,
  seeded: WorkChecklistStep[],
  persisted = false,
): WorkChecklistStep[] {
  if (!existing || existing.length === 0) return persisted ? [] : seeded;
  return existing.map((step, index) => {
    const seedHref = String(seeded[index]?.href ?? '').trim();
    if (!seedHref) return step;
    if (String(step.href ?? '').trim() === seedHref) return step;
    return { ...step, href: seedHref };
  });
}

/** Seed when steps were never saved; keep Super Admin edits, including an empty list. */
export function resolvePersistedSteps(
  rawSteps: unknown,
  seeded: WorkChecklistStep[],
  pageHref?: string,
): WorkChecklistStep[] {
  const persisted = Array.isArray(rawSteps);
  const existing = normalizeWorkChecklist(rawSteps);
  const merged = mergeStepsPreserveChecked(existing, seeded, persisted);
  if (persisted && existing.length === 0) return merged;
  return applyFirstStepPageHref(merged, pageHref);
}

/**
 * Refresh walkthrough wording from the catalog without wiping checked boxes.
 * Passed tests keep the wording they were signed off with.
 */
export function overlayQaSeedStepCopy(
  existing: WorkChecklistStep[] | undefined,
  seeded: WorkChecklistStep[],
  options: { persisted: boolean; passed: boolean },
): WorkChecklistStep[] {
  if (options.persisted && (!existing || existing.length === 0)) return existing ?? [];
  if (options.passed || seeded.length === 0) {
    return existing && existing.length > 0 ? existing : seeded;
  }
  const prevById = new Map((existing ?? []).map((step) => [step.id, step]));
  const used = new Set<string>();
  const overlaid = seeded.map((seed, index) => {
    const prev = prevById.get(seed.id) ?? existing?.[index];
    if (!prev) return seed;
    used.add(prev.id);
    return {
      ...prev,
      label: seed.label,
      href: seed.href || prev.href,
    };
  });
  const extras = (existing ?? []).filter((step) => !used.has(step.id));
  return [...overlaid, ...extras];
}

/** Tester-facing walkthrough copy must name the click, not jargon like “open modal”. */
export const QA_WALKTHROUGH_JARGON = /\b(modals?|drawers?|micro-?sets?|CTAs?|hydrate|viewport|hamburger|localStorage)\b/i;

export function qaWalkthroughTextHasJargon(text: string): boolean {
  return QA_WALKTHROUGH_JARGON.test(text);
}

/**
 * First-step destination for a task or test — the page being reviewed or tested.
 * Used so saved boards pick up links even when step copy already existed.
 */
export function pageHrefForWorkItem(id: string): string | undefined {
  const root = String(id || '').split('::')[0].trim();
  if (WORK_ITEM_PAGE_HREFS[root]) return WORK_ITEM_PAGE_HREFS[root];
  if (siteAnalyticsTaskById(root)) return SITE_ANALYTICS_TASK_HREF;
  return undefined;
}

const WORK_ITEM_PAGE_HREFS: Record<string, string> = {
  't-1': '/admin/budget',
  't-2': '/',
  't-3': 'https://nonnegotiation.com',
  't-4': '/',
  't-5': '/admin/gear-selections',
  't-6': '/admin/gear-selections',
  't-7': '/admin/gear-selections',
  't-8': '/admin/gear-selections',
  't-9': '/admin/budget',
  't-10': '/gear',
  't-11': '/gear',
  't-12': '/about',
  't-13': '/contact',
  't-14': '/privacy',
  't-15': '/terms',
  't-16': '/faq',
  't-17': 'https://snatchvault.com/collections/my-plan-gear',
  't-18': '/join',
  't-19': '/gear',
  't-20': '/admin/users',
  't-21': '/admin/certificates',
  't-22': '/admin/certificates',
  't-23': 'https://nonnegotiation.com',
  't-24': '/admin/plan',
  't-25': '/join',
  't-26': '/admin/plan',
  't-27': '/admin/gear-selections',
  't-30': '/admin/plan',
  't-31': '/admin/factory',
  't-32': '/admin/asset-library',
  't-41': '/admin/logo-concepts',
  't-42': '/admin/logo-concepts',
  't-43': '/pay',
  't-44': '/gear',
  't-45': '/gear',
  't-46': '/gear',
  't-47': '/gear',
  't-48': '/admin/gear-selections',
  't-49': '/admin/emails',
  't-50': '/admin/factory',
  't-51': '/admin/factory',
  't-52': '/admin/factory',
  't-53': '/admin/factory',
  't-54': '/admin/factory',
  't-55': '/admin/factory',
  't-56': '/admin/factory',
  't-57': '/admin/factory',
  't-58': '/admin/factory',
  't-59': '/admin/factory',
  't-60': '/admin/factory',
  't-61': '/admin/factory',
  't-62': TEE_SALES_SHOP_URL,
  't-63': '/gear',
  't-64': '/gear',
  't-65': '/gear',
  't-66': '/gear',
  't-67': '/gear',
  't-68': '/gear',
  't-69': '/gear',
  't-70': '/gear',
  't-71': '/',
  't-72': '/',
  't-73': '/admin/plan',
  't-74': '/admin/factory',
  't-75': '/admin/factory',
  't-76': '/admin/factory',
  't-77': '/admin/factory',
  't-78': '/admin/factory',
  't-79': '/admin/factory',
  't-80': '/about',
  't-81': '/list',
  't-82': '/',
  't-83': '/admin/factory',
  't-84': '/admin/factory',
  qa1: '/',
  qa2: '/',
  qa3: '/',
  qa4: '/gear',
  qa5: '/',
  qa6: '/',
  'aff-qa1': '/',
  'aff-qa2': '/',
  'aff-qa3': '/',
  'aff-qa4': '/',
  'aff-qa5': '/',
  'aff-qa6': '/',
  'aff-qa7': '/',
  'aff-qa8': '/admin/testing',
  'auth-qa1': '/admin',
  'gear-sel-qa1': '/admin/gear-selections',
  'sprint-roi-qa1': '/admin/plan',
  'cf-qa1': '/admin/factory',
  'cf-qa2': '/admin/asset-library',
  'cf-qa3': '/admin/asset-library',
  'logo-qa1': '/admin/logo-concepts',
  'pay-qa1': '/pay',
  'shop-gear-page-qa1': '/gear',
  'shop-gear-page-qa2': '/gear',
  'gear-brand-qa1': '/admin/gear-selections',
  'home-qa1': '/',
  'domain-qa1': 'https://nonnegotiation.com',
  'mood-qa1': '/',
  'receipt-qa1': '/',
  'about-qa1': '/about',
  'contact-qa1': '/contact',
  'privacy-qa1': '/privacy',
  'terms-qa1': '/terms',
  'faq-qa1': '/faq',
  'join-qa1': '/join',
  'email-qa1': '/admin/emails',
  'launch-qa1': '/gear',
  'cf-s0-qa': '/admin/factory',
  'cf-s1-qa': '/admin/factory',
  'cf-s2-qa': '/admin/factory',
  'cf-s3-qa': '/admin/factory',
  'cf-s4-qa': '/admin/factory',
  'website-qa1': '/',
  'list-qa1': '/list',
  'analytics-qa1': '/admin/factory',
  'analytics-qa2': '/admin/factory',
  'VT-AUTH-001': '/admin',
  'VT-BOARD-001': '/admin/tasks',
  'VT-EMAIL-001': '/admin/emails',
  'VT-GEAR-001': '/admin/gear-selections',
  'VT-ASSETS-001': '/admin/asset-library',
  'VT-PLAN-001': '/admin/plan',
  'VT-SITE-001': '/',
  'VT-AFFIRM-001': '/',
  'VT-CART-001': '/gear',
  'PW-HOME-001': '/',
  'PW-GEAR-001': '/gear',
  'PW-PAY-001': '/pay',
  'PW-JOIN-001': '/join',
  'PW-SITEMAP-001': '/sitemap',
  'PW-SITEMAP-002': '/sitemap',
  'PW-ADMIN-001': '/admin/testing',
  ...phase1WebsiteReviewPageHrefs(),
  ...sprint2WebsiteReviewPageHrefs(),
  ...formWalkthroughPageHrefs(),
  ...moodWorkflowPageHrefs(),
  ...journalMakeReviewPageHrefs(),
};

function teeSalesVideosSeed(sprintLabel: string): WorkItemContentSeed {
  return {
    description: `Shoot and post 3 T-shirt sales videos in ${sprintLabel}. Each video sells the tee and includes https://nonnegotiation.com/gear.`,
    steps: [
      { label: `Open Content Factory ${sprintLabel}`, href: '/admin/factory' },
      'Film 3 T-shirt sales videos (shop link in each caption)',
      'Post all three this sprint — Facebook first, then any live TikTok / YouTube / Instagram',
      'Mark the three videos done',
    ],
  };
}

export const TASK_CONTENT_SEEDS: Record<string, WorkItemContentSeed> = {
  't-1': {
    description: 'Confirm the $10,000 Phase 1 fee is three payments and that $7,000 is already received (Payments 1 and 2).',
    steps: [
      { label: 'Review the three-payment schedule on the Plan / Budget', href: '/admin/budget' },
      'Confirm $3,500 + $3,500 + $3,000 add to $10,000',
      'Confirm Payment 1 and Payment 2 are marked paid ($7,000) and Payment 3 is due Sprint 3',
      'Confirm with Evelyn that the ledger matches',
    ],
  },
  't-43': {
    description: 'Payment 2 ($3,500) was received Sep 18. Confirm the schedule shows $7,000 paid and Payment 3 due Sprint 3.',
    steps: [
      { label: 'Open the Make Payment page', href: '/pay' },
      'Confirm Payment 1 and Payment 2 show as Paid',
      'Confirm Payment 3 is $3,000 due Sprint 3',
      'Save or screenshot the payment confirmation if you still have it',
      'Tell Evelyn the Payment 2 ledger matches',
    ],
  },
  't-2': {
    description: 'Keep the brand line visible and consistent on every Phase 1 page and email.',
    steps: [
      { label: 'Open the storefront home page', href: '/' },
      'Confirm the brand line appears in the hero or header',
      'Spot-check About, Shop Gear, and Contact when live',
      'Spot-check one outbound email template for the brand line',
    ],
  },
  't-3': {
    description: 'Host the Phase 1 shirt drop on the production domain nonnegotiation.com.',
    steps: [
      'Confirm DNS / Cloudflare Pages points to production',
      'Confirm https://nonnegotiation.com loads the storefront',
      'Confirm Shop Gear (or drop entry) is reachable from the domain',
      'Note any SSL or redirect issues',
    ],
  },
  't-4': {
    description: 'Finish brand foundation and the gear storefront shell for Phase 1.',
    steps: [
      'Confirm design tokens and brand assets are in the app',
      'Confirm storefront shell routes render without errors',
      'Confirm gear catalog shell is ready for selected styles',
      'Hand off remaining build items to Dev as needed',
    ],
  },
  't-5': {
    description: 'Write the first-drop brief for Developing Shirts.',
    steps: [
      'List vibe, audience, and must-have messages for the drop',
      'Note quantity / style targets for the first drop',
      'Share the brief with Evelyn',
    ],
  },
  't-6': {
    description: 'Scope the first drop: 3 shirt styles, 1 hoodie, and 1 hat.',
    steps: [
      { label: 'Open Gear Selections', href: '/admin/gear-selections' },
      'Confirm the pick limits (3 tees, 1 hoodie, 1 hat)',
      'List candidate styles before final picks',
      'Save notes for Angela’s selection task',
    ],
  },
  't-7': {
    description: 'Angela selects the first 2–3 shirt designs for the drop.',
    steps: [
      { label: 'Open Gear Selections', href: '/admin/gear-selections' },
      'Review uploaded style cards',
      'Pick 2–3 tee styles',
      'Save selections so Evelyn can see them',
    ],
  },
  't-8': {
    description: 'Align on styles and pricing so production costs are known.',
    steps: [
      'Review selected styles with Evelyn',
      'Confirm blank brand and print method assumptions',
      'Capture estimated unit costs',
      'Update Plan / ROI notes if costs changed',
    ],
  },
  't-9': {
    description: 'Keep T-Shirt Design work inside the $10K Phase 1 budget.',
    steps: [
      'Confirm design labor is listed under Phase 1',
      'Confirm no separate out-of-budget design fee was added',
      'Note any change requests that would expand scope',
    ],
  },
  't-27': {
    description: 'Build Gear Selections so each style card can hold tee, hoodie, and hat art.',
    steps: [
      { label: 'Open Gear Selections', href: '/admin/gear-selections' },
      'Confirm style-card upload works',
      'Confirm tee / hoodie / hat can live on one card',
      'Confirm Angela can pick within the limits',
      'Reject invalid file types as designed',
    ],
  },
  't-31': {
    description: 'Post the Phase 1 sales cadence on Facebook. Every post includes the Shop Gear link. Socials are built in parallel and do not gate sales.',
    steps: [
      { label: 'Open Content Factory', href: '/admin/factory' },
      'Filter to Facebook / Angela posts for the current sprint',
      'Put https://nonnegotiation.com/gear in every post',
      'Mark Content Factory rows done as posted',
    ],
  },
  't-32': {
    description: 'Stock Asset Library and prep Content Factory copy for each sprint, including the lifestyle tee mockup for sell-now posts.',
    steps: [
      { label: 'Open Asset Library', href: '/admin/asset-library' },
      'Upload missing quote / visual assets',
      'Add /images/apparel_tee_lifestyle.jpg as the sell-now tee still',
      { label: 'Open Content Factory', href: '/admin/factory' },
      'Confirm copy and visual prompts are ready per sprint',
    ],
  },
  't-41': {
    description: 'Upload the logo concepts Evelyn created for Angela to review.',
    steps: [
      { label: 'Open Logo Concepts', href: '/admin/logo-concepts' },
      'Upload the logo folder or files',
      'Confirm thumbnails render',
      'Notify Angela that logos are ready to pick',
    ],
  },
  't-42': {
    description: 'Angela picks the chosen logo mark from Logo Concepts.',
    steps: [
      { label: 'Open Logo Concepts', href: '/admin/logo-concepts' },
      'Review uploaded marks',
      'Select the chosen logo',
      'Confirm the selection is saved / highlighted',
    ],
  },
  't-10': {
    description: 'Build the Shop Gear catalog for the selected designs.',
    steps: [
      { label: 'Open Shop Gear', href: '/gear' },
      'Confirm selected styles appear in the catalog',
      'Confirm images and titles look correct',
      'Fix any missing variants before checkout work',
    ],
  },
  't-11': {
    description: 'Wire product variants, mockups, and checkout for gear.',
    steps: [
      { label: 'Open Shop Gear', href: '/gear' },
      'Confirm size / color variants where required',
      'Confirm mockups display clearly',
      'Walk a test add-to-cart → checkout path',
    ],
  },
  't-12': {
    description: 'Ship the About page for Phase 1.',
    steps: [
      { label: 'Open About', href: '/about' },
      'Confirm brand story and line are present',
      'Confirm mobile layout has no horizontal scroll',
      'Fix copy / layout issues',
    ],
  },
  't-13': {
    description: 'Ship the Contact page for Phase 1.',
    steps: [
      { label: 'Open Contact', href: '/contact' },
      'Confirm contact path works (form or listed channels)',
      'Confirm mobile layout',
      'Fix any broken links',
    ],
  },
  't-14': {
    description: 'Ship the Privacy Policy page.',
    steps: [
      { label: 'Open Privacy Policy', href: '/privacy' },
      'Confirm policy content is complete',
      'Confirm footer links reach this page',
      'Fix formatting issues',
    ],
  },
  't-15': {
    description: 'Ship the Terms of Use page.',
    steps: [
      { label: 'Open Terms of Use', href: '/terms' },
      'Confirm terms content is complete',
      'Confirm footer links reach this page',
      'Fix formatting issues',
    ],
  },
  't-16': {
    description: 'Ship the FAQ page for common order and brand questions.',
    steps: [
      { label: 'Open FAQ', href: '/faq' },
      'Confirm key Phase 1 questions are answered',
      'Confirm accordion / layout works on mobile',
      'Fix missing answers',
    ],
  },
  't-17': {
    description:
      'Confirm Orders on SnatchVault: https://snatchvault.com/collections/my-plan-gear. Hosting is SnatchVault, not Angela’s domain. Home menu is Non-Negotiable, with Tees, Hoodies, and Hats. Split is 70/30.',
    steps: [
      { label: 'Open the My Plan Gear collection', href: 'https://snatchvault.com/collections/my-plan-gear' },
      'From SnatchVault home, open Non-Negotiable, then Tees, Hoodies, and Hats',
      'Confirm the 70/30 order split (Angela 70%, Evelyn 30% for hosting, processing, admin, application fees)',
      'Confirm checkout stays on SnatchVault',
    ],
  },
  't-18': {
    description: 'Show Coming Soon on Memberships / Join — do not configure members yet.',
    steps: [
      { label: 'Open Memberships / Join', href: '/join' },
      'Confirm Coming Soon is visible',
      'Confirm no live member signup is enabled',
      'Confirm nav copy matches Coming Soon',
    ],
  },
  't-19': {
    description: 'QA Shop Gear, launch pages, and SnatchVault Orders before launch.',
    steps: [
      { label: 'Open Shop Gear', href: '/gear' },
      'Run smoke checks on launch pages (About, Contact, Privacy, Terms, FAQ)',
      { label: 'Open SnatchVault Orders collection', href: 'https://snatchvault.com/collections/my-plan-gear' },
      'Confirm Non-Negotiable → Tees / Hoodies / Hats and the 70/30 split notes on the Plan',
      'Log failures as QA tests assigned to Dev',
    ],
  },
  't-20': {
    description: 'Send Angela the Gmail account invite for brand operations.',
    steps: [
      'Create or confirm the Gmail invite',
      'Send the invite to Angela’s email',
      'Confirm Angela accepted access',
      'Store the account note in Admin docs if needed',
    ],
  },
  't-21': {
    description: 'Angela defines Beta Tester rewards (brand, gift & recognition).',
    steps: [
      'List reward ideas (gift, shout-out, early access)',
      'Choose the Phase 1 beta reward package',
      'Share the decision with Evelyn for fulfillment',
    ],
  },
  't-22': {
    description: 'Evelyn sets credits, fulfillment, and tracking for beta rewards.',
    steps: [
      'Map Angela’s reward package to fulfillment steps',
      'Set tracking / credits approach',
      'Confirm Angela agrees with the fulfillment plan',
    ],
  },
  't-23': {
    description: 'Launch the gear storefront to production.',
    steps: [
      'Confirm production deploy is live on nonnegotiation.com',
      { label: 'Smoke-test Shop Gear on production', href: '/gear' },
      'Confirm payments / Shopify path works',
      'Announce launch readiness to Angela',
    ],
  },
  't-24': {
    description: 'Review organic sprint ROI with 6.2K Facebook and no paid ads.',
    steps: [
      { label: 'Open the Plan ROI section', href: '/admin/plan' },
      'Review expected hoodie sales vs organic assumptions',
      'Note improvement suggestions',
      'Confirm numbers still match current costs',
    ],
  },
  't-30': {
    description: 'Refresh sprint ROI when production costs and live sales are known.',
    steps: [
      'Gather actual production costs',
      'Gather live sales (if any)',
      { label: 'Update Plan ROI figures', href: '/admin/plan' },
      'Share the refresh with Angela',
    ],
  },
  't-25': {
    description: 'Park Memberships configuration for Phase 2 — Coming Soon until then.',
    steps: [
      'Confirm Phase 2 membership scope is documented as Coming Soon',
      'List open questions for the Phase 2 discussion',
      'Do not enable member configuration in Phase 1',
    ],
  },
  't-26': {
    description: 'Capture Phase 3 future-feature discussion (mood, planners, socials).',
    steps: [
      'List candidate Phase 3 features',
      'Note what is explicitly out of Phase 1',
      'Save discussion notes for later scoping',
    ],
  },
  't-44': {
    description: 'Build the public Shop Gear page for selected styles.',
    steps: [
      { label: 'Open Shop Gear', href: '/gear' },
      'Confirm selected styles render',
      'Confirm mobile layout (no horizontal scroll)',
      'Fix broken images or missing copy',
    ],
  },
  't-45': {
    description: 'Put the selected gear on the Shopify store.',
    steps: [
      'Confirm Shopify products match Angela’s selections',
      'Confirm pricing and variants',
      'Confirm store links from Shop Gear work',
      'Do a test checkout if possible',
    ],
  },
  't-46': {
    description: 'Evelyn tests the Shop Gear page before launch.',
    steps: [
      { label: 'Open Shop Gear', href: '/gear' },
      'Check selected styles, hoodie/shirt brand, and hat colors',
      'Confirm images are sharp and links work',
      'Log any bugs for Dev / QA',
    ],
  },
  't-47': {
    description: 'Angela tests the Shop Gear page before launch.',
    steps: [
      { label: 'Open Shop Gear', href: '/gear' },
      'Confirm your selected styles look right',
      'Confirm shirt/hoodie brand and hat colors',
      'Tell Evelyn pass/fail notes',
    ],
  },
  't-48': {
    description: 'Angela picks blank brands for shirts and hoodies on Gear Selections.',
    steps: [
      { label: 'Open Gear Selections', href: '/admin/gear-selections' },
      'Choose up to 2 blank brands for shirts/hoodies',
      'Save the brand pick',
      'Confirm Evelyn can see the selection',
    ],
  },
  't-49': {
    description: 'Set up Resend so tester and admin emails can send from nonnegotiation.com.',
    steps: [
      { label: 'Open Emails in Admin Studio', href: '/admin/emails' },
      'Create / confirm Resend account',
      'Verify nonnegotiation.com domain in Resend',
      'Set Cloudflare RESEND_API_KEY, FROM_EMAIL, ADMIN_NOTIFY_EMAIL',
      'Send a test email and confirm delivery',
    ],
  },
  't-50': {
    description: 'Complete Content Factory Sprint 0 sell-now cadence: bios, pinned post, shop link in every post, no-sample live, lifestyle tee mockup.',
    steps: [
      { label: 'Open Content Factory Sprint 0', href: '/admin/factory' },
      'Post week 1 brand + shop-link rows (use the lifestyle tee mockup)',
      'Complete week 2: pin, bios, live talk track, Evelyn support post, website walk',
      'Create 3 T-shirt sales videos this sprint — shop link in each',
      'Mark the sprint cadence done',
    ],
  },
  't-51': {
    description: 'Complete Content Factory Sprint 1: keep selling, finish gear picks, first on-body live and clip.',
    steps: [
      { label: 'Open Content Factory Sprint 1', href: '/admin/factory' },
      'Complete gear upload/pick rows',
      'Complete shop-link posts',
      'Run the on-body live and post the clip when the sample arrives',
      'Create 3 T-shirt sales videos this sprint — shop link in each',
      'Mark the sprint cadence done',
    ],
  },
  't-52': {
    description: 'Complete Content Factory Sprint 2 keep-selling cadence for tees, hoodie, and hat. Shop is already live.',
    steps: [
      { label: 'Open Content Factory Sprint 2', href: '/admin/factory' },
      'Complete tee / hoodie / hat sell posts with the Shop Gear URL',
      'Confirm the SHOP LINK caption is nonnegotiation.com/gear',
      'Create 3 T-shirt sales videos this sprint — shop link in each',
      'Mark the sprint cadence done',
    ],
  },
  't-53': {
    description: 'Complete Content Factory Sprint 3 About/FAQ cadence. Every post still includes the Shop Gear URL.',
    steps: [
      { label: 'Open Content Factory Sprint 3', href: '/admin/factory' },
      'Complete About/FAQ posts with the shop link',
      'Complete weekend prep rows',
      'Create 3 T-shirt sales videos this sprint — shop link in each',
      'Mark the sprint cadence done',
    ],
  },
  't-54': {
    description: 'Complete Content Factory Sprint 4 launch-week cadence. Shop is already live — this is on-body intensification, not a shop go-live.',
    steps: [
      { label: 'Open Content Factory Sprint 4', href: '/admin/factory' },
      'Complete drop announcement and launch-week posts',
      'Keep https://nonnegotiation.com/gear in every post',
      'Create 3 T-shirt sales videos this sprint — shop link in each',
      'Mark the sprint cadence done',
    ],
  },
  't-55': {
    description: 'Create a NonNegotiation TikTok page, or re-purpose an existing one, so Sprint 0 content has an official TikTok home.',
    steps: [
      'Decide whether to create a new TikTok or re-purpose an existing page',
      'Name / bio / handle matches NonNegotiation branding',
      'Bio includes https://nonnegotiation.com/gear',
      'Confirm Angela can post from the account',
      'Share the live TikTok URL with Evelyn',
    ],
  },
  't-56': {
    description: 'Create a NonNegotiation YouTube channel, or re-purpose an existing one, so Sprint 0 shorts and videos have an official home.',
    steps: [
      'Decide whether to create a new YouTube channel or re-purpose an existing one',
      'Name / art / handle matches NonNegotiation branding',
      'About / description includes https://nonnegotiation.com/gear',
      'Confirm Angela can upload from the account',
      'Share the live YouTube URL with Evelyn',
    ],
  },
  't-57': {
    description: 'Create a NonNegotiation Instagram page, or re-purpose an existing one, so Sprint 0 posts and reels have an official IG home.',
    steps: [
      'Decide whether to create a new Instagram or re-purpose an existing page',
      'Name / bio / handle matches NonNegotiation branding',
      'Bio includes https://nonnegotiation.com/gear',
      'Confirm Angela can post from the account',
      'Share the live Instagram URL with Evelyn',
    ],
  },
  't-58': {
    description: 'Give Evelyn authorized access on the NonNegotiation TikTok page so she can help post and manage it.',
    steps: [
      'Open TikTok account settings / Business or Creator tools',
      'Add Evelyn as an authorized user or admin',
      'Confirm Evelyn can sign in and post',
      'Note the access level in the task notes',
    ],
  },
  't-59': {
    description: 'Give Evelyn authorized access on the NonNegotiation YouTube channel so she can help upload and manage it.',
    steps: [
      'Open YouTube Studio permissions',
      'Add Evelyn as an authorized user or manager',
      'Confirm Evelyn can sign in and upload',
      'Note the access level in the task notes',
    ],
  },
  't-60': {
    description: 'Give Evelyn authorized access on the NonNegotiation Instagram page so she can help post and manage it.',
    steps: [
      'Open Instagram Professional / Meta Business Suite permissions',
      'Add Evelyn as an authorized user or admin',
      'Confirm Evelyn can sign in and post',
      'Note the access level in the task notes',
    ],
  },
  't-61': {
    description: 'NonNegotiation.com is the house. MY PLAN, NOT MY MOOD is one brand under it. Home, Shop Gear, and every welcome post introduce the brand that way — not as if the whole site is only the brand.',
    steps: [
      'Keep the site as NonNegotiation — do not rename the domain',
      'Home kicker: A Non-Negotiable brand. Then MY PLAN, NOT MY MOOD',
      'Welcome posts say: NonNegotiation is the house, this is one brand under it',
      'Tell TikTok, YouTube, Instagram, and Facebook the same line',
    ],
  },
  't-62': {
    description: 'Order Angela’s sample tees from Shopify now so she can wear them on live. Hoodie/hat samples if they ship with the same order. Do not wait for socials.',
    steps: [
      { label: 'Open Shop Gear and pick Angela’s tees', href: '/gear' },
      'Place the Shopify sample order (her size, the styles she will wear on camera)',
      'Note the order number and ETA in the task notes',
      'Text Angela when the box is out for delivery',
    ],
  },
  't-63': {
    description: 'Soft-sell tees to Angela’s 6.2K personal Facebook now. Every post gets the Shop Gear link. Photos are enough until the sample arrives.',
    steps: [
      { label: 'Open Shop Gear and copy the URL', href: '/gear' },
      `Put this in the Facebook bio: ${TEE_SALES_BIO_LINE}`,
      `Pin this post: ${TEE_SALES_PINNED_POST}`,
      'Use the lifestyle tee mockup (/images/apparel_tee_lifestyle.jpg) until you have on-body photos',
      'Put https://nonnegotiation.com/gear in every Facebook post from today forward',
    ],
  },
  't-64': {
    description: 'First live wearing the tee. Pin Shop Gear in comments. Use the on-body talk track.',
    steps: [
      { label: 'Open Shop Gear so the URL is ready to pin', href: '/gear' },
      'Wear the sample tee. Name the color and the line on the chest.',
      `Pin ${TEE_SALES_SHOP_URL} in the first two minutes`,
      'Close wearing the tee: the plan is the shirt, the link is pinned',
    ],
  },
  't-65': {
    description: 'NonNegotiation Facebook, Instagram, TikTok, and YouTube bios all sell the tees. Lives on those pages use the same Shop Gear URL.',
    steps: [
      { label: 'Confirm Shop Gear is the URL', href: '/gear' },
      'Facebook bio + pinned post = tees live now',
      'Instagram bio + story highlight = Shop Gear',
      'TikTok and YouTube bio / about = nonnegotiation.com/gear',
    ],
  },
  't-66': {
    description: 'Angela’s personal Facebook (6.2K) and Instagram sell the tees the same way as NonNegotiation. Soft-sell now; on-body live when the box arrives.',
    steps: [
      { label: 'Open Shop Gear', href: '/gear' },
      `Personal Facebook bio: ${TEE_SALES_BIO_LINE}`,
      'Pin the shop post on personal Facebook',
      'Personal Instagram bio + story link to Shop Gear',
      'Share the live from personal to NonNegotiation',
    ],
  },
  't-67': {
    description: 'Evelyn’s personal Facebook and Instagram back the drop with one support post and the same Shop Gear URL. Do not invent a second storefront.',
    steps: [
      { label: 'Open Shop Gear', href: '/gear' },
      'Personal Facebook: one support post with the shop link',
      'Personal Instagram: share Angela’s live or post the same link',
      'Optional bio line while the drop is live: Shop: nonnegotiation.com/gear',
    ],
  },
  't-68': {
    description: 'How Angela presents on live: no-sample talk track until the box arrives, then on-body. Always pin Shop Gear. Never send people to a second store URL.',
    steps: [
      { label: 'Keep Shop Gear open while you go live', href: '/gear' },
      `Until the sample arrives: ${TEE_SALES_LIVE_NO_SAMPLE}`,
      `Once you are wearing the tee: ${TEE_SALES_LIVE_ON_BODY}`,
      `Pinned comment is always ${TEE_SALES_SHOP_URL}`,
    ],
  },
  't-69': {
    description: 'Every bio, live pin, and post uses https://nonnegotiation.com/gear. Checkout can still be Shopify after that page.',
    steps: [
      { label: 'Confirm Shop Gear loads on production', href: '/gear' },
      'Hero and Shop Gear button send people here, not a raw Shopify domain',
      'Tell Angela the only URL to say out loud is nonnegotiation.com/gear',
      'Spot-check bios after they are updated',
    ],
  },
  't-70': {
    description: 'The day the sample arrives, post a short on-body clip to Angela’s personal pages and NonNegotiation. Same Shop Gear link.',
    steps: [
      { label: 'Open Shop Gear for the caption link', href: '/gear' },
      'Film 15–20 seconds wearing the tee',
      'Post to personal Facebook and Instagram with the shop URL',
      'Post or share to NonNegotiation pages the same day',
    ],
  },
  't-71': {
    description: 'The NonNegotiation website is the landing page from Angela’s live. Home and Shop Gear must present the tees as live — not coming soon — and send people to /gear.',
    steps: [
      { label: 'Open Home', href: '/' },
      'Confirm the Shop Gear button goes to /gear and copy says tees are live',
      { label: 'Open Shop Gear', href: '/gear' },
      'Confirm real Shopify tees, hoodies, and hats — no leftover mock SKUs',
      TEE_SALES_WEBSITE,
    ],
  },
  't-72': {
    description: 'Angela walks the live website so she knows exactly what people see when she pins nonnegotiation.com/gear on live.',
    steps: [
      { label: 'Open Home the way a live viewer would', href: '/' },
      { label: 'Open Shop Gear and tap Buy on one tee', href: '/gear' },
      'Confirm you are willing to say this URL out loud on live: nonnegotiation.com/gear',
    ],
  },
  't-73': {
    description: 'At each Sunday retro, write actuals next to the Plan scorecard: followers, engagement, live views, shop clicks, and Shopify sales. Target is the bar. Min is still on track.',
    steps: [
      { label: 'Open the Plan scorecard', href: '/admin/plan' },
      'Pull Facebook Insights for the week (reach, engagements, comments, shares, follower count)',
      'Pull Shopify orders and net sales for the same dates',
      'Count NonNegotiation FB / IG / TikTok / YouTube followers',
      'Note hit / miss / stretch in the task notes and bring it to retro',
    ],
  },
  't-74': {
    description: 'Friday Sep 4 is welcome-only: one post each on Facebook, TikTok, and YouTube, plus personal and Home. NonNegotiation is the house; MY PLAN, NOT MY MOOD is the brand. Film 1–2 scenes, 15 seconds max each. Shop URL in every caption. The brand-line Facebook post is Saturday.',
    steps: [
      { label: 'Open Content Factory and copy the Friday welcome rows', href: '/admin/factory' },
      'Facebook: house + brand welcome — do not also post the Saturday brand line today',
      'TikTok: 1–2 scenes, 15s max, then “longer story on Facebook”',
      'YouTube: teaching welcome, then TikTok for the short clip',
      'Personal Facebook/Instagram: you, not a brand page — no family faces or names',
      'Website: Home intro is live before you send people there',
    ],
  },
  't-75': teeSalesVideosSeed('Sprint 0'),
  't-76': teeSalesVideosSeed('Sprint 1'),
  't-77': teeSalesVideosSeed('Sprint 2'),
  't-78': teeSalesVideosSeed('Sprint 3'),
  't-79': teeSalesVideosSeed('Sprint 4'),
  [PHASE_1_WEBSITE_REVIEW_TASK_ID]: phase1WebsiteReviewTaskContent(),
  [SPRINT_2_WEBSITE_REVIEW_TASK_ID]: sprint2WebsiteReviewTaskContent(),
  [FORM_WALKTHROUGH_TASK_ID]: formWalkthroughTaskContent(),
  [MOOD_WORKFLOW_TASK_ID]: moodWorkflowTaskContent(),
  ...journalMakeReviewTaskContent(),
};

export const QA_CONTENT_SEEDS: Record<string, WorkItemContentSeed> = {
  qa1: {
    description:
      'On Home, click each mood bubble (the round emoji + word buttons near “What’s Your Mood”). The matching mood should highlight, and the page should slide down to the tips card — you should not have to hunt for it.',
    steps: [
      { label: 'Go to Home (nonnegotiation.com). You should see the brand name and the What’s Your Mood section.', href: '/' },
      'Find the row of round mood buttons with an emoji and a word (Tired, Anxious, and the rest). Click the first one.',
      'Confirm that button looks selected (highlighted / ACTIVE) and the page slides down to a tips card — not to a blank area.',
      'Click each remaining mood button the same way. Each click should change the selected mood and show a new tips card.',
    ],
  },
  qa2: {
    description:
      'On Home, the orange question strip that says WHICH MOOD AM I IN TODAY must be rust orange with crisp white letters — same family as the orange buttons.',
    steps: [
      { label: 'Go to Home. Scroll until you see the orange strip that asks WHICH MOOD AM I IN TODAY.', href: '/' },
      'Confirm that strip is rust orange (not pale peach, not brown, not gray).',
      'Confirm the letters are white and easy to read — not faded, not cut off.',
    ],
  },
  qa3: {
    description:
      'On a wide computer screen, product/mood layout is two columns: pictures on the left, details on the right.',
    steps: [
      { label: 'Go to Home on a computer (wide window, not a phone).', href: '/' },
      'Confirm pictures / mockups sit on the left side.',
      'Confirm the details text sits on the right side.',
      'Make the window a little narrower, then wider again. The two columns should stay two columns on a wide screen — they should not pile into a broken mess.',
    ],
  },
  qa4: {
    description:
      'When you add a shirt to the cart, the number on the shopping-bag icon in the top right should go up, and a cart panel should slide in from the side listing that item.',
    steps: [
      { label: 'Go to Shop Gear (header Shop Gear, or nonnegotiation.com/gear).', href: '/gear' },
      'Click a product’s add-to-cart / shop control so an item is added.',
      'Look at the shopping-bag icon in the top-right corner. Confirm the little orange number on it went up (for example 0 → 1).',
      'Confirm a cart panel slides in from the side of the screen and lists the item you added. If it did not open, click the shopping-bag icon once.',
    ],
  },
  qa5: {
    description:
      'What Won Today builds a victory card you can share or save. Start from the header or the Home receipt section — do not guess a hidden URL.',
    steps: [
      { label: 'Go to Home. In the top links, click “What Won Today?” Receipt Builder — or scroll to the What Won Today section on the page.', href: '/' },
      'Fill in today’s win the way the form asks, then click the button that builds / generates the receipt.',
      'Confirm you see a finished card (not a blank page). Confirm there is a Share control you can click.',
      'Confirm there is a Download or Save control, click it, and confirm a file starts downloading or a save dialog appears.',
    ],
  },
  qa6: {
    description:
      'The 7-Day Challenge asks for an email and a 7-day goal, then offers a printable PDF. Click the orange “7-Day Challenge” button in the top header — a form should appear on top of the page. If you are not a member, you should land on Join / Coming Soon instead.',
    steps: [
      { label: 'Go to Home. In the top header, find the orange button that says 7-Day Challenge (lock icon if you are not a member).', href: '/' },
      'Click 7-Day Challenge. If a form appears on top of the page, that is the challenge sign-up — stay here. If the site takes you to Join the Movement / Coming Soon, that is also a pass for a logged-out visitor; stop and note it.',
      'If the form opened: type a DEMO DATA email (tester@example.com) and a short 7-day goal in the fields you see. Do not use a real personal inbox.',
      'Click the button that prints or downloads the PDF. Confirm a print window or a PDF file appears — not an error.',
    ],
  },
  'aff-qa1': {
    description:
      'Morning Affirmations: click Affirmations in the header, choose Morning, and walk the short identity/confidence lines with the breath pause.',
    steps: [
      { label: 'Go to Home. In the top header, click the orange Affirmations button (sparkle icon). A member should see today’s affirmations on top of the page. A guest should go to Join / Coming Soon — that is expected.', href: '/' },
      'If the affirmations opened, choose Morning (not Midday or Night).',
      'Confirm you see short identity / confidence lines, and each line pauses about 3 seconds for a breath before the next.',
      'Walk through the short set: click Continue / Next, or Skip if you want to skip one. Confirm you can finish the Morning set.',
    ],
  },
  'aff-qa2': {
    description:
      'Midday Affirmations: same Affirmations button, choose Midday, confirm boundary / truth lines.',
    steps: [
      { label: 'Go to Home. Click Affirmations in the top header. Member: the affirmations should appear on top of the page. Guest: Join / Coming Soon is expected.', href: '/' },
      'Choose Midday.',
      'Confirm the lines are about boundaries / telling the truth — not the same Morning identity set.',
      'Walk through or Skip the short set until it finishes.',
    ],
  },
  'aff-qa3': {
    description:
      'Night Affirmations: same Affirmations button, choose Night, confirm healing / release / faith lines.',
    steps: [
      { label: 'Go to Home. Click Affirmations in the top header.', href: '/' },
      'Choose Night.',
      'Confirm the lines are about healing, letting go, or faith — a day-closing tone.',
      'Walk through or Skip the short set until it finishes.',
    ],
  },
  'aff-qa4': {
    description:
      'Affirmations should not start on the exact same first line every time you open Morning, Midday, and Night.',
    steps: [
      'Open Affirmations from the header, run Morning, then Midday, then Night. Write down the first line of each.',
      'Close it, open Affirmations again, and run the three times of day a second time.',
      'Confirm you are not stuck on the same first line every single time. A repeat now and then is OK; the same first line forever is a fail.',
      'Write a note for Dev if the same first line repeats every session.',
    ],
  },
  'aff-qa5': {
    description:
      'You can mark a line that lands, or skip one without a guilt lecture, and that choice should still be there after you refresh the page.',
    steps: [
      { label: 'Go to Home. Click Affirmations in the top header.', href: '/' },
      'When a line feels right, click the control that saves / keeps / reflects on that line (whatever the screen labels it — not a hidden trick).',
      'On another line, click Skip. Confirm the site does not scold you or block you.',
      'Refresh the page, open Affirmations again, and confirm the line you kept is still remembered.',
    ],
  },
  'aff-qa6': {
    description:
      'Morning, Midday, and Night can be finished separately. Finishing Morning should not mark Night done. A new calendar day should start them over.',
    steps: [
      { label: 'Go to Home. Click Affirmations in the top header.', href: '/' },
      'Finish only Morning. Confirm Morning shows done / complete, and Midday and Night do not.',
      'Finish Midday. Confirm Night is still open.',
      'Note: a new calendar day (after midnight) should clear the checkmarks. If you cannot wait for midnight, write that in notes and still pass the independent Morning/Midday/Night checks.',
    ],
  },
  'aff-qa7': {
    description:
      'Affirmations must be usable on a phone, a tablet, and a computer — readable text, no sideways scrolling on a phone.',
    steps: [
      'On a phone-width (~320–390px), open Affirmations. Confirm you do not have to swipe left/right to read the lines, and buttons are easy to tap.',
      'On a tablet-width, open Affirmations and confirm it still fits.',
      'On a computer-width, open Affirmations and confirm it still fits.',
      'Confirm the letters have enough contrast against the background (not pale gray on white).',
    ],
  },
  'aff-qa8': {
    description:
      'Voice / spoken-coach affirmations are not a live Phase 1 feature. You should not need a microphone or a talking coach to pass this site.',
    steps: [
      'On the live site, confirm there is no required “speak to the coach / voice trust” flow you must finish to use Affirmations.',
      'If you see a “Coming later / Planned” note about voice, that is fine. A broken microphone screen is a fail.',
      'Write down anything that looks like an unfinished voice feature so Dev can park it.',
    ],
  },
  'auth-qa1': {
    description:
      'A limited Admin (not Super Admin) should see Testing Portal and Task List, and should not see Budget / money tabs.',
    steps: [
      { label: 'Sign in as a limited Admin and open the Admin area (Admin in the header).', href: '/admin' },
      'Confirm you can open Testing Portal (the tests list).',
      'Confirm you can open Task List.',
      'Confirm Budget / pay / money tabs are hidden or locked — you should not be able to edit the budget.',
    ],
  },
  'gear-sel-qa1': {
    description:
      'On Gear Selections, Evelyn can upload style cards and Angela can pick up to 3 tees, 1 hoodie, and 1 hat. Bad files are rejected with a message.',
    steps: [
      { label: 'Sign in as Admin. Open Admin → Gear Selections (not Shop Gear).', href: '/admin/gear-selections' },
      'Click the upload control and add a normal image (JPG or PNG). Confirm it appears on a style card.',
      'Confirm one style card can show a tee, a hoodie, and a hat together.',
      'As Angela, pick no more than 3 tees, 1 hoodie, and 1 hat. Trying a 4th tee should be blocked.',
      'Try a PDF, an SVG, or a huge file. Confirm the site says no and does not add it.',
    ],
  },
  'sprint-roi-qa1': {
    description:
      'On the Plan, each Phase 1 sprint shows organic ROI notes and a weekly scorecard. No paid ads.',
    steps: [
      { label: 'Sign in as Admin. Open Admin → Schedule & Plan (or Plan).', href: '/admin/plan' },
      'Find the Phase 1 sprints. Confirm each one has ROI / sales notes you can read.',
      'Confirm the scorecard lists min / target / stretch for followers, engagement, clicks, and sales.',
      'Confirm the Plan says organic only / no paid ads.',
    ],
  },
  'cf-qa1': {
    description:
      'Content Factory lists posts and prep. Posting Schedule is one calendar of date, platform, time, and what to post. Filters actually change the list.',
    steps: [
      { label: 'Sign in as Admin. Open Admin → Content Factory (Factory).', href: '/admin/factory' },
      { label: 'Open Admin → Calendar / Posting Schedule.', href: '/admin/calendar' },
      'Confirm each row shows a date, a platform (Facebook, YouTube, TikTok, or Personal), a time, and what to post.',
      'Use the sprint filter (the sprint bubbles or dropdown). Confirm the list changes.',
      'Use the assignee filter. Confirm the list changes.',
      'Use the channel filter (Facebook, YouTube, TikTok, Personal). Confirm the list changes.',
      'Confirm you can tell Angela’s post rows from Evelyn’s prep rows.',
    ],
  },
  'cf-qa2': {
    description:
      'Asset Library groups images by style name. Tee, hoodie, and hat can live on the same card.',
    steps: [
      { label: 'Sign in as Admin. Open Admin → Asset Library.', href: '/admin/asset-library' },
      'Confirm cards are grouped by style name (not one giant unsorted pile).',
      'Confirm one style name can hold more than one card.',
      'Confirm a tee, hoodie, and hat can sit on the same style card.',
    ],
  },
  'cf-qa3': {
    description:
      'Asset Library refuses junk files and still lets you save a caption with no picture.',
    steps: [
      { label: 'Sign in as Admin. Open Admin → Asset Library.', href: '/admin/asset-library' },
      'Try to upload a non-picture (Word doc or similar). Confirm a reject message — the file should not appear as an image.',
      'Try a file that is way too large. Confirm a reject message.',
      'Save a caption / text-only asset with no image. Confirm it saves.',
    ],
  },
  'logo-qa1': {
    description:
      'On Logo Concepts, upload a folder of logos and pick one chosen mark. PDF and oversized files are rejected; SVG is allowed.',
    steps: [
      { label: 'Sign in as Admin. Open Admin → Logo Concepts.', href: '/admin/logo-concepts' },
      'Use the upload control to add a folder of logo files, or several files at once.',
      'If folders are named seal, wordmark, lockup, or colorway, confirm they sort into those groups.',
      'As Angela, click one logo as the chosen mark. Confirm it stays selected.',
      'Try a PDF or a huge file — expect a reject. Try an SVG — it should be allowed.',
    ],
  },
  'pay-qa1': {
    description:
      'Make Payment lists how to pay Phase 1. Payments 1 and 2 ($7,000) are paid. Payment 3 is $3,000 due Sprint 3. Zelle and Cash App are preferred.',
    steps: [
      { label: 'Go to Make Payment (footer Make Payment, or nonnegotiation.com/pay).', href: '/pay' },
      'Confirm Payment 1 and Payment 2 show as paid. Payment 3 should be $3,000 due Sprint 3.',
      'Confirm Zelle and Cash App are marked preferred, with the numbers/names shown on the page.',
      'Confirm Venmo and Stripe (card / Apple Pay) are also listed.',
    ],
  },
  'shop-gear-page-qa1': {
    description:
      'Evelyn walks the public Shop Gear page: selected styles, brands, hat colors, and checkout links.',
    steps: [
      { label: 'Go to Shop Gear (header Shop Gear).', href: '/gear' },
      'Confirm the selected styles show with sharp pictures — not broken-image icons.',
      'Confirm hoodie/shirt brand and hat colors match what Angela picked.',
      'Click a shop / checkout link. Confirm it opens the store (Shopify or SnatchVault) — not a dead page.',
    ],
  },
  'shop-gear-page-qa2': {
    description:
      'Angela walks Shop Gear and confirms her picks look right before go-live.',
    steps: [
      { label: 'Go to Shop Gear (header Shop Gear).', href: '/gear' },
      'Confirm the styles you picked are the ones on the page.',
      'Confirm shirt/hoodie brand and hat colors look right.',
      'Write pass or fail notes for Evelyn on this test (what is wrong, in plain words).',
    ],
  },
  'gear-brand-qa1': {
    description:
      'On Gear Selections, Angela picks up to 2 blank shirt/hoodie brands. The pick saves.',
    steps: [
      { label: 'Sign in as Admin. Open Admin → Gear Selections.', href: '/admin/gear-selections' },
      'Find the shirt/hoodie brand picker (brand names like Gildan, Comfort Colors — not the style-card pictures). Click it so the brand list opens.',
      'Select 1 or 2 brands. A third brand should be blocked.',
      'Leave the page and come back. Confirm the same 1–2 brands are still selected with the other gear picks.',
    ],
  },
  'home-qa1': {
    description:
      'Home shows the brand line and a way into What’s Your Mood. On a phone, you should not scroll sideways.',
    steps: [
      { label: 'Go to Home.', href: '/' },
      'Confirm the brand line is visible (MY PLAN, NOT MY MOOD / NonNegotiation wording at the top of the page).',
      'Confirm you can reach What’s Your Mood without guessing — header What’s Your Mood? or the mood buttons on the page.',
      'On a phone-width (~320px), confirm you do not have to swipe left/right to see the page.',
    ],
  },
  'domain-qa1': {
    description:
      'https://nonnegotiation.com loads the live storefront over the lock/https connection, and Shop Gear is one click away.',
    steps: [
      { label: 'In the browser address bar, open https://nonnegotiation.com (the live site, not localhost).', href: 'https://nonnegotiation.com' },
      'Confirm the address starts with https and the Home storefront loads (brand name, not an error page).',
      'Click Shop Gear. Confirm that page loads on the same site.',
    ],
  },
  'mood-qa1': {
    description:
      'Click a What’s Your Mood bubble; the page should slide down to the tips / action card.',
    steps: [
      { label: 'Go to Home. Scroll to What’s Your Mood, or click What’s Your Mood? in the header.', href: '/' },
      'Click one mood bubble (emoji + word).',
      'Confirm the page slides down to the tips card (How to shake it / today’s play). You should not be left at the top of the page.',
    ],
  },
  'receipt-qa1': {
    description:
      'What Won Today builds a card you can share or download.',
    steps: [
      { label: 'Go to Home. Click “What Won Today?” Receipt Builder in the header, or scroll to that section.', href: '/' },
      'Fill the form and click the button that builds the receipt.',
      'Confirm Share and Download/Save are both there and do something (share sheet, copy, or a file).',
    ],
  },
  'about-qa1': {
    description: 'About tells the brand story and does not scroll sideways on a phone.',
    steps: [
      { label: 'Go to About (header About, or footer About).', href: '/about' },
      'Confirm you can read a brand story — not an empty page or “lorem ipsum”.',
      'On a phone-width (~320px), confirm no sideways scroll.',
    ],
  },
  'contact-qa1': {
    description: 'Contact lists real ways to reach the brand and works on a phone.',
    steps: [
      { label: 'Go to Contact (header Contact, or footer Contact).', href: '/contact' },
      'Confirm the listed contact paths are real (email, form, or the methods printed on the page) — click/tap each one that looks clickable.',
      'On a phone-width (~320px), confirm no sideways scroll and you can still submit or copy a contact method.',
    ],
  },
  'privacy-qa1': {
    description: 'Privacy Policy is in the footer and readable on a phone.',
    steps: [
      { label: 'Go to Privacy Policy (footer Privacy Policy).', href: '/privacy' },
      'From Home, scroll to the footer and click Privacy Policy. Confirm you land on this same policy.',
      'On a phone-width, confirm you can read it without sideways scroll.',
    ],
  },
  'terms-qa1': {
    description: 'Terms of Use is in the footer and readable on a phone.',
    steps: [
      { label: 'Go to Terms of Use (footer Terms of Use).', href: '/terms' },
      'From Home, scroll to the footer and click Terms of Use. Confirm you land on this same page.',
      'On a phone-width, confirm you can read it without sideways scroll.',
    ],
  },
  'faq-qa1': {
    description: 'FAQ answers Phase 1 order and brand questions and works on a phone.',
    steps: [
      { label: 'Go to FAQ (header FAQ, or footer FAQ).', href: '/faq' },
      'Read the questions. Confirm orders, shipping, and brand basics are answered in plain words.',
      'On a phone-width, confirm no sideways scroll.',
    ],
  },
  'join-qa1': {
    description: 'Join the Movement is Coming Soon. There is no live paid membership signup in Phase 1.',
    steps: [
      { label: 'Click Join the Movement in the header (orange, says Coming Soon).', href: '/join' },
      'Confirm Coming Soon is obvious on the page.',
      'Confirm there is no working checkout / pay-now membership button that takes a real card.',
    ],
  },
  'email-qa1': {
    description:
      'Admin Emails has Phase 1 templates. A test send should arrive at the DEMO DATA inbox — never a real personal inbox.',
    steps: [
      { label: 'Sign in as Admin. Open Admin → Emails.', href: '/admin/emails' },
      'Confirm Phase 1 templates are listed (you can open a preview).',
      'Send a test email to a DEMO DATA address. Confirm it shows as sent / delivered in the log — do not use a real personal inbox.',
    ],
  },
  'launch-qa1': {
    description: 'After launch, Shop Gear and pay/store links work on the live site.',
    steps: [
      { label: 'Go to Shop Gear on the live site.', href: '/gear' },
      'Confirm selected styles load with pictures.',
      'Click a payment or store link. Confirm it opens a real checkout or store page.',
    ],
  },
  'cf-s0-qa': {
    description:
      'Content Factory Sprint 0 covers two weeks of sell-now posts, bios, live talk, and the lifestyle tee picture.',
    steps: [
      { label: 'Sign in as Admin. Open Content Factory. Click the Sprint 0 filter / section.', href: '/admin/factory' },
      'Confirm week 1 rows are shop-link posts and week 2 includes pin, bios, and live.',
      'Confirm the lifestyle tee picture is the visual called out for sell posts.',
      'Turn Sprint 0 off and on. Confirm the list actually filters.',
    ],
  },
  'cf-s1-qa': {
    description: 'Content Factory Sprint 1 includes gear rows and organic posts; the sprint filter works.',
    steps: [
      { label: 'Open Content Factory. Click the Sprint 1 filter / section.', href: '/admin/factory' },
      'Confirm gear upload/pick rows are there.',
      'Confirm organic post rows are there.',
      'Confirm changing the sprint filter changes the list.',
    ],
  },
  'cf-s2-qa': {
    description:
      'Sprint 2 keep-selling posts include https://nonnegotiation.com/gear. No “coming soon” shop copy.',
    steps: [
      { label: 'Open Content Factory. Click the Sprint 2 filter / section.', href: '/admin/factory' },
      'Open a keep-selling post. Confirm the Shop Gear URL https://nonnegotiation.com/gear is in the copy.',
      'Confirm none of those posts say the shop is coming soon or that the link is not ready.',
    ],
  },
  'cf-s3-qa': {
    description: 'Sprint 3 includes About/FAQ posts and weekend prep rows.',
    steps: [
      { label: 'Open Content Factory. Click the Sprint 3 filter / section.', href: '/admin/factory' },
      'Confirm About and FAQ posts are listed.',
      'Confirm weekend prep rows are listed.',
    ],
  },
  'cf-s4-qa': {
    description: 'Sprint 4 includes drop announcement and launch-week posts.',
    steps: [
      { label: 'Open Content Factory. Click the Sprint 4 filter / section.', href: '/admin/factory' },
      'Confirm drop-announcement posts are listed.',
      'Confirm launch-week posts are listed.',
    ],
  },
  'website-qa1': {
    description:
      'Home introduces the website. Footer links open About, Contact, Privacy, Terms, and FAQ.',
    steps: [
      { label: 'Go to Home.', href: '/' },
      'Confirm a website intro is visible (this is a site people can browse, not a blank landing).',
      'Scroll to the footer. Click About, Contact, Privacy Policy, Terms of Use, and FAQ one at a time. Each should open that page — not a 404.',
    ],
  },
  'list-qa1': {
    description:
      'The mailing list accepts a valid DEMO DATA email, rejects junk, and is not a membership. Use tester@example.com — never a real personal inbox.',
    steps: [
      { label: 'Go to Home and scroll to the mailing-list / email sign-up, or open /list if you have that page.', href: '/list' },
      'Type tester@example.com (DEMO DATA) and submit. Confirm a success message that you are on the list.',
      'Try empty, a bad email (no @), and the same email again. Confirm each is rejected with a clear message.',
      'Confirm this did not open Join / Memberships and did not ask for phone or home address.',
    ],
  },
  'analytics-qa1': {
    description:
      'Angela uploads the latest analytics screenshots on each platform’s gather task. Use the Task List — each task names the screens. Do not re-upload today’s already-saved screenshots.',
    steps: [
      { label: 'Sign in as Admin. Open Task List. Find Angela’s Facebook gather task for the next due date.', href: '/admin/tasks' },
      'Open that task. Confirm the steps list the exact screens to capture (for example Reach).',
      'Upload the latest screenshots on that day’s task only — not a copy of today’s already-uploaded set.',
    ],
  },
  'analytics-qa2': {
    description:
      'Evelyn’s review task is due the day after each gather. Notes from that review should guide the next create on that platform.',
    steps: [
      { label: 'Sign in as Admin. Open Task List. Find Evelyn’s Facebook review task (due the day after Angela’s gather).', href: '/admin/tasks' },
      'Open it. Confirm every listed screen has an upload from Angela.',
      'Write or confirm recommendations in the notes, in plain words, for what to create next on that platform.',
    ],
  },
  ...phase1WebsiteReviewQaContent(),
  ...sprint2WebsiteReviewQaContent(),
  ...formWalkthroughQaContent(),
  ...moodWorkflowQaContent(),
  ...journalMakeReviewQaContent(),
};

export function taskContentSeed(id: string): WorkItemContentSeed | undefined {
  const root = String(id || '').split('::')[0];
  return TASK_CONTENT_SEEDS[root] || TASK_CONTENT_SEEDS[id] || siteAnalyticsContentSeed(root);
}

export function qaContentSeed(id: string): WorkItemContentSeed | undefined {
  return QA_CONTENT_SEEDS[id];
}

/**
 * Tasks that need QA coverage → related test ids.
 * Used to cross-link Task List ↔ Testing board.
 */
export const TASK_TO_TEST_LINKS: Record<string, string[]> = {
  't-27': ['gear-sel-qa1'],
  't-48': ['gear-brand-qa1'],
  't-41': ['logo-qa1'],
  't-42': ['logo-qa1'],
  't-43': ['pay-qa1'],
  't-10': ['shop-gear-page-qa1', 'shop-gear-page-qa2'],
  't-11': ['shop-gear-page-qa1', 'shop-gear-page-qa2'],
  't-44': ['shop-gear-page-qa1', 'shop-gear-page-qa2'],
  't-45': ['shop-gear-page-qa1', 'shop-gear-page-qa2'],
  't-46': ['shop-gear-page-qa1'],
  't-47': ['shop-gear-page-qa2'],
  't-62': ['shop-gear-page-qa1'],
  't-69': ['shop-gear-page-qa1', 'shop-gear-page-qa2'],
  't-71': ['shop-gear-page-qa1'],
  't-72': ['shop-gear-page-qa2'],
  't-73': ['sprint-roi-qa1'],
  't-31': ['cf-qa1'],
  't-32': ['cf-qa2', 'cf-qa3'],
  't-19': [
    'shop-gear-page-qa1',
    'shop-gear-page-qa2',
    'pay-qa1',
    'logo-qa1',
    'gear-sel-qa1',
    'cf-qa1',
  ],
  't-18': ['auth-qa1'],
  't-80': ['website-qa1', 'about-qa1', 'contact-qa1', 'privacy-qa1', 'terms-qa1', 'faq-qa1'],
  't-81': ['list-qa1'],
  't-82': ['website-qa1', 'list-qa1'],
  [PHASE_1_WEBSITE_REVIEW_TASK_ID]: phase1WebsiteReviewTestIds(),
  [SPRINT_2_WEBSITE_REVIEW_TASK_ID]: sprint2WebsiteReviewTestIds(),
  [FORM_WALKTHROUGH_TASK_ID]: formWalkthroughTestIds(),
  [MOOD_WORKFLOW_TASK_ID]: moodWorkflowTestIds(),
  ...journalMakeReviewTaskToTestLinks(),
};

export function linkedTestsForTask(taskId: string): string[] {
  const root = String(taskId || '').split('::')[0];
  const linked = TASK_TO_TEST_LINKS[root];
  if (linked) return [...linked];
  const analytics = siteAnalyticsTaskById(root);
  if (analytics) return analytics.role === 'angela' ? ['analytics-qa1'] : ['analytics-qa2'];
  return [];
}

export function linkedTasksForTest(testId: string): string[] {
  const id = String(testId || '').trim();
  const out: string[] = [];
  for (const [taskId, tests] of Object.entries(TASK_TO_TEST_LINKS)) {
    if (tests.includes(id)) out.push(taskId);
  }
  if (id === 'analytics-qa1' || id === 'analytics-qa2') {
    const role = id === 'analytics-qa1' ? 'angela' : 'evelyn';
    for (const instance of buildSiteAnalyticsInstances()) {
      if (instance.role === role) out.push(instance.id);
    }
  }
  return out;
}

