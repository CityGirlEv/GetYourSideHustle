import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ANGELA_FOUNDER_LINE, ANGELA_NIECE_ORIGIN, ANGELA_PORTRAIT_PATH, ANGELA_PUBLIC_BIO } from '../planIntro';
import {
  flattenLaunchFaqs,
  FOOTER_COMMON_LINK_IDS,
  groupLaunchSections,
  HOME_WEBSITE_LINK_IDS,
  launchPageById,
  LEGAL_JURISDICTION_PLACEHOLDER,
  LEGAL_LAST_UPDATED,
} from '../launchPages';

describe('launchPages', () => {
  it('tells the origin first, names Angela as founder, and keeps her photo with the story', () => {
    const about = launchPageById('about');
    expect(about.compactHero).toBe(true);
    expect(about.headline).toBe('About My Plan, Not My Mood');
    expect(launchPageById('faq').compactHero).toBe(true);
    expect(launchPageById('contact').compactHero).toBe(true);
    expect(about.sections[0]?.heading).toBe('Where the idea came from');
    expect(about.sections[0]?.body).toBe(ANGELA_NIECE_ORIGIN);
    expect(about.sections[0]?.image).toBeUndefined();
    expect(about.sections[1]?.heading).toBe('The founder');
    expect(about.sections[1]?.body).toEqual(expect.arrayContaining([ANGELA_FOUNDER_LINE, ANGELA_PUBLIC_BIO]));
    expect(about.sections[1]?.image?.src).toBe(ANGELA_PORTRAIT_PATH);
    expect(about.sections[2]?.heading).toBe('The teaching');
    expect(about.sections[2]?.besideImage).toBe(true);
    expect(about.sections[3]?.heading).toBe('Phase 1');
    expect(about.sections[3]?.besideImage).toBe(true);
    expect(groupLaunchSections(about.sections).map((group) => group.sections.map((section) => section.heading))).toEqual([
      ['Where the idea came from'],
      ['The founder', 'The teaching', 'Phase 1'],
    ]);
    expect(existsSync(resolve(process.cwd(), 'public/images/angela-harris.jpg'))).toBe(true);
  });

  it('ships Privacy, Terms, FAQ, and Contact with dated legal copy', () => {
    expect(launchPageById('privacy').path).toBe('/privacy-policy');
    expect(launchPageById('privacy').compactHero).toBe(true);
    expect(launchPageById('privacy').lastUpdated).toBe(LEGAL_LAST_UPDATED);
    expect(launchPageById('terms').path).toBe('/terms-of-use');
    expect(launchPageById('terms').compactHero).toBe(true);
    expect(JSON.stringify(launchPageById('terms').sections)).toContain(LEGAL_JURISDICTION_PLACEHOLDER);
    expect(launchPageById('contact').headline).toBe('Let’s Connect');
    expect(launchPageById('contact').showContactForm).toBe(true);
    expect(flattenLaunchFaqs(launchPageById('faq')).some((item) => /return or exchange/i.test(item.question))).toBe(true);
    expect(flattenLaunchFaqs(launchPageById('faq')).some((item) => /ADMINISTRATOR REVIEW NEEDED/i.test(item.answer))).toBe(
      true,
    );
    expect(FOOTER_COMMON_LINK_IDS).toEqual(['about', 'faq', 'contact', 'privacy', 'terms']);
    expect(HOME_WEBSITE_LINK_IDS).toEqual(['about', 'faq', 'contact']);
    expect(HOME_WEBSITE_LINK_IDS).not.toContain('privacy');
  });
});
