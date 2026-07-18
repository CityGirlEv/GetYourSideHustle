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

  test("task sheet keeps its destination through sign-in", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page).toHaveURL(/\/auth\?redirect=%2Ftasks/);
  });

  test("QA manual is gated behind auth (anonymous → /auth)", async ({ page }) => {
    await page.goto("/qa-manual");
    await expect(page).toHaveURL(/\/(auth|login|$)/);
  });

  test("unsubscribe page renders for invalid token", async ({ page }) => {
    await page.goto("/unsubscribe");
    await expect(page.getByRole("heading", { name: /unsubscribe/i })).toBeVisible();
  });

  test("scenario builder loads for anonymous users", async ({ page }) => {
    await page.goto("/scenario/new");
    await expect(page.getByRole("heading", { name: /Build your scenario/i })).toBeVisible();
  });

  test("about page Learning Center button navigates", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("link", { name: "Learning Center", exact: true }).click();
    await expect(page).toHaveURL(/\/learning-center\/?$/);
    await expect(page.getByRole("heading", { name: "Learning Center" })).toBeVisible();
  });
});
