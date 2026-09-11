import { describe, expect, it } from 'vitest';
import {
  ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE,
  ADDITIONAL_PAGES_ADDON_NOTE,
  EMAIL_TEMPLATES_TITLE,
  INCLUDED_EMAIL_TEMPLATE_LIMIT,
  INCLUDED_EMAIL_TEMPLATES,
  INCLUDED_WEBSITE_PAGE_LIMIT,
  INCLUDED_WEBSITE_PAGES,
  ORDER_EMAIL_FROM_NOTE,
  ORDER_STORE_MENU,
  ORDER_STORE_SUBMENUS,
  ORDER_STORE_URL,
  assertIncludedScopeLimits,
  buildWebsiteScopeDocumentHtml,
  emailTemplateNames,
  hasWebsiteScopeInDocument,
  websitePageNames,
} from '../websiteScope';

describe('websiteScope', () => {
  it('includes the Phase 1 launch pages and Orders set', () => {
    const limits = assertIncludedScopeLimits();
    expect(limits.pageCount).toBe(INCLUDED_WEBSITE_PAGE_LIMIT);
    expect(limits.emailCount).toBe(INCLUDED_EMAIL_TEMPLATE_LIMIT);
    expect(INCLUDED_WEBSITE_PAGE_LIMIT).toBe(8);
    expect(INCLUDED_EMAIL_TEMPLATE_LIMIT).toBe(6);
    expect(EMAIL_TEMPLATES_TITLE).toBe('Orders');
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
    expect(emailTemplateNames().some((name) => /70\/30/.test(name))).toBe(true);
  });

  it('marks extra pages as Phase 2 add-ons and keeps Orders in document HTML', () => {
    const html = buildWebsiteScopeDocumentHtml();
    expect(hasWebsiteScopeInDocument(html)).toBe(true);
    expect(html).toContain(ADDITIONAL_PAGES_ADDON_NOTE);
    expect(html).toContain(ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE);
    expect(INCLUDED_WEBSITE_PAGES[0].id).toBe('home');
    expect(INCLUDED_EMAIL_TEMPLATES[0].id).toBe('sv-hosting');
  });

  it('hosts Orders on SnatchVault my-plan-gear with Non-Negotiable menus and a 70/30 split', () => {
    expect(ORDER_STORE_URL).toBe('https://snatchvault.com/collections/my-plan-gear');
    expect(ORDER_STORE_MENU).toBe('Non-Negotiable');
    expect([...ORDER_STORE_SUBMENUS]).toEqual(['Tees', 'Hoodies', 'Hats']);
    expect(ORDER_EMAIL_FROM_NOTE).toContain(ORDER_STORE_URL);
    expect(ORDER_EMAIL_FROM_NOTE).toMatch(/not Angela/);
    expect(ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE).toContain(ORDER_STORE_URL);
    expect(ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE).toMatch(/Non-Negotiable/);
    expect(ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE).toMatch(/Tees, Hoodies, Hats/);
    expect(ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE).toMatch(/70\/30/);
    expect(ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE).not.toMatch(/on Angela’s domain/);
    expect(emailTemplateNames().join(' ')).toMatch(/my-plan-gear/);
  });
});
