// src/fetchers/tiktokAdFetcher.ts
import type { MedicareAd } from "../types/MedicareAd";
import { CONFIG } from "../lib/config";
import puppeteer from "puppeteer";

/**
 * Scrape TikTok for top Medicare related ads using Puppeteer.
 * Returns an array of `MedicareAd` objects limited by the `limit` argument.
 */
export async function fetchTikTokAds(limit: number): Promise<MedicareAd[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(CONFIG.tiktokUserAgent);

  // Simple search for "medicare" on TikTok discover page
  const searchUrl = `https://www.tiktok.com/search?q=medicare`;
  await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

  // Wait for video thumbnails to load
  await page.waitForSelector("div[data-e2e=search-item]", { timeout: 10000 }).catch(() => {});

  const ads: MedicareAd[] = [];
  const videoElements = await page.$$(`div[data-e2e=search-item]`);
  for (let i = 0; i < Math.min(limit, videoElements.length); i++) {
    const el = videoElements[i];
    const videoUrl = await el.$eval("a", (a: any) => a.href).catch(() => "");
    const description = await el.$eval("div[data-e2e=search-item-description]", (div: any) => div.innerText).catch(() => "");
    const title = await el.$eval("div[data-e2e=search-item-title]", (div: any) => div.innerText).catch(() => "");

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
    } as MedicareAd);
  }

  await browser.close();
  return ads;
}
