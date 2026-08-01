import { test, expect } from "@playwright/test";

/** Relative luminance helpers for WCAG contrast checks. */
function parseRgb(color: string): [number, number, number] | null {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb: [number, number, number]): number {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

function contrastRatio(fg: string, bg: string): number | null {
  const a = parseRgb(fg);
  const b = parseRgb(bg);
  if (!a || !b) return null;
  const L1 = luminance(a);
  const L2 = luminance(b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function solidBackground(page: import("@playwright/test").Page, el: import("@playwright/test").Locator): Promise<string> {
  return el.evaluate((node) => {
    let cur: Element | null = node;
    while (cur) {
      const bg = getComputedStyle(cur).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
      cur = cur.parentElement;
    }
    return "rgb(255, 255, 255)";
  });
}

test.describe("Lighthouse A11Y / SEO regressions", () => {
  test("robots.txt is valid plain text", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).not.toMatch(/<!doctype html>/i);
    expect(body).not.toMatch(/<html/i);
    expect(body).toMatch(/User-agent:\s*\*/i);
    expect(body).toMatch(/Disallow:\s*\/api\//i);
  });

  test("Facebook CTAs have matching visible text and accessible name", async ({ page }) => {
    await page.goto("/");
    for (const testId of ["home-facebook", "footer-facebook"] as const) {
      const link = page.getByTestId(testId);
      await expect(link).toBeVisible();
      const accessibleName = await link.evaluate((el) => {
        const label = el.getAttribute("aria-label");
        return (label || el.textContent || "").replace(/\s+/g, " ").trim();
      });
      const visible = (await link.innerText()).replace(/\s+/g, " ").trim();
      expect(accessibleName).toBe(visible);
    }
  });

  test("header and footer logos declare width and height", async ({ page }) => {
    await page.goto("/");
    for (const sel of [".brand-header-logo", ".site-footer-logo", ".site-footer-muntie-logo"]) {
      const img = page.locator(sel).first();
      await expect(img).toBeVisible();
      const width = await img.getAttribute("width");
      const height = await img.getAttribute("height");
      expect(Number(width), `${sel} width`).toBeGreaterThan(0);
      expect(Number(height), `${sel} height`).toBeGreaterThan(0);
    }
  });

  test("hustle card category and income meet 4.5:1 contrast", async ({ page }) => {
    await page.goto("/");
    const categories = page.locator(".hustle-grid .hustle-card-category");
    const incomes = page.locator(".hustle-grid .hustle-card-income");
    await expect(categories.first()).toBeVisible();
    const catCount = await categories.count();
    const incomeCount = await incomes.count();
    expect(catCount).toBeGreaterThan(0);
    expect(incomeCount).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(catCount, 8); i++) {
      const el = categories.nth(i);
      const color = await el.evaluate((n) => getComputedStyle(n).color);
      const bg = await solidBackground(page, el);
      const ratio = contrastRatio(color, bg);
      expect(ratio, `category[${i}] ${color} on ${bg}`).not.toBeNull();
      expect(ratio!, `category[${i}]`).toBeGreaterThanOrEqual(4.5);
    }
    for (let i = 0; i < Math.min(incomeCount, 8); i++) {
      const el = incomes.nth(i);
      const color = await el.evaluate((n) => getComputedStyle(n).color);
      const bg = await solidBackground(page, el);
      const ratio = contrastRatio(color, bg);
      expect(ratio, `income[${i}] ${color} on ${bg}`).not.toBeNull();
      expect(ratio!, `income[${i}]`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("home HTML preloads LCP hero image", async ({ request }) => {
    const res = await request.get("/");
    const html = await res.text();
    expect(html).toMatch(/rel=["']preload["'][^>]*as=["']image["'][^>]*gysh-home-hero/i);
  });
});
