import { DEFAULT_FROM_ADDRESS } from './email/sendPayload';
import { ORDER_STORE_URL } from './websiteScope';
import { HOUSE_BRAND_NAME, HOUSE_FOOTER_LINE, HOUSE_INTRO_LINE, TEE_SALES_SHOP_URL } from './teeSalesPlaybook';
import { ANGELA_NIECE_ORIGIN } from './planIntro';
import { MAILING_LIST_NOT_MEMBERSHIP_NOTE } from './mailingList';

export const LAUNCH_PAGE_IDS = ['about', 'contact', 'privacy', 'terms', 'faq', 'list'] as const;
export type LaunchPageId = (typeof LAUNCH_PAGE_IDS)[number];

export type LaunchFaqItem = {
  question: string;
  answer: string;
};

export type LaunchPageCopy = {
  id: LaunchPageId;
  path: `/${LaunchPageId}`;
  title: string;
  kicker: string;
  lede: string;
  sections: Array<{ heading: string; body: string }>;
  faqs?: LaunchFaqItem[];
  showMailingList?: boolean;
};

export const PUBLIC_CONTACT_EMAIL = DEFAULT_FROM_ADDRESS;

export const LAUNCH_PAGES: LaunchPageCopy[] = [
  {
    id: 'about',
    path: '/about',
    title: 'About',
    kicker: 'The brand',
    lede: `${HOUSE_INTRO_LINE} Feel it. Follow the plan anyway.`,
    sections: [
      {
        heading: 'The teaching',
        body: HOUSE_FOOTER_LINE,
      },
      {
        heading: 'Where the idea came from',
        body: ANGELA_NIECE_ORIGIN,
      },
      {
        heading: 'What Phase 1 is',
        body: `${HOUSE_BRAND_NAME} is live as a gear-sales site. Shop tees, hoodies, and hats. Memberships stay Coming Soon. Get shop and brand notes on the mailing list — that is not a membership.`,
      },
    ],
  },
  {
    id: 'contact',
    path: '/contact',
    title: 'Contact',
    kicker: 'Talk to the house',
    lede: 'Questions about the brand or the site go here. Order questions stay with the shop.',
    showMailingList: true,
    sections: [
      {
        heading: 'Brand & website',
        body: `Email ${PUBLIC_CONTACT_EMAIL}. We do not ask for a phone number, home address, or date of birth on this page.`,
      },
      {
        heading: 'Orders',
        body: `Gear checkout lives on SnatchVault: ${ORDER_STORE_URL}. Use that store’s order help for shipping and receipts.`,
      },
    ],
  },
  {
    id: 'privacy',
    path: '/privacy',
    title: 'Privacy Policy',
    kicker: 'What we keep',
    lede: 'Phase 1 collects as little as the site needs. The mailing list is email plus an optional first name — not a membership account.',
    sections: [
      {
        heading: 'Mailing list',
        body: `${MAILING_LIST_NOT_MEMBERSHIP_NOTE} We store the email you type and, if you add it, a first name. We do not collect a phone number, full address, or date of birth for the list.`,
      },
      {
        heading: 'Accounts',
        body: 'Signing in to a site account is separate from the mailing list. Member tiers are not configured in Phase 1.',
      },
      {
        heading: 'Orders',
        body: `Purchases are processed on SnatchVault at ${ORDER_STORE_URL}. That store handles payment and shipping details.`,
      },
      {
        heading: 'Contact',
        body: `To ask a privacy question or request a list removal, email ${PUBLIC_CONTACT_EMAIL}.`,
      },
    ],
  },
  {
    id: 'terms',
    path: '/terms',
    title: 'Terms of Use',
    kicker: 'How to use this site',
    lede: `${HOUSE_BRAND_NAME} is a NonNegotiation brand. Use the site to shop, read, and join the mailing list.`,
    sections: [
      {
        heading: 'The site',
        body: 'These pages are for brand information, gear, and mailing-list updates. Do not copy the marks, copy, or tools for another shop.',
      },
      {
        heading: 'Orders',
        body: `Paid gear orders are placed on SnatchVault. Shop Gear on this site points to ${TEE_SALES_SHOP_URL} and the SnatchVault collection.`,
      },
      {
        heading: 'Memberships',
        body: 'Join / Memberships is Coming Soon. A mailing-list sign-up is not a paid membership and does not unlock member tools.',
      },
    ],
  },
  {
    id: 'faq',
    path: '/faq',
    title: 'FAQ',
    kicker: 'Quick answers',
    lede: 'Phase 1 is the gear launch and the public website. Here is what people ask first.',
    faqs: [
      {
        question: 'What is MY PLAN, NOT MY MOOD?',
        answer: `${HOUSE_INTRO_LINE} The line is: do not let a temporary mood determine a permanent outcome.`,
      },
      {
        question: 'Where do I buy gear?',
        answer: `Shop Gear is at ${TEE_SALES_SHOP_URL}. Checkout is on SnatchVault: ${ORDER_STORE_URL}.`,
      },
      {
        question: 'Are memberships open?',
        answer: 'No. Join / Memberships is Coming Soon. Use the mailing list if you want updates.',
      },
      {
        question: 'How do I get updates without joining?',
        answer: 'Use the mailing list sign-up. Email is required. First name is optional. It is not a membership.',
      },
      {
        question: 'How do I contact you?',
        answer: `Email ${PUBLIC_CONTACT_EMAIL}, or use the Contact page.`,
      },
    ],
    sections: [],
  },
  {
    id: 'list',
    path: '/list',
    title: 'Mailing List',
    kicker: 'Stay on the plan',
    lede: `${MAILING_LIST_NOT_MEMBERSHIP_NOTE} Email is required. First name is optional.`,
    showMailingList: true,
    sections: [
      {
        heading: 'What you get',
        body: 'Shop drops, page launches, and brand notes. No membership checkout and no extra personal fields.',
      },
    ],
  },
];

export function launchPageById(id: LaunchPageId): LaunchPageCopy {
  const page = LAUNCH_PAGES.find((item) => item.id === id);
  if (!page) {
    throw new Error(`Unknown launch page: ${id}`);
  }
  return page;
}

export function launchPageIds(): LaunchPageId[] {
  return [...LAUNCH_PAGE_IDS];
}

export function launchPagePaths(): string[] {
  return LAUNCH_PAGES.map((page) => page.path);
}

export function websiteLaunchPageIds(): LaunchPageId[] {
  return LAUNCH_PAGE_IDS.filter((id) => id !== 'list');
}
