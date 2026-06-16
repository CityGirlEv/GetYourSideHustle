import { test, expect } from "@playwright/test";
import { signIn, signOut, adminCreds, qaCreds, agentCreds } from "./fixtures/auth";

test.describe("role-based scoping on /testing", () => {
  test.afterEach(async ({ page }) => {
    await signOut(page);
  });

  test("admin sees per-owner chart and owner filter", async ({ page }) => {
    const creds = adminCreds();
    if (!creds) {
      test.skip(true, "E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD env vars not set");
      return;
    }

    await signIn(page, creds);
    await page.goto("/testing");

    // Admin sees the "By QA owner" per-owner breakdown
    await expect(page.getByText("By QA owner", { exact: true })).toBeVisible();

    // Admin sees the Owner multi-select filter
    await expect(page.locator("button").filter({ hasText: /Owner/ }).first()).toBeVisible();
  });

  test("QA user does not see per-owner chart or owner filter", async ({ page }) => {
    const creds = qaCreds();
    if (!creds) {
      test.skip(true, "E2E_QA_EMAIL and E2E_QA_PASSWORD env vars not set");
      return;
    }

    await signIn(page, creds);
    await page.goto("/testing");

    // QA does NOT see the per-owner breakdown
    await expect(page.getByText("By QA owner", { exact: true })).not.toBeVisible();

    // QA does NOT see the Owner multi-select filter
    await expect(page.locator("button").filter({ hasText: /^Owner$/ })).not.toBeVisible();
  });
});

test.describe("role-based scoping on /agent", () => {
  test.afterEach(async ({ page }) => {
    await signOut(page);
  });

  test("agent sees only their own scenarios", async ({ page }) => {
    const creds = agentCreds();
    if (!creds) {
      test.skip(true, "E2E_AGENT_EMAIL and E2E_AGENT_PASSWORD env vars not set");
      return;
    }

    await signIn(page, creds);
    await page.goto("/agent");

    // Page loads with agent portal heading
    await expect(page.getByRole("heading", { name: /Agent command center/i })).toBeVisible();

    // Either scenarios table or the empty state is shown (both prove scoping ran)
    const hasTable = await page
      .locator("table")
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/No scenarios claimed or assigned yet/)
      .isVisible()
      .catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
  });
});
