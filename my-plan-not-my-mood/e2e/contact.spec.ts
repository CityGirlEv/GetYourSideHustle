import { expect, test, type Page } from '@playwright/test';

async function continuePastWelcome(page: Page) {
  const welcome = page.getByTestId('beta-welcome-modal');
  if (await welcome.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /continue to the site/i }).click();
    await expect(welcome).toHaveCount(0);
  }
}

test.describe('PW-CONTACT-001 contact form', () => {
  test('sends a complete note through the contact email API', async ({ page }) => {
    await page.route('**/api/email/contact', async (route) => {
      const body = route.request().postDataJSON() as { name?: string; email?: string };
      expect(body.name).toBe('Pat');
      expect(body.email).toBe('pat@example.com');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/contact');
    await continuePastWelcome(page);
    await page.getByTestId('contact-name').fill('Pat');
    await page.getByTestId('contact-email').fill('Pat@Example.com');
    await page.getByTestId('contact-subject').fill('Shop question');
    await page.getByTestId('contact-message').fill('I want to know when the next drop lands.');
    await page.getByTestId('contact-form-submit').click();
    await expect(page.getByTestId('contact-form-success')).toBeVisible();
    await expect(page.getByTestId('contact-form-success')).toContainText('pat@example.com');
    await expect(page.getByTestId('contact-form-mailto')).toHaveCount(0);
  });
});
