import { DEFAULT_FROM_ADDRESS } from './email/sendPayload';
import { ORDER_STORE_URL } from './websiteScope';
import { HOUSE_BRAND_NAME, HOUSE_FOOTER_LINE, HOUSE_INTRO_LINE, TEE_SALES_SHOP_URL } from './teeSalesPlaybook';
import {
  ANGELA_FOUNDER_LINE,
  ANGELA_NIECE_ORIGIN,
  ANGELA_PORTRAIT_ALT,
  ANGELA_PORTRAIT_PATH,
  ANGELA_PUBLIC_BIO,
  ANGELA_PUBLIC_ROLE,
} from './planIntro';
import { MAILING_LIST_NOT_MEMBERSHIP_NOTE } from './mailingList';

export const LAUNCH_PAGE_IDS = ['about', 'contact', 'privacy', 'terms', 'faq', 'list'] as const;
export type LaunchPageId = (typeof LAUNCH_PAGE_IDS)[number];

export const LEGAL_LAST_UPDATED = 'September 2026';
export const LEGAL_JURISDICTION_PLACEHOLDER = '[STATE / JURISDICTION TO BE PROVIDED]';
export const LEGAL_MAILING_ADDRESS_PLACEHOLDER = '[MAILING ADDRESS TO BE PROVIDED]';

export const LAUNCH_PATH_ALIASES: Record<string, LaunchPageId> = {
  'privacy-policy': 'privacy',
  'terms-of-use': 'terms',
};

export type LaunchFaqItem = {
  question: string;
  answer: string;
};

export type LaunchFaqGroup = {
  heading: string;
  items: LaunchFaqItem[];
};

export type LaunchSection = {
  heading: string;
  body: string | string[];
  link?: { href: string; label: string };
  image?: { src: string; alt: string };
  /** Flow this block beside the previous section's photo instead of starting a new card. */
  besideImage?: boolean;
};

export type LaunchSectionGroup = {
  image?: { src: string; alt: string };
  sections: LaunchSection[];
};

export function groupLaunchSections(sections: LaunchSection[]): LaunchSectionGroup[] {
  return sections.reduce<LaunchSectionGroup[]>((groups, section) => {
    const last = groups[groups.length - 1];
    if (section.besideImage && last?.image) {
      last.sections.push(section);
      return groups;
    }
    groups.push({
      image: section.image,
      sections: [section],
    });
    return groups;
  }, []);
}

export type LaunchPageCopy = {
  id: LaunchPageId;
  path: string;
  title: string;
  navLabel?: string;
  headline?: string;
  kicker: string;
  lede: string;
  lastUpdated?: string;
  metaTitle?: string;
  metaDescription?: string;
  sections: LaunchSection[];
  faqs?: LaunchFaqItem[];
  faqGroups?: LaunchFaqGroup[];
  showMailingList?: boolean;
  showContactForm?: boolean;
  compactHero?: boolean;
};

export const PUBLIC_CONTACT_EMAIL = DEFAULT_FROM_ADDRESS;

