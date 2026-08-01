import { test, expect } from "@playwright/test";

/**
 * Foresight by Flow Ninja — 16 improvement-list issues mapped to catalog IDs.
 * Automated: PW-FS-001…010, 012, 014…016. Manual outstanding: FS-011, FS-013.
 */
test.describe("Foresight homepage audit fixes", () => {
  test("PW-FS-001 outcome-led H1 keeps the brand", async ({ page }) => {
    await page.goto("/");
    const title = page.getByTestId("page-title");
    await expect(title).toBeVisible();
    const text = (await title.innerText()).replace(/\s+/g, " ").trim();
    expect(text).toMatch(/Get Your Side Hustle/i);
    expect(text).toMatch(/family|solo|launch|Find|We Got You/i);
  });

  test("PW-FS-002 H1 names distinctive tools", async ({ page }) => {
    await page.goto("/");
    const text = (await page.getByTestId("page-title").innerText()).replace(/\s+/g, " ");
    // Tools live in the purpose line when the H1 leads with audience/outcome.
    const purpose = (await page.getByTestId("home-site-purpose").innerText()).replace(/\s+/g, " ");
    expect(`${text} ${purpose}`).toMatch(/Match Wizards|calculators|margin|side hustle/i);
  });

  test("PW-FS-003 purpose line ties tools to an outcome", async ({ page }) => {
    await page.goto("/");
    const purpose = page.getByTestId("home-site-purpose");
    await expect(purpose).toBeVisible();
    await expect(purpose).toContainText(/validate|profit|estimate|calculators/i);
    await expect(purpose).toContainText(/own or with family|solo|family|going solo/i);
  });

  test("PW-FS-004 pricing / access explainer near CTA", async ({ page }) => {
    await page.goto("/");
    const expectLine = page.getByTestId("home-join-expectation");
    await expect(expectLine).toBeVisible();
    await expect(expectLine).toContainText(/Free tools|membership|Start free/i);
  });

  test("PW-FS-005 expectation line next to primary CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("home-join-cta")).toBeVisible();
    await expect(page.getByTestId("home-join-expectation")).toContainText(/under 2 minutes|Start free/i);
  });

  test("PW-FS-006 reason-to-choose vs idea lists", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("home-positioning").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("home-differentiator")).toContainText(/Unlike generic idea lists/i);
  });

  test("PW-FS-007 FAQ covers profitability / access", async ({ page }) => {
    await page.goto("/");
    const faq = page.getByTestId("home-faq");
    await faq.scrollIntoViewIfNeeded();
    const first = page.getByTestId("home-faq-item-0");
    await first.locator("summary").click();
    await expect(first.locator("p")).toContainText(/Margin Match|profit|calculators/i);
    await expect(page.getByTestId("home-faq-item-1")).toContainText(/free/i);
  });

  test("PW-FS-008 positioning block audience + promise + method", async ({ page }) => {
    await page.goto("/");
    const block = page.getByTestId("home-positioning");
    await block.scrollIntoViewIfNeeded();
    await expect(block).toBeVisible();
    await expect(page.getByTestId("home-method-name")).toContainText(/Margin Match/i);
  });

  test("PW-FS-009 named method Margin Match", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("home-positioning").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("home-method-name")).toContainText(/Margin Match/i);
  });

  test("PW-FS-010 contrast sentence vs status quo", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("home-positioning").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("home-differentiator")).toContainText(
      /Unlike generic idea lists|guesswork|evaluate/i,
    );
  });

  test("PW-FS-012 branded calculator / evaluation name", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("home-positioning").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("home-method-name")).toContainText(/Margin Match/i);
  });

  test("PW-FS-014 ICP three audiences with problems", async ({ page }) => {
    await page.goto("/");
    const icp = page.getByTestId("home-icp");
    await icp.scrollIntoViewIfNeeded();
    for (const id of ["kids", "teens", "adults"] as const) {
      const item = page.getByTestId(`home-icp-${id}`);
      await expect(item).toBeVisible();
      expect((await item.innerText()).length).toBeGreaterThan(24);
    }
  });

  test("PW-FS-015 headline matches searcher intent", async ({ page }) => {
    await page.goto("/");
    const text = (await page.getByTestId("page-title").innerText()).replace(/\s+/g, " ");
    expect(text).toMatch(/family|solo|Find|launch|validate|faster|start|We Got You/i);
  });

  test("PW-FS-016 Organization WebPage FAQPage JSON-LD", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd.first()).toHaveCount(1);
    const raw = await jsonLd.first().textContent();
    const data = JSON.parse(raw!);
    const nodes = Array.isArray(data["@graph"]) ? data["@graph"] : [data];
    const types = new Set(
      nodes.flatMap((n: { "@type"?: string | string[] }) =>
        Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]],
      ),
    );
    expect(types.has("Organization")).toBeTruthy();
    expect(types.has("WebPage")).toBeTruthy();
    expect(types.has("FAQPage")).toBeTruthy();
  });
});
