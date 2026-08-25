import { test, expect } from "@playwright/test";

test.describe("Beta phase notice", () => {
  test("does not show for guests on the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("page-title")).toBeVisible();
    await expect(page.getByTestId("beta-phase-popup")).toHaveCount(0);
  });

  test("preview query opens the beta popup and Got it dismisses it", async ({ page }) => {
    await page.goto("/?betaNotice=1");
    const dialog = page.getByTestId("beta-phase-popup");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /We're in Beta/i })).toBeVisible();
    await expect(dialog).toContainText(/undergoing testing/i);
    await page.getByTestId("beta-phase-popup-got-it").click();
    await expect(dialog).toHaveCount(0);
  });
});
