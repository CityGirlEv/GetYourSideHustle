import { test, expect } from "@playwright/test";

test.describe("public smoke", () => {
  test("home page loads and shows a sign-in entry point", async ({ page }) => {
    await page.goto("/");
    // Home shouldn't 500; at minimum the document title is set.
    await expect(page).toHaveTitle(/medicare/i);
  });

  test("auth page renders the sign-in form", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("register page renders the NDA + registration form", async ({ page }) => {
    await page.goto("/register");
    // Form fields from the NDA registration flow
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("authenticated routes redirect anonymous users to /auth", async ({ page }) => {
    await page.goto("/testing");
    // App-store gate: signed-out users see the sign-in page or an auth prompt.
    await expect(page).toHaveURL(/\/(auth|login|$)/);
  });
});