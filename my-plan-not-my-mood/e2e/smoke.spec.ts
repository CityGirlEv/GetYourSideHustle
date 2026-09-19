import { expect, test, type Page } from '@playwright/test';

async function continuePastWelcome(page: Page) {
  const welcome = page.getByTestId('beta-welcome-modal');
  if (await welcome.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /continue to the site/i }).click();
    await expect(welcome).toHaveCount(0);
  }
}

test.describe('PW-HOME-001 home storefront', () => {
  test('loads the brand line and Shop Gear entry', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MY PLAN, NOT MY MOOD/i);
    await expect(page.getByText(/feel it\. follow the plan anyway/i)).toBeVisible();
    await expect(page.getByTestId('home-marketing')).toBeVisible();
    await expect(page.getByTestId('home-hero-image')).toBeVisible();
    await expect(page.getByTestId('home-cta-shop')).toBeVisible();
    await expect(page.getByRole('button', { name: /accountability gear/i }).first()).toBeVisible();
    await expect(page.getByTestId('home-product-grid')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /what won today/i })).toBeVisible();
    await continuePastWelcome(page);
    await page.locator('#mood-tool').getByRole('button', { name: /tired/i }).click();
    await expect(page.getByTestId('mood-shake-panel')).toBeVisible();
    await expect(page.getByText(/how to shake it/i)).toBeVisible();
    await expect(page.getByText(/add gear to cart|recommended gear/i)).toHaveCount(0);
  });

  test('opens Shop Gear from the home collection CTA', async ({ page }) => {
    await page.goto('/');
    await continuePastWelcome(page);
    await page.getByTestId('home-cta-shop').click();
    await expect(page).toHaveURL(/\/gear/);
    await expect(page.getByTestId('shop-gear-page')).toBeVisible();
    await expect(page.getByTestId('home-marketing')).toHaveCount(0);
    await expect(page.getByTestId('gear-hub-carousel-all')).toBeVisible();
    await expect(page.getByTestId('shop-gear-aside')).toBeVisible();
  });
});

test.describe('PW-GEAR-001 shop gear', () => {
  test('opens Shop Gear with collection carousels and store collection links', async ({ page }) => {
    await page.goto('/gear');
    await expect(page.getByRole('heading', { name: /accountability gear/i })).toBeVisible();
    await expect(page.getByTestId('hero-carousel')).toHaveCount(0);
    await expect(page.getByTestId('gear-hub-carousel-all')).toBeVisible();
    await expect(page.getByTestId('gear-hub-carousel-tee')).toBeVisible();
    await expect(page.getByTestId('gear-hub-carousel-hoodie')).toBeVisible();
    await expect(page.getByTestId('gear-hub-carousel-hat')).toBeVisible();
    await expect(page.getByTestId('gear-hub-carousel-next-all')).toBeVisible();
    await expect(page.getByTestId('gear-hub-carousel-next-tee')).toBeVisible();
    await expect(page.getByTestId('shop-gear-aside')).toBeVisible();
    await expect(page.getByTestId('shopify-all-page-link')).toHaveAttribute(
      'href',
      'https://snatchvault.com/collections/my-plan-gear',
    );
    await expect(page.getByTestId('shopify-hoodie-page-link')).toHaveAttribute(
      'href',
      'https://snatchvault.com/collections/my-plan-hoodie-collection',
    );
    await expect(page.getByTestId('shopify-hat-page-link')).toHaveAttribute(
      'href',
      'https://snatchvault.com/collections/my-plan-sports-hat',
    );
    await expect(page.getByTestId('shopify-tee-page-link')).toHaveAttribute(
      'href',
      'https://snatchvault.com/collections/non-negotiables-letter-tees',
    );
    await expect(page.getByTestId('shop-gear-journal-90day')).toBeVisible();
    await expect(page.getByTestId('shop-gear-journal-deskpad')).toBeVisible();
    await expect(page.getByTestId('shop-gear-journal-90day')).toContainText(/placeholder/i);
    await expect(page.getByTestId('shop-gear-journal-deskpad')).toContainText(/coming soon/i);
    await expect(page.getByTestId('gear-hub-thumb-upload-all')).toHaveCount(0);
    await expect(page.getByTestId('gear-hub-thumb-remove-all')).toHaveCount(0);
    await expect(page.getByTestId('gear-hub-thumb-input-tee')).toHaveCount(0);
    const collectionSrcs = [];
    for (const slot of ['all', 'tee', 'hoodie', 'hat']) {
      const src = await page.getByTestId(`gear-hub-carousel-image-${slot}`).getAttribute('src');
      expect(src).toBeTruthy();
      collectionSrcs.push(String(src).split('?')[0]);
    }
    expect(new Set(collectionSrcs).size).toBe(collectionSrcs.length);
  });
});

test.describe('PW-PLANNERS-001 coming soon cart', () => {
  test('marks planner Add to Cart as Coming Soon', async ({ page }) => {
    await page.goto('/planners');
    await expect(page.getByTestId('planners-grid')).toBeVisible();
    const addButtons = page.getByTestId(/planner-add-to-cart-/);
    await expect(addButtons).toHaveCount(2);
    await expect(addButtons.first()).toBeDisabled();
    await expect(addButtons.first()).toContainText(/coming soon/i);
    await expect(addButtons.nth(1)).toBeDisabled();
    await expect(addButtons.nth(1)).toContainText(/coming soon/i);
  });
});

