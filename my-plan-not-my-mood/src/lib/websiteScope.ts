import { AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE } from './membership';
import { GEAR_SALES_SPLIT_NOTE } from './gearSalesSplit';

export const INCLUDED_WEBSITE_PAGE_LIMIT = 8;
export const INCLUDED_EMAIL_TEMPLATE_LIMIT = 6;

export const ORDER_EMAIL_PROVIDER = 'SnatchVault.com';
export const ORDER_STORE_URL = 'https://snatchvault.com/collections/my-plan-gear';
export const ORDER_EMAIL_STORE_URL = ORDER_STORE_URL;
export const ORDER_STORE_MENU = 'Non-Negotiable';
export const ORDER_STORE_SUBMENUS = ['Tees', 'Hoodies', 'Hats'] as const;

export const ORDER_EMAIL_FROM_NOTE =
  `Orders are hosted on SnatchVault at ${ORDER_STORE_URL} — SnatchVault’s domain, not Angela’s.`;

export const ADDITIONAL_PAGES_ADDON_NOTE =
  'Phase 1 ships the launch pages below. Extra pages stay open for future discussion.';
export const ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE =
  `${ORDER_EMAIL_FROM_NOTE} From the SnatchVault home page, open ${ORDER_STORE_MENU}, then ${ORDER_STORE_SUBMENUS.join(', ')}. ${GEAR_SALES_SPLIT_NOTE}`;
export const MEMBERSHIPS_SCOPE_NOTE =
  `Join / Memberships is on the site as Coming Soon. Member configuration is Phase 2. ${AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE}`;

export interface ScopeListItem {
  id: string;
  name: string;
}

export const INCLUDED_WEBSITE_PAGES: ScopeListItem[] = [
  { id: 'home', name: 'Home / Storefront' },
  { id: 'gear', name: 'Shop Gear (Apparel)' },
  { id: 'about', name: 'About' },
  { id: 'contact', name: 'Contact' },
  { id: 'privacy', name: 'Privacy Policy' },
  { id: 'terms', name: 'Terms of Use' },
  { id: 'faq', name: 'FAQ' },
  { id: 'join', name: 'Join / Memberships (Coming Soon)' },
];

export const INCLUDED_EMAIL_TEMPLATES: ScopeListItem[] = [
  { id: 'sv-hosting', name: 'Hosting — SnatchVault.com, not Angela’s domain' },
  { id: 'sv-collection', name: `Shop — ${ORDER_STORE_URL}` },
  { id: 'sv-menu', name: `SnatchVault home menu — ${ORDER_STORE_MENU}` },
  { id: 'sv-submenus', name: `Submenus — ${ORDER_STORE_SUBMENUS.join(', ')}` },
  { id: 'sv-split', name: 'Order split 70/30 — Angela 70%, Evelyn 30%' },
  { id: 'sv-fees', name: 'Evelyn’s 30% covers hosting, processing sales, administrative fees, and application fees' },
];

export const WEBSITE_PAGES_TITLE = `Phase 1 Website Pages (${INCLUDED_WEBSITE_PAGE_LIMIT})`;
export const EMAIL_TEMPLATES_TITLE = 'Orders';

export function websitePageNames(): string[] {
  return INCLUDED_WEBSITE_PAGES.map((page) => page.name);
}

export function emailTemplateNames(): string[] {
  return INCLUDED_EMAIL_TEMPLATES.map((template) => template.name);
}

export function assertIncludedScopeLimits(): {
  pageCount: number;
  emailCount: number;
} {
  return {
    pageCount: INCLUDED_WEBSITE_PAGES.length,
    emailCount: INCLUDED_EMAIL_TEMPLATES.length,
  };
}

function listHtml(items: ScopeListItem[]): string {
  return `<ol class="scope-list">${items
    .map((item, index) => `<li><strong>${index + 1}.</strong> ${item.name}</li>`)
    .join('')}</ol>`;
}

export function buildWebsiteScopeDocumentHtml(): string {
  return `<div class="overview-box" id="doc-website-pages">
    <div class="kicker">Website Build</div>
    <h2 class="plain">${WEBSITE_PAGES_TITLE}</h2>
    <p class="lede">Phase 1 is a gear-sales site. These ${INCLUDED_WEBSITE_PAGE_LIMIT} pages ship with the shirt launch. Home and Contact include mailing list sign-up (email + optional first name — not a membership). ${ADDITIONAL_PAGES_ADDON_NOTE} ${MEMBERSHIPS_SCOPE_NOTE}</p>
    ${listHtml(INCLUDED_WEBSITE_PAGES)}
  </div>
  <div class="overview-box" id="doc-email-templates">
    <div class="kicker">Orders</div>
    <h2 class="plain">${EMAIL_TEMPLATES_TITLE}</h2>
    <p class="lede">${ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE}</p>
    ${listHtml(INCLUDED_EMAIL_TEMPLATES)}
  </div>`;
}

export function hasWebsiteScopeInDocument(html: string): boolean {
  return (
    html.includes('id="doc-website-pages"') &&
    html.includes('id="doc-email-templates"') &&
    html.includes('About') &&
    html.includes('Contact') &&
    html.includes('Privacy Policy') &&
    html.includes('Coming Soon') &&
    /Phase 1 Website Pages/i.test(html) &&
    /SnatchVault/i.test(html) &&
    html.includes('my-plan-gear') &&
    html.includes(ORDER_STORE_MENU)
  );
}
