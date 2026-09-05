import { describe, expect, it } from 'vitest';
import {
  ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE,
  ADDITIONAL_PAGES_ADDON_NOTE,
  INCLUDED_EMAIL_TEMPLATE_LIMIT,
  INCLUDED_EMAIL_TEMPLATES,
  INCLUDED_WEBSITE_PAGE_LIMIT,
  INCLUDED_WEBSITE_PAGES,
  assertIncludedScopeLimits,
  buildWebsiteScopeDocumentHtml,
  emailTemplateNames,
  hasWebsiteScopeInDocument,
  websitePageNames,
} from '../websiteScope';

describe('websiteScope', () => {
  it('includes the Phase 1 launch pages and email set', () => {
    const limits = assertIncludedScopeLimits();
    expect(limits.pageCount).toBe(INCLUDED_WEBSITE_PAGE_LIMIT);
    expect(limits.emailCount).toBe(INCLUDED_EMAIL_TEMPLATE_LIMIT);
    expect(INCLUDED_WEBSITE_PAGE_LIMIT).toBe(8);
    expect(INCLUDED_EMAIL_TEMPLATE_LIMIT).toBe(6);
  });

  it('lists About, Contact, Privacy, and Coming Soon memberships', () => {
    const names = websitePageNames();
    expect(names).toContain('About');
    expect(names).toContain('Contact');
    expect(names).toContain('Privacy Policy');
    expect(names).toContain('Join / Memberships (Coming Soon)');
    expect(names).toContain('Home / Storefront');
    expect(names).toHaveLength(8);
    expect(emailTemplateNames()).toHaveLength(6);
    expect(emailTemplateNames().some((name) => /Order confirmation/i.test(name))).toBe(true);
  });

  it('marks extra pages and extra email templates as Phase 2 add-ons in document HTML', () => {
    const html = buildWebsiteScopeDocumentHtml();
    expect(hasWebsiteScopeInDocument(html)).toBe(true);
    expect(html).toContain(ADDITIONAL_PAGES_ADDON_NOTE);
    expect(html).toContain(ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE);
    expect(INCLUDED_WEBSITE_PAGES[0].id).toBe('home');
    expect(INCLUDED_EMAIL_TEMPLATES[0].id).toBe('sv-order');
  });
});
