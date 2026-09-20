import { expect, test, type Page } from '@playwright/test';
import { playwrightClickableDestinations, urlMatchesExpectedPath } from '../src/lib/siteLinkDestinations';
import { SPRINT_2_WEBSITE_REVIEW_PAGES } from '../src/lib/sprint2WebsiteReview';

async function continuePastWelcome(page: Page) {
  const welcome = page.getByTestId('beta-welcome-modal');
  if (await welcome.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /continue to the site/i }).click();
    await expect(welcome).toHaveCount(0);
  }
}

async function clickMappedControl(page: Page, testId: string) {
  if (testId === 'header-shop-planners' || testId === 'header-shop-menu-gear' || testId === 'header-shop-gear') {
    await page.getByTestId('header-shop-menu').click();
  }
  await page.getByTestId(testId).click();
}

test.describe('PW-SITEMAP-002 public link destinations', () => {
  test('header and footer controls land on the mapped paths', async ({ page }) => {
    test.setTimeout(120_000);
    const clickable = playwrightClickableDestinations();
    for (const link of clickable.filter((row) => row.area === 'header' || row.area === 'footer')) {
      await page.goto('/');
      await continuePastWelcome(page);
      await clickMappedControl(page, link.testId as string);
      if (link.scrollTarget) {
        await expect(page.locator(`#${link.scrollTarget}`)).toBeVisible();
        continue;
      }
      expect(
        urlMatchesExpectedPath(page.url(), link.expectedPath),
        `${link.label} should open ${link.expectedPath} (got ${page.url()})`,
      ).toBe(true);
    }
  });

  test('Shop Gear collection cards open the live store collections', async ({ page }) => {
    await page.goto('/gear');
    await continuePastWelcome(page);
    for (const link of playwrightClickableDestinations().filter((row) => row.area === 'in-page')) {
      const card = page.getByTestId(link.testId as string);
      await expect(card).toHaveAttribute('href', link.expectedPath);
      await expect(card).toHaveAttribute('target', '_blank');
    }
  });

  test('every Sprint 2 review page loads', async ({ page }) => {
    test.setTimeout(120_000);
    for (const reviewPage of SPRINT_2_WEBSITE_REVIEW_PAGES) {
      await page.goto(reviewPage.path);
      await expect(page.locator('body')).toBeVisible();
      await expect(page).not.toHaveTitle(/404/i);
    }
  });
});
