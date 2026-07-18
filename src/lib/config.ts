// src/lib/config.ts
/**
 * Configuration defaults for the Medicare scouting dashboard.
 */
export const CONFIG = {
  // Number of ad sets to fetch/display
  defaultAdSetCount: 10,
  // Number of ads per set
  defaultAdsPerSet: 10,
  // Facebook Graph API access token (read ads)
  facebookAccessToken: process.env.FACEBOOK_ACCESS_TOKEN || "",
  // Kalodata Enterprise API (optional — see docs/KALODATA_API.md)
  kalodataApiKey: process.env.KALODATA_API_KEY || "",
  kalodataApiBaseUrl: process.env.KALODATA_API_BASE_URL || "",
  // TikTok scraper user agent
  tiktokUserAgent: process.env.TIKTOK_USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  // Base directory for exported Excel files (absolute path)
  scoutingExportBasePath: "C:/Users/evely/Downloads/medicare_scout",
  // Timestamp format for folders (YYYYMMDD_HHmmss)
  timestampFormat: "yyyyMMdd_HHmmss",
};