test.describe('PW-PAY-001 make payment', () => {
  test('shows a preferred payment method', async ({ page }) => {
    await page.goto('/pay');
    await expect(page.getByText(/zelle/i).first()).toBeVisible();
  });
});

test.describe('PW-JOIN-001 memberships coming soon', () => {
  test('does not offer a live member checkout to anonymous visitors', async ({ page }) => {
    await page.goto('/join');
    await expect(page).toHaveTitle(/MY PLAN, NOT MY MOOD/i);
    await expect(page.getByRole('button', { name: /start paid membership|complete checkout/i })).toHaveCount(0);
    await expect(page.getByTestId('affirmations-scope-note')).toBeVisible();
    await expect(page.getByTestId('affirmations-scope-note')).toContainText(/scope change/i);
  });
});

test.describe('PW-SITEMAP-001 sitemap', () => {
  test('loads the site structure', async ({ page }) => {
    await page.goto('/sitemap');
    await expect(page.getByText(/how my plan, not my mood is structured/i)).toBeVisible();
  });
});

test.describe('PW-ADMIN-001 admin gate', () => {
  test('anonymous testing portal asks for sign-in', async ({ page }) => {
    await page.goto('/admin/testing');
    await expect(page).toHaveTitle(/MY PLAN, NOT MY MOOD/i);
    await expect(page.getByText(/sign in or register/i)).toBeVisible();
    await expect(page.getByText(/qa verification matrix/i)).toHaveCount(0);
  });

  test('anonymous posting schedule asks for sign-in', async ({ page }) => {
    await page.goto('/admin/calendar');
    await expect(page.getByText(/sign in or register/i)).toBeVisible();
    await expect(page.getByTestId('posting-schedule-page')).toHaveCount(0);
  });

  test('anonymous inventory pricing asks for sign-in', async ({ page }) => {
    await page.goto('/admin/inventory-pricing');
    await expect(page.getByText(/sign in or register/i)).toBeVisible();
    await expect(page.getByTestId('inventory-pricing-page')).toHaveCount(0);
  });

  test('anonymous mailing list admin page asks for sign-in', async ({ page }) => {
    await page.goto('/admin/mailing-list');
    await expect(page.getByText(/sign in or register/i)).toBeVisible();
    await expect(page.getByTestId('list-page')).toHaveCount(0);
  });
});

test.describe('PW-LAUNCH-001 public launch pages', () => {
  test('opens About, FAQ, and Contact from the main header', async ({ page }) => {
    await page.goto('/');
    await continuePastWelcome(page);
    await page.getByTestId('header-nav-about').click();
    await expect(page.getByTestId('about-page')).toBeVisible();
    await page.getByTestId('header-nav-faq').click();
    await expect(page.getByTestId('faq-list')).toBeVisible();
    await page.getByTestId('header-nav-contact').click();
    await expect(page.getByRole('heading', { name: /let’s connect/i })).toBeVisible();
  });

  test('loads About, legal, FAQ, and Contact from the footer', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByTestId('about-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: /about my plan, not my mood/i })).toBeVisible();
    await expect(page.getByTestId('about-inline-photo')).toBeVisible();
    await expect(page.getByText(/niece/i)).toBeVisible();
    await expect(page.getByText(/unique writing style/i)).toBeVisible();

    await page.goto('/privacy-policy');
    await expect(page.getByTestId('privacy-page')).toBeVisible();
    await expect(page).toHaveTitle(/Privacy Policy \| My Plan, Not My Mood/i);

    await page.goto('/terms-of-use');
    await expect(page.getByTestId('terms-page')).toBeVisible();

    await page.goto('/faq');
    await expect(page.getByTestId('faq-list')).toBeVisible();
    await page.getByRole('button', { name: /what is my plan, not my mood/i }).click();
    await expect(page.getByText(/temporary mood determine a permanent outcome/i)).toBeVisible();

    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: /let’s connect/i })).toBeVisible();
    await page.getByTestId('contact-form-submit').click();
    await expect(page.getByTestId('contact-form-error')).toBeVisible();
    await expect(page.getByTestId('footer-common-links')).toBeVisible();
    await expect(page.getByTestId('footer-privacy')).toBeVisible();
    await expect(page.getByTestId('footer-terms')).toBeVisible();
    await expect(page.getByTestId('footer-faq')).toBeVisible();
    await expect(page.getByTestId('footer-contact')).toBeVisible();
  });

  test('loads Beta Tester Rewards from the footer', async ({ page }) => {
    await page.goto('/beta-rewards');
    await expect(page.getByTestId('beta-rewards-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: /beta tester rewards/i })).toBeVisible();
    await expect(page.getByTestId('beta-rewards-table')).toBeVisible();
    await expect(page.getByTestId('footer-beta-rewards')).toBeVisible();
  });

  test('loads the Beta Testing Guide with tee and hat picks', async ({ page }) => {
    await page.goto('/beta-guide');
    await expect(page.getByTestId('beta-testing-guide-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: /beta testing guide/i })).toBeVisible();
    await expect(page.getByTestId('beta-guide-pick-tee')).toBeVisible();
    await expect(page.getByTestId('beta-guide-pick-hat')).toBeVisible();
    await page.getByTestId('beta-guide-pick-tee').click();
    await expect(page.getByTestId('beta-guide-pick-label')).toContainText(/tee/i);
    await page.getByTestId('beta-guide-pick-hat').click();
    await expect(page.getByTestId('beta-guide-pick-label')).toContainText(/tee and hat/i);
    await expect(page.getByTestId('footer-beta-guide')).toBeVisible();
  });
});
