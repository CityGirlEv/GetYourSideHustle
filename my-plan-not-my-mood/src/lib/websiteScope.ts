export const INCLUDED_WEBSITE_PAGE_LIMIT = 8;
export const INCLUDED_EMAIL_TEMPLATE_LIMIT = 6;

export const ORDER_EMAIL_PROVIDER = 'SnatchVault.com';
export const ORDER_EMAIL_FROM_NOTE =
  "Order email is sent through SnatchVault.com from Angela’s domain.";

export const ADDITIONAL_PAGES_ADDON_NOTE =
  'Phase 1 ships the launch pages below. Extra pages stay open for future discussion.';
export const ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE =
  "Order mail goes through SnatchVault.com on Angela’s domain. Contact and password-reset stay on the site.";
export const MEMBERSHIPS_SCOPE_NOTE =
  'Join / Memberships is on the site as Coming Soon. Member configuration is Phase 2.';

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
  { id: 'sv-order', name: 'Order confirmation — SnatchVault.com (Angela’s domain)' },
  { id: 'sv-fulfillment', name: 'Shipping / fulfillment — SnatchVault.com (Angela’s domain)' },
  { id: 'sv-cart', name: 'Abandoned cart — SnatchVault.com (Angela’s domain)' },
  { id: 'sv-admin-order', name: 'Admin new order — SnatchVault.com (Angela’s domain)' },
  { id: 'contact-confirm', name: 'Contact form confirmation' },
  { id: 'password-reset', name: 'Password reset' },
];

export const WEBSITE_PAGES_TITLE = `Phase 1 Website Pages (${INCLUDED_WEBSITE_PAGE_LIMIT})`;
export const EMAIL_TEMPLATES_TITLE = 'Phase 1 Email — SnatchVault.com';

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
    <p class="lede">Phase 1 is a gear-sales site. These ${INCLUDED_WEBSITE_PAGE_LIMIT} pages ship with the shirt launch. ${ADDITIONAL_PAGES_ADDON_NOTE} ${MEMBERSHIPS_SCOPE_NOTE}</p>
    ${listHtml(INCLUDED_WEBSITE_PAGES)}
  </div>
  <div class="overview-box" id="doc-email-templates">
    <div class="kicker">Email Program</div>
    <h2 class="plain">${EMAIL_TEMPLATES_TITLE}</h2>
    <p class="lede">${ORDER_EMAIL_FROM_NOTE} ${ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE}</p>
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
    /SnatchVault/i.test(html)
  );
}
