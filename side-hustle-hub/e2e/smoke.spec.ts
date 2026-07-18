import { test, expect } from "@playwright/test";

test.describe("GYSH smoke", () => {
  test("homepage loads with dashboard title", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("page-title")).toContainText("Discover Side Hustles");
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("Home nav returns to Discover Side Hustles", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-find-mine").click();
    await expect(page.getByTestId("find-mine-selector")).toBeVisible();
    await page.getByTestId("nav-home").click();
    await expect(page.getByTestId("page-title")).toContainText("Discover Side Hustles");
  });

  test("Workshops nav opens workshops view", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-workshops").click();
    await expect(page.getByTestId("page-title")).toContainText("Workshops");
  });

  test("Kids/Teens Corner nav opens kids view", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-kids").click();
    await expect(page.getByTestId("page-title")).toContainText("Kids/Teens Corner");
    await expect(page.getByTestId("kids-stories-tab")).toBeVisible();
    await expect(page.getByTestId("kids-stories-tab")).toHaveText(/Stories/i);
  });

  test("Match Wizard shows age selector then routes Adult / Kids / Senior", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-find-mine").click();
    await expect(page.getByTestId("find-mine-selector")).toBeVisible();
    await page.getByTestId("page-how-it-works").click();
    await expect(page.getByTestId("page-how-panel")).toBeVisible();
    await expect(page.getByTestId("find-mine-selector-lead")).toContainText(
      "four Match Wizards — Kids, Teens, Adult, and Senior",
    );
    await expect(page.getByTestId("find-mine-family-note")).toContainText("GYSH Coach");
    await expect(page.getByTestId("find-mine-card-kids")).toBeVisible();
    await expect(page.getByTestId("find-mine-card-junior")).toBeVisible();
    await expect(page.getByTestId("find-mine-card-adult")).toBeVisible();
    await expect(page.getByTestId("find-mine-card-senior")).toBeVisible();

    await page.getByTestId("find-mine-card-adult").click();
    await expect(page.getByTestId("page-title")).toContainText("Match Wizard");
    await expect(page.getByRole("heading", { name: "What is your startup budget?" })).toBeVisible();

    await page.getByTestId("nav-find-mine").click();
    await page.getByTestId("find-mine-card-kids").click();
    await expect(page.getByTestId("page-title")).toContainText("Kids/Teens Corner");
    await expect(page.getByRole("heading", { name: /Kid.?s Side Hustles/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Match Wizard/i })).toBeVisible();
    await expect(page.getByText("Find My Hustle", { exact: true })).toHaveCount(0);

    await page.getByTestId("nav-find-mine").click();
    await page.getByTestId("find-mine-card-senior").click();
    await expect(page.getByTestId("page-title")).toContainText("GYSH Seniors Corner");
  });

  test("Guides nav opens library with Some Free banner", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".nav-item-banner")).toHaveText("Some Free");
    await page.getByTestId("nav-free-guides").click();
    await expect(page.getByTestId("page-title")).toContainText("GYSH Guide");
    await expect(page.getByTestId("free-guides-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "GYSH Guide" })).toBeVisible();
  });

  test("Free Guides filters All / Free / Kids", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-free-guides").click();
    await expect(page.getByTestId("free-guides-page")).toBeVisible();
    await expect(page.getByTestId("free-guides-filters")).toBeVisible();

    await page.getByTestId("free-guides-filter-free").click();
    await expect(page.getByRole("heading", { name: "GYSH Adult / Senior Guides" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "GYSH Kids Guides" })).toBeVisible();
    await expect(page.locator(".free-guide-card.is-gated")).toHaveCount(0);

    await page.getByTestId("free-guides-filter-kids").click();
    await expect(page.getByRole("heading", { name: "GYSH Kids Guides" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "GYSH Adult / Senior Guides" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "GYSH Teens Guides" })).toHaveCount(0);

    await page.getByTestId("free-guides-filter-all").click();
    await expect(page.getByRole("heading", { name: "GYSH Adult / Senior Guides" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "GYSH Kids Guides" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "GYSH Teens Guides" })).toBeVisible();
  });

  test("Membership nav opens tiers and Kids credits", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-membership").click();
    await expect(page.getByTestId("page-title")).toContainText("Membership");
    await expect(page.getByTestId("membership-page")).toBeVisible();
    await expect(page.getByTestId("membership-tier-free")).toBeVisible();
    await expect(page.getByTestId("membership-tier-starter")).toBeVisible();
    await expect(page.getByTestId("membership-tier-pro")).toBeVisible();
    await expect(page.getByTestId("membership-tier-elite")).toBeVisible();
    await expect(page.getByTestId("membership-schedule-suite")).toBeVisible();

    await page.getByTestId("membership-audience-kids").click();
    await expect(page.getByTestId("membership-credit-packs")).toBeVisible();
    await expect(page.getByTestId("membership-credit-pack-boost")).toContainText("25 credits");
    await expect(page.getByTestId("membership-credit-pack-family")).toContainText("300 credits");
    await expect(page.getByTestId("membership-credits")).toBeVisible();
  });

  test("Seniors nav opens GYSH Seniors Corner view", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-seniors").click();
    await expect(page.getByTestId("page-title")).toContainText("GYSH Seniors Corner");
    await expect(page.getByTestId("seniors-page")).toBeVisible();
  });

  test("login page does not expose passwords in the DOM", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByTestId("login-page")).toBeVisible();
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("gysh123");
    expect(bodyText).not.toContain("tina123");
    expect(bodyText).not.toMatch(/Testing Credentials/i);
  });

  test("footer links navigate About, Join, and Contact", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("button", { name: "About" }).click();
    await expect(page.getByTestId("page-title")).toContainText("About GYSH");
    await footer.getByRole("button", { name: "Join" }).click();
    await expect(page.getByTestId("page-title")).toContainText("Join GYSH");
    await footer.getByRole("button", { name: "Contact Us" }).click();
    await expect(page.getByTestId("page-title")).toContainText("Contact Us");
  });

  test("header nav opens About, Join, and Contact", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-about").click();
    await expect(page.getByTestId("page-title")).toContainText("About GYSH");
    await page.getByTestId("nav-join").click();
    await expect(page.getByTestId("page-title")).toContainText("Join GYSH");
    await page.getByTestId("nav-contact").click();
    await expect(page.getByTestId("page-title")).toContainText("Contact Us");
  });

  test("Join GYSH page shows Create account CTA and Kids/Teens teams", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-join").click();
    await expect(page.getByTestId("join-page")).toBeVisible();
    await expect(page.getByRole("button", { name: /Create account \/ Sign in/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Kids.*(Teens|Junior).*teams/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Kids Corner GYSH Team" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /GYSH Teens Side Hustle Team|GYSH Junior Side Hustle Team/i })).toBeVisible();
  });

  test("Contact form exposes required Name, Email, Message fields", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-contact").click();
    await expect(page.getByTestId("contact-page")).toBeVisible();
    const form = page.getByTestId("contact-form");
    await expect(form.getByLabel("Name")).toBeVisible();
    await expect(form.getByLabel("Email")).toHaveAttribute("type", "email");
    await expect(form.getByLabel("Message")).toBeVisible();
    await expect(form.getByRole("button", { name: /Send message/i })).toBeVisible();
  });

  test("Seniors Join Senior Team tab shows interest signup CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-seniors").click();
    await page.getByTestId("seniors-tab-join").click();
    await expect(page.getByRole("heading", { name: /Join the Senior Side Hustle team/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /I'm interested/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Create free GYSH account/i })).toBeVisible();
  });

  test("Login form requires email and password", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    const login = page.getByTestId("login-page");
    await expect(login.locator('input[type="email"]')).toHaveAttribute("required", "");
    await expect(login.locator('input[type="password"]').first()).toHaveAttribute("required", "");
    await expect(login.getByRole("button", { name: "Log In" })).toBeVisible();
    await expect(login.getByRole("button", { name: "Join GYSH" })).toBeVisible();
  });
});
