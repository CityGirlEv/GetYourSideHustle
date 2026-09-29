import { test, expect } from "@playwright/test";

test.describe("Beta phase notice", () => {
  test("does not show for guests on the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("page-title")).toBeVisible();
    await expect(page.getByTestId("beta-phase-popup")).toHaveCount(0);
  });

  test("preview query does not open the retired beta popup", async ({ page }) => {
    await page.goto("/?betaNotice=1");
    await expect(page.getByTestId("page-title")).toBeVisible();
    await expect(page.getByTestId("beta-phase-popup")).toHaveCount(0);
  });
});
