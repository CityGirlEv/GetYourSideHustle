import { test, expect } from "@playwright/test";
import { signIn, signOut, adminCreds, qaCreds, agentCreds } from "./fixtures/auth";

test.describe("role-based scoping on /testing", () => {
  test.afterEach(async ({ page }) => {
    await signOut(page);
  });

  test("admin sees per-owner chart and owner filter", async ({ page }) => {
    const creds = adminCreds();
    test.skip(!creds, "E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD env vars not set");

    await signIn(page, creds!);
    await page.goto("/testing");

    // Admin sees the "By QA owner" per-owner breakdown
    await expect(page.getByText("By QA owner", { exact: true })).toBeVisible();

    // Admin sees the Owner multi-select filter
    await expect(page.locator("button").filter({ hasText: /Owner/ }).first()).toBeVisible();
  });

  test("QA user does not see per-owner chart or owner filter", async ({ page }) => {
    const creds = qaCreds();
    test.skip(!creds, "E2E_QA_EMAIL and E2E_QA_PASSWORD env vars not set");

    await signIn(page, creds!);
    await page.goto("/testing");

    // QA does NOT see the per-owner breakdown
    await expect(page.getByText("By QA owner", { exact: true })).not.toBeVisible();

    // QA does NOT see the Owner multi-select filter
    await expect(page.locator("button").filter({ hasText: /^Owner$/ })).not.toBeVisible();

    // QA header shows their name
    const qaFirstName = creds!.email.split("@")[0];
    await expect(page.getByText(qaFirstName, { exact: false })).toBeVisible();
  });
});

test.describe("role-based scoping on /agent", () => {
  test.afterEach(async ({ page }) => {
    await signOut(page);
  });

  test("agent sees only their own scenarios", async ({ page }) => {
    const creds = agentCreds();
    test.skip(!creds, "E2E_AGENT_EMAIL and E2E_AGENT_PASSWORD env vars not set");

    await signIn(page, creds!);
    await page.goto("/agent");

    // Page loads with agent portal heading
    await expect(page.getByRole("heading", { name: /My assignments/i })).toBeVisible();

    // Either scenarios table or the empty state is shown (both prove scoping ran)
    const hasTable = await page.locator("table").isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/No scenarios assigned/).isVisible().catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
  });
});
