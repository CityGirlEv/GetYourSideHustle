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
    await expect(page.getByTestId('hero-carousel')).toBeVisible();
    await expect(page.getByRole('button', { name: /next slide/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /accountability gear/i }).first()).toBeVisible();
    await expect(page.getByTestId('home-product-grid')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /what won today/i })).toBeVisible();
    await continuePastWelcome(page);
    await page.locator('#mood-tool').getByRole('button', { name: /tired/i }).click();
    await expect(page.getByTestId('mood-shake-panel')).toBeVisible();
    await expect(page.getByText(/how to shake it/i)).toBeVisible();
    await expect(page.getByText(/add gear to cart|recommended gear/i)).toHaveCount(0);
  });

  test('opens the matching gear product from a carousel photo', async ({ page }) => {
    await page.goto('/');
    await continuePastWelcome(page);
    await page.getByTestId('hero-carousel-frame').getByTestId('hero-carousel-slide-link').nth(1).click({ force: true });
    await expect(page).toHaveURL(/\/gear(?:\/hoodies|\/hats)?#product-/);
    await expect(page.getByTestId('shop-gear-page')).toBeVisible();
    await expect(page.getByTestId('hero-carousel')).toHaveAttribute('data-size', 'compact');
    await expect(page.getByTestId('shop-gear-aside')).toBeVisible();
  });
});

test.describe('PW-GEAR-001 shop gear', () => {
  test('opens Shop Gear with a compact carousel and in-site collection links', async ({ page }) => {
    await page.goto('/gear');
    await expect(page.getByRole('heading', { name: /accountability gear/i })).toBeVisible();
    await expect(page.getByTestId('hero-carousel')).toBeVisible();
    await expect(page.getByTestId('hero-carousel')).toHaveAttribute('data-size', 'compact');
    await expect(page.getByTestId('shop-gear-aside')).toBeVisible();
    await expect(page.getByTestId('shopify-tee-page-link')).toHaveAttribute('href', '/gear');
    await expect(page.getByTestId('shopify-hoodie-page-link')).toHaveAttribute('href', '/gear/hoodies');
    await expect(page.getByTestId('shopify-hat-page-link')).toHaveAttribute('href', '/gear/hats');
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
});
