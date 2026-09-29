import { test, expect, type Page } from "@playwright/test";

const TEEN_MATCH_NAMES = [
  "Neighborhood Dog Walker",
  "Yard & Garden Helper",
  "Creative Sticker & Keychain Crafting",
  "Senior Tech Helper",
  "Homework Helper & Reader",
  "Book Publishing (Storybooks)",
  "Create Games with AI",
];

async function completeTeensWizard(page: Page) {
  await page.getByRole("button", { name: "Ages 13 – 14" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Animals & pets" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Mostly outdoors" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "A little (under 1 hour)" }).click();
  await page.getByRole("button", { name: "See my matches" }).click();
}

async function openTeensWizardOnPhone(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByTestId("home-path-cta-teens").click();
  await expect(page.getByTestId("page-title")).toContainText("Kids & Teens Corner");
  await expect(page.getByText("GYSH Teens Match Wizard")).toBeVisible();
}

test.describe("Wizard Blueprint membership gate", () => {
  test("Teens guest (and team join) cannot see ranked matches", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("gysh_junior_side_hustle_team", "1");
    });
    await openTeensWizardOnPhone(page);
    await completeTeensWizard(page);

    const blueprint = page.getByTestId("side-hustle-blueprint");
    await expect(blueprint).toBeVisible();
    await expect(blueprint).toHaveAttribute("data-unlocked", "false");
    await expect(blueprint).toHaveAttribute("data-age-group", "junior");
    await expect(page.getByTestId("blueprint-unlock-gate")).toBeVisible();
    await expect(page.getByTestId("blueprint-top-match")).toHaveCount(0);
    await expect(page.getByTestId("blueprint-dashboard-link")).toHaveCount(0);
    await expect(page.getByTestId("blueprint-open-dashboard")).toHaveCount(0);
    await expect(page.getByText("Open guide")).toHaveCount(0);
    await expect(page.getByText("Your matches are locked")).toBeVisible();

    for (const name of TEEN_MATCH_NAMES) {
      await expect(page.getByText(name, { exact: true })).toHaveCount(0);
    }
  });

  test("localStorage free-session marker does not unlock the ranked Teens Blueprint", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "gysh_free_member_v1",
        JSON.stringify({
          version: 1,
          email: "teen.member@example.com",
          ageGroup: "junior",
          createdAt: new Date().toISOString(),
        }),
      );
    });
    await openTeensWizardOnPhone(page);
    await completeTeensWizard(page);

    const blueprint = page.getByTestId("side-hustle-blueprint");
    await expect(blueprint).toBeVisible();
    await expect(blueprint).toHaveAttribute("data-unlocked", "false");
    await expect(page.getByTestId("blueprint-unlock-gate")).toBeVisible();
    await expect(page.getByTestId("blueprint-top-match")).toHaveCount(0);
    await expect(page.getByTestId("blueprint-dashboard-link")).toHaveCount(0);
    await expect(page.getByText("Neighborhood Dog Walker")).toHaveCount(0);
  });

  test("Unlock Blueprint opens Free signup with email, password, confirm, and how you heard about us", async ({
    page,
  }) => {
    await openTeensWizardOnPhone(page);
    await completeTeensWizard(page);
    await page.getByTestId("blueprint-unlock-btn").click();
    await expect(page.getByTestId("membership-signup-page")).toBeVisible();
    await expect(page.getByTestId("membership-signup-email")).toBeVisible();
    await expect(page.getByTestId("membership-signup-password")).toBeVisible();
    await expect(page.getByTestId("membership-signup-password-confirm")).toBeVisible();
    await expect(page.getByTestId("membership-signup-heard-about")).toBeVisible();
    await expect(page.getByTestId("membership-signup-name")).toBeVisible();
  });
});