export const LAUNCH_PAGES: LaunchPageCopy[] = [
  {
    id: 'about',
    path: '/about',
    title: 'About',
    headline: 'About My Plan, Not My Mood',
    kicker: 'The brand',
    lede: 'Founded by Angela Harris. Feel it. Follow the plan anyway.',
    compactHero: true,
    metaTitle: 'About | My Plan, Not My Mood',
    metaDescription: `${HOUSE_INTRO_LINE} Founded by Angela Harris. ${ANGELA_NIECE_ORIGIN}`,
    sections: [
      {
        heading: 'Where the idea came from',
        body: ANGELA_NIECE_ORIGIN,
      },
      {
        heading: 'The founder',
        body: [ANGELA_FOUNDER_LINE, ANGELA_PUBLIC_ROLE, ANGELA_PUBLIC_BIO],
        image: { src: ANGELA_PORTRAIT_PATH, alt: ANGELA_PORTRAIT_ALT },
      },
      {
        heading: 'The teaching',
        body: HOUSE_FOOTER_LINE,
        besideImage: true,
      },
      {
        heading: 'Phase 1',
        body: `${HOUSE_BRAND_NAME} is live as a gear-sales site. Shop tees, hoodies, and hats. Memberships stay Coming Soon. Join the Movement for shop and brand notes — that is not a membership.`,
        besideImage: true,
      },
    ],
  },
  {
    id: 'contact',
    path: '/contact',
    title: 'Contact Us',
    navLabel: 'Contact',
    headline: 'Let’s Connect',
    kicker: 'Talk to the house',
    lede: 'Questions about the brand or the site go here. Order questions stay with the shop.',
    compactHero: true,
    metaTitle: 'Contact Us | My Plan, Not My Mood',
    metaDescription:
      'Write My Plan, Not My Mood about the brand or the website. Order, size, and shipping questions stay with the SnatchVault shop.',
    showMailingList: true,
    showContactForm: true,
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
    path: '/privacy-policy',
    title: 'Privacy Policy',
    kicker: 'What we keep',
    lede: 'Phase 1 collects as little as the site needs. This policy explains what we receive, how it may be used, and the choices you have.',
    compactHero: true,
    lastUpdated: LEGAL_LAST_UPDATED,
    metaTitle: 'Privacy Policy | My Plan, Not My Mood',
    metaDescription:
      'How My Plan, Not My Mood handles mailing-list sign-ups, contact messages, accounts, cookies, and orders processed on SnatchVault.',
    sections: [
      {
        heading: 'Who we are',
        body: [
          `${HOUSE_BRAND_NAME} is a lifestyle and gear brand under NonNegotiation, published at https://nonnegotiation.com.`,
          `Privacy questions and list-removal requests go to ${PUBLIC_CONTACT_EMAIL}. A public street address is not published on this site. ${LEGAL_MAILING_ADDRESS_PLACEHOLDER}`,
        ],
      },
      {
        heading: 'Information you voluntarily provide',
        body: [
          'We receive information when you choose to give it to us. That can include a mailing-list email and optional first name, a contact message (name, email, subject, and message), and the email you use if you register or sign in to a site account.',
          'We do not ask for a phone number, full home address, or date of birth on the public Contact or mailing-list pages.',
        ],
      },
      {
        heading: 'Contact form information',
        body: `If you use the Contact page, we receive the name, email, subject, and message you send so we can reply at ${PUBLIC_CONTACT_EMAIL}.`,
      },
      {
        heading: 'Customer and order information',
        body: `Paid gear orders are placed on SnatchVault at ${ORDER_STORE_URL}. That store — and its commerce platform — handles payment, shipping, and order details. We do not collect card numbers on nonnegotiation.com.`,
      },
      {
        heading: 'Email addresses and marketing communications',
        body: `${MAILING_LIST_NOT_MEMBERSHIP_NOTE} We store the email you type and, if you add it, a first name. You may ask to be removed by emailing ${PUBLIC_CONTACT_EMAIL}. Account-related messages (for example sign-up or password help) are separate from the marketing list.`,
      },
      {
        heading: 'Automatically collected information',
        body: 'Like most websites, our host and browser may record technical data such as IP address, browser type, pages viewed, and the time of a visit. Interactive tools on this site (for example mood notes and “What Won Today?” receipts) are designed to stay in your browser unless you choose to save or share them.',
      },
      {
        heading: 'Cookies and similar technologies',
        body: 'We use cookies and browser storage that help the site run: sign-in sessions, cart state, mailing-list confirmation on this device, and similar preferences. You can block or clear cookies in your browser. Some features may not work if you do.',
      },
      {
        heading: 'Analytics',
        body: 'This website does not currently load a named third-party analytics script. If we add one later, we will update this policy with the provider and what it collects.',
      },
      {
        heading: 'E-commerce and payment processing',
        body: `Checkout for tees, hoodies, and hats is processed on SnatchVault / Shopify, not on a card form hosted by this website. Their privacy and payment terms apply to those purchases.`,
      },
      {
        heading: 'Third-party service providers',
        body: [
          'We use vendors only as needed to operate the brand site. That includes website hosting, account email delivery, and the SnatchVault store for orders.',
          'Those providers process information on our behalf or, for checkout, as the store of record. We do not sell your personal information.',
        ],
      },
      {
        heading: 'How information may be used',
        body: 'We use the information we receive to reply to you, send the updates you asked for, operate accounts, improve the site, prevent abuse, and fulfill legal or security needs. We do not use the mailing list as a membership.',
      },
      {
        heading: 'When information may be shared',
        body: 'We may share information with service providers who help us run the site, with the order store when a purchase is involved, or when the law requires it. We may also share information if needed to protect the site, our users, or the brand. We do not sell mailing-list or contact-form data.',
      },
      {
        heading: 'Data security',
        body: 'We use reasonable administrative and technical safeguards for information we control. No website or transmission is completely secure. Order and payment security for gear purchases is handled by the SnatchVault store.',
      },
      {
        heading: 'Data retention',
        body: 'We keep mailing-list and account information while it is needed for the purpose you gave it, and then for a limited time if the law or security requires a record. Contact messages are kept long enough to answer you. You may ask us to delete list or account data that we control by emailing us.',
      },
      {
        heading: "Children's privacy",
        body: 'This site is not directed to children under 13, and we do not knowingly collect personal information from them. If you believe a child submitted information, email us and we will delete what we control.',
      },
      {
        heading: 'Your privacy choices',
        body: [
          'You can decline the mailing list, limit cookies in your browser, and close a site account by emailing us.',
          `To opt out of marketing email, unsubscribe if a message includes that link, or write ${PUBLIC_CONTACT_EMAIL} and ask to be removed. Transactional or account messages may still be sent when you have an account or an open request.`,
        ],
      },
      {
        heading: 'Links to third-party websites',
        body: 'This site links to other websites, including the SnatchVault shop. Their privacy practices are their own. Read those policies before you share information there.',
      },
      {
        heading: 'Changes to this Privacy Policy',
        body: `We may update this policy as the site changes. The “Last updated” date at the top will change when we do. Continued use of the site after an update means you have read the revised policy.`,
      },
      {
        heading: 'Contact',
        body: `Email ${PUBLIC_CONTACT_EMAIL} for privacy questions, access, or deletion requests we can fulfill. ${LEGAL_MAILING_ADDRESS_PLACEHOLDER}`,
      },
    ],
  },
  {
    id: 'terms',
    path: '/terms-of-use',
    title: 'Terms of Use',
    kicker: 'How to use this site',
    lede: `${HOUSE_BRAND_NAME} is a Non-Negotiable brand. Use the site to shop, read, and Join the Movement.`,
    compactHero: true,
    lastUpdated: LEGAL_LAST_UPDATED,
    metaTitle: 'Terms of Use | My Plan, Not My Mood',
    metaDescription:
      'Terms for using the My Plan, Not My Mood website, brand marks, mailing list, and gear sold through SnatchVault.',
    sections: [
      {
        heading: 'Acceptance of terms',
        body: `By using https://nonnegotiation.com or any page on this site, you agree to these Terms of Use and to our Privacy Policy. If you do not agree, do not use the site.`,
      },
      {
        heading: 'Eligibility and use of the website',
        body: 'These pages are for brand information, gear, interactive tools, and mailing-list updates. You must be able to form a legally binding contract in your place of residence. If you use the site for a business, you confirm you have authority to bind that business.',
      },
      {
        heading: 'Permitted and prohibited use',
        body: [
          'You may browse, shop via the linked store, Join the Movement, and use the public tools for personal, non-commercial enjoyment of the brand.',
          'You may not copy the marks, copy, photos, or tools to run another shop; scrape the site in a way that burdens our systems; attempt to break security; post unlawful or harassing content; or use the site to send spam.',
        ],
      },
      {
        heading: 'Intellectual property',
        body: `${HOUSE_BRAND_NAME}, Non-Negotiable, NonNegotiation, the seal, logos, graphics, page copy, and interactive tools are protected brand and content assets. All rights not expressly granted are reserved.`,
      },
      {
        heading: 'Brand names, logos, graphics, and content',
        body: 'You may not use the brand names, logos, or graphics as your own mark, in ads that suggest we endorse you, or on merchandise we did not authorize. Short, honest references to the brand (for example a review) are fine.',
      },
      {
        heading: 'User-submitted content',
        body: 'If you send a comment, photo, or idea by email or through a form, you grant us a non-exclusive right to use it to operate and improve the brand unless we agree otherwise in writing. Do not send confidential business proposals through the public form. Tools that stay in your browser remain yours.',
      },
      {
        heading: 'Product information',
        body: `Phase 1 gear is tees, hoodies, and hats shown on Shop Gear (${TEE_SALES_SHOP_URL}). Product photos, names, and descriptions on this site are for browsing. Size, variant, and live inventory are confirmed on the SnatchVault checkout.`,
      },
      {
        heading: 'Pricing and availability',
        body: 'Prices and availability can change. A price shown on this site may not include shipping or other fees charged at checkout. We may correct errors before an order is accepted.',
      },
      {
        heading: 'Orders and purchases',
        body: `Paid gear orders are placed on SnatchVault (${ORDER_STORE_URL}). That store’s checkout terms, payment process, and fulfillment rules apply to the purchase. A mailing-list sign-up is not a paid membership and does not complete an order.`,
      },
      {
        heading: 'Third-party links and services',
        body: 'Links to SnatchVault, payment pages, and other sites are provided for convenience. We are not responsible for their content, terms, or availability.',
      },
      {
        heading: 'Disclaimers',
        body: 'The site and its tools are provided “as is.” Brand tools (mood check-ins, receipts, affirmations) are encouragement, not medical, legal, or financial advice. We do not warrant that the site will be uninterrupted or error-free.',
      },
      {
        heading: 'Limitation of liability',
        body: 'To the fullest extent allowed by law, NonNegotiation / My Plan, Not My Mood and the people who operate this site are not liable for indirect, incidental, special, or consequential damages, or for lost profits, arising from your use of the site or from purchases made on a third-party store. Some jurisdictions do not allow certain limits; in those places our liability is limited to the maximum extent permitted.',
      },
      {
        heading: 'Indemnification',
        body: 'You agree to defend and hold harmless the brand and the people who operate this site from claims, damages, and expenses (including reasonable legal fees) that arise from your misuse of the site or your violation of these terms.',
      },
      {
        heading: 'Termination or restriction of access',
        body: 'We may suspend or end access to the site, an account, or the mailing list if these terms are broken, if the law requires it, or if we retire a feature. The sections that by nature should survive (including intellectual property, disclaimers, and limitation of liability) remain in effect.',
      },
      {
        heading: 'Governing law',
        body: `These terms are governed by the laws of ${LEGAL_JURISDICTION_PLACEHOLDER}, without regard to conflict-of-law rules, except where a mandatory consumer law in your state says otherwise.`,
      },
      {
        heading: 'Changes to these terms',
        body: 'We may update these terms as the site changes. The “Last updated” date will change when we do. Continued use after an update means you accept the revised terms.',
      },
      {
        heading: 'Contact',
        body: `Questions about these terms: ${PUBLIC_CONTACT_EMAIL}. ${LEGAL_MAILING_ADDRESS_PLACEHOLDER}`,
      },
    ],
  },
  {
    id: 'faq',
    path: '/faq',
    title: 'FAQ',
    kicker: 'Quick answers',
    lede: 'Phase 1 is the gear launch and the public website. Here is what people ask first.',
    compactHero: true,
    metaTitle: 'FAQ | My Plan, Not My Mood',
    metaDescription:
      'Answers about My Plan, Not My Mood, Non-Negotiable, gear orders on SnatchVault, shipping, and how to reach the brand.',
    faqGroups: [
      {
        heading: 'About the brand',
        items: [
          {
            question: 'What is My Plan, Not My Mood?',
            answer: `${HOUSE_INTRO_LINE} The line is: do not let a temporary mood determine a permanent outcome.`,
          },
          {
            question: 'What does “Non-Negotiable” mean?',
            answer:
              'Non-Negotiable is the house stance: the plan stays even when the feeling of the day wants to rewrite it. NonNegotiation is the house that holds MY PLAN, NOT MY MOOD.',
          },
          {
            question: 'Who is the brand for?',
            answer:
              'For anyone who wants a reminder they can wear and a site that talks like a coach, not a mood swing. If you feel it and still follow the plan, you are in the right place.',
          },
        ],
      },
      {
        heading: 'Orders & products',
        items: [
          {
            question: 'What products do you offer?',
            answer: `Phase 1 gear is tees, hoodies, and hats. Browse Shop Gear at ${TEE_SALES_SHOP_URL}. Memberships stay Coming Soon.`,
          },
          {
            question: 'How do I choose the right size?',
            answer:
              'Sizes and checkout stay on the Shopify / SnatchVault product page. Open the item you want and use the size options there. This site does not publish a separate size chart.',
          },
          {
            question: 'Can I change or cancel an order?',
            answer: `Paid orders are placed on SnatchVault (${ORDER_STORE_URL}). Use that store’s order help for change or cancel requests. We do not process those requests as a separate checkout on this website.`,
          },
          {
            question: 'What if there is a problem with my order?',
            answer: `Start with the SnatchVault store’s order help so they can see the receipt and shipment. For a brand or website question that is not an order, email ${PUBLIC_CONTACT_EMAIL}.`,
          },
        ],
      },
      {
        heading: 'Shipping',
        items: [
          {
            question: 'When will my order ship?',
            answer:
              'Ship dates are set at checkout on SnatchVault / Shopify. This website does not publish a separate production or carrier calendar.',
          },
          {
            question: 'How can I track my order?',
            answer: `Use the receipt and tracking tools from the SnatchVault store where you checked out: ${ORDER_STORE_URL}.`,
          },
          {
            question: 'Do you ship throughout the United States?',
            answer:
              'Destinations and rates are shown at SnatchVault checkout. We do not publish a nationwide shipping promise on this site.',
          },
        ],
      },
      {
        heading: 'Returns & exchanges',
        items: [
          {
            question: 'What is your return or exchange policy?',
            answer:
              'A public return and exchange policy has not been published on this site. [ADMINISTRATOR REVIEW NEEDED: add the official return, refund, and exchange policy.] If you already have an order, use the SnatchVault store’s order help.',
          },
        ],
      },
      {
        heading: 'Contact & support',
        items: [
          {
            question: 'How can I contact you?',
            answer: `Email ${PUBLIC_CONTACT_EMAIL} or use the Contact page form. Order questions stay with the shop.`,
          },
          {
            question: 'How long does it usually take to receive a response?',
            answer:
              'We read notes sent to the brand email. We do not publish a guaranteed reply window. [ADMINISTRATOR REVIEW NEEDED: add the usual response time if you want one stated.]',
          },
          {
            question: 'Are memberships open?',
            answer: 'No. Join / Memberships is Coming Soon. Join the Movement if you want launch updates.',
          },
          {
            question: 'How do I get updates without joining?',
            answer: 'Join the Movement. Email is required. First name is optional. It is not a membership.',
          },
        ],
      },
    ],
    sections: [],
  },
  {
    id: 'list',
    path: '/list',
    title: 'Join the Movement',
    kicker: 'Pre-register for launch',
    lede: `${MAILING_LIST_NOT_MEMBERSHIP_NOTE} Email is required. First name is optional.`,
    metaTitle: 'Join the Movement | My Plan, Not My Mood',
    metaDescription: 'Join the Movement for go-live launch notes from My Plan, Not My Mood. Email plus an optional first name — not a membership.',
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

/** Home CTAs for the live site — legal pages stay in the footer. */
export const HOME_WEBSITE_LINK_IDS: LaunchPageId[] = ['about', 'faq', 'contact'];

/** Privacy, Terms, and the other public pages that belong in the footer. */
export const FOOTER_COMMON_LINK_IDS: LaunchPageId[] = ['about', 'faq', 'contact', 'privacy', 'terms'];

export function resolveLaunchPageId(segment: string): LaunchPageId | null {
  const key = String(segment ?? '').replace(/^\/+/, '').split('/')[0];
  if ((LAUNCH_PAGE_IDS as readonly string[]).includes(key)) return key as LaunchPageId;
  return LAUNCH_PATH_ALIASES[key] ?? null;
}

export function flattenLaunchFaqs(page: LaunchPageCopy): LaunchFaqItem[] {
  if (page.faqGroups?.length) return page.faqGroups.flatMap((group) => group.items);
  return page.faqs ?? [];
}
