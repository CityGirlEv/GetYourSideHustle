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
  TEE_SALES_BIO_LINE,
  TEE_SALES_LIVE_NO_SAMPLE,
  TEE_SALES_LIVE_ON_BODY,
  TEE_SALES_PINNED_POST,
  TEE_SALES_SHOP_URL,
  TEE_SALES_WEBSITE,
} from './teeSalesPlaybook';

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
 * First-step destination for a task or test — the page being reviewed or tested.
 * Used so saved boards pick up links even when step copy already existed.
 */
export function pageHrefForWorkItem(id: string): string | undefined {
  const root = String(id || '').split('::')[0].trim();
  return WORK_ITEM_PAGE_HREFS[root];
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
  't-17': '/admin/emails',
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
  'PW-ADMIN-001': '/admin/testing',
};

export const TASK_CONTENT_SEEDS: Record<string, WorkItemContentSeed> = {
  't-1': {
    description: 'Confirm Phase 1–3 budget commitment totaling $10,000 is funded and tracked.',
    steps: [
      { label: 'Review the three-phase payment schedule on the Plan / Budget', href: '/admin/budget' },
      'Confirm Phase 1, 2, and 3 amounts add to $10,000',
      'Note what is already paid vs still due',
      'Confirm with Evelyn that the ledger matches',
    ],
  },
  't-43': {
    description: 'Pay Phase 1 ($4,000) using preferred methods (Zelle or Cash App).',
    steps: [
      { label: 'Open the Make Payment page', href: '/pay' },
      'Choose Zelle or Cash App (preferred)',
      'Send $4,000 for Phase 1',
      'Save or screenshot the payment confirmation',
      'Tell Evelyn the payment is complete',
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
    description: 'Configure Phase 1 email (orders, fulfillment, contact, admin).',
    steps: [
      { label: 'Open Emails in Admin Studio', href: '/admin/emails' },
      'Confirm templates exist for order / contact / admin notify',
      'Confirm Resend domain and keys are set',
      'Send one test email and confirm delivery',
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
    description: 'QA Shop Gear, launch pages, and Phase 1 email before launch.',
    steps: [
      { label: 'Open Shop Gear', href: '/gear' },
      'Run smoke checks on launch pages (About, Contact, Privacy, Terms, FAQ)',
      'Confirm a test email sends',
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
      'Review expected tee sales vs organic assumptions',
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
      'Mark the sprint cadence done',
    ],
  },
  't-52': {
    description: 'Complete Content Factory Sprint 2 keep-selling cadence for tees, hoodie, and hat. Shop is already live.',
    steps: [
      { label: 'Open Content Factory Sprint 2', href: '/admin/factory' },
      'Complete tee / hoodie / hat sell posts with the Shop Gear URL',
      'Confirm the SHOP LINK caption is nonnegotiation.com/gear',
      'Mark the sprint cadence done',
    ],
  },
  't-53': {
    description: 'Complete Content Factory Sprint 3 About/FAQ cadence. Every post still includes the Shop Gear URL.',
    steps: [
      { label: 'Open Content Factory Sprint 3', href: '/admin/factory' },
      'Complete About/FAQ posts with the shop link',
      'Complete weekend prep rows',
      'Mark the sprint cadence done',
    ],
  },
  't-54': {
    description: 'Complete Content Factory Sprint 4 launch-week cadence. Shop is already live — this is on-body intensification, not a shop go-live.',
    steps: [
      { label: 'Open Content Factory Sprint 4', href: '/admin/factory' },
      'Complete drop announcement and launch-week posts',
      'Keep https://nonnegotiation.com/gear in every post',
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
      'Home kicker: A NonNegotiation brand. Then MY PLAN, NOT MY MOOD',
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
};

export const QA_CONTENT_SEEDS: Record<string, WorkItemContentSeed> = {
  qa1: {
    description: 'Clicking hero speech bubbles selects mood and scrolls smoothly to the action card.',
    steps: [
      { label: 'Open the home page', href: '/' },
      'Click each of the 5 character speech bubbles',
      'Confirm the mood selection updates',
      'Confirm smooth scroll to the action card',
    ],
  },
  qa2: {
    description: 'WHICH MOOD AM I IN TODAY banner uses Rust Orange background and crisp white type.',
    steps: [
      { label: 'Open the home page', href: '/' },
      'Locate the mood question banner',
      'Confirm Rust Orange background',
      'Confirm white text is crisp and readable',
    ],
  },
  qa3: {
    description: 'Desktop product/mood layout is a 2-column grid (mockups left, details right).',
    steps: [
      { label: 'Open the home or shop experience on desktop width', href: '/' },
      'Confirm left column shows mockup images',
      'Confirm right column shows details',
      'Resize slightly and confirm the grid holds',
    ],
  },
  qa4: {
    description: 'Cart drawer slides over and the badge count updates when items are added.',
    steps: [
      { label: 'Open Shop Gear', href: '/gear' },
      'Add an item to the cart',
      'Confirm badge count updates',
      'Confirm the slide-over drawer opens with the item',
    ],
  },
  qa5: {
    description: '#WhatWonToday receipt generates with share and download.',
    steps: [
      { label: 'Open What Won Today / receipt flow', href: '/' },
      'Generate a victory receipt',
      'Confirm share action is available',
      'Confirm download works',
    ],
  },
  qa6: {
    description: '7-Day Reset Starter Kit modal collects email + goal and offers a printable PDF.',
    steps: [
      { label: 'Open the 7-Day Reset entry point', href: '/' },
      'Open the modal',
      'Enter email and 7-day goal',
      'Confirm printable / PDF path works',
    ],
  },
  'aff-qa1': {
    description: 'Morning micro-set loads identity + confidence affirmations with breath cue timing.',
    steps: [
      { label: 'Open Daily Affirmations (morning)', href: '/' },
      'Confirm the morning pool loads',
      'Confirm breath cue timing (~3s)',
      'Complete or skip through the short sequence',
    ],
  },
  'aff-qa2': {
    description: 'Midday micro-set loads boundary-focused affirmations.',
    steps: [
      { label: 'Open Daily Affirmations (midday)', href: '/' },
      'Confirm boundary / truth pool loads',
      'Confirm the reset trigger feels correct',
      'Complete or skip the sequence',
    ],
  },
  'aff-qa3': {
    description: 'Night micro-set loads healing, release, and faith affirmations.',
    steps: [
      { label: 'Open Daily Affirmations (night)', href: '/' },
      'Confirm night pool loads',
      'Confirm day-closing protocol copy',
      'Complete or skip the sequence',
    ],
  },
  'aff-qa4': {
    description: 'Rotation engine avoids repetition fatigue and weights personalization.',
    steps: [
      'Run morning/midday/night across two sessions',
      'Confirm phrases are not stuck on the same first item',
      'Confirm reflection weighting still feels sensible',
      'Note any obvious repeats for Dev',
    ],
  },
  'aff-qa5': {
    description: '10-second reflection + zero-guilt skip persists a resonant phrase.',
    steps: [
      { label: 'Open affirmations reflection', href: '/' },
      'Select a resonant phrase',
      'Use skip without guilt / friction',
      'Reload and confirm persistence where expected',
    ],
  },
  'aff-qa6': {
    description: 'Daily completion state tracks morning/midday/night and resets by calendar day.',
    steps: [
      { label: 'Open affirmations', href: '/' },
      'Complete one day-part and confirm it shows done',
      'Confirm other day-parts remain independent',
      'Confirm a new calendar day resets appropriately',
    ],
  },
  'aff-qa7': {
    description: 'Affirmations UI is usable on mobile, tablet, and desktop with strong contrast.',
    steps: [
      'Check mobile width (~320–390px): no horizontal scroll',
      'Check tablet width',
      'Check desktop width',
      'Confirm contrast is readable',
    ],
  },
  'aff-qa8': {
    description: 'Voice Trust Layer remains planned — specs/data model only for now.',
    steps: [
      'Confirm Voice Trust is labeled Future / Planned in Admin Testing',
      'Confirm no broken live Voice Trust UI is required for Phase 1',
      'Note any missing spec fields for later',
    ],
  },
  'auth-qa1': {
    description: 'Admin role gates show only Testing + Task List for limited admin users.',
    steps: [
      { label: 'Open Admin Studio as a limited admin', href: '/admin' },
      'Confirm Testing tab is visible',
      'Confirm Task List tab is visible',
      'Confirm budget / restricted tabs stay gated',
    ],
  },
  'gear-sel-qa1': {
    description: 'Gear Selections upload and Angela picks work within style-card rules.',
    steps: [
      { label: 'Open Gear Selections', href: '/admin/gear-selections' },
      'Upload a valid style-card image',
      'Confirm tee/hoodie/hat grouping on a card',
      'As Angela, pick within limits (≤3 tees, 1 hoodie, 1 hat)',
      'Confirm PDF/SVG/oversized rejects work',
    ],
  },
  'sprint-roi-qa1': {
    description: 'Plan shows organic ROI, the weekly scorecard, expected tee sales, and improvement suggestions.',
    steps: [
      { label: 'Open the Plan', href: '/admin/plan' },
      'Confirm each Phase 1 sprint lists ROI / sales notes',
      'Confirm the scorecard lists min / target / stretch for followers, engagement, clicks, and sales',
      'Confirm organic-only / no paid ads assumption is clear',
    ],
  },
  'cf-qa1': {
    description: 'Content Factory lists Phase 1 posts filterable by sprint, assignee, and channel.',
    steps: [
      { label: 'Open Content Factory', href: '/admin/factory' },
      'Filter by sprint',
      'Filter by assignee',
      'Filter by channel (Facebook, YouTube, TikTok, Personal)',
      'Confirm Angela post vs Evelyn prep rows',
    ],
  },
  'cf-qa2': {
    description: 'Asset Library groups cards by style name with tee/hoodie/hat on the same card.',
    steps: [
      { label: 'Open Asset Library', href: '/admin/asset-library' },
      'Confirm grouping by style name',
      'Confirm a style can hold several cards',
      'Confirm tee, hoodie, and hat can share a card',
    ],
  },
  'cf-qa3': {
    description: 'Asset Library rejects bad images; captions can save without an image.',
    steps: [
      { label: 'Open Asset Library', href: '/admin/asset-library' },
      'Attempt a non-image upload — expect reject',
      'Attempt an oversized upload — expect reject',
      'Save a caption-only asset successfully',
    ],
  },
  'logo-qa1': {
    description: 'Logo Concepts folder upload + Angela’s chosen mark selection.',
    steps: [
      { label: 'Open Logo Concepts', href: '/admin/logo-concepts' },
      'Upload a logo folder (or files)',
      'Confirm subfolder sorting when present',
      'Select the chosen mark as Angela',
      'Confirm PDF/oversized rejects; SVG allowed',
    ],
  },
  'pay-qa1': {
    description: 'Make Payment page shows Zelle, Cash App, Venmo, and Stripe options for Phase 1.',
    steps: [
      { label: 'Open Make Payment', href: '/pay' },
      'Confirm Phase 1 amount ($4,000)',
      'Confirm Zelle and Cash App are preferred',
      'Confirm Venmo and Stripe are present',
    ],
  },
  'shop-gear-page-qa1': {
    description: 'Evelyn walks Shop Gear: styles, brands, hats, and Shopify links.',
    steps: [
      { label: 'Open Shop Gear', href: '/gear' },
      'Confirm selected styles',
      'Confirm hoodie/shirt brand and hat colors',
      'Confirm Shopify / checkout links',
    ],
  },
  'shop-gear-page-qa2': {
    description: 'Angela walks Shop Gear and confirms her selections before go-live.',
    steps: [
      { label: 'Open Shop Gear', href: '/gear' },
      'Confirm your selected styles',
      'Confirm shirt/hoodie brand and hat colors',
      'Send pass/fail notes to Evelyn',
    ],
  },
  'gear-brand-qa1': {
    description: 'Angela can pick up to 2 blank brands for shirts/hoodies on Gear Selections.',
    steps: [
      { label: 'Open Gear Selections', href: '/admin/gear-selections' },
      'Open the shirt/hoodie brand picker',
      'Select up to 2 brands',
      'Confirm the pick saves with other gear selections',
    ],
  },
  'home-qa1': {
    description: 'Home loads with brand line and mood tool entry; no horizontal scroll on mobile.',
    steps: [
      { label: 'Open the home page', href: '/' },
      'Confirm the brand line is visible',
      'Confirm mood tool entry is reachable',
      'Confirm no horizontal scroll on mobile (~320px)',
    ],
  },
  'domain-qa1': {
    description: 'https://nonnegotiation.com serves the Phase 1 storefront over HTTPS.',
    steps: [
      { label: 'Open production (nonnegotiation.com)', href: 'https://nonnegotiation.com' },
      'Confirm HTTPS and the storefront load',
      'Confirm Shop Gear is reachable from the domain',
    ],
  },
  'mood-qa1': {
    description: 'Mood bubbles select a mood and scroll to the action area.',
    steps: [
      { label: 'Open the home page mood tool', href: '/' },
      'Select a mood from the bubbles',
      'Confirm scroll to the action area',
    ],
  },
  'receipt-qa1': {
    description: 'Receipt generator creates a shareable/downloadable card.',
    steps: [
      { label: 'Open What Won Today / receipt flow', href: '/' },
      'Generate a receipt',
      'Confirm share and download',
    ],
  },
  'about-qa1': {
    description: 'About page loads with brand story; mobile has no horizontal scroll.',
    steps: [
      { label: 'Open About', href: '/about' },
      'Confirm brand story is present',
      'Confirm mobile layout',
    ],
  },
  'contact-qa1': {
    description: 'Contact page lists working contact paths and is mobile-friendly.',
    steps: [
      { label: 'Open Contact', href: '/contact' },
      'Confirm contact paths work',
      'Confirm mobile layout',
    ],
  },
  'privacy-qa1': {
    description: 'Privacy Policy is reachable from the footer and readable on mobile.',
    steps: [
      { label: 'Open Privacy Policy', href: '/privacy' },
      'Confirm footer reaches this page',
      'Confirm it is readable on mobile',
    ],
  },
  'terms-qa1': {
    description: 'Terms of Use is reachable from the footer and readable on mobile.',
    steps: [
      { label: 'Open Terms of Use', href: '/terms' },
      'Confirm footer reaches this page',
      'Confirm it is readable on mobile',
    ],
  },
  'faq-qa1': {
    description: 'FAQ answers order/brand questions and works on mobile.',
    steps: [
      { label: 'Open FAQ', href: '/faq' },
      'Confirm key Phase 1 questions are answered',
      'Confirm mobile layout',
    ],
  },
  'join-qa1': {
    description: 'Join shows Coming Soon; no live member signup in Phase 1.',
    steps: [
      { label: 'Open Join / Memberships', href: '/join' },
      'Confirm Coming Soon is visible',
      'Confirm no live signup',
    ],
  },
  'email-qa1': {
    description: 'Admin Emails area has Phase 1 templates; a test send delivers.',
    steps: [
      { label: 'Open Emails in Admin Studio', href: '/admin/emails' },
      'Confirm Phase 1 templates exist',
      'Send a test email and confirm delivery',
    ],
  },
  'launch-qa1': {
    description: 'After launch, Shop Gear and payment/store links work on production.',
    steps: [
      { label: 'Open Shop Gear', href: '/gear' },
      'Confirm selected styles load',
      'Confirm payment / store links work',
    ],
  },
  'cf-s0-qa': {
    description: 'Sprint 0 CF calendar spans two weeks: sell-now posts, bios, live talk track, lifestyle tee mockup.',
    steps: [
      { label: 'Open Content Factory Sprint 0', href: '/admin/factory' },
      'Confirm week 1 shop-link posts and week 2 pin/bios/live rows',
      'Confirm the lifestyle tee mockup is the visual for sell posts',
      'Confirm sprint filter works',
    ],
  },
  'cf-s1-qa': {
    description: 'Sprint 1 CF includes gear uploads/picks and organic posts; filters work.',
    steps: [
      { label: 'Open Content Factory Sprint 1', href: '/admin/factory' },
      'Confirm gear rows',
      'Confirm organic posts',
      'Confirm sprint filter works',
    ],
  },
  'cf-s2-qa': {
    description: 'Sprint 2 CF keeps selling tees, hoodie, and hat with the Shop Gear URL. Shop is already live.',
    steps: [
      { label: 'Open Content Factory Sprint 2', href: '/admin/factory' },
      'Confirm keep-selling posts include nonnegotiation.com/gear',
      'Confirm no coming-soon / link-soon copy',
    ],
  },
  'cf-s3-qa': {
    description: 'Sprint 3 CF includes About/FAQ posts and weekend prep.',
    steps: [
      { label: 'Open Content Factory Sprint 3', href: '/admin/factory' },
      'Confirm About/FAQ posts',
      'Confirm weekend prep rows',
    ],
  },
  'cf-s4-qa': {
    description: 'Sprint 4 CF includes drop announcement and launch-week organic posts.',
    steps: [
      { label: 'Open Content Factory Sprint 4', href: '/admin/factory' },
      'Confirm drop announcement posts',
      'Confirm launch-week cadence',
    ],
  },
};

export function taskContentSeed(id: string): WorkItemContentSeed | undefined {
  const root = String(id || '').split('::')[0];
  return TASK_CONTENT_SEEDS[root] || TASK_CONTENT_SEEDS[id];
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
};

export function linkedTestsForTask(taskId: string): string[] {
  const root = String(taskId || '').split('::')[0];
  return [...(TASK_TO_TEST_LINKS[root] ?? [])];
}

export function linkedTasksForTest(testId: string): string[] {
  const id = String(testId || '').trim();
  const out: string[] = [];
  for (const [taskId, tests] of Object.entries(TASK_TO_TEST_LINKS)) {
    if (tests.includes(id)) out.push(taskId);
  }
  return out;
}

