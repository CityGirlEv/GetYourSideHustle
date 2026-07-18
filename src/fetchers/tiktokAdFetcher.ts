// src/fetchers/tiktokAdFetcher.ts
import type { MedicareAd } from "../types/MedicareAd";
import { CONFIG } from "../lib/config";

/**
 * Scrape TikTok discover search for Medicare-related posts.
 * Uses headless Chromium — no visible browser window (important on Windows dev).
 */
export async function fetchTikTokAds(limit: number): Promise<MedicareAd[]> {
  let puppeteer: typeof import("puppeteer");
  try {
    puppeteer = await import("puppeteer");
  } catch {
    throw new Error(
      "TikTok scouting requires Puppeteer (local dev only — not available on Cloudflare Workers).",
    );
  }
  if (typeof puppeteer.default?.launch !== "function") {
    throw new Error(
      "TikTok scouting requires Puppeteer (local dev only — not available on Cloudflare Workers).",
    );
  }
  const browser = await puppeteer.default.launch({
    headless: true,
    args: [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--mute-audio",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(CONFIG.tiktokUserAgent);

    const searchUrl = "https://www.tiktok.com/search?q=medicare";
    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

    await page
      .waitForSelector("div[data-e2e=search-item]", { timeout: 10000 })
      .catch(() => {});

    const ads: MedicareAd[] = [];
    const videoElements = await page.$$("div[data-e2e=search-item]");
    for (let i = 0; i < Math.min(limit, videoElements.length); i++) {
      const el = videoElements[i];
      const videoUrl = await el.$eval("a", (a: HTMLAnchorElement) => a.href).catch(() => "");
      const description = await el
        .$eval("div[data-e2e=search-item-description]", (div: HTMLElement) => div.innerText)
        .catch(() => "");
      const title = await el
        .$eval("div[data-e2e=search-item-title]", (div: HTMLElement) => div.innerText)
        .catch(() => "");

      ads.push({
        companyName: "TikTok User",
        websiteUrl: videoUrl,
        socialMedia: {
          facebook: "",
          tiktok: videoUrl,
          other: [],
        },
        adUrl: videoUrl,
        primaryText: title,
        description: description,
        headline: title,
        hooks: [],
        painPoints: [],
        keywords: [],
        hashtags: [],
        reviewSnippets: [],
      });
    }

    return ads;
  } finally {
    await browser.close();
  }
}
