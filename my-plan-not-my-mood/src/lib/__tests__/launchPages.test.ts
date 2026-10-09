import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ABOUT_DISCOVER_STORY_HREF,
  ABOUT_DISCOVER_STORY_LABEL,
  ABOUT_PHILOSOPHY,
  ABOUT_SITE_ROLES,
  ABOUT_VISION,
  ABOUT_VISION_LINES,
  flattenLaunchFaqs,
  FOOTER_COMMON_LINK_IDS,
  groupLaunchSections,
  HOME_WEBSITE_LINK_IDS,
  isExternalLaunchHref,
  launchPageById,
  LEGAL_JURISDICTION_PLACEHOLDER,
  LEGAL_LAST_UPDATED,
} from '../launchPages';

describe('launchPages', () => {
  it('tells the origin first and names Angela as founder without a side photo', () => {
    const about = launchPageById('about');
    expect(about.compactHero).toBe(true);
    expect(about.headline).toBe('About My Plan, Not My Mood');
    expect(launchPageById('faq').compactHero).toBe(true);
    expect(launchPageById('contact').compactHero).toBe(true);
    expect(about.lede).toMatch(/Your Feelings Are Real/i);
    expect(JSON.stringify(about.sections)).not.toMatch(/niece/i);
    expect(JSON.stringify(about.sections)).not.toMatch(/The founder/i);
    expect(ABOUT_VISION.beats).toMatch(/One tough day/i);
    expect(about.sections[0]?.heading).toBe('The teaching');
    expect(about.sections[1]?.heading).toBe('Wear the message');
    expect(about.sections[1]?.link).toEqual({ href: '/gear', label: 'Shop Gear' });
    expect(groupLaunchSections(about.sections).map((group) => group.sections.map((section) => section.heading))).toEqual([
      ['The teaching'],
      ['Wear the message'],
    ]);
    expect(ABOUT_VISION.envision).toBe("Here's what I envision.");
    expect(ABOUT_VISION.brandLead).toBe('MY PLAN.');
    expect(ABOUT_VISION.brandAccent).toBe('NOT MY MOOD.');
    expect(ABOUT_VISION.feelings).toBe('Your Feelings Are Real.');
    expect(ABOUT_VISION.goals).toBe('Your Goals Matter Too.');
    expect(ABOUT_VISION.temporary).toMatch(/temporary feeling shouldn't determine a lasting outcome/i);
    expect(ABOUT_VISION.vote).toBe('The mood gets a vote. The plan gets the final decision.');
    expect(ABOUT_VISION.attribution).toBe('— Angela Harris, Founder');
    expect(ABOUT_VISION_LINES).toEqual([
      ABOUT_VISION.envision,
      ABOUT_VISION.brandLead,
      ABOUT_VISION.brandAccent,
      ABOUT_VISION.feelings,
      ABOUT_VISION.goals,
      ABOUT_VISION.beats,
      ABOUT_VISION.temporary,
      ABOUT_VISION.vote,
      ABOUT_VISION.attribution,
    ]);
    expect(ABOUT_DISCOVER_STORY_HREF).toBe('/about');
    expect(ABOUT_DISCOVER_STORY_LABEL).toBe('Discover Our Story');
    expect(ABOUT_SITE_ROLES).toEqual([
      { label: 'Homepage', body: 'Capture attention and establish the message.', href: '/' },
      { label: 'About page', body: 'Tell your story and build an emotional connection.', href: '/about' },
      { label: 'Shop', body: 'Give people an opportunity to wear the message.', href: '/gear' },
    ]);
    expect(ABOUT_PHILOSOPHY.kicker).toBe('One additional thought, Angela.');
    expect(ABOUT_PHILOSOPHY.love).toMatch(/Your Feelings Are Real/);
    expect(ABOUT_PHILOSOPHY.distinguishes).toMatch(/ignore their emotions and push harder/);
    expect(ABOUT_PHILOSOPHY.acknowledges).toMatch(/acknowledges emotions while encouraging intentional choices/);
    expect(ABOUT_PHILOSOPHY.brandAround).toBe(
      'THAT is a perspective you can consistently build an entire brand around.',
    );
    expect(ABOUT_PHILOSOPHY.close).toBe('🤣❤️');
    expect(isExternalLaunchHref('/gear')).toBe(false);
    expect(isExternalLaunchHref('https://snatchvault.com')).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'public/videos/welcome-about.mp4'))).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'public/images/welcome-about-poster.jpg'))).toBe(true);
    const aboutHero = readFileSync(resolve(process.cwd(), 'src/components/LaunchPage.tsx'), 'utf8');
    const inlineBlock = aboutHero.slice(
      aboutHero.indexOf('media-inline-header'),
      aboutHero.indexOf('export const LaunchPage'),
    );
    expect(inlineBlock).toContain('about-founder');
    expect(inlineBlock).toContain('about-envision');
    expect(inlineBlock).toContain('about-brand-lockup');
    expect(inlineBlock).toContain('about-feelings-line');
    expect(inlineBlock).toContain('about-manifesto');
    expect(aboutHero).toContain('about-origin');
    expect(aboutHero).toContain('about-site-roles');
    expect(aboutHero).toContain('about-philosophy');
    expect(aboutHero).toContain('ABOUT_DISCOVER_STORY_LABEL');
    expect(inlineBlock.indexOf('about-founder')).toBeLessThan(inlineBlock.indexOf('about-manifesto'));
    expect(aboutHero).toContain('ANGELA_FOUNDER_LINE');
    expect(aboutHero.indexOf('about-origin')).toBeGreaterThan(aboutHero.indexOf('about-manifesto'));
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
