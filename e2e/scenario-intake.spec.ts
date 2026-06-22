import { test, expect } from "@playwright/test";

async function completeIntakeStepsOneAndTwo(page: import("@playwright/test").Page) {
  await page.getByPlaceholder("e.g. 1958").fill("1958");
  await page.getByPlaceholder("e.g. 770").fill("770");
  await page.locator("select").selectOption({ index: 1 });
  await page.getByText("Female", { exact: true }).click();
  await page.getByText("No — I do not use tobacco").click();
  await page.getByText("$55k–$75k", { exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: /Step 2 · Preferences/i })).toBeVisible();
  await page.getByText("Minimize monthly cost").click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: /Step 3 · Medications \(optional\)/i })).toBeVisible();
}

test.describe("scenario intake wizard", () => {
  test("medications are optional — create scenario without adding any", async ({ page }) => {
    await page.route("**/rest/v1/rpc/create_scenario", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify("SCN-2026-0000-0001"),
      });
    });

    await page.goto("/scenario/new");
    await completeIntakeStepsOneAndTwo(page);

    await expect(
      page.getByText(/Not taking any prescription medications\?/i),
    ).toBeVisible();

    await page.getByRole("button", { name: "Create scenario" }).click();

    await expect(page).toHaveURL(/\/scenario\/created\/SCN-2026-0000-0001/);
    await expect(page.getByText(/Add at least one medication/i)).toHaveCount(0);
  });
});
